import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, locales, type Locale } from "./config";

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

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get("locale")?.value;
  const locale = resolveRequestLocale({ cookieLocale: raw });
  const messages = (await import(`./messages/${locale}.json`)).default;
  return { locale, messages };
});
