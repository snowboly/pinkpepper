import { describe, expect, it } from "vitest";

import {
  getInitialLightweightDocWizardAnswers,
  getLightweightDocWizard,
  shouldShowDocumentStarters,
} from "@/components/dashboard/document-builders/lightweight-doc-wizard";

describe("lightweight document wizard helpers", () => {
  it("hides document starters in virtual audit mode", () => {
    expect(shouldShowDocumentStarters("ask")).toBe(true);
    expect(shouldShowDocumentStarters("virtual_audit")).toBe(false);
  });

  it("seeds lightweight wizard answers from builder defaults", () => {
    expect(getInitialLightweightDocWizardAnswers("tempLog")).toMatchObject({
      businessName: "",
      createdBy: "",
      approvedBy: "",
      logType: "Fridge",
      targetRange: "0C to 4C",
      checksPerDay: "2",
      probeCount: "2",
    });
  });

  it("includes select options in lightweight wizard prompts", () => {
    const wizard = getLightweightDocWizard("tempLog");
    const prompt = wizard?.questions.find((question) => question.key === "logType")?.prompt;

    expect(prompt).toContain("Options:");
    expect(prompt).toContain("Fridge");
    expect(prompt).toContain("Freezer");
    expect(prompt).toContain("Custom");
  });

  it("includes date guidance in lightweight wizard prompts", () => {
    const wizard = getLightweightDocWizard("foodSafetyPolicy");
    const datePrompt = wizard?.questions.find((question) => question.key === "date")?.prompt;
    const reviewDatePrompt = wizard?.questions.find((question) => question.key === "reviewDate")?.prompt;

    expect(datePrompt).toContain("Use YYYY-MM-DD.");
    expect(reviewDatePrompt).toContain("Use YYYY-MM-DD.");
  });
});
