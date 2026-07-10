import { beforeEach, describe, expect, it, vi } from "vitest";

const resendState = vi.hoisted(() => ({
  createResult: { data: { id: "contact_new" }, error: null as Record<string, unknown> | null },
  updateResult: { data: { id: "contact_existing" }, error: null as Record<string, unknown> | null },
  createCalls: [] as Array<Record<string, unknown>>,
  updateCalls: [] as Array<Record<string, unknown>>,
}));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function Resend() {
    return {
      contacts: {
        create: async (payload: Record<string, unknown>) => {
          resendState.createCalls.push(payload);
          return resendState.createResult;
        },
        update: async (payload: Record<string, unknown>) => {
          resendState.updateCalls.push(payload);
          return resendState.updateResult;
        },
      },
    };
  }),
}));

import { syncMarketingContact } from "@/lib/resend/contacts";

describe("Resend marketing contact sync", () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_AUDIENCE_ID = "aud_123";
    resendState.createResult = { data: { id: "contact_new" }, error: null };
    resendState.updateResult = { data: { id: "contact_existing" }, error: null };
    resendState.createCalls = [];
    resendState.updateCalls = [];
  });

  it("skips Resend contact sync safely when required Resend config is missing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_AUDIENCE_ID;

    await expect(syncMarketingContact({
      email: "owner@example.com",
      firstName: "Joao",
      lastName: "Silva",
      subscribed: true,
    })).resolves.toBeNull();

    expect(resendState.createCalls).toHaveLength(0);
    expect(resendState.updateCalls).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith("Skipping Resend marketing contact sync: missing RESEND_API_KEY or RESEND_AUDIENCE_ID.");
    warn.mockRestore();
  });

  it("creates a new subscribed contact without a noisy update-first 404", async () => {
    await expect(syncMarketingContact({
      email: "owner@example.com",
      firstName: "Joao",
      lastName: "Silva",
      subscribed: true,
    })).resolves.toEqual({ id: "contact_new" });

    expect(resendState.createCalls).toEqual([
      {
        audienceId: "aud_123",
        email: "owner@example.com",
        firstName: "Joao",
        lastName: "Silva",
        unsubscribed: false,
      },
    ]);
    expect(resendState.updateCalls).toHaveLength(0);
  });

  it("updates an existing contact as subscribed after an expected duplicate create response", async () => {
    resendState.createResult = {
      data: null as never,
      error: { statusCode: 409, message: "Contact already exists" },
    };

    await expect(syncMarketingContact({
      email: "owner@example.com",
      firstName: null,
      lastName: null,
      subscribed: true,
    })).resolves.toEqual({ id: "contact_existing" });

    expect(resendState.updateCalls).toEqual([
      {
        audienceId: "aud_123",
        email: "owner@example.com",
        firstName: null,
        lastName: null,
        unsubscribed: false,
      },
    ]);
  });

  it("updates an existing contact as unsubscribed without creating one", async () => {
    await expect(syncMarketingContact({
      email: "owner@example.com",
      firstName: null,
      lastName: null,
      subscribed: false,
    })).resolves.toEqual({ id: "contact_existing" });

    expect(resendState.createCalls).toHaveLength(0);
    expect(resendState.updateCalls[0]).toMatchObject({
      email: "owner@example.com",
      unsubscribed: true,
    });
  });

  it("does nothing in Resend when unsubscribing a contact that does not exist", async () => {
    resendState.updateResult = {
      data: null as never,
      error: { statusCode: 404, message: "Contact not found" },
    };

    await expect(syncMarketingContact({
      email: "owner@example.com",
      firstName: null,
      lastName: null,
      subscribed: false,
    })).resolves.toBeNull();

    expect(resendState.createCalls).toHaveLength(0);
    expect(resendState.updateCalls).toHaveLength(1);
  });
});
