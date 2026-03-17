import { describe, expect, it } from "vitest";
import {
  DEFAULT_CLEANING_SOP_RECORDS,
  DEFAULT_FREQUENCY_SCHEDULE,
  DEFAULT_VERIFICATION_ATP,
} from "@/lib/documents/cleaning-sop-schema";
import { buildCleaningSopDataFromAnswers } from "@/lib/documents/cleaning-sop-generation";

describe("buildCleaningSopDataFromAnswers", () => {
  it("extracts premises type from first answer", () => {
    const data = buildCleaningSopDataFromAnswers(["Restaurant kitchen", "", "", "", ""]);
    expect(data.metadata.premises).toBe("Restaurant kitchen");
  });

  it("includes surfaces info in scope", () => {
    const data = buildCleaningSopDataFromAnswers(["Bakery", "worktops, mixers, and slicers", "", "", ""]);
    expect(data.scope).toContain("worktops, mixers, and slicers");
  });

  it("includes responsible persons in scope", () => {
    const data = buildCleaningSopDataFromAnswers(["Cafe", "", "", "Head chef verifies daily", ""]);
    expect(data.scope).toContain("Head chef verifies daily");
  });

  it("sets doc number to CL-SOP-001", () => {
    const data = buildCleaningSopDataFromAnswers(["Kitchen", "", "", "", ""]);
    expect(data.metadata.docNo).toBe("CL-SOP-001");
  });

  it("populates default frequency schedule", () => {
    const data = buildCleaningSopDataFromAnswers(["Kitchen", "", "", "", ""]);
    expect(data.frequencySchedule.length).toBeGreaterThan(0);
  });
});

describe("DEFAULT_FREQUENCY_SCHEDULE", () => {
  it("covers food preparation worktops as a minimum", () => {
    const worktops = DEFAULT_FREQUENCY_SCHEDULE.find((r) => r.itemArea.includes("worktop"));
    expect(worktops).toBeDefined();
  });
});

describe("DEFAULT_VERIFICATION_ATP", () => {
  it("includes high-risk food-contact surface limits", () => {
    const highRisk = DEFAULT_VERIFICATION_ATP.find((r) => r.surfaceCategory.includes("high-risk"));
    expect(highRisk?.pass).toBe("<10 RLU");
  });
});

describe("DEFAULT_CLEANING_SOP_RECORDS", () => {
  it("includes daily cleaning sign-off record", () => {
    const signOff = DEFAULT_CLEANING_SOP_RECORDS.find((r) => r.record.includes("sign-off"));
    expect(signOff).toBeDefined();
  });
});
