import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import {
  resolveEffectiveTier,
  resolveUserAccess,
  isAdminUser,
} from "@/lib/access";

const ROOT = process.cwd();

function readSource(relativePath: string) {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

/* ──────────────────────────────────────────────────────────────────────────
   isAdminUser
   ────────────────────────────────────────────────────────────────────────── */

describe("isAdminUser", () => {
  it("returns true when profile has is_admin flag", () => {
    expect(isAdminUser(true, "user@example.com")).toBe(true);
  });

  it("returns true when is_admin is true regardless of email", () => {
    expect(isAdminUser(true, null)).toBe(true);
    expect(isAdminUser(true, undefined)).toBe(true);
    expect(isAdminUser(true, "")).toBe(true);
  });

  it("returns false when profile is not admin and email is not in admin list", () => {
    expect(isAdminUser(false, "user@example.com")).toBe(false);
  });

  it("returns false when email is null", () => {
    expect(isAdminUser(false, null)).toBe(false);
  });

  it("returns false when email is undefined", () => {
    expect(isAdminUser(false, undefined)).toBe(false);
  });

  it("returns false when profileIsAdmin is null", () => {
    expect(isAdminUser(null, "user@example.com")).toBe(false);
  });

  it("returns false when profileIsAdmin is undefined", () => {
    expect(isAdminUser(undefined, "user@example.com")).toBe(false);
  });

  it("returns false when both profileIsAdmin and email are null", () => {
    expect(isAdminUser(null, null)).toBe(false);
  });
});

/* ──────────────────────────────────────────────────────────────────────────
   resolveUserAccess
   ────────────────────────────────────────────────────────────────────────── */

describe("resolveUserAccess", () => {
  it("returns free tier for null profile", () => {
    const { tier, isAdmin } = resolveUserAccess(null, "user@example.com");
    expect(tier).toBe("free");
    expect(isAdmin).toBe(false);
  });

  it("returns free tier for undefined profile", () => {
    const { tier, isAdmin } = resolveUserAccess(undefined, "user@example.com");
    expect(tier).toBe("free");
    expect(isAdmin).toBe(false);
  });

  it("returns correct tier from profile", () => {
    expect(resolveUserAccess({ tier: "plus", is_admin: false }, "u@x.com").tier).toBe("plus");
    expect(resolveUserAccess({ tier: "pro", is_admin: false }, "u@x.com").tier).toBe("pro");
    expect(resolveUserAccess({ tier: "free", is_admin: false }, "u@x.com").tier).toBe("free");
  });

  it("admin users always get pro tier", () => {
    const { tier, isAdmin } = resolveUserAccess({ tier: "free", is_admin: true }, "admin@example.com");
    expect(tier).toBe("pro");
    expect(isAdmin).toBe(true);
  });

  it("admin on plus tier still gets pro", () => {
    const { tier, isAdmin } = resolveUserAccess({ tier: "plus", is_admin: true }, "admin@example.com");
    expect(tier).toBe("pro");
    expect(isAdmin).toBe(true);
  });

  it("falls back to free for unrecognised tier string", () => {
    expect(resolveUserAccess({ tier: "legacy", is_admin: false }, "u@x.com").tier).toBe("free");
    expect(resolveUserAccess({ tier: "enterprise", is_admin: false }, "u@x.com").tier).toBe("free");
    expect(resolveUserAccess({ tier: "", is_admin: false }, "u@x.com").tier).toBe("free");
  });

  it("falls back to free when tier is null in profile", () => {
    const { tier } = resolveUserAccess({ tier: null, is_admin: false }, "u@x.com");
    expect(tier).toBe("free");
  });

  it("handles profile with missing tier property", () => {
    const { tier } = resolveUserAccess({ is_admin: false } as Record<string, unknown>, "u@x.com");
    expect(tier).toBe("free");
  });

  it("non-admin user has isAdmin false", () => {
    const { isAdmin } = resolveUserAccess({ tier: "pro", is_admin: false }, "u@x.com");
    expect(isAdmin).toBe(false);
  });

  it("uses an active paid subscription when the profile tier is stale", () => {
    const { tier, isAdmin } = resolveUserAccess(
      { tier: "free", is_admin: false },
      "u@x.com",
      { tier: "pro", status: "active" }
    );
    expect(tier).toBe("pro");
    expect(isAdmin).toBe(false);
  });

  it("uses an active paid subscription when the profile row has no tier", () => {
    const { tier } = resolveUserAccess(
      { tier: null, is_admin: false },
      "u@x.com",
      { tier: "plus", status: "active" }
    );
    expect(tier).toBe("plus");
  });
});

describe("resolveEffectiveTier", () => {
  it("prefers the higher paid tier between profile and subscription", () => {
    expect(resolveEffectiveTier("plus", { tier: "pro", status: "active" })).toBe("pro");
    expect(resolveEffectiveTier("pro", { tier: "plus", status: "active" })).toBe("pro");
  });

  it("ignores inactive subscription states", () => {
    expect(resolveEffectiveTier("free", { tier: "pro", status: "canceled" })).toBe("free");
    expect(resolveEffectiveTier("plus", { tier: "pro", status: "past_due" })).toBe("plus");
  });
});

describe("chat access integration", () => {
  it("uses subscription-backed access in dashboard and chat routes", () => {
    const files = [
      "src/app/dashboard/page.tsx",
      "src/app/api/billing/status/route.ts",
      "src/app/api/chat/stream/route.ts",
      "src/app/api/chat/route.ts",
    ];

    for (const file of files) {
      const source = readSource(file);
      expect(source, `${file} should fetch subscription state`).toContain('from("subscriptions")');
      expect(source, `${file} should pass subscription state into resolveUserAccess`).toContain(
        "resolveUserAccess(profile, user.email, subscription"
      );
    }
  });
});
