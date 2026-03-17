import { describe, expect, it } from "vitest";
import {
  DEFAULT_ILLNESS_REPORTING,
  DEFAULT_MONITORING,
  DEFAULT_PROTECTIVE_CLOTHING,
} from "@/lib/documents/hygiene-schema";
import { buildHygienePolicyDataFromAnswers } from "@/lib/documents/hygiene-generation";

describe("buildHygienePolicyDataFromAnswers", () => {
  it("extracts business name from first answer", () => {
    const data = buildHygienePolicyDataFromAnswers(["Burger Joint, London", "5 food handlers", "", ""]);
    expect(data.metadata.businessName).toBe("Burger Joint");
  });

  it("includes staff description in scope", () => {
    const data = buildHygienePolicyDataFromAnswers(["Test Cafe", "3 chefs and 2 servers", "", ""]);
    expect(data.scope).toContain("3 chefs and 2 servers");
  });

  it("populates default protective clothing table", () => {
    const data = buildHygienePolicyDataFromAnswers(["Bakery", "", "", ""]);
    expect(data.protectiveClothing.length).toBeGreaterThan(0);
    expect(data.protectiveClothing[0]).toHaveProperty("item");
    expect(data.protectiveClothing[0]).toHaveProperty("requirement");
  });

  it("populates default illness reporting table with exclusion rules", () => {
    const data = buildHygienePolicyDataFromAnswers(["Test Cafe", "", "", ""]);
    const vomiting = data.illnessReporting.find((r) => r.symptomCondition === "Vomiting");
    expect(vomiting?.action).toContain("48 hours");
  });

  it("sets doc number to PH-001", () => {
    const data = buildHygienePolicyDataFromAnswers(["Cafe", "", "", ""]);
    expect(data.metadata.docNo).toBe("PH-001");
  });
});

describe("DEFAULT_ILLNESS_REPORTING", () => {
  it("includes all major exclusion conditions", () => {
    const conditions = DEFAULT_ILLNESS_REPORTING.map((r) => r.symptomCondition);
    expect(conditions).toContain("Vomiting");
    expect(conditions).toContain("Diarrhoea");
    expect(conditions).toContain("Jaundice");
  });
});

describe("DEFAULT_PROTECTIVE_CLOTHING", () => {
  it("includes standard food handler PPE items", () => {
    const items = DEFAULT_PROTECTIVE_CLOTHING.map((r) => r.item);
    expect(items).toContain("Clean uniform / whites");
    expect(items).toContain("Hair covering");
  });
});

describe("DEFAULT_MONITORING", () => {
  it("includes shift-frequency visual hygiene checks", () => {
    const shiftCheck = DEFAULT_MONITORING.find((r) => r.frequency === "Every shift");
    expect(shiftCheck).toBeDefined();
  });
});
