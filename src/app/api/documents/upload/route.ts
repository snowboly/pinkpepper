import { NextResponse } from "next/server";
import { createClient as createSupabaseServer } from "@/utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { extractDocumentText } from "@/lib/documents/extract";
import { generateEmbeddings } from "@/lib/rag";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const CHUNK_SIZE = 800;        // characters per chunk
const CHUNK_OVERLAP = 100;     // overlap between chunks

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end).trim());
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks.filter((c) => c.length > 40); // drop trivially short chunks
}

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  let effectiveConversationId = (formData.get("conversationId") as string | null) ?? null;
  const draftTitle = typeof formData.get("draftTitle") === "string"
    ? String(formData.get("draftTitle")).trim()
    : "";
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File must be between 1 byte and 10MB." }, { status: 400 });
  }

  const extraction = await extractDocumentText(file);

  if (!extraction.text) {
    return NextResponse.json({
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      extractedText: "",
      extractionStrategy: extraction.strategy,
      warning: extraction.warning ?? "No text could be extracted.",
      chunksStored: 0,
    });
  }

  // Chunk, embed, and store in user_document_chunks
  const chunks = chunkText(extraction.text);
  let chunksStored = 0;
  let storageWarning: string | undefined;

  try {
    const texts = chunks.map((c) => c);
    const embeddings = await generateEmbeddings(texts);

    if (!effectiveConversationId) {
      const titleSource = draftTitle || file.name;
      const title = titleSource.length > 80 ? `${titleSource.slice(0, 77)}...` : titleSource;
      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title })
        .select("id")
        .single();

      if (conversationError || !conversation) {
        console.error("Failed to create conversation for document upload:", conversationError);
        return NextResponse.json({ error: "Failed to create conversation for document upload." }, { status: 500 });
      }

      effectiveConversationId = conversation.id;
    }

    const rows = chunks.map((content, i) => ({
      user_id: user.id,
      conversation_id: effectiveConversationId,
      file_name: file.name,
      content,
      embedding: embeddings[i].embedding,
      chunk_index: i,
    }));

    const adminSupabase = getAdminSupabase();

    // Delete any existing chunks for this file before inserting fresh ones
    const deleteQuery = adminSupabase
      .from("user_document_chunks")
      .delete()
      .eq("user_id", user.id)
      .eq("file_name", file.name);

    if (effectiveConversationId) {
      deleteQuery.eq("conversation_id", effectiveConversationId);
    } else {
      deleteQuery.is("conversation_id", null);
    }

    await deleteQuery;

    const { error: insertError } = await adminSupabase
      .from("user_document_chunks")
      .insert(rows);

    if (insertError) {
      console.error("Failed to store document chunks:", insertError);
      storageWarning = "Text was extracted, but the document could not be stored for retrieval.";
    } else {
      chunksStored = rows.length;
    }
  } catch (e) {
    console.error("Embedding/storage error:", e);
    storageWarning = "Text was extracted, but embeddings/storage failed.";
  }

  return NextResponse.json({
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    extractedText: extraction.text,
    extractionStrategy: extraction.strategy,
    warning: extraction.warning ?? storageWarning,
    conversationId: effectiveConversationId,
    chunksStored,
  });
}
