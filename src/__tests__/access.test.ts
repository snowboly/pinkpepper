import { describe, it, expect } from "vitest";
import { resolveUserAccess, isAdminUser } from "@/lib/access";

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
    const { tier } = resolveUserAccess({ is_admin: false } as any, "u@x.com");
    expect(tier).toBe("free");
  });

  it("non-admin user has isAdmin false", () => {
    const { isAdmin } = resolveUserAccess({ tier: "pro", is_admin: false }, "u@x.com");
    expect(isAdmin).toBe(false);
  });
});
