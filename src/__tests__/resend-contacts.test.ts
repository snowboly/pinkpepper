import { beforeEach, describe, expect, it, vi } from "vitest";

const resendState = vi.hoisted(() => ({
  updateCalls: [] as Array<Record<string, unknown>>,
  createCalls: [] as Array<Record<string, unknown>>,
  updateResult: { data: null, error: { message: "not found" } as { message: string } | null },
  createResult: { data: { id: "contact_123" }, error: null as { message: string } | null },
}));

vi.mock("resend", () => ({
  Resend: class {
    contacts = {
      update: async (payload: Record<string, unknown>) => {
        resendState.updateCalls.push(payload);
        return resendState.updateResult;
      },
      create: async (payload: Record<string, unknown>) => {
        resendState.createCalls.push(payload);
        return resendState.createResult;
      },
    };
  },
}));

describe("syncMarketingContact", () => {
  beforeEach(() => {
    resendState.updateCalls = [];
    resendState.createCalls = [];
    resendState.updateResult = { data: null, error: { message: "not found" } };
    resendState.createResult = { data: { id: "contact_123" }, error: null };
    process.env.RESEND_API_KEY = "re_test_123";
    process.env.RESEND_AUDIENCE_ID = "aud_123";
  });

  it("creates the fallback contact in the configured audience", async () => {
    const { syncMarketingContact } = await import("@/lib/resend/contacts");

    await syncMarketingContact({
      email: "owner@example.com",
      firstName: "Joao",
      lastName: "Silva",
      subscribed: true,
    });

    expect(resendState.updateCalls).toEqual([
      {
        audienceId: "aud_123",
        email: "owner@example.com",
        firstName: "Joao",
        lastName: "Silva",
        unsubscribed: false,
      },
    ]);

    expect(resendState.createCalls).toEqual([
      {
        audienceId: "aud_123",
        email: "owner@example.com",
        firstName: "Joao",
        lastName: "Silva",
        unsubscribed: false,
      },
    ]);
  });
});
