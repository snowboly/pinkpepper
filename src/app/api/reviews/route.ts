import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveUserAccess } from "@/lib/access";
import { TIER_CAPABILITIES } from "@/lib/tier";
import { countUsageSince, utcMonthStartIso } from "@/lib/policy";

export const dynamic = "force-dynamic";

type ReviewType = "quick_check" | "full_review";

function normalizeReviewType(input: string | undefined): ReviewType {
  if (input === "full_review") return "full_review";
  return "quick_check";
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

  let query = supabase
    .from("review_requests")
    .select("id,conversation_id,review_type,status,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (conversationId) {
    query = query.eq("conversation_id", conversationId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Failed to load review requests." }, { status: 500 });
  }

  return NextResponse.json({ requests: data ?? [] });
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
    reviewType?: string;
    notes?: string;
  };

  const conversationId = body.conversationId?.trim();
  const notes = body.notes?.trim() ?? "";
  const reviewType = normalizeReviewType(body.reviewType);

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId is required." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier,is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const { tier, isAdmin } = resolveUserAccess(profile, user.email);
  const caps = TIER_CAPABILITIES[tier];

  if (!isAdmin && caps.monthlyHumanReviews <= 0) {
    return NextResponse.json({ error: "Human review is available on Plus and Pro." }, { status: 403 });
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

    if (used >= caps.monthlyHumanReviews) {
      return NextResponse.json({ error: "Monthly human review limit reached for your plan." }, { status: 402 });
    }
  }

  const { data: created, error: createError } = await supabase
    .from("review_requests")
    .insert({
      user_id: user.id,
      conversation_id: conversationId,
      review_type: reviewType,
      notes: notes.length > 0 ? notes : null,
      snapshot_content: latestAssistant.content,
      status: "queued",
      priority: tier === "pro" || isAdmin ? "priority" : "standard",
    })
    .select("id,review_type,status,created_at")
    .single();

  if (createError || !created) {
    return NextResponse.json({ error: "Failed to create review request." }, { status: 500 });
  }

  const { error: usageError } = await supabase.from("usage_events").insert({
    user_id: user.id,
    event_type: "human_review_request",
    event_count: 1,
    metadata: { review_request_id: created.id, conversation_id: conversationId, review_type: reviewType },
  });

  if (usageError) {
    return NextResponse.json({ error: "Failed to record review usage." }, { status: 500 });
  }

  return NextResponse.json({
    request: created,
    usage: {
      used: isAdmin ? 0 : used + 1,
      limit: isAdmin ? null : caps.monthlyHumanReviews,
    },
  });
}

