import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendEmail } from "@/lib/email";
import { buildWelcomeEmail } from "@/lib/auth-emails";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    console.info("welcome email skipped: unauthenticated request");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!user.email_confirmed_at) {
    console.info("welcome email skipped: email not confirmed", { userId: user.id });
    return NextResponse.json({ ok: true });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,welcome_email_sent_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.welcome_email_sent_at) {
    console.info("welcome email skipped: already sent", { userId: user.id });
    return NextResponse.json({ ok: true });
  }

  console.info("welcome email send attempted", { userId: user.id });
  const result = await sendEmail({ to: user.email, ...buildWelcomeEmail(profile?.first_name ?? null) });

  if (!result.ok) {
    console.error("welcome email send failed", { userId: user.id, reason: result.reason, error: result.error });
    return NextResponse.json({ ok: false, error: "Welcome email could not be sent." }, { status: 500 });
  }

  await supabase
    .from("profiles")
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("id", user.id);

  console.info("welcome email sent successfully", { userId: user.id, messageId: result.id });
  return NextResponse.json({ ok: true });
}
