import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ProductDataSheetData } from "./product-data-sheet-schema";

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 45;
const CONTENT_W = PAGE_W - MARGIN * 2;
const LIGHT_BLUE = rgb(0.863, 0.933, 1);
const BORDER = rgb(0.796, 0.835, 0.882);
const TEXT = rgb(0.059, 0.09, 0.118);
const MUTED = rgb(0.278, 0.341, 0.404);

const ALLERGENS_14 = [
  "Celery", "Cereals containing gluten", "Crustaceans", "Eggs", "Fish",
  "Lupin", "Milk", "Molluscs", "Mustard", "Nuts (tree nuts)",
  "Peanuts", "Sesame seeds", "Soybeans", "Sulphur dioxide / Sulphites",
];

const NUTRITIONAL_ROWS = [
  "Energy (kJ / kcal)", "Fat (g)", "  of which saturates (g)",
  "Carbohydrate (g)", "  of which sugars (g)", "Fibre (g)", "Protein (g)", "Salt (g)",
];

const MICRO_ROWS = [
  "Total Viable Count (TVC)", "Enterobacteriaceae", "E. coli",
  "Salmonella spp.", "Listeria monocytogenes", "Yeast & Mould",
];

export async function renderProductDataSheetPdf(data: ProductDataSheetData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  function ensureSpace(space: number) {
    if (y - space < MARGIN + 20) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
      drawFrame();
    }
  }

  function drawFrame() {
    page.drawText(
      `${data.metadata.businessName} | ${data.productName || "Product Data Sheet"} | ${data.metadata.docNo} | ${data.metadata.date}`,
      { x: MARGIN, y: PAGE_H - 18, size: 8, font: bold, color: TEXT, maxWidth: CONTENT_W }
    );
    page.drawText(
      `Approved by: ${data.metadata.approvedBy || "_______________"}`,
      { x: MARGIN, y: 14, size: 8, font: regular, color: MUTED }
    );
  }

  function drawLine(value: string, size = 10, font = regular, color = TEXT, xOffset = 0) {
    const x = MARGIN + xOffset;
    const maxW = CONTENT_W - xOffset;
    const words = value.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        ensureSpace(size + 5);
        page.drawText(line, { x, y, size, font, color });
        y -= size + 5;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      ensureSpace(size + 5);
      page.drawText(line, { x, y, size, font, color });
      y -= size + 5;
    }
  }

  function drawLabel(label: string, value = "_______________") {
    ensureSpace(14);
    page.drawText(`${label}:`, { x: MARGIN, y, size: 9, font: bold, color: MUTED });
    page.drawText(value, { x: MARGIN + 140, y, size: 9, font: regular, color: TEXT, maxWidth: CONTENT_W - 140 });
    y -= 14;
  }

  function drawSectionHeading(title: string) {
    ensureSpace(22);
    y -= 6;
    page.drawRectangle({ x: MARGIN - 4, y: y - 2, width: 4, height: 16, color: LIGHT_BLUE });
    page.drawText(title, { x: MARGIN + 4, y, size: 11, font: bold, color: TEXT });
    y -= 20;
  }

  function drawDivider() {
    page.drawRectangle({ x: MARGIN, y, width: CONTENT_W, height: 0.5, color: BORDER });
    y -= 8;
  }

  function drawTable(headers: string[], rows: string[][], colWidths?: number[]) {
    const rowH = 16;
    const widths = colWidths ?? headers.map(() => CONTENT_W / headers.length);

    ensureSpace(rowH + 2);
    let xPos = MARGIN;
    page.drawRectangle({ x: MARGIN, y: y - rowH + 4, width: CONTENT_W, height: rowH, color: LIGHT_BLUE, borderColor: BORDER, borderWidth: 0.5 });
    headers.forEach((h, i) => {
      page.drawText(h, { x: xPos + 3, y: y - 11, size: 8, font: bold, color: TEXT, maxWidth: widths[i] - 6 });
      xPos += widths[i];
    });
    y -= rowH;

    rows.forEach((row) => {
      ensureSpace(rowH);
      xPos = MARGIN;
      page.drawRectangle({ x: MARGIN, y: y - rowH + 4, width: CONTENT_W, height: rowH, borderColor: BORDER, borderWidth: 0.5 });
      row.forEach((value, i) => {
        page.drawText(value, { x: xPos + 3, y: y - 11, size: 7, font: regular, color: TEXT, maxWidth: widths[i] - 6 });
        xPos += widths[i];
      });
      y -= rowH;
    });
    y -= 8;
  }

  // First page
  drawFrame();
  y -= 18;

  // Title
  page.drawText(data.productName || "Product Data Sheet", { x: MARGIN, y, size: 16, font: bold, color: TEXT });
  y -= 22;

  // Product identity
  drawLabel("Product Code / SKU", data.productCode);
  drawLabel("Category", data.category);
  drawLabel("Country of Origin", data.countryOfOrigin);
  drawDivider();

  // Description
  drawSectionHeading("Product Description");
  drawLine(data.description || "_______________", 9);
  drawDivider();

  // Ingredients
  drawSectionHeading("Ingredients");
  drawLine(data.ingredients || "_______________", 9);
  drawDivider();

  // Allergens
  drawSectionHeading("Allergen Declaration (Reg. 1169/2011 / Natasha's Law)");
  drawLabel("Contains", data.allergenContains || "_______________");
  drawLabel("May Contain (cross-contamination)", data.allergenMayContain || "_______________");
  drawLabel("Free From", data.allergenFreeFrom || "_______________");
  y -= 4;

  // Allergen table — 4 equal columns
  const allergenColW = [CONTENT_W * 0.4, CONTENT_W * 0.2, CONTENT_W * 0.2, CONTENT_W * 0.2];
  drawTable(
    ["Allergen", "Intentionally Added", "Cross-contamination Risk", "Not Present"],
    ALLERGENS_14.map((a) => [a, "[ ]", "[ ]", "[ ]"]),
    allergenColW
  );
  drawDivider();

  // Storage & shelf life
  drawSectionHeading("Storage Conditions & Shelf Life");
  drawLabel("Storage Conditions", data.storageConditions);
  drawLabel("Shelf Life (Unopened)", data.shelfLifeUnopened);
  drawLabel("Shelf Life (Once Opened)", data.shelfLifeOpened);
  drawDivider();

  // Packaging
  drawSectionHeading("Packaging & Net Weight");
  drawLabel("Net Weight / Volume", data.netWeight);
  drawLabel("Packaging Type", data.packagingType);
  drawDivider();

  // Nutritional info
  drawSectionHeading("Nutritional Information (per 100g / 100ml)");
  const nutriColW = [CONTENT_W * 0.6, CONTENT_W * 0.2, CONTENT_W * 0.2];
  drawTable(
    ["Nutrient", "Per 100g", "Per Serving"],
    NUTRITIONAL_ROWS.map((n) => [n, "", ""]),
    nutriColW
  );
  drawDivider();

  // Microbiological spec
  drawSectionHeading("Microbiological Specification");
  drawTable(
    ["Parameter", "Limit (cfu/g)", "Method", "Frequency"],
    MICRO_ROWS.map((m) => [m, "", "", ""])
  );

  // Page numbers
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawText(`Page ${i + 1}`, { x: PAGE_W - MARGIN - 30, y: 14, size: 8, font: regular, color: MUTED });
  });

  return pdf.save();
}
