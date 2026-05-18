import { describe, expect, it } from "vitest";
import { getGroupedTemplates } from "@/lib/templates";

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
      "Corrective Action Log Template",
      "Customer Complaint Log Template",
      "HACCP Hazards Register Template",
      "HACCP Step Descriptions Template",
      "Product Recall Procedure Template",
    ]);
  });
});
