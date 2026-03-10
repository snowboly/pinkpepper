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

  const welcomeEmailSentAt = user.user_metadata?.welcome_email_sent_at;
  if (welcomeEmailSentAt) {
    return NextResponse.json({ ok: true });
  }

  await sendEmail({ to: user.email, ...buildWelcomeEmail() });

  await supabase.auth.updateUser({
    data: {
      ...(user.user_metadata ?? {}),
      welcome_email_sent_at: new Date().toISOString(),
    },
  });

  return NextResponse.json({ ok: true });
}
