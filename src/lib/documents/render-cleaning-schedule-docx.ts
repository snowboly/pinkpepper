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
import type { CleaningScheduleData } from "./cleaning-schedule-schema";

const CALIBRI = "Calibri";
const LIGHT_BLUE = "DCEEFF";
const BORDER = "CBD5E1";
const TEXT = "0F172A";
const MUTED = "475569";

function text(value: string, size = 20, bold = false): TextRun {
  return new TextRun({ text: value, size, bold, color: TEXT, font: CALIBRI });
}

function para(value: string, size = 20, bold = false): Paragraph {
  return new Paragraph({ children: [text(value, size, bold)], spacing: { after: 60 } });
}

function sectionTitle(title: string): Paragraph {
  return new Paragraph({
    children: [text(title, 26, true)],
    spacing: { before: 160, after: 100 },
  });
}

function caption(value: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: value, size: 18, italics: true, color: MUTED, font: CALIBRI })],
    spacing: { after: 60 },
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
          (h) =>
            new TableCell({
              shading: { type: ShadingType.SOLID, color: LIGHT_BLUE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: h, size: 18, bold: true, color: TEXT, font: CALIBRI })],
                }),
              ],
            }),
        ),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map((value) => new TableCell({ children: [para(value, 18)] })),
          }),
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

export async function renderCleaningScheduleDocx(data: CleaningScheduleData): Promise<ArrayBuffer> {
  const children: (Paragraph | Table)[] = [
    para(`Premises: ${data.metadata.premises || "_______________"}`, 18),
    para(`Document No.: ${data.metadata.docNo}   Revision: ${data.metadata.revision}   Date: ${data.metadata.date}`, 18),
    para(`Approved by: ${data.metadata.approvedBy || "_______________"}   Review Date: ${data.metadata.reviewDate || "_______________"}`, 18),
    new Paragraph({ text: "", spacing: { after: 80 } }),

    sectionTitle("Cleaning Method Key"),
    buildTable(
      ["Code", "Method"],
      [
        ["M1", "Manual wash: hot water (>=60C) + detergent; rinse; apply disinfectant; contact time; rinse if required"],
        ["M2", "Foam application: apply foam detergent; dwell time; rinse; apply disinfectant; contact time; rinse if required"],
        ["M3", "Dishwasher: minimum 60C wash cycle"],
        ["M4", "CIP (Clean in Place): automated detergent + rinse + disinfectant cycle"],
        ["M5", "Dry clean only: brush off debris; wipe with damp sanitiser-impregnated cloth; no water immersion"],
        ["M6", "External surfaces: damp wipe with all-purpose cleaner or disinfectant"],
      ],
    ),

    sectionTitle("Cleaning Chemical Reference"),
    caption("Table 1. Approved Cleaning Chemicals"),
    buildTable(
      ["Chemical Name", "Product", "Dilution", "Contact Time", "Active Ingredient", "COSHH Sheet Location"],
      data.chemicalReference.map((r) => [r.chemicalName, r.product, r.dilution, r.contactTime, r.activeIngredient, r.coshhLocation]),
    ),

    sectionTitle("Daily Cleaning Tasks"),
    caption("Table 2. Daily Cleaning Schedule - Fixed Columns"),
    buildTable(
      ["Item", "Method", "Chemical", "Dilution", "Contact Time", "Frequency", "Responsible", "Verification"],
      data.dailyTasks.map((r) => [r.item, r.method, r.chemical, r.dilution, r.contactTime, r.frequency, r.responsible, r.verification]),
    ),

    sectionTitle("Weekly Cleaning Tasks"),
    caption("Table 3. Weekly Cleaning Schedule - Fixed Columns"),
    buildTable(
      ["Item", "Method", "Chemical", "Dilution", "Contact Time", "Responsible", "Verification"],
      data.weeklyTasks.map((r) => [r.item, r.method, r.chemical, r.dilution, r.contactTime, r.responsible, r.verification]),
    ),

    sectionTitle("Monthly Cleaning Tasks"),
    caption("Table 4. Monthly Cleaning Schedule - Fixed Columns"),
    buildTable(
      ["Item", "Method", "Chemical", "Responsible", "Verification"],
      data.monthlyTasks.map((r) => [r.item, r.method, r.chemical, r.responsible, r.verification]),
    ),

    sectionTitle("Verification - ATP Cleaning Pass/Fail Targets"),
    caption("Table 5. ATP Bioluminescence Targets"),
    buildTable(
      ["Surface Category", "Pass", "Borderline", "Fail"],
      data.atpTargets.map((r) => [r.surfaceCategory, r.pass, r.borderline, r.fail]),
    ),

    sectionTitle("Cleaning Records Log"),
    caption("Table 6. Daily Cleaning Log - Sign-Off Sheet"),
    buildTable(
      ["Date", "Task", "Time Completed", "Operative (initials)", "Supervisor Check (initials)", "Issues / Corrective Action"],
      Array.from({ length: 8 }, () => ["", "", "", "", "", ""]),
    ),

    new Paragraph({ text: "", spacing: { before: 120 } }),
    para("Records retained: minimum 3 months (or as required by HACCP plan).", 18),
    para("Review: This schedule must be reviewed annually, or sooner if chemicals, equipment, premises layout, or regulations change.", 18),
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
                  text(`${data.metadata.premises || "Premises"} - Cleaning and Disinfection Schedule | ${data.metadata.docNo} | ${data.metadata.date}`, 18, true),
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
