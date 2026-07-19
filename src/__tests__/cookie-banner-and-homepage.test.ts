import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildConsentCookie, parseConsent, readConsentCookie, visibleGoogleAnalyticsCookieNames, COOKIE_SETTINGS_EVENT } from "@/components/site/CookieBanner";

describe("cookie banner persistence", () => {
  it("parses stored consent values from cookies", () => {
    expect(readConsentCookie("theme=light; pp-cookie-consent=accepted")).toBe("accepted");
    expect(readConsentCookie("pp-cookie-consent=essential")).toBe("essential");
    expect(readConsentCookie("theme=light")).toBeNull();
  });

  it("treats malformed consent cookies as no consent", () => {
    expect(readConsentCookie("pp-cookie-consent=%E0%A4%A")).toBeNull();
  });

  it("builds a durable first-party preference cookie", () => {
    expect(buildConsentCookie("accepted")).toContain("pp-cookie-consent=accepted");
    expect(buildConsentCookie("accepted")).toContain("Max-Age=");
    expect(buildConsentCookie("accepted")).toContain("Path=/");
    expect(buildConsentCookie("accepted")).toContain("SameSite=Lax");
  });

  it("keeps the consent parser strict", () => {
    expect(parseConsent("accepted")).toBe("accepted");
    expect(parseConsent("essential")).toBe("essential");
    expect(parseConsent("yes")).toBeNull();
  });
});

describe("homepage surface", () => {
  it("removes the added value section from both homepage variants", () => {
    const homepageSource = readFileSync(path.join(process.cwd(), "src/app/page.tsx"), "utf8");
    const localizedSource = readFileSync(
      path.join(process.cwd(), "src/components/homepage/LocalizedHomePage.tsx"),
      "utf8",
    );

    expect(homepageSource).not.toContain("Added Value");
    expect(homepageSource).not.toContain("AI-powered compliance, with specialists when it matters");
    expect(localizedSource).not.toContain("copy.value.eyebrow");
    expect(localizedSource).not.toContain("copy.value.title");
  });
});

describe("cookie banner source wiring", () => {
  it("includes non-react fallback hooks for dismissal", () => {
    const bannerSource = readFileSync(
      path.join(process.cwd(), "src/components/site/CookieBanner.tsx"),
      "utf8",
    );

    expect(bannerSource).toContain("pp-cookie-banner-fallback");
    expect(bannerSource).toContain("nonce={nonce}");
    expect(bannerSource).toContain('data-cookie-banner');
    expect(bannerSource).toContain('data-cookie-action="accepted"');
    expect(bannerSource).toContain('data-cookie-action="essential"');
    expect(bannerSource).toContain('window.dispatchEvent(new Event(eventName))');
    expect(bannerSource).toContain(COOKIE_SETTINGS_EVENT);
  });

  it("loads Google Analytics only after accepted consent", () => {
    const bannerSource = readFileSync(
      path.join(process.cwd(), "src/components/site/CookieBanner.tsx"),
      "utf8",
    );
    const layoutSource = readFileSync(path.join(process.cwd(), "src/app/layout.tsx"), "utf8");
    const cookiesPolicySource = readFileSync(
      path.join(process.cwd(), "src/lib/legal/content.ts"),
      "utf8",
    );

    expect(bannerSource).toContain('consent === "accepted"');
    expect(bannerSource).toContain("googletagmanager.com/gtag/js");
    expect(layoutSource).not.toContain("googletagmanager.com/gtag/js");
    expect(cookiesPolicySource).toContain("Google Analytics");
    expect(cookiesPolicySource).toContain("load only after optional analytics consent");
    expect(layoutSource).not.toContain("<SpeedInsights />");
    expect(bannerSource).toContain("<SpeedInsights />");
    expect(bannerSource).toContain("analytics_storage");
    expect(bannerSource).toContain("window.location.reload");
  });

  it("exposes only Google Analytics cookie names in preferences copy", () => {
    expect(visibleGoogleAnalyticsCookieNames("_ga=1; _ga_ABC=2; session=3")).toEqual(["_ga", "_ga_ABC"]);
  });

  it("threads the request CSP nonce from the root layout into the cookie banner", () => {
    const layoutSource = readFileSync(path.join(process.cwd(), "src/app/layout.tsx"), "utf8");

    expect(layoutSource).toContain("const nonce = await getCspNonce();");
    expect(layoutSource).toContain("<CookieBanner");
    expect(layoutSource).toContain("nonce={nonce}");
    expect(layoutSource).toContain("googleAnalyticsMeasurementId=");
  });
});
