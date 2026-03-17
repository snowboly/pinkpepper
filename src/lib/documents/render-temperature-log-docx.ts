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
import type { TemperatureLogData } from "./temperature-log-schema";

const CALIBRI = "Calibri";
const LIGHT_BLUE = "DCEEFF";
const DAY_SHADE = "F1F5F9";
const BORDER_COLOR = "CBD5E1";
const TEXT = "0F172A";
const MUTED = "475569";

const DAYS_IN_MONTH = 31;

const CELL_BORDER = { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR };
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const TABLE_BORDERS = {
  top: CELL_BORDER, bottom: CELL_BORDER, left: CELL_BORDER, right: CELL_BORDER,
  insideHorizontal: CELL_BORDER, insideVertical: CELL_BORDER,
};

function t(value: string, size = 16, bold = false, color = TEXT): TextRun {
  return new TextRun({ text: value, size, bold, color, font: CALIBRI });
}

function centeredPara(children: TextRun[], spacingBefore = 30, spacingAfter = 30): Paragraph {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: spacingBefore, after: spacingAfter }, children });
}

function headerCell(label: string, opts: { rowSpan?: number; columnSpan?: number; width?: number } = {}): TableCell {
  return new TableCell({
    ...(opts.rowSpan ? { rowSpan: opts.rowSpan } : {}),
    ...(opts.columnSpan ? { columnSpan: opts.columnSpan } : {}),
    ...(opts.width ? { width: { size: opts.width, type: WidthType.DXA } } : {}),
    shading: { type: ShadingType.SOLID, color: LIGHT_BLUE },
    verticalAlign: "center" as const,
    children: [centeredPara([t(label, 15, true)])],
  });
}

function emptyCell(width?: number): TableCell {
  return new TableCell({
    ...(width ? { width: { size: width, type: WidthType.DXA } } : {}),
    children: [new Paragraph({ spacing: { before: 28, after: 28 }, children: [t("")] })],
  });
}

/**
 * Build the 31-row monitoring table dynamically from checksPerDay and probeCount.
 *
 * Column layout per row:
 *   Day | [for each check: Time | Probe 1 (°C) ... Probe N (°C)] | Corrective Action | Initials
 */
function buildLogTable(checksPerDay: number, probeCount: number): Table {
  // Widths in DXA (twentieths of a point). Landscape A4 content ~13900 DXA.
  const DAY_W = 520;
  const TIME_W = 900;
  const PROBE_W = 850;
  const ACTION_W = Math.max(
    2000,
    13900 - DAY_W - checksPerDay * (TIME_W + probeCount * PROBE_W) - 900
  );
  const INITIALS_W = 900;

  // ── Header row 1: Day | Check 1 (span) | Check 2 (span) ... | Corrective Action | Initials ──
  const header1Children: TableCell[] = [
    headerCell("Day", { rowSpan: 2, width: DAY_W }),
  ];
  for (let c = 1; c <= checksPerDay; c++) {
    const label = checksPerDay === 1 ? "Check" : `Check ${c}`;
    header1Children.push(headerCell(label, { columnSpan: 1 + probeCount }));
  }
  header1Children.push(headerCell("Corrective Action", { rowSpan: 2, width: ACTION_W }));
  header1Children.push(headerCell("Initials", { rowSpan: 2, width: INITIALS_W }));

  // ── Header row 2: [for each check] Time | Probe 1 ... Probe N ──
  const header2Children: TableCell[] = [];
  for (let c = 0; c < checksPerDay; c++) {
    header2Children.push(headerCell("Time", { width: TIME_W }));
    for (let p = 1; p <= probeCount; p++) {
      const probeLabel = probeCount === 1 ? "Temp (°C)" : `Probe ${p} (°C)`;
      header2Children.push(headerCell(probeLabel, { width: PROBE_W }));
    }
  }

  // ── Data rows: 31 days ──
  const dataRows = Array.from({ length: DAYS_IN_MONTH }, (_, i) => {
    const dayCells: TableCell[] = [
      new TableCell({
        width: { size: DAY_W, type: WidthType.DXA },
        shading: { type: ShadingType.SOLID, color: DAY_SHADE },
        verticalAlign: "center" as const,
        children: [centeredPara([t(String(i + 1), 15, true)])],
      }),
    ];
    for (let c = 0; c < checksPerDay; c++) {
      dayCells.push(emptyCell(TIME_W));
      for (let p = 0; p < probeCount; p++) {
        dayCells.push(emptyCell(PROBE_W));
      }
    }
    dayCells.push(emptyCell(ACTION_W));
    dayCells.push(emptyCell(INITIALS_W));
    return new TableRow({ children: dayCells });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TABLE_BORDERS,
    rows: [
      new TableRow({ tableHeader: true, children: header1Children }),
      new TableRow({ tableHeader: true, children: header2Children }),
      ...dataRows,
    ],
  });
}

function signatureTable(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER, insideHorizontal: NO_BORDER, insideVertical: NO_BORDER },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ spacing: { after: 0 }, children: [t("Cold chain supervisor: ___________________________   Date: ___________", 15)] })],
          }),
          new TableCell({
            children: [new Paragraph({ spacing: { after: 0 }, children: [t("HACCP responsible: ___________________________   Date: ___________", 15)] })],
          }),
        ],
      }),
    ],
  });
}

export async function renderTemperatureLogDocx(data: TemperatureLogData): Promise<ArrayBuffer> {
  const { metadata: m } = data;
  const checksPerDay = Math.min(Math.max(m.checksPerDay ?? 2, 1), 4);
  const probeCount = Math.min(Math.max(m.probeCount ?? 2, 1), 4);

  const children: (Paragraph | Table)[] = [
    // Metadata bar
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: TABLE_BORDERS,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ spacing: { before: 40, after: 40 }, children: [t(`Premises: ${m.premises || "___________________________"}`, 17, true)] })],
            }),
            new TableCell({
              width: { size: 3600, type: WidthType.DXA },
              children: [new Paragraph({ spacing: { before: 40, after: 40 }, children: [t(`Month: ${m.month || "_____________"}   Year: ${m.year || "_____"}`, 17)] })],
            }),
            new TableCell({
              width: { size: 3000, type: WidthType.DXA },
              children: [new Paragraph({ spacing: { before: 40, after: 40 }, children: [t("Unit / Chamber No.: _________", 17)] })],
            }),
          ],
        }),
      ],
    }),

    new Paragraph({ spacing: { after: 60 }, children: [t(`Target temperature range:  ${m.targetRange}`, 15, false, MUTED)] }),

    buildLogTable(checksPerDay, probeCount),

    new Paragraph({ spacing: { after: 80 }, children: [] }),
    new Paragraph({ spacing: { after: 60 }, children: [t("(*) Probe location: ___________________________", 14, false, MUTED)] }),
    signatureTable(),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 600, bottom: 600, left: 720, right: 720 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 20 },
                children: [t("TEMPERATURE MONITORING LOG", 22, true)],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [t(`${m.docNo}  |  Rev. ${m.revision}  |  Issued: ${m.issueDate}`, 15, false, MUTED)],
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
                  new TextRun({ text: "Page ", size: 15, color: MUTED, font: CALIBRI }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 15, color: MUTED, font: CALIBRI }),
                  new TextRun({ text: " of ", size: 15, color: MUTED, font: CALIBRI }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 15, color: MUTED, font: CALIBRI }),
                  new TextRun({ text: `   |   ${m.docNo}`, size: 15, color: MUTED, font: CALIBRI }),
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
