import { describe, expect, it } from "vitest";
import { publicLaunchLocales, publicRoutePaths } from "@/i18n/public";
import { isPublicLocale, localizePublicPath } from "@/lib/public-routes";

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
});
