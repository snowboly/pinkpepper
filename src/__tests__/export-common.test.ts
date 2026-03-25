import { describe, it, expect, vi } from "vitest";
import {
  canExportPdf,
  canExportDocx,
  getConversationTranscriptForExport,
  recordExportUsage,
} from "@/lib/export/common";
import type { createClient } from "@/utils/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

describe("canExportPdf", () => {
  it("free tier cannot export PDF", () => {
    expect(canExportPdf("free")).toBe(false);
  });

  it("plus tier can export PDF", () => {
    expect(canExportPdf("plus")).toBe(false);
  });

  it("pro tier can export PDF", () => {
    expect(canExportPdf("pro")).toBe(false);
  });

  it("admin always can export PDF regardless of tier", () => {
    expect(canExportPdf("free", true)).toBe(true);
  });

  it("admin on plus still returns true", () => {
    expect(canExportPdf("plus", true)).toBe(true);
  });
});

describe("canExportDocx", () => {
  it("free tier cannot export DOCX", () => {
    expect(canExportDocx("free")).toBe(false);
  });

  it("plus tier cannot export DOCX", () => {
    expect(canExportDocx("plus")).toBe(false);
  });

  it("pro tier can export DOCX", () => {
    expect(canExportDocx("pro")).toBe(true);
  });

  it("admin always can export DOCX regardless of tier", () => {
    expect(canExportDocx("free", true)).toBe(true);
  });
});

function buildTranscriptSupabase(rows: Array<Record<string, unknown>>): SupabaseClient {
  const conversationChain = {
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: { id: "conv-1", title: "Kitchen checks" } }),
  };

  const messageChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: rows, error: null }),
  };

  return {
    from: vi.fn((table: string) => {
      if (table === "conversations") {
        return {
          select: vi.fn().mockReturnValue(conversationChain),
        };
      }

      if (table === "chat_messages") {
        return messageChain;
      }

      throw new Error(`Unexpected table ${table}`);
    }),
  } as unknown as SupabaseClient;
}

describe("getConversationTranscriptForExport", () => {
  it("returns the full conversation transcript in chronological order", async () => {
    const supabase = buildTranscriptSupabase([
      { role: "user", content: "What temperature should chilled food stay at?", created_at: "2026-03-25T10:00:00Z", metadata: null },
      { role: "assistant", content: "Keep chilled food at 8C or below.", created_at: "2026-03-25T10:00:10Z", metadata: { citations: [{ id: "c1" }] } },
      { role: "user", content: "What records should I keep?", created_at: "2026-03-25T10:01:00Z", metadata: null },
      { role: "assistant", content: "Keep temperature, corrective action, and verification records.", created_at: "2026-03-25T10:01:15Z", metadata: null },
    ]);

    const result = await getConversationTranscriptForExport({
      supabase,
      userId: "user-1",
      conversationId: "conv-1",
    });

    expect(result.conversationTitle).toBe("Kitchen checks");
    expect(result.messages).toHaveLength(4);
    expect(result.messages.map((message) => message.role)).toEqual(["user", "assistant", "user", "assistant"]);
    expect(result.messages[0]?.content).toContain("What temperature");
    expect(result.messages[3]?.content).toContain("verification records");
  });

  it("throws when a conversation has no exportable messages", async () => {
    const supabase = buildTranscriptSupabase([]);

    await expect(
      getConversationTranscriptForExport({
        supabase,
        userId: "user-1",
        conversationId: "conv-1",
      })
    ).rejects.toThrow("NO_CONVERSATION_MESSAGES");
  });
});

function buildUsageSupabase(): SupabaseClient {
  return {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  } as unknown as SupabaseClient;
}

describe("recordExportUsage", () => {
  it("records export usage without document-generation quota helpers", async () => {
    const mockSupabase = buildUsageSupabase();

    await recordExportUsage({
      supabase: mockSupabase,
      userId: "user-1",
      format: "pdf",
      conversationId: "conv-1",
    });

    expect(mockSupabase.from).toHaveBeenCalledWith("usage_events");
  });
});
