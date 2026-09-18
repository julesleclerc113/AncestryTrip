import { Router, type IRouter } from "express";
import { db, analyticsEventsTable, tripRequestsTable } from "@workspace/db";
import {
  CreateTripPreviewBody,
  CreateTripPreviewResponse,
  GetExampleTripResponse,
} from "@workspace/api-zod";
import { buildExamplePreview, buildPreview } from "../lib/trip-generator";

const router: IRouter = Router();
const previewAttempts = new Map<string, { count: number; resetAt: number }>();

router.post("/trips/preview", async (req, res): Promise<void> => {
  const parsed = CreateTripPreviewBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.flatten() }, "Invalid preview request");
    res.status(400).json({ error: "Please check the required trip details." });
    return;
  }

  const key = req.ip || "anonymous";
  const now = Date.now();
  const previous = previewAttempts.get(key);
  if (previous && previous.resetAt > now && previous.count >= 5) {
    res.status(429).json({ error: "You have reached the preview limit for now. Please try again later." });
    return;
  }
  previewAttempts.set(key, {
    count: previous && previous.resetAt > now ? previous.count + 1 : 1,
    resetAt: previous && previous.resetAt > now ? previous.resetAt : now + 24 * 60 * 60 * 1000,
  });

  const preview = buildPreview(parsed.data);
  const [request] = await db.insert(tripRequestsTable).values({
    input: parsed.data,
    preview,
  }).returning({ id: tripRequestsTable.id });
  await db.insert(analyticsEventsTable).values({ name: "free_preview_generated" });
  res.json(CreateTripPreviewResponse.parse({ ...preview, id: String(request.id) }));
});

router.get("/trips/example", async (_req, res): Promise<void> => {
  res.json(GetExampleTripResponse.parse(buildExamplePreview()));
});

export default router;