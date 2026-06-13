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
        verifyEu: vi.fn(),
      }
    );

    expect(result.chunks[0]?.source_name).toBe("2026/194");
    expect(result.usedOfficialFallback).toBe(false);
  });

  it("uses official verification when requested annex evidence is absent", async () => {
    const verifyEu = vi.fn().mockResolvedValue({
      sourceName: "EUR-Lex 32026R0194",
      url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32026R0194",
      content: "Annex I row: groundnuts from Exampleland, frequency 20%.",
      retrievedAt: "2026-06-13T00:00:00.000Z",
    });

    const result = await resolveLegalContext(
      "What is the latest regulation amending 2019/1793? List every annex entry and control frequency.",
      [],
      {
        retrieveLexical: vi.fn().mockResolvedValue([
          chunk("2026/194", "This act amends 2019/1793.", "32026R0194", 0.8),
        ]),
        verifyEu,
      }
    );

    expect(verifyEu).toHaveBeenCalledWith("32026R0194");
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
        verifyEu: vi.fn().mockRejectedValue(new Error("timeout")),
      }
    );

    expect(result.usedOfficialFallback).toBe(false);
    expect(result.verificationError).toBe("timeout");
    expect(result.evidence.sufficient).toBe(false);
  });
});
