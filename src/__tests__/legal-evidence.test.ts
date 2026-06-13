import { describe, expect, it } from "vitest";
import { assessLegalEvidence } from "@/lib/rag/legal-evidence";
import type { KnowledgeChunk } from "@/lib/rag/retriever";

const summaryChunk: KnowledgeChunk = {
  id: "194",
  content:
    "Commission Implementing Regulation (EU) 2026/194 amends Regulation (EU) 2019/1793.",
  source_type: "regulation",
  source_name: "Regulation (EU) No 194/2026",
  section_ref: null,
  metadata: {
    source_class: "primary_law",
    celexNumber: "32026R0194",
    dateDocument: "2026-01-28",
    official_url: "https://eur-lex.europa.eu/eli/reg_impl/2026/194/oj",
  },
  similarity: 0.9,
};

describe("assessLegalEvidence", () => {
  it("requires official fallback when exact annex details are missing", () => {
    const result = assessLegalEvidence(
      {
        precisionRequired: true,
        recencyRequired: true,
        exactReferences: ["2019/1793"],
        celexReferences: [],
        targetInstrumentReferences: ["2019/1793"],
        relationship: "amends",
        requestedDetails: ["annex", "control_frequency"],
      },
      [summaryChunk]
    );

    expect(result.sufficient).toBe(false);
    expect(result.missingDetails).toEqual(["annex", "control_frequency"]);
    expect(result.verificationCelex).toBe("32026R0194");
  });

  it("accepts exact relationship and date evidence when no annex detail is requested", () => {
    expect(
      assessLegalEvidence(
        {
          precisionRequired: true,
          recencyRequired: true,
          exactReferences: ["2019/1793"],
          celexReferences: [],
          targetInstrumentReferences: ["2019/1793"],
          relationship: "amends",
          requestedDetails: ["date"],
        },
        [summaryChunk]
      ).sufficient
    ).toBe(true);
  });

  it("does not combine unrelated chunks into a supported amendment relationship", () => {
    const result = assessLegalEvidence(
      {
        precisionRequired: true,
        recencyRequired: true,
        exactReferences: ["2019/1793"],
        celexReferences: [],
        targetInstrumentReferences: ["2019/1793"],
        relationship: "amends",
        requestedDetails: [],
      },
      [
        { ...summaryChunk, id: "target", content: "Regulation (EU) 2019/1793 applies." },
        { ...summaryChunk, id: "other", content: "This instrument amends Regulation (EU) 2021/632." },
      ]
    );

    expect(result.sufficient).toBe(false);
  });
});
