import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("security headers", () => {
  it("keeps CSP strict enough for analytics without allowing unsafe-eval", () => {
    // CSP lives in src/lib/security/csp.ts (applied per-request via middleware)
    // so that every response can carry a fresh nonce. next.config.ts must NOT
    // re-add a static CSP header — that would shadow the nonced policy.
    const csp = readFileSync(join(process.cwd(), "src/lib/security/csp.ts"), "utf8");
    const nextConfig = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");

    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toContain("https://va.vercel-scripts.com");
    // Ensure next.config.ts no longer ships a static CSP header (which
    // would shadow the per-request nonced policy set by middleware).
    expect(nextConfig).not.toMatch(/key:\s*["']Content-Security-Policy["']/);
  });
});
