import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { resolveUserAccess } from "@/lib/access";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const admin = createAdminClient();

  let query = admin
    .from("review_requests")
    .select("id,user_id,conversation_id,review_type,document_category,status,priority,notes,reviewer_notes,snapshot_content,created_at,updated_at,completed_at", { count: "exact" })
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true })
    .range(offset, offset + PAGE_SIZE - 1);

  if (status && ["queued", "in_review", "completed", "rejected"].includes(status)) {
    query = query.eq("status", status as "queued" | "in_review" | "completed" | "rejected");
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to load reviews." }, { status: 500 });
  }

  // Fetch user emails for each unique user_id
  const userIds = [...new Set((data ?? []).map((r) => r.user_id))];
  let userEmails: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id,email")
      .in("id", userIds);

    if (profiles) {
      userEmails = Object.fromEntries(profiles.map((p) => [p.id, p.email ?? "unknown"]));
    }
  }

  const requests = (data ?? []).map((r) => ({
    ...r,
    user_email: userEmails[r.user_id] ?? "unknown",
  }));

  return NextResponse.json({ requests, total: count ?? 0, page });
}
