import { describe, expect, it } from "vitest";
import {
  buildAuthorityRetryQueries,
  buildIntroductionInstruction,
  getHistoryWindowLimit,
  resolveChatModels,
  shouldUseRetrievedContextPrompt,
} from "@/app/api/chat/stream/route";

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

describe("authority-query retrieval fallback", () => {
  it("uses the retrieved-context prompt for legal questions even when retrieval is empty", () => {
    expect(shouldUseRetrievedContextPrompt(false, true)).toBe(true);
    expect(shouldUseRetrievedContextPrompt(false, false)).toBe(false);
    expect(shouldUseRetrievedContextPrompt(true, false)).toBe(true);
  });

  it("expands London legal queries with GB authority hints", () => {
    const queries = buildAuthorityRetryQueries(
      "I run a restaurant in London. What food safety regulations apply to me?",
      "gb",
      "restaurant or café"
    );

    expect(queries[0]).toContain("London");
    expect(queries[0]).toContain("UK food hygiene law");
    expect(queries[0]).toContain("FSA guidance");
    expect(queries[0]).toContain("restaurant or café");
  });
});

describe("persona introduction rules", () => {
  it("tells the model not to re-introduce itself after the first assistant reply", () => {
    expect(buildIntroductionInstruction(true)).toContain("Do NOT greet, re-introduce yourself");
  });

  it("allows one short introduction on the first assistant reply", () => {
    expect(buildIntroductionInstruction(false)).toContain("This is the first assistant reply");
  });
});
