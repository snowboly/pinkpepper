import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const expectedDescription =
  "Get AI-powered food safety support with optional human consultant review. Create HACCP documents, SOPs, allergen records, and compliance workflows for EU and UK food businesses.";

describe("homepage meta description", () => {
  it("uses the approved English positioning across search and social metadata", () => {
    const homepage = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");
    const layout = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf8");
    const messages = JSON.parse(
      readFileSync(join(process.cwd(), "src/i18n/messages/public/en.json"), "utf8")
    ) as { pages: { home: { description: string } } };

    expect(homepage).toContain(expectedDescription);
    expect(layout.match(new RegExp(expectedDescription, "g"))).toHaveLength(3);
    expect(messages.pages.home.description).toBe(expectedDescription);
  });
});
