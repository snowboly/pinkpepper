import { describe, expect, it } from "vitest";
import { buildHaccpWizardDefinition } from "@/lib/documents/haccp-wizard";

describe("buildHaccpWizardDefinition", () => {
  it("starts with editable document metadata questions", () => {
    const wizard = buildHaccpWizardDefinition();

    expect(wizard.questions[0]?.key).toBe("companyName");
    expect(wizard.questions[1]?.key).toBe("version");
    expect(wizard.questions[2]?.key).toBe("date");
  });

  it("collects process steps before hazard rows", () => {
    const wizard = buildHaccpWizardDefinition();
    const keys = wizard.questions.map((question) => question.key);

    expect(keys.indexOf("processSteps")).toBeLessThan(keys.indexOf("hazards"));
  });

  it("collects CCP details only conditionally", () => {
    const wizard = buildHaccpWizardDefinition();

    expect(wizard.conditionalSections).toContain("ccpDetails");
  });

  it("provides example help for operational questions", () => {
    const wizard = buildHaccpWizardDefinition();
    const processSteps = wizard.questions.find((question) => question.key === "processSteps");
    const hazards = wizard.questions.find((question) => question.key === "hazards");

    expect(processSteps?.prompt).toContain("Example:");
    expect(hazards?.prompt).toContain("Example:");
  });
});
