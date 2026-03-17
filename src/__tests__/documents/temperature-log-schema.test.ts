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
import {
  buildTemperatureLogDataFromAnswers,
  buildTemperatureLogDataFromBuilder,
} from "@/lib/documents/temperature-log-generation";

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

describe("buildTemperatureLogDataFromBuilder", () => {
  it("maps structured builder fields into the temperature log document data", () => {
    const data = buildTemperatureLogDataFromBuilder({
      businessName: "PinkPepper Cafe",
      createdBy: "Joao",
      approvedBy: "Maria",
      logType: "Fridge",
      targetRange: "0C to 4C",
      unitId: "Walk-in chiller 1",
      checksPerDay: "2",
      probeCount: "2",
      probeLocation: "Top and bottom shelf",
      month: "March",
      year: "2026",
    });

    expect(data.metadata.premises).toBe("PinkPepper Cafe");
    expect(data.metadata.createdBy).toBe("Joao");
    expect(data.metadata.approvedBy).toBe("Maria");
    expect(data.metadata.targetRange).toBe("0C to 4C");
    expect(data.metadata.unitId).toBe("Walk-in chiller 1");
    expect(data.metadata.probeLocation).toBe("Top and bottom shelf");
    expect(data.metadata.checksPerDay).toBe(2);
    expect(data.metadata.probeCount).toBe(2);
    expect(data.metadata.month).toBe("March");
    expect(data.metadata.year).toBe("2026");
  });

  it("keeps the approved fridge preset when the builder uses fridge mode", () => {
    const data = buildTemperatureLogDataFromBuilder({
      businessName: "PinkPepper Cafe",
      createdBy: "Joao",
      approvedBy: "Maria",
      logType: "Fridge",
      targetRange: "",
      unitId: "Display fridge",
      checksPerDay: "1",
      probeCount: "1",
      probeLocation: "Centre shelf",
      month: "March",
      year: "2026",
    });

    expect(data.metadata.targetRange).toBe("0C to 4C");
  });
});
