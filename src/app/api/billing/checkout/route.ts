import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getStripe } from "@/lib/billing/stripe";
import { isAllowedBillingRequest, getTrustedSiteOrigin } from "@/lib/billing/request-origin";
import { billingLimiter, checkRateLimit } from "@/lib/ratelimit";
import { getStripePriceIdForPlan, hasStripePriceConfigError, isBillingInterval, isBillingTier } from "@/lib/billing/subscription-price-config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!isAllowedBillingRequest(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const rateLimitRes = await checkRateLimit(billingLimiter, ip);
    if (rateLimitRes) return rateLimitRes;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { plan?: unknown; interval?: unknown; tier?: unknown };
    const plan = body.plan ?? body.tier;
    const interval = body.interval ?? "monthly";

    if (!isBillingTier(plan) || !isBillingInterval(interval)) {
      return NextResponse.json({ error: "Invalid plan or billing interval." }, { status: 400 });
    }

    if (hasStripePriceConfigError(plan, interval)) {
      return NextResponse.json(
        { error: "Billing is misconfigured. Stripe price IDs must start with `price_`." },
        { status: 500 }
      );
    }

    const priceId = getStripePriceIdForPlan(plan, interval);
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan or billing interval." }, { status: 400 });
    }
    // Stripe callback URLs must not be attacker-spoofable via a manipulated
    // Host header — Stripe blindly redirects users there on completion.
    const appUrl = getTrustedSiteOrigin(request);
    if (!appUrl) {
      return NextResponse.json(
        { error: "Site URL is not configured." },
        { status: 500 }
      );
    }
    const stripe = getStripe();
    const admin = createAdminClient();

    const { data: subRow } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = subRow?.stripe_customer_id ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;

      const { error: breadcrumbErr } = await admin.from("subscriptions").upsert(
        {
          user_id: user.id,
          stripe_customer_id: customerId,
        },
        { onConflict: "user_id" }
      );

      if (breadcrumbErr) {
        throw breadcrumbErr;
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?billing=cancelled`,
      allow_promotion_codes: true,
      metadata: {
        user_id: user.id,
        plan,
        tier: plan,
        interval,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Billing checkout error:", error);
    return NextResponse.json(
      { error: "Unable to start checkout right now. Please try again in a moment." },
      { status: 500 }
    );
  }
}
