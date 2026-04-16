import { describe, expect, it } from "vitest";
import { buildVirtualAuditSystemPrompt } from "@/app/api/audit/stream/route";
import { getAuditPersona } from "@/lib/personas";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("buildVirtualAuditSystemPrompt", () => {
  it("uses a finding-first audit contract when the prompt already contains evidence", () => {
    const prompt = buildVirtualAuditSystemPrompt("No regulation context found.", false);

    expect(prompt).toContain("If the user's prompt already gives concrete observations, gaps, or non-conformities, issue findings immediately");
    expect(prompt).toContain("Finding");
    expect(prompt).toContain("Objective evidence from the user's prompt");
    expect(prompt).toContain("Immediate containment");
    expect(prompt).toContain("Corrective action");
    expect(prompt).toContain("Evidence still needed to confirm or close");
  });

  it("does not force the auditor to ask for evidence before every finding", () => {
    const prompt = buildVirtualAuditSystemPrompt("No regulation context found.", false);

    expect(prompt).not.toContain("Always ask for evidence before concluding on any area.");
    expect(prompt).toContain("Only switch into question-led evidence gathering when the user's prompt is too vague");
  });

  it("forbids claims about uploaded records when no user documents are present", () => {
    const prompt = buildVirtualAuditSystemPrompt("No regulation context found.", false);

    expect(prompt).toContain("NO DOCUMENTS UPLOADED");
    expect(prompt).toContain("Do NOT reference, cite, quote, or invent any document name, filename, PDF, spreadsheet, or uploaded record");
    expect(prompt).toContain("Inventing a document is a critical audit failure");
    expect(prompt).toContain("Do NOT invent extra facts, timestamps, records, units, or observations");
  });

  it("allows document citations only when user documents are actually present", () => {
    const prompt = buildVirtualAuditSystemPrompt("USER UPLOADED DOCUMENTS:\\n[User Document 1: sample.md]", true);

    expect(prompt).toContain("User-uploaded documents are available for this turn");
    expect(prompt).toContain("reference them by document name when used as evidence");
  });

  it("includes severity-calibration and anti-over-finding rules", () => {
    const prompt = buildVirtualAuditSystemPrompt("No regulation context found.", false);

    expect(prompt).toContain("Use severity carefully");
    expect(prompt).toContain("Minor NC");
    expect(prompt).toContain("Major NC");
    expect(prompt).toContain("Critical NC");
    expect(prompt).toContain("Do NOT raise a finding just because a document could be stronger");
    expect(prompt).toContain("Do NOT treat an apparently completed cleaning schedule as a major gap");
    expect(prompt).toContain("Do NOT backfill or assume missed checks happened");
    expect(prompt).toContain("Missing monitoring records plus an unsafe reading and no product disposition will usually justify at least Major NC");
    expect(prompt).toContain("Do NOT demand swab testing or advanced verification as a default corrective action");
  });
});

describe("audit persona", () => {
  it("uses the fixed Lead Auditor John persona for virtual audit", () => {
    const persona = getAuditPersona();

    expect(persona.name).toBe("Lead Auditor John");
    expect(persona.avatar).toBe("lead-auditor-john");
    expect(persona.promptFragment).toContain("Lead Auditor John");
  });
});

describe("audit provider routing", () => {
  it("uses deepseek-reasoner as the default auditor model and keeps Groq llama as fallback", () => {
    const routeSource = readFileSync(
      path.join(process.cwd(), "src/app/api/audit/stream/route.ts"),
      "utf8"
    );

    expect(routeSource).toContain('const primaryModel = "deepseek-reasoner"');
    expect(routeSource).toContain('const fallbackModel = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"');
    expect(routeSource).toContain('const deepseekKey = process.env.DEEPSEEK_API_KEY;');
  });
});

describe("audit source-tag hallucination guard", () => {
  it("forbids [Source: ] tags for documents not in the retrieved context block", () => {
    const prompt = buildVirtualAuditSystemPrompt("No regulation context found.", false);

    expect(prompt).toContain("Do NOT use [Source: ] tags for documents that are not present in the RETRIEVED CONTEXT block");
    expect(prompt).toContain("Never fabricate document names, template titles, or section numbers to attach a source tag to");
  });
});
