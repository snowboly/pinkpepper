import { beforeEach, describe, expect, it, vi } from "vitest";

const routeState = vi.hoisted(() => ({
  user: {
    email: "owner@example.com",
    email_confirmed_at: "2026-06-30T10:00:00.000Z",
    user_metadata: {
      first_name: "Joao",
      last_name: "Silva",
      marketing_email_opt_in: true,
    },
  } as {
    email?: string | null;
    email_confirmed_at?: string | null;
    user_metadata?: Record<string, unknown>;
  } | null,
  emailCalls: [] as Array<Record<string, unknown>>,
  syncCalls: [] as Array<Record<string, unknown>>,
  updateUserCalls: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: routeState.user } }),
      updateUser: async (payload: Record<string, unknown>) => {
        routeState.updateUserCalls.push(payload);
        return { data: null, error: null };
      },
    },
  }),
}));

vi.mock("@/lib/email", () => ({
  sendEmail: async (payload: Record<string, unknown>) => {
    routeState.emailCalls.push(payload);
    return { id: "email_123" };
  },
}));

vi.mock("@/lib/resend/contacts", () => ({
  syncMarketingContact: async (payload: Record<string, unknown>) => {
    routeState.syncCalls.push(payload);
    return { id: "contact_123" };
  },
}));

import { POST } from "@/app/api/auth/welcome/route";

describe("auth welcome route", () => {
  beforeEach(() => {
    routeState.user = {
      email: "owner@example.com",
      email_confirmed_at: "2026-06-30T10:00:00.000Z",
      user_metadata: {
        first_name: "Joao",
        last_name: "Silva",
        marketing_email_opt_in: true,
      },
    };
    routeState.emailCalls = [];
    routeState.syncCalls = [];
    routeState.updateUserCalls = [];
  });

  it("syncs confirmed signup opt-ins to Resend before sending the welcome email", async () => {
    const response = await POST();

    expect(response.status).toBe(200);
    expect(routeState.syncCalls).toEqual([
      {
        email: "owner@example.com",
        firstName: "Joao",
        lastName: "Silva",
        subscribed: true,
      },
    ]);
    expect(routeState.emailCalls).toHaveLength(1);
    expect(routeState.updateUserCalls).toHaveLength(1);
  });

  it("still syncs an opted-in confirmed user even when the welcome email was already sent", async () => {
    routeState.user = {
      email: "owner@example.com",
      email_confirmed_at: "2026-06-30T10:00:00.000Z",
      user_metadata: {
        first_name: "Joao",
        last_name: "Silva",
        marketing_email_opt_in: true,
        welcome_email_sent_at: "2026-06-30T10:01:00.000Z",
      },
    };

    const response = await POST();

    expect(response.status).toBe(200);
    expect(routeState.syncCalls).toEqual([
      {
        email: "owner@example.com",
        firstName: "Joao",
        lastName: "Silva",
        subscribed: true,
      },
    ]);
    expect(routeState.emailCalls).toHaveLength(0);
    expect(routeState.updateUserCalls).toHaveLength(0);
  });

  it("skips Resend sync when the confirmed user did not opt into marketing emails", async () => {
    routeState.user = {
      email: "owner@example.com",
      email_confirmed_at: "2026-06-30T10:00:00.000Z",
      user_metadata: {
        first_name: "Joao",
        last_name: "Silva",
        marketing_email_opt_in: false,
      },
    };

    const response = await POST();

    expect(response.status).toBe(200);
    expect(routeState.syncCalls).toHaveLength(0);
    expect(routeState.emailCalls).toHaveLength(1);
    expect(routeState.updateUserCalls).toHaveLength(1);
  });
});
