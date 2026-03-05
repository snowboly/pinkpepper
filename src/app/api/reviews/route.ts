import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { resolveUserAccess } from "@/lib/access";
import { TIER_CAPABILITIES } from "@/lib/tier";
import { countUsageSince, utcMonthStartIso } from "@/lib/policy";
import { sendEmail } from "@/lib/email";
import { buildNewReviewAdminEmail, buildReviewSubmittedEmail } from "@/lib/review-emails";

export const dynamic = "force-dynamic";

const QUICK_CHECK_CATEGORIES = ["async_qa", "process_flow", "log_review", "short_procedure"] as const;
const FULL_REVIEW_CATEGORIES = ["full_haccp_plan", "ccp_review", "prps_review", "operations_manual"] as const;

type DocumentCategory = typeof QUICK_CHECK_CATEGORIES[number] | typeof FULL_REVIEW_CATEGORIES[number];
type ReviewType = "quick_check" | "full_review";

function normalizeDocumentCategory(input: string | undefined): DocumentCategory | null {
  if (QUICK_CHECK_CATEGORIES.includes(input as typeof QUICK_CHECK_CATEGORIES[number])) return input as DocumentCategory;
  if (FULL_REVIEW_CATEGORIES.includes(input as typeof FULL_REVIEW_CATEGORIES[number])) return input as DocumentCategory;
  return null;
}

function deriveReviewType(category: DocumentCategory): ReviewType {
  return FULL_REVIEW_CATEGORIES.includes(category as typeof FULL_REVIEW_CATEGORIES[number])
    ? "full_review"
    : "quick_check";
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const conversationId = url.searchParams.get("conversationId");
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  // When fetching for a specific conversation, return minimal fields (for ReviewModal)
  // When fetching all reviews, return full details (for /dashboard/reviews)
  const columns = conversationId
    ? "id,conversation_id,review_type,document_category,status,created_at"
    : "id,conversation_id,review_type,document_category,status,notes,reviewer_notes,reviewer_file_id,snapshot_content,created_at,updated_at,completed_at";

  let query = supabase
    .from("review_requests")
    .select(columns, { count: conversationId ? undefined : "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (conversationId) {
    query = query.eq("conversation_id", conversationId).limit(20);
  } else {
    query = query.range(offset, offset + pageSize - 1);
  }

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: "Failed to load review requests." }, { status: 500 });
  }

  if (conversationId) {
    return NextResponse.json({ requests: data ?? [] });
  }

  return NextResponse.json({ requests: data ?? [], total: count ?? 0, page });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    conversationId?: string;
    documentCategory?: string;
    notes?: string;
  };

  const conversationId = body.conversationId?.trim();
  const notes = body.notes?.trim() ?? "";
  const documentCategory = normalizeDocumentCategory(body.documentCategory);

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId is required." }, { status: 400 });
  }

  if (!documentCategory) {
    return NextResponse.json({ error: "A valid documentCategory is required." }, { status: 400 });
  }

  const reviewType = deriveReviewType(documentCategory);

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier,is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const { tier, isAdmin } = resolveUserAccess(profile, user.email);
  const caps = TIER_CAPABILITIES[tier];

  if (!isAdmin && caps.monthlyHumanReviews <= 0) {
    return NextResponse.json({ error: "Expert document review is available on Pro." }, { status: 403 });
  }

  if (!isAdmin && reviewType === "full_review" && !caps.allowFullDocumentReview) {
    return NextResponse.json({ error: "Full document review is available on Pro only." }, { status: 403 });
  }

  const { data: conv } = await supabase
    .from("conversations")
    .select("id,title")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!conv) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const { data: latestAssistant } = await supabase
    .from("chat_messages")
    .select("content")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .eq("role", "assistant")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestAssistant?.content) {
    return NextResponse.json({ error: "No assistant output available to review." }, { status: 400 });
  }

  const monthStart = utcMonthStartIso();
  let used = 0;
  if (!isAdmin) {
    try {
      used = await countUsageSince({
        supabase,
        userId: user.id,
        eventType: "human_review_request",
        sinceIso: monthStart,
      });
    } catch {
      return NextResponse.json({ error: "Unable to read review usage." }, { status: 500 });
    }

    if (reviewType === "full_review" && used >= 1) {
      return NextResponse.json(
        { error: "Full document review costs all 3 credits and requires a fresh monthly balance. Use your remaining quick checks first or wait until next month." },
        { status: 402 }
      );
    }

    if (used >= caps.monthlyHumanReviews) {
      return NextResponse.json({ error: "Monthly review credits exhausted. Credits reset at the start of your next billing month." }, { status: 402 });
    }
  }

  const { data: created, error: createError } = await supabase
    .from("review_requests")
    .insert({
      user_id: user.id,
      conversation_id: conversationId,
      review_type: reviewType,
      document_category: documentCategory,
      notes: notes.length > 0 ? notes : null,
      snapshot_content: latestAssistant.content,
      status: "queued",
      priority: tier === "pro" || isAdmin ? "priority" : "standard",
    })
    .select("id,review_type,document_category,status,created_at")
    .single();

  if (createError || !created) {
    return NextResponse.json({ error: "Failed to create review request." }, { status: 500 });
  }

  // A full_review exhausts the entire monthly quota; insert one row per slot so
  // countUsageSince correctly reflects the quota as exhausted.
  const slotsToConsume = !isAdmin && reviewType === "full_review" ? caps.monthlyHumanReviews : 1;
  const usageRows = Array.from({ length: slotsToConsume }, () => ({
    user_id: user.id,
    event_type: "human_review_request" as const,
    event_count: 1,
    metadata: { review_request_id: created.id, conversation_id: conversationId, document_category: documentCategory, review_type: reviewType },
  }));

  const { error: usageError } = await supabase.from("usage_events").insert(usageRows);

  if (usageError) {
    return NextResponse.json({ error: "Failed to record review usage." }, { status: 500 });
  }

  const priority = tier === "pro" || isAdmin ? "priority" : "standard";

  // Notify admin(s) of new review request (fire-and-forget)
  try {
    const adminDb = createAdminClient();
    const { data: adminProfiles } = await adminDb
      .from("profiles")
      .select("email")
      .eq("is_admin", true);

    const adminEmails = (adminProfiles ?? [])
      .map((p) => p.email)
      .filter(Boolean) as string[];

    // Also include ADMIN_EMAILS env var
    const envAdmins = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const allAdmins = [...new Set([...adminEmails, ...envAdmins])];

    if (allAdmins.length > 0) {
      const emailContent = buildNewReviewAdminEmail({
        userEmail: user.email ?? "unknown",
        documentCategory,
        reviewType,
        priority,
        notes: notes.length > 0 ? notes : null,
      });
      await sendEmail({ to: allAdmins, ...emailContent });
    }
  } catch (err) {
    console.error("Failed to send admin notification email:", err);
  }

  // Send submission confirmation to the user (fire-and-forget)
  if (user.email) {
    try {
      const confirmationEmail = buildReviewSubmittedEmail({
        documentCategory,
        reviewType,
        priority,
      });
      await sendEmail({ to: user.email, ...confirmationEmail });
    } catch (err) {
      console.error("Failed to send review submission confirmation email:", err);
    }
  }

  return NextResponse.json({
    request: created,
    usage: {
      used: isAdmin ? 0 : used + slotsToConsume,
      limit: isAdmin ? null : caps.monthlyHumanReviews,
    },
  });
}
