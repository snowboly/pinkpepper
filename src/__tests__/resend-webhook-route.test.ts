import { beforeEach, describe, expect, it, vi } from "vitest";

const webhookState = vi.hoisted(() => ({
  verifyResult: {
    type: "contact.updated",
    created_at: "2026-06-30T10:00:00.000Z",
    data: {
      id: "contact_123",
      audience_id: "aud_123",
      segment_ids: [],
      created_at: "2026-06-30T09:00:00.000Z",
      updated_at: "2026-06-30T10:00:00.000Z",
      email: "owner@example.com",
      first_name: "Joao",
      last_name: "Silva",
      unsubscribed: true,
    },
  } as Record<string, unknown>,
  updates: [] as Array<Record<string, unknown>>,
  selectEmail: "owner@example.com",
}));

vi.mock("resend", () => ({
  Resend: class {
    webhooks = {
      verify: (payload: Record<string, unknown>) => {
        if (payload.webhookSecret !== "whsec_test") {
          throw new Error("Invalid signature");
        }
        return webhookState.verifyResult;
      },
    };
  },
}));

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table !== "profiles") {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        update: (payload: Record<string, unknown>) => {
          webhookState.updates.push(payload);
          return {
            eq: (_column: string, _value: string) => ({
              eq: async () => ({ error: null }),
            }),
          };
        },
      };
    },
  }),
}));

describe("resend webhook route", () => {
  beforeEach(() => {
    process.env.RESEND_WEBHOOK_SECRET = "whsec_test";
    webhookState.updates = [];
  });

  it("applies unsubscribe events to profile marketing preferences", async () => {
    const { POST } = await import("@/app/api/webhooks/resend/route");

    const response = await POST(
      new Request("https://pinkpepper.io/api/webhooks/resend", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "svix-id": "msg_123",
          "svix-timestamp": "123",
          "svix-signature": "sig",
        },
        body: JSON.stringify({ ok: true }),
      }),
    );

    expect(response.status).toBe(200);
    expect(webhookState.updates[0]).toMatchObject({
      marketing_email_opt_in: false,
    });
    expect(webhookState.updates[0].marketing_email_unsubscribed_at).toBeTypeOf("string");
  });

  it("rejects invalid signatures", async () => {
    process.env.RESEND_WEBHOOK_SECRET = "wrong";
    const { POST } = await import("@/app/api/webhooks/resend/route");

    const response = await POST(
      new Request("https://pinkpepper.io/api/webhooks/resend", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "svix-id": "msg_123",
          "svix-timestamp": "123",
          "svix-signature": "sig",
        },
        body: JSON.stringify({ ok: true }),
      }),
    );

    expect(response.status).toBe(400);
  });
});
