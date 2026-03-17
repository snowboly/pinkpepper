import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  ImageRun,
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
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { HaccpDocumentData } from "./haccp-schema";

const CALIBRI = "Calibri";
const LIGHT_BLUE = "DCEEFF";
const BORDER = "CBD5E1";
const TEXT = "0F172A";
const MUTED = "475569";

type DocxLogo = {
  data: Buffer;
  type: "png" | "jpg";
};

async function loadOptionalLogo(logoUrl: string | null | undefined): Promise<DocxLogo | null> {
  if (!logoUrl) return null;

  if (logoUrl.startsWith("data:image/")) {
    const match = logoUrl.match(/^data:image\/(png|jpeg);base64,(.+)$/);
    if (!match) return null;

    return {
      data: Buffer.from(match[2], "base64"),
      type: match[1] === "jpeg" ? "jpg" : "png",
    };
  }

  if (!logoUrl.startsWith("/")) return null;

  try {
    const filePath = join(process.cwd(), "public", logoUrl.replace(/^\/+/, ""));
    const data = await readFile(filePath);
    const type = logoUrl.toLowerCase().endsWith(".jpg") || logoUrl.toLowerCase().endsWith(".jpeg") ? "jpg" : "png";
    return { data, type };
  } catch {
    return null;
  }
}

function text(textValue: string, size = 20, bold = false): TextRun {
  return new TextRun({
    text: textValue,
    size,
    bold,
    color: TEXT,
    font: CALIBRI,
  });
}

function paragraph(textValue: string, size = 20, bold = false): Paragraph {
  return new Paragraph({
    children: [text(textValue, size, bold)],
    spacing: { after: 100 },
  });
}

function sectionTitle(title: string): Paragraph {
  return new Paragraph({
    children: [text(title, 28, true)],
    spacing: { before: 140, after: 120 },
  });
}

function caption(value: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: value,
        size: 20,
        italics: true,
        color: MUTED,
        font: CALIBRI,
      }),
    ],
    spacing: { after: 80 },
  });
}

function buildTable(headers: string[], rows: string[][]): Table {
  const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((header) =>
          new TableCell({
            shading: { type: ShadingType.SOLID, color: LIGHT_BLUE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: header,
                    size: 22,
                    bold: true,
                    color: TEXT,
                    font: CALIBRI,
                  }),
                ],
              }),
            ],
          }),
        ),
      }),
      ...rows.map((row) =>
        new TableRow({
          children: row.map((value) =>
            new TableCell({
              children: [paragraph(value, 20)],
            }),
          ),
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

export async function renderHaccpDocx(data: HaccpDocumentData): Promise<ArrayBuffer> {
  const logo = await loadOptionalLogo(data.metadata.logoUrl);
  const processFlowText = data.processFlow.length > 0
    ? data.processFlow.map((step, index) => `${index + 1}. ${step}`).join("\n")
    : "No process flow provided.";

  const children = [
    sectionTitle("Process Flow"),
    paragraph(processFlowText),
    sectionTitle("Process Steps Table"),
    caption("Table 1. Process Steps"),
    buildTable(
      ["Step No.", "Step Name", "Full Step Description"],
      data.steps.map((step) => [String(step.stepNo), step.stepName, step.fullStepDescription]),
    ),
    sectionTitle("Hazard Analysis Table"),
    caption("Table 2. Hazard Analysis"),
    buildTable(
      ["Step No.", "Step Name", "Hazard Type", "Hazard Description", "Control Measure", "Is CCP?"],
      data.hazards.map((hazard) => [
        String(hazard.stepNo),
        hazard.stepName,
        hazard.hazardType,
        hazard.hazardDescription,
        hazard.controlMeasure,
        hazard.isCcp,
      ]),
    ),
  ];

  if (data.ccps.length > 0) {
    children.push(sectionTitle("CCP Table"));
    children.push(caption("Table 3. Critical Control Points"));
    children.push(
      buildTable(
        ["CCP No.", "Step Name", "Hazard", "Critical Limit", "Monitoring", "Corrective Action"],
        data.ccps.map((ccp) => [
          String(ccp.ccpNo),
          ccp.stepName,
          ccp.hazard,
          ccp.criticalLimit,
          ccp.monitoring,
          ccp.correctiveAction,
        ]),
      ),
    );
  }

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
                  ...(logo ? [
                    new ImageRun({
                      data: logo.data,
                      transformation: { width: 64, height: 32 },
                      type: logo.type,
                    }),
                    new TextRun({ text: "   ", font: CALIBRI, size: 20 }),
                  ] : []),
                  text(`${data.metadata.companyName} | Version ${data.metadata.version} | ${data.metadata.date}`, 20, true),
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
                  new TextRun({
                    text: `Created by: ${data.metadata.createdBy}   Approved by: ${data.metadata.approvedBy}   Page `,
                    size: 20,
                    color: MUTED,
                    font: CALIBRI,
                  }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 20, color: MUTED, font: CALIBRI }),
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
