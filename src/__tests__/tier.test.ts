import { describe, it, expect } from "vitest";
import { TIER_CAPABILITIES, normalizeTier } from "@/lib/tier";

describe("TIER_CAPABILITIES", () => {
  it("free tier has correct daily message limit", () => {
    expect(TIER_CAPABILITIES.free.dailyMessages).toBe(25);
  });

  it("plus tier has correct daily message limit", () => {
    expect(TIER_CAPABILITIES.plus.dailyMessages).toBe(100);
  });

  it("pro tier has correct daily message limit", () => {
    expect(TIER_CAPABILITIES.pro.dailyMessages).toBe(1000);
  });

  it("free tier cannot export PDF", () => {
    expect(TIER_CAPABILITIES.free.allowPdfExport).toBe(false);
  });

  it("plus tier can export PDF", () => {
    expect(TIER_CAPABILITIES.plus.allowPdfExport).toBe(true);
  });

  it("only pro tier can export DOCX", () => {
    expect(TIER_CAPABILITIES.free.allowWordExport).toBe(false);
    expect(TIER_CAPABILITIES.plus.allowWordExport).toBe(false);
    expect(TIER_CAPABILITIES.pro.allowWordExport).toBe(true);
  });

  it("free tier has 30-day conversation retention", () => {
    expect(TIER_CAPABILITIES.free.conversationRetentionDays).toBe(30);
  });

  it("paid tiers have no retention limit", () => {
    expect(TIER_CAPABILITIES.plus.conversationRetentionDays).toBeNull();
    expect(TIER_CAPABILITIES.pro.conversationRetentionDays).toBeNull();
  });

  it("only pro tier has human reviews", () => {
    expect(TIER_CAPABILITIES.free.monthlyHumanReviews).toBe(0);
    expect(TIER_CAPABILITIES.plus.monthlyHumanReviews).toBe(0);
    expect(TIER_CAPABILITIES.pro.monthlyHumanReviews).toBe(3);
  });
});

describe("normalizeTier", () => {
  it("returns free for null", () => {
    expect(normalizeTier(null)).toBe("free");
  });

  it("returns free for undefined", () => {
    expect(normalizeTier(undefined)).toBe("free");
  });

  it("returns free for unknown string", () => {
    expect(normalizeTier("enterprise")).toBe("free");
  });

  it("passes through plus", () => {
    expect(normalizeTier("plus")).toBe("plus");
  });

  it("passes through pro", () => {
    expect(normalizeTier("pro")).toBe("pro");
  });
});
