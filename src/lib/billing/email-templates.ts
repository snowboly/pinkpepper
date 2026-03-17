import { APP_URL, wrapEmail, btn, badge, infoCard, divider } from "@/lib/email-wrapper";

const TIER_NAMES: Record<string, string> = {
  free: "Free",
  plus: "Plus",
  pro: "Pro",
};

const TIER_FEATURES: Record<string, string[]> = {
  plus: [
    "100 AI queries per day",
    "PDF conversation export",
    "Document and photo uploads",
    "Unlimited saved conversations",
    "25 voice transcriptions per day",
  ],
  pro: [
    "3 hours of food safety consultancy per month",
    "Document generation (HACCP plans, SOPs, logs, and more)",
    "PDF &amp; DOCX export",
    "Virtual Audit workflows",
    "Highest daily limits for audit prep and operational use",
  ],
};

function tierName(tier: string): string {
  return TIER_NAMES[tier] ?? tier.charAt(0).toUpperCase() + tier.slice(1);
}

// ─── 1. Subscription activated (new paying customer) ──────────────────────────

export function buildSubscriptionActivatedEmail(input: {
  tier: string;
}): { subject: string; html: string } {
  const name = tierName(input.tier);
  const features = TIER_FEATURES[input.tier] ?? [];

  const featuresList =
    features.length > 0
      ? `<ul style="margin:8px 0 0;padding-left:20px;font-size:14px;color:#0F172A;line-height:1.9;">
          ${features.map((f) => `<li>${f}</li>`).join("")}
        </ul>`
      : "";

  return {
    subject: `Welcome to PinkPepper ${name}!`,
    html: wrapEmail(`
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0F172A;">You're now on ${name}!</h1>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
        Thank you for subscribing. Your PinkPepper <strong>${name}</strong> plan is now active and ready to use.
      </p>

      ${
        features.length > 0
          ? infoCard(
              `<p style="margin:0 0 6px;font-size:13px;color:#9F1239;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">What's included in ${name}</p>
              ${featuresList}`,
              { bg: "#FDEAEA", border: "#FECDD3" }
            )
          : ""
      }

      <p style="font-size:14px;color:#64748B;line-height:1.6;margin:16px 0 0;">
        Head to your dashboard to start using all your ${name} features.
      </p>

      ${btn(`${APP_URL}/dashboard`, "Go to Dashboard")}

      ${divider()}

      <p style="font-size:12px;color:#94A3B8;line-height:1.5;margin:0;">
        You can manage or cancel your subscription at any time from your dashboard settings.
        If you have any questions, reply to this email and our team will be happy to help.
      </p>
    `),
  };
}

// ─── 2. Subscription updated (generic status/tier change) ─────────────────────

export function buildSubscriptionUpdatedEmail(input: {
  status: string;
  tier: string;
}): { subject: string; html: string } {
  const name = tierName(input.tier);
  const isActive = input.status === "active";

  const statusBadge = isActive
    ? badge("Active", { bg: "#F0FDF4", text: "#15803D" })
    : badge(input.status.charAt(0).toUpperCase() + input.status.slice(1), { bg: "#F1F5F9", text: "#475569" });

  return {
    subject: `Your PinkPepper subscription has been updated`,
    html: wrapEmail(`
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0F172A;">Subscription Updated</h1>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
        Your PinkPepper subscription has been updated. Here's a summary of your current plan.
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;border-collapse:collapse;">
        <tr>
          <td style="padding:10px 0;color:#64748B;width:110px;vertical-align:middle;">Plan</td>
          <td style="padding:10px 0;font-weight:600;vertical-align:middle;">${name}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#64748B;border-top:1px solid #F1F5F9;vertical-align:middle;">Status</td>
          <td style="padding:10px 0;border-top:1px solid #F1F5F9;vertical-align:middle;">${statusBadge}</td>
        </tr>
      </table>

      ${btn(`${APP_URL}/dashboard`, "Manage Subscription")}

      ${divider()}

      <p style="font-size:12px;color:#94A3B8;line-height:1.5;margin:0;">
        If you didn't make this change or have questions about your subscription, please contact us immediately by replying to this email.
      </p>
    `),
  };
}

// ─── 3. Payment failed ───────────────────────────────────────────────────────

export function buildPaymentFailedEmail(input: {
  tier: string;
  nextRetryDate?: string;
}): { subject: string; html: string } {
  const name = tierName(input.tier);

  const retryNote = input.nextRetryDate
    ? `We will automatically retry the payment on <strong>${input.nextRetryDate}</strong>.`
    : `We will automatically retry the payment soon.`;

  return {
    subject: `Payment failed for your PinkPepper subscription`,
    html: wrapEmail(`
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0F172A;">Payment Failed</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">
        We were unable to process the latest payment for your PinkPepper <strong>${name}</strong> plan.
      </p>

      ${infoCard(
        `<p style="margin:0 0 4px;font-size:13px;color:#92400E;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Action required</p>
        <p style="margin:0;font-size:14px;color:#0F172A;line-height:1.6;">
          Please update your payment method to avoid any interruption to your ${name} features. ${retryNote}
        </p>`,
        { bg: "#FFFBEB", border: "#FDE68A" }
      )}

      ${btn(`${APP_URL}/dashboard`, "Update Payment Method")}

      ${divider()}

      <p style="font-size:12px;color:#94A3B8;line-height:1.5;margin:0;">
        If you believe this is an error, please contact your card issuer or reply to this email for assistance.
      </p>
    `),
  };
}

// ─── 4. Subscription cancelled ────────────────────────────────────────────────

export function buildSubscriptionCancelledEmail(input: {
  tier: string;
  periodEnd?: string;
}): { subject: string; html: string } {
  const name = tierName(input.tier);

  const endNote = input.periodEnd
    ? `<p style="font-size:14px;color:#475569;line-height:1.6;margin:0 0 16px;">
        Your access to <strong>${name}</strong> features will continue until <strong>${input.periodEnd}</strong>.
        After that, your account will revert to the Free plan.
      </p>`
    : `<p style="font-size:14px;color:#475569;line-height:1.6;margin:0 0 16px;">
        Your account will revert to the Free plan. You can still use our AI food safety chat with standard limits.
      </p>`;

  return {
    subject: `Your PinkPepper ${name} subscription has been cancelled`,
    html: wrapEmail(`
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0F172A;">Subscription Cancelled</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">
        Your PinkPepper <strong>${name}</strong> subscription has been cancelled.
      </p>

      ${endNote}

      ${infoCard(
        `<p style="margin:0 0 4px;font-size:13px;color:#92400E;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Reactivate anytime</p>
        <p style="margin:0;font-size:14px;color:#0F172A;line-height:1.6;">Changed your mind? You can reactivate your subscription at any time from your dashboard and instantly regain access to all your plan features.</p>`,
        { bg: "#FFFBEB", border: "#FDE68A" }
      )}

      ${btn(`${APP_URL}/dashboard`, "Reactivate Subscription")}

      ${divider()}

      <p style="font-size:12px;color:#94A3B8;line-height:1.5;margin:0;">
        Thank you for using PinkPepper. We hope to see you back soon.
        If you cancelled by mistake or have feedback, please don't hesitate to reply to this email.
      </p>
    `),
  };
}
