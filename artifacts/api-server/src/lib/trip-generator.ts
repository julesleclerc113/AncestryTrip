import { randomUUID } from "node:crypto";

export type PreviewShape = {
  id: string;
  title: string;
  locationLabel: string;
  interpretation: string;
  places: Array<{
    name: string;
    type: string;
    description: string;
    certainty: string;
    sourceUrl: string | null;
  }>;
  sampleDay: Array<{
    time: string;
    title: string;
    description: string;
    category: string;
  }>;
  historicalContext: string;
  researchChecklist: string[];
  disclaimer: string;
  tripLength: number;
  destination: string;
  generatedAt: string;
  evidenceBoundary: EvidenceBoundary;
};

export type EvidenceBoundary = {
  userProvidedFacts: Record<string, unknown>;
  aiGenerated: boolean;
  uncertainties: string[];
};

export type PaidReportSection = {
  title: string;
  body: string;
  items: string[];
};

const disclaimer =
  "This preview is a travel and research aid, not proof of genealogy. Verify important family-history claims with independent records and reliable sources.";

export function buildPreview(input: any, id = randomUUID()): PreviewShape {
  const origin = [input.city, input.region, input.country]
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .join(", ");
  const originLabel = origin || input.country;
  const surnameNote = input.surname
    ? ` You mentioned the surname ${input.surname}; a surname alone does not establish a family connection.`
    : "";
  const places = [
    {
      name: input.city || input.region || input.country,
      type: "Ancestral place",
      description:
        "A starting point for walking the streets, reading local history, and comparing the place with the records you already hold.",
      certainty: "Based on your information",
      sourceUrl: null,
    },
    {
      name: `Local history collection near ${input.city || input.region || input.country}`,
      type: "Research lead",
      description:
        "Look for a municipal archive, regional library, or historical society before you travel. Availability varies, so confirm opening hours and holdings directly.",
      certainty: "Suggested research lead",
      sourceUrl: null,
    },
    {
      name: `${input.destination} heritage stop`,
      type: "Travel anchor",
      description:
        "A practical stop to connect the wider trip with your family-history research, chosen as a starting idea rather than a confirmed family connection.",
      certainty: "Travel suggestion",
      sourceUrl: null,
    },
  ];

  return {
    id,
    title: `A first journey through ${originLabel}`,
    locationLabel: originLabel,
    interpretation: `You are looking at a ${input.tripLength}-day trip from ${input.destination} toward ${originLabel}. The strongest lead in this first pass is the place itself: use the trip to observe local context, gather questions, and test your existing research.${surnameNote}`,
    places,
    sampleDay: [
      {
        time: "09:00",
        title: `Arrive and orient in ${input.city || input.region || input.country}`,
        description:
          "Take a slow first walk. Note street names, civic buildings, churches, cemeteries, and landscape details that may help you place your family's records.",
        category: "Arrival",
      },
      {
        time: "11:30",
        title: "Build a local research shortlist",
        description:
          "Visit or contact a library, archive, or historical society. Ask what local records exist and whether appointments are needed.",
        category: "Research",
      },
      {
        time: "15:00",
        title: "Let the place add context",
        description:
          "Choose one museum or historical site connected to the area's broader story. Keep notes separate from confirmed family facts.",
        category: "Context",
      },
      {
        time: "18:00",
        title: "Capture what you still need to learn",
        description:
          "Write down names, dates, spellings, and source questions while the day is fresh. These notes become the backbone of your full report.",
        category: "Reflection",
      },
    ],
    historicalContext: `The places around ${originLabel} can provide valuable context for understanding how a family may have lived, worked, worshipped, or moved. Context is not evidence of a specific person's life, so treat it as a lens for better questions rather than a conclusion.`,
    researchChecklist: [
      "Bring the records and spellings you already have, including where each detail came from.",
      `Confirm which archive, library, church, or cemetery records exist near ${originLabel}.`,
      "Check whether local institutions require an appointment, identification, or a research request in advance.",
      "Write down every source you consult so you can separate confirmed facts from travel impressions.",
    ],
    disclaimer,
    tripLength: input.tripLength,
    destination: input.destination,
    generatedAt: new Date().toISOString(),
    evidenceBoundary: {
      userProvidedFacts: { ...input },
      aiGenerated: false,
      uncertainties: [
        "A surname alone does not establish ancestry or a family relationship.",
        "Suggested places and context are not proof about a specific person.",
      ],
    },
  };
}

export function buildExamplePreview(): PreviewShape {
  return buildPreview(
    {
      country: "Ireland",
      region: "County Clare",
      city: "Kilrush",
      surname: "O'Brien",
      destination: "Dublin",
      tripLength: 6,
      budget: "Comfortable",
      interests: ["local history", "coastlines", "archives"],
    },
    "00000000-0000-0000-0000-000000000001",
  );
}

export function buildPaidReport(
  preview: PreviewShape,
  product: string,
  token: string,
  options?: {
    userProvidedFacts?: Record<string, unknown>;
    sections?: PaidReportSection[];
    uncertainties?: string[];
  },
) {
  const deep = product === "deep-heritage-trip";
  const existingBoundary = preview.evidenceBoundary ?? {
    userProvidedFacts: {},
    aiGenerated: false,
    uncertainties: [],
  };
  return {
    id: randomUUID(),
    token,
    product,
    title: deep ? `Deep Heritage Trip: ${preview.locationLabel}` : `Heritage Trip: ${preview.locationLabel}`,
    status: "ready",
    preview,
    evidenceBoundary: {
      userProvidedFacts: options?.userProvidedFacts ?? existingBoundary.userProvidedFacts,
      aiGenerated: Boolean(options?.sections),
      uncertainties: options?.uncertainties ?? existingBoundary.uncertainties,
    } satisfies EvidenceBoundary,
    sections: options?.sections ?? [
      {
        title: "How to use this report",
        body:
          "Use the report as a companion to your own research. It distinguishes your supplied information from context and suggestions so you can make confident decisions about what to verify next.",
        items: [],
      },
      {
        title: "Day-by-day planning",
        body: `Plan around your ${preview.tripLength}-day window and keep one flexible block for research appointments or unexpected discoveries in ${preview.locationLabel}.`,
        items: preview.sampleDay.map((item) => `${item.time} — ${item.title}: ${item.description}`),
      },
      {
        title: deep ? "Expanded research plan" : "Research questions to carry",
        body: deep
          ? "Start with the records you can verify locally, then move outward to regional and specialist collections. Keep a source log and record negative searches as carefully as positive findings."
          : "These questions help you turn a meaningful visit into a useful research step without assuming that every local clue belongs to your family.",
        items: [
          "Which record first connects your ancestor to this place?",
          "What spelling, parish, street, or occupation details can you verify?",
          "Which local collection should you contact before traveling?",
          "What would count as evidence, and what is only helpful context?",
        ],
      },
      {
        title: "Practical notes",
        body:
          "Confirm opening hours, appointment rules, transport, and access needs directly with each institution. Local availability changes, and this report should be refreshed before booking.",
        items: [
          "Save a copy of your source list offline.",
          "Leave room for weather, local closures, and a second visit.",
          "Never photograph or share restricted records without permission.",
        ],
      },
    ],
    createdAt: new Date().toISOString(),
  };
}