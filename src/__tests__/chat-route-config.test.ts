import { describe, expect, it } from "vitest";
import {
  buildAuthorityRetryQueries,
  buildKnowledgeRetryQueries,
  buildIntroductionInstruction,
  getHistoryWindowLimit,
  getStreamingRequestTimeoutMs,
  resolveChatModels,
  shouldRunKnowledgeRetry,
  shouldUseRetrievedContextPrompt,
} from "@/app/api/chat/stream/route";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("resolveChatModels", () => {
  it("uses deepseek-v4-flash as the primary chat model", () => {
    const models = resolveChatModels();

    expect(models.primary).toBe("deepseek-v4-flash");
  });

  it("uses llama 3.3 as the fallback chat model", () => {
    const models = resolveChatModels();

    expect(models.fallback).toBe("llama-3.3-70b-versatile");
  });

  it("allows an explicit primary-model override without changing the fallback", () => {
    const models = resolveChatModels("custom-model");

    expect(models.primary).toBe("custom-model");
    expect(models.fallback).toBe("llama-3.3-70b-versatile");
  });

  it("keeps the llama fallback even when a custom DeepSeek model is configured", () => {
    const models = resolveChatModels("custom-deepseek-model");

    expect(models.primary).toBe("custom-deepseek-model");
    expect(models.fallback).toBe("llama-3.3-70b-versatile");
  });
});

describe("consultant prompt guardrails", () => {
  it("forbids invented user specifics and unsourced hard legal minima in the fallback consultant prompt", () => {
    const src = readFileSync(
      path.join(process.cwd(), "src/app/api/chat/stream/route.ts"),
      "utf8"
    );

    expect(src).toContain("Do NOT invent a location, city, business type, process, batch, or product detail");
    expect(src).toContain("Do NOT state an exact retention period, cooling window, disposal rule, review frequency, or legal minimum");
    expect(src).toContain("exact figure or rule is not verified from current support");
  });

  it("forbids fake source-like titles and unsolicited export nudges in consultant mode", () => {
    const src = readFileSync(
      path.join(process.cwd(), "src/app/api/chat/stream/route.ts"),
      "utf8"
    );

    expect(src).toContain("Do NOT invent source-like labels, bracketed citations, or document titles");
    expect(src).toContain('Do NOT mention DOCX, exports, downloads, generated documents, or PinkPepper product actions unless the user explicitly asked for them');
  });

  it("keeps export guidance available in fallback document mode", () => {
    const src = readFileSync(
      path.join(process.cwd(), "src/app/api/chat/stream/route.ts"),
      "utf8"
    );

    expect(src).toContain('mode === "document"');
    expect(src).toContain('After generating a document, briefly remind the user of their available export options based on their plan.');
    expect(src).toContain('mode === "document" ? "" : "21. Do NOT mention DOCX, exports, downloads, generated documents, or PinkPepper product actions unless the user explicitly asked for them.');
  });
});

describe("stream request timeout", () => {
  it("defaults to a longer timeout for streamed replies", () => {
    delete process.env.CHAT_STREAM_REQUEST_TIMEOUT_MS;

    expect(getStreamingRequestTimeoutMs()).toBe(120000);
  });

  it("allows a valid env override for longer-running replies", () => {
    process.env.CHAT_STREAM_REQUEST_TIMEOUT_MS = "180000";

    expect(getStreamingRequestTimeoutMs()).toBe(180000);
  });

  it("ignores too-small timeout overrides", () => {
    process.env.CHAT_STREAM_REQUEST_TIMEOUT_MS = "10000";

    expect(getStreamingRequestTimeoutMs()).toBe(120000);
  });

  it("ignores non-integer timeout overrides", () => {
    process.env.CHAT_STREAM_REQUEST_TIMEOUT_MS = "180000.5";

    expect(getStreamingRequestTimeoutMs()).toBe(120000);
  });

  it("ignores oversized timeout overrides", () => {
    process.env.CHAT_STREAM_REQUEST_TIMEOUT_MS = "3000000000";

    expect(getStreamingRequestTimeoutMs()).toBe(120000);
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

  it("expands allergen-control queries with claim and cross-contact anchors", () => {
    const queries = buildKnowledgeRetryQueries(
      "A customer asks whether one of our sandwiches is gluten-free. What should my staff do before answering?",
      "qa",
      "gb",
      "cafe"
    );

    expect(queries[0]).toContain("allergen matrix");
    expect(queries[0]).toContain("ingredient specifications");
    expect(queries[0]).toContain("cross-contact controls");
    expect(queries[0]).toContain("gluten-free claim");
  });

  it("expands manufacturer recipe-change label queries with release-control anchors", () => {
    const queries = buildKnowledgeRetryQueries(
      "We changed a soup recipe and it now includes celery and milk. What label checks, allergen updates, and release controls should we complete before the new batch goes on sale?",
      "qa",
      "eu",
      "food manufacturer"
    );

    expect(queries[0]).toContain("recipe change");
    expect(queries[0]).toContain("release controls");
    expect(queries[0]).toContain("raw material specifications");
    expect(queries[0]).toContain("wrong-pack prevention");
  });
});

describe("persona introduction rules", () => {
  it("tells the model not to re-introduce itself after the first assistant reply", () => {
    expect(buildIntroductionInstruction(true)).toContain("Do NOT greet, re-introduce yourself");
  });

  it("allows one short introduction on the first assistant reply", () => {
    expect(buildIntroductionInstruction(false)).toContain("This is the first assistant reply");
    expect(buildIntroductionInstruction(false)).toContain("Do NOT use chatty filler");
  });
});
