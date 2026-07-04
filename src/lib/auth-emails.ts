function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const DASHBOARD_URL = "https://pinkpepper.io/dashboard";

export function buildWelcomeEmail(firstName?: string | null): { subject: string; html: string } {
  const safeFirstName = escapeHtml(firstName?.trim() || "there");

  return {
    subject: "Welcome to PinkPepper",
    html: `<div style="margin:0; padding:0; background-color:#ffffff; font-family:Arial, Helvetica, sans-serif; color:#0F172A;">
  <div style="max-width:560px; margin:0 auto; padding:44px 24px 32px 24px;">
    <div style="margin:0 0 28px 0;">
      <a href="https://www.pinkpepper.io/" target="_blank" rel="noopener">
        <img src="https://pinkpepper.io/logo/LogoV3.png" alt="PinkPepper" width="150" style="display:block; border:0; height:auto;">
      </a>
    </div>

    <h1 style="font-size:30px; line-height:1.18; font-weight:700; margin:0 0 22px 0; color:#0F172A;">
      Welcome to PinkPepper
    </h1>

    <div style="margin:0 0 36px 0;">
      <a href="${DASHBOARD_URL}" target="_blank" rel="noopener" style="display:inline-block; background-color:#E11D48; color:#ffffff; text-decoration:none; font-size:15px; font-weight:700; padding:12px 22px; border-radius:999px;">
        Open PinkPepper
      </a>
    </div>

    <p style="font-size:16px; line-height:1.5; margin:0 0 10px 0;">Hi ${safeFirstName},</p>

    <p style="font-size:16px; line-height:1.5; margin:0 0 10px 0;">
      Welcome to PinkPepper and thank you for signing up.
    </p>

    <p style="font-size:16px; line-height:1.5; margin:0 0 10px 0;">
      PinkPepper was created to help food businesses and food safety professionals get clearer, more practical support with EU and UK food safety tasks.
    </p>

    <p style="font-size:16px; line-height:1.5; margin:0 0 14px 0;">
      You can use it to ask food safety questions, prepare documents, work through HACCP-style topics, create templates, and get support with areas such as hygiene, allergens, labelling, supplier checks, certification standards, and import/export requirements.
    </p>

    <ul style="font-size:16px; line-height:1.5; margin:0 0 18px 20px; padding:0;">
      <li style="margin:0 0 10px 0;">
        Ask practical EU and UK food safety questions.
      </li>
      <li style="margin:0 0 10px 0;">
        Generate food safety templates, checklists, posters, and SOP-style documents.
      </li>
      <li style="margin:0 0 10px 0;">
        Get support with HACCP, allergens, hygiene, temperature control, supplier approval, and manufacturing controls.
      </li>
      <li style="margin:0 0 10px 0;">
        Explore import/export and food safety compliance topics for EU and UK markets.
      </li>
      <li style="margin:0 0 10px 0;">
        Request human consultancy support when you need more detailed guidance.
      </li>
    </ul>

    <p style="font-size:16px; line-height:1.5; margin:0 0 10px 0;">
      Your free account is a good way to explore the assistant and see how it can support your food safety work.
    </p>

    <p style="font-size:16px; line-height:1.5; margin:0 0 10px 0;">
      If you want to use PinkPepper more regularly, the Plus membership gives you more access to templates, posters, document support, and practical food safety assistance whenever you need it.
    </p>

    <p style="font-size:16px; line-height:1.5; margin:0 0 24px 0;">
      You can start by asking PinkPepper about one document, checklist, product, process, or food safety issue you are working on right now.
    </p>

    <div style="margin:0 0 30px 0;">
      <a href="${DASHBOARD_URL}" target="_blank" rel="noopener" style="display:inline-block; background-color:#E11D48; color:#ffffff; text-decoration:none; font-size:15px; font-weight:700; padding:12px 22px; border-radius:999px;">
        Start using PinkPepper
      </a>
    </div>

    <div style="margin-top:24px; font-size:15px; line-height:1.45; color:#0F172A;">
      <div style="margin:0 0 4px 0;"><strong>Best regards,</strong></div>
      <div style="margin:0 0 4px 0;"><strong>Joao</strong></div>
      <div style="margin:0 0 8px 0;">
        <strong><em>Founder</em>, <a href="https://www.pinkpepper.io/" target="_blank" rel="noopener" style="color:#E11D48; text-decoration:none;">PinkPepper.io</a></strong>
      </div>

      <div style="font-size:11px; line-height:1.35; color:#64748B; margin:14px 0 4px 0;">
        You are receiving this email because you signed up for PinkPepper.
      </div>

      <div style="font-size:11px; line-height:1.35; color:#64748B; margin:0 0 4px 0;">
        Privacy: <a href="https://pinkpepper.io/legal/privacy" target="_blank" rel="noopener" style="color:#64748B;">https://pinkpepper.io/legal/privacy</a>
      </div>
    </div>
  </div>
</div>`,
  };
}
