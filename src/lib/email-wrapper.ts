const APP_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pinkpepper.ai";
const LOGO_URL = `${APP_URL}/LogoV3.png`;

export { APP_URL };

/** Rounded CTA button */
export function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 18px;border-radius:10px;">${label}</a>`;
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
  return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">`;
}

/** Wraps email body in the full PinkPepper HTML shell with logo header and footer */
export function wrapEmail(body: string, preheader = ""): string {
  const year = new Date().getFullYear();
  const preheaderHtml = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>`
    : "";

  return `<!doctype html>
<html lang="en" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PinkPepper</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,'Segoe UI',Arial,sans-serif;">
  ${preheaderHtml}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">

          <!-- Header / Logo -->
          <tr>
            <td style="padding:28px 28px 18px;border-bottom:1px solid #e2e8f0;">
              <img src="${LOGO_URL}" alt="PinkPepper" width="152" style="display:block;height:auto;border:0;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px;color:#0f172a;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 28px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 10px;color:#64748b;font-size:12px;line-height:18px;">
                Need help? Contact <a href="mailto:support@pinkpepper.app" style="color:#334155;">support@pinkpepper.app</a>.
              </p>
              <p style="margin:0 0 8px;color:#94a3b8;font-size:11px;line-height:16px;">
                <a href="${APP_URL}" style="color:#94a3b8;text-decoration:none;">pinkpepper.ai</a>
                &nbsp;&middot;&nbsp;
                <a href="${APP_URL}/legal/privacy" style="color:#94a3b8;text-decoration:none;">Privacy Policy</a>
                &nbsp;&middot;&nbsp;
                <a href="${APP_URL}/legal/terms" style="color:#94a3b8;text-decoration:none;">Terms of Service</a>
              </p>
              <p style="margin:0;color:#94a3b8;font-size:11px;line-height:16px;">&copy; ${year} PinkPepper. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
