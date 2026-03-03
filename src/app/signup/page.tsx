"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const supabase = createClient();
      const origin = window.location.origin;
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/confirm?next=/dashboard`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setMessage("Check your inbox and click the verification link to activate your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative overflow-hidden py-16 md:py-24">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 right-0 top-0 m-auto h-[300px] w-[300px] rounded-full bg-[#F2A7A7]/30 blur-[100px]" />
      </div>

      <div className="pp-container">
        <div className="mx-auto max-w-md rounded-[2rem] border border-[#E8DADA] bg-white p-7 shadow-xl md:p-8">
          <p className="inline-flex rounded-full bg-[#FCEEEE] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#B85C5C]">
            New Account
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-[#2B2B2B]">Get Started</h1>
          <p className="mt-2 text-sm text-[#6B6B6B]">Create your PinkPepper account.</p>

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
            <div>
              <label className="mb-1 block text-sm font-medium text-[#2B2B2B]">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#E8DADA] bg-white px-3 py-2.5 outline-none ring-[#D96C6C]/20 focus:ring-4"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#2B2B2B]">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-[#E8DADA] bg-white px-3 py-2.5 outline-none ring-[#D96C6C]/20 focus:ring-4"
                placeholder="Repeat password"
              />
            </div>
            <button disabled={loading} type="submit" className="w-full rounded-xl bg-[#D96C6C] py-3 font-bold text-white transition-colors hover:bg-[#C95A5A] disabled:opacity-70">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-sm text-[#6B6B6B]">
            Already have an account? <Link href="/login" className="underline">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
