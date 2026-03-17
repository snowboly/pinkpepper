import { describe, it, expect } from "vitest";
import {
  type TemperatureLogData,
  DEFAULT_TARGET_RANGE,
  DEFAULT_CHECKS_PER_DAY,
  DEFAULT_PROBE_COUNT,
  todayIso,
  currentMonth,
  currentYear,
} from "@/lib/documents/temperature-log-schema";
import { buildTemperatureLogDataFromAnswers } from "@/lib/documents/temperature-log-generation";

describe("temperature-log-schema", () => {
  it("defaults: checksPerDay=2, probeCount=2", () => {
    expect(DEFAULT_CHECKS_PER_DAY).toBe(2);
    expect(DEFAULT_PROBE_COUNT).toBe(2);
  });

  it("DEFAULT_TARGET_RANGE contains fridge and freezer reference", () => {
    expect(DEFAULT_TARGET_RANGE).toContain("fridge");
    expect(DEFAULT_TARGET_RANGE).toContain("freezer");
  });

  it("todayIso returns ISO date string", () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("currentMonth returns non-empty string", () => {
    expect(currentMonth().length).toBeGreaterThan(0);
  });

  it("currentYear returns 4-digit year string", () => {
    expect(currentYear()).toMatch(/^\d{4}$/);
  });
});

describe("buildTemperatureLogDataFromAnswers", () => {
  const data: TemperatureLogData = buildTemperatureLogDataFromAnswers(["Seaside Bistro"]);

  it("extracts premises from first answer", () => {
    expect(data.metadata.premises).toBe("Seaside Bistro");
  });

  it("sets docNo to TL-001", () => {
    expect(data.metadata.docNo).toBe("TL-001");
  });

  it("sets revision to 1", () => {
    expect(data.metadata.revision).toBe("1");
  });

  it("sets checksPerDay from default", () => {
    expect(data.metadata.checksPerDay).toBe(DEFAULT_CHECKS_PER_DAY);
  });

  it("sets probeCount from default", () => {
    expect(data.metadata.probeCount).toBe(DEFAULT_PROBE_COUNT);
  });

  it("sets issueDate to ISO date", () => {
    expect(data.metadata.issueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("handles missing answers gracefully", () => {
    const d = buildTemperatureLogDataFromAnswers([]);
    expect(d.metadata.premises).toBe("");
    expect(d.metadata.docNo).toBe("TL-001");
  });
});
