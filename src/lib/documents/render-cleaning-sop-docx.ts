import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  Packer,
  PageNumber,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { CleaningSopData } from "./cleaning-sop-schema";

const CALIBRI = "Calibri";
const LIGHT_BLUE = "DCEEFF";
const BORDER = "CBD5E1";
const TEXT = "0F172A";
const MUTED = "475569";

function text(textValue: string, size = 20, bold = false): TextRun {
  return new TextRun({ text: textValue, size, bold, color: TEXT, font: CALIBRI });
}

function paragraph(textValue: string, size = 20, bold = false): Paragraph {
  return new Paragraph({ children: [text(textValue, size, bold)], spacing: { after: 80 } });
}

function sectionTitle(title: string): Paragraph {
  return new Paragraph({
    children: [text(title, 26, true)],
    spacing: { before: 160, after: 100 },
  });
}

function subsectionTitle(title: string): Paragraph {
  return new Paragraph({
    children: [text(title, 22, true)],
    spacing: { before: 100, after: 80 },
  });
}

function caption(value: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: value, size: 18, italics: true, color: MUTED, font: CALIBRI })],
    spacing: { after: 60 },
  });
}

function bullet(value: string): Paragraph {
  return new Paragraph({ children: [text(`• ${value}`, 20)], spacing: { after: 40 } });
}

function numberedItem(index: number, value: string): Paragraph {
  return new Paragraph({ children: [text(`${index + 1}. ${value}`, 20)], spacing: { after: 40 } });
}

function buildTable(headers: string[], rows: string[][]): Table {
  const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(
          (header) =>
            new TableCell({
              shading: { type: ShadingType.SOLID, color: LIGHT_BLUE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: header, size: 20, bold: true, color: TEXT, font: CALIBRI })],
                }),
              ],
            })
        ),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (value) =>
                new TableCell({ children: [paragraph(value, 18)] })
            ),
          })
      ),
    ],
    borders: {
      top: border,
      bottom: border,
      left: border,
      right: border,
      insideHorizontal: border,
      insideVertical: border,
    },
  });
}

export async function renderCleaningSopDocx(data: CleaningSopData): Promise<ArrayBuffer> {
  const children: (Paragraph | Table)[] = [
    // Metadata block
    paragraph(`Document No.: ${data.metadata.docNo}   Revision: ${data.metadata.revision}   Date: ${data.metadata.date}`, 18),
    paragraph(`Approved by: ${data.metadata.approvedBy || "_______________"}   Review Date: ${data.metadata.reviewDate || "_______________"}`, 18),
    paragraph(`Premises: ${data.metadata.premises || "_______________"}`, 18),
    new Paragraph({ text: "", spacing: { after: 80 } }),

    // 1. Purpose
    sectionTitle("1. Purpose"),
    paragraph(
      "This SOP defines the cleaning and disinfection procedures required to maintain food safety and hygiene standards across all operational areas. It ensures compliance with Regulation (EC) 852/2004, Annex II, Chapter I and supports the premises' HACCP plan.",
      20
    ),

    // 2. Scope
    sectionTitle("2. Scope"),
    paragraph(data.scope, 20),

    // 3. Responsibilities
    sectionTitle("3. Responsibilities"),
    caption("Table 1. Roles and Responsibilities"),
    buildTable(
      ["Role", "Responsibility"],
      data.responsibilities.map((r) => [r.role, r.responsibility])
    ),

    // 4. Definitions
    sectionTitle("4. Definitions"),
    caption("Table 2. Key Definitions"),
    buildTable(
      ["Term", "Definition"],
      data.definitions.map((r) => [r.term, r.definition])
    ),

    // 5. Materials and Chemicals
    sectionTitle("5. Materials and Chemicals"),
    caption("Table 3. Cleaning Chemicals Reference"),
    buildTable(
      ["Chemical / Product", "Purpose", "Dilution", "Contact Time", "Active Ingredient"],
      data.chemicals.map((r) => [r.chemical, r.purpose, r.dilution, r.contactTime, r.activeIngredient])
    ),
    paragraph("All chemicals must be stored securely, used at the correct dilution, and never mixed. COSHH data sheets must be accessible.", 18),

    // 6. Step-by-Step Cleaning Procedure
    sectionTitle("6. Step-by-Step Cleaning Procedure"),
    subsectionTitle("6.1 Standard Two-Stage Clean (Food-Contact Surfaces)"),
    ...data.standardProcedure.map((step, i) => numberedItem(i, step)),

    subsectionTitle("6.2 Non-Food-Contact Surfaces (Floors, Walls, External Equipment)"),
    ...data.nonFoodContactProcedure.map((step, i) => numberedItem(i, step)),

    // 7. Cleaning Frequency Schedule
    sectionTitle("7. Cleaning Frequency Schedule"),
    caption("Table 4. Cleaning Frequency Schedule"),
    buildTable(
      ["Item / Area", "Method", "Frequency", "Responsible"],
      data.frequencySchedule.map((r) => [r.itemArea, r.method, r.frequency, r.responsible])
    ),

    // 8. Verification
    sectionTitle("8. Verification"),
    subsectionTitle("8.1 Visual Inspection"),
    ...data.verificationVisual.map((item) => bullet(item)),

    subsectionTitle("8.2 ATP Bioluminescence Testing"),
    caption("Table 5. ATP Verification Limits"),
    buildTable(
      ["Surface Category", "Pass (RLU)", "Borderline (RLU)", "Fail (RLU)"],
      data.verificationAtp.map((r) => [r.surfaceCategory, r.pass, r.borderline, r.fail])
    ),

    subsectionTitle("8.3 Microbiological Swabbing"),
    paragraph("Environmental swabs (Listeria, E. coli, TVC) in high-care areas. Results reviewed by Technical / QA Manager.", 20),

    // 9. Corrective Actions
    sectionTitle("9. Corrective Actions"),
    paragraph("If a surface fails visual or ATP/swab verification:", 20),
    ...data.corrective.map((step, i) => numberedItem(i, step)),

    // 10. Records
    sectionTitle("10. Records"),
    caption("Table 6. Record-Keeping Requirements"),
    buildTable(
      ["Record", "Location", "Retention"],
      data.records.map((r) => [r.record, r.location, r.retention])
    ),

    // 11. Sign-Off Log
    sectionTitle("11. Sign-Off Log"),
    caption("Table 7. Cleaning Sign-Off Log"),
    buildTable(
      ["Date", "Task Completed", "Time", "Operative (Initials)", "Supervisor Check", "Issues / Corrective Action"],
      Array.from({ length: 5 }, () => ["", "", "", "", "", ""])
    ),

    new Paragraph({ text: "", spacing: { before: 120 } }),
    paragraph("Review: This SOP must be reviewed annually, or sooner if chemicals, equipment, premises layout, or regulations change.", 18),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  text(`${data.metadata.businessName} — Cleaning and Disinfection SOP | ${data.metadata.docNo} | ${data.metadata.date}`, 18, true),
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
                children: [
                  new TextRun({ text: `Approved by: ${data.metadata.approvedBy || "_______________"}   Page `, size: 18, color: MUTED, font: CALIBRI }),
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

  const buffer = await Packer.toBuffer(doc);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}
