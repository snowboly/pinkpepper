import { describe, expect, it } from "vitest";
import { renderSopDocx } from "@/lib/documents/render-sop-docx";
import { buildSopDataFromAnswers } from "@/lib/documents/sop-generation";
import type { GeneratedDocument } from "@/lib/documents/types";

const sampleDoc: GeneratedDocument = {
  documentType: "cleaning_sop",
  title: "Cleaning and Disinfection SOP",
  documentNumber: "CL-SOP-001",
  version: "1",
  date: "2026-03-17",
  approvedBy: "QA Manager",
  scope: "All food preparation and service areas",
  sections: [
    {
      heading: "Purpose",
      content: "This SOP defines cleaning and disinfection procedures.",
    },
    {
      heading: "Scope",
      content: "Applies to all food-contact surfaces and equipment.",
    },
    {
      heading: "Procedure",
      content: "Step 1: Remove debris.",
      subsections: [
        { heading: "Two-Stage Clean", content: "Apply detergent, rinse, apply disinfectant." },
      ],
    },
  ],
  tables: [
    {
      caption: "Cleaning Frequency",
      columns: [{ header: "Area" }, { header: "Frequency" }, { header: "Responsible" }],
      rows: [
        { Area: "Worktops", Frequency: "After each task", Responsible: "Food handlers" },
        { Area: "Floors", Frequency: "Daily", Responsible: "Cleaning operative" },
      ],
    },
  ],
};

const sampleSop = buildSopDataFromAnswers("cleaning_sop", ["Green Leaf Cafe", "", "", "", ""]);

describe("renderSopDocx", () => {
  it("creates a valid DOCX file (PK zip header)", async () => {
    const buffer = Buffer.from(await renderSopDocx(sampleDoc, sampleSop));
    expect(buffer.byteLength).toBeGreaterThan(0);
    expect(buffer.subarray(0, 2).toString()).toBe("PK");
  });
});
