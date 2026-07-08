import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendEmail } from "@/lib/email";
import { buildWelcomeEmail } from "@/lib/auth-emails";
import { syncMarketingContact } from "@/lib/resend/contacts";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!user.email_confirmed_at) {
    return NextResponse.json({ ok: true });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,last_name,marketing_email_opt_in,welcome_email_sent_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.marketing_email_opt_in) {
    await syncMarketingContact({
      email: user.email,
      firstName: profile.first_name ?? null,
      lastName: profile.last_name ?? null,
      subscribed: true,
    });
  }

  if (profile?.welcome_email_sent_at) {
    return NextResponse.json({ ok: true });
  }

  await sendEmail({ to: user.email, ...buildWelcomeEmail(profile?.first_name ?? null) });

  await supabase
    .from("profiles")
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
