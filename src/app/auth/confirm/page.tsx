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
    const flow = params.get("flow");

    const supabase = createClient();

    async function confirm() {
      let verified = false;
      let isSignup = flow === "signup";

      // PKCE flow — Supabase redirects with a `code` param
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        verified = !error;
      }

      // Token-hash flow
      if (!verified && token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type });
        verified = !error;
        isSignup = isSignup || type === "signup";
      }

      if (!verified) {
        // PKCE code exchange failed — most likely the user opened the
        // link on a different device/browser than where they signed up.
        const errorParam = code
          ? "cross_device_link"
          : "invalid_or_expired_link";
        router.replace(`/login?error=${errorParam}`);
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
