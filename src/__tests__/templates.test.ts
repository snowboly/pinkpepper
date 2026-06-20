import { describe, expect, it } from "vitest";
import { getGroupedTemplates, TEMPLATES } from "@/lib/templates";
import { resourceEntries } from "@/lib/resources";
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
      "EU and UK document checklist",
      "Food safety audit checklist",
      "Food safety management system",
      "HACCP hazards register",
      "HACCP step descriptions",
      "Hazard analysis template",
      "Product recall procedure",
    ]);

    expect(grouped.find((group) => group.category === "Monitoring")?.templates.map((template) => template.title)).toEqual([
      "Cooking monitoring log",
      "Equipment calibration log",
      "Food safety opening and closing checklist",
      "Food temperature poster",
      "Pest control log",
      "Restaurant closing checklist",
      "Restaurant opening checklist",
      "Restaurant opening poster",
      "Temperature monitoring log",
      "Waste management log",
      "Waste management SOP",
    ]);

    expect(grouped.find((group) => group.category === "Allergen")?.templates.map((template) => template.title)).toEqual([
      "Allergen checklist poster",
      "Allergen matrix template",
    ]);

    expect(grouped.find((group) => group.category === "Training")?.templates.map((template) => template.title)).toEqual([
      "Employee training record",
      "GMP poster",
      "Halal compliance poster",
      "Kosher compliance poster",
      "Personal hygiene policy",
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

  it("keeps existing audit download slugs registered for live resource pages", () => {
    expect(TEMPLATES.find((template) => template.slug === "food-safety-audit-checklist")).toMatchObject({
      title: "Food safety audit checklist",
      category: "HACCP",
    });

    expect(TEMPLATES.find((template) => template.slug === "food-safety-document-checklist")).toMatchObject({
      title: "EU and UK document checklist",
      category: "HACCP",
    });

    expect(TEMPLATES.find((template) => template.slug === "food-safety-management-system-template")).toMatchObject({
      title: "Food safety management system",
      category: "HACCP",
    });
  });

  it("surfaces the hazard analysis template in the registry and resources hub", () => {
    expect(TEMPLATES.find((template) => template.slug === "hazard-analysis-template")).toMatchObject({
      title: "Hazard analysis template",
      category: "HACCP",
    });

    expect(resourceEntries.find((resource) => resource.href === "/resources/hazard-analysis-template")).toMatchObject({
      title: "Hazard analysis template",
      description: "What to include in a hazard analysis worksheet before you turn it into a business-specific HACCP document.",
    });
  });

  it("surfaces the supplier registration log in the registry and resources hub", () => {
    expect(TEMPLATES.find((template) => template.slug === "supplier-registration-log")).toMatchObject({
      title: "Supplier registration log",
      category: "Supplier",
      fileType: "xlsx",
      storageName: "supplier-registration-template",
    });

    expect(resourceEntries.find((resource) => resource.href === "/resources/supplier-registration-log")).toMatchObject({
      title: "Supplier registration log",
      description: "A supplier tracker for approval status, review dates, product scope, and due-diligence follow-up.",
    });
  });

  it("surfaces the new monitoring and poster resources in the registry and resources hub", () => {
    expect(TEMPLATES.find((template) => template.slug === "allergen-checklist-poster")).toMatchObject({
      title: "Allergen checklist poster",
      category: "Allergen",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "cooking-monitoring-log-template")).toMatchObject({
      title: "Cooking monitoring log",
      category: "Monitoring",
    });

    expect(TEMPLATES.find((template) => template.slug === "food-temperature-poster")).toMatchObject({
      title: "Food temperature poster",
      category: "Monitoring",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "gmp-poster")).toMatchObject({
      title: "GMP poster",
      category: "Training",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "halal-compliance-poster")).toMatchObject({
      title: "Halal compliance poster",
      category: "Training",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "kosher-compliance-poster")).toMatchObject({
      title: "Kosher compliance poster",
      category: "Training",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "restaurant-closing-checklist")).toMatchObject({
      title: "Restaurant closing checklist",
      category: "Monitoring",
      fileType: "xlsx",
    });

    expect(TEMPLATES.find((template) => template.slug === "restaurant-opening-checklist")).toMatchObject({
      title: "Restaurant opening checklist",
      category: "Monitoring",
      fileType: "xlsx",
    });

    expect(TEMPLATES.find((template) => template.slug === "restaurant-opening-poster")).toMatchObject({
      title: "Restaurant opening poster",
      category: "Monitoring",
      fileType: "png",
    });

    expect(resourceEntries.map((resource) => resource.href)).toEqual(
      expect.arrayContaining([
        "/resources/allergen-checklist-poster",
        "/resources/cooking-monitoring-log-template",
        "/resources/food-temperature-poster",
        "/resources/gmp-poster",
        "/resources/halal-compliance-poster",
        "/resources/kosher-compliance-poster",
        "/resources/restaurant-closing-checklist",
        "/resources/restaurant-opening-checklist",
        "/resources/restaurant-opening-poster",
      ]),
    );

    const resourcesPage = readPage("src/app/resources/page.tsx");
    expect(resourcesPage).toContain("Free food safety templates, posters, and guides");
  });

  it("creates dedicated SEO resource pages for the new poster and restaurant assets", () => {
    const allergenPosterPage = readPage("src/app/resources/allergen-checklist-poster/page.tsx");
    const halalPosterPage = readPage("src/app/resources/halal-compliance-poster/page.tsx");
    const kosherPosterPage = readPage("src/app/resources/kosher-compliance-poster/page.tsx");
    const restaurantOpeningChecklistPage = readPage("src/app/resources/restaurant-opening-checklist/page.tsx");
    const restaurantClosingChecklistPage = readPage("src/app/resources/restaurant-closing-checklist/page.tsx");
    const restaurantOpeningPosterPage = readPage("src/app/resources/restaurant-opening-poster/page.tsx");

    expect(allergenPosterPage).toContain("allergen-checklist-poster");
    expect(allergenPosterPage).toContain("EU and UK");
    expect(halalPosterPage).toContain("halal-compliance-poster");
    expect(halalPosterPage).toContain("EU and UK");
    expect(kosherPosterPage).toContain("kosher-compliance-poster");
    expect(kosherPosterPage).toContain("EU and UK");
    expect(restaurantOpeningChecklistPage).toContain("restaurant-opening-checklist");
    expect(restaurantClosingChecklistPage).toContain("restaurant-closing-checklist");
    expect(restaurantOpeningPosterPage).toContain("restaurant-opening-poster");
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
