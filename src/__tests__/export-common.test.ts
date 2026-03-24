import { describe, it, expect, vi } from "vitest";
import {
  canExportPdf,
  canExportDocx,
  recordExportUsage,
} from "@/lib/export/common";
import type { createClient } from "@/utils/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

describe("canExportPdf", () => {
  it("free tier cannot export PDF", () => {
    expect(canExportPdf("free")).toBe(false);
  });

  it("plus tier can export PDF", () => {
    expect(canExportPdf("plus")).toBe(true);
  });

  it("pro tier can export PDF", () => {
    expect(canExportPdf("pro")).toBe(true);
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

function buildMockSupabase(): SupabaseClient {
  return {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  } as unknown as SupabaseClient;
}

describe("recordExportUsage", () => {
  it("records export usage without document-generation quota helpers", async () => {
    const mockSupabase = buildMockSupabase();

    await recordExportUsage({
      supabase: mockSupabase,
      userId: "user-1",
      format: "pdf",
      conversationId: "conv-1",
    });

    expect(mockSupabase.from).toHaveBeenCalledWith("usage_events");
  });
});
