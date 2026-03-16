import type { HaccpDocumentData } from "@/lib/documents/haccp-schema";

export function buildHaccpDocumentDataFromAnswers(answers: string[]): HaccpDocumentData {
  return {
    metadata: {
      companyName: answers[0] ?? "",
      version: answers[1] ?? "",
      date: answers[2] ?? "",
      createdBy: answers[3] ?? "",
      approvedBy: answers[4] ?? "",
      logoUrl: null,
    },
    processFlow: splitLines(answers[5]),
    steps: [],
    hazards: [],
    ccps: normalizeCcpAnswer(answers[7]),
  };
}

export function buildHaccpModelPrompt(data: HaccpDocumentData): string {
  return [
    "Create a lean HACCP plan using only the approved sections.",
    "Use only: Process Flow, Process Steps Table, Hazard Analysis Table, and CCP Table only if needed.",
    "Hazard types must be Biological, Chemical, Physical, or Allergen.",
    "Keep the document operational and audit-ready.",
    JSON.stringify(data),
  ].join("\n\n");
}

function splitLines(value: string | undefined): string[] {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeCcpAnswer(value: string | undefined): HaccpDocumentData["ccps"] {
  if (!value || value.trim().toLowerCase() === "none") {
    return [];
  }

  return [
    {
      ccpNo: 1,
      stepName: value.trim(),
      hazard: value.trim(),
      criticalLimit: "",
      monitoring: "",
      correctiveAction: "",
    },
  ];
}
