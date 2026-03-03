import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/billing/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { parseStripeSubscription } from "@/lib/billing/tier-mapping";
import { sendBillingEmail } from "@/lib/billing/email";

export const dynamic = "force-dynamic";

function getCurrentPeriodEndUnix(subscription: Stripe.Subscription): number | null {
  const maybeValue = (subscription as unknown as { current_period_end?: number }).current_period_end;
  return typeof maybeValue === "number" ? maybeValue : null;
}

async function syncSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const admin = createAdminClient();
  type SubscriptionUpsert = {
    user_id: string;
    stripe_customer_id: string;
    stripe_subscription_id: string;
    stripe_price_id: string | null;
    status: string;
    tier: string;
    current_period_end: string | null;
  };

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  const priceId = subscription.items.data[0]?.price?.id ?? null;

  const snapshot = parseStripeSubscription({
    status: subscription.status,
    priceId,
    currentPeriodEndUnix: getCurrentPeriodEndUnix(subscription),
  });

  const result = await admin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  const row = result.data as { user_id: string } | null;
  const findErr = result.error;

  if (findErr || !row?.user_id) {
    throw new Error("Subscription row not found for stripe customer.");
  }

  const userId = row.user_id;

  const subscriptionsTable = admin.from("subscriptions") as unknown as {
    upsert: (
      values: SubscriptionUpsert,
      options?: { onConflict?: string }
    ) => Promise<{ error: Error | null }>;
  };

  const { error: upsertErr } = await subscriptionsTable.upsert(
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

  const profilesTable = admin.from("profiles") as unknown as {
    update: (values: { tier: string }) => {
      eq: (column: string, value: string) => Promise<{ error: Error | null }>;
    };
  };

  const { error: profileErr } = await profilesTable.update({ tier: snapshot.tier }).eq("id", userId);

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
  type CheckoutUpsert = {
    user_id: string;
    stripe_customer_id: string;
    status: "pending";
  };

  const userId = session.metadata?.user_id;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

  if (!userId || !customerId) return;

  const subscriptionsTable = admin.from("subscriptions") as unknown as {
    upsert: (
      values: CheckoutUpsert,
      options?: { onConflict?: string }
    ) => Promise<{ error: Error | null }>;
  };

  await subscriptionsTable.upsert(
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
    const message = err instanceof Error ? err.message : "Webhook processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
