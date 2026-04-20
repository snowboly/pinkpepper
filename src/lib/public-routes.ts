import { publicLaunchLocales, publicRoutePaths, type PublicLocale } from "@/i18n/public";

type PublicMessages = Record<string, unknown>;
export type PublicMessagesDictionary = {
  chrome: {
    nav: {
      resources: string;
      freeTemplates: string;
      articles: string;
      faqs: string;
      pricing: string;
      about: string;
      contact: string;
      login: string;
      getStarted: string;
    };
    footer: {
      brandBlurb: string;
      productHeading: string;
      resourcesHeading: string;
      legalHeading: string;
      createAccount: string;
      contactSupport: string;
      security: string;
      terms: string;
      privacy: string;
      cookies: string;
      dpa: string;
      acceptableUse: string;
      refund: string;
      rightsReserved: string;
    };
    localeSwitcher: {
      label: string;
      current: string;
    };
  };
};

export function isPublicLocale(value: string): value is PublicLocale {
  return publicLaunchLocales.includes(value as PublicLocale);
}

export function localizePublicPath(locale: PublicLocale, path: string) {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function getPublicPageHref(locale: PublicLocale, path: string) {
  return publicRoutePaths.includes(path as (typeof publicRoutePaths)[number])
    ? localizePublicPath(locale, path)
    : path;
}

export function switchPublicLocale(currentPath: string, locale: PublicLocale) {
  const segments = currentPath.split("/").filter(Boolean);
  const hasLocalePrefix = segments.length > 0 && isPublicLocale(segments[0] ?? "");
  const pathWithoutLocale = hasLocalePrefix
    ? `/${segments.slice(1).join("/")}` || "/"
    : currentPath || "/";

  return getPublicPageHref(locale, pathWithoutLocale);
}

function mergeMessages(base: PublicMessages, override: PublicMessages): PublicMessages {
  const merged: PublicMessages = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const baseValue = merged[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      baseValue &&
      typeof baseValue === "object" &&
      !Array.isArray(baseValue)
    ) {
      merged[key] = mergeMessages(baseValue as PublicMessages, value as PublicMessages);
      continue;
    }

    merged[key] = value;
  }

  return merged;
}

export async function getPublicMessages(locale: PublicLocale): Promise<PublicMessagesDictionary> {
  const english = (await import("@/i18n/messages/public/en.json")).default as PublicMessagesDictionary;
  if (locale === "en") {
    return english;
  }

  const localized = (await import(`@/i18n/messages/public/${locale}.json`)).default as PublicMessages;
  return mergeMessages(english as PublicMessages, localized) as PublicMessagesDictionary;
}
