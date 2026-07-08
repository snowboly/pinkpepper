import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  LoginEmailCodePanel,
  getLoginFlashErrorMessage,
  getSafeNextPath,
} from "@/app/login/login-flow";

type ReactElementLike = {
  props?: {
    children?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

function createHookHarness() {
  const state: unknown[] = [];
  const effects: Array<() => void> = [];
  let cursor = 0;

  return {
    beginRender() {
      cursor = 0;
    },
    flushEffects() {
      while (effects.length > 0) {
        effects.shift()?.();
      }
    },
    useEffect(effect: () => void) {
      effects.push(effect);
    },
    useState<T>(initialState: T) {
      const index = cursor++;

      if (state.length <= index) {
        state.push(initialState);
      }

      const setState = (value: T | ((current: T) => T)) => {
        const currentValue = state[index] as T;
        state[index] = typeof value === "function" ? (value as (current: T) => T)(currentValue) : value;
      };

      return [state[index] as T, setState] as const;
    },
  };
}

function findElement(node: unknown, predicate: (value: ReactElementLike) => boolean): ReactElementLike | null {
  if (!node) return null;

  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findElement(child, predicate);
      if (match) return match;
    }
    return null;
  }

  if (typeof node !== "object") {
    return null;
  }

  const element = node as ReactElementLike;
  if (predicate(element)) {
    return element;
  }

  return findElement(element.props?.children, predicate);
}

function getTextContent(node: unknown): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getTextContent).join("");
  }

  if (!node || typeof node !== "object") {
    return "";
  }

  return getTextContent((node as ReactElementLike).props?.children);
}

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
  it("keeps a thin server page and moves auth logic into the client form", () => {
    const pageSource = readFileSync(path.join(process.cwd(), "src/app/login/page.tsx"), "utf8");
    const formSource = readFileSync(path.join(process.cwd(), "src/app/login/LoginForm.tsx"), "utf8");
    const helperSource = readFileSync(path.join(process.cwd(), "src/app/login/login-flow.tsx"), "utf8");

    expect(pageSource).not.toContain('"use client"');
    expect(pageSource).toContain("LoginForm");
    expect(formSource).toContain('"use client"');
    expect(formSource).toContain("LoginEmailCodePanel");
    expect(formSource).toContain("verifyOtp");
    expect(pageSource).not.toContain("Send magic link");
    expect(helperSource).toContain("Send email code");
  });

  it("offers a Continue with Google CTA that preserves a safe next path in the OAuth callback", async () => {
    vi.resetModules();

    const signInWithOAuth = vi.fn().mockResolvedValue({ data: {}, error: null });
    const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const originalWindow = globalThis.window;
    const hooks = createHookHarness();
    process.env.NEXT_PUBLIC_SITE_URL = "https://preview.pinkpepper.io";
    globalThis.window = {
      location: {
        search: "?next=%2Fpricing",
        origin: "https://preview.pinkpepper.io",
      },
    } as Window & typeof globalThis;

    vi.doMock("next/link", () => ({
      default: ({ children, href }: { children: unknown; href: string }) => createElement("a", { href }, children),
    }));
    vi.doMock("next/navigation", () => ({
      usePathname: () => "/login",
    }));
    vi.doMock("@/utils/supabase/client", () => ({
      createClient: () => ({
        auth: {
          signInWithOAuth,
        },
      }),
    }));
    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");
      return {
        ...actual,
        useEffect: hooks.useEffect,
        useState: hooks.useState,
      };
    });

    try {
      const { LoginForm } = await import("@/app/login/LoginForm");
      hooks.beginRender();
      LoginForm();
      hooks.flushEffects();
      hooks.beginRender();
      const tree = LoginForm();
      const googleButton = findElement(
        tree,
        (element) => element.type === "button" && getTextContent(element.props?.children).includes("Continue with Google"),
      );

      expect(googleButton).toBeTruthy();

      await googleButton?.props?.onClick?.({ preventDefault() {} });

      expect(signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: "https://preview.pinkpepper.io/auth/callback?next=%2Fpricing",
        },
      });
    } finally {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
      globalThis.window = originalWindow;
      vi.doUnmock("next/link");
      vi.doUnmock("next/navigation");
      vi.doUnmock("@/utils/supabase/client");
      vi.doUnmock("react");
    }
  }, 15000);
});
