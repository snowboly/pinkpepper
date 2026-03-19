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
import {
  getTrainingInductionCompletedLabel,
  getTrainingInductionTopics,
  getTrainingLogRows,
  getTrainingQualificationRows,
} from "./training-record-render-helpers";

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
        }),
    ),
  });

  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map((value) => new TableCell({ children: [para(value, 18)] })),
      }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
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

export async function renderTrainingRecordDocx(data: TrainingRecordData): Promise<ArrayBuffer> {
  const children: (Paragraph | Table)[] = [
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

    sectionHeading("Induction Training"),
    infoRow("Induction Completed", getTrainingInductionCompletedLabel(data)),
    infoRow("Date", data.inductionDate || "_______________"),
    infoRow("Trainer", data.trainerName || "_______________"),
    para("Topics Covered:", 20, true),
    ...getTrainingInductionTopics(data).map((topic) => para(`- ${topic}`, 18)),
    infoRow("Assessment", data.inductionAssessment || "_______________"),
    infoRow("Employee Signature"),
    infoRow("Trainer Signature"),

    new Paragraph({
      children: [],
      spacing: { before: 100, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER, space: 4 } },
    }),

    sectionHeading("Formal Food Safety Qualifications"),
    buildTable(
      ["Qualification", "Level", "Provider", "Date Achieved", "Certificate No.", "Expiry Date"],
      getTrainingQualificationRows(data),
    ),

    new Paragraph({ text: "", spacing: { after: 160 } }),

    sectionHeading("On-the-Job Training Log"),
    buildTable(
      ["Date", "Task / Topic", "Trainer", "Duration", "Assessment", "Signature"],
      getTrainingLogRows(data),
    ),

    new Paragraph({ text: "", spacing: { after: 160 } }),

    sectionHeading("Annual Refresher Training"),
    buildTable(
      ["Date", "Topics Covered", "Duration", "Trainer", "Employee Signature"],
      Array.from({ length: 4 }, () => ["", "", "", "", ""]),
    ),

    new Paragraph({ text: "", spacing: { after: 160 } }),

    sectionHeading("Competency Assessments"),
    buildTable(
      ["Date", "Task Assessed", "Assessor", "Outcome", "Comments"],
      Array.from({ length: 4 }, () => ["", "", "", "", ""]),
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
                  new TextRun({ text: `Approved by: ${data.metadata.approvedBy || "_______________"}   |   Page `, size: 18, color: MUTED, font: CALIBRI }),
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
