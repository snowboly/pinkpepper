import { describe, expect, it } from "vitest";
import { buildLegalQueryPlan } from "@/lib/rag/legal-query";

describe("buildLegalQueryPlan", () => {
  it("parses latest amendment-chain questions", () => {
    expect(
      buildLegalQueryPlan(
        "What is the latest EU regulation that amends Implementing Regulation (EU) 2019/1793?"
      )
    ).toMatchObject({
      precisionRequired: true,
      recencyRequired: true,
      exactReferences: ["2019/1793"],
      targetInstrumentReferences: ["2019/1793"],
      relationship: "amends",
    });
  });

  it("normalizes CELEX references and requested details", () => {
    const plan = buildLegalQueryPlan(
      "For CELEX 32026R0194, cite every annex entry, control frequency, certificate and analysis report requirement."
    );

    expect(plan.celexReferences).toEqual(["32026R0194"]);
    expect(plan.exactReferences).toContain("2026/194");
    expect(plan.requestedDetails).toEqual(
      expect.arrayContaining(["annex", "control_frequency", "certificate", "analysis_report"])
    );
  });
});
