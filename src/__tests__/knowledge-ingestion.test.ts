import { describe, expect, it, vi } from "vitest";
import { replaceKnowledgeChunksForSource } from "@/lib/rag/knowledge-ingestion";

describe("replaceKnowledgeChunksForSource", () => {
  it("deletes existing chunks for the source before inserting replacements", async () => {
    const eqSourceName = vi.fn().mockResolvedValue({ error: null });
    const eqSourceType = vi.fn().mockReturnValue({ eq: eqSourceName });
    const deleteMock = vi.fn().mockReturnValue({ eq: eqSourceType });
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    const fromMock = vi
      .fn()
      .mockReturnValueOnce({ delete: deleteMock })
      .mockReturnValueOnce({ insert: insertMock });

    await replaceKnowledgeChunksForSource(
      { from: fromMock } as never,
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

    expect(fromMock).toHaveBeenNthCalledWith(1, "knowledge_chunks");
    expect(deleteMock).toHaveBeenCalledOnce();
    expect(eqSourceType).toHaveBeenCalledWith("source_type", "guidance");
    expect(eqSourceName).toHaveBeenCalledWith("source_name", "FSA temperature control");
    expect(fromMock).toHaveBeenNthCalledWith(2, "knowledge_chunks");
    expect(insertMock).toHaveBeenCalledOnce();
  });

  it("calls insert on the table builder without losing method context", async () => {
    const eqSourceName = vi.fn().mockResolvedValue({ error: null });
    const eqSourceType = vi.fn().mockReturnValue({ eq: eqSourceName });
    const deleteMock = vi.fn().mockReturnValue({ eq: eqSourceType });
    const insertMock = vi.fn(function (this: { tag: string }, rows: unknown[]) {
      if (this.tag !== "builder") {
        throw new Error("insert lost builder context");
      }
      return Promise.resolve({ error: null, rows });
    });
    const builder = { tag: "builder", insert: insertMock };
    const fromMock = vi
      .fn()
      .mockReturnValueOnce({ delete: deleteMock })
      .mockReturnValueOnce(builder);

    await expect(
      replaceKnowledgeChunksForSource(
        { from: fromMock } as never,
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
    ).resolves.toBeUndefined();
  });
});
