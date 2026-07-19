import { describe, expect, it } from "vitest";
import { getLegalDocument } from "@/lib/legal/content";

function termsText() {
  return getLegalDocument("terms", "en").clauses
    .flatMap((clause) => clause.blocks)
    .map((block) => (block.type === "paragraph" ? block.text : ""))
    .join(" ");
}

describe("terms billing and law copy", () => {
  it("supports monthly or annual billing selected at checkout", () => {
    const text = termsText();
    expect(text).not.toContain("Subscriptions are billed monthly in advance via Stripe. Your subscription renews automatically at the end of each billing period.");
    expect(text).toContain("Subscriptions are billed monthly or annually in advance via Stripe, depending on the billing interval selected at checkout.");
  });

  it("uses Portugal, not Ireland, as the governing-law baseline", () => {
    const text = termsText();
    expect(text).toContain("Portuguese law");
    expect(text).toContain("João Pedro Reis");
    expect(text).toContain("256709661");
    expect(text).not.toMatch(/Irish law|courts of Ireland|Republic of Ireland|ec\.europa\.eu\/consumers\/odr/i);
  });
});
