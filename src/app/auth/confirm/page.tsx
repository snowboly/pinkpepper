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
    const next = params.get("next") ?? "/dashboard";

    if (!token_hash || !type) {
      router.replace("/login?error=invalid_or_expired_link");
      return;
    }

    const supabase = createClient();
    supabase.auth.verifyOtp({ token_hash, type }).then(({ error }) => {
      if (error) {
        router.replace("/login?error=invalid_or_expired_link");
      } else {
        router.replace(next);
      }
    });
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-[#6B6B6B]">Confirming your login…</p>
    </main>
  );
}
