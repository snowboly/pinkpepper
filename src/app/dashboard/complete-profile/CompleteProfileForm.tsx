"use client";

import { FormEvent, useState } from "react";

type CompleteProfileFormProps = {
  initialFirstName: string;
  initialLastName: string;
  initialCompanyName: string;
  initialMarketingOptIn: boolean;
};

export default function CompleteProfileForm({
  initialFirstName,
  initialLastName,
  initialCompanyName,
  initialMarketingOptIn,
}: CompleteProfileFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [marketingOptIn, setMarketingOptIn] = useState(initialMarketingOptIn);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          company_name: companyName,
          marketing_email_opt_in: marketingOptIn,
          onboarding_completed: true,
        }),
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
        disabled={loading}
        className="w-full rounded-xl bg-[#D96C6C] py-3 font-bold text-white transition-colors hover:bg-[#C95A5A] disabled:opacity-70"
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </form>
  );
}
