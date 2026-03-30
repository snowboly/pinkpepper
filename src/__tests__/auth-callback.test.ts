import { beforeEach, describe, expect, it, vi } from "vitest";

type CookieRecord = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

const { authState } = vi.hoisted(() => ({
  authState: {
    exchangeError: null as Error | null,
    verifyError: null as Error | null,
    cookiesWritten: [] as CookieRecord[],
  },
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: (_url: string, _key: string, config: { cookies: { setAll: (cookies: CookieRecord[]) => void } }) => ({
    auth: {
      exchangeCodeForSession: async () => {
        if (!authState.exchangeError) {
          config.cookies.setAll([
            { name: "sb-access-token", value: "access-token", options: { path: "/" } },
            { name: "sb-refresh-token", value: "refresh-token", options: { path: "/" } },
          ]);
        }

        return { error: authState.exchangeError };
      },
      verifyOtp: async () => {
        if (!authState.verifyError) {
          config.cookies.setAll([{ name: "sb-access-token", value: "otp-token", options: { path: "/" } }]);
        }

        return { error: authState.verifyError };
      },
    },
  }),
}));

vi.mock("next/server", () => {
  class MockNextResponse {
    status: number;
    headers: Headers;
    cookies: {
      set: (name: string, value: string, options?: Record<string, unknown>) => void;
      getAll: () => CookieRecord[];
    };
    private cookieStore: CookieRecord[];

    constructor(status: number, headers?: HeadersInit) {
      this.status = status;
      this.headers = new Headers(headers);
      this.cookieStore = [];
      this.cookies = {
        set: (name: string, value: string, options?: Record<string, unknown>) => {
          this.cookieStore.push({ name, value, options });
        },
        getAll: () => [...this.cookieStore],
      };
    }

    static next() {
      return new MockNextResponse(200);
    }

    static redirect(input: string | URL) {
      return new MockNextResponse(307, { location: String(input) });
    }
  }

  return { NextResponse: MockNextResponse };
});

import { GET } from "@/app/auth/callback/route";

function makeRequest(url: string) {
  const parsed = new URL(url);
  return {
    url,
    cookies: {
      getAll: () => [],
    },
    nextUrl: {
      origin: parsed.origin,
      clone: () => new URL(url),
    },
  };
}

describe("auth callback route", () => {
  beforeEach(() => {
    authState.exchangeError = null;
    authState.verifyError = null;
    authState.cookiesWritten = [];
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  it("keeps exchanged session cookies on the redirect response after a magic-link login", async () => {
    const response = await GET(
      makeRequest("https://pinkpepper.io/auth/callback?code=pkce-code&next=/dashboard") as never,
    );

    expect(response.headers.get("location")).toBe("https://pinkpepper.io/dashboard");
    expect(response.cookies.getAll()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "sb-access-token", value: "access-token" }),
        expect.objectContaining({ name: "sb-refresh-token", value: "refresh-token" }),
      ]),
    );
  });
});
