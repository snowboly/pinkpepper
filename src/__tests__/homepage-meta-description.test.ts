import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const expectedDescription =
  "Get free food safety consultancy, HACCP plans and SOPs, plus expert EU/UK food import and export compliance support for your business.";

describe("homepage meta description", () => {
  it("uses the approved English positioning across homepage metadata sources", () => {
    const homepage = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");
    const layout = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf8");
    const messages = JSON.parse(
      readFileSync(join(process.cwd(), "src/i18n/messages/public/en.json"), "utf8")
    ) as { pages: { home: { description: string } } };

    expect(homepage).toContain(expectedDescription);
    expect(layout).toContain(expectedDescription);
    expect(messages.pages.home.description).toBe(expectedDescription);
  });
});
