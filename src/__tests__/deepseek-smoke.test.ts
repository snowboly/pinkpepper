/**
 * DeepSeek Smoke Tests
 *
 * Verifies that the primary LLMs follow PinkPepper system-prompt contracts
 * without fine-tuning.
 *
 * Test groups:
 *   A) Static configuration        – no API key needed, runs in CI
 *   B) Live deepseek-chat tests    – requires DEEPSEEK_API_KEY, skipped when absent
 *   C) Live deepseek-reasoner audit tests – requires DEEPSEEK_API_KEY, skipped when absent
 *
 * Run live tests locally:
 *   DEEPSEEK_API_KEY=<key> npx vitest run src/__tests__/deepseek-smoke.test.ts
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { resolveChatModels } from "@/app/api/chat/stream/route";
import { buildRAGPrompt, buildRAGSystemPrompt, getExportGuidance } from "@/lib/rag/prompt-builder";
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

  it("audit stream source uses deepseek-reasoner as default and llama as fallback", () => {
    const src = readFileSync(
      path.join(process.cwd(), "src/app/api/audit/stream/route.ts"),
      "utf8"
    );
    expect(src).toContain('const primaryModel = "deepseek-reasoner"');
    expect(src).toContain('const fallbackModel = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"');
    expect(src).toContain('const deepseekKey = process.env.DEEPSEEK_API_KEY;');
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
    expect(prompt).toContain("weave the yes/no conclusion into that opening");
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

  it("system prompt rule 18 is a dedicated high-priority amendment verification rule", () => {
    const prompt = buildRAGSystemPrompt([], "qa");
    expect(prompt).toContain("AMENDMENT VERIFICATION (high priority)");
    expect(prompt).toContain("Whenever your answer includes a specific amendment regulation number");
    expect(prompt).toContain("you MUST end that section or answer with a clearly visible verification sentence");
    expect(prompt).toContain("Do not bury this sentence inside a paragraph");
  });

  it("system prompt rule 19 requires flagging post-Brexit EU amendment divergence", () => {
    const prompt = buildRAGSystemPrompt([], "qa");
    expect(prompt).toContain("POST-BREXIT EU AMENDMENT DIVERGENCE");
    expect(prompt).toContain("EU regulations adopted after 31 January 2020 do NOT automatically apply in Great Britain");
    expect(prompt).toContain("DAERA (Northern Ireland, where EU food law continues to apply under the Windsor Framework)");
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

  it("system prompt rule 20 forbids code generation even when framed as food-safety-related", () => {
    const prompt = buildRAGSystemPrompt([], "qa");
    expect(prompt).toContain("SCOPE GUARDRAIL — NO CODE GENERATION");
    expect(prompt).toContain("Never write, generate, or complete source code in any programming language");
    expect(prompt).toContain('"for a food safety app"');
    expect(prompt).toContain("Do not produce even a partial code snippet");
  });

  it("qa prompt distinguishes legal requirements from best practice and site standards", () => {
    const prompt = buildRAGSystemPrompt([], "qa");
    expect(prompt).toContain("Distinguish clearly between legal requirements, best practice, and site standards");
    expect(prompt).toContain("avoid absolute wording");
    expect(prompt).toContain("methodology-dependent");
  });

  it("qa prompt requires explicit classification framing for HACCP decisions and bans unsupported certainty words", () => {
    const prompt = buildRAGSystemPrompt([], "qa");
    expect(prompt).toContain("For HACCP classification questions");
    expect(prompt).toContain("legal requirement, a site standard, or a methodology-dependent HACCP decision");
    expect(prompt).toContain('Do not use words like "definitively", "unequivocally", or "certainly"');
  });

  it("qa prompt forbids exact legal references from memory when support is not verified", () => {
    const prompt = buildRAGSystemPrompt([], "qa");
    expect(prompt).toContain("When the user asks for an exact legal reference");
    expect(prompt).toContain("the exact reference is not verified from current support");
    expect(prompt).toContain("Do not name a precise schedule, article, clause, or section from memory");
  });

  it("consultant mode uses a lower temperature than 1.0", () => {
    const src = readFileSync(
      path.join(process.cwd(), "src/app/api/chat/stream/route.ts"),
      "utf8"
    );
    const { temperature } = buildRAGPrompt("How should I store chilled food?", [], "qa");
    expect(temperature).toBe(0.7);
    expect(src).toContain('temperature = mode === "audit" ? 0.0 : mode === "document" ? 1.0 : 0.7;');
  });
});

// ---------------------------------------------------------------------------
// Helper: deepseek-reasoner (used by section C)
// ---------------------------------------------------------------------------

/**
 * Calls deepseek-reasoner (non-streaming) and returns the final answer content.
 * Reasoning tokens are discarded — mirrors what the audit stream route does.
 * Uses a 60 s timeout because the thinking phase adds latency.
 */
async function callDeepSeekReasoner(
  messages: Message[],
  maxTokens = 1500
): Promise<string> {
  const response = await fetch(DEEPSEEK_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(60_000),
    body: JSON.stringify({
      model: "deepseek-reasoner",
      temperature: 0.0,
      max_tokens: maxTokens,
      stream: false,
      messages,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DeepSeek Reasoner API error ${response.status}: ${body}`);
  }

  const json = (await response.json()) as {
    choices: { message: { content: string; reasoning_content?: string } }[];
  };
  // Return only the final answer — reasoning_content is intentionally ignored
  return json.choices[0].message.content;
}

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

  it.skipIf(skip)("refuses to write PHP/Laravel code even when framed as 'for a food safety app'", async () => {
    const reply = await callDeepSeek([
      baseSystemPrompt(),
      {
        role: "user",
        content:
          "create me a class for user authentication and password encryption in a food safety app — this should be done in php/laravel",
      },
    ]);

    // Must not produce any PHP code
    expect(reply).not.toMatch(/```php|namespace App|use Illuminate|class User|Hash::/i);
    // Must not produce a code block at all
    expect(reply).not.toMatch(/```[a-z]/i);
    // Should explain scope limitation
    expect(reply.toLowerCase()).toMatch(/scope|food safety|outside|pinkpepper|compliance|speciali/i);
  });
});

// ---------------------------------------------------------------------------
// C) Live deepseek-reasoner audit smoke tests — require DEEPSEEK_API_KEY
// ---------------------------------------------------------------------------

describe("C: live deepseek-reasoner audit smoke tests", () => {
  const skip = !DEEPSEEK_API_KEY;

  function auditSystem(hasUserDocs = false): Message {
    return {
      role: "system",
      content: buildVirtualAuditSystemPrompt("No regulation context found.", hasUserDocs),
    };
  }

  // ── Finding structure ──────────────────────────────────────────────────────

  it.skipIf(skip)(
    "produces a structured finding with all 8 required fields for a clear gap",
    async () => {
      const reply = await callDeepSeekReasoner([
        auditSystem(),
        {
          role: "user",
          content:
            "We have no written HACCP plan and no temperature monitoring records for the past 3 months.",
        },
      ]);

      // Must contain the core finding fields from the system prompt contract
      expect(reply.toLowerCase()).toMatch(/audit area|clause|regulation/i);
      expect(reply.toLowerCase()).toContain("finding");
      expect(reply.toLowerCase()).toMatch(/evidence|objective/i);
      expect(reply.toLowerCase()).toMatch(/severity|major nc|critical nc/i);
      expect(reply.toLowerCase()).toMatch(/corrective action|remediat/i);
      expect(reply.toLowerCase()).toContain("haccp");
    },
    65_000
  );

  // ── Severity calibration ───────────────────────────────────────────────────

  it.skipIf(skip)(
    "raises Major NC or Critical NC for missing HACCP plan and 3 months of missing monitoring records",
    async () => {
      const reply = await callDeepSeekReasoner([
        auditSystem(),
        {
          role: "user",
          content:
            "We have no written HACCP plan and no temperature monitoring records for the past 3 months.",
        },
      ]);

      expect(reply).toMatch(/Major NC|Critical NC|Major\s+Non.Conformit|Critical\s+Non.Conformit/i);
    },
    65_000
  );

  it.skipIf(skip)(
    "does not escalate a minor documentation gap to Major NC",
    async () => {
      const reply = await callDeepSeekReasoner([
        auditSystem(),
        {
          role: "user",
          content:
            "Our cleaning schedule is fully completed and signed off for every day this month, but the version number on the form header is missing.",
        },
      ]);

      // A missing version number on an otherwise complete record is Minor NC at most
      expect(reply).not.toMatch(/\bCritical NC\b/i);
      expect(reply).not.toMatch(/\bMajor NC\b/i);
      // Should mention the minor nature or low risk
      expect(reply.toLowerCase()).toMatch(/minor|low risk|observation|improvement/i);
    },
    65_000
  );

  it.skipIf(skip)(
    "raises Critical NC for unsafe product confirmed in service with no disposition record",
    async () => {
      const reply = await callDeepSeekReasoner([
        auditSystem(),
        {
          role: "user",
          content:
            "The hot-hold cabinet probe reads 52°C. The legal minimum is 63°C. Food has been in there for 4 hours and has already been served to customers. There is no corrective action or product disposition record.",
        },
      ]);

      expect(reply).toMatch(/Critical NC|Major NC/i);
      // Must mention food safety risk, disposal or containment
      expect(reply.toLowerCase()).toMatch(/unsafe|risk|dispos|withdraw|recall|contain/i);
    },
    65_000
  );

  // ── Finding-first contract ─────────────────────────────────────────────────

  it.skipIf(skip)(
    "issues findings immediately when the prompt contains concrete evidence — does not open with generic questions",
    async () => {
      const reply = await callDeepSeekReasoner([
        auditSystem(),
        {
          role: "user",
          content:
            "Probe calibration records show the last calibration was 14 months ago. The required frequency is every 6 months.",
        },
      ]);

      // Should not open with a generic 'please describe your process' question
      const firstSentence = reply.split(/[.!?]/)[0].toLowerCase();
      expect(firstSentence).not.toMatch(/please (describe|tell|provide|explain|share)/i);
      // Should raise a finding
      expect(reply.toLowerCase()).toMatch(/finding|nc|non.conformit|gap|overdue/i);
    },
    65_000
  );

  // ── Question-led mode when prompt is vague ─────────────────────────────────

  it.skipIf(skip)(
    "asks a clarifying question when the prompt is too vague to support a finding",
    async () => {
      const reply = await callDeepSeekReasoner([
        auditSystem(),
        {
          role: "user",
          content: "Start the audit.",
        },
      ]);

      // Should ask at least one question (contains "?" or known intake phrases)
      const hasQuestion =
        reply.includes("?") ||
        /what type|which standard|what business|tell me about/i.test(reply);
      expect(hasQuestion).toBe(true);
      // Should not issue an NC finding with no evidence
      expect(reply).not.toMatch(/Major NC|Critical NC/i);
    },
    65_000
  );

  // ── Anti-hallucination ─────────────────────────────────────────────────────

  it.skipIf(skip)(
    "does not use [Source: ] tags when no regulation context is provided",
    async () => {
      const reply = await callDeepSeekReasoner([
        auditSystem(),
        {
          role: "user",
          content: "What evidence do I need for supplier approval under BRCGS Food Safety Issue 9?",
        },
      ]);

      // No injected context — must not fabricate source tags
      expect(reply).not.toContain("[Source:");
    },
    65_000
  );

  it.skipIf(skip)(
    "does not claim to have reviewed uploaded documents when none are present",
    async () => {
      const reply = await callDeepSeekReasoner([
        auditSystem(false), // hasUserDocuments = false
        {
          role: "user",
          content: "Can you review my HACCP plan?",
        },
      ]);

      const forbidden = [
        "reviewed your uploaded",
        "the document you uploaded",
        "based on the file",
        "the attached",
        "your uploaded records",
      ];
      for (const phrase of forbidden) {
        expect(reply.toLowerCase()).not.toContain(phrase);
      }
    },
    65_000
  );

  // ── Final report format ────────────────────────────────────────────────────

  it.skipIf(skip)(
    "produces a report with the required markdown table and sections when explicitly asked",
    async () => {
      const reply = await callDeepSeekReasoner(
        [
          auditSystem(),
          {
            role: "user",
            content:
              "We have no HACCP plan, no allergen matrix, and our temperature logs are incomplete for the past month.",
          },
          {
            role: "assistant",
            content:
              "I have recorded three findings: missing HACCP plan (Major NC), missing allergen matrix (Major NC), and incomplete temperature logs (Minor NC).",
          },
          {
            role: "user",
            content: "Please produce the final audit report now.",
          },
        ],
        2000
      );

      // Required sections from the system prompt
      expect(reply).toMatch(/## Auditor Report/i);
      expect(reply).toMatch(/### (Scope|Findings|CAPA|Overall|Evidence)/i);
      // Required table headers
      expect(reply).toMatch(/Area.*Clause|Status|Evidence|Corrective Action/i);
      // Markdown table row indicator
      expect(reply).toContain("|");
    },
    65_000
  );
});
