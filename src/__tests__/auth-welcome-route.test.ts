import { beforeEach, describe, expect, it, vi } from "vitest";

const welcomeState = vi.hoisted(() => ({
  user: {
    id: "user_123",
    email: "owner@example.com",
    email_confirmed_at: "2026-07-02T10:00:00.000Z",
  } as Record<string, unknown> | null,
  profile: {
    first_name: "Joao",
    last_name: "Silva",
    marketing_email_opt_in: false,
    welcome_email_sent_at: null,
  } as Record<string, unknown> | null,
  sentEmails: [] as Array<Record<string, unknown>>,
  updatePayloads: [] as Array<Record<string, unknown>>,
  syncCalls: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: welcomeState.user } }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: welcomeState.profile, error: null }),
        }),
      }),
      update: (data: Record<string, unknown>) => {
        welcomeState.updatePayloads.push(data);
        return {
          eq: async () => ({ error: null }),
        };
      },
    }),
  }),
}));

vi.mock("@/lib/email", () => ({
  sendEmail: async (payload: Record<string, unknown>) => {
    welcomeState.sentEmails.push(payload);
  },
}));

vi.mock("@/lib/resend/contacts", () => ({
  syncMarketingContact: async (payload: Record<string, unknown>) => {
    welcomeState.syncCalls.push(payload);
    return { ok: true };
  },
}));

describe("auth welcome route", () => {
  beforeEach(() => {
    welcomeState.user = {
      id: "user_123",
      email: "owner@example.com",
      email_confirmed_at: "2026-07-02T10:00:00.000Z",
    };
    welcomeState.profile = {
      first_name: "Joao",
      last_name: "Silva",
      marketing_email_opt_in: false,
      welcome_email_sent_at: null,
    };
    welcomeState.sentEmails = [];
    welcomeState.updatePayloads = [];
    welcomeState.syncCalls = [];
  });

  it("sends the onboarding welcome email once with first-name interpolation", async () => {
    const { POST } = await import("@/app/api/auth/welcome/route");

    const response = await POST();

    expect(response.status).toBe(200);
    expect(welcomeState.sentEmails).toHaveLength(1);
    expect(welcomeState.sentEmails[0]).toMatchObject({
      to: "owner@example.com",
      subject: "Welcome to PinkPepper",
    });
    expect(String(welcomeState.sentEmails[0].html)).toContain("Hi Joao,");
    expect(String(welcomeState.sentEmails[0].html)).toContain("Start using PinkPepper");
    expect(String(welcomeState.sentEmails[0].html)).toContain('href="https://pinkpepper.io/dashboard"');
    expect(String(welcomeState.sentEmails[0].html)).not.toContain('href="https://pinkpepper.io"');
    expect(String(welcomeState.sentEmails[0].html)).not.toContain("RESEND_UNSUBSCRIBE_URL");
    expect(welcomeState.updatePayloads[0].welcome_email_sent_at).toBeTypeOf("string");
  }, 30000);

  it("does not resend when the profile already has a sent timestamp", async () => {
    welcomeState.profile = {
      first_name: "Joao",
      last_name: "Silva",
      marketing_email_opt_in: false,
      welcome_email_sent_at: "2026-07-02T10:05:00.000Z",
    };

    const { POST } = await import("@/app/api/auth/welcome/route");

    const response = await POST();

    expect(response.status).toBe(200);
    expect(welcomeState.sentEmails).toHaveLength(0);
    expect(welcomeState.updatePayloads).toHaveLength(0);
  }, 30000);
});
