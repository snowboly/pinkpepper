import { describe, it, expect } from "vitest";
import {
  TIER_CAPABILITIES,
  normalizeTier,
  type SubscriptionTier,
  type TierCapabilities,
} from "@/lib/tier";
import { parseStripeSubscription } from "@/lib/billing/tier-mapping";

/* ──────────────────────────────────────────────────────────────────────────
   1. Snapshot-style tests — every capability for every tier
   ────────────────────────────────────────────────────────────────────────── */

describe("TIER_CAPABILITIES – free tier", () => {
  const free = TIER_CAPABILITIES.free;

  it("dailyMessages is 15", () => expect(free.dailyMessages).toBe(15));
  it("dailyImageUploads is 3", () => expect(free.dailyImageUploads).toBe(3));
  it("dailyTranscriptions is 3", () => expect(free.dailyTranscriptions).toBe(3));
  it("maxSavedConversations is 10", () => expect(free.maxSavedConversations).toBe(10));
  it("conversationRetentionDays is 30", () => expect(free.conversationRetentionDays).toBe(30));
  it("allowPdfExport is false", () => expect(free.allowPdfExport).toBe(false));
  it("allowWordExport is false", () => expect(free.allowWordExport).toBe(false));
  it("allowFullDocumentReview is false", () => expect(free.allowFullDocumentReview).toBe(false));
  it("hasConsultancy is false", () => expect(free.hasConsultancy).toBe(false));
  it("monthlyConsultancyRequests is 0", () => expect(free.monthlyConsultancyRequests).toBe(0));
  it("reviewTurnaround is N/A", () => expect(free.reviewTurnaround).toBe("N/A"));
  it("maxResponseTokens is 2048", () => expect(free.maxResponseTokens).toBe(2048));
});

describe("TIER_CAPABILITIES – plus tier", () => {
  const plus = TIER_CAPABILITIES.plus;

  it("dailyMessages is 100", () => expect(plus.dailyMessages).toBe(100));
  it("dailyImageUploads is 10", () => expect(plus.dailyImageUploads).toBe(10));
  it("dailyTranscriptions is 25", () => expect(plus.dailyTranscriptions).toBe(25));
  it("maxSavedConversations is unlimited (null)", () => expect(plus.maxSavedConversations).toBeNull());
  it("conversationRetentionDays is unlimited (null)", () => expect(plus.conversationRetentionDays).toBeNull());
  it("allowPdfExport is false", () => expect(plus.allowPdfExport).toBe(false));
  it("allowWordExport is false", () => expect(plus.allowWordExport).toBe(false));
  it("allowFullDocumentReview is false", () => expect(plus.allowFullDocumentReview).toBe(false));
  it("hasConsultancy is false", () => expect(plus.hasConsultancy).toBe(false));
  it("monthlyConsultancyRequests is 0", () => expect(plus.monthlyConsultancyRequests).toBe(0));
  it("reviewTurnaround is N/A", () => expect(plus.reviewTurnaround).toBe("N/A"));
  it("maxResponseTokens is 4096", () => expect(plus.maxResponseTokens).toBe(4096));
});

describe("TIER_CAPABILITIES – pro tier", () => {
  const pro = TIER_CAPABILITIES.pro;

  it("dailyMessages is 1000", () => expect(pro.dailyMessages).toBe(1000));
  it("dailyImageUploads is 50", () => expect(pro.dailyImageUploads).toBe(50));
  it("dailyTranscriptions is 200", () => expect(pro.dailyTranscriptions).toBe(200));
  it("maxSavedConversations is unlimited (null)", () => expect(pro.maxSavedConversations).toBeNull());
  it("conversationRetentionDays is unlimited (null)", () => expect(pro.conversationRetentionDays).toBeNull());
  it("allowPdfExport is false", () => expect(pro.allowPdfExport).toBe(false));
  it("allowWordExport is true", () => expect(pro.allowWordExport).toBe(true));
  it("allowFullDocumentReview is true", () => expect(pro.allowFullDocumentReview).toBe(true));
  it("hasConsultancy is true", () => expect(pro.hasConsultancy).toBe(true));
  it("monthlyConsultancyRequests is 3", () => expect(pro.monthlyConsultancyRequests).toBe(3));
  it("reviewTurnaround is within 5 working days", () => expect(pro.reviewTurnaround).toBe("within 5 working days"));
  it("maxResponseTokens is 8192", () => expect(pro.maxResponseTokens).toBe(8192));
});

/* ──────────────────────────────────────────────────────────────────────────
   2. Cross-tier invariants — higher tiers must be >= lower tiers
   ────────────────────────────────────────────────────────────────────────── */

describe("cross-tier invariants", () => {
  const tiers: SubscriptionTier[] = ["free", "plus", "pro"];

  // Numeric limits where higher tiers should always be >=
  const numericKeys: (keyof TierCapabilities)[] = [
    "dailyMessages",
    "dailyImageUploads",
    "dailyTranscriptions",
    "maxResponseTokens",
  ];

  for (const key of numericKeys) {
    it(`${key}: free <= plus <= pro`, () => {
      const [f, pl, pr] = tiers.map((t) => TIER_CAPABILITIES[t][key] as number);
      expect(pl).toBeGreaterThanOrEqual(f);
      expect(pr).toBeGreaterThanOrEqual(pl);
    });
  }

  it("maxSavedConversations: free is finite, paid tiers are unlimited", () => {
    expect(TIER_CAPABILITIES.free.maxSavedConversations).toBeTypeOf("number");
    expect(TIER_CAPABILITIES.plus.maxSavedConversations).toBeNull();
    expect(TIER_CAPABILITIES.pro.maxSavedConversations).toBeNull();
  });

  it("conversationRetentionDays: free is finite, paid tiers are unlimited", () => {
    expect(TIER_CAPABILITIES.free.conversationRetentionDays).toBeTypeOf("number");
    expect(TIER_CAPABILITIES.plus.conversationRetentionDays).toBeNull();
    expect(TIER_CAPABILITIES.pro.conversationRetentionDays).toBeNull();
  });

  it("PDF export is disabled across user tiers", () => {
    expect(TIER_CAPABILITIES.free.allowPdfExport).toBe(false);
    expect(TIER_CAPABILITIES.plus.allowPdfExport).toBe(false);
    expect(TIER_CAPABILITIES.pro.allowPdfExport).toBe(false);
  });

  it("DOCX export is exclusive to pro", () => {
    expect(TIER_CAPABILITIES.free.allowWordExport).toBe(false);
    expect(TIER_CAPABILITIES.plus.allowWordExport).toBe(false);
    expect(TIER_CAPABILITIES.pro.allowWordExport).toBe(true);
  });

  it("full document review is exclusive to pro", () => {
    expect(TIER_CAPABILITIES.free.allowFullDocumentReview).toBe(false);
    expect(TIER_CAPABILITIES.plus.allowFullDocumentReview).toBe(false);
    expect(TIER_CAPABILITIES.pro.allowFullDocumentReview).toBe(true);
  });

  it("consultancy is exclusive to pro", () => {
    expect(TIER_CAPABILITIES.free.hasConsultancy).toBe(false);
    expect(TIER_CAPABILITIES.plus.hasConsultancy).toBe(false);
    expect(TIER_CAPABILITIES.pro.hasConsultancy).toBe(true);
  });
});

/* ──────────────────────────────────────────────────────────────────────────
   3. Structural guarantees
   ────────────────────────────────────────────────────────────────────────── */

describe("TIER_CAPABILITIES structure", () => {
  it("has exactly three tiers: free, plus, pro", () => {
    expect(Object.keys(TIER_CAPABILITIES).sort()).toEqual(["free", "plus", "pro"]);
  });

  it("every tier has all required capability keys", () => {
    const requiredKeys: (keyof TierCapabilities)[] = [
      "dailyMessages",
      "dailyImageUploads",
      "dailyTranscriptions",
      "maxSavedConversations",
      "conversationRetentionDays",
      "allowPdfExport",
      "allowWordExport",
      "allowFullDocumentReview",
      "hasConsultancy",
      "monthlyConsultancyRequests",
      "reviewTurnaround",
      "maxResponseTokens",
    ];

    for (const tier of ["free", "plus", "pro"] as SubscriptionTier[]) {
      for (const key of requiredKeys) {
        expect(TIER_CAPABILITIES[tier]).toHaveProperty(key);
      }
    }
  });

  it("numeric limits are all positive or zero (never negative)", () => {
    for (const tier of ["free", "plus", "pro"] as SubscriptionTier[]) {
      const caps = TIER_CAPABILITIES[tier];
      expect(caps.dailyMessages).toBeGreaterThanOrEqual(0);
      expect(caps.dailyImageUploads).toBeGreaterThanOrEqual(0);
      expect(caps.dailyTranscriptions).toBeGreaterThanOrEqual(0);
      expect(caps.maxResponseTokens).toBeGreaterThan(0);
    }
  });

  it("does not expose document-generation capabilities anymore", () => {
    expect(TIER_CAPABILITIES.free).not.toHaveProperty("dailyDocumentGenerations");
    expect(TIER_CAPABILITIES.pro).not.toHaveProperty("advancedHaccpGeneration");
  });
});

/* ──────────────────────────────────────────────────────────────────────────
   4. normalizeTier
   ────────────────────────────────────────────────────────────────────────── */

describe("normalizeTier", () => {
  it("returns free for null", () => expect(normalizeTier(null)).toBe("free"));
  it("returns free for undefined", () => expect(normalizeTier(undefined)).toBe("free"));
  it("returns free for empty string", () => expect(normalizeTier("")).toBe("free"));
  it("returns free for unknown string", () => expect(normalizeTier("enterprise")).toBe("free"));
  it("returns free for garbage input", () => expect(normalizeTier("abc123!@#")).toBe("free"));

  it("passes through plus", () => expect(normalizeTier("plus")).toBe("plus"));
  it("passes through pro", () => expect(normalizeTier("pro")).toBe("pro"));
  it("passes through free", () => expect(normalizeTier("free")).toBe("free"));

  // Case sensitivity — normalizeTier does NOT lowercase; verify current behavior
  it("treats PLUS (uppercase) as unknown and returns free", () => {
    expect(normalizeTier("PLUS")).toBe("free");
  });
  it("treats Pro (mixed case) as unknown and returns free", () => {
    expect(normalizeTier("Pro")).toBe("free");
  });
});

describe("parseStripeSubscription", () => {
  it("preserves the billed plan tier when access downgrades after cancellation", () => {
    process.env.STRIPE_PRO_PRICE_ID = "price_pro";

    expect(
      parseStripeSubscription({
        status: "canceled",
        priceId: "price_pro",
        currentPeriodEndUnix: 1_710_000_000,
      })
    ).toMatchObject({
      planTier: "pro",
      tier: "free",
      stripePriceId: "price_pro",
      status: "canceled",
    });
  });
});
