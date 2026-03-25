import { describe, expect, it } from "vitest";
import { getHistoryWindowLimit, resolveChatModels } from "@/app/api/chat/stream/route";

describe("resolveChatModels", () => {
  it("uses llama 3.3 as the primary chat model", () => {
    const models = resolveChatModels();

    expect(models.primary).toBe("llama-3.3-70b-versatile");
  });

  it("uses gpt-4o-mini as the fallback chat model", () => {
    const models = resolveChatModels();

    expect(models.fallback).toBe("gpt-4o-mini");
  });

  it("allows an explicit primary-model override without changing the fallback", () => {
    const models = resolveChatModels("custom-model");

    expect(models.primary).toBe("custom-model");
    expect(models.fallback).toBe("gpt-4o-mini");
  });
});

describe("getHistoryWindowLimit", () => {
  it("keeps more than the old 10-message free-tier history window", () => {
    expect(getHistoryWindowLimit("free", false)).toBeGreaterThan(10);
  });

  it("keeps more than the old 20-message pro-tier history window", () => {
    expect(getHistoryWindowLimit("pro", false)).toBeGreaterThan(20);
  });

  it("gives admins the largest history window", () => {
    expect(getHistoryWindowLimit("free", true)).toBeGreaterThanOrEqual(getHistoryWindowLimit("pro", false));
  });
});
