import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, locales, type Locale } from "./config";

const ROUTE_LOCALE_HEADER = "X-NEXT-INTL-LOCALE";

export function getRouteLocaleFromPathname(pathname: string): Locale | null {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return firstSegment && locales.includes(firstSegment as Locale)
    ? (firstSegment as Locale)
    : null;
}

export function resolveRequestLocale(input: {
  routeLocale?: string | null;
  cookieLocale?: string | null;
}): Locale {
  if (input.routeLocale && locales.includes(input.routeLocale as Locale)) {
    return input.routeLocale as Locale;
  }

  if (input.cookieLocale && locales.includes(input.cookieLocale as Locale)) {
    return input.cookieLocale as Locale;
  }

  return defaultLocale;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const raw = cookieStore.get("locale")?.value;
  const routeLocale =
    headerStore.get(ROUTE_LOCALE_HEADER) ??
    (await requestLocale);
  const locale = resolveRequestLocale({ routeLocale, cookieLocale: raw });
  const messages = (await import(`./messages/${locale}.json`)).default;
  return { locale, messages };
});
