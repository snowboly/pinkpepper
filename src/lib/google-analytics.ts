import { publicLaunchLocales } from "@/i18n/public";
import { LEGAL_LOCALES } from "@/lib/legal/config";

export const PUBLIC_PATHNAME_HEADER = "x-public-pathname";

const PUBLIC_ANALYTICS_PREFIXES = ["/", "/about", "/ai-food-safety-consultant", "/articles", "/compare", "/contact", "/faqs", "/features", "/human-review", "/methodology", "/pricing", "/regulations-covered", "/resources", "/security", "/use-cases"] as const;

function stripTrailingSlash(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function normalizePathname(pathname: string): string {
  const absolutePath = pathname.startsWith("/") ? pathname : "/" + pathname;
  const segments = absolutePath.split("/").filter(Boolean);
  const maybeLocale = segments[0];
  if (maybeLocale && (publicLaunchLocales.includes(maybeLocale as (typeof publicLaunchLocales)[number]) || (LEGAL_LOCALES as readonly string[]).includes(maybeLocale))) {
    return stripTrailingSlash("/" + segments.slice(1).join("/")) || "/";
  }
  return stripTrailingSlash(absolutePath) || "/";
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
  if (normalizedPath === "/legal" || normalizedPath.startsWith("/legal/")) return false;
  return PUBLIC_ANALYTICS_PREFIXES.some((prefix) => prefix === "/" ? normalizedPath === "/" : normalizedPath === prefix || normalizedPath.startsWith(prefix + "/"));
}
