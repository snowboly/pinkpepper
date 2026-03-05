"use client";

import { useState } from "react";
import type { SubscriptionTier } from "@/lib/tier";

type UpgradeModalProps = {
  trigger: "message_limit" | "image_limit" | "export" | "review";
  currentTier: SubscriptionTier;
  onClose: () => void;
};

const COPY: Record<UpgradeModalProps["trigger"], { heading: string; body: string }> = {
  message_limit: {
    heading: "You've reached your daily message limit",
    body: "Upgrade to continue chatting. Plus gives you 4× more messages per day — Pro gives you 40×.",
  },
  image_limit: {
    heading: "Unlock photo analysis",
    body: "Upload photos of kitchens, labels, or food products and get instant food safety feedback.",
  },
  export: {
    heading: "Export your compliance documents",
    body: "Download HACCP plans, SOPs, and audit prep as PDF or Word — ready to use or share.",
  },
  review: {
    heading: "Get expert review",
    body: "Have a qualified food safety consultant review your documents within 72 hours.",
  },
};

const PLANS = [
  {
    tier: "plus" as SubscriptionTier,
    name: "Plus",
    price: "€19/mo",
    highlights: ["100 messages/day", "3 image uploads/day", "PDF export", "1 human review/month"],
    cta: "Upgrade to Plus",
    colour: "border-[#D97706] bg-[#FFFBEB]",
    btnColour: "bg-[#D97706] hover:bg-[#B45309]",
  },
  {
    tier: "pro" as SubscriptionTier,
    name: "Pro",
    price: "€49/mo",
    highlights: ["1,000 messages/day", "20 image uploads/day", "PDF + Word export", "3 review credits/month"],
    cta: "Upgrade to Pro",
    colour: "border-[#059669] bg-[#ECFDF5]",
    btnColour: "bg-[#059669] hover:bg-[#047857]",
  },
];

export default function UpgradeModal({ trigger, currentTier, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState<SubscriptionTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copy = COPY[trigger];
  const visiblePlans = currentTier === "plus"
    ? PLANS.filter((p) => p.tier === "pro")
    : PLANS;

  async function checkout(plan: SubscriptionTier) {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Unable to start checkout.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E2E8F0] px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A]">{copy.heading}</h2>
            <p className="mt-1 text-sm text-[#64748B]">{copy.body}</p>
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
          {visiblePlans.map((plan) => (
            <div key={plan.tier} className={`rounded-xl border p-4 ${plan.colour}`}>
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-sm font-bold text-[#0F172A]">{plan.name}</span>
                <span className="text-xs font-semibold text-[#64748B]">{plan.price}</span>
              </div>
              <ul className="space-y-1 mb-4">
                {plan.highlights.map((h) => (
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
                {loading === plan.tier ? "Redirecting..." : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {error && <p className="px-6 pb-4 text-xs text-[#E11D48]">{error}</p>}

        <div className="border-t border-[#E2E8F0] px-6 py-3 flex items-center justify-between">
          <a href="/pricing" className="text-xs text-[#64748B] hover:text-[#0F172A] underline">
            Compare all plans
          </a>
          <button onClick={onClose} className="text-xs text-[#94A3B8] hover:text-[#64748B]">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
