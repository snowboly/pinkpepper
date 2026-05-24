import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildConsentCookie, parseConsent, readConsentCookie } from "@/components/site/CookieBanner";

describe("cookie banner persistence", () => {
  it("parses stored consent values from cookies", () => {
    expect(readConsentCookie("theme=light; pp-cookie-consent=accepted")).toBe("accepted");
    expect(readConsentCookie("pp-cookie-consent=essential")).toBe("essential");
    expect(readConsentCookie("theme=light")).toBeNull();
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
