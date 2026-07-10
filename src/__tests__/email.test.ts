import { beforeEach, describe, expect, it, vi } from "vitest";

const resendState = vi.hoisted(() => ({
  sendCalls: [] as Array<Record<string, unknown>>,
  sendResult: { data: { id: "email_123" }, error: null } as unknown,
  sendThrows: null as unknown,
}));

vi.mock("resend", () => ({
  Resend: class MockResend {
    emails = {
      send: async (payload: Record<string, unknown>) => {
        resendState.sendCalls.push(payload);
        if (resendState.sendThrows) {
          throw resendState.sendThrows;
        }
        return resendState.sendResult;
      },
    };
  },
}));

describe("sendEmail", () => {
  beforeEach(() => {
    vi.resetModules();
    resendState.sendCalls = [];
    resendState.sendResult = { data: { id: "email_123" }, error: null };
    resendState.sendThrows = null;
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
  });

  it("returns ok false when Resend config is missing", async () => {
    const { sendEmail } = await import("@/lib/email");

    const result = await sendEmail({ to: "owner@example.com", subject: "Hi", html: "<p>Hi</p>" });

    expect(result).toEqual({ ok: false, reason: "missing_config" });
    expect(resendState.sendCalls).toHaveLength(0);
  });

  it("returns ok true when Resend accepts the email", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "PinkPepper <hello@example.com>";
    const { sendEmail } = await import("@/lib/email");

    const result = await sendEmail({ to: "owner@example.com", subject: "Hi", html: "<p>Hi</p>" });

    expect(result).toEqual({ ok: true, id: "email_123" });
    expect(resendState.sendCalls[0]).toMatchObject({
      from: "PinkPepper <hello@example.com>",
      to: "owner@example.com",
      subject: "Hi",
    });
  });

  it("returns ok false when Resend throws or returns an error", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "PinkPepper <hello@example.com>";
    resendState.sendResult = { data: null, error: { message: "Domain not verified" } };
    const { sendEmail } = await import("@/lib/email");

    await expect(sendEmail({ to: "owner@example.com", subject: "Hi", html: "<p>Hi</p>" })).resolves.toEqual({
      ok: false,
      reason: "resend_error",
      error: { message: "Domain not verified" },
    });

    resendState.sendThrows = new Error("network down");
    const thrownResult = await sendEmail({ to: "owner@example.com", subject: "Hi", html: "<p>Hi</p>" });
    expect(thrownResult.ok).toBe(false);
    expect(thrownResult).toMatchObject({ reason: "resend_error" });
  });
});
