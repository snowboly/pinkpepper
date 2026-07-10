import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("terms billing copy", () => {
  it("supports monthly or annual billing selected at checkout", () => {
    const termsPage = readFileSync("src/app/legal/terms/page.tsx", "utf8");

    expect(termsPage).not.toContain(
      "Subscriptions are billed monthly in advance via Stripe. Your subscription renews automatically at the end of each billing period.",
    );
    expect(termsPage).toContain(
      "Subscriptions are billed monthly or annually in advance via Stripe, depending on the billing interval selected at checkout. Your subscription renews automatically at the end of each billing period.",
    );
  });
});
