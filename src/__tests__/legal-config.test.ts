import { describe, expect, it } from "vitest";

import { LEGAL_LOCALES, LEGAL_OFFICIAL_LINKS, LEGAL_OPERATOR, LEGAL_POLICY_SLUGS, LEGAL_POLICY_VERSIONS, LEGAL_TIMELINE } from "@/lib/legal/config";
import { buildLegalHubPath, buildLegalPath, getLegalAlternates, isLegalLocale, parseLegalPath } from "@/lib/legal/routes";

describe("legal config", () => {
  it("defines the Portuguese sole trader identity and timeline", () => {
    expect(LEGAL_OPERATOR).toMatchObject({ legalName: "João Pedro Reis", tradingName: "PinkPepper", taxIdLabel: "NIF", taxId: "256709661", address: "Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal", country: "Portugal", contactEmail: "support@pinkpepper.io" });
    expect(LEGAL_LOCALES).toEqual(["en", "fr", "de", "es", "it", "pt"]);
    expect(LEGAL_POLICY_SLUGS).toEqual(["terms", "privacy", "cookies", "dpa", "acceptable-use", "refund"]);
    expect(LEGAL_TIMELINE).toEqual({ publishedAt: "2026-07-18T00:00:00+01:00", newUserEffectiveAt: "2026-07-18T00:00:00+01:00", existingUserEffectiveAt: "2026-08-17T00:00:00+01:00" });
    for (const slug of LEGAL_POLICY_SLUGS) expect(LEGAL_POLICY_VERSIONS[slug]).toBe("2026-07-18");
  });

  it("centralizes official resource links", () => {
    expect(LEGAL_OFFICIAL_LINKS.cnpd).toContain("cnpd.pt");
    expect(LEGAL_OFFICIAL_LINKS.ico).toContain("ico.org.uk");
    expect(LEGAL_OFFICIAL_LINKS.complaintsBook).toContain("livroreclamacoes.pt");
    expect(LEGAL_OFFICIAL_LINKS.consumerDispute).toContain("consumidor.gov.pt");
    expect(LEGAL_OFFICIAL_LINKS.support).toBe("mailto:support@pinkpepper.io");
  });
});

describe("legal routes", () => {
  it("builds, parses, and alternates English/localized legal URLs", () => {
    expect(buildLegalHubPath("en")).toBe("/legal");
    expect(buildLegalHubPath("pt")).toBe("/pt/legal");
    expect(buildLegalPath("terms", "en")).toBe("/legal/terms");
    expect(buildLegalPath("terms", "pt")).toBe("/pt/legal/terms");
    expect(parseLegalPath("/legal/refund")).toEqual({ locale: "en", policy: "refund" });
    expect(parseLegalPath("/fr/legal/dpa")).toEqual({ locale: "fr", policy: "dpa" });
    expect(parseLegalPath("/en/legal/terms")).toBeNull();
    expect(parseLegalPath("/pt/legal/missing")).toBeNull();
    expect(isLegalLocale("it")).toBe(true);
    expect(isLegalLocale("nl")).toBe(false);
    expect(getLegalAlternates("privacy")).toMatchObject({ en: "/legal/privacy", pt: "/pt/legal/privacy", "x-default": "/legal/privacy" });
  });
});
