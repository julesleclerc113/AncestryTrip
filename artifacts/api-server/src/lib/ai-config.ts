export const aiConfig = {
  provider: process.env.AI_PROVIDER ?? "gemini",
  model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  endpoint: process.env.GEMINI_API_ENDPOINT ?? "https://generativelanguage.googleapis.com/v1beta",
  timeoutMs: 20_000,
  limits: {
    freePreviewPerDay: 5,
    paidReportAttemptsPerSession: 3,
  },
  generation: {
    freePreview: {
      temperature: 0.2,
      maxOutputTokens: 1024,
    },
    paidReport: {
      temperature: 0.25,
      maxOutputTokens: 8192,
    },
  },
} as const;

export type AiRequestType = "free_preview" | "paid_report";