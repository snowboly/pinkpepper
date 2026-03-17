import type { ProductDataSheetData } from "./product-data-sheet-schema";

function todayIso(): string {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export function buildProductDataSheetDataFromAnswers(answers: string[]): ProductDataSheetData {
  const businessName = answers[0]?.split(/[,\n]/)[0]?.trim() ?? "";
  const productInfo = answers[1]?.trim() ?? "";
  const productParts = productInfo.split(/[,\n]/);
  const productName = productParts[0]?.trim() ?? "";
  const productCode = productParts[1]?.trim() ?? "";
  const category = productParts[2]?.trim() ?? "";

  const descriptionInfo = answers[2]?.trim() ?? "";
  const descParts = descriptionInfo.split(/[,\n]/);
  const description = descParts[0]?.trim() ?? "";
  const countryOfOrigin = descParts[1]?.trim() ?? "";

  const ingredients = answers[3]?.trim() ?? "";

  const allergenInfo = answers[4]?.trim() ?? "";
  const allergenParts = allergenInfo.split(/[;,\n]/);
  const allergenContains = allergenParts[0]?.replace(/contains?[:]/i, "").trim() ?? "";
  const allergenMayContain = allergenParts[1]?.replace(/may contain[:]/i, "").trim() ?? "";
  const allergenFreeFrom = allergenParts[2]?.replace(/free from[:]/i, "").trim() ?? "";

  const storageInfo = answers[5]?.trim() ?? "";
  const storageParts = storageInfo.split(/[;,\n]/);
  const storageConditions = storageParts[0]?.trim() ?? "";
  const shelfLifeUnopened = storageParts[1]?.trim() ?? "";
  const shelfLifeOpened = storageParts[2]?.trim() ?? "";

  const packagingInfo = answers[6]?.trim() ?? "";
  const packagingParts = packagingInfo.split(/[,\n]/);
  const netWeight = packagingParts[0]?.trim() ?? "";
  const packagingType = packagingParts[1]?.trim() ?? "";

  return {
    metadata: {
      businessName,
      docNo: "PDS-001",
      version: "1",
      date: todayIso(),
      approvedBy: "",
    },
    productName,
    productCode,
    category,
    description,
    countryOfOrigin,
    ingredients,
    allergenContains,
    allergenMayContain,
    allergenFreeFrom,
    storageConditions,
    shelfLifeUnopened,
    shelfLifeOpened,
    netWeight,
    packagingType,
  };
}
