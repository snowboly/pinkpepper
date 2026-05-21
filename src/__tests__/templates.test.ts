import { describe, expect, it } from "vitest";
import { getGroupedTemplates, TEMPLATES } from "@/lib/templates";

describe("getGroupedTemplates", () => {
  it("sorts categories and template titles alphabetically", () => {
    const grouped = getGroupedTemplates();

    expect(grouped.map((group) => group.category)).toEqual([
      "Allergen",
      "Cleaning",
      "HACCP",
      "Monitoring",
      "Supplier",
      "Traceability",
      "Training",
    ]);

    expect(grouped.find((group) => group.category === "HACCP")?.templates.map((template) => template.title)).toEqual([
      "Corrective action log",
      "Customer complaint log",
      "HACCP hazards register",
      "HACCP step descriptions",
      "Product recall procedure",
    ]);

    expect(grouped.find((group) => group.category === "Monitoring")?.templates.map((template) => template.title)).toEqual([
      "Equipment calibration log",
      "Food safety opening and closing checklist",
      "Pest control log",
      "Temperature monitoring log",
      "Waste management log",
      "Waste management SOP",
    ]);
  });

  it("supports alternate storage names for templates whose object key differs from the slug", () => {
    expect(TEMPLATES.find((template) => template.slug === "haccp-plan-template_hazzards")).toMatchObject({
      storageName: "haccp-plan-template_hazards",
    });

    expect(TEMPLATES.find((template) => template.slug === "food-safety-opening-and-closing-checklist")).toMatchObject({
      storageName: "Food Safety Opening and Closing Checklist",
      fileType: "xlsx",
    });
  });
});
