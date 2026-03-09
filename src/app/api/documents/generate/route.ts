/**
 * API endpoint to generate structured food safety documents.
 *
 * POST /api/documents/generate
 * Body: { conversationId: string, userPrompt: string }
 * Returns: { document: StructuredDocument, format: "json" } or PDF/DOCX binary
 *
 * Query params:
 *   ?format=json (default) — returns the structured JSON
 *   ?format=pdf — renders and returns PDF
 *   ?format=docx — renders and returns DOCX
 */

import { NextResponse } from "next/server";
import {
  getExportContext,
  enforceDailyDocumentLimit,
  recordExportUsage,
  canExportPdf,
  canExportDocx,
} from "@/lib/export/common";
import { exportLimiter, checkRateLimit } from "@/lib/ratelimit";
import { buildDocGenSystemPrompt, detectDocumentType } from "@/lib/documents/generate-prompt";
import { renderDocx } from "@/lib/documents/render-docx";
import { renderPdf } from "@/lib/documents/render-pdf";
import type { StructuredDocument, DocumentType } from "@/lib/documents/types";
import { DOCUMENT_TYPE_LABELS } from "@/lib/documents/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { supabase, userId, tier, isAdmin } = await getExportContext();

    const rateLimitRes = await checkRateLimit(exportLimiter, userId);
    if (rateLimitRes) return rateLimitRes;

    const body = (await request.json()) as {
      conversationId?: string;
      userPrompt?: string;
      documentType?: DocumentType;
      format?: "json" | "pdf" | "docx";
    };

    const userPrompt = body.userPrompt?.trim();
    if (!userPrompt || userPrompt.length > 5000) {
      return NextResponse.json({ error: "A valid userPrompt is required (max 5000 chars)." }, { status: 400 });
    }

    // Detect or use explicit document type
    const documentType = body.documentType ?? detectDocumentType(userPrompt);
    if (!documentType) {
      return NextResponse.json(
        {
          error: "Could not determine document type. Please specify one of: haccp_plan, sop, cleaning_schedule, temperature_log, supplier_approval.",
        },
        { status: 400 },
      );
    }

    const format = body.format ?? "json";

    // Check tier for binary formats
    if (format === "pdf" && !canExportPdf(tier, isAdmin)) {
      return NextResponse.json({ error: "PDF export is not available for your plan." }, { status: 403 });
    }
    if (format === "docx" && !canExportDocx(tier, isAdmin)) {
      return NextResponse.json({ error: "DOCX export is only available on Pro." }, { status: 403 });
    }

    // Enforce daily limit for binary exports
    if (format !== "json") {
      await enforceDailyDocumentLimit({ supabase, userId, tier, isAdmin });
    }

    // Call Groq with JSON mode
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
    }

    const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
    const systemPrompt = buildDocGenSystemPrompt(documentType);

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("[documents/generate] Groq error:", errText);
      return NextResponse.json({ error: "Document generation failed. Please try again." }, { status: 502 });
    }

    const groqData = await groqResponse.json();
    const rawContent = groqData.choices?.[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json({ error: "LLM returned empty response." }, { status: 502 });
    }

    let document: StructuredDocument;
    try {
      document = JSON.parse(rawContent) as StructuredDocument;
    } catch {
      console.error("[documents/generate] JSON parse failed:", rawContent.substring(0, 500));
      return NextResponse.json({ error: "LLM returned invalid JSON. Please try again." }, { status: 502 });
    }

    // Ensure document_type matches what we asked for
    if (document.document_type !== documentType) {
      document = { ...document, document_type: documentType } as StructuredDocument;
    }

    // JSON response
    if (format === "json") {
      return NextResponse.json({ document, documentType, label: DOCUMENT_TYPE_LABELS[documentType] });
    }

    // Binary export
    const conversationId = body.conversationId?.trim() ?? "generated";

    if (format === "pdf") {
      const pdfBytes = await renderPdf(document);
      await recordExportUsage({ supabase, userId, format: "pdf", conversationId });
      const safeId = conversationId.replace(/[^\w-]/g, "_").substring(0, 64);
      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="pinkpepper-${safeId}.pdf"`,
        },
      });
    }

    if (format === "docx") {
      const docxBuffer = await renderDocx(document);
      await recordExportUsage({ supabase, userId, format: "docx", conversationId });
      const safeId = conversationId.replace(/[^\w-]/g, "_").substring(0, 64);
      return new NextResponse(new Uint8Array(docxBuffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="pinkpepper-${safeId}.docx"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    if (message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (message === "DOC_DAILY_LIMIT_REACHED") {
      return NextResponse.json({ error: "Daily document generation limit reached for your plan." }, { status: 402 });
    }
    console.error("[documents/generate] unhandled error:", error);
    return NextResponse.json({ error: "Document generation failed." }, { status: 500 });
  }
}
