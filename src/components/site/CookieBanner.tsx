"use client";

import Link from "next/link";
import { useState } from "react";
import { Analytics } from "@vercel/analytics/next";

type Consent = "accepted" | "essential";

const STORAGE_KEY = "pp-cookie-consent";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function parseConsent(raw: string | null): Consent | null {
  if (raw === "accepted" || raw === "essential") return raw;
  return null;
}

export function readConsentCookie(cookieSource: string): Consent | null {
  const prefix = `${STORAGE_KEY}=`;
  const entry = cookieSource
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  if (!entry) return null;
  return parseConsent(decodeURIComponent(entry.slice(prefix.length)));
}

function readStoredConsent(): Consent | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = parseConsent(localStorage.getItem(STORAGE_KEY));
    if (stored) return stored;
  } catch {}

  return readConsentCookie(document.cookie);
}

export function buildConsentCookie(value: Consent): string {
  return `${STORAGE_KEY}=${encodeURIComponent(value)}; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
}

function persistConsent(value: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {}

  document.cookie = buildConsentCookie(value);
}

export function CookieBanner() {
  const [consent, setConsent] = useState<Consent | null>(readStoredConsent);
  const [visible, setVisible] = useState(() => readStoredConsent() === null);

  function accept() {
    persistConsent("accepted");
    setConsent("accepted");
    setVisible(false);
  }

  function decline() {
    persistConsent("essential");
    setConsent("essential");
    setVisible(false);
  }

  return (
    <>
      {consent === "accepted" && <Analytics />}

      {visible && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Cookie consent"
          className="cookie-banner fixed inset-x-3 bottom-3 z-50 rounded-3xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-[0_12px_36px_rgba(15,23,42,0.14)] md:inset-x-6 md:bottom-6 md:px-6 md:py-4"
        >
          <div className="pp-container flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <p className="max-w-3xl text-sm leading-relaxed text-[#475569]">
              <span className="md:hidden">
                We use essential cookies to run PinkPepper and optional analytics to understand usage.{" "}
              </span>
              <span className="hidden md:inline">
                We use essential cookies to keep PinkPepper running, and optional
                analytics cookies (Vercel Analytics) to understand how you use the
                product - no personal data is collected.{" "}
              </span>
              <Link
                href="/legal/cookies"
                className="font-medium text-[#E11D48] underline underline-offset-2 hover:no-underline"
              >
                Cookie Policy
              </Link>
            </p>
            <div className="grid flex-shrink-0 grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end sm:gap-3">
              <button
                onClick={decline}
                className="rounded-full border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#475569] transition-colors hover:border-[#CBD5E1] hover:text-[#0F172A]"
              >
                Essential only
              </button>
              <button
                onClick={accept}
                className="rounded-full bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C]"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
