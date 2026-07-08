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

export function SignupForm() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
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
  const loginHref = getPublicPageHref(currentLocale, "/login");

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
      const trimmedFirstName = firstName.trim();
      if (!trimmedFirstName) {
        setError("First name is required.");
        return;
      }
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
            first_name: trimmedFirstName,
            last_name: lastName.trim() || null,
            company_name: companyName.trim() || null,
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
        setResendMessage("Could not resend â€” " + resendError.message);
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
    const trimmedFirstName = firstName.trim();
    if (!trimmedFirstName) {
      setError("First name is required.");
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
            first_name: trimmedFirstName,
            last_name: lastName.trim() || null,
            company_name: companyName.trim() || null,
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
          <button
            type="button"
            disabled={googleLoading}
            onClick={() => {
              void onGoogleSignUp();
            }}
            className="mt-6 w-full rounded-xl border border-[#E8DADA] bg-white py-3 text-sm font-semibold text-[#2B2B2B] transition-colors hover:bg-[#FAF6F5] disabled:opacity-70"
          >
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#2B2B2B]">First name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-[#E8DADA] bg-white px-3 py-2.5 outline-none ring-[#D96C6C]/20 focus:ring-4"
                placeholder="Joao"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#2B2B2B]">Surname</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-[#E8DADA] bg-white px-3 py-2.5 outline-none ring-[#D96C6C]/20 focus:ring-4"
                placeholder="Silva"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#2B2B2B]">Company name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl border border-[#E8DADA] bg-white px-3 py-2.5 outline-none ring-[#D96C6C]/20 focus:ring-4"
                placeholder="Optional"
              />
            </div>
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
            <label className="flex items-start gap-3 rounded-xl border border-[#E8DADA] bg-[#FAF6F5] px-3 py-3 text-sm text-[#2B2B2B]">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border border-[#D0D7DE] text-[#D96C6C] focus:ring-[#D96C6C]"
              />
              <span>I would like to receive occasional product updates, new document templates, and relevant offers from PinkPepper. I can unsubscribe at any time.</span>
            </label>
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
              Magic link sent â€” check your inbox.
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
            Already have an account? <Link href={loginHref} className="underline">Log in</Link>
          </p>
        </>
      )}
    </>
  );
}
