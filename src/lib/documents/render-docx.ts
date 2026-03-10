import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
} from "docx";
import type { GeneratedDocument } from "./types";

const BRAND_COLOR = "E11D48"; // PinkPepper red

function metaRow(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 20 }),
      new TextRun({ text: value, size: 20 }),
    ],
    spacing: { after: 60 },
  });
}

function renderTable(table: GeneratedDocument["tables"][0]): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: table.columns.map(
      (col) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: col.header, bold: true, color: "FFFFFF", size: 18 })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          shading: { type: ShadingType.SOLID, color: BRAND_COLOR },
        })
    ),
  });

  const dataRows = table.rows.map(
    (row) =>
      new TableRow({
        children: table.columns.map(
          (col) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: row[col.header] ?? "", size: 18 })],
                }),
              ],
            })
        ),
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      insideH: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      insideV: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
    },
    rows: [headerRow, ...dataRows],
  });
}

export async function renderDocx(doc: GeneratedDocument): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [
    // Title
    new Paragraph({
      text: doc.title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
      style: "Title",
    }),

    // Metadata block
    metaRow("Document No.", doc.documentNumber),
    metaRow("Version", doc.version),
    metaRow("Date", doc.date),
    metaRow("Approved By", doc.approvedBy),
    metaRow("Scope", doc.scope),

    new Paragraph({ text: "", spacing: { after: 200 } }),
  ];

  for (const section of doc.sections) {
    children.push(
      new Paragraph({
        text: section.heading,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 100 },
      })
    );

    for (const line of section.content.split("\n")) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line, size: 22 })],
          spacing: { after: 80 },
        })
      );
    }

    if (section.subsections) {
      for (const sub of section.subsections) {
        children.push(
          new Paragraph({
            text: sub.heading,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
          })
        );
        for (const line of sub.content.split("\n")) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: line, size: 22 })],
              spacing: { after: 60 },
            })
          );
        }
      }
    }
  }

  if (doc.tables) {
    for (const table of doc.tables) {
      if (table.caption) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: table.caption, bold: true, size: 22 })],
            spacing: { before: 200, after: 80 },
          })
        );
      }
      children.push(renderTable(table));
      children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
    }
  }

  const document = new Document({
    sections: [{ children }],
    styles: {
      paragraphStyles: [
        {
          id: "Title",
          name: "Title",
          run: { color: BRAND_COLOR, bold: true, size: 48 },
        },
      ],
    },
  });

  return Packer.toBuffer(document);
}
