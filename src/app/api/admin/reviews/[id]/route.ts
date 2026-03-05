import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { resolveUserAccess } from "@/lib/access";
import { sendEmail } from "@/lib/email";
import { uploadFile, BUCKETS } from "@/lib/storage";
import {
  buildReviewPickedUpEmail,
  buildReviewCompletedEmail,
  buildReviewRejectedEmail,
} from "@/lib/review-emails";

export const dynamic = "force-dynamic";

const VALID_TRANSITIONS: Record<string, string[]> = {
  queued: ["in_review", "rejected"],
  in_review: ["completed", "rejected"],
};

const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

async function parseBody(request: Request): Promise<{
  status: string | undefined;
  reviewer_notes: string;
  file: File | null;
}> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.startsWith("multipart/form-data")) {
    const formData = await request.formData();
    return {
      status: formData.get("status")?.toString(),
      reviewer_notes: formData.get("reviewer_notes")?.toString()?.trim() ?? "",
      file: formData.get("file") as File | null,
    };
  }

  const body = (await request.json()) as {
    status?: string;
    reviewer_notes?: string;
  };

  return {
    status: body.status,
    reviewer_notes: body.reviewer_notes?.trim() ?? "",
    file: null,
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier,is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const { isAdmin } = resolveUserAccess(profile, user.email);
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status: newStatus, reviewer_notes: reviewerNotes, file } = await parseBody(request);

  if (!newStatus || !["in_review", "completed", "rejected"].includes(newStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  if ((newStatus === "completed" || newStatus === "rejected") && !reviewerNotes) {
    return NextResponse.json(
      { error: "reviewer_notes is required when completing or rejecting a review." },
      { status: 400 }
    );
  }

  // Validate file type if provided
  if (file && file.size > 0 && !ALLOWED_FILE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only PDF and DOCX files are accepted." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Fetch current review
  const { data: review, error: fetchError } = await admin
    .from("review_requests")
    .select("id,user_id,status,document_category,review_type")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  const allowed = VALID_TRANSITIONS[review.status];
  if (!allowed || !allowed.includes(newStatus)) {
    return NextResponse.json(
      { error: `Cannot transition from "${review.status}" to "${newStatus}".` },
      { status: 400 }
    );
  }

  // Upload reviewer file if provided
  let reviewerFileId: string | null = null;
  if (file && file.size > 0) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      // Upload under the review user's ID so RLS policies work for their downloads
      reviewerFileId = await uploadFile(
        review.user_id,
        "pro", // Admin uploads bypass tier quota concerns; use pro for max limits
        buffer,
        file.name,
        file.type,
        BUCKETS.review,
        { reviewRequestId: id }
      );
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "File upload failed." },
        { status: 400 }
      );
    }
  }

  // Build update payload
  const updatePayload: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (reviewerNotes) {
    updatePayload.reviewer_notes = reviewerNotes;
  }

  if (newStatus === "completed" || newStatus === "rejected") {
    updatePayload.completed_at = new Date().toISOString();
  }

  if (reviewerFileId) {
    updatePayload.reviewer_file_id = reviewerFileId;
  }

  const { data: updated, error: updateError } = await admin
    .from("review_requests")
    .update(updatePayload)
    .eq("id", id)
    .select("id,status,reviewer_notes,reviewer_file_id,completed_at,updated_at")
    .single();

  if (updateError || !updated) {
    return NextResponse.json({ error: "Failed to update review." }, { status: 500 });
  }

  // Send email notification to user
  try {
    const { data: userProfile } = await admin
      .from("profiles")
      .select("email")
      .eq("id", review.user_id)
      .maybeSingle();

    if (userProfile?.email) {
      let emailContent: { subject: string; html: string } | null = null;

      if (newStatus === "in_review") {
        emailContent = buildReviewPickedUpEmail({
          documentCategory: review.document_category ?? review.review_type,
          turnaround: "within 72 hours",
        });
      } else if (newStatus === "completed") {
        emailContent = buildReviewCompletedEmail({
          documentCategory: review.document_category ?? review.review_type,
        });
      } else if (newStatus === "rejected") {
        emailContent = buildReviewRejectedEmail({
          documentCategory: review.document_category ?? review.review_type,
          reason: reviewerNotes,
        });
      }

      if (emailContent) {
        await sendEmail({ to: userProfile.email, ...emailContent });
      }
    }
  } catch (err) {
    console.error("Failed to send review status email:", err);
  }

  return NextResponse.json({ request: updated });
}
