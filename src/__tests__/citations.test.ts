import { describe, it, expect } from "vitest";
import {
  formatCitations,
  groupCitationsByType,
  getSourceTypeLabel,
  sortCitationsByRelevance,
  deduplicateCitations,
} from "@/lib/rag/citations";
import type { KnowledgeChunk } from "@/lib/rag/retriever";

function makeChunk(overrides: Partial<KnowledgeChunk> = {}): KnowledgeChunk {
  return {
    id: "chunk-1",
    content: "Temperature control requirements for chilled foods.",
    source_type: "regulation",
    source_name: "EC 852/2004",
    section_ref: "Annex II, Chapter IX",
    metadata: {},
    similarity: 0.85,
    ...overrides,
  };
}

describe("formatCitations", () => {
  it("converts chunks to citation format", () => {
    const chunks = [makeChunk()];
    const citations = formatCitations(chunks);

    expect(citations).toHaveLength(1);
    expect(citations[0].id).toBe("chunk-1");
    expect(citations[0].sourceType).toBe("regulation");
    expect(citations[0].sourceName).toBe("EC 852/2004");
    expect(citations[0].sectionRef).toBe("Annex II, Chapter IX");
    expect(citations[0].similarity).toBe(0.85);
  });

  it("formats title with section ref", () => {
    const citations = formatCitations([makeChunk()]);
    expect(citations[0].title).toBe("EC 852/2004, Annex II, Chapter IX");
  });

  it("formats title without section ref", () => {
    const citations = formatCitations([makeChunk({ section_ref: null })]);
    expect(citations[0].title).toBe("EC 852/2004");
  });

  it("truncates long excerpts at word boundary", () => {
    const longContent = "word ".repeat(100); // 500 chars
    const citations = formatCitations([makeChunk({ content: longContent })]);
    expect(citations[0].excerpt.length).toBeLessThanOrEqual(204); // 200 + "..."
    expect(citations[0].excerpt).toMatch(/\.\.\.$/);
  });

  it("does not truncate short excerpts", () => {
    const shortContent = "Short text.";
    const citations = formatCitations([makeChunk({ content: shortContent })]);
    expect(citations[0].excerpt).toBe("Short text.");
  });

  it("returns empty array for empty input", () => {
    expect(formatCitations([])).toEqual([]);
  });
});

describe("groupCitationsByType", () => {
  it("groups citations by source type", () => {
    const citations = formatCitations([
      makeChunk({ id: "1", source_type: "regulation" }),
      makeChunk({ id: "2", source_type: "guidance" }),
      makeChunk({ id: "3", source_type: "regulation" }),
    ]);

    const grouped = groupCitationsByType(citations);
    expect(grouped["regulation"]).toHaveLength(2);
    expect(grouped["guidance"]).toHaveLength(1);
  });

  it("returns empty object for empty input", () => {
    expect(groupCitationsByType([])).toEqual({});
  });
});

describe("getSourceTypeLabel", () => {
  it("returns 'Regulations' for regulation", () => {
    expect(getSourceTypeLabel("regulation")).toBe("Regulations");
  });

  it("returns 'Guidance Documents' for guidance", () => {
    expect(getSourceTypeLabel("guidance")).toBe("Guidance Documents");
  });

  it("returns 'Templates' for template", () => {
    expect(getSourceTypeLabel("template")).toBe("Templates");
  });

  it("returns 'Certification Standards' for certification", () => {
    expect(getSourceTypeLabel("certification")).toBe("Certification Standards");
  });

  it("returns 'Best Practices' for best_practice", () => {
    expect(getSourceTypeLabel("best_practice")).toBe("Best Practices");
  });

  it("returns raw value for unknown type", () => {
    expect(getSourceTypeLabel("custom_type")).toBe("custom_type");
  });
});

describe("sortCitationsByRelevance", () => {
  it("sorts by similarity descending", () => {
    const citations = formatCitations([
      makeChunk({ id: "low", similarity: 0.5 }),
      makeChunk({ id: "high", similarity: 0.95 }),
      makeChunk({ id: "mid", similarity: 0.75 }),
    ]);

    const sorted = sortCitationsByRelevance(citations);
    expect(sorted[0].id).toBe("high");
    expect(sorted[1].id).toBe("mid");
    expect(sorted[2].id).toBe("low");
  });

  it("does not mutate original array", () => {
    const citations = formatCitations([
      makeChunk({ id: "a", similarity: 0.5 }),
      makeChunk({ id: "b", similarity: 0.9 }),
    ]);

    sortCitationsByRelevance(citations);
    expect(citations[0].id).toBe("a");
  });
});

describe("deduplicateCitations", () => {
  it("removes duplicates by source name + section ref", () => {
    const citations = formatCitations([
      makeChunk({ id: "1", source_name: "EC 852/2004", section_ref: "Ch IX", similarity: 0.8 }),
      makeChunk({ id: "2", source_name: "EC 852/2004", section_ref: "Ch IX", similarity: 0.9 }),
    ]);

    const deduped = deduplicateCitations(citations);
    expect(deduped).toHaveLength(1);
    expect(deduped[0].similarity).toBe(0.9); // keeps highest
  });

  it("keeps entries with different section refs", () => {
    const citations = formatCitations([
      makeChunk({ id: "1", source_name: "EC 852/2004", section_ref: "Ch IX" }),
      makeChunk({ id: "2", source_name: "EC 852/2004", section_ref: "Ch X" }),
    ]);

    const deduped = deduplicateCitations(citations);
    expect(deduped).toHaveLength(2);
  });

  it("handles null section refs", () => {
    const citations = formatCitations([
      makeChunk({ id: "1", source_name: "Guide A", section_ref: null, similarity: 0.7 }),
      makeChunk({ id: "2", source_name: "Guide A", section_ref: null, similarity: 0.8 }),
    ]);

    const deduped = deduplicateCitations(citations);
    expect(deduped).toHaveLength(1);
    expect(deduped[0].similarity).toBe(0.8);
  });
});
