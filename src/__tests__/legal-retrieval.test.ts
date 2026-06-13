import { describe, expect, it, vi } from "vitest";
import { resolveLegalContext } from "@/lib/rag/legal-retrieval";
import type { KnowledgeChunk } from "@/lib/rag/retriever";

function chunk(
  id: string,
  content: string,
  celex: string,
  similarity: number
): KnowledgeChunk {
  return {
    id,
    content,
    source_type: "regulation",
    source_name: id,
    section_ref: null,
    metadata: {
      source_class: "primary_law",
      source_key: `eu:${id}`,
      celexNumber: celex,
      dateDocument: id.includes("551") ? "2026-03-13" : "2026-01-28",
      official_url: `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:${celex}`,
    },
    similarity,
  };
}

describe("resolveLegalContext", () => {
  it("selects the act explicitly amending the requested target", async () => {
    const result = await resolveLegalContext(
      "What is the latest regulation amending 2019/1793? Give the adoption date.",
      [chunk("2026/551", "This act amends 2021/632.", "32026R0551", 0.95)],
      {
        retrieveLexical: vi.fn().mockResolvedValue([
          chunk("2026/194", "This act amends 2019/1793.", "32026R0194", 0.76),
        ]),
        verifyOfficial: vi.fn(),
      }
    );

    expect(result.chunks[0]?.source_name).toBe("2026/194");
    expect(result.usedOfficialFallback).toBe(false);
  });

  it("uses official verification when requested annex evidence is absent", async () => {
    const verifyOfficial = vi.fn().mockResolvedValue({
      identifier: { jurisdiction: "eu", celex: "32026R0194" },
      sourceName: "EUR-Lex 32026R0194",
      url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32026R0194",
      officialUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32026R0194",
      content: "Annex I row: groundnuts from Exampleland, frequency 20%.",
      sections: [
        {
          kind: "annex",
          reference: "Annex I",
          content: "Annex I row: groundnuts from Exampleland, frequency 20%.",
        },
      ],
      retrievedAt: "2026-06-13T00:00:00.000Z",
    });

    const result = await resolveLegalContext(
      "What is the latest regulation amending 2019/1793? List every annex entry and control frequency.",
      [],
      {
        retrieveLexical: vi.fn().mockResolvedValue([
          chunk("2026/194", "This act amends 2019/1793.", "32026R0194", 0.8),
        ]),
        verifyOfficial,
      }
    );

    expect(verifyOfficial).toHaveBeenCalledWith(
      { jurisdiction: "eu", celex: "32026R0194" },
      ["annex", "control_frequency"]
    );
    expect(result.usedOfficialFallback).toBe(true);
    expect(result.chunks.some((item) => item.source_type === "official_verification")).toBe(true);
  });

  it("returns partial local evidence when official verification fails", async () => {
    const result = await resolveLegalContext(
      "List the annex entries in 32026R0194.",
      [],
      {
        retrieveLexical: vi.fn().mockResolvedValue([
          chunk("2026/194", "This act amends 2019/1793.", "32026R0194", 0.8),
        ]),
        verifyOfficial: vi.fn().mockRejectedValue(new Error("timeout")),
      }
    );

    expect(result.usedOfficialFallback).toBe(false);
    expect(result.verificationError).toBe("timeout");
    expect(result.evidence.sufficient).toBe(false);
  });

  it("verifies the EU amending act instead of the consolidated base act", async () => {
    const verifyOfficial = vi.fn().mockResolvedValue({
      identifier: { jurisdiction: "eu", celex: "32026R0459" },
      sourceName: "EUR-Lex 32026R0459",
      url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32026R0459",
      officialUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32026R0459",
      content:
        "Article 2 This Regulation shall enter into force on the day following publication.\nANNEX Arachidonic acid oil 50%.",
      sections: [
        {
          kind: "article",
          reference: "Article 2",
          content: "Article 2 This Regulation shall enter into force on the day following publication.",
        },
        {
          kind: "annex",
          reference: "ANNEX",
          content: "ANNEX Arachidonic acid oil 50%.",
        },
      ],
      retrievedAt: "2026-06-13T00:00:00.000Z",
    });

    await resolveLegalContext(
      "What is the latest regulation amending 2019/1793? When does it enter into force and what changed in the annex?",
      [
        chunk(
          "consolidated",
          "Consolidated Regulation 2019/1793 includes amendment M14.",
          "02019R1793-20260226",
          0.95
        ),
      ],
      {
        retrieveLexical: vi.fn().mockResolvedValue([
          chunk(
            "2026/459",
            "Commission Implementing Regulation (EU) 2026/459 amending Regulation (EU) 2019/1793.",
            "32026R0459",
            0.8
          ),
        ]),
        verifyOfficial,
      }
    );

    expect(verifyOfficial).toHaveBeenCalledWith(
      { jurisdiction: "eu", celex: "32026R0459" },
      expect.arrayContaining(["effective_date", "annex"])
    );
  });

  it("uses the UK official identifier selected from canonical metadata", async () => {
    const ukChunk: KnowledgeChunk = {
      id: "uk-412",
      content: "These Regulations amend S.I. 2013/2996.",
      source_type: "regulation",
      source_name: "The Food Safety (Amendment) Regulations 2026",
      section_ref: null,
      metadata: {
        source_class: "primary_law",
        jurisdiction: "gb",
        source_key: "uk:uksi:2026:412",
        official_url: "https://www.legislation.gov.uk/uksi/2026/412/made",
      },
      similarity: 0.9,
    };
    const verifyOfficial = vi.fn().mockResolvedValue({
      identifier: {
        jurisdiction: "gb",
        legislationType: "uksi",
        year: 2026,
        number: 412,
      },
      sourceName: "legislation.gov.uk UKSI 2026/412",
      url: "https://www.legislation.gov.uk/uksi/2026/412/made/data.xml",
      officialUrl: "https://www.legislation.gov.uk/uksi/2026/412/made/data.xml",
      content: "Regulation 1 These Regulations come into force on 1 July 2026.",
      sections: [
        {
          kind: "section",
          reference: "Regulation 1",
          content: "Regulation 1 These Regulations come into force on 1 July 2026.",
        },
      ],
      retrievedAt: "2026-06-13T00:00:00.000Z",
    });

    await resolveLegalContext(
      "When do the latest UK regulations amending 2013/2996 come into force?",
      [],
      {
        retrieveLexical: vi.fn().mockResolvedValue([ukChunk]),
        verifyOfficial,
      }
    );

    expect(verifyOfficial).toHaveBeenCalledWith(
      {
        jurisdiction: "gb",
        legislationType: "uksi",
        year: 2026,
        number: 412,
      },
      expect.arrayContaining(["effective_date"])
    );
  });
});
