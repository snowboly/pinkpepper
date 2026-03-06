import { Resend } from "resend";

type BillingEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendBillingEmail(input: BillingEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.warn("sendBillingEmail: RESEND_API_KEY or RESEND_FROM not configured, skipping email");
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
