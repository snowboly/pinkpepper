import { describe, expect, it } from "vitest";
import {
  buildAuthorityRetryQueries,
  buildKnowledgeRetryQueries,
  buildIntroductionInstruction,
  getHistoryWindowLimit,
  resolveChatModels,
  shouldRunKnowledgeRetry,
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

  it("skips broad knowledge retry when authoritative sources are required", () => {
    expect(shouldRunKnowledgeRetry(true)).toBe(false);
    expect(shouldRunKnowledgeRetry(false)).toBe(true);
  });

  it("expands London legal queries with GB authority hints", () => {
    const queries = buildAuthorityRetryQueries(
      "I run a restaurant in London. What food safety regulations apply to me?",
      "gb",
      "restaurant or cafe"
    );

    expect(queries[0]).toContain("London");
    expect(queries[0]).toContain("UK food hygiene law");
    expect(queries[0]).toContain("FSA guidance");
    expect(queries[0]).toContain("restaurant or cafe");
  });

  it("expands EU manufacturer legal queries with core EU food law anchors", () => {
    const queries = buildAuthorityRetryQueries(
      "I'm a food manufacturer in Germany. What EU regulations must I follow?",
      "eu",
      "food manufacturing business"
    );

    expect(queries[0]).toContain("Germany");
    expect(queries[0]).toContain("Regulation (EC) No 178/2002");
    expect(queries[0]).toContain("Regulation (EU) No 1169/2011");
    expect(queries[0]).toContain("food manufacturing business");
  });

  it("expands legal applicability queries with operational inspection and records hints", () => {
    const queries = buildAuthorityRetryQueries(
      "I run a restaurant in London. What food safety regulations apply to me?",
      "gb",
      "restaurant"
    );

    expect(queries[0]).toContain("inspection readiness");
    expect(queries[0]).toContain("local authority");
    expect(queries[0]).toContain("records");
  });

  it("expands recordkeeping queries with monitoring and traceability anchors", () => {
    const queries = buildKnowledgeRetryQueries(
      "What records should I keep for my restaurant in London?",
      "qa",
      "gb",
      "restaurant"
    );

    expect(queries[0]).toContain("monitoring logs");
    expect(queries[0]).toContain("cleaning records");
    expect(queries[0]).toContain("traceability records");
  });

  it("expands inspection-readiness queries with inspection-specific anchors", () => {
    const queries = buildAuthorityRetryQueries(
      "What will an inspector expect to see first at my small restaurant in London?",
      "gb",
      "restaurant"
    );

    expect(queries[0]).toContain("inspection readiness");
    expect(queries[0]).toContain("EHO expectations");
    expect(queries[0]).toContain("local authority");
  });

  it("expands label-creation document queries with labelling anchors", () => {
    const queries = buildKnowledgeRetryQueries(
      "Create a compliant food label for my product",
      "document",
      "eu",
      "food manufacturing business"
    );

    expect(queries[0]).toContain("food label");
    expect(queries[0]).toContain("Regulation (EU) No 1169/2011");
    expect(queries[0]).toContain("allergen declaration");
    expect(queries[0]).toContain("food manufacturing business");
  });

  it("expands label-requirements qa queries with label-specific anchors", () => {
    const queries = buildKnowledgeRetryQueries(
      "What must appear on the label for a soup containing celery, milk, and wheat?",
      "qa",
      "eu",
      "food manufacturing business"
    );

    expect(queries[0]).toContain("mandatory particulars");
    expect(queries[0]).toContain("food information");
    expect(queries[0]).toContain("allergen declaration");
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
