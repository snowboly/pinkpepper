import { beforeEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
const verifyOtp = vi.fn();
const getUser = vi.fn();
const fetchProfile = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession,
      verifyOtp,
      getUser,
    },
    from: (table: string) => {
      if (table !== "profiles") {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        select: () => ({
          eq: () => ({
            maybeSingle: fetchProfile,
          }),
        }),
      };
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
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "user_123",
          email_confirmed_at: "2026-07-07T10:00:00.000Z",
        },
      },
    });
    fetchProfile.mockResolvedValue({
      data: {
        first_name: "Joao",
        welcome_email_sent_at: "2026-07-07T10:05:00.000Z",
      },
      error: null,
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
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

  it("routes signup-intent users without a first name through profile completion", async () => {
    fetchProfile.mockResolvedValue({
      data: {
        first_name: null,
        welcome_email_sent_at: null,
      },
      error: null,
    });

    const { GET } = await import("@/app/auth/callback/route");

    const response = await GET(
      makeRequest(
        "https://pinkpepper.io/auth/callback?code=pkce-code&next=/dashboard&flow=signup",
      ) as never,
    );

    expect(response.headers.get("location")).toBe("https://pinkpepper.io/dashboard/complete-profile");
  }, 10000);
});
