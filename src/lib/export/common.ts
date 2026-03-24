import { createClient } from "@/utils/supabase/server";
import { TIER_CAPABILITIES, type SubscriptionTier } from "@/lib/tier";
import { resolveUserAccess } from "@/lib/access";

type ExportContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  tier: SubscriptionTier;
  isAdmin: boolean;
};

export async function getExportContext(): Promise<ExportContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase
      .from("profiles")
      .select("tier,is_admin")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("tier,status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const { tier, isAdmin } = resolveUserAccess(profile, user.email, subscription);

  return { supabase, userId: user.id, tier, isAdmin };
}

export function canExportPdf(tier: SubscriptionTier, isAdmin = false): boolean {
  if (isAdmin) return true;
  return TIER_CAPABILITIES[tier].allowPdfExport;
}

export function canExportDocx(tier: SubscriptionTier, isAdmin = false): boolean {
  if (isAdmin) return true;
  return TIER_CAPABILITIES[tier].allowWordExport;
}

export async function getLatestAssistantMessageForConversation(input: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  conversationId: string;
}) {
  const { supabase, userId, conversationId } = input;

  const { data: conv } = await supabase
    .from("conversations")
    .select("id,title")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!conv) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  const { data: rows, error: msgError } = await supabase
    .from("chat_messages")
    .select("content,created_at,metadata")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .eq("role", "assistant")
    .order("created_at", { ascending: false })
    .limit(1);

  if (msgError) {
    console.error("[export] chat_messages query error:", msgError);
    throw new Error("NO_ASSISTANT_CONTENT");
  }

  const latestAssistant = rows?.[0] ?? null;

  if (!latestAssistant?.content) {
    throw new Error("NO_ASSISTANT_CONTENT");
  }

  return {
    conversationTitle: conv.title ?? "PinkPepper Document",
    content: latestAssistant.content,
    createdAt: latestAssistant.created_at,
    metadata: (latestAssistant as Record<string, unknown>).metadata as Record<string, unknown> | null,
  };
}

export async function recordExportUsage(input: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  format: "pdf" | "docx";
  conversationId: string;
}) {
  const { supabase, userId, format, conversationId } = input;

  await supabase.from("usage_events").insert({
    user_id: userId,
    event_type: "document_export",
    event_count: 1,
    metadata: { conversation_id: conversationId, format },
  });
}
