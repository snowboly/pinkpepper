import { describe, it, expect, vi } from "vitest";
import {
  canExportPdf,
  canExportDocx,
  enforceDailyDocumentLimit,
} from "@/lib/export/common";

/* ──────────────────────────────────────────────────────────────────────────
   canExportPdf
   ────────────────────────────────────────────────────────────────────────── */

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

  it("non-admin flag defaults to false", () => {
    // canExportPdf("free") — isAdmin defaults to false
    expect(canExportPdf("free")).toBe(false);
  });
});

/* ──────────────────────────────────────────────────────────────────────────
   canExportDocx
   ────────────────────────────────────────────────────────────────────────── */

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

  it("admin on plus can export DOCX", () => {
    expect(canExportDocx("plus", true)).toBe(true);
  });
});

/* ──────────────────────────────────────────────────────────────────────────
   enforceDailyDocumentLimit
   ────────────────────────────────────────────────────────────────────────── */

function buildMockSupabase(count: number | null, error: unknown = null) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ count, error }),
          }),
        }),
      }),
    }),
  };
}

describe("enforceDailyDocumentLimit", () => {
  it("admin bypasses all limits and returns used: 0, limit: null", async () => {
    // Admin should not even query the DB
    const result = await enforceDailyDocumentLimit({
      supabase: {} as unknown,
      userId: "admin-1",
      tier: "free",
      isAdmin: true,
    });

    expect(result).toEqual({ used: 0, limit: null });
  });

  it("free tier throws immediately when usage is 0 (limit is 0)", async () => {
    const mockSupabase = buildMockSupabase(0);

    await expect(
      enforceDailyDocumentLimit({
        supabase: mockSupabase,
        userId: "user-1",
        tier: "free",
        isAdmin: false,
      })
    ).rejects.toThrow("DOC_DAILY_LIMIT_REACHED");
  });

  it("plus tier allows when under limit", async () => {
    const mockSupabase = buildMockSupabase(2); // 2 used out of 3

    const result = await enforceDailyDocumentLimit({
      supabase: mockSupabase,
      userId: "user-1",
      tier: "plus",
      isAdmin: false,
    });

    expect(result).toEqual({ used: 2, limit: 3 });
  });

  it("plus tier throws when at limit", async () => {
    const mockSupabase = buildMockSupabase(3); // 3 used, limit is 3

    await expect(
      enforceDailyDocumentLimit({
        supabase: mockSupabase,
        userId: "user-1",
        tier: "plus",
        isAdmin: false,
      })
    ).rejects.toThrow("DOC_DAILY_LIMIT_REACHED");
  });

  it("pro tier allows when under limit", async () => {
    const mockSupabase = buildMockSupabase(19); // 19 used out of 20

    const result = await enforceDailyDocumentLimit({
      supabase: mockSupabase,
      userId: "user-1",
      tier: "pro",
      isAdmin: false,
    });

    expect(result).toEqual({ used: 19, limit: 20 });
  });

  it("pro tier throws when at limit", async () => {
    const mockSupabase = buildMockSupabase(20); // 20 used, limit is 20

    await expect(
      enforceDailyDocumentLimit({
        supabase: mockSupabase,
        userId: "user-1",
        tier: "pro",
        isAdmin: false,
      })
    ).rejects.toThrow("DOC_DAILY_LIMIT_REACHED");
  });

  it("throws when over limit (handles race condition)", async () => {
    const mockSupabase = buildMockSupabase(25); // somehow over limit

    await expect(
      enforceDailyDocumentLimit({
        supabase: mockSupabase,
        userId: "user-1",
        tier: "pro",
        isAdmin: false,
      })
    ).rejects.toThrow("DOC_DAILY_LIMIT_REACHED");
  });

  it("propagates USAGE_READ_FAILED from countUsageSince", async () => {
    const mockSupabase = buildMockSupabase(null, "db error");

    await expect(
      enforceDailyDocumentLimit({
        supabase: mockSupabase,
        userId: "user-1",
        tier: "plus",
        isAdmin: false,
      })
    ).rejects.toThrow("USAGE_READ_FAILED");
  });
});
