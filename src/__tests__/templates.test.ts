import { describe, expect, it } from "vitest";
import { getGroupedTemplates, TEMPLATES } from "@/lib/templates";
import { resourceEntries } from "@/lib/resources";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("getGroupedTemplates", () => {
  it("sorts categories alphabetically and keeps editable templates ahead of posters", () => {
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
      "BRC checklist poster",
      "Foreign body prevention poster",
      "Glass and brittle plastic control poster",
      "ISO 22000 checklist poster",
    ]);

    expect(grouped.find((group) => group.category === "Monitoring")?.templates.map((template) => template.title)).toEqual([
      "Cooking monitoring log",
      "Equipment calibration log",
      "Food safety opening and closing checklist",
      "Label check record template",
      "Pest control log",
      "Restaurant closing checklist",
      "Restaurant opening checklist",
      "Temperature monitoring log",
      "Waste management log",
      "Waste management SOP",
      "Chill chain checklist poster",
      "Chilled storage checklist poster",
      "Date coding reminder poster",
      "Food temperature poster",
      "Label checking poster",
      "Pre-operational hygiene inspection poster",
      "Probe thermometer calibration poster",
      "Restaurant opening poster",
    ]);

    expect(grouped.find((group) => group.category === "Allergen")?.templates.map((template) => template.title)).toEqual([
      "Allergen matrix template",
      "Allergen checklist poster",
    ]);

    expect(grouped.find((group) => group.category === "Training")?.templates.map((template) => template.title)).toEqual([
      "Employee training record",
      "Personal hygiene policy",
      "Food safety culture poster",
      "GMP poster",
      "Halal compliance poster",
      "Handwashing checklist poster",
      "Kosher compliance poster",
      "Personal hygiene checklist poster",
      "Workplace compliance poster",
    ]);

    expect(grouped.find((group) => group.category === "Supplier")?.templates.map((template) => template.title)).toEqual([
      "Food specification template",
      "Supplier approval questionnaire",
      "Supplier registration log",
      "Supplier approval checklist poster",
    ]);

    expect(grouped.find((group) => group.category === "Cleaning")?.templates.map((template) => template.title)).toEqual([
      "Cleaning and disinfection SOP",
      "Cleaning safety poster",
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

  it("surfaces the food specification template in the registry and resources hub", () => {
    expect(TEMPLATES.find((template) => template.slug === "food-spec-template")).toMatchObject({
      title: "Food specification template",
      category: "Supplier",
      storageName: "food_spec_template",
    });

    expect(resourceEntries.find((resource) => resource.href === "/resources/food-spec-template")).toMatchObject({
      title: "Food specification template",
      description:
        "A structured product specification template covering composition, allergens, storage, shelf life, and supplier approval details.",
    });

    const foodSpecPage = readPage("src/app/resources/food-spec-template/page.tsx");
    const resourcesModule = readPage("src/lib/resources.ts");
    const chrome = readPage("src/components/site/chrome.tsx");

    expect(foodSpecPage).toContain('templateSlug="food-spec-template"');
    expect(resourcesModule).toContain('"/resources/food-spec-template"');
    expect(chrome).not.toContain('href: getPublicPageHref(publicLocale, "/resources/food-spec-template")');
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

    expect(TEMPLATES.find((template) => template.slug === "chill-chain-poster")).toMatchObject({
      title: "Chill chain checklist poster",
      category: "Monitoring",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "label-check-poster")).toMatchObject({
      title: "Label checking poster",
      category: "Monitoring",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "label-check-record-template")).toMatchObject({
      title: "Label check record template",
      category: "Monitoring",
      fileType: "xlsx",
    });

    expect(TEMPLATES.find((template) => template.slug === "date-coding-poster")).toMatchObject({
      title: "Date coding reminder poster",
      category: "Monitoring",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "cleaning-safety-poster")).toMatchObject({
      title: "Cleaning safety poster",
      category: "Cleaning",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "handwashing-poster")).toMatchObject({
      title: "Handwashing checklist poster",
      category: "Training",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "halal-compliance-poster")).toMatchObject({
      title: "Halal compliance poster",
      category: "Training",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "brc-checklist-poster")).toMatchObject({
      title: "BRC checklist poster",
      category: "HACCP",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "iso22000-checklist-poster")).toMatchObject({
      title: "ISO 22000 checklist poster",
      category: "HACCP",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "workplace-compliance-poster")).toMatchObject({
      title: "Workplace compliance poster",
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
        "/resources/brc-checklist-poster",
        "/resources/chill-chain-poster",
        "/resources/cleaning-safety-poster",
        "/resources/cooking-monitoring-log-template",
        "/resources/date-coding-poster",
        "/resources/food-temperature-poster",
        "/resources/gmp-poster",
        "/resources/halal-compliance-poster",
        "/resources/handwashing-poster",
        "/resources/kosher-compliance-poster",
        "/resources/label-check-poster",
        "/resources/iso22000-checklist-poster",
        "/resources/label-check-record-template",
        "/resources/workplace-compliance-poster",
        "/resources/label-check-record-template",
        "/resources/restaurant-closing-checklist",
        "/resources/restaurant-opening-checklist",
        "/resources/restaurant-opening-poster",
      ]),
    );

    const resourcesPage = readPage("src/app/resources/page.tsx");
    expect(resourcesPage).toContain("Free food safety templates, posters, and guides");

    expect(readPage("src/app/resources/chill-chain-poster/page.tsx")).toContain('templateSlug="chill-chain-poster"');
    expect(readPage("src/app/resources/cleaning-safety-poster/page.tsx")).toContain('templateSlug="cleaning-safety-poster"');
    expect(readPage("src/app/resources/brc-checklist-poster/page.tsx")).toContain('templateSlug="brc-checklist-poster"');
    expect(readPage("src/app/resources/date-coding-poster/page.tsx")).toContain('templateSlug="date-coding-poster"');
    expect(readPage("src/app/resources/handwashing-poster/page.tsx")).toContain('templateSlug="handwashing-poster"');
    expect(readPage("src/app/resources/iso22000-checklist-poster/page.tsx")).toContain(
      'templateSlug="iso22000-checklist-poster"',
    );
    expect(readPage("src/app/resources/label-check-poster/page.tsx")).toContain('templateSlug="label-check-poster"');
    expect(readPage("src/app/resources/label-check-record-template/page.tsx")).toContain(
      'templateSlug="label-check-record-template"',
    );
    expect(readPage("src/app/resources/workplace-compliance-poster/page.tsx")).toContain(
      'templateSlug="workplace-compliance-poster"',
    );
  });

  it("surfaces the second poster wave in the registry and resources hub", () => {
    expect(TEMPLATES.find((template) => template.slug === "chilled-storage-poster")).toMatchObject({
      title: "Chilled storage checklist poster",
      category: "Monitoring",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "food-safety-culture-poster")).toMatchObject({
      title: "Food safety culture poster",
      category: "Training",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "foreign-body-poster")).toMatchObject({
      title: "Foreign body prevention poster",
      category: "HACCP",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "glass-brittle-poster")).toMatchObject({
      title: "Glass and brittle plastic control poster",
      category: "HACCP",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "hygiene-inspection-poster")).toMatchObject({
      title: "Pre-operational hygiene inspection poster",
      category: "Monitoring",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "personal-hygiene-poster")).toMatchObject({
      title: "Personal hygiene checklist poster",
      category: "Training",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "probe-calibration-poster")).toMatchObject({
      title: "Probe thermometer calibration poster",
      category: "Monitoring",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "supplier-approval-poster")).toMatchObject({
      title: "Supplier approval checklist poster",
      category: "Supplier",
      fileType: "png",
    });

    expect(TEMPLATES.find((template) => template.slug === "traceability-recall-poster")).toMatchObject({
      title: "Traceability and recall readiness poster",
      category: "Traceability",
      fileType: "png",
    });

    expect(resourceEntries.map((resource) => resource.href)).toEqual(
      expect.arrayContaining([
        "/resources/chilled-storage-poster",
        "/resources/food-safety-culture-poster",
        "/resources/foreign-body-poster",
        "/resources/glass-brittle-poster",
        "/resources/hygiene-inspection-poster",
        "/resources/personal-hygiene-poster",
        "/resources/probe-calibration-poster",
        "/resources/supplier-approval-poster",
        "/resources/traceability-recall-poster",
      ]),
    );
  });

  it("creates dedicated SEO resource pages for the new poster and restaurant assets", () => {
    const allergenPosterPage = readPage("src/app/resources/allergen-checklist-poster/page.tsx");
    const chilledStoragePosterPage = readPage("src/app/resources/chilled-storage-poster/page.tsx");
    const foodSafetyCulturePosterPage = readPage("src/app/resources/food-safety-culture-poster/page.tsx");
    const foreignBodyPosterPage = readPage("src/app/resources/foreign-body-poster/page.tsx");
    const glassBrittlePosterPage = readPage("src/app/resources/glass-brittle-poster/page.tsx");
    const halalPosterPage = readPage("src/app/resources/halal-compliance-poster/page.tsx");
    const hygieneInspectionPosterPage = readPage("src/app/resources/hygiene-inspection-poster/page.tsx");
    const kosherPosterPage = readPage("src/app/resources/kosher-compliance-poster/page.tsx");
    const personalHygienePosterPage = readPage("src/app/resources/personal-hygiene-poster/page.tsx");
    const probeCalibrationPosterPage = readPage("src/app/resources/probe-calibration-poster/page.tsx");
    const restaurantOpeningChecklistPage = readPage("src/app/resources/restaurant-opening-checklist/page.tsx");
    const restaurantClosingChecklistPage = readPage("src/app/resources/restaurant-closing-checklist/page.tsx");
    const restaurantOpeningPosterPage = readPage("src/app/resources/restaurant-opening-poster/page.tsx");
    const supplierApprovalPosterPage = readPage("src/app/resources/supplier-approval-poster/page.tsx");
    const traceabilityRecallPosterPage = readPage("src/app/resources/traceability-recall-poster/page.tsx");

    expect(allergenPosterPage).toContain("allergen-checklist-poster");
    expect(allergenPosterPage).toContain("EU and UK");
    expect(chilledStoragePosterPage).toContain("chilled-storage-poster");
    expect(chilledStoragePosterPage).toContain("EU and UK");
    expect(foodSafetyCulturePosterPage).toContain("food-safety-culture-poster");
    expect(foodSafetyCulturePosterPage).toContain("EU and UK");
    expect(foreignBodyPosterPage).toContain("foreign-body-poster");
    expect(foreignBodyPosterPage).toContain("EU and UK");
    expect(glassBrittlePosterPage).toContain("glass-brittle-poster");
    expect(glassBrittlePosterPage).toContain("EU and UK");
    expect(halalPosterPage).toContain("halal-compliance-poster");
    expect(halalPosterPage).toContain("EU and UK");
    expect(hygieneInspectionPosterPage).toContain("hygiene-inspection-poster");
    expect(hygieneInspectionPosterPage).toContain("EU and UK");
    expect(kosherPosterPage).toContain("kosher-compliance-poster");
    expect(kosherPosterPage).toContain("EU and UK");
    expect(personalHygienePosterPage).toContain("personal-hygiene-poster");
    expect(personalHygienePosterPage).toContain("EU and UK");
    expect(probeCalibrationPosterPage).toContain("probe-calibration-poster");
    expect(probeCalibrationPosterPage).toContain("EU and UK");
    expect(restaurantOpeningChecklistPage).toContain("restaurant-opening-checklist");
    expect(restaurantClosingChecklistPage).toContain("restaurant-closing-checklist");
    expect(restaurantOpeningPosterPage).toContain("restaurant-opening-poster");
    expect(supplierApprovalPosterPage).toContain("supplier-approval-poster");
    expect(supplierApprovalPosterPage).toContain("EU and UK");
    expect(traceabilityRecallPosterPage).toContain("traceability-recall-poster");
    expect(traceabilityRecallPosterPage).toContain("EU and UK");
  });

  it("keeps local thumbnail fallbacks for the live resource pages that rely on them", () => {
    const thumbnailFiles = readPage("public/templates/thumbnails/food-spec-template.svg");
    expect(thumbnailFiles).toContain("<svg");

    expect(readPage("public/templates/thumbnails/chill-chain-poster.svg")).toContain("<svg");
    expect(readPage("public/templates/thumbnails/cleaning-safety-poster.svg")).toContain("<svg");
    expect(readPage("public/templates/thumbnails/brc-checklist-poster.svg")).toContain("<svg");
    expect(readPage("public/templates/thumbnails/date-coding-poster.svg")).toContain("<svg");
    expect(readPage("public/templates/thumbnails/food-safety-opening-and-closing-checklist.svg")).toContain("<svg");
    expect(readPage("public/templates/thumbnails/handwashing-poster.svg")).toContain("<svg");
    expect(readPage("public/templates/thumbnails/haccp-plan-template.svg")).toContain("<svg");
    expect(readPage("public/templates/thumbnails/hazard-analysis-template.svg")).toContain("<svg");
    expect(readPage("public/templates/thumbnails/iso22000-checklist-poster.svg")).toContain("<svg");
    expect(readPage("public/templates/thumbnails/label-check-poster.svg")).toContain("<svg");
    expect(readPage("public/templates/thumbnails/label-check-record-template.svg")).toContain("<svg");
    expect(readPage("public/templates/thumbnails/supplier-registration-log.svg")).toContain("<svg");
    expect(readPage("public/templates/thumbnails/workplace-compliance-poster.svg")).toContain("<svg");
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
