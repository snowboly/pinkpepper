import { beforeEach, describe, expect, it, vi } from "vitest";

const routeState = vi.hoisted(() => ({
  user: { id: "user_123", email: "owner@example.com" } as { id: string; email: string } | null,
  profile: { first_name: "Joao", last_name: "Silva" } as Record<string, unknown> | null,
  updates: [] as Array<Record<string, unknown>>,
  updateError: null as { message: string } | null,
  syncCalls: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: routeState.user } }),
    },
    from: (table: string) => {
      if (table !== "profiles") {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: routeState.profile, error: null }),
          }),
        }),
        update: (payload: Record<string, unknown>) => {
          routeState.updates.push(payload);
          return {
            eq: async () => ({ error: routeState.updateError }),
          };
        },
      };
    },
  }),
}));

vi.mock("@/lib/resend/contacts", () => ({
  syncMarketingContact: async (payload: Record<string, unknown>) => {
    routeState.syncCalls.push(payload);
    return { ok: true };
  },
}));

import { PATCH } from "@/app/api/profile/route";

describe("profile route", () => {
  beforeEach(() => {
    routeState.user = { id: "user_123", email: "owner@example.com" };
    routeState.profile = { first_name: "Joao", last_name: "Silva" };
    routeState.updates = [];
    routeState.updateError = null;
    routeState.syncCalls = [];
  });

  it("updates first name, company name, and opt-in timestamp when marketing is enabled", async () => {
    const response = await PATCH(
      new Request("https://pinkpepper.io/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          first_name: "Joao",
          last_name: "Silva",
          company_name: "PinkPepper Ltd",
          marketing_email_opt_in: true,
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(routeState.updates).toHaveLength(1);
    expect(routeState.updates[0]).toMatchObject({
      first_name: "Joao",
      last_name: "Silva",
      company_name: "PinkPepper Ltd",
      marketing_email_opt_in: true,
      marketing_email_unsubscribed_at: null,
    });
    expect(routeState.syncCalls[0]).toMatchObject({
      email: "owner@example.com",
      firstName: "Joao",
      lastName: "Silva",
      subscribed: true,
    });
    expect(routeState.updates[0].marketing_email_opted_at).toBeTypeOf("string");
  });

  it("records an unsubscribe timestamp when marketing is disabled", async () => {
    const response = await PATCH(
      new Request("https://pinkpepper.io/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          marketing_email_opt_in: false,
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(routeState.updates[0]).toMatchObject({
      marketing_email_opt_in: false,
      marketing_email_opted_at: null,
    });
    expect(routeState.syncCalls[0]).toMatchObject({
      email: "owner@example.com",
      subscribed: false,
    });
    expect(routeState.updates[0].marketing_email_unsubscribed_at).toBeTypeOf("string");
  });

  it("marks onboarding complete when profile completion submits a first name", async () => {
    const response = await PATCH(
      new Request("https://pinkpepper.io/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          first_name: "Joao",
          business_type: "catering",
          onboarding_completed: true,
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(routeState.updates[0]).toMatchObject({
      first_name: "Joao",
      business_type: "catering",
      onboarding_completed: true,
    });
    expect(routeState.syncCalls).toHaveLength(0);
  });
});
