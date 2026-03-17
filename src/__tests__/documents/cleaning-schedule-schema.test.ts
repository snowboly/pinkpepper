import { describe, expect, it } from "vitest";
import {
  DEFAULT_DAILY_TASKS,
  DEFAULT_WEEKLY_TASKS,
  DEFAULT_MONTHLY_TASKS,
  DEFAULT_CHEMICAL_REFERENCE,
  DEFAULT_ATP_TARGETS,
} from "@/lib/documents/cleaning-schedule-schema";
import { buildCleaningScheduleDataFromAnswers } from "@/lib/documents/cleaning-schedule-generation";

describe("buildCleaningScheduleDataFromAnswers", () => {
  it("uses first answer as premises", () => {
    const data = buildCleaningScheduleDataFromAnswers(["Central Kitchen — Unit 4", "", "", "", ""]);
    expect(data.metadata.premises).toBe("Central Kitchen — Unit 4");
  });

  it("sets doc number to CL-001", () => {
    const data = buildCleaningScheduleDataFromAnswers(["Any premises"]);
    expect(data.metadata.docNo).toBe("CL-001");
  });

  it("populates default daily tasks with the fixed columns", () => {
    const data = buildCleaningScheduleDataFromAnswers(["Kitchen"]);
    expect(data.dailyTasks.length).toBeGreaterThan(0);
    const row = data.dailyTasks[0];
    expect(row).toHaveProperty("item");
    expect(row).toHaveProperty("method");
    expect(row).toHaveProperty("chemical");
    expect(row).toHaveProperty("dilution");
    expect(row).toHaveProperty("contactTime");
    expect(row).toHaveProperty("frequency");
    expect(row).toHaveProperty("responsible");
    expect(row).toHaveProperty("verification");
  });

  it("populates default weekly tasks with the fixed columns", () => {
    const data = buildCleaningScheduleDataFromAnswers(["Kitchen"]);
    expect(data.weeklyTasks.length).toBeGreaterThan(0);
    const row = data.weeklyTasks[0];
    expect(row).toHaveProperty("item");
    expect(row).toHaveProperty("method");
    expect(row).toHaveProperty("chemical");
    expect(row).toHaveProperty("dilution");
    expect(row).toHaveProperty("contactTime");
    expect(row).toHaveProperty("responsible");
    expect(row).toHaveProperty("verification");
  });

  it("populates default monthly tasks with the fixed columns", () => {
    const data = buildCleaningScheduleDataFromAnswers(["Kitchen"]);
    expect(data.monthlyTasks.length).toBeGreaterThan(0);
    const row = data.monthlyTasks[0];
    expect(row).toHaveProperty("item");
    expect(row).toHaveProperty("method");
    expect(row).toHaveProperty("chemical");
    expect(row).toHaveProperty("responsible");
    expect(row).toHaveProperty("verification");
  });
});

describe("DEFAULT_CHEMICAL_REFERENCE", () => {
  it("includes all six standard chemical reference columns", () => {
    const ref = DEFAULT_CHEMICAL_REFERENCE[0];
    expect(ref).toHaveProperty("chemicalName");
    expect(ref).toHaveProperty("product");
    expect(ref).toHaveProperty("dilution");
    expect(ref).toHaveProperty("contactTime");
    expect(ref).toHaveProperty("activeIngredient");
    expect(ref).toHaveProperty("coshhLocation");
  });
});

describe("DEFAULT_ATP_TARGETS", () => {
  it("includes high-risk food-contact target below 10 RLU", () => {
    const highRisk = DEFAULT_ATP_TARGETS.find((r) => r.surfaceCategory.includes("high-risk"));
    expect(highRisk?.pass).toBe("<10 RLU");
  });
});

describe("DEFAULT_DAILY_TASKS", () => {
  it("includes food preparation worktops", () => {
    const worktop = DEFAULT_DAILY_TASKS.find((r) => r.item.includes("worktop"));
    expect(worktop).toBeDefined();
  });
});

describe("DEFAULT_WEEKLY_TASKS", () => {
  it("includes fridge interior deep clean", () => {
    const fridge = DEFAULT_WEEKLY_TASKS.find((r) => r.item.includes("Fridge"));
    expect(fridge).toBeDefined();
  });
});

describe("DEFAULT_MONTHLY_TASKS", () => {
  it("includes deep clean of kitchen equipment", () => {
    const deepClean = DEFAULT_MONTHLY_TASKS.find((r) => r.item.includes("Deep clean"));
    expect(deepClean).toBeDefined();
  });
});
