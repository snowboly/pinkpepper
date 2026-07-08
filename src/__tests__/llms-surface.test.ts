import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("llms.txt", () => {
  it("publishes a concise AI-readable product summary with the approved positioning", () => {
    const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");

    expect(llms).toMatch(/^# PinkPepper/);
    expect(llms).toContain(
      "AI food safety consultant for HACCP and compliance. Generate food safety documents, build HACCP paperwork, and get answers to food safety questions.",
    );
    expect(llms).toContain("https://pinkpepper.io/features/haccp-plan-generator");
    expect(llms).toContain("https://pinkpepper.io/features/food-safety-sop-generator");
    expect(llms).toContain("https://pinkpepper.io/features/allergen-documentation");
    expect(llms).toContain("https://pinkpepper.io/pricing");
    expect(llms).toContain("https://pinkpepper.io/faqs");
    expect(llms).toContain("not legal advice");
    expect(llms).not.toMatch(/dashboard|admin|api|supabase|secret/i);
  });
});
