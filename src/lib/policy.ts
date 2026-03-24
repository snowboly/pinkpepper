import type { SubscriptionTier } from "@/lib/tier";
import { TIER_CAPABILITIES } from "@/lib/tier";

type SupabaseLike = {
  from: (table: string) => {
    select: (columns: string, options?: { count?: "exact"; head?: boolean }) => {
      eq: (column: string, value: string) => {
        eq: (column: string, value: UsageEventType) => {
          gte: (column: string, value: string) => unknown;
        };
      };
    };
  };
};

export type UsageEventType =
  | "chat_prompt"
  | "document_export"
  | "image_upload"
  | "human_review_request"
  | "audio_transcription";

export function utcDayStartIso(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

export function utcMonthStartIso(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function countUsageSince(input: {
  supabase: unknown;
  userId: string;
  eventType: UsageEventType;
  sinceIso: string;
}) {
  const { supabase, userId, eventType, sinceIso } = input;
  const client = supabase as SupabaseLike;
  const result = (await client
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("event_type", eventType)
    .gte("created_at", sinceIso)) as { count: number | null; error: unknown };
  const { count, error } = result;

  if (error) throw new Error("USAGE_READ_FAILED");
  return count ?? 0;
}

export function tierLimits(tier: SubscriptionTier) {
  return TIER_CAPABILITIES[tier];
}
