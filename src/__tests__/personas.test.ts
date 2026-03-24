import { describe, expect, it } from "vitest";
import { PERSONAS, getPersonaForConversation } from "@/lib/personas";

describe("personas", () => {
  it("renames Sofia to Greta", () => {
    expect(PERSONAS.map((persona) => persona.name)).toContain("Greta");
    expect(PERSONAS.map((persona) => persona.name)).not.toContain("Sofia");
  });

  it("keeps persona names unique", () => {
    expect(new Set(PERSONAS.map((persona) => persona.name)).size).toBe(PERSONAS.length);
  });

  it("gives each persona a distinct prompt contract", () => {
    const prompts = PERSONAS.map((persona) => persona.promptFragment);

    expect(prompts[0]).toContain("supportive");
    expect(prompts[1]).toContain("executive summary");
    expect(prompts[2]).toContain("numbered steps");
    expect(prompts[3]).toContain("brief analogy");
    expect(prompts[4]).toContain("not overwhelming");
  });

  it("assigns personas deterministically per conversation", () => {
    expect(getPersonaForConversation("conversation-123")).toEqual(
      getPersonaForConversation("conversation-123")
    );
  });
});
