"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  getLoginFlashErrorMessage,
  getSafeNextPath,
  LoginEmailCodePanel,
} from "./login-flow";

export default function LoginPage() {
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
  const [nextPath, setNextPath] = useState("/dashboard");
  const [flashError, setFlashError] = useState<string | null>(null);

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
    <main className="relative overflow-hidden py-16 md:py-24">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 right-0 top-0 m-auto h-[300px] w-[300px] rounded-full bg-[#F2A7A7]/30 blur-[100px]" />
      </div>

      <div className="pp-container">
        <div className="mx-auto max-w-md rounded-[2rem] border border-[#E8DADA] bg-white p-7 shadow-xl md:p-8">
          <p className="inline-flex rounded-full bg-[#FCEEEE] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#B85C5C]">
            Account Access
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-[#2B2B2B]">Log In</h1>
          <p className="mt-2 text-sm text-[#6B6B6B]">Access your PinkPepper dashboard.</p>

          {(flashMessage || error) && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error ?? flashMessage}
            </p>
          )}
          {message && <p className="mt-4 rounded-xl border border-[#E8DADA] bg-[#FAF6F5] px-3 py-2 text-sm">{message}</p>}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#2B2B2B]">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
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
                placeholder="********"
              />
            </div>
            <button disabled={loading} type="submit" className="w-full rounded-xl bg-[#D96C6C] py-3 font-bold text-white transition-colors hover:bg-[#C95A5A] disabled:opacity-70">
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#E8DADA]" />
            <span className="text-xs text-[#9B9B9B]">or</span>
            <div className="h-px flex-1 bg-[#E8DADA]" />
          </div>

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

          <div className="mt-4 flex items-center justify-between text-sm text-[#6B6B6B]">
            <Link href="/forgot-password" className="underline">Forgot password?</Link>
            <Link href="/signup" className="underline">Create account</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
