import { beforeEach, describe, expect, it } from "vitest";
import { getStripePriceIdForPlan } from "@/lib/billing/subscription-price-config";
import { resolveTierFromPrice } from "@/lib/billing/tier-mapping";

describe("subscription Stripe price configuration", () => {
  beforeEach(() => {
    process.env.STRIPE_PLUS_PRICE_ID = "price_plus_legacy";
    process.env.STRIPE_PRO_PRICE_ID = "price_pro_legacy";
    process.env.STRIPE_PLUS_MONTHLY_PRICE_ID = "price_plus_monthly";
    process.env.STRIPE_PLUS_ANNUAL_PRICE_ID = "price_plus_annual";
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_monthly";
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID = "price_pro_annual";
  });

  it("falls back to legacy monthly aliases when new monthly env vars are blank", () => {
    process.env.STRIPE_PLUS_MONTHLY_PRICE_ID = "";
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "   ";

    expect(getStripePriceIdForPlan("plus", "monthly")).toBe("price_plus_legacy");
    expect(getStripePriceIdForPlan("pro", "monthly")).toBe("price_pro_legacy");
  });


  it("falls back to legacy monthly aliases when preferred monthly env vars are invalid", () => {
    process.env.STRIPE_PLUS_MONTHLY_PRICE_ID = "prod_plus_wrong";
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "not_a_price";

    expect(getStripePriceIdForPlan("plus", "monthly")).toBe("price_plus_legacy");
    expect(getStripePriceIdForPlan("pro", "monthly")).toBe("price_pro_legacy");
  });

  it.each([
    ["price_plus_monthly", "plus"],
    ["price_plus_legacy", "plus"],
    ["price_plus_annual", "plus"],
    ["price_pro_monthly", "pro"],
    ["price_pro_legacy", "pro"],
    ["price_pro_annual", "pro"],
  ] as const)("maps configured and legacy Stripe price ID %s to %s entitlements", (priceId, tier) => {
    expect(resolveTierFromPrice(priceId)).toBe(tier);
  });
});
