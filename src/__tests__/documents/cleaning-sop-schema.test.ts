import { describe, expect, it } from "vitest";
import {
  DEFAULT_CLEANING_SOP_RECORDS,
  DEFAULT_FREQUENCY_SCHEDULE,
  DEFAULT_VERIFICATION_ATP,
} from "@/lib/documents/cleaning-sop-schema";
import {
  buildCleaningSopDataFromAnswers,
  buildCleaningSopDataFromBuilder,
} from "@/lib/documents/cleaning-sop-generation";

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

describe("buildCleaningSopDataFromBuilder", () => {
  it("maps structured cleaning SOP fields into the dedicated schema", () => {
    const data = buildCleaningSopDataFromBuilder({
      businessName: "PinkPepper Foods",
      approvedBy: "Operations Manager",
      reviewDate: "2026-12-31",
      premises: "Main kitchen",
      scope: "Cleaning and disinfection of food-contact surfaces and equipment",
      responsibleRole: "Kitchen staff on shift",
      verificationRole: "Shift supervisor",
      chemicals: [
        {
          chemical: "Surface sanitiser",
          purpose: "Food-contact disinfection",
          dilution: "1:50",
          contactTime: "30 sec",
          activeIngredient: "QAC",
        },
      ],
      frequencySchedule: [
        {
          itemArea: "Prep tables",
          method: "Two-stage clean",
          frequency: "After use",
          responsible: "Kitchen porter",
        },
      ],
      corrective: [
        "Re-clean and re-verify before service resumes",
      ],
      records: [
        {
          record: "Cleaning sign-off log",
          location: "Kitchen folder",
          retention: "3 months",
        },
      ],
    });

    expect(data.metadata.businessName).toBe("PinkPepper Foods");
    expect(data.metadata.approvedBy).toBe("Operations Manager");
    expect(data.metadata.reviewDate).toBe("2026-12-31");
    expect(data.metadata.premises).toBe("Main kitchen");
    expect(data.scope).toContain("food-contact surfaces");
    expect(data.scope).toContain("Kitchen staff on shift");
    expect(data.scope).toContain("Shift supervisor");
    expect(data.chemicals).toHaveLength(1);
    expect(data.frequencySchedule).toHaveLength(1);
    expect(data.corrective).toEqual(["Re-clean and re-verify before service resumes"]);
    expect(data.records).toHaveLength(1);
  });

  it("falls back to default SOP tables only when structured sections are omitted", () => {
    const data = buildCleaningSopDataFromBuilder({
      businessName: "PinkPepper Foods",
      approvedBy: "Operations Manager",
      reviewDate: "",
      premises: "Main kitchen",
      scope: "Cleaning and disinfection of food-contact surfaces and equipment",
      responsibleRole: "",
      verificationRole: "",
      chemicals: [],
      frequencySchedule: [],
      corrective: [],
      records: [],
    });

    expect(data.chemicals).not.toEqual([]);
    expect(data.frequencySchedule).toEqual(DEFAULT_FREQUENCY_SCHEDULE);
    expect(data.verificationAtp).toEqual(DEFAULT_VERIFICATION_ATP);
    expect(data.records).toEqual(DEFAULT_CLEANING_SOP_RECORDS);
  });
});
