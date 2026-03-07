import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { NextResponse } from "next/server";
import {
  canExportDocx,
  enforceDailyDocumentLimit,
  getExportContext,
  getLatestAssistantMessageForConversation,
  recordExportUsage,
} from "@/lib/export/common";
import { exportLimiter, checkRateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { supabase, userId, tier, isAdmin } = await getExportContext();

    const rateLimitRes = await checkRateLimit(exportLimiter, userId);
    if (rateLimitRes) return rateLimitRes;

    if (!canExportDocx(tier, isAdmin)) {
      return NextResponse.json({ error: "DOCX export is only available on Pro." }, { status: 403 });
    }

    await enforceDailyDocumentLimit({ supabase, userId, tier, isAdmin });

    const body = (await request.json()) as { conversationId?: string };
    const conversationId = body.conversationId?.trim();
    if (!conversationId || conversationId.length > 128) {
      return NextResponse.json({ error: "A valid conversationId is required." }, { status: 400 });
    }

    const docData = await getLatestAssistantMessageForConversation({
      supabase,
      userId,
      conversationId,
    });

    const paragraphs = docData.content
      .replace(/\r\n/g, "\n")
      .split("\n")
      .filter((line: string) => line.trim().length > 0)
      .map(
        (line: string) =>
          new Paragraph({
            children: [new TextRun({ text: line, size: 22 })],
            spacing: { after: 160 },
          })
      );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun("PinkPepper Document Export")],
            }),
            new Paragraph({ children: [new TextRun(`Title: ${docData.conversationTitle}`)] }),
            new Paragraph({ children: [new TextRun(`Generated: ${new Date().toISOString()}`)] }),
            new Paragraph({
              children: [new TextRun("Label: AI-assisted draft. Human validation required before operational use.")],
            }),
            new Paragraph({ children: [new TextRun(" ")] }),
            ...paragraphs,
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const bodyBytes = new Uint8Array(buffer);

    await recordExportUsage({ supabase, userId, format: "docx", conversationId });

    const safeId = conversationId.replace(/[^\w-]/g, "_").substring(0, 64);
    const fileName = `pinkpepper-${safeId}.docx`;

    return new NextResponse(bodyBytes, {
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
    if (message === "NO_ASSISTANT_CONTENT") {
      return NextResponse.json({ error: "No assistant response available to export." }, { status: 400 });
    }
    if (message === "DOC_DAILY_LIMIT_REACHED") {
      return NextResponse.json({ error: "Daily document generation limit reached for your plan." }, { status: 402 });
    }
    console.error("[export/docx] unhandled error:", error);
    return NextResponse.json({ error: "Export failed. Please try again." }, { status: 500 });
  }
}
