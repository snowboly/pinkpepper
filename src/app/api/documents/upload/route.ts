/**
 * API endpoint to upload a document for parsing, chunking, and embedding.
 *
 * POST /api/documents/upload
 * Body: multipart/form-data with a single file field "file"
 *       Optional: conversationId (string)
 *
 * The document is parsed (PDF/DOCX), chunked, embedded, and stored in
 * user_document_chunks for personalised RAG retrieval.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { resolveUserAccess } from "@/lib/access";
import { countUsageSince, utcDayStartIso } from "@/lib/policy";
import { exportLimiter, checkRateLimit } from "@/lib/ratelimit";
import { parseDocument, chunkText } from "@/lib/documents/parser";
import { generateEmbeddings } from "@/lib/rag/embeddings";
import { uploadFile, BUCKETS } from "@/lib/storage";

export const dynamic = "force-dynamic";

const ALLOWED_DOC_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_DOC_SIZE = 25 * 1024 * 1024; // 25 MB

export async function POST(request: Request) {
  try {
    // Auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitRes = await checkRateLimit(exportLimiter, user.id);
    if (rateLimitRes) return rateLimitRes;

    // Resolve tier
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier,is_admin")
      .eq("id", user.id)
      .maybeSingle();
    const { tier, isAdmin } = resolveUserAccess(profile, user.email);

    // Plus and Pro only (admins always allowed)
    if (!isAdmin && tier === "free") {
      return NextResponse.json(
        { error: "Document upload requires a Plus or Pro plan." },
        { status: 403 },
      );
    }

    // Check daily upload limit
    if (!isAdmin) {
      const used = await countUsageSince({
        supabase,
        userId: user.id,
        eventType: "document_upload",
        sinceIso: utcDayStartIso(),
      });
      const dailyLimit = tier === "plus" ? 3 : 10; // Plus: 3/day, Pro: 10/day
      if (used >= dailyLimit) {
        return NextResponse.json(
          { error: "Daily document upload limit reached for your plan." },
          { status: 402 },
        );
      }
    }

    // Parse multipart form
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const conversationId = (formData.get("conversationId") as string | null)?.trim() || undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_DOC_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are supported." },
        { status: 400 },
      );
    }

    if (file.size > MAX_DOC_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum 25 MB.` },
        { status: 400 },
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to storage for record-keeping
    const fileId = await uploadFile(
      user.id,
      tier,
      buffer,
      file.name,
      file.type,
      BUCKETS.vault,
      { conversationId },
    );

    // Parse document
    const parsed = await parseDocument(buffer, file.type);

    if (!parsed.text || parsed.text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract meaningful text from the document." },
        { status: 400 },
      );
    }

    // Chunk text
    const chunks = chunkText(parsed.text, 500, 50);

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "Document too short to process." },
        { status: 400 },
      );
    }

    // Generate embeddings in batches
    const embeddings = await generateEmbeddings(chunks);

    // Insert into user_document_chunks (table not in generated types yet)
    const admin = createAdminClient();
    const rows = chunks.map((content, i) => ({
      user_id: user.id,
      file_id: fileId,
      content,
      embedding: JSON.stringify(embeddings[i].embedding),
      source_name: file.name,
      source_type: "user_upload",
      section_ref: null,
      metadata: {
        originalFile: file.name,
        mimeType: file.type,
        pageCount: parsed.pageCount ?? null,
        chunkIndex: i,
        totalChunks: chunks.length,
        processedAt: new Date().toISOString(),
      },
    }));

    // Insert in batches
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminAny = admin as any;
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      const { error } = await adminAny.from("user_document_chunks").insert(batch);
      if (error) {
        console.error("[documents/upload] insert error:", error);
        return NextResponse.json(
          { error: "Failed to store document chunks." },
          { status: 500 },
        );
      }
    }

    // Record usage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("usage_events").insert({
      user_id: user.id,
      event_type: "document_upload",
      event_count: 1,
      metadata: {
        file_id: fileId,
        file_name: file.name,
        chunks: chunks.length,
        conversation_id: conversationId ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      fileId,
      fileName: file.name,
      chunks: chunks.length,
      textLength: parsed.text.length,
      pageCount: parsed.pageCount ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("[documents/upload] error:", message);

    if (message.includes("quota exceeded")) {
      return NextResponse.json({ error: message }, { status: 402 });
    }

    return NextResponse.json(
      { error: "Document upload failed. Please try again." },
      { status: 500 },
    );
  }
}
