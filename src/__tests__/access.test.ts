import { describe, it, expect } from "vitest";
import { resolveUserAccess, isAdminUser } from "@/lib/access";

describe("isAdminUser", () => {
  it("returns true when profile has is_admin flag", () => {
    expect(isAdminUser(true, "user@example.com")).toBe(true);
  });

  it("returns false when profile is not admin and email is not in admin list", () => {
    expect(isAdminUser(false, "user@example.com")).toBe(false);
  });

  it("returns false when email is null", () => {
    expect(isAdminUser(false, null)).toBe(false);
  });
});

describe("resolveUserAccess", () => {
  it("returns free tier for null profile", () => {
    const { tier, isAdmin } = resolveUserAccess(null, "user@example.com");
    expect(tier).toBe("free");
    expect(isAdmin).toBe(false);
  });

  it("returns correct tier from profile", () => {
    const { tier } = resolveUserAccess({ tier: "plus", is_admin: false }, "user@example.com");
    expect(tier).toBe("plus");
  });

  it("admin users always get pro tier", () => {
    const { tier, isAdmin } = resolveUserAccess({ tier: "free", is_admin: true }, "admin@example.com");
    expect(tier).toBe("pro");
    expect(isAdmin).toBe(true);
  });

  it("falls back to free for unrecognised tier string", () => {
    const { tier } = resolveUserAccess({ tier: "legacy", is_admin: false }, "user@example.com");
    expect(tier).toBe("free");
  });
});
