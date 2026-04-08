import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SettingsForm from "@/components/dashboard/SettingsForm";
import { resolveUserAccess } from "@/lib/access";
import { countUsageSince, utcDayStartIso } from "@/lib/policy";
import { TIER_CAPABILITIES } from "@/lib/tier";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/settings");
  }

  type ProfileRow = { tier?: string | null; is_admin?: boolean | null; chat_language?: string | null };
  const [profileResult, subscriptionResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("tier,is_admin,chat_language")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("tier,status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  const profile = profileResult.data as ProfileRow | null;
  const { tier, isAdmin } = resolveUserAccess(profile, user.email, subscriptionResult.data);
  const chatLanguage = profile?.chat_language ?? "en";

  const caps = TIER_CAPABILITIES[tier as keyof typeof TIER_CAPABILITIES] ?? TIER_CAPABILITIES.free;
  let usageCount = 0;
  if (!isAdmin) {
    const dayStart = utcDayStartIso();
    try {
      usageCount = await countUsageSince({ supabase, userId: user.id, eventType: "chat_prompt", sinceIso: dayStart });
    } catch {
      usageCount = 0;
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] py-10 px-4">
      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to chat
          </a>
        </div>

        <h1 className="text-xl font-semibold text-[#0F172A] mb-6">Account Settings</h1>

        <SettingsForm
          email={user.email ?? ""}
          tier={tier}
          isAdmin={isAdmin}
          chatLanguage={chatLanguage}
          usage={usageCount}
          usageLimit={isAdmin ? null : caps.dailyMessages}
        />
      </div>
    </div>
  );
}
