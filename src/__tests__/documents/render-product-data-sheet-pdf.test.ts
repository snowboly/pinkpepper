import { describe, expect, it } from "vitest";

import {
  getMicrobiologyPdfRows,
  getNutritionPdfRows,
} from "@/lib/documents/render-product-data-sheet-pdf";

describe("product data sheet PDF table rows", () => {
  it("uses structured nutrition rows when provided", () => {
    expect(
      getNutritionPdfRows({
        metadata: {
          businessName: "PinkPepper Foods",
          docNo: "PDS-001",
          version: "1",
          date: "17 March 2026",
          approvedBy: "QA Manager",
        },
        productName: "Chicken Caesar Wrap",
        productCode: "WRAP-001",
        category: "Ready-to-eat wrap",
        description: "Chilled tortilla wrap with chicken and Caesar dressing",
        countryOfOrigin: "Portugal",
        ingredients: "Tortilla, chicken, dressing, lettuce",
        allergenContains: "Milk, Egg, Wheat",
        allergenMayContain: "Mustard",
        allergenFreeFrom: "Peanuts",
        storageConditions: "Keep refrigerated at 0C to 4C",
        shelfLifeUnopened: "3 days",
        shelfLifeOpened: "Consume immediately",
        netWeight: "220g",
        packagingType: "Printed film wrap",
        nutritionRows: [
          { nutrient: "Energy (kJ / kcal)", per100g: "950 / 225", perServing: "2090 / 495" },
        ],
        microbiologyRows: [],
      }),
    ).toEqual([["Energy (kJ / kcal)", "950 / 225", "2090 / 495"]]);
  });

  it("uses structured microbiology rows when provided", () => {
    expect(
      getMicrobiologyPdfRows({
        metadata: {
          businessName: "PinkPepper Foods",
          docNo: "PDS-001",
          version: "1",
          date: "17 March 2026",
          approvedBy: "QA Manager",
        },
        productName: "Chicken Caesar Wrap",
        productCode: "WRAP-001",
        category: "Ready-to-eat wrap",
        description: "Chilled tortilla wrap with chicken and Caesar dressing",
        countryOfOrigin: "Portugal",
        ingredients: "Tortilla, chicken, dressing, lettuce",
        allergenContains: "Milk, Egg, Wheat",
        allergenMayContain: "Mustard",
        allergenFreeFrom: "Peanuts",
        storageConditions: "Keep refrigerated at 0C to 4C",
        shelfLifeUnopened: "3 days",
        shelfLifeOpened: "Consume immediately",
        netWeight: "220g",
        packagingType: "Printed film wrap",
        nutritionRows: [],
        microbiologyRows: [
          { parameter: "Listeria monocytogenes", limit: "Absent in 25g", method: "ISO 11290", frequency: "Quarterly" },
        ],
      }),
    ).toEqual([["Listeria monocytogenes", "Absent in 25g", "ISO 11290", "Quarterly"]]);
  });
});
