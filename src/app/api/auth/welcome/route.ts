import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendEmail } from "@/lib/email";
import { buildWelcomeEmail } from "@/lib/auth-emails";

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
    .select("first_name,welcome_email_sent_at")
    .eq("id", user.id)
    .maybeSingle();

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
