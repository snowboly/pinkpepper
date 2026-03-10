import { describe, expect, it } from "vitest";
import { buildLanguageInstruction, resolvePreferredLocale } from "@/lib/chat-language";

describe("resolvePreferredLocale", () => {
  it("defaults to english when locale is missing", () => {
    expect(resolvePreferredLocale(undefined)).toBe("en");
    expect(resolvePreferredLocale(null)).toBe("en");
    expect(resolvePreferredLocale(" ")).toBe("en");
  });

  it("accepts supported locales", () => {
    expect(resolvePreferredLocale("fr")).toBe("fr");
    expect(resolvePreferredLocale("de")).toBe("de");
  });

  it("normalizes region tags", () => {
    expect(resolvePreferredLocale("fr-CA")).toBe("fr");
    expect(resolvePreferredLocale("EN-GB")).toBe("en");
  });

  it("falls back to english for unsupported locales", () => {
    expect(resolvePreferredLocale("nl")).toBe("en");
    expect(resolvePreferredLocale("zh-CN")).toBe("en");
  });
});

describe("buildLanguageInstruction", () => {
  it("builds an explicit response-language policy", () => {
    const instruction = buildLanguageInstruction("pt-BR");
    expect(instruction).toContain("Português (pt)");
    expect(instruction).toContain("respond in");
  });
});
