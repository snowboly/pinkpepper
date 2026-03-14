import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveUserAccess } from "@/lib/access";
import { TIER_CAPABILITIES } from "@/lib/tier";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
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
    .select("id,created_at")
    .eq("id", id)
    .eq("user_id", user.id);

  if (!isAdmin && caps.conversationRetentionDays) {
    const sinceIso = new Date(Date.now() - caps.conversationRetentionDays * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", sinceIso);
  }

  const { data: conv } = await query.maybeSingle();

  if (!conv) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("id,role,content,created_at,metadata")
    .eq("conversation_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: "Failed to load messages." }, { status: 500 });
  }

  return NextResponse.json({ messages: messages ?? [] });
}
