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
  TextRun,
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

const BRAND_COLOR = "E11D48";
const GRAY_COLOR = "64748B";

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
        new TextRun({ text: "  |  Food Safety Compliance", color: GRAY_COLOR, size: 16 }),
      ];
    } catch {
      return [
        new TextRun({ text: "PinkPepper", bold: true, color: BRAND_COLOR, size: 20 }),
        new TextRun({ text: "  |  Food Safety Compliance", color: GRAY_COLOR, size: 16 }),
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
        const contentParagraphs = message.content
          .replace(/\r\n/g, "\n")
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .map(
            (line) =>
              new Paragraph({
                children: [new TextRun({ text: line, size: 22 })],
                spacing: { after: 120 },
              })
          );

        return [
          new Paragraph({
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({ text: speaker, bold: true, color: BRAND_COLOR, size: 24 }),
              ...(timestamp ? [new TextRun({ text: `  -  ${timestamp}`, color: GRAY_COLOR, size: 18 })] : []),
            ],
          }),
          ...contentParagraphs,
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
                      new TextRun({ text: "Generated by PinkPepper - Conversation transcript - Page ", size: 16, color: GRAY_COLOR }),
                      new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRAY_COLOR }),
                      new TextRun({ text: " of ", size: 16, color: GRAY_COLOR }),
                      new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: GRAY_COLOR }),
                    ],
                  }),
                ],
              }),
            },
            children: [
              new Paragraph({
                heading: HeadingLevel.HEADING_1,
                children: [new TextRun({ text: docData.conversationTitle, bold: true, color: BRAND_COLOR, size: 48 })],
                spacing: { after: 200 },
              }),
              new Paragraph({ children: [new TextRun(`Exported: ${new Date().toISOString()}`)] }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Conversation transcript exported from PinkPepper.",
                    italics: true,
                    color: GRAY_COLOR,
                    size: 18,
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
