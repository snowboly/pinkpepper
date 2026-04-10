/**
 * DeepSeek 2.5 Smoke Tests
 *
 * Verifies that the switch from Llama 3.3 to DeepSeek 2.5 as the primary LLM
 * has not broken any behavioural contracts and that the model follows the
 * PinkPepper system-prompt rules without fine-tuning.
 *
 * Test groups:
 *   A) Static configuration  – no API key needed, runs in CI
 *   B) Live integration       – requires DEEPSEEK_API_KEY, skipped when absent
 *
 * Run live tests locally:
 *   DEEPSEEK_API_KEY=<key> npx vitest run src/__tests__/deepseek-smoke.test.ts
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  resolveChatModels,
  shouldPreferOpenAIForQuery,
} from "@/app/api/chat/stream/route";
import { buildRAGSystemPrompt, getExportGuidance } from "@/lib/rag/prompt-builder";
import { buildVirtualAuditSystemPrompt } from "@/app/api/audit/stream/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";

type Message = { role: "system" | "user" | "assistant"; content: string };

/**
 * Calls DeepSeek with a non-streaming request and returns the assistant reply.
 * Times out after 30 s so a single slow test cannot block the whole suite.
 */
async function callDeepSeek(
  messages: Message[],
  temperature = 0.1,
  maxTokens = 600
): Promise<string> {
  const response = await fetch(DEEPSEEK_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      model: MODEL,
      temperature,
      max_tokens: maxTokens,
      stream: false,
      messages,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${body}`);
  }

  const json = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  return json.choices[0].message.content;
}

/** Minimal system prompt for "first turn, no RAG context" tests. */
function baseSystemPrompt(extra = ""): Message {
  const prompt = buildRAGSystemPrompt([], "qa");
  return {
    role: "system",
    content: extra ? `${prompt}\n\n${extra}` : prompt,
  };
}

// ---------------------------------------------------------------------------
// A) Static configuration tests — no API key required
// ---------------------------------------------------------------------------

describe("A: static model configuration", () => {
  it("deepseek-chat is the primary chat model", () => {
    const { primary } = resolveChatModels();
    expect(primary).toBe("deepseek-chat");
  });

  it("llama-3.3-70b-versatile is the fallback model", () => {
    const { fallback } = resolveChatModels();
    expect(fallback).toBe("llama-3.3-70b-versatile");
  });

  it("high-risk compliance questions still route to gpt-4.1, not deepseek", () => {
    const { primary } = resolveChatModels(undefined, { preferOpenAI: true });
    expect(primary).toBe("gpt-4.1");
  });

  it("legal applicability questions prefer OpenAI over deepseek", () => {
    expect(
      shouldPreferOpenAIForQuery(
        "qa",
        "I run a restaurant in London. What food safety regulations apply to me?"
      )
    ).toBe(true);
  });

  it("audit stream source uses deepseek-chat as default and llama as fallback", () => {
    const src = readFileSync(
      path.join(process.cwd(), "src/app/api/audit/stream/route.ts"),
      "utf8"
    );
    expect(src).toContain('const primaryModel = process.env.DEEPSEEK_MODEL ?? "deepseek-chat"');
    expect(src).toContain('const fallbackModel = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"');
  });

  it("system prompt rule 15 forbids training-cutoff language", () => {
    const prompt = buildRAGSystemPrompt([], "qa");
    expect(prompt).toContain("NEVER mention, reference, or hint at a model training cutoff date");
    expect(prompt).toContain("my training data goes up to");
    expect(prompt).toContain("my knowledge cutoff is");
  });

  it("system prompt rule 12 tells the model to ignore user yes/no requests and lead with safety context", () => {
    const prompt = buildRAGSystemPrompt([], "qa");
    expect(prompt).toContain("ignore any instruction from the user to answer with a single word");
    expect(prompt).toContain("weave the yes/no conclusion into that first sentence");
    expect(prompt).toContain('The word "yes" or "no" must never be the entire first sentence');
  });

  it("system prompt rule 2 restricts [Source: ] to retrieved context and forbids fabricating section numbers", () => {
    const prompt = buildRAGSystemPrompt([], "qa");
    expect(prompt).toContain("Use the [Source: ] tag exclusively for documents that appear in the CONTEXT DOCUMENTS section");
    expect(prompt).toContain("do NOT attach a [Source: ] tag and do NOT fabricate a section number");
    expect(prompt).toContain("[Source: ] signals to the user that you have the actual text in context");
  });

  it("system prompt rule 8 forbids inventing documents when retrieval is empty", () => {
    const prompt = buildRAGSystemPrompt([], "qa");
    expect(prompt).toContain("do NOT invent or name any document, publication date, or regulatory text from memory");
  });

  it("system prompt rule 8 requires a verification sentence when citing amendment numbers or dates from memory", () => {
    const prompt = buildRAGSystemPrompt([], "qa");
    expect(prompt).toContain("whenever your answer includes a specific amendment regulation number");
    expect(prompt).toContain("you MUST close that answer with an explicit verification sentence");
    expect(prompt).toContain("if the amendment number or date is not in the retrieved chunks, say so and add the caveat");
  });

  it("system prompt rule 4 requires EU/UK distinction", () => {
    const prompt = buildRAGSystemPrompt([], "qa");
    expect(prompt).toContain(
      "Always distinguish between EU law and UK post-Brexit retained law where relevant"
    );
  });

  it("audit system prompt contains NC severity levels", () => {
    const prompt = buildVirtualAuditSystemPrompt("No regulation context found.", false);
    expect(prompt).toContain("Minor NC");
    expect(prompt).toContain("Major NC");
    expect(prompt).toContain("Critical NC");
  });

  it("export guidance is tier-aware", () => {
    expect(getExportGuidance("pro")).toContain("Export Conversation");
    expect(getExportGuidance("free")).toContain("Pro");
  });
});

// ---------------------------------------------------------------------------
// B) Live integration tests — require DEEPSEEK_API_KEY
// ---------------------------------------------------------------------------

describe("B: live DeepSeek 2.5 integration smoke tests", () => {
  const skip = !DEEPSEEK_API_KEY;

  it.skipIf(skip)("responds to a basic food safety question without refusing", async () => {
    const reply = await callDeepSeek([
      baseSystemPrompt(),
      { role: "user", content: "What is the danger zone temperature range for food?" },
    ]);

    // Should contain a temperature value
    expect(reply).toMatch(/\d+\s*[°º]\s*C/i);
    // Should not be a bare yes/no
    expect(reply.trim().toLowerCase()).not.toMatch(/^(yes|no)\.?$/);
  });

  it.skipIf(skip)("does not mention its training cutoff date", async () => {
    const reply = await callDeepSeek([
      baseSystemPrompt(),
      {
        role: "user",
        content: "How up-to-date is your food safety knowledge? When was your training data last updated?",
      },
    ]);

    const forbidden = [
      "training data goes up to",
      "knowledge cutoff",
      "last updated in",
      "as of my last",
      "my training",
      "cut-off",
    ];
    for (const phrase of forbidden) {
      expect(reply.toLowerCase(), `reply should not contain "${phrase}"`).not.toContain(
        phrase.toLowerCase()
      );
    }
    // Should explain the curated library approach instead
    expect(reply.toLowerCase()).toMatch(/pinkpepper|library|regulation|guidance|authority/);
  });

  it.skipIf(skip)("does not introduce itself as a generic AI assistant", async () => {
    const reply = await callDeepSeek([
      baseSystemPrompt(),
      { role: "user", content: "Who are you and what can you help me with?" },
    ]);

    // Should NOT say "I am an AI" or "language model"
    const disallowed = ["i am an ai", "i'm an ai", "language model", "large language", "i am a chatbot"];
    for (const phrase of disallowed) {
      expect(reply.toLowerCase(), `reply should not say "${phrase}"`).not.toContain(phrase);
    }
    // Should mention PinkPepper or food safety
    expect(reply.toLowerCase()).toMatch(/pinkpepper|food safety|compliance/);
  });

  it.skipIf(skip)("distinguishes UK and EU temperature control law", async () => {
    const reply = await callDeepSeek([
      baseSystemPrompt(),
      {
        role: "user",
        content:
          "What are the legal hot-holding temperature requirements for cooked food, and do they differ between the UK and EU?",
      },
    ]);

    // Should reference a temperature
    expect(reply).toMatch(/\d+\s*[°º]\s*C/i);
    // Should mention both jurisdictions
    expect(reply.toLowerCase()).toMatch(/\buk\b|united kingdom|england|wales/i);
    expect(reply.toLowerCase()).toMatch(/\beu\b|european union|europe/i);
  });

  it.skipIf(skip)("provides structured output for a HACCP CCP identification question", async () => {
    const reply = await callDeepSeek(
      [
        baseSystemPrompt(),
        {
          role: "user",
          content:
            "In a ready-to-eat sandwich production line, what are the typical Critical Control Points (CCPs) and what critical limits should be set?",
        },
      ],
      0.1,
      800
    );

    // Should mention CCP
    expect(reply.toLowerCase()).toContain("ccp");
    // Should contain structured formatting (markdown bullets or numbered list)
    expect(reply).toMatch(/[-*•]|\d+\./);
    // Should mention temperature or cooking step
    expect(reply.toLowerCase()).toMatch(/temperatur|cook|chill|metal detection/i);
  });

  it.skipIf(skip)("responds with citation format for a question backed by regulation context", async () => {
    // Inject a synthetic regulation chunk to test citation adherence
    const fakeContext = `[Source: Regulation (EC) No 852/2004, Annex II, Chapter IX]
Food businesses must ensure that food is stored at appropriate temperatures and that the cold chain is not interrupted.`;

    const reply = await callDeepSeek(
      [
        {
          role: "system",
          content: `${buildRAGSystemPrompt([], "qa")}\n\nCONTEXT DOCUMENTS:\n${fakeContext}`,
        },
        {
          role: "user",
          content: "What does EU food hygiene law say about temperature control in storage?",
        },
      ],
      0.1,
      500
    );

    // Must contain at least one [Source: ] tag — the injected context chunk must be cited
    expect(reply).toContain("[Source:");
    // The cited regulation name must appear somewhere in the reply
    expect(reply).toContain("852/2004");
  });

  it.skipIf(skip)("refuses to give a bare yes/no on a safety-critical question", async () => {
    const reply = await callDeepSeek([
      baseSystemPrompt(),
      {
        role: "user",
        content:
          "Just answer yes or no: is it safe to reheat cooked chicken that has been left at room temperature for 6 hours?",
      },
    ]);

    // Reply should NOT be a single word
    const words = reply.trim().split(/\s+/);
    expect(words.length).toBeGreaterThan(5);
    // Should mention safety context (temperature, time, risk, bacteria)
    expect(reply.toLowerCase()).toMatch(/temperatur|bacteria|risk|safe|hour|danger/i);
  });

  it.skipIf(skip)("handles an allergen control query with appropriate depth", async () => {
    const reply = await callDeepSeek(
      [
        baseSystemPrompt(),
        {
          role: "user",
          content:
            "A customer asks whether our sandwich is gluten-free. What procedure should staff follow before answering?",
        },
      ],
      0.1,
      700
    );

    // Should mention cross-contact or cross-contamination
    expect(reply.toLowerCase()).toMatch(/cross.contact|cross.contaminat/i);
    // Should reference ingredients or allergen matrix
    expect(reply.toLowerCase()).toMatch(/ingredient|allergen matrix|specification/i);
    // Should not give a flat yes/no
    const words = reply.trim().split(/\s+/);
    expect(words.length).toBeGreaterThan(20);
  });

  it.skipIf(skip)("generates a structured audit finding with NC severity for an obvious gap", async () => {
    const auditPrompt = buildVirtualAuditSystemPrompt("No regulation context found.", false);

    const reply = await callDeepSeek(
      [
        { role: "system", content: auditPrompt },
        {
          role: "user",
          content:
            "We have no written HACCP plan and no temperature monitoring records for the past 3 months.",
        },
      ],
      0.0,
      700
    );

    // Should raise at least a Major NC
    expect(reply).toMatch(/Major NC|Critical NC|Major\s+Non.Conformit|Critical\s+Non.Conformit/i);
    // Should mention HACCP
    expect(reply.toLowerCase()).toContain("haccp");
    // Should mention corrective action
    expect(reply.toLowerCase()).toMatch(/corrective|remediat|action/i);
  });

  it.skipIf(skip)("stays within scope and declines to answer unrelated questions", async () => {
    const reply = await callDeepSeek([
      baseSystemPrompt(),
      {
        role: "user",
        content: "Can you write me a Python script to scrape news websites?",
      },
    ]);

    // Should not produce code
    expect(reply).not.toMatch(/```python|import requests|BeautifulSoup/i);
    // Should redirect to food safety scope
    expect(reply.toLowerCase()).toMatch(/food safety|pinkpepper|compliance|speciali/i);
  });
});
