import { redirect } from "next/navigation";
import ChatWorkspace from "@/components/dashboard/ChatWorkspace";
import { createClient } from "@/utils/supabase/server";
import { resolveUserAccess } from "@/lib/access";
import { countUsageSince, utcDayStartIso } from "@/lib/policy";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier,is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const { tier, isAdmin } = resolveUserAccess(profile, user.email);
  if (!isAdmin) {
    redirect("/dashboard");
  }

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
      userEmail={user.email ?? "admin"}
      initialTier={tier}
      initialUsage={count}
      usageLimit={Number.MAX_SAFE_INTEGER}
      canExportPdf
      canExportWord
      isAdmin
    />
  );
}
