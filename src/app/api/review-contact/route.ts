import { NextResponse } from "next/server";
import { detectDocumentMimeFromBytes } from "@/lib/documents/extract";
import { sendEmail } from "@/lib/email";
import { sanitizeUntrustedFilename } from "@/lib/rag";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/** Escape special HTML characters to prevent HTML injection in email bodies. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Strip CR and LF to prevent email header injection. */
function stripNewlines(str: string): string {
  return str.replace(/[\r\n]/g, " ");
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const subject = (formData.get("subject") as string | null)?.trim();
  const message = (formData.get("message") as string | null)?.trim();
  const file = formData.get("file") as File | null;

  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "A document is required." }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File must be smaller than 10 MB." }, { status: 400 });
  }

  const adminInbox = process.env.REVIEW_CONTACT_EMAIL ?? "support@pinkpepper.io";

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const detectedMime = detectDocumentMimeFromBytes(fileBuffer);

  if (!detectedMime || !ALLOWED_FILE_TYPES.has(detectedMime)) {
    return NextResponse.json({ error: "Only PDF and DOCX files are accepted." }, { status: 400 });
  }

  // Escape all user-controlled values before interpolating into HTML to prevent injection.
  const safeEmail = escapeHtml(user.email ?? "");
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message);
  const sanitizedFileName = sanitizeUntrustedFilename(file.name);
  const safeFileName = escapeHtml(sanitizedFileName);

  const html = `
    <p style="font-family:sans-serif;font-size:14px;color:#0f172a;">
      <strong>From:</strong> ${safeEmail}<br/>
      <strong>Subject:</strong> ${safeSubject}
    </p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
    <p style="font-family:sans-serif;font-size:14px;color:#334155;white-space:pre-wrap;">${safeMessage}</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
    <p style="font-family:sans-serif;font-size:12px;color:#64748b;">Document attached: ${safeFileName}</p>
  `;

  // Strip CR/LF from subject and sender to prevent email header injection.
  const safeSubjectHeader = stripNewlines(subject);
  const safeEmailHeader = stripNewlines(user.email ?? "");

  try {
    await sendEmail({
      to: adminInbox,
      subject: `[Review Request] ${safeSubjectHeader} - ${safeEmailHeader}`,
      html,
      attachments: [{ filename: sanitizedFileName, content: fileBuffer }],
    });
  } catch (err) {
    console.error("review-contact sendEmail failed:", err);
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
