import { publicLaunchLocales, type PublicLocale } from "@/i18n/public";

export function isPublicLocale(value: string): value is PublicLocale {
  return publicLaunchLocales.includes(value as PublicLocale);
}

export function localizePublicPath(locale: PublicLocale, path: string) {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
