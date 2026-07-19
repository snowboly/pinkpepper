import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function files(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const file = path.join(root, name);
    const stat = statSync(file);
    if (stat.isDirectory()) return files(file);
    return /\.(ts|tsx|md|json)$/.test(file) ? [file] : [];
  });
}

describe("legal release baseline", () => {
  it("removes obsolete Irish and ODR legal claims from user-facing source", () => {
    const roots = ["src/app", "src/components", "src/content", "src/lib"].map((root) => path.join(process.cwd(), root));
    const source = roots.flatMap(files).filter((file) => !file.includes("__tests__")).map((file) => readFileSync(file, "utf8")).join(" ");
    expect(source).not.toMatch(/Irish law|courts of Ireland|Data Protection Commission|ec\.europa\.eu\/consumers\/odr|personal-data breach[^.]*72 hours|processor[^.]*72 hours/i);
    expect(source).toContain("Jo\u00e3o Pedro Reis");
    expect(source).not.toContain("Jo?o Pedro Reis");
    expect(source).toContain("256709661");
  });

  it("tracks unresolved production compliance actions", () => {
    const checklist = readFileSync("docs/legal/production-compliance-checklist.md", "utf8");
    for (const heading of ["Qualified Portuguese legal review", "UK representative appointment or written exemption opinion", "Professional review of five translations", "Electronic Complaints Book registration", "Applicable Portuguese ADR confirmation", "Stripe production Terms URL/consent configuration", "Migration deployment", "Authorized existing-customer notice", "Production deployment"]) expect(checklist).toContain(heading);
    expect(checklist).toContain("| item | status | owner | evidence link/location | completion date |");
    expect(checklist).toContain("Electronic Complaints Book registration | unchecked");
    expect(checklist).toContain("UK representative appointment or written exemption opinion | unchecked");
  });

  it("keeps legal identity pages noindexed and off the global indexed footer", () => {
    const legalPageFiles = [
      "src/app/legal/page.tsx",
      "src/app/legal/terms/page.tsx",
      "src/app/legal/privacy/page.tsx",
      "src/app/legal/cookies/page.tsx",
      "src/app/legal/dpa/page.tsx",
      "src/app/legal/acceptable-use/page.tsx",
      "src/app/legal/refund/page.tsx",
      "src/app/legal/acceptance/page.tsx",
      "src/app/[locale]/legal/page.tsx",
      "src/app/[locale]/legal/[policy]/page.tsx",
    ];

    for (const file of legalPageFiles) {
      expect(readFileSync(file, "utf8"), file).toContain("robots: { index: false, follow: true }");
    }

    const localizedPolicyRoute = readFileSync("src/app/[locale]/legal/[policy]/page.tsx", "utf8");
    expect(localizedPolicyRoute).not.toContain("index: true");

    const chrome = readFileSync("src/components/site/chrome.tsx", "utf8");
    const legalFooterStart = chrome.indexOf("export function LegalSiteFooter");
    const siteFooterStart = chrome.indexOf("export async function SiteFooter");
    const legalFooter = chrome.slice(legalFooterStart, siteFooterStart);
    const siteFooter = chrome.slice(siteFooterStart);

    expect(legalFooter).toContain("Jo\u00e3o Pedro Reis");
    expect(legalFooter).toContain("NIF 256709661");
    expect(siteFooter).not.toContain("Jo\u00e3o Pedro Reis");
    expect(siteFooter).not.toContain("NIF 256709661");
  });
});
