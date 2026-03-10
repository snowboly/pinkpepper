import { NextResponse } from "next/server";
import { createClient as createSupabaseServer } from "@/utils/supabase/server";
import { extractDocumentText } from "@/lib/documents/extract";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

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
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File must be between 1 byte and 10MB." }, { status: 400 });
  }

  const extraction = await extractDocumentText(file);

  return NextResponse.json({
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    extractedText: extraction.text,
    extractionStrategy: extraction.strategy,
    warning: extraction.warning,
  });
}
