import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveUserAccess } from "@/lib/access";
import { TIER_CAPABILITIES } from "@/lib/tier";

export const dynamic = "force-dynamic";

export async function GET() {
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

  const { tier, isAdmin } = resolveUserAccess(profile, user.email);
  const caps = TIER_CAPABILITIES[tier];

  let query = supabase
    .from("conversations")
    .select("id,title,created_at,updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(caps.maxSavedConversations ?? 200);

  if (!isAdmin && caps.conversationRetentionDays) {
    const sinceIso = new Date(Date.now() - caps.conversationRetentionDays * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", sinceIso);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to load conversations." }, { status: 500 });
  }

  return NextResponse.json({ conversations: data ?? [] });
}
