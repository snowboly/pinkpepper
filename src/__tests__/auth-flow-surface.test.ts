import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("auth flow surface", () => {
  it("keeps the welcome-email trigger on the server callback only", () => {
    const callbackRoute = readPage("src/app/auth/callback/route.ts");
    const confirmPage = readPage("src/app/auth/confirm/page.tsx");

    expect(callbackRoute).toContain('/api/auth/welcome');
    expect(confirmPage).not.toContain('/api/auth/welcome');
  });
});
