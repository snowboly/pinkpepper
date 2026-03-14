import { beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

const { adminState, sendBillingEmailMock, getUserByIdMock, stripeRetrieveCustomerMock } = vi.hoisted(() => ({
  adminState: {
    subscriptionRow: null as { user_id: string } | null,
    upserts: [] as Array<Record<string, unknown>>,
    profileUpdates: [] as Array<Record<string, unknown>>,
    queriedCustomerId: null as string | null,
  },
  sendBillingEmailMock: vi.fn(),
  getUserByIdMock: vi.fn(),
  stripeRetrieveCustomerMock: vi.fn(),
}));

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "subscriptions") {
        return {
          select: () => ({
            eq: (_column: string, value: string) => {
              adminState.queriedCustomerId = value;
              return {
                maybeSingle: async () => ({ data: adminState.subscriptionRow, error: null }),
              };
            },
          }),
          upsert: async (payload: Record<string, unknown>) => {
            adminState.upserts.push(payload);
            return { error: null };
          },
        };
      }

      if (table === "profiles") {
        return {
          update: (payload: Record<string, unknown>) => ({
            eq: async () => {
              adminState.profileUpdates.push(payload);
              return { error: null };
            },
          }),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
    auth: {
      admin: {
        getUserById: getUserByIdMock,
      },
    },
  }),
}));

vi.mock("@/lib/billing/email", () => ({
  sendBillingEmail: sendBillingEmailMock,
}));

vi.mock("@/lib/billing/stripe", () => ({
  getStripe: () => ({
    customers: {
      retrieve: stripeRetrieveCustomerMock,
    },
  }),
}));

const initialAdminState = () => ({
  subscriptionRow: null as { user_id: string } | null,
  upserts: [] as Array<Record<string, unknown>>,
  profileUpdates: [] as Array<Record<string, unknown>>,
  queriedCustomerId: null as string | null,
});

import {
  syncSubscriptionFromStripe,
} from "@/app/api/webhook/stripe/route";

describe("syncSubscriptionFromStripe", () => {
  beforeEach(() => {
    Object.assign(adminState, initialAdminState());
    sendBillingEmailMock.mockReset();
    getUserByIdMock.mockReset();
    stripeRetrieveCustomerMock.mockReset();
    process.env.STRIPE_PRO_PRICE_ID = "price_pro";
  });

  it("recovers from out-of-order subscription events via Stripe customer metadata", async () => {
    stripeRetrieveCustomerMock.mockResolvedValue({
      id: "cus_123",
      metadata: { user_id: "user_123" },
    });
    getUserByIdMock.mockResolvedValue({
      data: { user: { email: "owner@example.com" } },
    });

    await syncSubscriptionFromStripe(
      {
        id: "sub_123",
        customer: "cus_123",
        status: "active",
        items: {
          data: [
            {
              price: { id: "price_pro" },
              current_period_end: 1_710_000_000,
            },
          ],
        },
      } as unknown as Stripe.Subscription,
      "customer.subscription.created"
    );

    expect(adminState.queriedCustomerId).toBe("cus_123");
    expect(stripeRetrieveCustomerMock).toHaveBeenCalledWith("cus_123");
    expect(adminState.upserts[0]).toMatchObject({
      user_id: "user_123",
      stripe_customer_id: "cus_123",
      stripe_subscription_id: "sub_123",
      tier: "pro",
    });
    expect(adminState.profileUpdates[0]).toMatchObject({ tier: "pro" });
  });

  it("uses the cancelled paid tier in the cancellation email", async () => {
    adminState.subscriptionRow = { user_id: "user_123" };
    getUserByIdMock.mockResolvedValue({
      data: { user: { email: "owner@example.com" } },
    });

    await syncSubscriptionFromStripe(
      {
        id: "sub_123",
        customer: "cus_123",
        status: "canceled",
        items: {
          data: [
            {
              price: { id: "price_pro" },
              current_period_end: 1_710_000_000,
            },
          ],
        },
      } as unknown as Stripe.Subscription,
      "customer.subscription.deleted"
    );

    expect(sendBillingEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "owner@example.com",
        subject: expect.stringContaining("Pro"),
      })
    );
    expect(adminState.profileUpdates[0]).toMatchObject({ tier: "free" });
  });
});
