import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { getStripe } from "@/lib/billing/stripe";
import { isAllowedBillingRequest } from "@/lib/billing/request-origin";
import { billingLimiter, checkRateLimit } from "@/lib/ratelimit";
import { parseStripeSubscription } from "@/lib/billing/tier-mapping";
import { syncSubscriptionFromStripe } from "@/app/api/webhook/stripe/route";

export const dynamic = "force-dynamic";

function resolveSessionUserId(session: Stripe.Checkout.Session): string | null {
  const metadataUserId = session.metadata?.user_id;
  if (metadataUserId) return metadataUserId;

  const customer =
    typeof session.customer === "string" || !session.customer ? null : session.customer;

  if (!customer || "deleted" in customer) {
    return null;
  }

  return customer.metadata?.user_id ?? null;
}

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

    const body = (await request.json()) as { sessionId?: string };
    const sessionId = body.sessionId?.trim();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session id." }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    const sessionUserId = resolveSessionUserId(session);
    if (sessionUserId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      !session.subscription ||
      typeof session.subscription === "string" ||
      session.mode !== "subscription"
    ) {
      return NextResponse.json({ error: "Checkout session is not ready to reconcile." }, { status: 409 });
    }

    await syncSubscriptionFromStripe(session.subscription, "checkout.session.completed");

    const snapshot = parseStripeSubscription({
      status: session.subscription.status,
      priceId: session.subscription.items.data[0]?.price?.id ?? null,
      currentPeriodEndUnix:
        typeof session.subscription.items.data[0]?.current_period_end === "number"
          ? session.subscription.items.data[0].current_period_end
          : null,
    });

    return NextResponse.json({
      ok: true,
      tier: snapshot.tier,
      status: snapshot.status,
    });
  } catch (error) {
    console.error("Billing reconcile error:", error);
    return NextResponse.json(
      { error: "Unable to reconcile billing right now. Please try again in a moment." },
      { status: 500 }
    );
  }
}
