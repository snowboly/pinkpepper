import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

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

  const html = `
    <p style="font-family:sans-serif;font-size:14px;color:#0f172a;">
      <strong>From:</strong> ${user.email}<br/>
      <strong>Subject:</strong> ${subject}
    </p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
    <p style="font-family:sans-serif;font-size:14px;color:#334155;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
    <p style="font-family:sans-serif;font-size:12px;color:#64748b;">Document attached: ${file.name}</p>
  `;

  try {
    await sendEmail({
      to: adminInbox,
      subject: `[Review Request] ${subject} — ${user.email}`,
      html,
      attachments: [{ filename: file.name, content: fileBuffer }],
    });
  } catch (err) {
    console.error("review-contact sendEmail failed:", err);
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
