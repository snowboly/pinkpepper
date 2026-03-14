import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("SEO surface", () => {
  it("uses the Phase 1 compliance software positioning in shared metadata", () => {
    const layout = readPage("src/app/layout.tsx");

    expect(layout).toContain("AI Food Safety Compliance Software");
    expect(layout).toContain("EU and UK food businesses");
  });

  it("points social metadata at the generated OG image route", () => {
    const layout = readPage("src/app/layout.tsx");

    expect(layout).toContain('url: "/og-image"');
    expect(layout).toContain('images: ["/og-image"]');
  });

  it("includes public marketing pages and excludes auth/dashboard routes from sitemap and robots", () => {
    const entries = sitemap().map((entry) => entry.url);
    const robotRules = robots().rules;
    const robotRuleList = Array.isArray(robotRules) ? robotRules : [robotRules];
    const disallowLists = robotRuleList.flatMap((rule) => {
      const { disallow } = rule;
      return Array.isArray(disallow) ? disallow : disallow ? [disallow] : [];
    });

    expect(entries).toContain("https://pinkpepper.io/features");
    expect(entries).toContain("https://pinkpepper.io/use-cases");
    expect(entries).toContain("https://pinkpepper.io/compare");
    expect(entries).toContain("https://pinkpepper.io/resources");
    expect(entries).not.toContain("https://pinkpepper.io/login");
    expect(entries).not.toContain("https://pinkpepper.io/dashboard");
    expect(disallowLists).toEqual(
      expect.arrayContaining(["/dashboard/", "/admin/", "/api/", "/auth/"]),
    );
  });
});

describe("public SEO copy and linking", () => {
  it("aligns the homepage with the compliance software category narrative", () => {
    const homepage = readPage("src/app/page.tsx");

    expect(homepage).toContain("AI food safety compliance software");
    expect(homepage).toContain("/features/haccp-plan-generator");
    expect(homepage).toContain("/pricing");
  });

  it("routes core public pages into deeper commercial paths", () => {
    const pricing = readPage("src/app/pricing/page.tsx");
    const about = readPage("src/app/about/page.tsx");
    const security = readPage("src/app/security/page.tsx");
    const contact = readPage("src/app/contact/page.tsx");
    const features = readPage("src/app/features/page.tsx");
    const useCases = readPage("src/app/use-cases/page.tsx");
    const compare = readPage("src/app/compare/page.tsx");
    const resources = readPage("src/app/resources/page.tsx");

    expect(pricing).toContain("/features/");
    expect(about).toContain("/pricing");
    expect(security).toContain("/pricing");
    expect(contact).toContain("/features/");
    expect(features).toContain("/pricing");
    expect(useCases).toContain("/features/");
    expect(compare).toContain("/pricing");
    expect(resources).toContain("/features/");
  });
});

describe("premium quality regressions", () => {
  it("does not ship mojibake on core marketing pages", () => {
    const about = readPage("src/app/about/page.tsx");
    const pricing = readPage("src/app/pricing/page.tsx");

    expect(about).not.toContain("â");
    expect(pricing).not.toContain("â");
  });

  it("uses compliance software wording consistently in shared brand surfaces", () => {
    const headerFooter = readPage("src/components/site/chrome.tsx");
    const pricing = readPage("src/app/pricing/page.tsx");

    expect(headerFooter).toContain("AI food safety compliance software");
    expect(headerFooter).not.toContain("AI Food Safety and Compliance Assistant");
    expect(pricing).not.toContain("AI food safety assistant");
  });

  it("provides a dedicated mobile navigation trigger in the shared header", () => {
    const chrome = readPage("src/components/site/chrome.tsx");

    expect(chrome).toContain('aria-label="Open navigation menu"');
    expect(chrome).toContain("lg:hidden");
  });

  it("keeps the premium shared chrome and avoids blanket hover lift motion", () => {
    const chrome = readPage("src/components/site/chrome.tsx");
    const globals = readPage("src/app/globals.css");

    expect(chrome).toContain("AI food safety compliance software");
    expect(chrome).toContain("pp-shell-link");
    expect(globals).not.toContain("a[href]:hover,");
    expect(globals).toContain(".pp-interactive");
  });

  it("recomposes the homepage around trust and workflow narrative sections", () => {
    const homepage = readPage("src/app/page.tsx");

    expect(homepage).toContain("Operational trust, not generic AI output");
    expect(homepage).toContain("From raw notes to review-ready compliance work");
    expect(homepage).toContain("/features/food-safety-audit-prep");
  });
});
