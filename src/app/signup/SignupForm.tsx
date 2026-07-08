"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { type PublicLocale } from "@/i18n/public";
import { getPublicPageHref, isPublicLocale } from "@/lib/public-routes";
import {
  buildBrowserAuthCallbackUrl,
  buildGoogleOAuthOptions,
  resolveBrowserAuthOrigin,
} from "@/app/auth/oauth";
import { validatePassword } from "@/lib/password";
import { createClient } from "@/utils/supabase/client";

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="h-5 w-5">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.72-1.58 2.68-3.92 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.46-.8 5.95-2.18l-2.92-2.26c-.81.54-1.84.86-3.03.86-2.33 0-4.3-1.57-5-3.68H1v2.31A8.99 8.99 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M4 10.74A5.4 5.4 0 0 1 3.72 9c0-.6.1-1.18.28-1.74V4.95H1A8.99 8.99 0 0 0 0 9c0 1.45.35 2.82 1 4.05l3-2.31Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.36l2.58-2.58C13.45.9 11.42 0 9 0A8.99 8.99 0 0 0 1 4.95l3 2.31c.7-2.11 2.67-3.68 5-3.68Z" />
    </svg>
  );
}

export function SignupForm() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const currentLocale = (() => {
    const maybeLocale = pathname.split("/").filter(Boolean)[0];
    return isPublicLocale(maybeLocale ?? "") ? (maybeLocale as PublicLocale) : "en";
  })();
  const termsHref = getPublicPageHref(currentLocale, "/legal/terms");
  const privacyHref = getPublicPageHref(currentLocale, "/legal/privacy");

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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: buildBrowserAuthCallbackUrl({
            origin: resolveBrowserAuthOrigin(),
            next: "/dashboard",
            flow: "signup",
          }),
          data: {
            marketing_email_opt_in: marketingOptIn,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

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
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: buildBrowserAuthCallbackUrl({
            origin: resolveBrowserAuthOrigin(),
            next: "/dashboard",
            flow: "signup",
          }),
        },
      });
      if (resendError) {
        setResendMessage("Could not resend - " + resendError.message);
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
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: buildBrowserAuthCallbackUrl({
            origin: resolveBrowserAuthOrigin(),
            next: "/dashboard",
            flow: "signup",
          }),
          shouldCreateUser: true,
          data: {
            marketing_email_opt_in: marketingOptIn,
          },
        },
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

  async function onGoogleSignUp() {
    setGoogleLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth(
        buildGoogleOAuthOptions({
          origin: resolveBrowserAuthOrigin(),
          next: "/dashboard",
          flow: "signup",
        }),
      );

      if (oauthError) {
        setError(oauthError.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <>
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {message && <p className="rounded-xl border border-[#E8DADA] bg-[#FAF6F5] px-3 py-2 text-sm text-[#2B2B2B]">{message}</p>}

      {signupDone ? (
        <div className="rounded-2xl border border-[#E8DADA] bg-[#FAF6F5] p-5 text-center">
          <p className="text-sm font-semibold text-[#2B2B2B]">Check your inbox</p>
          <p className="mt-1 text-sm text-[#6B6B6B]">We sent a verification link to <span className="font-medium text-[#2B2B2B]">{email}</span>. Click it to activate your account, then finish your profile in the dashboard.</p>
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
          <button
            type="button"
            disabled={googleLoading}
            onClick={() => {
              void onGoogleSignUp();
            }}
            className="mt-2 flex w-full items-center justify-center gap-3 rounded-2xl border border-[#D9DEE8] bg-white px-4 py-4 text-base font-semibold text-[#1E2A3A] shadow-sm transition-colors hover:bg-[#F8FAFC] disabled:opacity-70"
          >
            <GoogleMark />
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#E2E8F0]" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94A3B8]">or</span>
            <div className="h-px flex-1 bg-[#E2E8F0]" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#2B2B2B]">Work email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-[#D9DEE8] bg-white px-4 py-3.5 text-base outline-none ring-[#D96C6C]/15 focus:ring-4"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#2B2B2B]">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-[#D9DEE8] bg-white px-4 py-3.5 text-base outline-none ring-[#D96C6C]/15 focus:ring-4"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#2B2B2B]">Confirm password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-[#D9DEE8] bg-white px-4 py-3.5 text-base outline-none ring-[#D96C6C]/15 focus:ring-4"
                placeholder="Repeat password"
              />
            </div>
            <label className="flex items-start gap-3 rounded-xl border border-[#E8DADA] bg-[#FAF6F5] px-3 py-3 text-sm text-[#2B2B2B]">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border border-[#D0D7DE] text-[#D96C6C] focus:ring-[#D96C6C]"
              />
              <span>I would like to receive occasional product updates, new document templates, and relevant offers from PinkPepper. I can unsubscribe at any time.</span>
            </label>
            <button disabled={loading} type="submit" className="w-full rounded-2xl bg-[#E11D48] py-3.5 text-lg font-bold text-white transition-colors hover:bg-[#BE123C] disabled:opacity-70">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-4">
            {magicSent ? (
              <p className="rounded-2xl border border-[#E8DADA] bg-[#FAF6F5] px-4 py-3 text-center text-sm text-[#2B2B2B]">
                Magic link sent. Check your inbox to activate your account, then complete your profile.
              </p>
            ) : (
              <button
                type="button"
                disabled={magicLoading}
                onClick={onMagicLink}
                className="w-full rounded-2xl border border-[#D9DEE8] bg-[#FAF6F5] py-3.5 text-sm font-semibold text-[#2B2B2B] transition-colors hover:bg-[#F2E8E8] disabled:opacity-70"
              >
                {magicLoading ? "Sending link..." : "Sign up with magic link"}
              </button>
            )}
          </div>

          <p className="mt-5 text-center text-sm leading-relaxed text-[#6B6B6B]">
            By signing up, you agree to our{" "}
            <Link href={termsHref} className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href={privacyHref} className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </>
      )}
    </>
  );
}
