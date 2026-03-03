import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getStripe } from "@/lib/billing/stripe";

export const dynamic = "force-dynamic";

const PLAN_TO_PRICE_ENV: Record<string, string | undefined> = {
  plus: process.env.STRIPE_PLUS_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
};

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { plan?: "plus" | "pro" };
  const plan = body.plan;
  if (!plan || !PLAN_TO_PRICE_ENV[plan]) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const priceId = PLAN_TO_PRICE_ENV[plan]!;
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const stripe = getStripe();

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

    await supabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        stripe_customer_id: customerId,
      },
      { onConflict: "user_id" }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?billing=success`,
    cancel_url: `${appUrl}/pricing?billing=cancelled`,
    allow_promotion_codes: true,
    metadata: {
      user_id: user.id,
      plan,
    },
  });

  return NextResponse.json({ url: session.url });
}
