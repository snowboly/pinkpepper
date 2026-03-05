const APP_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pinkpepper.ai";

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

function wrapHtml(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0F172A; max-width: 560px; margin: 0 auto; padding: 24px;">
  ${body}
  <p style="margin-top: 32px; font-size: 12px; color: #94A3B8;">PinkPepper — AI-Powered Food Safety</p>
</body>
</html>`;
}

export function buildNewReviewAdminEmail(input: {
  userEmail: string;
  documentCategory: string;
  reviewType: string;
  priority: string;
  notes: string | null;
}): { subject: string; html: string } {
  const cat = categoryLabel(input.documentCategory);
  const priorityBadge = input.priority === "priority"
    ? ' <span style="background:#FEF3C7;color:#92400E;padding:2px 8px;border-radius:12px;font-size:12px;">Priority</span>'
    : "";

  return {
    subject: `New review request: ${cat}`,
    html: wrapHtml(`
      <h2 style="color:#E11D48;margin-bottom:4px;">New Review Request${priorityBadge}</h2>
      <table style="font-size:14px;border-collapse:collapse;width:100%;">
        <tr><td style="padding:6px 12px 6px 0;color:#64748B;">User</td><td style="padding:6px 0;">${input.userEmail}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#64748B;">Category</td><td style="padding:6px 0;">${cat}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#64748B;">Type</td><td style="padding:6px 0;">${input.reviewType === "full_review" ? "Full Review" : "Quick Check"}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#64748B;">Priority</td><td style="padding:6px 0;">${input.priority}</td></tr>
        ${input.notes ? `<tr><td style="padding:6px 12px 6px 0;color:#64748B;vertical-align:top;">Notes</td><td style="padding:6px 0;">${input.notes}</td></tr>` : ""}
      </table>
      <a href="${APP_URL}/admin/reviews" style="display:inline-block;margin-top:16px;background:#E11D48;color:#fff;padding:10px 20px;border-radius:20px;text-decoration:none;font-size:14px;font-weight:600;">Open Review Queue</a>
    `),
  };
}

export function buildReviewPickedUpEmail(input: {
  documentCategory: string;
  turnaround: string;
}): { subject: string; html: string } {
  const cat = categoryLabel(input.documentCategory);

  return {
    subject: `Your review is in progress: ${cat}`,
    html: wrapHtml(`
      <h2 style="color:#E11D48;">Your Review Is In Progress</h2>
      <p>A food safety consultant has picked up your <strong>${cat}</strong> review.</p>
      <p>You can expect feedback <strong>${input.turnaround}</strong>.</p>
      <a href="${APP_URL}/dashboard/reviews" style="display:inline-block;margin-top:12px;background:#E11D48;color:#fff;padding:10px 20px;border-radius:20px;text-decoration:none;font-size:14px;font-weight:600;">Track Your Reviews</a>
    `),
  };
}

export function buildReviewCompletedEmail(input: {
  documentCategory: string;
}): { subject: string; html: string } {
  const cat = categoryLabel(input.documentCategory);

  return {
    subject: `Review complete: ${cat}`,
    html: wrapHtml(`
      <h2 style="color:#E11D48;">Your Review Is Complete</h2>
      <p>Your <strong>${cat}</strong> review has been completed by our food safety consultant.</p>
      <p>Reviewer feedback is now available on your dashboard.</p>
      <a href="${APP_URL}/dashboard/reviews" style="display:inline-block;margin-top:12px;background:#E11D48;color:#fff;padding:10px 20px;border-radius:20px;text-decoration:none;font-size:14px;font-weight:600;">View Feedback</a>
    `),
  };
}

export function buildReviewRejectedEmail(input: {
  documentCategory: string;
  reason: string;
}): { subject: string; html: string } {
  const cat = categoryLabel(input.documentCategory);

  return {
    subject: `Review declined: ${cat}`,
    html: wrapHtml(`
      <h2 style="color:#E11D48;">Review Request Declined</h2>
      <p>Your <strong>${cat}</strong> review request could not be completed.</p>
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:12px 16px;margin:12px 0;">
        <p style="margin:0;font-size:14px;"><strong>Reason:</strong> ${input.reason}</p>
      </div>
      <p style="font-size:14px;color:#64748B;">This does not count against your monthly review quota. You can submit a new request at any time.</p>
      <a href="${APP_URL}/dashboard/reviews" style="display:inline-block;margin-top:12px;background:#E11D48;color:#fff;padding:10px 20px;border-radius:20px;text-decoration:none;font-size:14px;font-weight:600;">View Your Reviews</a>
    `),
  };
}
