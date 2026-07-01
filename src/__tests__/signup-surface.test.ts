import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("signup surface", () => {
  it("collects profile fields and marketing opt-in metadata", () => {
    const signupPage = readPage("src/app/signup/page.tsx");

    expect(signupPage).toContain("First name");
    expect(signupPage).toContain("Surname");
    expect(signupPage).toContain("Company name");
    expect(signupPage).toContain("I would like to receive occasional product updates, new document templates, and relevant offers from PinkPepper. I can unsubscribe at any time.");
    expect(signupPage).toContain("marketing_email_opt_in");
    expect(signupPage).toContain("company_name");
    expect(signupPage).toContain("first_name");
    expect(signupPage).toContain("last_name");
    expect(signupPage).toContain("options:");
    expect(signupPage).toContain("data:");
  });
});
