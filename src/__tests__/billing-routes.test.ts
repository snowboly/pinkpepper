import { beforeEach, describe, expect, it, vi } from "vitest";

const { billingState, createCheckoutSessionMock, createCustomerMock, createPortalSessionMock } = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://pinkpepper.io/";
  process.env.STRIPE_PLUS_PRICE_ID = "price_plus";
  process.env.STRIPE_PRO_PRICE_ID = "price_pro";
  process.env.STRIPE_PLUS_MONTHLY_PRICE_ID = "price_plus_monthly";
  process.env.STRIPE_PLUS_ANNUAL_PRICE_ID = "price_plus_annual";
  process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_monthly";
  process.env.STRIPE_PRO_ANNUAL_PRICE_ID = "price_pro_annual";

  return {
    billingState: {
      user: { id: "user_123", email: "owner@example.com" } as { id: string; email: string } | null,
      subscriptionRow: null as { stripe_customer_id?: string | null } | null,
      upserts: [] as Array<Record<string, unknown>>,
      adminUpsertError: null as { message: string } | null,
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

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table !== "subscriptions") {
        throw new Error(`Unexpected admin table ${table}`);
      }

      return {
        upsert: async (payload: Record<string, unknown>) => {
          billingState.upserts.push(payload);
          return { error: billingState.adminUpsertError };
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
    billingState.adminUpsertError = null;
    createCheckoutSessionMock.mockReset();
    createCustomerMock.mockReset();
    createPortalSessionMock.mockReset();
    createCustomerMock.mockResolvedValue({ id: "cus_123" });
    createCheckoutSessionMock.mockResolvedValue({ url: "https://checkout.stripe.test/session_123" });
    createPortalSessionMock.mockResolvedValue({ url: "https://billing.stripe.test/session_123" });
    process.env.NEXT_PUBLIC_SITE_URL = "https://pinkpepper.io/";
    process.env.STRIPE_PLUS_PRICE_ID = "price_plus";
    process.env.STRIPE_PRO_PRICE_ID = "price_pro";
    process.env.STRIPE_PLUS_MONTHLY_PRICE_ID = "price_plus_monthly";
    process.env.STRIPE_PLUS_ANNUAL_PRICE_ID = "price_plus_annual";
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_monthly";
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID = "price_pro_annual";
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

  it("falls back to the legacy Plus monthly alias when the new monthly env is blank", async () => {
    process.env.STRIPE_PLUS_MONTHLY_PRICE_ID = "";
    process.env.STRIPE_PLUS_PRICE_ID = "price_plus_legacy";

    const response = await checkoutPost(
      new Request("https://pinkpepper.io/api/billing/checkout", {
        method: "POST",
        headers: {
          host: "pinkpepper.io",
          origin: "https://pinkpepper.io",
          "content-type": "application/json",
        },
        body: JSON.stringify({ plan: "plus", interval: "monthly" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(createCheckoutSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({ line_items: [{ price: "price_plus_legacy", quantity: 1 }] })
    );
  });

  it("falls back to the legacy Pro monthly alias when the new monthly env is blank", async () => {
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "   ";
    process.env.STRIPE_PRO_PRICE_ID = "price_pro_legacy";

    const response = await checkoutPost(
      new Request("https://pinkpepper.io/api/billing/checkout", {
        method: "POST",
        headers: {
          host: "pinkpepper.io",
          origin: "https://pinkpepper.io",
          "content-type": "application/json",
        },
        body: JSON.stringify({ plan: "pro", interval: "monthly" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(createCheckoutSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({ line_items: [{ price: "price_pro_legacy", quantity: 1 }] })
    );
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

  it("allows checkout from the www variant when NEXT_PUBLIC_SITE_URL is the apex", async () => {
    // Regression: DNS serves both https://pinkpepper.io and
    // https://www.pinkpepper.io. If NEXT_PUBLIC_SITE_URL is pinned to one,
    // visitors on the other must not be rejected as CSRF.
    process.env.NEXT_PUBLIC_SITE_URL = "https://pinkpepper.io/";

    const response = await checkoutPost(
      new Request("https://www.pinkpepper.io/api/billing/checkout", {
        method: "POST",
        headers: {
          host: "www.pinkpepper.io",
          origin: "https://www.pinkpepper.io",
          "content-type": "application/json",
        },
        body: JSON.stringify({ plan: "plus" }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ url: "https://checkout.stripe.test/session_123" });
  });

  it("allows checkout from the apex when NEXT_PUBLIC_SITE_URL is the www variant", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.pinkpepper.io/";

    const response = await checkoutPost(
      new Request("https://pinkpepper.io/api/billing/checkout", {
        method: "POST",
        headers: {
          host: "pinkpepper.io",
          origin: "https://pinkpepper.io",
          "content-type": "application/json",
        },
        body: JSON.stringify({ plan: "pro" }),
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

  it("rejects checkout from a look-alike subdomain (not a real www/apex sibling)", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.pinkpepper.io/";

    const response = await checkoutPost(
      new Request("https://www.pinkpepper.io/api/billing/checkout", {
        method: "POST",
        headers: {
          host: "www.pinkpepper.io",
          origin: "https://pinkpepper.io.evil.com",
          "content-type": "application/json",
        },
        body: JSON.stringify({ plan: "plus" }),
      }),
    );

    expect(response.status).toBe(403);
  });


  it("uses the Plus annual Stripe price ID for annual Plus checkout", async () => {
    const response = await checkoutPost(
      new Request("https://pinkpepper.io/api/billing/checkout", {
        method: "POST",
        headers: { host: "pinkpepper.io", origin: "https://pinkpepper.io", "content-type": "application/json" },
        body: JSON.stringify({ plan: "plus", interval: "annual" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(createCheckoutSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: "price_plus_annual", quantity: 1 }],
        metadata: expect.objectContaining({ plan: "plus", tier: "plus", interval: "annual" }),
      })
    );
  });

  it("uses the Pro annual Stripe price ID for annual Pro checkout", async () => {
    const response = await checkoutPost(
      new Request("https://pinkpepper.io/api/billing/checkout", {
        method: "POST",
        headers: { host: "pinkpepper.io", origin: "https://pinkpepper.io", "content-type": "application/json" },
        body: JSON.stringify({ plan: "pro", interval: "annual" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(createCheckoutSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: "price_pro_annual", quantity: 1 }],
        metadata: expect.objectContaining({ plan: "pro", tier: "pro", interval: "annual" }),
      })
    );
  });

  it("rejects invalid checkout tier or interval server-side", async () => {
    const response = await checkoutPost(
      new Request("https://pinkpepper.io/api/billing/checkout", {
        method: "POST",
        headers: { host: "pinkpepper.io", origin: "https://pinkpepper.io", "content-type": "application/json" },
        body: JSON.stringify({ plan: "free", interval: "quarterly" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid plan or billing interval." });
    expect(createCheckoutSessionMock).not.toHaveBeenCalled();
  });

  it("returns a billing configuration error when all configured monthly plan envs are invalid", async () => {
    process.env.STRIPE_PLUS_MONTHLY_PRICE_ID = "prod_bad";
    process.env.STRIPE_PLUS_PRICE_ID = "";

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

  it("fails checkout when persisting the Stripe customer breadcrumb fails", async () => {
    billingState.adminUpsertError = { message: "rls denied" };

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
