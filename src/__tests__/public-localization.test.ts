import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  publicAuthRoutePaths,
  publicContentRoutePaths,
  publicLaunchLocales,
  publicRoutePaths,
} from "@/i18n/public";
import { getRouteLocaleFromPathname, resolveRequestLocale } from "@/i18n/request";
import {
  getPublicMessages,
  getPublicPageHref,
  isPublicLocale,
  localizePublicPath,
  switchPublicLocale,
} from "@/lib/public-routes";

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

function findFunctionElementByName(node: unknown, name: string): ReactElementLike | null {
  return findElement(
    node,
    (element) => typeof element.type === "function" && (element.type as { name?: string }).name === name,
  );
}

describe("public locale config", () => {
  it("limits phase 1 public routing to en, fr, de, and pt", () => {
    expect(publicLaunchLocales).toEqual(["en", "fr", "de", "pt"]);
    expect(publicRoutePaths).toContain("/");
    expect(publicRoutePaths).toContain("/pricing");
    expect(publicRoutePaths).toContain("/articles");
    expect(publicRoutePaths).toContain("/about");
    expect(publicRoutePaths).toContain("/faqs");
    expect(publicRoutePaths).toContain("/contact");
  });

  it("keeps noindex auth routes out of the indexable sitemap route list", () => {
    expect(publicAuthRoutePaths).toEqual(["/signup", "/login"]);
    for (const authPath of publicAuthRoutePaths) {
      expect(publicContentRoutePaths).not.toContain(authPath);
      expect(publicRoutePaths).toContain(authPath);
    }
  });

  it("identifies public locales and localizes public paths", () => {
    expect(isPublicLocale("fr")).toBe(true);
    expect(isPublicLocale("es")).toBe(false);
    expect(localizePublicPath("en", "/")).toBe("/");
    expect(localizePublicPath("en", "/pricing")).toBe("/pricing");
    expect(localizePublicPath("fr", "/")).toBe("/fr");
    expect(localizePublicPath("pt", "/pricing")).toBe("/pt/pricing");
  });

  it("prefers a valid route locale over the cookie locale", () => {
    expect(resolveRequestLocale({ routeLocale: "fr", cookieLocale: "de" })).toBe("fr");
    expect(resolveRequestLocale({ routeLocale: null, cookieLocale: "pt" })).toBe("pt");
    expect(resolveRequestLocale({ routeLocale: null, cookieLocale: "bad" })).toBe("en");
  });

  it("derives the request locale from localized public paths", () => {
    expect(getRouteLocaleFromPathname("/de/articles/haccp-plan")).toBe("de");
    expect(getRouteLocaleFromPathname("/fr/pricing")).toBe("fr");
    expect(getRouteLocaleFromPathname("/articles/haccp-plan")).toBeNull();
  });

  it("falls back to English when a public message key is missing", async () => {
    const messages = await getPublicMessages("fr");

    expect(messages.chrome.nav.pricing).toBe("Tarifs");
    expect(messages.chrome.nav.about).toBe("À propos");
    expect(messages.home.faq.items).toHaveLength(5);
  });

  it("preserves supported public routes when switching locale", () => {
    expect(switchPublicLocale("/fr/pricing", "de")).toBe("/de/pricing");
    expect(switchPublicLocale("/fr/pricing", "en")).toBe("/pricing");
    expect(switchPublicLocale("/fr/articles", "de")).toBe("/de/articles");
    expect(getPublicPageHref("en", "/pricing")).toBe("/pricing");
    expect(getPublicPageHref("pt", "/pricing")).toBe("/pt/pricing");
    expect(getPublicPageHref("en", "/pricing")).toBe("/pricing");
    expect(getPublicPageHref("pt", "/articles")).toBe("/pt/articles");
  });

  it("creates localized route wrappers that validate and set the request locale", () => {
    const localizedLayout = readPage("src/app/[locale]/layout.tsx");
    const localizedPricingPage = readPage("src/app/[locale]/pricing/page.tsx");
    const localizedHomePage = readPage("src/app/[locale]/page.tsx");
    const homePage = readPage("src/app/page.tsx");

    expect(localizedLayout).toContain("setRequestLocale");
    expect(localizedLayout).toContain("isPublicLocale");
    expect(localizedLayout).toContain('.filter((locale) => locale !== "en")');
    expect(localizedPricingPage).toContain("buildLocalizedWrapperMetadata");
    expect(localizedPricingPage).toContain('"/pricing"');
    expect(localizedHomePage).toContain("<HomePage locale={locale} />");
    expect(homePage).toContain("getPublicMessages");
    expect(homePage).toContain("locale?: PublicLocale");
  });

  it("routes shared chrome links through locale-aware helpers", () => {
    const chrome = readPage("src/components/site/chrome.tsx");
    const localizedHomePage = readPage("src/components/homepage/LocalizedHomePage.tsx");

    expect(chrome).toContain("LocaleSwitcher");
    expect(chrome).toContain("getPublicPageHref");
    expect(chrome).toContain("getPublicMessages");
    expect(localizedHomePage).toContain("copy.faq.items");
    expect(localizedHomePage).not.toContain("homepageFaqs.map");
  });

  it("keeps auth entry cross-links locale-aware", () => {
    const loginForm = readPage("src/app/login/LoginForm.tsx");
    const signupForm = readPage("src/app/signup/SignupForm.tsx");
    const loginShell = readPage("src/app/login/page.tsx");
    const signupShell = readPage("src/app/signup/page.tsx");
    const authHeaderLink = readPage("src/app/auth/AuthHeaderLink.tsx");

    expect(loginForm).toContain("getPublicPageHref");
    expect(signupForm).toContain("getPublicPageHref");
    expect(loginForm).toContain("usePathname");
    expect(signupForm).toContain("usePathname");
    expect(loginShell).toContain("AuthHeaderLink");
    expect(signupShell).toContain("AuthHeaderLink");
    expect(authHeaderLink).toContain("usePathname");
    expect(authHeaderLink).toContain("getPublicPageHref(locale, href)");
  });

  it("routes localized login paths to the real shared auth surface with safe next preservation", async () => {
    vi.resetModules();

    const originalWindow = globalThis.window;
    const hooks = createHookHarness();
    const signInWithOAuth = vi.fn().mockResolvedValue({ data: {}, error: null });
    globalThis.window = {
      location: {
        search: "?next=%2Fpricing",
        origin: "https://preview.pinkpepper.io",
      },
    } as Window & typeof globalThis;

    vi.doMock("next/navigation", () => ({
      usePathname: () => "/fr/login",
    }));
    vi.doMock("next/link", () => ({
      default: ({ children }: { children: unknown }) => children,
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
      const { default: LocalizedLoginPage } = await import("@/app/[locale]/login/page");
      const pageTree = LocalizedLoginPage();
      const formElement = findFunctionElementByName(pageTree, "LoginForm");

      expect(formElement).toBeTruthy();

      hooks.beginRender();
      (formElement?.type as (() => unknown) | undefined)?.();
      hooks.flushEffects();
      hooks.beginRender();
      const formTree = (formElement?.type as (() => unknown) | undefined)?.();
      const googleButton = findElement(
        formTree,
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
      globalThis.window = originalWindow;
      vi.doUnmock("next/navigation");
      vi.doUnmock("next/link");
      vi.doUnmock("@/utils/supabase/client");
      vi.doUnmock("react");
    }
  }, 15000);

  it("routes localized signup paths to the real shared auth surface with signup callback intent", async () => {
    vi.resetModules();

    const originalWindow = globalThis.window;
    const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const hooks = createHookHarness();
    const signInWithOAuth = vi.fn().mockResolvedValue({ data: {}, error: null });
    process.env.NEXT_PUBLIC_SITE_URL = "https://preview.pinkpepper.io";
    globalThis.window = {
      location: {
        search: "",
        origin: "https://preview.pinkpepper.io",
      },
    } as Window & typeof globalThis;

    vi.doMock("next/navigation", () => ({
      usePathname: () => "/pt/signup",
      useSearchParams: () => new URLSearchParams(),
    }));
    vi.doMock("next/link", () => ({
      default: ({ children }: { children: unknown }) => children,
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
      const { default: LocalizedSignupPage } = await import("@/app/[locale]/signup/page");
      const pageTree = LocalizedSignupPage();
      const formElement = findFunctionElementByName(pageTree, "SignupForm");

      expect(formElement).toBeTruthy();

      hooks.beginRender();
      (formElement?.type as (() => unknown) | undefined)?.();
      hooks.flushEffects();
      hooks.beginRender();
      const formTree = (formElement?.type as (() => unknown) | undefined)?.();
      const googleButton = findElement(
        formTree,
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
      globalThis.window = originalWindow;
      vi.doUnmock("next/navigation");
      vi.doUnmock("next/link");
      vi.doUnmock("@/utils/supabase/client");
      vi.doUnmock("react");
    }
  }, 15000);
});
