"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/update-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setMessage("We sent a password reset link to your email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-4 rounded-xl border border-[#E8DADA] bg-[#FAF6F5] px-3 py-2 text-sm">{message}</p>}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#2B2B2B]">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[#E8DADA] bg-white px-3 py-2.5 outline-none ring-[#D96C6C]/20 focus:ring-4"
            placeholder="you@company.com"
          />
        </div>
        <button disabled={loading} type="submit" className="w-full rounded-xl bg-[#D96C6C] py-3 font-bold text-white transition-colors hover:bg-[#C95A5A] disabled:opacity-70">
          {loading ? "Sending link..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-4 text-sm text-[#6B6B6B]"><Link href="/login" className="underline">Back to login</Link></p>
    </>
  );
}
