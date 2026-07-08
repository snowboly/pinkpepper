import { createElement } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

type ReactElementLike = {
  props?: {
    children?: unknown;
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
  it("keeps a thin server page while the client form collects profile fields and marketing opt-in metadata", () => {
    const signupPage = readPage("src/app/signup/page.tsx");
    const signupForm = readPage("src/app/signup/SignupForm.tsx");

    expect(signupPage).not.toContain('"use client"');
    expect(signupPage).toContain("SignupForm");

    expect(signupForm).toContain('"use client"');
    expect(signupForm).toContain("First name");
    expect(signupForm).toContain("Surname");
    expect(signupForm).toContain("Company name");
    expect(signupForm).toContain("I would like to receive occasional product updates, new document templates, and relevant offers from PinkPepper. I can unsubscribe at any time.");
    expect(signupForm).toContain("marketing_email_opt_in");
    expect(signupForm).toContain("company_name");
    expect(signupForm).toContain("first_name");
    expect(signupForm).toContain("last_name");
    expect(signupForm).toContain("options:");
    expect(signupForm).toContain("data:");
  });

  it("offers a Continue with Google CTA that keeps the signup callback intent", async () => {
    vi.resetModules();

    const signInWithOAuth = vi.fn().mockResolvedValue({ data: {}, error: null });
    const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://preview.pinkpepper.io";

    vi.doMock("next/link", () => ({
      default: ({ children, href }: { children: unknown; href: string }) => createElement("a", { href }, children),
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
    } finally {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
      vi.doUnmock("next/link");
      vi.doUnmock("next/navigation");
      vi.doUnmock("@/utils/supabase/client");
      vi.doUnmock("react");
    }
  }, 15000);
});
