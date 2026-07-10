import { createElement, type ReactNode } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

type ReactElementLike = {
  type?: unknown;
  props?: {
    children?: unknown;
    onClick?: (event: { preventDefault(): void }) => unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

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

describe("signup surface", () => {
  it("keeps a thin server page while the client form stays minimal and defers profile fields to completion", () => {
    const signupPage = readPage("src/app/signup/page.tsx");
    const signupForm = readPage("src/app/signup/SignupForm.tsx");
    const completeProfileForm = readPage("src/app/dashboard/complete-profile/CompleteProfileForm.tsx");

    expect(signupPage).not.toContain('"use client"');
    expect(signupPage).toContain("SignupForm");

    expect(signupForm).toContain('"use client"');
    expect(signupForm).toContain("Work email address");
    expect(signupForm).toContain("Password");
    expect(signupForm).toContain("Sign up with magic link");
    expect(signupForm).not.toContain("Prefer to skip the password?");
    expect(signupForm.indexOf("Sign up with magic link")).toBeLessThan(signupForm.indexOf("By signing up, you agree to our"));
    expect(signupForm).not.toContain("First name");
    expect(signupForm).not.toContain("Surname");
    expect(signupForm).not.toContain("Company name");
    expect(signupForm).toContain("I would like to receive occasional product updates, new document templates, and relevant offers from PinkPepper. I can unsubscribe at any time.");
    expect(signupForm).toContain("marketing_email_opt_in");
    expect(signupForm).toContain("options:");
    expect(signupForm).toContain("data:");
    expect(completeProfileForm).toContain("First name");
    expect(completeProfileForm).toContain("Company name");
  });

  it("offers a Continue with Google CTA that keeps the signup callback intent", async () => {
    vi.resetModules();

    const signInWithOAuth = vi.fn().mockResolvedValue({ data: {}, error: null });
    const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://preview.pinkpepper.io";

    vi.doMock("next/link", () => ({
      default: ({ children, href }: { children: ReactNode; href: string }) => createElement("a", { href }, children),
    }));
    vi.doMock("next/navigation", () => ({
      usePathname: () => "/signup",
      useSearchParams: () => new URLSearchParams(),
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
        useEffect: vi.fn(),
        useState: <T,>(initialState: T) => [initialState, vi.fn()] as const,
      };
    });

    try {
      const { SignupForm } = await import("@/app/signup/SignupForm");
      const tree = SignupForm();
      const googleButton = findElement(
        tree,
        (element) => element.type === "button" && getTextContent(element.props?.children).includes("Continue with Google"),
      );

      expect(googleButton).toBeTruthy();

      await googleButton?.props?.onClick?.({ preventDefault() {} });

      expect(signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: "https://preview.pinkpepper.io/auth/callback?next=%2Fdashboard&flow=signup",
        },
      });
      expect(signInWithOAuth.mock.calls[0][0]).not.toHaveProperty("data");
      expect(JSON.stringify(signInWithOAuth.mock.calls[0][0])).not.toContain("marketing_email_opt_in");
    } finally {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
      vi.doUnmock("next/link");
      vi.doUnmock("next/navigation");
      vi.doUnmock("@/utils/supabase/client");
      vi.doUnmock("react");
    }
  }, 15000);
});
