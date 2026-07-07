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

  if (user.user_metadata?.marketing_email_opt_in) {
    await syncMarketingContact({
      email: user.email,
      firstName:
        typeof user.user_metadata.first_name === "string" ? user.user_metadata.first_name : null,
      lastName:
        typeof user.user_metadata.last_name === "string" ? user.user_metadata.last_name : null,
      subscribed: true,
    });
  }

  const welcomeEmailSentAt = user.user_metadata?.welcome_email_sent_at;
  if (welcomeEmailSentAt) {
    return NextResponse.json({ ok: true });
  }

  const firstName =
    typeof user.user_metadata?.first_name === "string"
      ? user.user_metadata.first_name
      : null;

  await sendEmail({ to: user.email, ...buildWelcomeEmail(firstName) });

  await supabase.auth.updateUser({
    data: {
      ...(user.user_metadata ?? {}),
      welcome_email_sent_at: new Date().toISOString(),
    },
  });

  return NextResponse.json({ ok: true });
}
