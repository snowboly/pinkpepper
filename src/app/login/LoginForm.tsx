"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { type PublicLocale } from "@/i18n/public";
import { getPublicPageHref, isPublicLocale } from "@/lib/public-routes";
import {
  getLoginFlashErrorMessage,
  getSafeNextPath,
  LoginEmailCodePanel,
} from "@/app/login/login-flow";
import { buildGoogleOAuthOptions, resolveBrowserAuthOrigin } from "@/app/auth/oauth";
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

export function LoginForm() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [nextPath, setNextPath] = useState("/dashboard");
  const [flashError, setFlashError] = useState<string | null>(null);
  const currentLocale = (() => {
    const maybeLocale = pathname.split("/").filter(Boolean)[0];
    return isPublicLocale(maybeLocale ?? "") ? (maybeLocale as PublicLocale) : "en";
  })();
  const signupHref = getPublicPageHref(currentLocale, "/signup");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    const err = params.get("error");

    if (err) {
      setFlashError(err);
    }

    setNextPath(getSafeNextPath(next));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      window.location.href = nextPath;
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);
    setMessage(null);
    setFlashError(null);

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth(
        buildGoogleOAuthOptions({
          origin: resolveBrowserAuthOrigin(),
          next: nextPath,
        }),
      );

      if (oauthError) {
        setError(oauthError.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  function resetEmailCodeState() {
    setCode("");
    setCodeSent(false);
    setMessage(null);
    setError(null);
    setFlashError(null);
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    if (codeSent) {
      resetEmailCodeState();
      setEmail(value);
      return;
    }
    setError(null);
    setMessage(null);
  }

  async function sendEmailCode(isResend = false) {
    if (!email) {
      setError("Enter your email address above first.");
      return;
    }
    if (isResend) {
      setResendLoading(true);
    } else {
      setCodeLoading(true);
    }
    setError(null);
    setMessage(null);
    setFlashError(null);

    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
      });
      if (otpError) {
        setError(otpError.message);
        return;
      }
      setCodeSent(true);
      setCode("");
      setMessage(isResend ? "A new email code has been sent." : "Email code sent. Check your inbox.");
    } finally {
      if (isResend) {
        setResendLoading(false);
      } else {
        setCodeLoading(false);
      }
    }
  }

  async function verifyCode() {
    if (!code.trim()) {
      setError("Enter the email code first.");
      return;
    }

    setVerifyLoading(true);
    setError(null);
    setMessage(null);
    setFlashError(null);

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: "email",
      });

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      window.location.href = nextPath;
    } finally {
      setVerifyLoading(false);
    }
  }

  const flashMessage = getLoginFlashErrorMessage(flashError);

  return (
    <>
      {(flashMessage || error) && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error ?? flashMessage}
        </p>
      )}
      {message && <p className="rounded-xl border border-[#E8DADA] bg-[#FAF6F5] px-3 py-2 text-sm">{message}</p>}

      <button
        type="button"
        disabled={googleLoading}
        onClick={() => {
          void onGoogleSignIn();
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
            onChange={(e) => handleEmailChange(e.target.value)}
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
            placeholder="********"
          />
        </div>
        <button disabled={loading} type="submit" className="w-full rounded-2xl bg-[#E11D48] py-3.5 text-lg font-bold text-white transition-colors hover:bg-[#BE123C] disabled:opacity-70">
          {loading ? "Signing in..." : "Log In"}
        </button>
      </form>

      <p className="mt-4 text-sm text-[#6B6B6B]">
        Prefer a passwordless login? Use the email code option below.
      </p>

      <LoginEmailCodePanel
        email={email}
        code={code}
        codeSent={codeSent}
        codeLoading={codeLoading}
        verifyLoading={verifyLoading}
        resendLoading={resendLoading}
        onCodeChange={(e) => {
          setCode(e.target.value);
          setError(null);
        }}
        onSendCode={() => {
          void sendEmailCode(false);
        }}
        onVerifyCode={() => {
          void verifyCode();
        }}
        onResendCode={() => {
          void sendEmailCode(true);
        }}
        onUseDifferentEmail={() => {
          resetEmailCodeState();
        }}
      />

      <div className="mt-6 flex items-center justify-between text-sm text-[#6B6B6B]">
        <Link href="/forgot-password" className="underline">Forgot password?</Link>
        <Link href={signupHref} className="underline">Create account</Link>
      </div>
    </>
  );
}
