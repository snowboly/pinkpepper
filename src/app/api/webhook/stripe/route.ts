import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/billing/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { parseStripeSubscription } from "@/lib/billing/tier-mapping";
import { sendBillingEmail } from "@/lib/billing/email";

export const dynamic = "force-dynamic";

function getCurrentPeriodEndUnix(subscription: Stripe.Subscription): number | null {
  const item = subscription.items.data[0];
  if (!item) return null;
  return typeof item.current_period_end === "number" ? item.current_period_end : null;
}

async function syncSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const admin = createAdminClient();

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  const priceId = subscription.items.data[0]?.price?.id ?? null;

  const snapshot = parseStripeSubscription({
    status: subscription.status,
    priceId,
    currentPeriodEndUnix: getCurrentPeriodEndUnix(subscription),
  });

  const { data: row, error: findErr } = await admin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (findErr || !row?.user_id) {
    throw new Error("Subscription row not found for stripe customer.");
  }

  const userId = row.user_id;

  const { error: upsertErr } = await admin
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: snapshot.stripePriceId,
        status: snapshot.status,
        tier: snapshot.tier,
        current_period_end: snapshot.currentPeriodEnd,
      },
      { onConflict: "user_id" }
    );

  if (upsertErr) throw upsertErr;

  const { error: profileErr } = await admin
    .from("profiles")
    .update({ tier: snapshot.tier })
    .eq("id", userId);

  if (profileErr) throw profileErr;

  const { data: userData } = await admin.auth.admin.getUserById(userId);
  const email = userData?.user?.email;

  if (email) {
    await sendBillingEmail({
      to: email,
      subject: "Your PinkPepper subscription was updated",
      html: `<p>Your subscription status is now <strong>${snapshot.status}</strong> with tier <strong>${snapshot.tier.toUpperCase()}</strong>.</p>`,
    });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const admin = createAdminClient();

  const userId = session.metadata?.user_id;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

  if (!userId || !customerId) return;

  await admin
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        status: "pending",
      },
      { onConflict: "user_id" }
    );
}

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing webhook configuration" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscriptionFromStripe(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook processing error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
