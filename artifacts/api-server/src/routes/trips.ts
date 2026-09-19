import { Router, type IRouter } from "express";
import { db, analyticsEventsTable, tripRequestsTable } from "@workspace/db";
import {
  CreateTripPreviewBody,
  CreateTripPreviewResponse,
  GetExampleTripResponse,
} from "@workspace/api-zod";
import { buildExamplePreview, buildPreview } from "../lib/trip-generator";
import { AiServiceError, generateFreePreview } from "../lib/ai-service";

const router: IRouter = Router();

router.post("/trips/preview", async (req, res): Promise<void> => {
  const parsed = CreateTripPreviewBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.flatten() }, "Invalid preview request");
    res.status(400).json({ error: "Please check the required trip details." });
    return;
  }

  let preview = buildPreview(parsed.data);
  let aiModelOutput: unknown = null;
  let aiGeneratedAt: Date | null = null;
  let aiGenerationStatus = "fallback";
  try {
    const result = await generateFreePreview(parsed.data, req.ip || "anonymous");
    preview = {
      ...preview,
      ...result.data,
      id: preview.id,
      tripLength: parsed.data.tripLength,
      destination: parsed.data.destination,
      generatedAt: result.generatedAt,
      evidenceBoundary: {
        userProvidedFacts: { ...parsed.data },
        aiGenerated: true,
        uncertainties: result.data.uncertainties,
      },
    };
    aiModelOutput = result.rawOutput;
    aiGeneratedAt = new Date(result.generatedAt);
    aiGenerationStatus = "succeeded";
  } catch (error) {
    if (error instanceof AiServiceError && error.code === "rate_limited") {
      res.status(429).json({ error: "You have reached the AI preview limit for now. Please try again later." });
      return;
    }
  }

  const [request] = await db.insert(tripRequestsTable).values({
    input: parsed.data,
    preview,
    aiModelOutput,
    aiGeneratedAt,
    aiGenerationStatus,
  }).returning({ id: tripRequestsTable.id });
  await db.insert(analyticsEventsTable).values({
    name: "free_preview_generated",
    metadata: { aiRequestType: "free_preview", aiStatus: aiGenerationStatus },
  });
  res.json(CreateTripPreviewResponse.parse({ ...preview, id: String(request.id) }));
});

router.get("/trips/example", async (_req, res): Promise<void> => {
  res.json(GetExampleTripResponse.parse(buildExamplePreview()));
});

export default router;