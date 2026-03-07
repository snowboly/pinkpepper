"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export default function ConfirmPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token_hash = params.get("token_hash");
    const type = params.get("type") as EmailOtpType | null;
    const code = params.get("code");
    const next = params.get("next") ?? "/dashboard";

    const supabase = createClient();

    async function confirm() {
      let verified = false;
      let isSignup = false;

      // PKCE flow — Supabase redirects with a `code` param
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        verified = !error;
        if (verified) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email_confirmed_at) {
            const confirmedAt = new Date(user.email_confirmed_at).getTime();
            isSignup = Date.now() - confirmedAt < 60_000;
          }
        }
      }

      // Token-hash flow
      if (!verified && token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type });
        verified = !error;
        isSignup = type === "signup" || type === "email";
      }

      if (!verified) {
        router.replace("/login?error=invalid_or_expired_link");
        return;
      }

      // Fire welcome email for new signups (fire-and-forget)
      if (isSignup) {
        fetch("/api/auth/welcome", { method: "POST" }).catch(() => {});
      }

      router.replace(next);
    }

    if (code || (token_hash && type)) {
      confirm();
    } else {
      router.replace("/login?error=invalid_or_expired_link");
    }
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-[#6B6B6B]">Confirming your login…</p>
    </main>
  );
}
