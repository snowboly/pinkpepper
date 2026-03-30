import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ChatWorkspace from "@/components/dashboard/ChatWorkspace";
import { TIER_CAPABILITIES } from "@/lib/tier";
import { resolveUserAccess } from "@/lib/access";
import { countUsageSince, utcDayStartIso } from "@/lib/policy";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase
      .from("profiles")
      .select("tier,is_admin,onboarding_completed")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("tier,status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const { tier, isAdmin } = resolveUserAccess(profile, user.email, subscription);
  const caps = isAdmin
    ? {
        ...TIER_CAPABILITIES.pro,
        dailyMessages: Number.MAX_SAFE_INTEGER,
      }
    : TIER_CAPABILITIES[tier];

  let count = 0;
  try {
    count = await countUsageSince({
      supabase,
      userId: user.id,
      eventType: "chat_prompt",
      sinceIso: utcDayStartIso(),
    });
  } catch {
    count = 0;
  }

  return (
    <ChatWorkspace
      userEmail={user.email ?? "user"}
      initialTier={tier}
      initialUsage={count}
      usageLimit={caps.dailyMessages}
      dailyImageUploads={isAdmin ? Number.MAX_SAFE_INTEGER : caps.dailyImageUploads}
      canExportPdf={caps.allowPdfExport}
      canExportWord={caps.allowWordExport}
      canReview={caps.hasConsultancy}
      isAdmin={isAdmin}
      onboardingCompleted={profile?.onboarding_completed ?? false}
    />
  );
}
