"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { track } from "@vercel/analytics";
import type { SubscriptionTier } from "@/lib/tier";

type UpgradeModalProps = {
  trigger: "message_limit" | "expert_limit" | "image_limit" | "export" | "review" | "audit_mode" | "template_download";
  currentTier: SubscriptionTier;
  onClose: () => void;
};

const PLAN_DEFS = [
  {
    tier: "plus" as SubscriptionTier,
    key: "plus",
    colour: "border-[#D97706] bg-[#FFFBEB]",
    btnColour: "bg-[#D97706] hover:bg-[#B45309]",
  },
  {
    tier: "pro" as SubscriptionTier,
    key: "pro",
    colour: "border-[#059669] bg-[#ECFDF5]",
    btnColour: "bg-[#059669] hover:bg-[#047857]",
  },
];

async function readCheckoutResponse(res: Response): Promise<{ url?: string; error?: string }> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as { url?: string; error?: string };
  }

  const text = await res.text();
  return { error: text || "Unable to start checkout." };
}

function openCheckout(url: string) {
  const opened = window.open(url, "_blank");
  if (opened) {
    opened.opener = null;
    return;
  }

  window.location.href = url;
}

export default function UpgradeModal({ trigger, currentTier, onClose }: UpgradeModalProps) {
  const t = useTranslations("upgrade");
  const [loading, setLoading] = useState<SubscriptionTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const checkoutInFlight = useRef(false);
  const heading = trigger === "template_download"
    ? "Download DOCX templates"
    : t(`triggers.${trigger}.heading`);
  const body = trigger === "template_download"
    ? "Download ready-made HACCP, allergen, SOP, and audit templates as Word documents with Plus or Pro."
    : t(`triggers.${trigger}.body`);

  const visiblePlans = currentTier === "plus"
    ? PLAN_DEFS.filter((p) => p.tier === "pro")
    : PLAN_DEFS;

  useEffect(() => {
    track("upgrade_modal_viewed", { trigger, currentTier });
  }, [currentTier, trigger]);

  async function checkout(plan: SubscriptionTier) {
    if (checkoutInFlight.current) return;
    checkoutInFlight.current = true;
    track("checkout_started", { plan, source: "upgrade_modal", trigger, currentTier });
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await readCheckoutResponse(res);
      if (!res.ok || !data.url) {
        setError(data.error ?? t("unableToCheckout"));
        return;
      }
      openCheckout(data.url);
    } catch {
      setError(t("networkError"));
    } finally {
      checkoutInFlight.current = false;
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E2E8F0] px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A]">{heading}</h2>
            <p className="mt-1 text-sm text-[#64748B]">{body}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 text-[#94A3B8] hover:text-[#64748B] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Plan cards */}
        <div className={`px-6 py-5 ${visiblePlans.length > 1 ? "grid grid-cols-2 gap-3" : ""}`}>
          {visiblePlans.map((plan) => {
            const highlights = t.raw(`plans.${plan.key}.highlights`) as string[];
            return (
              <div key={plan.tier} className={`rounded-xl border p-4 ${plan.colour}`}>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-sm font-bold text-[#0F172A]">{t(`plans.${plan.key}.name`)}</span>
                  <span className="text-xs font-semibold text-[#64748B]">{t(`plans.${plan.key}.price`)}</span>
                </div>
                <ul className="space-y-1 mb-4">
                  {highlights.map((h: string) => (
                    <li key={h} className="flex items-center gap-1.5 text-xs text-[#334155]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#059669] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => void checkout(plan.tier)}
                  disabled={loading !== null}
                  className={`w-full rounded-xl py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50 ${plan.btnColour}`}
                >
                  {loading === plan.tier ? t("redirecting") : t(`plans.${plan.key}.cta`)}
                </button>
              </div>
            );
          })}
        </div>

        {error && <p className="px-6 pb-4 text-xs text-[#E11D48]">{error}</p>}

        <div className="border-t border-[#E2E8F0] px-6 py-3 flex items-center justify-between">
          <Link href="/pricing" className="text-xs text-[#64748B] hover:text-[#0F172A] underline">
            {t("compareAllPlans")}
          </Link>
          <button onClick={onClose} className="text-xs text-[#94A3B8] hover:text-[#64748B]">
            {t("maybeLater")}
          </button>
        </div>
      </div>
    </div>
  );
}
