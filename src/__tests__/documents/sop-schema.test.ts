import { describe, expect, it } from "vitest";
import { getDefaultDocNo } from "@/lib/documents/sop-schema";
import { buildSopDataFromAnswers } from "@/lib/documents/sop-generation";

describe("getDefaultDocNo", () => {
  it("returns CL-SOP-001 for cleaning_sop", () => {
    expect(getDefaultDocNo("cleaning_sop")).toBe("CL-SOP-001");
  });

  it("returns PC-001 for pest_control_procedure", () => {
    expect(getDefaultDocNo("pest_control_procedure")).toBe("PC-001");
  });

  it("returns FS-POL-001 for food_safety_policy", () => {
    expect(getDefaultDocNo("food_safety_policy")).toBe("FS-POL-001");
  });

  it("falls back to SOP-001 for unknown types", () => {
    // haccp_plan is excluded from SOP path but getDefaultDocNo returns fallback
    expect(getDefaultDocNo("haccp_plan")).toBe("SOP-001");
  });
});

describe("buildSopDataFromAnswers", () => {
  it("extracts business name from first answer", () => {
    const data = buildSopDataFromAnswers("cleaning_sop", ["Harbour Cafe, Bristol", "", "", "", ""]);
    expect(data.metadata.businessName).toBe("Harbour Cafe");
  });

  it("sets the correct doc number for each SOP type", () => {
    const pestData = buildSopDataFromAnswers("pest_control_procedure", ["My Bakery"]);
    expect(pestData.metadata.docNo).toBe("PC-001");

    const wasteData = buildSopDataFromAnswers("waste_management_procedure", ["My Bakery"]);
    expect(wasteData.metadata.docNo).toBe("WM-001");
  });

  it("sets revision to 1", () => {
    const data = buildSopDataFromAnswers("food_safety_policy", ["Test Business"]);
    expect(data.metadata.revision).toBe("1");
  });

  it("carries the document type through", () => {
    const data = buildSopDataFromAnswers("traceability_procedure", ["Test Business"]);
    expect(data.documentType).toBe("traceability_procedure");
  });
});
