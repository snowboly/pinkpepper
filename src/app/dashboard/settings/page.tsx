import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SettingsForm from "@/components/dashboard/SettingsForm";
import { resolveUserAccess } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/settings");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier,is_admin")
    .eq("id", user.id)
    .maybeSingle();
  const { tier, isAdmin } = resolveUserAccess(profile, user.email);

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
        />
      </div>
    </div>
  );
}
