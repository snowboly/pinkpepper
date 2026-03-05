import { APP_URL, wrapEmail, btn, infoCard, divider } from "@/lib/email-wrapper";

// ─── Welcome email (sent after first sign-up) ─────────────────────────────────

export function buildWelcomeEmail(): { subject: string; html: string } {
  return {
    subject: `Welcome to PinkPepper`,
    html: wrapEmail(`
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0F172A;">Welcome to PinkPepper!</h1>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
        Your account is ready. You now have access to AI-powered food safety consulting, right at your fingertips.
      </p>

      ${infoCard(
        `<p style="margin:0 0 6px;font-size:13px;color:#9F1239;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Get started</p>
        <ul style="margin:6px 0 0;padding-left:20px;font-size:14px;color:#0F172A;line-height:1.9;">
          <li>Chat with our AI food safety expert</li>
          <li>Generate HACCP plans, procedures, and records</li>
          <li>Export documents as PDF or DOCX</li>
          <li>Upgrade to Plus or Pro for expert human reviews</li>
        </ul>`,
        { bg: "#FDEAEA", border: "#FECDD3" }
      )}

      ${btn(`${APP_URL}/dashboard`, "Go to Dashboard")}

      ${divider()}

      <p style="font-size:12px;color:#94A3B8;line-height:1.5;margin:0;">
        Need help getting started? Visit our
        <a href="${APP_URL}/dashboard" style="color:#D96C6C;text-decoration:none;">dashboard</a>
        or reply to this email and our team will be happy to assist.
      </p>
    `),
  };
}
