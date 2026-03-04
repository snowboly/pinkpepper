import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import {
  canExportPdf,
  enforceDailyDocumentLimit,
  getExportContext,
  getLatestAssistantMessageForConversation,
  recordExportUsage,
} from "@/lib/export/common";

export const dynamic = "force-dynamic";

function wrapText(text: string, maxLineLength = 95) {
  const words = text.replace(/\r\n/g, "\n").split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (!word) continue;
    if ((current + " " + word).trim().length > maxLineLength) {
      lines.push(current.trim());
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }

  if (current.trim()) lines.push(current.trim());
  return lines;
}

export async function POST(request: Request) {
  try {
    const { supabase, userId, tier, isAdmin } = await getExportContext();

    if (!canExportPdf(tier, isAdmin)) {
      return NextResponse.json({ error: "PDF export is not available for your plan." }, { status: 403 });
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

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 800;

    page.drawText("PinkPepper Document Export", {
      x: 40,
      y,
      size: 16,
      font: bold,
      color: rgb(0.17, 0.17, 0.17),
    });

    y -= 24;
    page.drawText(`Title: ${docData.conversationTitle}`, { x: 40, y, size: 11, font, color: rgb(0.25, 0.25, 0.25) });
    y -= 16;
    page.drawText(`Generated: ${new Date().toISOString()}`, { x: 40, y, size: 10, font, color: rgb(0.35, 0.35, 0.35) });
    y -= 16;
    page.drawText("Label: AI-assisted draft. Human validation required before operational use.", {
      x: 40,
      y,
      size: 10,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });

    y -= 24;

    const lines = wrapText(docData.content, 96);
    for (const line of lines) {
      if (y < 40) {
        y = 800;
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        newPage.drawText(line, { x: 40, y, size: 11, font, color: rgb(0.17, 0.17, 0.17) });
      } else {
        page.drawText(line, { x: 40, y, size: 11, font, color: rgb(0.17, 0.17, 0.17) });
      }
      y -= 14;
    }

    await recordExportUsage({ supabase, userId, format: "pdf", conversationId });

    const bytes = await pdfDoc.save();
    const safeId = conversationId.replace(/[^\w-]/g, "_").substring(0, 64);
    const fileName = `pinkpepper-${safeId}.pdf`;

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
