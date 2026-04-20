import { describe, expect, it } from "vitest";
import { publicLaunchLocales, publicRoutePaths } from "@/i18n/public";
import { resolveRequestLocale } from "@/i18n/request";
import { getPublicMessages, isPublicLocale, localizePublicPath } from "@/lib/public-routes";

describe("public locale config", () => {
  it("limits phase 1 public routing to en, fr, de, and pt", () => {
    expect(publicLaunchLocales).toEqual(["en", "fr", "de", "pt"]);
    expect(publicRoutePaths).toContain("/");
    expect(publicRoutePaths).toContain("/pricing");
    expect(publicRoutePaths).not.toContain("/articles");
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
});
