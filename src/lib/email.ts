import { Resend } from "resend";
import { getResendFromAddress } from "@/lib/resend/config";

type EmailAttachment = {
  filename: string;
  content: Buffer;
};

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; reason: "missing_config" | "resend_error"; error?: unknown };

type EmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
};

export async function sendEmail(input: EmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = getResendFromAddress();

  if (!apiKey || !from) {
    console.warn("sendEmail: RESEND_API_KEY or RESEND_FROM_EMAIL not configured; email was not sent");
    return { ok: false, reason: "missing_config" };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      attachments: input.attachments,
    });

    if (result.error) {
      console.error("sendEmail: Resend returned an error", result.error);
      return { ok: false, reason: "resend_error", error: result.error };
    }

    return { ok: true, id: result.data?.id };
  } catch (error) {
    console.error("sendEmail: Resend threw while sending email", error);
    return { ok: false, reason: "resend_error", error };
  }
}
