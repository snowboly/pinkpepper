import { describe, it, expect, vi } from "vitest";
import { utcDayStartIso, utcMonthStartIso, countUsageSince, tierLimits } from "@/lib/policy";
import { TIER_CAPABILITIES } from "@/lib/tier";

describe("utcDayStartIso", () => {
  it("returns midnight UTC for given date", () => {
    const date = new Date("2026-03-07T14:30:00Z");
    expect(utcDayStartIso(date)).toBe("2026-03-07T00:00:00.000Z");
  });

  it("handles midnight exactly", () => {
    const date = new Date("2026-03-07T00:00:00.000Z");
    expect(utcDayStartIso(date)).toBe("2026-03-07T00:00:00.000Z");
  });

  it("handles end of day", () => {
    const date = new Date("2026-03-07T23:59:59.999Z");
    expect(utcDayStartIso(date)).toBe("2026-03-07T00:00:00.000Z");
  });

  it("uses current time when no argument provided", () => {
    const result = utcDayStartIso();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/);
  });
});

describe("utcMonthStartIso", () => {
  it("returns first day of month at midnight UTC", () => {
    const date = new Date("2026-03-15T14:30:00Z");
    expect(utcMonthStartIso(date)).toBe("2026-03-01T00:00:00.000Z");
  });

  it("handles first day of month", () => {
    const date = new Date("2026-03-01T10:00:00Z");
    expect(utcMonthStartIso(date)).toBe("2026-03-01T00:00:00.000Z");
  });

  it("handles last day of month", () => {
    const date = new Date("2026-03-31T23:59:59Z");
    expect(utcMonthStartIso(date)).toBe("2026-03-01T00:00:00.000Z");
  });

  it("handles January correctly", () => {
    const date = new Date("2026-01-15T12:00:00Z");
    expect(utcMonthStartIso(date)).toBe("2026-01-01T00:00:00.000Z");
  });
});

describe("countUsageSince", () => {
  it("returns count from supabase query", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({ count: 5, error: null }),
    };

    // Chain the mocks properly
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ count: 5, error: null }),
          }),
        }),
      }),
    });

    const count = await countUsageSince({
      supabase: mockSupabase,
      userId: "user-123",
      eventType: "chat_prompt",
      sinceIso: "2026-03-07T00:00:00.000Z",
    });

    expect(count).toBe(5);
  });

  it("supports expert-answer usage events", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockResolvedValue({ count: 2, error: null }),
            }),
          }),
        }),
      }),
    };

    const count = await countUsageSince({
      supabase: mockSupabase,
      userId: "user-123",
      eventType: "expert_answer",
      sinceIso: "2026-03-07T00:00:00.000Z",
    });

    expect(count).toBe(2);
  });

  it("returns 0 when count is null", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockResolvedValue({ count: null, error: null }),
            }),
          }),
        }),
      }),
    };

    const count = await countUsageSince({
      supabase: mockSupabase,
      userId: "user-123",
      eventType: "chat_prompt",
      sinceIso: "2026-03-07T00:00:00.000Z",
    });

    expect(count).toBe(0);
  });

  it("throws when supabase returns error", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockResolvedValue({ count: null, error: "some error" }),
            }),
          }),
        }),
      }),
    };

    await expect(
      countUsageSince({
        supabase: mockSupabase,
        userId: "user-123",
        eventType: "chat_prompt",
        sinceIso: "2026-03-07T00:00:00.000Z",
      })
    ).rejects.toThrow("USAGE_READ_FAILED");
  });
});

describe("tierLimits", () => {
  it("returns free tier capabilities", () => {
    expect(tierLimits("free")).toBe(TIER_CAPABILITIES.free);
  });

  it("returns plus tier capabilities", () => {
    expect(tierLimits("plus")).toBe(TIER_CAPABILITIES.plus);
  });

  it("returns pro tier capabilities", () => {
    expect(tierLimits("pro")).toBe(TIER_CAPABILITIES.pro);
  });
});
