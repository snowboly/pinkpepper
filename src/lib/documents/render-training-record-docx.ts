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
import type { TrainingRecordData } from "./training-record-schema";

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

function blankRows(count: number, cols: string[]): TableRow[] {
  return Array.from({ length: count }, () =>
    new TableRow({
      children: cols.map(() =>
        new TableCell({
          children: [para("", 18)],
        })
      ),
    })
  );
}

function buildFixedTable(headers: string[], rowCount: number): Table {
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

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...blankRows(rowCount, headers)],
    borders: {
      top: border, bottom: border, left: border, right: border,
      insideHorizontal: border, insideVertical: border,
    },
  });
}

export async function renderTrainingRecordDocx(data: TrainingRecordData): Promise<ArrayBuffer> {
  const children: (Paragraph | Table)[] = [
    // Employee info block
    new Paragraph({
      text: "Individual Training Record",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 160 },
    }),
    infoRow("Employee Name", data.employeeName || "_______________"),
    infoRow("Job Role", data.jobRole || "_______________"),
    infoRow("Department", data.department || "_______________"),
    infoRow("Start Date", data.startDate || "_______________"),

    new Paragraph({
      children: [],
      spacing: { before: 100, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER, space: 4 } },
    }),

    // Induction
    sectionHeading("Induction Training"),
    infoRow("Induction Completed", "☐ Yes  ☐ No"),
    infoRow("Date"),
    infoRow("Trainer"),
    para("Topics Covered:", 20, true),
    para("☐ Personal hygiene and handwashing", 18),
    para("☐ Protective clothing requirements", 18),
    para("☐ Illness reporting and exclusion", 18),
    para("☐ Cross-contamination prevention", 18),
    para("☐ Temperature control", 18),
    para("☐ Allergen awareness", 18),
    para("☐ Cleaning and sanitation", 18),
    para("☐ Pest awareness", 18),
    para("☐ Emergency procedures", 18),
    para("☐ Site-specific hazards and controls", 18),
    infoRow("Assessment", "☐ Competent  ☐ Requires further training"),
    infoRow("Employee Signature"),
    infoRow("Trainer Signature"),

    new Paragraph({
      children: [],
      spacing: { before: 100, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER, space: 4 } },
    }),

    // Formal qualifications
    sectionHeading("Formal Food Safety Qualifications"),
    buildFixedTable(
      ["Qualification", "Level", "Provider", "Date Achieved", "Certificate No.", "Expiry Date"],
      4
    ),

    new Paragraph({ text: "", spacing: { after: 160 } }),

    // On-the-job training log
    sectionHeading("On-the-Job Training Log"),
    buildFixedTable(
      ["Date", "Task / Topic", "Trainer", "Duration", "Assessment", "Signature"],
      8
    ),

    new Paragraph({ text: "", spacing: { after: 160 } }),

    // Annual refresher
    sectionHeading("Annual Refresher Training"),
    buildFixedTable(
      ["Date", "Topics Covered", "Duration", "Trainer", "Employee Signature"],
      4
    ),

    new Paragraph({ text: "", spacing: { after: 160 } }),

    // Competency assessments
    sectionHeading("Competency Assessments"),
    buildFixedTable(
      ["Date", "Task Assessed", "Assessor", "Outcome", "Comments"],
      4
    ),

    new Paragraph({ text: "", spacing: { after: 160 } }),

    para("Record Retention: Duration of employment + 3 years", 18),
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
                    text: `${data.metadata.businessName} | Training Record | ${data.metadata.docNo} | ${data.metadata.date}`,
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
