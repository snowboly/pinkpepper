import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  LoginEmailCodePanel,
  getLoginFlashErrorMessage,
  getSafeNextPath,
} from "@/app/login/login-flow";

describe("getSafeNextPath", () => {
  it("keeps safe internal redirect paths", () => {
    expect(getSafeNextPath("/dashboard/settings")).toBe("/dashboard/settings");
  });

  it("falls back to dashboard for unsafe paths", () => {
    expect(getSafeNextPath("https://evil.example")).toBe("/dashboard");
    expect(getSafeNextPath("//evil.example")).toBe("/dashboard");
    expect(getSafeNextPath("dashboard")).toBe("/dashboard");
    expect(getSafeNextPath(null)).toBe("/dashboard");
  });
});

describe("getLoginFlashErrorMessage", () => {
  it("maps legacy cross-device errors", () => {
    expect(getLoginFlashErrorMessage("cross_device_link")).toContain("same device");
  });

  it("maps invalid or expired link errors to code wording", () => {
    expect(getLoginFlashErrorMessage("invalid_or_expired_link")).toContain("code");
  });
});

describe("LoginEmailCodePanel", () => {
  it("shows send-email-code CTA before a code is sent", () => {
    const html = renderToStaticMarkup(
      <LoginEmailCodePanel
        email="owner@example.com"
        code=""
        codeSent={false}
        codeLoading={false}
        verifyLoading={false}
        resendLoading={false}
      />
    );

    expect(html).toContain("Send email code");
    expect(html).not.toContain("Verify code");
    expect(html).not.toContain("Resend code");
  });

  it("shows verification controls after a code is sent", () => {
    const html = renderToStaticMarkup(
      <LoginEmailCodePanel
        email="owner@example.com"
        code="123456"
        codeSent={true}
        codeLoading={false}
        verifyLoading={false}
        resendLoading={false}
      />
    );

    expect(html).toContain("Enter the code we sent to");
    expect(html).toContain("Verify code");
    expect(html).toContain("Resend code");
    expect(html).toContain("Use a different email");
  });
});

describe("login page wiring", () => {
  it("replaces magic-link copy with email-code flow and verifies OTP codes directly", () => {
    const pageSource = readFileSync(path.join(process.cwd(), "src/app/login/page.tsx"), "utf8");
    const helperSource = readFileSync(path.join(process.cwd(), "src/app/login/login-flow.tsx"), "utf8");

    expect(pageSource).toContain("LoginEmailCodePanel");
    expect(pageSource).toContain("verifyOtp");
    expect(pageSource).not.toContain("Send magic link");
    expect(helperSource).toContain("Send email code");
  });
});
