import { describe, expect, it } from "vitest";
import { buildChunkMetadata } from "@/lib/rag/source-taxonomy";
import {
  buildKnowledgeSearchRequest,
  rankRetrievedChunks,
  type KnowledgeChunk,
} from "@/lib/rag/retriever";

describe("chunk metadata", () => {
  it("adds jurisdiction and source_class for FSA guidance", () => {
    expect(buildChunkMetadata("knowledge-docs/guidance/FSA-temperature-control.md")).toMatchObject({
      jurisdiction: "gb",
      source_class: "official_guidance",
    });
  });
});

describe("retrieval ranking", () => {
  it("ranks primary law above internal practice", () => {
    const ranked = rankRetrievedChunks([
      {
        id: "1",
        content: "Template content",
        source_type: "template",
        source_name: "template",
        section_ref: null,
        metadata: { source_class: "internal_practice" },
        similarity: 0.95,
      },
      {
        id: "2",
        content: "EC 852/2004",
        source_type: "regulation",
        source_name: "EC 852/2004",
        section_ref: "Annex II",
        metadata: { source_class: "primary_law" },
        similarity: 0.8,
      },
    ] satisfies KnowledgeChunk[]);

    expect(ranked[0]?.id).toBe("2");
  });

  it("uses authority-aware search when jurisdiction or source classes are provided", () => {
    expect(
      buildKnowledgeSearchRequest({
        threshold: 0.55,
        topK: 8,
        jurisdiction: "gb",
        sourceClasses: ["primary_law", "official_guidance"],
      })
    ).toEqual({
      rpcName: "search_knowledge_chunks_authority_aware",
      rpcArgs: {
        query_embedding: [],
        match_threshold: 0.55,
        match_count: 8,
        filter_source_type: null,
        filter_source_name: null,
        filter_jurisdiction: "gb",
        filter_source_classes: ["primary_law", "official_guidance"],
      },
    });
  });
});
