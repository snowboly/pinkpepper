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
          eq: (_column: string, _value: string) => ({
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

  it("allows checkout from the same origin when NEXT_PUBLIC_SITE_URL has a trailing slash", async () => {
    const response = await checkoutPost(
      new Request("https://pinkpepper.io/api/billing/checkout", {
        method: "POST",
        headers: {
          origin: "https://pinkpepper.io",
          "content-type": "application/json",
        },
        body: JSON.stringify({ plan: "plus" }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ url: "https://checkout.stripe.test/session_123" });
  });

  it("allows billing-portal access from the same origin when NEXT_PUBLIC_SITE_URL has a trailing slash", async () => {
    billingState.subscriptionRow = { stripe_customer_id: "cus_123" };

    const response = await portalPost(
      new Request("https://pinkpepper.io/api/billing/portal", {
        method: "POST",
        headers: {
          origin: "https://pinkpepper.io",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ url: "https://billing.stripe.test/session_123" });
  });
});
