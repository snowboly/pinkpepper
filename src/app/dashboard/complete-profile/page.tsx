import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CompleteProfileForm from "./CompleteProfileForm";

export const dynamic = "force-dynamic";

export default async function CompleteProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/complete-profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,last_name,company_name,marketing_email_opt_in,business_type")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="pp-container py-16">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-[#E8DADA] bg-white p-7 shadow-xl md:p-8">
        <p className="inline-flex rounded-full bg-[#FCEEEE] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#B85C5C]">
          Finish Setup
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-[#2B2B2B]">Complete your profile</h1>
        <p className="mt-2 text-sm text-[#6B6B6B]">
          Add your name and optional company details before entering the dashboard.
        </p>
        <CompleteProfileForm
          initialFirstName={profile?.first_name ?? ""}
          initialLastName={profile?.last_name ?? ""}
          initialCompanyName={profile?.company_name ?? ""}
          initialMarketingOptIn={Boolean(profile?.marketing_email_opt_in)}
          initialBusinessType={profile?.business_type ?? ""}
        />
      </div>
    </main>
  );
}
