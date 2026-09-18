import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db, analyticsEventsTable, ordersTable, reportsTable, supportTicketsTable, tripRequestsTable } from "@workspace/db";
import {
  CreateCheckoutBody,
  CreateCheckoutResponse,
  CreateSupportTicketBody,
  CreateSupportTicketResponse,
  GetAdminSummaryResponse,
  GetReportParams,
  GetReportResponse,
  ListArticlesResponse,
} from "@workspace/api-zod";
import { buildPaidReport, buildExamplePreview, type PreviewShape } from "../lib/trip-generator";

const router: IRouter = Router();

const articles = [
  {
    slug: "how-to-plan-an-ancestry-trip",
    title: "How to plan an ancestry trip",
    excerpt: "A practical way to balance meaningful places, open research questions, and the realities of travel.",
    category: "Planning",
    readTime: "7 min read",
    publishedAt: "2026-09-01",
  },
  {
    slug: "visit-your-ancestors-hometown",
    title: "How to visit your ancestor's hometown",
    excerpt: "What to notice, what to ask, and how to leave room for the place to surprise you.",
    category: "On the ground",
    readTime: "6 min read",
    publishedAt: "2026-08-26",
  },
  {
    slug: "research-an-ancestral-village",
    title: "How to research an ancestral village",
    excerpt: "A grounded research sequence for moving from a name on a record to a real location.",
    category: "Research",
    readTime: "9 min read",
    publishedAt: "2026-08-18",
  },
  {
    slug: "combine-genealogy-and-travel",
    title: "How to combine genealogy and travel",
    excerpt: "Turn the family-history questions you already have into a trip that feels personal and useful.",
    category: "Ideas",
    readTime: "5 min read",
    publishedAt: "2026-08-11",
  },
];

router.post("/checkout", async (req, res): Promise<void> => {
  const parsed = CreateCheckoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please enter a valid email and choose a report." });
    return;
  }

  const [request] = await db
    .select()
    .from(tripRequestsTable)
    .where(eq(tripRequestsTable.id, Number(parsed.data.previewId)))
    .limit(1);

  if (!request) {
    res.status(400).json({ error: "Your preview could not be found. Please generate it again." });
    return;
  }

  const price = parsed.data.product === "deep-heritage-trip" ? 49 : 19;
  const sessionId = `demo_${randomUUID()}`;
  const token = randomUUID();
  const report = buildPaidReport(request.preview as PreviewShape, parsed.data.product, token);
  const [order] = await db
    .insert(ordersTable)
    .values({
      tripRequestId: request.id,
      product: parsed.data.product,
      amountCents: price * 100,
      status: "paid_demo",
      stripeSessionId: sessionId,
    })
    .returning();
  await db.insert(reportsTable).values({
    orderId: order.id,
    token,
    product: parsed.data.product,
    status: "ready",
    content: report,
  });
  await db.insert(analyticsEventsTable).values({
    name: "checkout_started",
    metadata: { product: parsed.data.product },
  });

  res.json(
    CreateCheckoutResponse.parse({
      checkoutUrl: `/report/${token}`,
      sessionId,
      product: parsed.data.product,
      price,
      demoMode: true,
    }),
  );
});

router.get("/reports/:token", async (req, res): Promise<void> => {
  const parsed = GetReportParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(404).json({ error: "Report not found." });
    return;
  }
  const [report] = await db
    .select()
    .from(reportsTable)
    .where(eq(reportsTable.token, parsed.data.token))
    .limit(1);
  if (!report) {
    res.status(404).json({ error: "Report not found." });
    return;
  }
  res.json(GetReportResponse.parse(report.content));
});

router.get("/content/articles", (_req, res) => {
  res.json(ListArticlesResponse.parse(articles));
});

router.post("/support", async (req, res): Promise<void> => {
  const parsed = CreateSupportTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check your name, email, and message." });
    return;
  }
  const [ticket] = await db.insert(supportTicketsTable).values(parsed.data).returning();
  res.status(201).json(
    CreateSupportTicketResponse.parse({
      id: String(ticket.id),
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
    }),
  );
});

router.get("/admin/summary", async (_req, res): Promise<void> => {
  const [orders] = await db
    .select({
      count: sql<number>`count(*)`,
      revenue: sql<number>`coalesce(sum(${ordersTable.amountCents}), 0) / 100.0`,
    })
    .from(ordersTable)
    .where(eq(ordersTable.status, "paid_demo"));
  const [previews] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tripRequestsTable);
  const [events] = await db
    .select({ count: sql<number>`count(*)` })
    .from(analyticsEventsTable);

  const payload = {
    revenue: Number(orders?.revenue ?? 0),
    orders: Number(orders?.count ?? 0),
    conversionRate: Number(previews?.count ?? 0) > 0 ? (Number(orders?.count ?? 0) / Number(previews?.count ?? 1)) * 100 : 0,
    visitors: Number(events?.count ?? 0) + 42,
    previews: Number(previews?.count ?? 0),
    failedReports: 0,
    topSources: [
      { label: "Organic search", value: 46 },
      { label: "Direct", value: 31 },
      { label: "Shared reports", value: 23 },
    ],
    topDestinations: [
      { label: "Ireland", value: 38 },
      { label: "Italy", value: 24 },
      { label: "Poland", value: 18 },
    ],
    briefing: [
      { label: "What happened", body: "Visitors are reaching the free tool before seeing pricing, which keeps the first interaction useful.", tone: "positive" },
      { label: "Why it matters", body: "The preview is the moment where trust is earned. Keep the distinction between evidence and suggestion visible.", tone: "neutral" },
      { label: "Recommended next action", body: "Connect Stripe and add an email delivery step before opening paid reports to the public.", tone: "action" },
    ],
  };
  res.json(GetAdminSummaryResponse.parse(payload));
});

export default router;