"use client";

export function resolveBrowserAuthOrigin() {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function buildBrowserAuthCallbackUrl({
  origin,
  next,
  flow,
}: {
  origin: string;
  next: string;
  flow?: "signup";
}) {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("next", next);
  if (flow) {
    url.searchParams.set("flow", flow);
  }
  return url.toString();
}

export function buildGoogleOAuthOptions({
  origin,
  next,
  flow,
}: {
  origin: string;
  next: string;
  flow?: "signup";
}) {
  return {
    provider: "google" as const,
    options: {
      redirectTo: buildBrowserAuthCallbackUrl({ origin, next, flow }),
    },
  };
}
