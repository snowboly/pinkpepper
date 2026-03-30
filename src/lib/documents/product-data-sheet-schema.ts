export type ProductNutritionRow = {
  nutrient: string;
  per100g: string;
  perServing: string;
};

export type ProductMicrobiologyRow = {
  parameter: string;
  limit: string;
  method: string;
  frequency: string;
};

export type ProductDataSheetData = {
  metadata: {
    businessName: string;
    docNo: string;
    version: string;
    date: string;
    approvedBy: string;
  };
  productName: string;
  productCode: string;
  category: string;
  description: string;
  countryOfOrigin: string;
  ingredients: string;
  allergenContains: string;
  allergenMayContain: string;
  allergenFreeFrom: string;
  storageConditions: string;
  shelfLifeUnopened: string;
  shelfLifeOpened: string;
  netWeight: string;
  packagingType: string;
  nutritionRows: ProductNutritionRow[];
  microbiologyRows: ProductMicrobiologyRow[];
};
