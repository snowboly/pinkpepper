import { publicLaunchLocales, type PublicLocale } from "@/i18n/public";

type PublicMessages = Record<string, unknown>;
export type PublicMessagesDictionary = {
  chrome: {
    nav: {
      pricing: string;
      about: string;
    };
  };
};

export function isPublicLocale(value: string): value is PublicLocale {
  return publicLaunchLocales.includes(value as PublicLocale);
}

export function localizePublicPath(locale: PublicLocale, path: string) {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
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
