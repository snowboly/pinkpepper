import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendEmail } from "@/lib/email";
import { buildWelcomeEmail } from "@/lib/auth-emails";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();
  let verified = false;
  let isSignup = false;

  // PKCE flow — Supabase redirects with a `code` param
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verified = !error;
    // Supabase doesn't expose the OTP type for PKCE, so check if the user
    // was just created (email_confirmed_at within the last 60 seconds).
    if (verified) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        const confirmedAt = new Date(user.email_confirmed_at).getTime();
        isSignup = Date.now() - confirmedAt < 60_000;
      }
    }
  }

  // Legacy / token-hash flow
  if (!verified && token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    verified = !error;
    isSignup = type === "signup" || type === "email";
  }

  if (verified) {
    // Send welcome email for new signups (fire-and-forget)
    if (isSignup) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        sendEmail({ to: user.email, ...buildWelcomeEmail() }).catch(console.error);
      }
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_or_expired_link`);
}
