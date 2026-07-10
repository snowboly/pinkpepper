import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readPage(path: string) {
  return readFileSync(path, "utf8");
}

describe("pricing billing UI", () => {
  it("defaults the pricing toggle to monthly and does not add quarterly billing", () => {
    const pricingPlans = readPage("src/components/pricing/PricingPlans.tsx");

    expect(pricingPlans).toContain('useState<BillingInterval>("monthly")');
    expect(pricingPlans).toContain("Monthly");
    expect(pricingPlans).toContain("Annual");
    expect(pricingPlans).not.toContain("quarterly");
  });

  it("shows annual Plus and Pro prices and savings copy", () => {
    const pricingPlans = readPage("src/components/pricing/PricingPlans.tsx");

    expect(pricingPlans).toContain('price: "205"');
    expect(pricingPlans).toContain('price: "1,129"');
    expect(pricingPlans).toContain("Save 10%");
    expect(pricingPlans).toContain("Save 5%");
    expect(pricingPlans).toContain("Billed yearly");
    expect(pricingPlans).toContain("Best for ongoing compliance work");
  });

  it("passes selected billing interval to checkout CTAs", () => {
    const pricingPlans = readPage("src/components/pricing/PricingPlans.tsx");
    const pricingActions = readPage("src/components/pricing/PricingActions.tsx");

    expect(pricingPlans).toContain('interval={interval}');
    expect(pricingActions).toContain('body: JSON.stringify({ plan, interval })');
  });
});
