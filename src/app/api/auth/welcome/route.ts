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

  // Only send if the account was confirmed within the last 60 seconds
  if (user.email_confirmed_at) {
    const confirmedAt = new Date(user.email_confirmed_at).getTime();
    if (Date.now() - confirmedAt < 60_000) {
      sendEmail({ to: user.email, ...buildWelcomeEmail() }).catch(console.error);
    }
  }

  return NextResponse.json({ ok: true });
}
