import { describe, expect, it } from "vitest";
import { renderCleaningScheduleDocx } from "@/lib/documents/render-cleaning-schedule-docx";
import { buildCleaningScheduleDataFromAnswers } from "@/lib/documents/cleaning-schedule-generation";

const sample = buildCleaningScheduleDataFromAnswers([
  "Green Leaf Restaurant — Commercial Kitchen",
  "Worktops, fridges, floors, drains, waste bins",
  "Daily, weekly, monthly",
  "Head chef performs daily; manager verifies weekly",
  "Daily cleaning log, ATP swab records",
]);

describe("renderCleaningScheduleDocx", () => {
  it("creates a valid DOCX file (PK zip header)", async () => {
    const buffer = Buffer.from(await renderCleaningScheduleDocx(sample));
    expect(buffer.byteLength).toBeGreaterThan(0);
    expect(buffer.subarray(0, 2).toString()).toBe("PK");
  });
});
