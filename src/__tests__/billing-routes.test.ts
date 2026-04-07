import { beforeEach, describe, expect, it, vi } from "vitest";

const { billingState, createCheckoutSessionMock, createCustomerMock, createPortalSessionMock } = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://pinkpepper.io/";
  process.env.STRIPE_PLUS_PRICE_ID = "price_plus";
  process.env.STRIPE_PRO_PRICE_ID = "price_pro";

  return {
    billingState: {
      user: { id: "user_123", email: "owner@example.com" } as { id: string; email: string } | null,
      subscriptionRow: null as { stripe_customer_id?: string | null } | null,
      upserts: [] as Array<Record<string, unknown>>,
    },
    createCheckoutSessionMock: vi.fn(),
    createCustomerMock: vi.fn(),
    createPortalSessionMock: vi.fn(),
  };
});

vi.mock("@/utils/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: billingState.user } }),
    },
    from: (table: string) => {
      if (table !== "subscriptions") {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: billingState.subscriptionRow, error: null }),
          }),
        }),
        upsert: async (payload: Record<string, unknown>) => {
          billingState.upserts.push(payload);
          return { error: null };
        },
      };
    },
  }),
}));

vi.mock("@/lib/ratelimit", () => ({
  billingLimiter: {},
  checkRateLimit: async () => null,
}));

vi.mock("@/lib/billing/stripe", () => ({
  getStripe: () => ({
    customers: {
      create: createCustomerMock,
    },
    checkout: {
      sessions: {
        create: createCheckoutSessionMock,
      },
    },
    billingPortal: {
      sessions: {
        create: createPortalSessionMock,
      },
    },
  }),
}));

import { POST as checkoutPost } from "@/app/api/billing/checkout/route";
import { POST as portalPost } from "@/app/api/billing/portal/route";

describe("billing route origin validation", () => {
  beforeEach(() => {
    billingState.user = { id: "user_123", email: "owner@example.com" };
    billingState.subscriptionRow = null;
    billingState.upserts = [];
    createCheckoutSessionMock.mockReset();
    createCustomerMock.mockReset();
    createPortalSessionMock.mockReset();
    createCustomerMock.mockResolvedValue({ id: "cus_123" });
    createCheckoutSessionMock.mockResolvedValue({ url: "https://checkout.stripe.test/session_123" });
    createPortalSessionMock.mockResolvedValue({ url: "https://billing.stripe.test/session_123" });
    process.env.NEXT_PUBLIC_SITE_URL = "https://pinkpepper.io/";
    process.env.STRIPE_PLUS_PRICE_ID = "price_plus";
    process.env.STRIPE_PRO_PRICE_ID = "price_pro";
  });

  it("allows checkout with same-origin request", async () => {
    const response = await checkoutPost(
      new Request("https://pinkpepper.io/api/billing/checkout", {
        method: "POST",
        headers: {
          host: "pinkpepper.io",
          origin: "https://pinkpepper.io",
          "content-type": "application/json",
        },
        body: JSON.stringify({ plan: "plus" }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ url: "https://checkout.stripe.test/session_123" });
  });

  it("allows billing-portal access with same-origin request", async () => {
    billingState.subscriptionRow = { stripe_customer_id: "cus_123" };

    const response = await portalPost(
      new Request("https://pinkpepper.io/api/billing/portal", {
        method: "POST",
        headers: {
          host: "pinkpepper.io",
          origin: "https://pinkpepper.io",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ url: "https://billing.stripe.test/session_123" });
  });

  it("allows checkout behind reverse proxy with x-forwarded-host/proto", async () => {
    const response = await checkoutPost(
      new Request("http://localhost:3000/api/billing/checkout", {
        method: "POST",
        headers: {
          host: "localhost:3000",
          "x-forwarded-host": "pinkpepper.io",
          "x-forwarded-proto": "https",
          origin: "https://pinkpepper.io",
          "content-type": "application/json",
        },
        body: JSON.stringify({ plan: "plus" }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ url: "https://checkout.stripe.test/session_123" });
  });

  it("rejects checkout when both Origin and Referer are missing (CSRF fail-closed)", async () => {
    // H2: a state-changing POST that carries neither Origin nor Referer is
    // not a legitimate same-origin browser flow (modern browsers always
    // send at least one on cross-origin POSTs). The billing guard must
    // fail closed so cookie-replay / non-browser CSRF vectors are rejected.
    const response = await checkoutPost(
      new Request("https://pinkpepper.io/api/billing/checkout", {
        method: "POST",
        headers: {
          host: "pinkpepper.io",
          "content-type": "application/json",
        },
        body: JSON.stringify({ plan: "plus" }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("allows checkout when Origin is omitted but Referer is same-origin", async () => {
    const response = await checkoutPost(
      new Request("https://pinkpepper.io/api/billing/checkout", {
        method: "POST",
        headers: {
          host: "pinkpepper.io",
          referer: "https://pinkpepper.io/pricing",
          "content-type": "application/json",
        },
        body: JSON.stringify({ plan: "plus" }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ url: "https://checkout.stripe.test/session_123" });
  });

  it("rejects checkout from a different origin", async () => {
    const response = await checkoutPost(
      new Request("https://pinkpepper.io/api/billing/checkout", {
        method: "POST",
        headers: {
          host: "pinkpepper.io",
          origin: "https://evil.com",
          "content-type": "application/json",
        },
        body: JSON.stringify({ plan: "plus" }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("returns a billing configuration error when a plan env uses a Stripe product id", async () => {
    process.env.STRIPE_PLUS_PRICE_ID = "prod_bad";

    const response = await checkoutPost(
      new Request("https://pinkpepper.io/api/billing/checkout", {
        method: "POST",
        headers: {
          host: "pinkpepper.io",
          origin: "https://pinkpepper.io",
          "content-type": "application/json",
        },
        body: JSON.stringify({ plan: "plus" }),
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Billing is misconfigured. Stripe price IDs must start with `price_`.",
    });
  });

  it("returns structured json when Stripe checkout creation throws", async () => {
    createCheckoutSessionMock.mockRejectedValueOnce(new Error("Stripe API down"));

    const response = await checkoutPost(
      new Request("https://pinkpepper.io/api/billing/checkout", {
        method: "POST",
        headers: {
          host: "pinkpepper.io",
          origin: "https://pinkpepper.io",
          "content-type": "application/json",
        },
        body: JSON.stringify({ plan: "plus" }),
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Unable to start checkout right now. Please try again in a moment.",
    });
  });
});
