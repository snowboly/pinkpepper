import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("password recovery surfaces", () => {
  it("keeps forgot-password as a thin server page and moves reset-link logic into a client form", () => {
    const pageSource = readPage("src/app/forgot-password/page.tsx");
    const formSource = readPage("src/app/forgot-password/ForgotPasswordForm.tsx");

    expect(pageSource).not.toContain('"use client"');
    expect(pageSource).toContain("ForgotPasswordForm");
    expect(formSource).toContain('"use client"');
    expect(formSource).toContain("resetPasswordForEmail");
    expect(formSource).toContain("Send reset link");
  });

  it("keeps update-password as a thin server page and moves password update logic into a client form", () => {
    const pageSource = readPage("src/app/update-password/page.tsx");
    const formSource = readPage("src/app/update-password/UpdatePasswordForm.tsx");

    expect(pageSource).not.toContain('"use client"');
    expect(pageSource).toContain("UpdatePasswordForm");
    expect(formSource).toContain('"use client"');
    expect(formSource).toContain("updateUser");
    expect(formSource).toContain("validatePassword");
    expect(formSource).toContain("Update password");
  });
});
