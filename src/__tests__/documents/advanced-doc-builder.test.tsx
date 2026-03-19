import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import {
  getInitialAdvancedBuilderAnswers,
  ADVANCED_DOCUMENT_BUILDER_KEYS,
  createEmptyAdvancedBuilderRow,
  getAdvancedBuilderValidation,
  getAdvancedDocumentBuilder,
  isAdvancedDocumentBuilderKey,
} from "@/components/dashboard/document-builders/advanced-doc-builder";
import AdvancedDocumentBuilderModal from "@/components/dashboard/document-builders/AdvancedDocumentBuilderModal";

describe("advanced document builder helpers", () => {
  it("marks heavy builders as advanced", () => {
    expect(ADVANCED_DOCUMENT_BUILDER_KEYS).toEqual([
      "cleaningSchedule",
      "productDataSheet",
      "staffTrainingRecord",
      "cleaningSop",
    ]);
    expect(isAdvancedDocumentBuilderKey("cleaningSchedule")).toBe(true);
    expect(isAdvancedDocumentBuilderKey("tempLog")).toBe(false);
  });

  it("returns builder definitions for advanced documents", () => {
    const definition = getAdvancedDocumentBuilder("productDataSheet");

    expect(definition?.documentType).toBe("product_data_sheet");
    expect(
      definition?.sections.some((section) =>
        section.fields.some((field) => field.type === "rows"),
      ),
    ).toBe(true);
  });

  it("creates empty row objects from the builder row definitions", () => {
    expect(createEmptyAdvancedBuilderRow("chemicalReference")).toEqual({
      chemicalName: "",
      product: "",
      dilution: "",
      contactTime: "",
      activeIngredient: "",
      coshhLocation: "",
    });
  });

  it("reports missing required scalar fields for advanced builders", () => {
    const result = getAdvancedBuilderValidation("cleaningSchedule", {
      businessName: "",
      approvedBy: "",
      reviewDate: "",
    });

    expect(result.isValid).toBe(false);
    expect(result.missingRequiredFields).toEqual([
      "businessName",
      "approvedBy",
      "reviewDate",
    ]);
  });

  it("accepts valid cleaning schedule metadata without requiring rows", () => {
    const result = getAdvancedBuilderValidation("cleaningSchedule", {
      businessName: "PinkPepper Kitchen",
      approvedBy: "Ops Manager",
      reviewDate: "2026-12-31",
    });

    expect(result.isValid).toBe(true);
  });

  it("requires an induction date when staff induction is marked as completed", () => {
    const result = getAdvancedBuilderValidation("staffTrainingRecord", {
      businessName: "PinkPepper Kitchen",
      date: "2026-03-19",
      approvedBy: "Ops Manager",
      employeeName: "Ana Costa",
      jobRole: "Chef",
      department: "Kitchen",
      startDate: "2026-03-01",
      inductionCompleted: "Yes",
      inductionDate: "",
    });

    expect(result.isValid).toBe(false);
    expect(result.missingRequiredFields).toContain("inductionDate");
  });

  it("seeds cleaning schedule with default row content", () => {
    const answers = getInitialAdvancedBuilderAnswers("cleaningSchedule");

    expect(Array.isArray(answers.chemicalReference)).toBe(true);
    expect((answers.chemicalReference as Array<Record<string, string>>).length).toBeGreaterThan(0);
    expect(Array.isArray(answers.dailyTasks)).toBe(true);
    expect(Array.isArray(answers.weeklyTasks)).toBe(true);
    expect(Array.isArray(answers.monthlyTasks)).toBe(true);
    expect(Array.isArray(answers.atpTargets)).toBe(true);
  });

  it("leaves non-cleaning-schedule heavy row sections empty by default", () => {
    const answers = getInitialAdvancedBuilderAnswers("productDataSheet");

    expect(answers.nutritionRows).toEqual([]);
    expect(answers.microbiologyRows).toEqual([]);
  });

  it("renders advanced builder sections and row controls", () => {
    const definition = getAdvancedDocumentBuilder("cleaningSchedule");

    const html = renderToStaticMarkup(
      <AdvancedDocumentBuilderModal
        open
        definition={definition ?? null}
        answers={{}}
        loading={false}
        error={null}
        onClose={() => {}}
        onChange={() => {}}
        onSubmit={() => {}}
      />,
    );

    expect(html).toContain("Cleaning schedule");
    expect(html).toContain("Document metadata");
    expect(html).toContain("Chemical reference");
    expect(html).toContain("Add row");
  });

  it("renders empty-state guidance for row sections without rows", () => {
    const definition = getAdvancedDocumentBuilder("productDataSheet");

    const html = renderToStaticMarkup(
      <AdvancedDocumentBuilderModal
        open
        definition={definition ?? null}
        answers={{
          businessName: "PinkPepper",
          date: "2026-03-19",
          approvedBy: "Ops Manager",
          productName: "Soup",
          productCode: "S1",
          category: "Ready meal",
          description: "Tomato soup",
          countryOfOrigin: "Portugal",
          ingredients: "Tomatoes",
          storageConditions: "Keep chilled",
          shelfLifeUnopened: "3 days",
          nutritionRows: [],
          microbiologyRows: [],
        }}
        loading={false}
        error={null}
        onClose={() => {}}
        onChange={() => {}}
        onSubmit={() => {}}
      />,
    );

    expect(html).toContain("No rows added yet");
    expect(html).toContain("Add nutrition values if you want them included in the exported sheet.");
  });

  it("disables generate when required scalar fields are missing", () => {
    const definition = getAdvancedDocumentBuilder("cleaningSchedule");

    const html = renderToStaticMarkup(
      <AdvancedDocumentBuilderModal
        open
        definition={definition ?? null}
        answers={{}}
        loading={false}
        error={null}
        onClose={() => {}}
        onChange={() => {}}
        onSubmit={() => {}}
      />,
    );

    expect(html).toContain("Generate document");
    expect(html).toContain("disabled");
  });

  it("renders document-specific modal guidance", () => {
    const definition = getAdvancedDocumentBuilder("cleaningSop");

    const html = renderToStaticMarkup(
      <AdvancedDocumentBuilderModal
        open
        definition={definition ?? null}
        answers={{
          businessName: "PinkPepper",
          date: "2026-03-19",
          approvedBy: "Ops Manager",
          reviewDate: "2026-12-31",
          premises: "Main kitchen",
          cleaningOwner: "Kitchen team",
          verificationOwner: "Supervisor",
          surfacesCovered: "Prep tables and sinks",
          chemicals: [],
          records: [],
        }}
        loading={false}
        error={null}
        onClose={() => {}}
        onChange={() => {}}
        onSubmit={() => {}}
      />,
    );

    expect(html).toContain("Capture responsibilities, chemicals, records, and working instructions in one structured SOP flow.");
  });
});
