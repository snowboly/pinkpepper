"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";

type Consent = "accepted" | "essential";

const STORAGE_KEY = "pp-cookie-consent";

export function CookieBanner() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Consent | null;
    if (stored === "accepted" || stored === "essential") {
      setConsent(stored);
    } else {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "essential");
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
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E2E8F0] bg-white px-4 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] md:px-6"
        >
          <div className="pp-container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-[#475569]">
              We use essential cookies to keep PinkPepper running, and optional
              analytics cookies (Vercel Analytics) to understand how you use the
              product — no personal data is collected.{" "}
              <a
                href="/legal/cookies"
                className="font-medium text-[#E11D48] underline underline-offset-2 hover:no-underline"
              >
                Cookie Policy
              </a>
            </p>
            <div className="flex flex-shrink-0 items-center gap-3">
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
