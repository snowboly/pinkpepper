"use client";

import { FormEvent, useState } from "react";

type CompleteProfileFormProps = {
  initialFirstName: string;
  initialLastName: string;
  initialCompanyName: string;
  initialMarketingOptIn: boolean;
  initialBusinessType: string;
};

const BUSINESS_TYPE_KEYS = [
  "restaurant_cafe",
  "food_manufacturer",
  "retailer_deli",
  "catering",
  "street_food",
  "wholesaler",
  "consultant",
  "other",
] as const;

const BUSINESS_TYPE_LABELS: Record<(typeof BUSINESS_TYPE_KEYS)[number], string> = {
  restaurant_cafe: "Restaurant or cafe",
  food_manufacturer: "Food manufacturer",
  retailer_deli: "Retailer or deli",
  catering: "Catering",
  street_food: "Street food",
  wholesaler: "Wholesaler",
  consultant: "Consultant",
  other: "Other",
};

export default function CompleteProfileForm({
  initialFirstName,
  initialLastName,
  initialCompanyName,
  initialMarketingOptIn,
  initialBusinessType,
}: CompleteProfileFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [marketingOptIn, setMarketingOptIn] = useState(initialMarketingOptIn);
  const [businessType, setBusinessType] = useState(initialBusinessType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        business_type: businessType,
        onboarding_completed: true,
      };

      if (marketingOptIn !== initialMarketingOptIn) {
        payload.marketing_email_opt_in = marketingOptIn;
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Could not update your profile.");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Could not update your profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div>
        <label className="mb-1 block text-sm font-medium text-[#2B2B2B]">First name</label>
        <input
          type="text"
          required
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          className="w-full rounded-xl border border-[#E8DADA] bg-white px-3 py-2.5 outline-none ring-[#D96C6C]/20 focus:ring-4"
          placeholder="Joao"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[#2B2B2B]">Surname</label>
        <input
          type="text"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          className="w-full rounded-xl border border-[#E8DADA] bg-white px-3 py-2.5 outline-none ring-[#D96C6C]/20 focus:ring-4"
          placeholder="Silva"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[#2B2B2B]">Company name</label>
        <input
          type="text"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          className="w-full rounded-xl border border-[#E8DADA] bg-white px-3 py-2.5 outline-none ring-[#D96C6C]/20 focus:ring-4"
          placeholder="Optional"
        />
      </div>

      <div>
        <p className="mb-2 block text-sm font-medium text-[#2B2B2B]">Business type</p>
        <div className="grid grid-cols-2 gap-2">
          {BUSINESS_TYPE_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setBusinessType(key)}
              className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                businessType === key
                  ? "border-[#D96C6C] bg-[#FEF2F2] text-[#C95A5A]"
                  : "border-[#E8DADA] bg-[#FAF6F5] text-[#2B2B2B] hover:bg-white"
              }`}
            >
              {BUSINESS_TYPE_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-[#E8DADA] bg-[#FAF6F5] px-3 py-3 text-sm text-[#2B2B2B]">
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={(event) => setMarketingOptIn(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border border-[#D0D7DE] text-[#D96C6C] focus:ring-[#D96C6C]"
        />
        <span>Email me about new features, document templates, and occasional offers.</span>
      </label>

      <button
        type="submit"
        disabled={loading || !businessType}
        className="w-full rounded-xl bg-[#D96C6C] py-3 font-bold text-white transition-colors hover:bg-[#C95A5A] disabled:opacity-70"
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </form>
  );
}
