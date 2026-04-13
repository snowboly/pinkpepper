"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { createClient } from "@/utils/supabase/client";

type Plan = "plus" | "pro";

interface Props {
  isLoggedIn?: boolean;
  plan: Plan;
  label: string;
  className: string;
  source?: "pricing_page" | "homepage";
}

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

function redirectToSignup(plan: Plan) {
  window.location.href = `/signup?plan=${plan}`;
}

export default function PricingActions({
  isLoggedIn,
  plan,
  label,
  className,
  source = "pricing_page",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkoutInFlight = useRef(false);

  if (isLoggedIn === false) {
    return (
      <Link
        href={`/signup?plan=${plan}`}
        className={className}
        onClick={() => track("pricing_signup_click", { plan, source })}
      >
        {label}
      </Link>
    );
  }

  async function startCheckout() {
    if (checkoutInFlight.current) return;
    checkoutInFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      if (isLoggedIn !== true) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          track("pricing_signup_click", { plan, source });
          redirectToSignup(plan);
          return;
        }
      }

      track("checkout_started", { plan, source });
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

      openCheckout(data.url);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      checkoutInFlight.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className={`${className} w-full flex items-center justify-center appearance-none`}
      >
        {loading ? "Loading..." : label}
      </button>
    </div>
  );
}
