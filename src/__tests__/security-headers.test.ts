import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("security headers", () => {
  it("keeps CSP strict enough for analytics without allowing unsafe-eval", () => {
    const nextConfig = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");

    expect(nextConfig).not.toContain("'unsafe-eval'");
    expect(nextConfig).toContain("https://va.vercel-scripts.com");
  });
});
