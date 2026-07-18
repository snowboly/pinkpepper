"use client";

import Link from "next/link";
import { useState } from "react";

export function LegalAcceptanceForm({ returnTo = "/dashboard", locale = "en" }: { returnTo?: string; locale?: string }) {
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function submit() {
    setLoading(true); setError(null);
    const res = await fetch("/api/legal/acceptance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accepted, locale, returnTo }) });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Unable to record acceptance."); return; }
    window.location.href = data.returnTo ?? "/dashboard";
  }
  return <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6"><label className="flex gap-3 text-sm text-[#334155]"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /> <span>I agree to the <Link className="text-[#E11D48] underline" href="/legal/terms">Terms</Link> and acknowledge the <Link className="text-[#E11D48] underline" href="/legal/privacy">Privacy Policy</Link> and <Link className="text-[#E11D48] underline" href="/legal/refund">Refund Policy</Link>.</span></label>{error ? <p className="mt-3 text-sm text-[#E11D48]">{error}</p> : null}<button type="button" disabled={!accepted || loading} onClick={() => void submit()} className="mt-5 rounded-full bg-[#E11D48] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Saving..." : "Accept and continue"}</button></div>;
}
