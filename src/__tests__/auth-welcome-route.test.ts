import { beforeEach, describe, expect, it, vi } from "vitest";

const welcomeState = vi.hoisted(() => ({
  user: {
    email: "owner@example.com",
    email_confirmed_at: "2026-07-02T10:00:00.000Z",
    user_metadata: {
      first_name: "Joao",
    },
  } as Record<string, unknown> | null,
  sentEmails: [] as Array<Record<string, unknown>>,
  updatePayloads: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: welcomeState.user } }),
      updateUser: async ({ data }: { data: Record<string, unknown> }) => {
        welcomeState.updatePayloads.push(data);
        return { data: { user: welcomeState.user }, error: null };
      },
    },
  }),
}));

vi.mock("@/lib/email", () => ({
  sendEmail: async (payload: Record<string, unknown>) => {
    welcomeState.sentEmails.push(payload);
  },
}));

describe("auth welcome route", () => {
  beforeEach(() => {
    welcomeState.user = {
      email: "owner@example.com",
      email_confirmed_at: "2026-07-02T10:00:00.000Z",
      user_metadata: {
        first_name: "Joao",
      },
    };
    welcomeState.sentEmails = [];
    welcomeState.updatePayloads = [];
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
  });

  it("does not resend when the user metadata already has a sent timestamp", async () => {
    welcomeState.user = {
      email: "owner@example.com",
      email_confirmed_at: "2026-07-02T10:00:00.000Z",
      user_metadata: {
        first_name: "Joao",
        welcome_email_sent_at: "2026-07-02T10:05:00.000Z",
      },
    };

    const { POST } = await import("@/app/api/auth/welcome/route");

    const response = await POST();

    expect(response.status).toBe(200);
    expect(welcomeState.sentEmails).toHaveLength(0);
    expect(welcomeState.updatePayloads).toHaveLength(0);
  });
});
