import { beforeEach, describe, expect, it, vi } from "vitest";

const cspValue = "default-src 'self'";
const getUser = vi.fn();
const getProfile = vi.fn();

vi.mock("@/lib/security/csp", () => ({
  NONCE_HEADER: "x-csp-nonce",
  buildContentSecurityPolicy: () => cspValue,
  generateCspNonce: () => "test-nonce",
}));

vi.mock("next/server", () => {
  class MockNextResponse {
    status: number;
    headers: Headers;
    forwardedRequestHeaders?: Headers;
    cookies: { set: () => void };

    constructor(status: number, headers?: HeadersInit) {
      this.status = status;
      this.headers = new Headers(headers);
      this.cookies = { set: () => undefined };
    }

    static next(input?: { request?: { headers?: Headers } }) {
      const response = new MockNextResponse(200);
      response.forwardedRequestHeaders = input?.request?.headers;
      return response;
    }

    static redirect(input: string | URL, status = 307) {
      return new MockNextResponse(status, { location: String(input) });
    }
  }

  return { NextResponse: MockNextResponse };
});

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser,
    },
    from: (table: string) => {
      if (table !== "profiles") {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        select: () => ({
          eq: () => ({
            maybeSingle: getProfile,
          }),
        }),
      };
    },
  })),
}));

describe("proxy onboarding gate", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "user_123",
          email: "owner@example.com",
          email_confirmed_at: "2026-07-07T10:00:00.000Z",
        },
      },
    });
    getProfile.mockResolvedValue({
      data: {
        first_name: null,
        is_admin: false,
        locale: "en",
      },
      error: null,
    });
  });

  function makeRequest(url: string) {
    const parsed = new URL(url);
    return {
      headers: new Headers(),
      cookies: {
        get: () => undefined,
        getAll: () => [],
        set: () => undefined,
      },
      nextUrl: {
        hostname: parsed.hostname,
        pathname: parsed.pathname,
        clone: () => new URL(url),
      },
    };
  }

  it("redirects authenticated users without a first name to the completion route", async () => {
    const { proxy } = await import("../proxy");

    const response = await proxy(makeRequest("https://pinkpepper.io/dashboard") as never);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://pinkpepper.io/dashboard/complete-profile");
  }, 15000);

  it("allows the dedicated completion route through", async () => {
    const { proxy } = await import("../proxy");

    const response = await proxy(makeRequest("https://pinkpepper.io/dashboard/complete-profile") as never);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  }, 15000);
});
