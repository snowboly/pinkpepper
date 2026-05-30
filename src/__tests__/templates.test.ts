import { describe, expect, it } from "vitest";
import { getGroupedTemplates, TEMPLATES } from "@/lib/templates";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

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
      "Hazard analysis template",
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

  it("surfaces the hazard analysis template in the registry and resources hub", () => {
    expect(TEMPLATES.find((template) => template.slug === "hazard-analysis-template")).toMatchObject({
      title: "Hazard analysis template",
      category: "HACCP",
    });

    const resourcesPage = readPage("src/app/resources/page.tsx");
    expect(resourcesPage).toContain('href: "/resources/hazard-analysis-template"');
    expect(resourcesPage).toContain("What to include in a hazard analysis worksheet before you turn it into a business-specific HACCP document.");
  });

  it("surfaces the supplier registration log in the registry and resources hub", () => {
    expect(TEMPLATES.find((template) => template.slug === "supplier-registration-log")).toMatchObject({
      title: "Supplier registration log",
      category: "Supplier",
      fileType: "xlsx",
      storageName: "supplier-registration-template",
    });

    const resourcesPage = readPage("src/app/resources/page.tsx");
    expect(resourcesPage).toContain('href: "/resources/supplier-registration-log"');
    expect(resourcesPage).toContain("A supplier tracker for approval status, review dates, product scope, and due-diligence follow-up.");
  });

  it("keeps the core HACCP cluster linked together", () => {
    const haccpTemplatePage = readPage("src/app/resources/haccp-plan-template/page.tsx");
    const haccpGeneratorPage = readPage("src/app/features/haccp-plan-generator/page.tsx");

    expect(haccpTemplatePage).toContain('href: "/resources/hazard-analysis-template"');
    expect(haccpTemplatePage).toContain('href: "/features/haccp-plan-generator"');

    expect(haccpGeneratorPage).toContain('href="/resources/haccp-plan-template"');
    expect(haccpGeneratorPage).toContain('href="/resources/hazard-analysis-template"');
    expect(haccpGeneratorPage).toContain('href: "/articles/how-to-perform-a-hazard-analysis-correctly"');
  });

  it("keeps the monitoring and corrective-action clusters linked together", () => {
    const monitoringTemplatePage = readPage("src/app/resources/temperature-monitoring-log-template/page.tsx");
    const correctiveActionPage = readPage("src/app/resources/corrective-action-log-template/page.tsx");
    const sopGeneratorPage = readPage("src/app/features/food-safety-sop-generator/page.tsx");

    expect(monitoringTemplatePage).toContain('href: "/features/food-safety-sop-generator"');
    expect(monitoringTemplatePage).toContain('href: "/resources/food-safety-opening-and-closing-checklist"');
    expect(monitoringTemplatePage).toContain('href: "/articles/temperature-control-in-haccp-limits-and-monitoring"');

    expect(correctiveActionPage).toContain('href: "/features/haccp-plan-generator"');
    expect(correctiveActionPage).toContain('href: "/resources/hazard-analysis-template"');
    expect(correctiveActionPage).toContain('href: "/articles/correcting-non-conformities-in-haccp"');

    expect(sopGeneratorPage).toContain('href: "/resources/food-safety-opening-and-closing-checklist"');
    expect(sopGeneratorPage).toContain('href: "/resources/temperature-monitoring-log-template"');
    expect(sopGeneratorPage).toContain('href: "/articles/temperature-control-in-haccp-limits-and-monitoring"');
  });
});
