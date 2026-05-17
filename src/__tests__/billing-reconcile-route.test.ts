import { beforeEach, describe, expect, it, vi } from "vitest";
const {
  billingState,
  retrieveCheckoutSessionMock,
  stripeRetrieveCustomerMock,
  stripeRetrieveSubscriptionMock,
  getUserByIdMock,
  sendBillingEmailMock,
} = vi.hoisted(() => ({
  billingState: {
    user: { id: "user_123", email: "owner@example.com" } as { id: string; email: string } | null,
    subscriptionRow: null as Record<string, unknown> | null,
    profileUpdates: [] as Array<Record<string, unknown>>,
    subscriptionUpserts: [] as Array<Record<string, unknown>>,
  },
  retrieveCheckoutSessionMock: vi.fn(),
  stripeRetrieveCustomerMock: vi.fn(),
  stripeRetrieveSubscriptionMock: vi.fn(),
  getUserByIdMock: vi.fn(),
  sendBillingEmailMock: vi.fn(),
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: billingState.user } }),
    },
  }),
}));

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "subscriptions") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: billingState.subscriptionRow, error: null }),
            }),
          }),
          upsert: async (payload: Record<string, unknown>) => {
            billingState.subscriptionUpserts.push(payload);
            return { error: null };
          },
        };
      }

      if (table === "profiles") {
        return {
          update: (payload: Record<string, unknown>) => ({
            eq: async () => {
              billingState.profileUpdates.push(payload);
              return { error: null };
            },
          }),
        };
      }

      if (table === "webhook_events_processed") {
        return {
          insert: async () => ({ error: null }),
          delete: () => ({ eq: async () => ({ error: null }) }),
        };
      }

      throw new Error(`Unexpected admin table ${table}`);
    },
    auth: {
      admin: {
        getUserById: getUserByIdMock,
      },
    },
  }),
}));

vi.mock("@/lib/ratelimit", () => ({
  billingLimiter: {},
  checkRateLimit: async () => null,
}));

vi.mock("@/lib/billing/stripe", () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        retrieve: retrieveCheckoutSessionMock,
      },
    },
    customers: {
      retrieve: stripeRetrieveCustomerMock,
    },
    subscriptions: {
      retrieve: stripeRetrieveSubscriptionMock,
    },
  }),
}));

vi.mock("@/lib/billing/email", () => ({
  sendBillingEmail: sendBillingEmailMock,
}));

import { POST as reconcilePost } from "@/app/api/billing/reconcile/route";

describe("billing reconcile route", () => {
  beforeEach(() => {
    billingState.user = { id: "user_123", email: "owner@example.com" };
    billingState.subscriptionRow = null;
    billingState.profileUpdates = [];
    billingState.subscriptionUpserts = [];
    retrieveCheckoutSessionMock.mockReset();
    stripeRetrieveCustomerMock.mockReset();
    stripeRetrieveSubscriptionMock.mockReset();
    getUserByIdMock.mockReset();
    sendBillingEmailMock.mockReset();
    process.env.STRIPE_PLUS_PRICE_ID = "price_plus";
    process.env.STRIPE_PRO_PRICE_ID = "price_pro";
    getUserByIdMock.mockResolvedValue({ data: { user: { email: "owner@example.com" } } });
  });

  it("reconciles a completed checkout session into an active plus subscription", async () => {
    billingState.subscriptionRow = { user_id: "user_123" };
    stripeRetrieveSubscriptionMock.mockResolvedValue({
      id: "sub_123",
      customer: "cus_123",
      status: "active",
      items: {
        data: [
          {
            price: { id: "price_plus" },
            current_period_end: 1_710_000_000,
          },
        ],
      },
    });
    retrieveCheckoutSessionMock.mockResolvedValue({
      id: "cs_test_123",
      mode: "subscription",
      metadata: { user_id: "user_123" },
      customer: "cus_123",
      subscription: {
        id: "sub_123",
        customer: "cus_123",
        status: "active",
        items: {
          data: [
            {
              price: { id: "price_plus" },
              current_period_end: 1_710_000_000,
            },
          ],
        },
      },
    });

    const response = await reconcilePost(
      new Request("https://pinkpepper.io/api/billing/reconcile", {
        method: "POST",
        headers: {
          host: "pinkpepper.io",
          origin: "https://pinkpepper.io",
          "content-type": "application/json",
        },
        body: JSON.stringify({ sessionId: "cs_test_123" }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, tier: "plus", status: "active" });
    expect(billingState.subscriptionUpserts[0]).toMatchObject({
      user_id: "user_123",
      stripe_customer_id: "cus_123",
      stripe_subscription_id: "sub_123",
      tier: "plus",
      status: "active",
    });
    expect(billingState.profileUpdates[0]).toMatchObject({ tier: "plus" });
    expect(sendBillingEmailMock).not.toHaveBeenCalled();
  });

  it("rejects reconciling another user's checkout session", async () => {
    stripeRetrieveSubscriptionMock.mockResolvedValue({
      id: "sub_123",
      customer: "cus_123",
      status: "active",
      items: { data: [{ price: { id: "price_plus" }, current_period_end: 1_710_000_000 }] },
    });
    retrieveCheckoutSessionMock.mockResolvedValue({
      id: "cs_test_123",
      mode: "subscription",
      metadata: { user_id: "someone_else" },
      customer: "cus_123",
      subscription: {
        id: "sub_123",
        customer: "cus_123",
        status: "active",
        items: { data: [{ price: { id: "price_plus" }, current_period_end: 1_710_000_000 }] },
      },
    });

    const response = await reconcilePost(
      new Request("https://pinkpepper.io/api/billing/reconcile", {
        method: "POST",
        headers: {
          host: "pinkpepper.io",
          origin: "https://pinkpepper.io",
          "content-type": "application/json",
        },
        body: JSON.stringify({ sessionId: "cs_test_123" }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
  });
});
