"use client";

import { useState } from "react";

type Plan = "plus" | "pro";

export default function PricingActions() {
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(plan: Plan) {
    setLoadingPlan(plan);
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
      setLoadingPlan(null);
    }
  }

  return (
    <div className="mt-6 space-y-3">
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        <button onClick={() => startCheckout("plus")} disabled={loadingPlan !== null} className="pp-btn-primary">
          {loadingPlan === "plus" ? "Loading..." : "Choose Plus"}
        </button>
        <button onClick={() => startCheckout("pro")} disabled={loadingPlan !== null} className="pp-btn-secondary">
          {loadingPlan === "pro" ? "Loading..." : "Choose Pro"}
        </button>
      </div>
    </div>
  );
}
