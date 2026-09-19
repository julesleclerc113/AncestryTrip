import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { aiUsageTable, db } from "@workspace/db";
import { logger } from "./logger";
import { aiConfig, type AiRequestType } from "./ai-config";

const placeSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  description: z.string().min(1),
  certainty: z.string().min(1),
  sourceUrl: z.null(),
});

const itineraryItemSchema = z.object({
  time: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
});

const previewDraftSchema = z.object({
  title: z.string().min(1),
  interpretation: z.string().min(1),
  places: z.array(placeSchema).min(1).max(5),
  sampleDay: z.array(itineraryItemSchema).min(1).max(6),
  historicalContext: z.string().min(1),
  researchChecklist: z.array(z.string().min(1)).min(1).max(8),
  uncertainties: z.array(z.string().min(1)).max(8),
});

const reportSectionSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  items: z.array(z.string().min(1)).max(12),
});

const paidReportDraftSchema = z.object({
  sections: z.array(reportSectionSchema).min(2).max(8),
  uncertainties: z.array(z.string().min(1)).max(12),
});

export type PreviewDraft = z.infer<typeof previewDraftSchema>;
export type PaidReportDraft = z.infer<typeof paidReportDraftSchema>;

export class AiServiceError extends Error {
  constructor(
    message: string,
    readonly code: "missing_key" | "rate_limited" | "provider_error" | "invalid_output",
  ) {
    super(message);
    this.name = "AiServiceError";
  }
}

function windowStart(requestType: AiRequestType): Date {
  const now = new Date();
  if (requestType === "free_preview") {
    now.setUTCHours(0, 0, 0, 0);
  } else {
    now.setUTCMinutes(0, 0, 0);
  }
  return now;
}

async function reserveUsage(requestType: AiRequestType, usageKey: string): Promise<void> {
  const maximum =
    requestType === "free_preview"
      ? aiConfig.limits.freePreviewPerDay
      : aiConfig.limits.paidReportAttemptsPerSession;
  const started = windowStart(requestType);
  const [reservation] = await db
    .insert(aiUsageTable)
    .values({
      usageKey,
      requestType,
      windowStarted: started,
      requestCount: 1,
    })
    .onConflictDoUpdate({
      target: [aiUsageTable.usageKey, aiUsageTable.requestType, aiUsageTable.windowStarted],
      set: { requestCount: sql`${aiUsageTable.requestCount} + 1` },
      where: sql`${aiUsageTable.requestCount} < ${maximum}`,
    })
    .returning({ requestCount: aiUsageTable.requestCount });

  if (!reservation) {
    throw new AiServiceError("AI usage limit reached.", "rate_limited");
  }
}

function safetyInstructions(): string {
  return [
    "You generate careful heritage travel planning material.",
    "The USER_PROVIDED_FACTS object is the only source of family-specific facts.",
    "Never invent a family relationship, parent-child link, identity, occupation, date, record, archive result, or historical source.",
    "Never infer ancestry or family connection from a surname alone.",
    "Do not create URLs or citations. Every sourceUrl must be null.",
    "Keep user-provided facts separate from suggestions, context, and inferences.",
    "Use explicit uncertainty language such as 'possible lead', 'suggested', or 'not established'.",
    "Return only valid JSON matching the requested shape.",
  ].join(" ");
}

function previewPrompt(input: Record<string, unknown>): string {
  return `${safetyInstructions()}

Create a short, inexpensive free preview for a heritage trip. Keep it useful but concise.
Return JSON with exactly these fields:
{
  "title": "string",
  "interpretation": "string",
  "places": [{"name":"string","type":"string","description":"string","certainty":"string","sourceUrl":null}],
  "sampleDay": [{"time":"string","title":"string","description":"string","category":"string"}],
  "historicalContext": "string",
  "researchChecklist": ["string"],
  "uncertainties": ["string"]
}

USER_PROVIDED_FACTS:
${JSON.stringify(input)}`;
}

function paidReportPrompt(
  input: Record<string, unknown>,
  preview: Record<string, unknown>,
  product: string,
): string {
  return `${safetyInstructions()}

Create the complete paid heritage travel report sections for the ${product} product.
Use the supplied preview as planning context, but do not turn its suggestions into proven genealogy.
Return JSON with exactly these fields:
{
  "sections": [{"title":"string","body":"string","items":["string"]}],
  "uncertainties": ["string"]
}

USER_PROVIDED_FACTS:
${JSON.stringify(input)}

CURRENT PREVIEW:
${JSON.stringify(preview)}`;
}

async function generateStructured<T>(
  requestType: AiRequestType,
  usageKey: string,
  prompt: string,
  schema: z.ZodType<T>,
): Promise<{ data: T; model: string; generatedAt: string; rawOutput: unknown }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.warn({ requestType, status: "missing_key" }, "AI generation unavailable");
    throw new AiServiceError("Gemini is not configured.", "missing_key");
  }

  await reserveUsage(requestType, usageKey);
  logger.info({ requestType, status: "started", model: aiConfig.model }, "AI generation started");

  const generation = aiConfig.generation[requestType === "free_preview" ? "freePreview" : "paidReport"];
  try {
    const response = await fetch(
      `${aiConfig.endpoint}/models/${encodeURIComponent(aiConfig.model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: safetyInstructions() }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: generation.temperature,
            maxOutputTokens: generation.maxOutputTokens,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(aiConfig.timeoutMs),
      },
    );

    if (!response.ok) {
      throw new AiServiceError(`Gemini returned HTTP ${response.status}.`, "provider_error");
    }
    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const rawText = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
    if (!rawText) {
      throw new AiServiceError("Gemini returned an empty response.", "provider_error");
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawText);
    } catch {
      throw new AiServiceError("Gemini returned invalid JSON.", "invalid_output");
    }
    const parsed = schema.safeParse(parsedJson);
    if (!parsed.success) {
      throw new AiServiceError("Gemini returned an unexpected report shape.", "invalid_output");
    }
    const generatedAt = new Date().toISOString();
    logger.info({ requestType, status: "succeeded", model: aiConfig.model }, "AI generation completed");
    return { data: parsed.data, model: aiConfig.model, generatedAt, rawOutput: parsedJson };
  } catch (error) {
    const safeError = error instanceof AiServiceError ? error : new AiServiceError("Gemini request failed.", "provider_error");
    logger.warn(
      { requestType, status: "failed", code: safeError.code },
      "AI generation failed",
    );
    throw safeError;
  }
}

export function generateFreePreview(
  input: Record<string, unknown>,
  usageKey: string,
): Promise<{ data: PreviewDraft; model: string; generatedAt: string; rawOutput: unknown }> {
  return generateStructured("free_preview", usageKey, previewPrompt(input), previewDraftSchema);
}

export function generatePaidReport(
  input: Record<string, unknown>,
  preview: Record<string, unknown>,
  product: string,
  usageKey: string,
): Promise<{ data: PaidReportDraft; model: string; generatedAt: string; rawOutput: unknown }> {
  return generateStructured(
    "paid_report",
    usageKey,
    paidReportPrompt(input, preview, product),
    paidReportDraftSchema,
  );
}