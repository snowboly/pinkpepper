import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { ProductDataSheetData } from "./product-data-sheet-schema";

const CALIBRI = "Calibri";
const LIGHT_BLUE = "DCEEFF";
const BORDER = "CBD5E1";
const TEXT = "0F172A";
const MUTED = "475569";

function text(value: string, size = 20, bold = false): TextRun {
  return new TextRun({ text: value, size, bold, color: TEXT, font: CALIBRI });
}

function para(value: string, size = 20, bold = false): Paragraph {
  return new Paragraph({ children: [text(value, size, bold)], spacing: { after: 80 } });
}

function infoRow(label: string, value = "_______________"): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 20, font: CALIBRI, color: MUTED }),
      new TextRun({ text: value, size: 20, font: CALIBRI, color: TEXT }),
    ],
    spacing: { after: 80 },
  });
}

function sectionHeading(value: string): Paragraph {
  return new Paragraph({
    text: value,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 },
  });
}

function divider(): Paragraph {
  return new Paragraph({
    children: [],
    spacing: { before: 80, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER, space: 4 } },
  });
}

function buildTable(headers: string[], rows: string[][]): Table {
  const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (h) =>
        new TableCell({
          shading: { type: ShadingType.SOLID, color: LIGHT_BLUE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: h, size: 18, bold: true, color: TEXT, font: CALIBRI })],
            }),
          ],
        })
    ),
  });

  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({ children: [para(cell, 18)] })
        ),
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
    borders: {
      top: border, bottom: border, left: border, right: border,
      insideHorizontal: border, insideVertical: border,
    },
  });
}

const ALLERGENS_14 = [
  "Celery", "Cereals containing gluten", "Crustaceans", "Eggs", "Fish",
  "Lupin", "Milk", "Molluscs", "Mustard", "Nuts (tree nuts)",
  "Peanuts", "Sesame seeds", "Soybeans", "Sulphur dioxide / Sulphites",
];

const NUTRITIONAL_ROWS = [
  ["Energy (kJ / kcal)", "", ""],
  ["Fat (g)", "", ""],
  ["  of which saturates (g)", "", ""],
  ["Carbohydrate (g)", "", ""],
  ["  of which sugars (g)", "", ""],
  ["Fibre (g)", "", ""],
  ["Protein (g)", "", ""],
  ["Salt (g)", "", ""],
];

const MICRO_ROWS = [
  ["Total Viable Count (TVC)", "", "", ""],
  ["Enterobacteriaceae", "", "", ""],
  ["E. coli", "", "", ""],
  ["Salmonella spp.", "", "", ""],
  ["Listeria monocytogenes", "", "", ""],
  ["Yeast & Mould", "", "", ""],
];

export async function renderProductDataSheetDocx(data: ProductDataSheetData): Promise<ArrayBuffer> {
  const children: (Paragraph | Table)[] = [
    // Product identity
    new Paragraph({
      text: data.productName || "Product Data Sheet",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 160 },
    }),
    infoRow("Product Name", data.productName),
    infoRow("Product Code / SKU", data.productCode),
    infoRow("Category", data.category),
    infoRow("Country of Origin", data.countryOfOrigin),
    divider(),

    // Description
    sectionHeading("Product Description"),
    para(data.description || "_______________", 20),
    divider(),

    // Ingredients
    sectionHeading("Ingredients"),
    para(data.ingredients || "_______________", 20),
    divider(),

    // Allergens
    sectionHeading("Allergen Declaration (Regulation 1169/2011 / Natasha's Law)"),
    infoRow("Contains", data.allergenContains || "_______________"),
    infoRow("May Contain (cross-contamination)", data.allergenMayContain || "_______________"),
    infoRow("Free From", data.allergenFreeFrom || "_______________"),
    new Paragraph({ text: "", spacing: { after: 80 } }),
    buildTable(
      ["Allergen", "Intentionally Added", "Cross-contamination Risk", "Not Present"],
      ALLERGENS_14.map((a) => [a, "☐", "☐", "☐"])
    ),
    new Paragraph({ text: "", spacing: { after: 120 } }),
    divider(),

    // Storage & shelf life
    sectionHeading("Storage Conditions & Shelf Life"),
    infoRow("Storage Conditions", data.storageConditions),
    infoRow("Shelf Life (Unopened)", data.shelfLifeUnopened),
    infoRow("Shelf Life (Once Opened)", data.shelfLifeOpened),
    divider(),

    // Packaging
    sectionHeading("Packaging & Net Weight"),
    infoRow("Net Weight / Volume", data.netWeight),
    infoRow("Packaging Type", data.packagingType),
    divider(),

    // Nutritional info
    sectionHeading("Nutritional Information (per 100g / 100ml)"),
    buildTable(
      ["Nutrient", "Per 100g", "Per Serving"],
      NUTRITIONAL_ROWS
    ),
    new Paragraph({ text: "", spacing: { after: 120 } }),
    divider(),

    // Microbiological spec
    sectionHeading("Microbiological Specification"),
    buildTable(
      ["Parameter", "Limit (cfu/g)", "Method", "Frequency"],
      MICRO_ROWS
    ),
    new Paragraph({ text: "", spacing: { after: 160 } }),
  ];

  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1080, bottom: 1080, left: 1440, right: 1080 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${data.metadata.businessName} | ${data.productName || "Product Data Sheet"} | ${data.metadata.docNo} | ${data.metadata.date}`,
                    size: 18,
                    bold: true,
                    color: TEXT,
                    font: CALIBRI,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: { top: { style: BorderStyle.SINGLE, size: 1, color: BORDER, space: 4 } },
                children: [
                  new TextRun({ text: `Approved by: ${data.metadata.approvedBy || "_______________"}   •   Page `, size: 18, color: MUTED, font: CALIBRI }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, color: MUTED, font: CALIBRI }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(document);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}
