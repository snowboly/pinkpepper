import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/billing/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { parseStripeSubscription } from "@/lib/billing/tier-mapping";
import { sendBillingEmail } from "@/lib/billing/email";
import {
  buildSubscriptionActivatedEmail,
  buildSubscriptionUpdatedEmail,
  buildSubscriptionCancelledEmail,
  buildPaymentFailedEmail,
} from "@/lib/billing/email-templates";

export const dynamic = "force-dynamic";

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const admin = createAdminClient();

  const customerId =
    typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

  if (!customerId) return;

  const { data: row } = await admin
    .from("subscriptions")
    .select("user_id, tier")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!row?.user_id) return;

  const { data: userData } = await admin.auth.admin.getUserById(row.user_id);
  const email = userData?.user?.email;
  if (!email) return;

  const nextRetryDate = invoice.next_payment_attempt
    ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : undefined;

  try {
    await sendBillingEmail({
      to: email,
      ...buildPaymentFailedEmail({ tier: row.tier ?? "free", nextRetryDate }),
    });
  } catch (err) {
    console.error("Stripe payment-failed email dispatch failed:", err);
  }
}

function getCurrentPeriodEndUnix(subscription: Stripe.Subscription): number | null {
  const item = subscription.items.data[0];
  if (!item) return null;
  return typeof item.current_period_end === "number" ? item.current_period_end : null;
}

async function resolveUserIdForCustomer(customerId: string) {
  const admin = createAdminClient();

  const { data: row, error: findErr } = await admin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (findErr) throw findErr;
  if (row?.user_id) return row.user_id;

  const stripe = getStripe();
  const customer = await stripe.customers.retrieve(customerId);

  if (!customer || customer.deleted) {
    throw new Error("Stripe customer not found for subscription sync.");
  }

  const userId = customer.metadata?.user_id;
  if (!userId) {
    throw new Error("Stripe customer is missing user_id metadata.");
  }

  return userId;
}

export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  eventType: string
) {
  const admin = createAdminClient();

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  // Re-fetch the subscription fresh from Stripe so we write the CURRENT
  // authoritative state regardless of webhook delivery order. Stripe does
  // not guarantee in-order delivery; a stale "updated" event arriving
  // after a newer "deleted" event would otherwise revert the user's tier.
  // Only the event-type metadata (for email dispatch) is taken from the
  // original payload.
  let authoritative: Stripe.Subscription = subscription;
  try {
    const stripe = getStripe();
    authoritative = await stripe.subscriptions.retrieve(subscription.id);
  } catch (e) {
    console.warn(
      `[stripe-webhook] Failed to re-fetch subscription ${subscription.id}; falling back to payload:`,
      e
    );
  }

  const priceId = authoritative.items.data[0]?.price?.id ?? null;

  const snapshot = parseStripeSubscription({
    status: authoritative.status,
    priceId,
    currentPeriodEndUnix: getCurrentPeriodEndUnix(authoritative),
  });
  const userId = await resolveUserIdForCustomer(customerId);

  const { error: upsertErr } = await admin
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: authoritative.id,
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
    let emailContent: { subject: string; html: string };

    if (eventType === "customer.subscription.created" && snapshot.status === "active") {
      emailContent = buildSubscriptionActivatedEmail({ tier: snapshot.tier });
    } else if (
      eventType === "customer.subscription.deleted" ||
      snapshot.status === "canceled"
    ) {
      const periodEndDate = snapshot.currentPeriodEnd
        ? new Date(snapshot.currentPeriodEnd).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : undefined;
      emailContent = buildSubscriptionCancelledEmail({
        tier: snapshot.planTier,
        periodEnd: periodEndDate,
      });
    } else {
      emailContent = buildSubscriptionUpdatedEmail({
        status: snapshot.status,
        tier: snapshot.tier,
      });
    }

    try {
      await sendBillingEmail({ to: email, ...emailContent });
    } catch (err) {
      console.error("Stripe subscription email dispatch failed:", err);
    }
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

/**
 * Claim an event id by inserting into `webhook_events_processed`. Returns
 * true if THIS invocation is the one that should process the event, false
 * if another worker (or an earlier retry) has already processed it.
 *
 * This closes the idempotency gap: Stripe routinely retries events on any
 * non-2xx or on network errors, which without this guard would re-run all
 * handlers (including side-effects like customer emails) and could race
 * with parallel instances.
 */
async function claimStripeEvent(eventId: string, eventType: string): Promise<boolean> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("webhook_events_processed")
    .insert({ event_id: eventId, event_type: eventType });

  if (!error) return true;

  // Unique-violation on the primary key means another worker already
  // claimed this event. Supabase/PostgREST surfaces this as code 23505.
  // Anything else is a real error — re-raise it so Stripe retries.
  const pgError = error as { code?: string };
  if (pgError?.code === "23505") {
    return false;
  }
  throw error;
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

  // Idempotency: if this event has already been processed, return 200
  // immediately so Stripe stops retrying and we do not re-run side-effects
  // (email dispatch, upserts against stale payloads, etc.).
  let claimed: boolean;
  try {
    claimed = await claimStripeEvent(event.id, event.type);
  } catch (err) {
    console.error("Stripe webhook idempotency claim failed:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
  if (!claimed) {
    return NextResponse.json({ received: true, duplicate: true });
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
        await syncSubscriptionFromStripe(event.data.object as Stripe.Subscription, event.type);
        break;
      }
      case "invoice.payment_failed": {
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    // Handler failed after we claimed the event — release the claim so
    // Stripe's retry can re-process it, rather than turning a transient
    // failure into permanent data loss.
    try {
      const admin = createAdminClient();
      await admin.from("webhook_events_processed").delete().eq("event_id", event.id);
    } catch (releaseErr) {
      console.error("Failed to release stripe event claim:", releaseErr);
    }
    console.error("Stripe webhook processing error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
