import { beforeEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
const verifyOtp = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession,
      verifyOtp,
    },
  })),
}));

describe("auth callback redirect handling", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    exchangeCodeForSession.mockResolvedValue({ error: null });
    verifyOtp.mockResolvedValue({ error: null });
  });

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

  it("falls back to the dashboard when next points at an external origin", async () => {
    const { GET } = await import("@/app/auth/callback/route");

    const response = await GET(
      makeRequest(
        "https://pinkpepper.io/auth/callback?code=pkce-code&next=https://evil.example/phish",
      ) as never,
    );

    expect(response.headers.get("location")).toBe("https://pinkpepper.io/dashboard");
  }, 10000);

  it("keeps local next paths after successful verification", async () => {
    const { GET } = await import("@/app/auth/callback/route");

    const response = await GET(
      makeRequest(
        "https://pinkpepper.io/auth/callback?token_hash=hash&type=magiclink&next=/pricing",
      ) as never,
    );

    expect(response.headers.get("location")).toBe("https://pinkpepper.io/pricing");
  }, 10000);
});
