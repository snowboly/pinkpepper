import { describe, expect, it } from "vitest";
import { buildLegalHubPath, buildLegalPath, parseLegalPath } from "@/lib/legal/routes";

describe("localized legal routes", () => {
  it("builds and parses legal routes without treating /en as a legal locale", () => {
    expect(buildLegalHubPath("fr")).toBe("/fr/legal");
    expect(buildLegalPath("refund", "it")).toBe("/it/legal/refund");
    expect(parseLegalPath("/es/legal/privacy")).toEqual({ locale: "es", policy: "privacy" });
    expect(parseLegalPath("/en/legal/refund")).toBeNull();
  });
});
