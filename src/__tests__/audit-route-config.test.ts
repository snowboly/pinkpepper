import { describe, expect, it } from "vitest";
import { buildVirtualAuditSystemPrompt } from "@/app/api/audit/stream/route";

describe("buildVirtualAuditSystemPrompt", () => {
  it("uses a finding-first audit contract when the prompt already contains evidence", () => {
    const prompt = buildVirtualAuditSystemPrompt("No regulation context found.");

    expect(prompt).toContain("If the user's prompt already gives concrete observations, gaps, or non-conformities, issue findings immediately");
    expect(prompt).toContain("Finding");
    expect(prompt).toContain("Objective evidence from the user's prompt");
    expect(prompt).toContain("Immediate containment");
    expect(prompt).toContain("Corrective action");
    expect(prompt).toContain("Evidence still needed to confirm or close");
  });

  it("does not force the auditor to ask for evidence before every finding", () => {
    const prompt = buildVirtualAuditSystemPrompt("No regulation context found.");

    expect(prompt).not.toContain("Always ask for evidence before concluding on any area.");
    expect(prompt).toContain("Only switch into question-led evidence gathering when the user's prompt is too vague");
  });
});
