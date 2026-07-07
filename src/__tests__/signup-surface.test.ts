import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("signup surface", () => {
  it("keeps a thin server page while the client form collects profile fields and marketing opt-in metadata", () => {
    const signupPage = readPage("src/app/signup/page.tsx");
    const signupForm = readPage("src/app/signup/SignupForm.tsx");

    expect(signupPage).not.toContain('"use client"');
    expect(signupPage).toContain("SignupForm");

    expect(signupForm).toContain('"use client"');
    expect(signupForm).toContain("First name");
    expect(signupForm).toContain("Surname");
    expect(signupForm).toContain("Company name");
    expect(signupForm).toContain("I would like to receive occasional product updates, new document templates, and relevant offers from PinkPepper. I can unsubscribe at any time.");
    expect(signupForm).toContain("marketing_email_opt_in");
    expect(signupForm).toContain("company_name");
    expect(signupForm).toContain("first_name");
    expect(signupForm).toContain("last_name");
    expect(signupForm).toContain("options:");
    expect(signupForm).toContain("data:");
  });
});
