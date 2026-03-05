import { Resend } from "resend";

type EmailInput = {
  to: string | string[];
  subject: string;
  html: string;
};

export async function sendEmail(input: EmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    console.warn("sendEmail: RESEND_API_KEY or RESEND_FROM not configured, skipping email");
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
}
