import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("site header mobile menu", () => {
  it("uses a route-keyed mobile navigation component instead of persistent native details", () => {
    const chromeSource = readFileSync(
      path.join(process.cwd(), "src/components/site/chrome.tsx"),
      "utf8",
    );

    const mobileNavSource = readFileSync(
      path.join(process.cwd(), "src/components/site/MobileNavMenu.tsx"),
      "utf8",
    );

    expect(chromeSource).toContain("MobileNavMenu");
    expect(chromeSource).not.toContain('aria-label="Open navigation menu"');
    expect(mobileNavSource).toContain('"use client"');
    expect(mobileNavSource).toContain("usePathname");
    expect(mobileNavSource).toContain("return <MobileNavMenuPanel key={pathname}");
  });
});
