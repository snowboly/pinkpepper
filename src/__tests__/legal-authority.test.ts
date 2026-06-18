import { describe, expect, it } from "vitest";
import { resolveOfficialAuthority } from "@/lib/rag/legal-authority";
import type { LegalQueryPlan } from "@/lib/rag/legal-query";
import type { KnowledgeChunk } from "@/lib/rag/retriever";

const amendmentPlan: LegalQueryPlan = {
  precisionRequired: true,
  recencyRequired: true,
  exactReferences: ["2019/1793"],
  celexReferences: [],
  targetInstrumentReferences: ["2019/1793"],
  relationship: "amends",
  requestedDetails: ["annex", "date"],
};

function legalChunk(
  id: string,
  content: string,
  metadata: Record<string, unknown>
): KnowledgeChunk {
  return {
    id,
    content,
    source_type: "regulation",
    source_name: id,
    section_ref: null,
    metadata: { source_class: "primary_law", ...metadata },
    similarity: 0.9,
  };
}

describe("resolveOfficialAuthority", () => {
  it("selects an EU amending act instead of the consolidated base act", () => {
    const result = resolveOfficialAuthority(amendmentPlan, [
      legalChunk(
        "consolidated",
        "Consolidated text of Implementing Regulation (EU) 2019/1793. M14: 2026/459.",
        {
          jurisdiction: "eu",
          celexNumber: "02019R1793-20260226",
          baseCelexNumber: "32019R1793",
        }
      ),
      legalChunk(
        "amending-act",
        "Commission Implementing Regulation (EU) 2026/459 amending Implementing Regulation (EU) 2019/1793.",
        {
          jurisdiction: "eu",
          celexNumber: "32026R0459",
          baseCelexNumber: "32026R0459",
        }
      ),
    ]);

    expect(result?.identifier).toEqual({ jurisdiction: "eu", celex: "32026R0459" });
    expect(result?.reason).toContain("relationship");
  });

  it("selects the newest act when multiple sources prove the same relationship", () => {
    const result = resolveOfficialAuthority(amendmentPlan, [
      legalChunk(
        "2026/194",
        "Regulation (EU) 2026/194 amending Regulation (EU) 2019/1793.",
        {
          jurisdiction: "eu",
          celexNumber: "32026R0194",
          dateDocument: "2026-01-28",
        }
      ),
      {
        ...legalChunk(
          "2026/459",
          "Regulation (EU) 2026/459 amending Regulation (EU) 2019/1793.",
          {
            jurisdiction: "eu",
            celexNumber: "32026R0459",
            dateDocument: "2026-02-24",
          }
        ),
        similarity: 0.7,
      },
    ]);

    expect(result?.identifier).toEqual({ jurisdiction: "eu", celex: "32026R0459" });
  });

  it("resolves an explicitly named amending act when only consolidated history was ingested", () => {
    const result = resolveOfficialAuthority(amendmentPlan, [
      legalChunk(
        "consolidated-only",
        [
          "Consolidated text of Implementing Regulation (EU) 2019/1793.",
          "M13 Commission Implementing Regulation (EU) 2026/194 amending Regulation (EU) 2019/1793.",
          "M14 Commission Implementing Regulation (EU) 2026/459 amending Regulation (EU) 2019/1793.",
        ].join(" "),
        {
          jurisdiction: "eu",
          celexNumber: "02019R1793-20260226",
          baseCelexNumber: "32019R1793",
          currentVersionDate: "2026-02-26",
        }
      ),
    ]);

    expect(result?.identifier).toEqual({ jurisdiction: "eu", celex: "32026R0459" });
    expect(result?.reason).toContain("named modifying act");
  });

  it("resolves a UK statutory instrument from canonical metadata", () => {
    const result = resolveOfficialAuthority(
      {
        ...amendmentPlan,
        exactReferences: ["2013/2996"],
        targetInstrumentReferences: ["2013/2996"],
      },
      [
        legalChunk(
          "uk-amending-si",
          "The Food Safety and Hygiene (England) (Amendment) Regulations 2026 amend S.I. 2013/2996.",
          {
            jurisdiction: "gb",
            source_key: "uk:uksi:2026:412",
            official_url: "https://www.legislation.gov.uk/uksi/2026/412/made",
          }
        ),
      ]
    );

    expect(result?.identifier).toEqual({
      jurisdiction: "gb",
      legislationType: "uksi",
      year: 2026,
      number: 412,
    });
  });
});
