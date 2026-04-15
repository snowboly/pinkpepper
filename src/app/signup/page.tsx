"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { validatePassword } from "@/lib/password";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("error") === "confirm_email") {
      setMessage("Please confirm your email address before accessing the dashboard. Check your inbox for the verification link.");
    }
  }, [searchParams]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const supabase = createClient();
      const origin = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/dashboard&flow=signup`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Supabase returns a user with no identities when the email is already registered
      // (to prevent email enumeration). No confirmation email is sent in this case.
      if (data?.user?.identities?.length === 0) {
        setError("An account with this email may already exist. Try logging in or resetting your password.");
        return;
      }

      setSignupDone(true);
    } finally {
      setLoading(false);
    }
  }

  async function onResendConfirmation() {
    if (!email) return;
    setResendLoading(true);
    setResendMessage(null);
    try {
      const supabase = createClient();
      const origin = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/dashboard&flow=signup`,
        },
      });
      if (resendError) {
        setResendMessage("Could not resend — " + resendError.message);
      } else {
        setResendMessage("Sent! Check your inbox (and spam folder).");
      }
    } finally {
      setResendLoading(false);
    }
  }

  async function onMagicLink() {
    if (!email) {
      setError("Enter your email address above first.");
      return;
    }
    setMagicLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const origin = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origin}/auth/callback?next=/dashboard&flow=signup`, shouldCreateUser: true },
      });
      if (otpError) {
        setError(otpError.message);
        return;
      }
      setMagicSent(true);
    } finally {
      setMagicLoading(false);
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
          {message && <p className="mt-4 rounded-xl border border-[#E8DADA] bg-[#FAF6F5] px-3 py-2 text-sm text-[#2B2B2B]">{message}</p>}

          {signupDone ? (
            <div className="mt-6 rounded-2xl border border-[#E8DADA] bg-[#FAF6F5] p-5 text-center">
              <p className="text-sm font-semibold text-[#2B2B2B]">Check your inbox</p>
              <p className="mt-1 text-sm text-[#6B6B6B]">We sent a verification link to <span className="font-medium text-[#2B2B2B]">{email}</span>. Click it to activate your account.</p>
              <p className="mt-3 text-xs text-[#9B9B9B]">Don&apos;t see it? Check your spam folder, or</p>
              <button
                type="button"
                disabled={resendLoading}
                onClick={onResendConfirmation}
                className="mt-2 rounded-xl border border-[#E8DADA] bg-white px-4 py-2 text-sm font-semibold text-[#D96C6C] transition-colors hover:bg-[#F2E8E8] disabled:opacity-60"
              >
                {resendLoading ? "Sending..." : "Resend confirmation email"}
              </button>
              {resendMessage && <p className="mt-2 text-xs text-[#6B6B6B]">{resendMessage}</p>}
            </div>
          ) : (
            <>
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

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#E8DADA]" />
                <span className="text-xs text-[#9B9B9B]">or</span>
                <div className="h-px flex-1 bg-[#E8DADA]" />
              </div>

              {magicSent ? (
                <p className="rounded-xl border border-[#E8DADA] bg-[#FAF6F5] px-3 py-2.5 text-center text-sm text-[#2B2B2B]">
                  Magic link sent — check your inbox.
                </p>
              ) : (
                <button
                  type="button"
                  disabled={magicLoading}
                  onClick={onMagicLink}
                  className="w-full rounded-xl border border-[#E8DADA] bg-[#FAF6F5] py-3 text-sm font-semibold text-[#2B2B2B] transition-colors hover:bg-[#F2E8E8] disabled:opacity-70"
                >
                  {magicLoading ? "Sending link..." : "Sign up with magic link"}
                </button>
              )}

              <p className="mt-4 text-sm text-[#6B6B6B]">
                Already have an account? <Link href="/login" className="underline">Log in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
