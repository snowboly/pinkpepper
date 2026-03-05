"use client";

import { useState } from "react";
import Image from "next/image";

const BUSINESS_TYPES = [
  { value: "restaurant_cafe", label: "Restaurant / Café" },
  { value: "food_manufacturer", label: "Food Manufacturer" },
  { value: "retailer_deli", label: "Retailer / Deli" },
  { value: "catering", label: "Catering Company" },
  { value: "street_food", label: "Street Food / Market" },
  { value: "wholesaler", label: "Wholesaler / Distributor" },
  { value: "consultant", label: "Food Safety Consultant" },
  { value: "other", label: "Other" },
];

type OnboardingModalProps = {
  onComplete: (businessType: string) => void;
};

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || loading) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_type: selected, onboarding_completed: true }),
      });
      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }
      onComplete(selected);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#E2E8F0] px-6 py-5 text-center">
          <Image src="/logo/LogoV3.png" alt="PinkPepper" width={120} height={34} className="h-8 w-auto mx-auto mb-3" />
          <h2 className="text-base font-semibold text-[#0F172A]">Welcome to PinkPepper</h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Tell us about your business so we can tailor the experience.
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          <p className="text-xs font-medium text-[#334155] mb-3">What type of food business do you run?</p>
          <div className="grid grid-cols-2 gap-2">
            {BUSINESS_TYPES.map((bt) => (
              <button
                key={bt.value}
                type="button"
                onClick={() => setSelected(bt.value)}
                className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                  selected === bt.value
                    ? "border-[#E11D48] bg-[#FEF2F2] text-[#E11D48]"
                    : "border-[#E2E8F0] bg-[#F8F9FB] text-[#334155] hover:border-[#CBD5E1] hover:bg-white"
                }`}
              >
                {bt.label}
              </button>
            ))}
          </div>

          {error && <p className="mt-3 text-xs text-[#E11D48]">{error}</p>}

          <button
            type="submit"
            disabled={!selected || loading}
            className="mt-4 w-full rounded-xl bg-[#E11D48] py-2.5 text-sm font-semibold text-white hover:bg-[#BE123C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving..." : "Get started"}
          </button>

          <p className="mt-3 text-center text-[10px] text-[#94A3B8]">
            This helps personalise your compliance guidance. You can change it later in settings.
          </p>
        </form>
      </div>
    </div>
  );
}
