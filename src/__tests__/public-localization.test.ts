import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  publicAuthRoutePaths,
  publicContentRoutePaths,
  publicLaunchLocales,
  publicRoutePaths,
} from "@/i18n/public";
import { resolveRequestLocale } from "@/i18n/request";
import {
  getPublicMessages,
  getPublicPageHref,
  isPublicLocale,
  localizePublicPath,
  switchPublicLocale,
} from "@/lib/public-routes";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("public locale config", () => {
  it("limits phase 1 public routing to en, fr, de, and pt", () => {
    expect(publicLaunchLocales).toEqual(["en", "fr", "de", "pt"]);
    expect(publicRoutePaths).toContain("/");
    expect(publicRoutePaths).toContain("/pricing");
    expect(publicRoutePaths).not.toContain("/articles");
  });

  it("keeps noindex auth routes out of the indexable sitemap route list", () => {
    expect(publicAuthRoutePaths).toEqual(["/signup", "/login"]);
    for (const authPath of publicAuthRoutePaths) {
      expect(publicContentRoutePaths).not.toContain(authPath);
      expect(publicRoutePaths).toContain(authPath);
    }
  });

  it("identifies public locales and localizes public paths", () => {
    expect(isPublicLocale("fr")).toBe(true);
    expect(isPublicLocale("es")).toBe(false);
    expect(localizePublicPath("fr", "/")).toBe("/fr");
    expect(localizePublicPath("pt", "/pricing")).toBe("/pt/pricing");
  });

  it("prefers a valid route locale over the cookie locale", () => {
    expect(resolveRequestLocale({ routeLocale: "fr", cookieLocale: "de" })).toBe("fr");
    expect(resolveRequestLocale({ routeLocale: null, cookieLocale: "pt" })).toBe("pt");
    expect(resolveRequestLocale({ routeLocale: null, cookieLocale: "bad" })).toBe("en");
  });

  it("falls back to English when a public message key is missing", async () => {
    const messages = await getPublicMessages("fr");

    expect(messages.chrome.nav.pricing).toBe("Tarifs");
    expect(messages.chrome.nav.about).toBe("About");
  });

  it("preserves supported public routes when switching locale", () => {
    expect(switchPublicLocale("/fr/pricing", "de")).toBe("/de/pricing");
    expect(switchPublicLocale("/fr/articles", "de")).toBe("/articles");
    expect(getPublicPageHref("pt", "/pricing")).toBe("/pt/pricing");
    expect(getPublicPageHref("pt", "/articles")).toBe("/articles");
  });

  it("creates localized route wrappers that validate and set the request locale", () => {
    const localizedLayout = readPage("src/app/[locale]/layout.tsx");
    const localizedPricingPage = readPage("src/app/[locale]/pricing/page.tsx");

    expect(localizedLayout).toContain("setRequestLocale");
    expect(localizedLayout).toContain("isPublicLocale");
    expect(localizedPricingPage).toContain("buildPublicMetadata");
    expect(localizedPricingPage).toContain('"/pricing"');
  });

  it("routes shared chrome links through locale-aware helpers", () => {
    const chrome = readPage("src/components/site/chrome.tsx");

    expect(chrome).toContain("LocaleSwitcher");
    expect(chrome).toContain("getPublicPageHref");
    expect(chrome).toContain("getPublicMessages");
  });

  it("keeps auth entry cross-links locale-aware", () => {
    const loginPage = readPage("src/app/login/page.tsx");
    const signupPage = readPage("src/app/signup/page.tsx");

    expect(loginPage).toContain("getPublicPageHref");
    expect(signupPage).toContain("getPublicPageHref");
    expect(loginPage).toContain("usePathname");
    expect(signupPage).toContain("usePathname");
  });
});
