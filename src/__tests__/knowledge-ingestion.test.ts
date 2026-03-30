import { describe, expect, it, vi } from "vitest";
import { replaceKnowledgeChunksForSource } from "@/lib/rag/knowledge-ingestion";

describe("replaceKnowledgeChunksForSource", () => {
  it("uses a single atomic rpc replacement call", async () => {
    const rpcMock = vi.fn().mockResolvedValue({ error: null });

    await replaceKnowledgeChunksForSource(
      { rpc: rpcMock } as never,
      {
        sourceType: "guidance",
        sourceName: "FSA temperature control",
        rows: [
          {
            content: "Example chunk",
            embedding: "[0,1]",
            source_type: "guidance",
            source_name: "FSA temperature control",
            section_ref: "Article 1",
            metadata: { jurisdiction: "gb", source_class: "official_guidance" },
          },
        ],
      }
    );

    expect(rpcMock).toHaveBeenCalledOnce();
    expect(rpcMock).toHaveBeenCalledWith("replace_knowledge_chunks_for_source", {
      p_source_type: "guidance",
      p_source_name: "FSA temperature control",
      p_rows: [
        {
          content: "Example chunk",
          embedding: "[0,1]",
          source_type: "guidance",
          source_name: "FSA temperature control",
          section_ref: "Article 1",
          metadata: { jurisdiction: "gb", source_class: "official_guidance" },
        },
      ],
    });
  });

  it("throws when the atomic replacement rpc fails", async () => {
    const rpcMock = vi.fn().mockResolvedValue({
      error: { message: "duplicate key value violates unique constraint" },
    });

    await expect(
      replaceKnowledgeChunksForSource(
        { rpc: rpcMock } as never,
        {
          sourceType: "guidance",
          sourceName: "FSA temperature control",
          rows: [
            {
              content: "Example chunk",
              embedding: "[0,1]",
              source_type: "guidance",
              source_name: "FSA temperature control",
              section_ref: "Article 1",
              metadata: { jurisdiction: "gb", source_class: "official_guidance" },
            },
          ],
        }
      )
    ).rejects.toThrow("Database replace failed: duplicate key value violates unique constraint");
  });
});
