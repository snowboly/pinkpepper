import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("complete profile surface", () => {
  it("collects business type and only syncs marketing preference when changed", () => {
    const form = readPage("src/app/dashboard/complete-profile/CompleteProfileForm.tsx");
    const page = readPage("src/app/dashboard/complete-profile/page.tsx");

    expect(page).toContain("business_type");
    expect(form).toContain("initialBusinessType");
    expect(form).toContain("business_type");
    expect(form).toContain("if (marketingOptIn !== initialMarketingOptIn)");
    expect(form).toContain("payload.marketing_email_opt_in = marketingOptIn");
    expect(form).toContain("onboarding_completed: true");
  });
});
