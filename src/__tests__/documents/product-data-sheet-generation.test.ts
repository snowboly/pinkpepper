import { describe, expect, it } from "vitest";

import { buildProductDataSheetDataFromBuilder } from "@/lib/documents/product-data-sheet-generation";

describe("buildProductDataSheetDataFromBuilder", () => {
  it("maps the approved structured product fields into the schema", () => {
    const data = buildProductDataSheetDataFromBuilder({
      businessName: "PinkPepper Foods",
      approvedBy: "QA Manager",
      productName: "Chicken Caesar Wrap",
      productCode: "WRAP-001",
      category: "Ready-to-eat wrap",
      description: "Chilled tortilla wrap with chicken and Caesar dressing",
      countryOfOrigin: "Portugal",
      ingredients: "Tortilla, chicken, dressing, lettuce",
      contains: "Milk, Egg, Wheat",
      mayContain: "Mustard",
      freeFrom: "Peanuts",
      storageConditions: "Keep refrigerated at 0C to 4C",
      shelfLifeUnopened: "3 days",
      shelfLifeOpened: "Consume immediately",
      netWeight: "220g",
      packagingType: "Printed film wrap",
      nutritionRows: [
        { nutrient: "Energy (kJ / kcal)", per100g: "950 / 225", perServing: "2090 / 495" },
      ],
      microbiologyRows: [
        { parameter: "Listeria monocytogenes", limit: "Absent in 25g", method: "ISO 11290", frequency: "Quarterly" },
      ],
    });

    expect(data.metadata.businessName).toBe("PinkPepper Foods");
    expect(data.metadata.approvedBy).toBe("QA Manager");
    expect(data.productName).toBe("Chicken Caesar Wrap");
    expect(data.allergenContains).toBe("Milk, Egg, Wheat");
    expect(data.nutritionRows[0].per100g).toBe("950 / 225");
    expect(data.microbiologyRows[0].parameter).toBe("Listeria monocytogenes");
  });

  it("keeps optional nutrition and microbiology sections blank only when omitted", () => {
    const data = buildProductDataSheetDataFromBuilder({
      businessName: "PinkPepper Foods",
      approvedBy: "QA Manager",
      productName: "Chicken Caesar Wrap",
      productCode: "WRAP-001",
      category: "Ready-to-eat wrap",
      description: "Chilled tortilla wrap with chicken and Caesar dressing",
      countryOfOrigin: "Portugal",
      ingredients: "Tortilla, chicken, dressing, lettuce",
      contains: "Milk, Egg, Wheat",
      mayContain: "",
      freeFrom: "Peanuts",
      storageConditions: "Keep refrigerated at 0C to 4C",
      shelfLifeUnopened: "3 days",
      shelfLifeOpened: "Consume immediately",
      netWeight: "220g",
      packagingType: "Printed film wrap",
      nutritionRows: [],
      microbiologyRows: [],
    });

    expect(data.nutritionRows).toEqual([]);
    expect(data.microbiologyRows).toEqual([]);
  });
});
