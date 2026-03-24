import { describe, it, expect } from "vitest";
import {
  formatContext,
  buildRAGSystemPrompt,
  buildRAGPrompt,
  extractSourceReferences,
  MODE_TEMPERATURES,
} from "@/lib/rag/prompt-builder";
import type { KnowledgeChunk } from "@/lib/rag/retriever";

function makeChunk(overrides: Partial<KnowledgeChunk> = {}): KnowledgeChunk {
  return {
    id: "chunk-1",
    content: "Chilled food must be stored at or below 8°C.",
    source_type: "regulation",
    source_name: "EC 852/2004",
    section_ref: "Annex II, Chapter IX",
    metadata: {},
    similarity: 0.85,
    ...overrides,
  };
}

describe("MODE_TEMPERATURES", () => {
  it("qa temperature is 0.1", () => {
    expect(MODE_TEMPERATURES.qa).toBe(0.1);
  });

  it("document temperature is 0.2", () => {
    expect(MODE_TEMPERATURES.document).toBe(0.2);
  });

  it("audit temperature is 0.0", () => {
    expect(MODE_TEMPERATURES.audit).toBe(0.0);
  });
});

describe("formatContext", () => {
  it("formats chunks with headers", () => {
    const result = formatContext([makeChunk()]);
    expect(result).toContain("[Document 1: EC 852/2004, Annex II, Chapter IX]");
    expect(result).toContain("Chilled food must be stored at or below 8°C.");
  });

  it("includes section ref when present", () => {
    const result = formatContext([makeChunk({ section_ref: "Article 5" })]);
    expect(result).toContain("[Document 1: EC 852/2004, Article 5]");
  });

  it("omits section ref when null", () => {
    const result = formatContext([makeChunk({ section_ref: null })]);
    expect(result).toContain("[Document 1: EC 852/2004]");
    expect(result).not.toContain(",]");
  });

  it("separates multiple chunks with dividers", () => {
    const chunks = [
      makeChunk({ id: "1", source_name: "Doc A" }),
      makeChunk({ id: "2", source_name: "Doc B" }),
    ];
    const result = formatContext(chunks);
    expect(result).toContain("---");
    expect(result).toContain("[Document 1: Doc A");
    expect(result).toContain("[Document 2: Doc B");
  });

  it("returns fallback message for empty chunks", () => {
    expect(formatContext([])).toBe("No relevant context documents found.");
  });
});

describe("buildRAGSystemPrompt", () => {
  it("includes base system prompt", () => {
    const prompt = buildRAGSystemPrompt([makeChunk()]);
    expect(prompt).toContain("PinkPepper");
    expect(prompt).toContain("HACCP");
  });

  it("includes context documents section", () => {
    const prompt = buildRAGSystemPrompt([makeChunk()]);
    expect(prompt).toContain("CONTEXT DOCUMENTS:");
    expect(prompt).toContain("Chilled food must be stored");
  });

  it("includes Q&A mode instructions by default", () => {
    const prompt = buildRAGSystemPrompt([makeChunk()]);
    expect(prompt).toContain("Q&A");
  });

  it("includes audit mode instructions when specified", () => {
    const prompt = buildRAGSystemPrompt([makeChunk()], "audit");
    expect(prompt).toContain("COMPLIANCE AUDIT");
    expect(prompt).toContain("Minor NC");
  });

  it("includes document mode instructions when specified", () => {
    const prompt = buildRAGSystemPrompt([makeChunk()], "document");
    expect(prompt).toContain("DOCUMENT GENERATION");
    expect(prompt).toContain("HACCP plans");
  });

  it("instructs the model not to fill legal gaps from memory", () => {
    const prompt = buildRAGSystemPrompt([], "qa", "English", "2026-03-23");
    expect(prompt).toContain("do not answer legal questions from model memory when retrieval is weak");
  });
});

describe("buildRAGPrompt", () => {
  it("returns system prompt and qa temperature", () => {
    const result = buildRAGPrompt("question", [makeChunk()], "qa");
    expect(result.temperature).toBe(0.1);
    expect(result.systemPrompt).toContain("PinkPepper");
  });

  it("returns audit temperature", () => {
    const result = buildRAGPrompt("audit this", [makeChunk()], "audit");
    expect(result.temperature).toBe(0.0);
  });

  it("returns document temperature", () => {
    const result = buildRAGPrompt("create a plan", [makeChunk()], "document");
    expect(result.temperature).toBe(0.2);
  });

  it("defaults to qa mode", () => {
    const result = buildRAGPrompt("question", [makeChunk()]);
    expect(result.temperature).toBe(0.1);
  });
});

describe("extractSourceReferences", () => {
  it("extracts matching chunks from response", () => {
    const chunks = [
      makeChunk({ source_name: "EC 852/2004" }),
      makeChunk({ id: "2", source_name: "EC 178/2002" }),
    ];

    const response = "According to [Source: EC 852/2004, Annex II] the requirement is...";
    const matched = extractSourceReferences(response, chunks);

    expect(matched).toHaveLength(1);
    expect(matched[0].source_name).toBe("EC 852/2004");
  });

  it("returns empty array when no references found", () => {
    const chunks = [makeChunk()];
    const response = "There are no source references in this text.";
    expect(extractSourceReferences(response, chunks)).toHaveLength(0);
  });

  it("matches multiple references", () => {
    const chunks = [
      makeChunk({ id: "1", source_name: "EC 852/2004" }),
      makeChunk({ id: "2", source_name: "EC 178/2002" }),
    ];

    const response =
      "See [Source: EC 852/2004, Chapter IX] and [Source: EC 178/2002, Article 18].";
    const matched = extractSourceReferences(response, chunks);
    expect(matched).toHaveLength(2);
  });

  it("is case insensitive", () => {
    const chunks = [makeChunk({ source_name: "EC 852/2004" })];
    const response = "[source: ec 852/2004] mentions...";
    const matched = extractSourceReferences(response, chunks);
    expect(matched).toHaveLength(1);
  });
});
