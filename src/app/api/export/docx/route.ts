import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  LevelFormat,
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
const MONO_FONT = "Consolas";
const BRAND_COLOR = "E11D48";
const GRAY_COLOR = "64748B";
const TEXT_COLOR = "0F172A";
const ALT_ROW_COLOR = "F1F5F9";
const BORDER_COLOR = "CBD5E1";
const CODE_BG_COLOR = "F1F5F9";
const CODE_TEXT_COLOR = "334155";
const LINK_COLOR = "1E5AA8";
const QUOTE_BORDER_COLOR = "CBD5E1";

const BODY_SIZE = 22; // 11pt (half-points)
const H1_SIZE = 36; // 18pt
const H2_SIZE = 28; // 14pt
const H3_SIZE = 24; // 12pt
const H4_SIZE = 22; // 11pt

const ORDERED_LIST_REF = "pp-ordered-list";

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
                children: parseInline(cell, 18, TEXT_COLOR),
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
// Retained as a stable export so older call sites keep working. New code
// should prefer `parseInline`, which also handles inline code, links and
// strikethrough.

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
// Richer inline parser: bold, inline code, strikethrough, and links
// ---------------------------------------------------------------------------

export function parseInline(
  text: string,
  size: number,
  color: string
): (TextRun | ExternalHyperlink)[] {
  const out: (TextRun | ExternalHyperlink)[] = [];
  let buffer = "";
  let i = 0;

  const flush = () => {
    if (buffer.length === 0) return;
    out.push(new TextRun({ text: buffer, size, color, font: CALIBRI }));
    buffer = "";
  };

  while (i < text.length) {
    const ch = text[i];

    // Inline code: `code`  (content is literal — no nested parsing)
    if (ch === "`") {
      const end = text.indexOf("`", i + 1);
      if (end > i + 1) {
        flush();
        out.push(
          new TextRun({
            text: text.slice(i + 1, end),
            size,
            color: CODE_TEXT_COLOR,
            font: MONO_FONT,
            shading: { type: ShadingType.SOLID, color: CODE_BG_COLOR, fill: CODE_BG_COLOR },
          })
        );
        i = end + 1;
        continue;
      }
    }

    // Link: [text](url)
    if (ch === "[") {
      const closeBracket = text.indexOf("]", i + 1);
      if (closeBracket > i && text[closeBracket + 1] === "(") {
        const closeParen = text.indexOf(")", closeBracket + 2);
        if (closeParen > closeBracket + 1) {
          flush();
          const linkText = text.slice(i + 1, closeBracket);
          const url = text.slice(closeBracket + 2, closeParen);
          out.push(
            new ExternalHyperlink({
              link: url,
              children: [
                new TextRun({
                  text: linkText,
                  size,
                  color: LINK_COLOR,
                  font: CALIBRI,
                  underline: {},
                }),
              ],
            })
          );
          i = closeParen + 1;
          continue;
        }
      }
    }

    // Strikethrough: ~~text~~
    if (ch === "~" && text[i + 1] === "~") {
      const end = text.indexOf("~~", i + 2);
      if (end > i + 2) {
        flush();
        out.push(
          new TextRun({
            text: text.slice(i + 2, end),
            size,
            color,
            font: CALIBRI,
            strike: true,
          })
        );
        i = end + 2;
        continue;
      }
    }

    // Bold: **text**
    if (ch === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end > i + 2) {
        flush();
        out.push(
          new TextRun({
            text: text.slice(i + 2, end),
            size,
            color,
            font: CALIBRI,
            bold: true,
          })
        );
        i = end + 2;
        continue;
      }
    }

    buffer += ch;
    i++;
  }

  flush();
  return out;
}

// ---------------------------------------------------------------------------
// Block-level markdown detection helpers
// ---------------------------------------------------------------------------

export function parseHeadingLine(line: string): { level: number; text: string } | null {
  const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
  if (!match) return null;
  return { level: match[1].length, text: match[2] };
}

export function isHorizontalRule(line: string): boolean {
  const trimmed = line.trim();
  return /^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed) || /^_{3,}$/.test(trimmed);
}

const BULLET_RE = /^(\s*)([-*+])\s+(.+)$/;
const ORDERED_RE = /^(\s*)(\d+)[.)]\s+(.+)$/;
const QUOTE_RE = /^\s*>\s?(.*)$/;
const FENCE_RE = /^\s*```(.*)$/;

// ---------------------------------------------------------------------------
// Block builders
// ---------------------------------------------------------------------------

function headingSizeFor(level: number): number {
  if (level <= 1) return H1_SIZE;
  if (level === 2) return H2_SIZE;
  if (level === 3) return H3_SIZE;
  return H4_SIZE;
}

// Strip common inline markdown markers from heading text so we can emit one
// clean bold run at the heading size. Headings rarely need nested styling,
// and keeping them as a single run avoids Word's "mixed heading" quirks.
function stripInlineMarkers(value: string): string {
  return value
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
}

function buildHeadingParagraph(level: number, textValue: string): Paragraph {
  const heading =
    level <= 1
      ? HeadingLevel.HEADING_1
      : level === 2
      ? HeadingLevel.HEADING_2
      : level === 3
      ? HeadingLevel.HEADING_3
      : HeadingLevel.HEADING_4;

  const color = level <= 2 ? BRAND_COLOR : TEXT_COLOR;
  const size = headingSizeFor(level);

  return new Paragraph({
    heading,
    spacing: { before: level <= 2 ? 280 : 200, after: level <= 2 ? 140 : 100 },
    children: [
      new TextRun({
        text: stripInlineMarkers(textValue),
        size,
        color,
        font: CALIBRI,
        bold: true,
      }),
    ],
  });
}

function buildHorizontalRule(): Paragraph {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR, space: 1 },
    },
    children: [],
  });
}

function buildBulletParagraph(textValue: string, level: number): Paragraph {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 80 },
    children: parseInline(textValue, BODY_SIZE, TEXT_COLOR),
  });
}

function buildOrderedParagraph(textValue: string, level: number): Paragraph {
  return new Paragraph({
    numbering: { reference: ORDERED_LIST_REF, level },
    spacing: { after: 80 },
    children: parseInline(textValue, BODY_SIZE, TEXT_COLOR),
  });
}

function buildBlockquoteParagraph(textValue: string): Paragraph {
  return new Paragraph({
    spacing: { before: 80, after: 120 },
    indent: { left: 360 },
    border: {
      left: { style: BorderStyle.SINGLE, size: 12, color: QUOTE_BORDER_COLOR, space: 8 },
    },
    children: [
      new TextRun({
        text: stripInlineMarkers(textValue),
        size: BODY_SIZE,
        color: GRAY_COLOR,
        font: CALIBRI,
        italics: true,
      }),
    ],
  });
}

function buildCodeBlockParagraphs(codeLines: string[]): Paragraph[] {
  if (codeLines.length === 0) {
    return [
      new Paragraph({
        spacing: { before: 80, after: 160 },
        shading: { type: ShadingType.SOLID, color: CODE_BG_COLOR, fill: CODE_BG_COLOR },
        border: {
          top: { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR, space: 2 },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR, space: 2 },
          left: { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR, space: 2 },
          right: { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR, space: 2 },
        },
        children: [new TextRun({ text: "", font: MONO_FONT, size: BODY_SIZE - 2 })],
      }),
    ];
  }

  return codeLines.map((line, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === codeLines.length - 1;
    return new Paragraph({
      spacing: { before: isFirst ? 80 : 0, after: isLast ? 160 : 0 },
      shading: { type: ShadingType.SOLID, color: CODE_BG_COLOR, fill: CODE_BG_COLOR },
      border: {
        top: isFirst
          ? { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR, space: 2 }
          : undefined,
        bottom: isLast
          ? { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR, space: 2 }
          : undefined,
        left: { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR, space: 2 },
        right: { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR, space: 2 },
      },
      children: [
        new TextRun({
          text: line.length === 0 ? " " : line,
          font: MONO_FONT,
          size: BODY_SIZE - 2,
          color: CODE_TEXT_COLOR,
        }),
      ],
    });
  });
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

    // Fenced code block: ```lang? ... ```
    if (FENCE_RE.test(line)) {
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !FENCE_RE.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume closing fence
      for (const block of buildCodeBlockParagraphs(codeLines)) {
        elements.push(block);
      }
      continue;
    }

    // Skip blank lines
    if (line.trim().length === 0) {
      i++;
      continue;
    }

    // Horizontal rule
    if (isHorizontalRule(line)) {
      elements.push(buildHorizontalRule());
      i++;
      continue;
    }

    // Heading
    const heading = parseHeadingLine(line);
    if (heading) {
      elements.push(buildHeadingParagraph(heading.level, heading.text));
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
              children: parseInline(tl, BODY_SIZE, TEXT_COLOR),
              spacing: { after: 120 },
            })
          );
        }
      }
      continue;
    }

    // Blockquote (one or more consecutive "> " lines)
    if (QUOTE_RE.test(line)) {
      const quoteParts: string[] = [];
      while (i < lines.length && QUOTE_RE.test(lines[i])) {
        const m = QUOTE_RE.exec(lines[i]);
        quoteParts.push(m ? m[1] : "");
        i++;
      }
      elements.push(buildBlockquoteParagraph(quoteParts.join(" ").trim()));
      continue;
    }

    // Bulleted list (one or more consecutive bullet lines)
    if (BULLET_RE.test(line)) {
      while (i < lines.length && BULLET_RE.test(lines[i])) {
        const m = BULLET_RE.exec(lines[i])!;
        const indent = m[1].length;
        const level = Math.min(Math.floor(indent / 2), 3);
        elements.push(buildBulletParagraph(m[3], level));
        i++;
      }
      continue;
    }

    // Ordered list (one or more consecutive ordered lines)
    if (ORDERED_RE.test(line)) {
      while (i < lines.length && ORDERED_RE.test(lines[i])) {
        const m = ORDERED_RE.exec(lines[i])!;
        const indent = m[1].length;
        const level = Math.min(Math.floor(indent / 2), 3);
        elements.push(buildOrderedParagraph(m[3], level));
        i++;
      }
      continue;
    }

    // Regular text line (with inline markdown support)
    elements.push(
      new Paragraph({
        children: parseInline(line, BODY_SIZE, TEXT_COLOR),
        spacing: { after: 120 },
      })
    );
    i++;
  }

  return elements;
}

// ---------------------------------------------------------------------------
// Shared numbering config for ordered lists
// ---------------------------------------------------------------------------

const NUMBERING_CONFIG = {
  config: [
    {
      reference: ORDERED_LIST_REF,
      levels: [
        {
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.START,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
        {
          level: 1,
          format: LevelFormat.LOWER_LETTER,
          text: "%2.",
          alignment: AlignmentType.START,
          style: { paragraph: { indent: { left: 1440, hanging: 360 } } },
        },
        {
          level: 2,
          format: LevelFormat.LOWER_ROMAN,
          text: "%3.",
          alignment: AlignmentType.START,
          style: { paragraph: { indent: { left: 2160, hanging: 360 } } },
        },
        {
          level: 3,
          format: LevelFormat.DECIMAL,
          text: "%4.",
          alignment: AlignmentType.START,
          style: { paragraph: { indent: { left: 2880, hanging: 360 } } },
        },
      ],
    },
  ],
};

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

function formatExportDate(value: Date): string {
  return value.toLocaleString("en-GB", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildCoverBlock(conversationTitle: string): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({
          text: "PinkPepper  |  Food Safety Compliance",
          color: GRAY_COLOR,
          size: 18,
          font: CALIBRI,
        }),
      ],
    }),
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({
          text: conversationTitle,
          bold: true,
          color: BRAND_COLOR,
          size: 48,
          font: CALIBRI,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({
          text: `Exported: ${formatExportDate(new Date())}`,
          size: 20,
          font: CALIBRI,
          color: GRAY_COLOR,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 60 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 8, color: BRAND_COLOR, space: 1 },
      },
      children: [],
    }),
    new Paragraph({
      spacing: { before: 120, after: 240 },
      children: [
        new TextRun({
          text: "AI-assisted draft. Please review before operational use.",
          italics: true,
          color: GRAY_COLOR,
          size: 18,
          font: CALIBRI,
        }),
      ],
    }),
  ];
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
        numbering: NUMBERING_CONFIG,
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
                    spacing: { after: 40 },
                    children: [
                      new TextRun({
                        text: "AI-assisted draft — review before operational use.",
                        italics: true,
                        size: 14,
                        color: GRAY_COLOR,
                        font: CALIBRI,
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: "Generated by PinkPepper — Page ",
                        size: 16,
                        color: GRAY_COLOR,
                        font: CALIBRI,
                      }),
                      new TextRun({
                        children: [PageNumber.CURRENT],
                        size: 16,
                        color: GRAY_COLOR,
                        font: CALIBRI,
                      }),
                      new TextRun({ text: " of ", size: 16, color: GRAY_COLOR, font: CALIBRI }),
                      new TextRun({
                        children: [PageNumber.TOTAL_PAGES],
                        size: 16,
                        color: GRAY_COLOR,
                        font: CALIBRI,
                      }),
                    ],
                  }),
                ],
              }),
            },
            children: [
              ...buildCoverBlock(docData.conversationTitle),
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
