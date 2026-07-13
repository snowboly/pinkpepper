import { publicLaunchLocales } from "@/i18n/public";

export const PUBLIC_PATHNAME_HEADER = "x-public-pathname";

const PUBLIC_ANALYTICS_PREFIXES = [
  "/",
  "/about",
  "/ai-food-safety-consultant",
  "/articles",
  "/compare",
  "/contact",
  "/faqs",
  "/features",
  "/human-review",
  "/legal",
  "/methodology",
  "/pricing",
  "/regulations-covered",
  "/resources",
  "/security",
  "/use-cases",
] as const;

function normalizePathname(pathname: string): string {
  if (!pathname.startsWith("/")) {
    return `/${pathname}`;
  }

  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];

  if (maybeLocale && publicLaunchLocales.includes(maybeLocale as (typeof publicLaunchLocales)[number])) {
    const localizedPath = `/${segments.slice(1).join("/")}`;
    return localizedPath === "/" ? "/" : localizedPath.replace(/\/$/, "") || "/";
  }

  return pathname === "/" ? "/" : pathname.replace(/\/$/, "") || "/";
}

export function shouldInjectGoogleAnalytics(pathname: string): boolean {
  const normalizedPath = normalizePathname(pathname);

  if (normalizedPath === "/login" || normalizedPath === "/signup") return false;
  if (normalizedPath.startsWith("/admin")) return false;
  if (normalizedPath.startsWith("/api")) return false;
  if (normalizedPath.startsWith("/auth")) return false;
  if (normalizedPath.startsWith("/dashboard")) return false;
  if (normalizedPath.startsWith("/forgot-password")) return false;
  if (normalizedPath.startsWith("/update-password")) return false;

  return PUBLIC_ANALYTICS_PREFIXES.some((prefix) =>
    prefix === "/"
      ? normalizedPath === "/"
      : normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );
}
