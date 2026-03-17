import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
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
import type { HygienePolicyData } from "./hygiene-schema";

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
  return new Paragraph({
    children: [text(`• ${value}`, 20)],
    spacing: { after: 40 },
  });
}

function numberedItem(index: number, value: string): Paragraph {
  return new Paragraph({
    children: [text(`${index + 1}. ${value}`, 20)],
    spacing: { after: 40 },
  });
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
                new TableCell({
                  children: [paragraph(value, 18)],
                })
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

export async function renderHygieneDocx(data: HygienePolicyData): Promise<ArrayBuffer> {
  const children: (Paragraph | Table)[] = [
    // Document metadata block
    paragraph(`Document No.: ${data.metadata.docNo}   Revision: ${data.metadata.revision}   Date: ${data.metadata.date}`, 18),
    paragraph(`Approved by: ${data.metadata.approvedBy || "_______________"}   Review Date: ${data.metadata.reviewDate || "_______________"}`, 18),
    new Paragraph({ text: "", spacing: { after: 80 } }),

    // 1. Policy Statement
    sectionTitle("1. Policy Statement"),
    paragraph(
      `${data.metadata.businessName || "This business"} requires all staff involved in food handling to maintain the highest standards of personal hygiene at all times. This policy ensures compliance with Regulation (EC) 852/2004, Annex II, Chapter VIII and protects both consumers and staff from food safety hazards.`,
      20
    ),

    // 2. Scope
    sectionTitle("2. Scope"),
    paragraph(data.scope, 20),

    // 3. Handwashing
    sectionTitle("3. Handwashing Procedure"),
    subsectionTitle("3.1 When to Wash Hands"),
    paragraph("Hands must be washed:", 20),
    ...data.handwashingWhen.map((item) => bullet(item)),

    subsectionTitle("3.2 How to Wash Hands"),
    ...data.handwashingHow.map((step, i) => numberedItem(i, step)),
    paragraph("Note: Alcohol hand gel may be used as a supplement but never as a replacement for handwashing with soap and water.", 18),

    subsectionTitle("3.3 Handwash Facilities"),
    paragraph("Handwash basins must be:", 20),
    ...data.handwashingFacilities.map((item) => bullet(item)),

    // 4. Protective Clothing
    sectionTitle("4. Protective Clothing"),
    caption("Table 1. Protective Clothing Requirements"),
    buildTable(
      ["Item", "Requirement"],
      data.protectiveClothing.map((row) => [row.item, row.requirement])
    ),
    paragraph("Protective clothing must be stored separately from outdoor/personal clothing.", 18),

    // 5. Jewellery and Personal Items
    sectionTitle("5. Jewellery and Personal Items"),
    caption("Table 2. Jewellery and Personal Items Rules"),
    buildTable(
      ["Item", "Rule"],
      data.jewellery.map((row) => [row.item, row.rule])
    ),

    // 6. Illness Reporting and Fitness to Work
    sectionTitle("6. Illness Reporting and Fitness to Work"),
    subsectionTitle("6.1 Reporting Requirements"),
    paragraph("Staff must report the following symptoms to their supervisor before starting work:", 20),
    caption("Table 3. Illness Reporting — Symptoms and Actions"),
    buildTable(
      ["Symptom / Condition", "Action"],
      data.illnessReporting.map((row) => [row.symptomCondition, row.action])
    ),

    subsectionTitle("6.2 Return to Work"),
    paragraph(
      "Staff excluded due to GI illness must be symptom-free for 48 hours minimum before returning to food handling duties. Obtain GP/medical clearance if required. Complete a return-to-work fitness declaration.",
      20
    ),

    // 7. Cuts and Wounds
    sectionTitle("7. Cuts and Wounds Procedure"),
    ...data.cutsAndWounds.map((step, i) => numberedItem(i, step)),
    paragraph(
      "Blue dressings must be used so they are visible if they fall into food. Metal-detectable dressings provide additional protection in production environments.",
      18
    ),

    // 8. Visitor and Contractor Hygiene Rules
    sectionTitle("8. Visitor and Contractor Hygiene Rules"),
    paragraph("All visitors and contractors entering food handling areas must:", 20),
    ...data.visitorRules.map((item) => bullet(item)),

    // 9. Monitoring and Enforcement
    sectionTitle("9. Monitoring and Enforcement"),
    caption("Table 4. Monitoring Schedule"),
    buildTable(
      ["Check", "Frequency", "Responsible"],
      data.monitoring.map((row) => [row.check, row.frequency, row.responsible])
    ),
    paragraph("Non-compliance will be addressed through: (1) verbal reminder and retraining, (2) written warning, (3) disciplinary action.", 18),

    // 10. Return-to-Work Fitness Assessment Form
    sectionTitle("10. Return-to-Work Fitness Assessment Form"),
    caption("Table 5. Return-to-Work Fitness Assessment"),
    buildTable(
      ["Field", "Detail"],
      data.returnToWorkForm.map((row) => [row.field, row.detail])
    ),

    // 11. Records
    sectionTitle("11. Records"),
    caption("Table 6. Record-Keeping Requirements"),
    buildTable(
      ["Record", "Location", "Retention"],
      data.records.map((row) => [row.record, row.location, row.retention])
    ),

    new Paragraph({ text: "", spacing: { before: 120 } }),
    paragraph("Review: This policy must be reviewed annually, or sooner following a food safety incident, change in legislation, audit finding, or illness outbreak.", 18),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4 portrait in twips
            margin: { top: 720, bottom: 720, left: 1080, right: 720 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  text(`${data.metadata.businessName} — Personal Hygiene Policy | ${data.metadata.docNo} | ${data.metadata.date}`, 18, true),
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
