const APP_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pinkpepper.ai";
const LOGO_URL = `${APP_URL}/LogoV3.png`;

export { APP_URL };

/** Pill-style CTA button */
export function btn(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
      <tr>
        <td align="left" style="border-radius:24px;background:#E11D48;">
          <a href="${href}" style="display:inline-block;padding:13px 28px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;border-radius:24px;letter-spacing:-0.01em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${label}</a>
        </td>
      </tr>
    </table>`;
}

/** Small inline badge */
export function badge(label: string, color: { bg: string; text: string }): string {
  return `<span style="display:inline-block;background:${color.bg};color:${color.text};padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;letter-spacing:0.01em;">${label}</span>`;
}

/** Highlighted info/alert card */
export function infoCard(
  content: string,
  style: { bg: string; border: string } = { bg: "#F0F9FF", border: "#BAE6FD" }
): string {
  return `<div style="background:${style.bg};border:1px solid ${style.border};border-radius:12px;padding:14px 16px;margin:16px 0;">${content}</div>`;
}

/** Horizontal rule divider */
export function divider(): string {
  return `<hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0;">`;
}

/** Wraps email body in the full PinkPepper HTML shell with logo header and footer */
export function wrapEmail(body: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>PinkPepper</title>
</head>
<body style="margin:0;padding:0;background-color:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F1F5F9;padding:48px 0;">
    <tr>
      <td align="center" style="padding:0 16px;">
        <!--[if mso]><table width="560"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- ── Header ── -->
          <tr>
            <td style="background:#E11D48;padding:28px 32px;text-align:center;">
              <img src="${LOGO_URL}" alt="PinkPepper" height="48" style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;">
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="padding:32px 32px 28px;color:#0F172A;">
              ${body}
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 32px;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;color:#64748B;line-height:1.5;">
                PinkPepper &mdash; AI-Powered Food Safety
              </p>
              <p style="margin:0;font-size:12px;color:#94A3B8;">
                <a href="${APP_URL}" style="color:#94A3B8;text-decoration:none;">pinkpepper.ai</a>
                &nbsp;&middot;&nbsp;
                <a href="${APP_URL}/legal/privacy" style="color:#94A3B8;text-decoration:none;">Privacy Policy</a>
                &nbsp;&middot;&nbsp;
                <a href="${APP_URL}/legal/terms" style="color:#94A3B8;text-decoration:none;">Terms of Service</a>
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#CBD5E1;">&copy; ${year} PinkPepper. All rights reserved.</p>
            </td>
          </tr>

        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}
