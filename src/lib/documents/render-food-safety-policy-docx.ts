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
import type { GeneratedDocument, DocumentTable } from "./types";
import type { SopDocumentData } from "./sop-schema";

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

function buildTable(table: DocumentTable): Table {
  const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER };

  const headerRow = new TableRow({
    tableHeader: true,
    children: table.columns.map(
      (col) =>
        new TableCell({
          shading: { type: ShadingType.SOLID, color: LIGHT_BLUE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: col.header, size: 20, bold: true, color: TEXT, font: CALIBRI })],
            }),
          ],
        })
    ),
  });

  const dataRows = table.rows.map(
    (row) =>
      new TableRow({
        children: table.columns.map(
          (col) =>
            new TableCell({ children: [para(row[col.header] ?? "", 18)] })
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

export async function renderFoodSafetyPolicyDocx(
  doc: GeneratedDocument,
  sop: SopDocumentData
): Promise<ArrayBuffer> {
  const children: (Paragraph | Table)[] = [];

  // Sections — no metadata block, no AI disclaimer
  for (let si = 0; si < doc.sections.length; si++) {
    const section = doc.sections[si];
    children.push(
      new Paragraph({
        text: `${si + 1}. ${section.heading}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 100 },
      })
    );

    for (const line of section.content.split("\n")) {
      if (line.trim()) {
        children.push(para(line, 20));
      }
    }

    if (section.subsections) {
      for (let ssi = 0; ssi < section.subsections.length; ssi++) {
        const sub = section.subsections[ssi];
        children.push(
          new Paragraph({
            text: `${si + 1}.${ssi + 1} ${sub.heading}`,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 160, after: 80 },
          })
        );
        for (const line of sub.content.split("\n")) {
          if (line.trim()) {
            children.push(para(line, 20));
          }
        }
      }
    }
  }

  // Tables
  if (doc.tables) {
    for (const table of doc.tables) {
      if (table.caption) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: table.caption, bold: true, size: 22, font: CALIBRI })],
            spacing: { before: 200, after: 80 },
          })
        );
      }
      children.push(buildTable(table));
      children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
    }
  }

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
                  text(`${sop.metadata.businessName} | ${doc.title} | ${sop.metadata.docNo} | ${sop.metadata.date}`, 18, true),
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
                  new TextRun({ text: `Approved by: ${sop.metadata.approvedBy || "_______________"}   •   Page `, size: 18, color: MUTED, font: CALIBRI }),
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
