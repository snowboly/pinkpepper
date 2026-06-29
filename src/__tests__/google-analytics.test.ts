import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { shouldInjectGoogleAnalytics } from "@/lib/google-analytics";

describe("Google Analytics public-route gating", () => {
  it("injects analytics for public marketing routes only", () => {
    expect(shouldInjectGoogleAnalytics("/")).toBe(true);
    expect(shouldInjectGoogleAnalytics("/articles")).toBe(true);
    expect(shouldInjectGoogleAnalytics("/resources/food-spec-template")).toBe(true);
    expect(shouldInjectGoogleAnalytics("/use-cases/restaurants")).toBe(true);
    expect(shouldInjectGoogleAnalytics("/de/articles/haccp-plan")).toBe(true);

    expect(shouldInjectGoogleAnalytics("/login")).toBe(false);
    expect(shouldInjectGoogleAnalytics("/signup")).toBe(false);
    expect(shouldInjectGoogleAnalytics("/dashboard")).toBe(false);
    expect(shouldInjectGoogleAnalytics("/admin/reviews")).toBe(false);
    expect(shouldInjectGoogleAnalytics("/api/chat")).toBe(false);
  });

  it("keeps the root layout wired to the shared GA measurement env var", () => {
    const layoutSource = readFileSync(path.join(process.cwd(), "src/app/layout.tsx"), "utf8");

    expect(layoutSource).toContain("NEXT_PUBLIC_GA_MEASUREMENT_ID");
    expect(layoutSource).toContain("googletagmanager.com/gtag/js");
  });
});
