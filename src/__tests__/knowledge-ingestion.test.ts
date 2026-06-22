import { describe, expect, it, vi } from "vitest";
import {
  activateVersionedKnowledgeChunks,
  replaceKnowledgeChunksForSource,
} from "@/lib/rag/knowledge-ingestion";

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

describe("activateVersionedKnowledgeChunks", () => {
  it("inserts new chunks before archiving older active chunks for the same source key", async () => {
    const rpcMock = vi.fn().mockResolvedValue({ error: null });

    await activateVersionedKnowledgeChunks(
      { rpc: rpcMock } as never,
      {
        sourceKey: "eu:celex:32004R0852",
        versionKey: "eu:celex:02004R0852-20210324",
        rows: [
          {
            content: "Updated hygiene article",
            embedding: "[0,1]",
            source_type: "regulation",
            source_name: "Regulation (EC) No 852/2004",
            section_ref: "Article 5",
            metadata: { jurisdiction: "eu", source_class: "primary_law" },
          },
        ],
      }
    );

    expect(rpcMock).toHaveBeenCalledOnce();
    expect(rpcMock).toHaveBeenCalledWith("activate_versioned_knowledge_chunks", {
      p_source_key: "eu:celex:32004R0852",
      p_version_key: "eu:celex:02004R0852-20210324",
      p_rows: [
        {
          content: "Updated hygiene article",
          embedding: "[0,1]",
          source_type: "regulation",
          source_name: "Regulation (EC) No 852/2004",
          section_ref: "Article 5",
          metadata: {
            jurisdiction: "eu",
            source_class: "primary_law",
            retrieval_status: "active",
            source_key: "eu:celex:32004R0852",
            version_key: "eu:celex:02004R0852-20210324",
          },
        },
      ],
    });
  });

  it("throws before archiving current chunks when versioned activation fails", async () => {
    const rpcMock = vi.fn().mockResolvedValue({
      error: { message: "insert failed" },
    });

    await expect(
      activateVersionedKnowledgeChunks(
        { rpc: rpcMock } as never,
        {
          sourceKey: "eu:celex:32004R0852",
          versionKey: "eu:celex:02004R0852-20210324",
          rows: [
            {
              content: "Updated hygiene article",
              embedding: "[0,1]",
              source_type: "regulation",
              source_name: "Regulation (EC) No 852/2004",
              section_ref: "Article 5",
              metadata: { jurisdiction: "eu", source_class: "primary_law" },
            },
          ],
        }
      )
    ).rejects.toThrow("Database version activation failed: insert failed");
  });
});
