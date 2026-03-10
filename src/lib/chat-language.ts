import { defaultLocale, localeNames, locales, type Locale } from "@/i18n/config";

function isSupportedLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function resolvePreferredLocale(rawLocale?: string | null): Locale {
  if (!rawLocale) return defaultLocale;

  const normalized = rawLocale.trim().toLowerCase();
  if (!normalized) return defaultLocale;

  if (isSupportedLocale(normalized)) {
    return normalized;
  }

  const baseLocale = normalized.split("-")[0] ?? "";
  if (isSupportedLocale(baseLocale)) {
    return baseLocale;
  }

  return defaultLocale;
}

export function buildLanguageInstruction(rawLocale?: string | null): string {
  const locale = resolvePreferredLocale(rawLocale);
  return `Response language policy: respond in ${localeNames[locale]} (${locale}) for this user. If the user explicitly asks to switch language, honour that request.`;
}

