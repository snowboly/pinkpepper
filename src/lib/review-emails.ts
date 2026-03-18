import { APP_URL, wrapEmail, btn, badge, infoCard, divider } from "@/lib/email-wrapper";

const CATEGORY_LABELS: Record<string, string> = {
  async_qa: "Async Q&A",
  process_flow: "Process Flow Review",
  log_review: "Log / Record Review",
  short_procedure: "Short Procedure",
  full_haccp_plan: "Full HACCP Plan",
  ccp_review: "CCP Review",
  prps_review: "PRPs Review",
  operations_manual: "Operations Manual",
};

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

// ─── 1. Admin: new review submitted ───────────────────────────────────────────

export function buildNewReviewAdminEmail(input: {
  userEmail: string;
  documentCategory: string;
  priority: string;
  notes: string | null;
}): { subject: string; html: string } {
  const cat = categoryLabel(input.documentCategory);
  const isPriority = input.priority === "priority";

  const priorityBadge = isPriority
    ? badge("Priority", { bg: "#FEF3C7", text: "#92400E" })
    : badge("Standard", { bg: "#F1F5F9", text: "#475569" });

  const notesSection = input.notes
    ? infoCard(
        `<p style="margin:0;font-size:14px;color:#0F172A;line-height:1.6;"><strong>User Notes:</strong> ${input.notes}</p>`,
        { bg: "#FFFBEB", border: "#FDE68A" }
      )
    : "";

  return {
    subject: `[PinkPepper] New review request: ${cat}${isPriority ? " 🔴" : ""}`,
    html: wrapEmail(`
      <h1 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#0F172A;">New Review Request</h1>
      <p style="margin:0 0 20px;font-size:14px;color:#64748B;">A new consultancy request has been submitted and is awaiting action.</p>

      ${divider()}

      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#64748B;width:110px;vertical-align:middle;">Priority</td>
          <td style="padding:8px 0;vertical-align:middle;">${priorityBadge}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#64748B;border-top:1px solid #F1F5F9;vertical-align:top;">From</td>
          <td style="padding:8px 0;border-top:1px solid #F1F5F9;font-weight:500;">${input.userEmail}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#64748B;border-top:1px solid #F1F5F9;vertical-align:top;">Category</td>
          <td style="padding:8px 0;border-top:1px solid #F1F5F9;">${cat}</td>
        </tr>
      </table>

      ${notesSection}
      ${btn(`${APP_URL}/admin/reviews`, "Open Review Queue")}
    `),
  };
}

// ─── 2. User: review submission confirmed (new) ────────────────────────────────

export function buildReviewSubmittedEmail(input: {
  documentCategory: string;
  priority: string;
}): { subject: string; html: string } {
  const cat = categoryLabel(input.documentCategory);
  const turnaround = "within 5 working days";

  return {
    subject: `Review request received: ${cat}`,
    html: wrapEmail(`
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0F172A;">Request Received</h1>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
        We've received your <strong>${cat}</strong> review request and it's now in our queue.
      </p>

      ${infoCard(
        `<p style="margin:0 0 4px;font-size:13px;color:#0369A1;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">What happens next</p>
        <p style="margin:0;font-size:14px;color:#0F172A;line-height:1.6;">A food safety consultant will pick up your request and provide expert feedback <strong>${turnaround}</strong>. You'll receive an email when your review begins.</p>`,
        { bg: "#F0F9FF", border: "#BAE6FD" }
      )}

      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;border-collapse:collapse;margin-top:8px;">
        <tr>
          <td style="padding:8px 0;color:#64748B;width:110px;">Category</td>
          <td style="padding:8px 0;font-weight:500;">${cat}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#64748B;border-top:1px solid #F1F5F9;">Priority</td>
          <td style="padding:8px 0;border-top:1px solid #F1F5F9;">${input.priority === "priority" ? "Priority" : "Standard"}</td>
        </tr>
      </table>

      ${btn(`${APP_URL}/dashboard/reviews`, "Track Your Reviews")}
    `),
  };
}

// ─── 3. User: review picked up (in progress) ──────────────────────────────────

export function buildReviewPickedUpEmail(input: {
  documentCategory: string;
  turnaround: string;
}): { subject: string; html: string } {
  const cat = categoryLabel(input.documentCategory);

  return {
    subject: `Your review is in progress: ${cat}`,
    html: wrapEmail(`
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0F172A;">Review In Progress</h1>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
        A food safety consultant has started working on your <strong>${cat}</strong> review.
      </p>

      ${infoCard(
        `<p style="margin:0 0 4px;font-size:13px;color:#0369A1;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Expected Turnaround</p>
        <p style="margin:0;font-size:14px;color:#0F172A;">${input.turnaround}</p>`,
        { bg: "#F0F9FF", border: "#BAE6FD" }
      )}

      <p style="font-size:14px;color:#64748B;line-height:1.6;margin:0;">
        You'll receive another notification as soon as your expert feedback is ready. You can track the status of your review on your dashboard at any time.
      </p>

      ${btn(`${APP_URL}/dashboard/reviews`, "Track Your Reviews")}
    `),
  };
}

// ─── 4. User: review completed ────────────────────────────────────────────────

export function buildReviewCompletedEmail(input: {
  documentCategory: string;
}): { subject: string; html: string } {
  const cat = categoryLabel(input.documentCategory);

  return {
    subject: `Review complete: ${cat}`,
    html: wrapEmail(`
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0F172A;">Review Complete</h1>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
        Great news! Your <strong>${cat}</strong> review has been completed by our food safety consultant.
      </p>

      ${infoCard(
        `<p style="margin:0 0 4px;font-size:13px;color:#15803D;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Feedback Ready</p>
        <p style="margin:0;font-size:14px;color:#0F172A;line-height:1.6;">Your expert feedback and recommendations are now available on your dashboard. Head over to review the consultant's notes and next steps.</p>`,
        { bg: "#F0FDF4", border: "#BBF7D0" }
      )}

      ${btn(`${APP_URL}/dashboard/reviews`, "View Feedback")}
    `),
  };
}

// ─── 5. User: review declined ─────────────────────────────────────────────────

export function buildReviewRejectedEmail(input: {
  documentCategory: string;
  reason: string;
}): { subject: string; html: string } {
  const cat = categoryLabel(input.documentCategory);

  return {
    subject: `Review declined: ${cat}`,
    html: wrapEmail(`
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0F172A;">Review Request Declined</h1>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
        Unfortunately, your <strong>${cat}</strong> review request could not be completed at this time.
      </p>

      ${infoCard(
        `<p style="margin:0 0 4px;font-size:13px;color:#B91C1C;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Reason for Decline</p>
        <p style="margin:0;font-size:14px;color:#0F172A;line-height:1.6;">${input.reason}</p>`,
        { bg: "#FEF2F2", border: "#FECACA" }
      )}

      <p style="font-size:14px;color:#64748B;line-height:1.6;margin:0;">
        You're welcome to revise your content and submit a new request at any time.
      </p>

      ${btn(`${APP_URL}/dashboard/reviews`, "View Your Reviews")}
    `),
  };
}
