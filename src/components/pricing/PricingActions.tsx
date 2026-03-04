"use client";

import Link from "next/link";
import { useState } from "react";

type Plan = "plus" | "pro";

interface Props {
  isLoggedIn: boolean;
  plan: Plan;
  label: string;
  className: string;
}

export default function PricingActions({ isLoggedIn, plan, label, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <Link href={`/signup?plan=${plan}`} className={className}>
        {label}
      </Link>
    );
  }

  async function startCheckout() {
    setLoading(true);
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
      setLoading(false);
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <button onClick={startCheckout} disabled={loading} className={className}>
        {loading ? "Loading..." : label}
      </button>
    </div>
  );
}
