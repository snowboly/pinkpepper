import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  PageNumber,
  Packer,
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
import { NextResponse } from "next/server";
import {
  canExportDocx,
  getConversationTranscriptForExport,
  getExportContext,
  recordExportUsage,
} from "@/lib/export/common";
import { renderDocx } from "@/lib/documents/render-docx";
import type { GeneratedDocument } from "@/lib/documents/types";
import { exportLimiter, checkRateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const CALIBRI = "Calibri";
const BRAND_COLOR = "E11D48";
const GRAY_COLOR = "64748B";
const TEXT_COLOR = "0F172A";
const ALT_ROW_COLOR = "F1F5F9";
const BORDER_COLOR = "CBD5E1";

const borderOpts = { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR };

// ---------------------------------------------------------------------------
// Helpers: markdown table detection and rendering
// ---------------------------------------------------------------------------

export function isTableLine(line: string): boolean {
  return /^\|.+\|$/.test(line.trim());
}

export function isSeparatorLine(line: string): boolean {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

export function splitTableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function buildTranscriptTable(tableLines: string[]): Table {
  const headerCells = splitTableCells(tableLines[0]);
  const dataRows = tableLines.slice(2); // skip header row and separator row

  const headerRow = new TableRow({
    tableHeader: true,
    children: headerCells.map(
      (cell) =>
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: cell, bold: true, color: "FFFFFF", size: 18, font: CALIBRI }),
              ],
            }),
          ],
          shading: { type: ShadingType.SOLID, color: BRAND_COLOR },
        })
    ),
  });

  const bodyRows = dataRows.map((rowLine, ri) => {
    const cells = splitTableCells(rowLine);
    // Pad if this row has fewer cells than the header
    while (cells.length < headerCells.length) cells.push("");

    return new TableRow({
      children: cells.slice(0, headerCells.length).map(
        (cell) =>
          new TableCell({
            children: [
              new Paragraph({
                children: parseInlineBold(cell, 18, TEXT_COLOR),
              }),
            ],
            shading:
              ri % 2 === 1 ? { type: ShadingType.SOLID, color: ALT_ROW_COLOR } : undefined,
          })
      ),
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: borderOpts,
      bottom: borderOpts,
      left: borderOpts,
      right: borderOpts,
      insideHorizontal: borderOpts,
      insideVertical: borderOpts,
    },
    rows: [headerRow, ...bodyRows],
  });
}

// ---------------------------------------------------------------------------
// Helpers: inline markdown bold (**text**) → TextRun[]
// ---------------------------------------------------------------------------

export function parseInlineBold(text: string, size: number, color: string): TextRun[] {
  const segments = text.split(/\*\*(.+?)\*\*/);
  // Use the original split index for parity (odd = bold), then drop nulls.
  // Filtering BEFORE the map would reindex and invert bold state for strings
  // that start with **bold** (the leading empty segment would be removed,
  // shifting every subsequent segment by one position).
  return segments
    .map((segment, i) =>
      segment.length === 0
        ? null
        : new TextRun({ text: segment, bold: i % 2 === 1, size, font: CALIBRI, color })
    )
    .filter((run): run is TextRun => run !== null);
}

// ---------------------------------------------------------------------------
// Main content parser: splits a message string into Paragraph and Table nodes
// ---------------------------------------------------------------------------

export function parseContentToDocxElements(content: string): (Paragraph | Table)[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const elements: (Paragraph | Table)[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines
    if (line.trim().length === 0) {
      i++;
      continue;
    }

    // Markdown table block: collect consecutive table lines
    if (isTableLine(line)) {
      const tableLines: string[] = [line];
      i++;
      while (i < lines.length && isTableLine(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }

      // Valid table: header + separator + at least one data row
      if (tableLines.length >= 3 && isSeparatorLine(tableLines[1])) {
        elements.push(buildTranscriptTable(tableLines));
        // Add a small spacer paragraph after the table
        elements.push(new Paragraph({ children: [], spacing: { after: 160 } }));
      } else {
        // Not a valid table — render as plain text
        for (const tl of tableLines) {
          elements.push(
            new Paragraph({
              children: parseInlineBold(tl, 22, TEXT_COLOR),
              spacing: { after: 120 },
            })
          );
        }
      }
      continue;
    }

    // Regular text line (with inline bold support)
    elements.push(
      new Paragraph({
        children: parseInlineBold(line, 22, TEXT_COLOR),
        spacing: { after: 120 },
      })
    );
    i++;
  }

  return elements;
}

// ---------------------------------------------------------------------------
// Route helpers
// ---------------------------------------------------------------------------

export function getStructuredGeneratedDocument(
  messages: Array<{
    role: "user" | "assistant";
    metadata: Record<string, unknown> | null;
  }>
): GeneratedDocument | undefined {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== "assistant") continue;

    const generatedDocument = message.metadata?.generatedDocument as GeneratedDocument | undefined;
    if (generatedDocument?.documentType && generatedDocument?.sections) {
      return generatedDocument;
    }
  }

  return undefined;
}

function buildHeaderItems() {
  return async (): Promise<(TextRun | ImageRun)[]> => {
    try {
      const logoPath = join(process.cwd(), "public", "LogoV3.png");
      const logoBuffer = await readFile(logoPath);
      return [
        new ImageRun({ data: logoBuffer, transformation: { width: 120, height: 32 }, type: "png" }),
        new TextRun({ text: "  |  Food Safety Compliance", color: GRAY_COLOR, size: 16, font: CALIBRI }),
      ];
    } catch {
      return [
        new TextRun({ text: "PinkPepper", bold: true, color: BRAND_COLOR, size: 20, font: CALIBRI }),
        new TextRun({ text: "  |  Food Safety Compliance", color: GRAY_COLOR, size: 16, font: CALIBRI }),
      ];
    }
  };
}

function formatTimestamp(value: string | null) {
  if (!value) return null;

  return new Date(value).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const { supabase, userId, tier, isAdmin } = await getExportContext();

    const rateLimitRes = await checkRateLimit(exportLimiter, userId);
    if (rateLimitRes) return rateLimitRes;

    if (!canExportDocx(tier, isAdmin)) {
      return NextResponse.json({ error: "DOCX export is only available on Pro." }, { status: 403 });
    }

    const body = (await request.json()) as { conversationId?: string };
    const conversationId = body.conversationId?.trim();
    if (!conversationId || conversationId.length > 128) {
      return NextResponse.json({ error: "A valid conversationId is required." }, { status: 400 });
    }

    const docData = await getConversationTranscriptForExport({
      supabase,
      userId,
      conversationId,
    });

    const generatedDoc = getStructuredGeneratedDocument(docData.messages);

    let bodyBytes: Uint8Array;

    if (generatedDoc?.documentType && generatedDoc?.sections) {
      const buffer = await renderDocx(generatedDoc);
      bodyBytes = new Uint8Array(buffer);
    } else {
      const headerItems = await buildHeaderItems()();

      const transcriptParagraphs = docData.messages.flatMap((message) => {
        const speaker = message.role === "assistant" ? "PinkPepper" : "You";
        const timestamp = formatTimestamp(message.createdAt);

        return [
          new Paragraph({
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({ text: speaker, bold: true, color: BRAND_COLOR, size: 24, font: CALIBRI }),
              ...(timestamp
                ? [new TextRun({ text: `  -  ${timestamp}`, color: GRAY_COLOR, size: 18, font: CALIBRI })]
                : []),
            ],
          }),
          ...parseContentToDocxElements(message.content),
        ];
      });

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: { width: 11906, height: 16838 },
                margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
              },
            },
            headers: {
              default: new Header({
                children: [new Paragraph({ children: headerItems })],
              }),
            },
            footers: {
              default: new Footer({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    border: { top: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0", space: 4 } },
                    children: [
                      new TextRun({ text: "Generated by PinkPepper - Conversation transcript - Page ", size: 16, color: GRAY_COLOR, font: CALIBRI }),
                      new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRAY_COLOR, font: CALIBRI }),
                      new TextRun({ text: " of ", size: 16, color: GRAY_COLOR, font: CALIBRI }),
                      new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: GRAY_COLOR, font: CALIBRI }),
                    ],
                  }),
                ],
              }),
            },
            children: [
              new Paragraph({
                heading: HeadingLevel.HEADING_1,
                children: [
                  new TextRun({ text: docData.conversationTitle, bold: true, color: BRAND_COLOR, size: 48, font: CALIBRI }),
                ],
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Exported: ${new Date().toISOString()}`, size: 20, font: CALIBRI, color: GRAY_COLOR }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Conversation transcript exported from PinkPepper.",
                    italics: true,
                    color: GRAY_COLOR,
                    size: 18,
                    font: CALIBRI,
                  }),
                ],
                spacing: { after: 240 },
              }),
              ...transcriptParagraphs,
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      bodyBytes = new Uint8Array(buffer);
    }

    await recordExportUsage({ supabase, userId, format: "docx", conversationId });

    const safeId = conversationId.replace(/[^\w-]/g, "_").substring(0, 64);
    const fileName = `pinkpepper-${safeId}.docx`;

    return new NextResponse(Buffer.from(bodyBytes), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (message === "CONVERSATION_NOT_FOUND") {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }
    if (message === "NO_ASSISTANT_CONTENT" || message === "NO_CONVERSATION_MESSAGES") {
      return NextResponse.json({ error: "No conversation content available to export." }, { status: 400 });
    }
    console.error("[export/docx] unhandled error:", error);
    return NextResponse.json({ error: "Export failed. Please try again." }, { status: 500 });
  }
}
