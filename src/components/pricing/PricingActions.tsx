"use client";

import Link from "next/link";
import { useState } from "react";
import { track } from "@vercel/analytics";

type Plan = "plus" | "pro";

interface Props {
  isLoggedIn: boolean;
  plan: Plan;
  label: string;
  className: string;
}

async function readCheckoutResponse(res: Response): Promise<{ url?: string; error?: string }> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as { url?: string; error?: string };
  }

  const text = await res.text();
  return { error: text || "Unable to start checkout." };
}

export default function PricingActions({ isLoggedIn, plan, label, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <Link
        href={`/signup?plan=${plan}`}
        className={className}
        onClick={() => track("pricing_signup_click", { plan, source: "pricing_page" })}
      >
        {label}
      </Link>
    );
  }

  async function startCheckout() {
    track("checkout_started", { plan, source: "pricing_page" });
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await readCheckoutResponse(res);
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
