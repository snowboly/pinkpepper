import { afterEach, describe, expect, it } from "vitest";

import { getStripePriceIdForPlan, hasStripePriceConfigError } from "@/lib/billing/price-config";

const ORIGINAL_ENV = { ...process.env };

function resetStripePriceEnv() {
  process.env.STRIPE_PLUS_PRICE_ID = "price_plus_legacy";
  process.env.STRIPE_PRO_PRICE_ID = "price_pro_legacy";
  process.env.STRIPE_PLUS_MONTHLY_PRICE_ID = "price_plus_monthly";
  process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_monthly";
  process.env.STRIPE_PLUS_ANNUAL_PRICE_ID = "price_plus_annual";
  process.env.STRIPE_PRO_ANNUAL_PRICE_ID = "price_pro_annual";
}

describe("subscription price config", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("falls back to valid Plus and Pro legacy aliases when preferred monthly env values are invalid", () => {
    resetStripePriceEnv();
    process.env.STRIPE_PLUS_MONTHLY_PRICE_ID = "prod_bad";
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "prod_bad";

    expect(getStripePriceIdForPlan("plus", "monthly")).toBe("price_plus_legacy");
    expect(hasStripePriceConfigError("plus", "monthly")).toBe(false);
    expect(getStripePriceIdForPlan("pro", "monthly")).toBe("price_pro_legacy");
    expect(hasStripePriceConfigError("pro", "monthly")).toBe(false);
  });

  it("errors when invalid preferred monthly env values have no valid legacy aliases", () => {
    resetStripePriceEnv();
    process.env.STRIPE_PLUS_MONTHLY_PRICE_ID = "prod_bad";
    process.env.STRIPE_PLUS_PRICE_ID = "";
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "prod_bad";
    process.env.STRIPE_PRO_PRICE_ID = "";

    expect(getStripePriceIdForPlan("plus", "monthly")).toBe(null);
    expect(hasStripePriceConfigError("plus", "monthly")).toBe(true);
    expect(getStripePriceIdForPlan("pro", "monthly")).toBe(null);
    expect(hasStripePriceConfigError("pro", "monthly")).toBe(true);
  });

  it("does not fall back from annual plans to monthly price IDs", () => {
    resetStripePriceEnv();
    process.env.STRIPE_PLUS_ANNUAL_PRICE_ID = "";
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID = "";

    expect(getStripePriceIdForPlan("plus", "annual")).toBe(null);
    expect(getStripePriceIdForPlan("pro", "annual")).toBe(null);
  });
});
