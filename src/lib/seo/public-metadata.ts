import type { Metadata } from "next";
import { publicLaunchLocales, type PublicLocale } from "@/i18n/public";
import { localizePublicPath } from "@/lib/public-routes";

const BASE_URL = "https://pinkpepper.io";

const ogLocaleMap: Record<PublicLocale, string> = {
  en: "en_GB",
  fr: "fr_FR",
  de: "de_DE",
  pt: "pt_PT",
};

type PublicMetadataInput = {
  title: string;
  description: string;
};

export function buildPublicMetadata(
  locale: PublicLocale,
  path: string,
  copy: PublicMetadataInput,
): Metadata {
  const canonicalPath = localizePublicPath(locale, path);
  const enPath = `${BASE_URL}${localizePublicPath("en", path)}`;

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: `${BASE_URL}${canonicalPath}`,
      languages: {
        "x-default": enPath,
        ...Object.fromEntries(
          publicLaunchLocales.map((lang) => [lang, `${BASE_URL}${localizePublicPath(lang, path)}`]),
        ),
      },
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      locale: ogLocaleMap[locale],
      alternateLocale: publicLaunchLocales.filter((l) => l !== locale).map((l) => ogLocaleMap[l]),
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

/** For pages that are English-only (no [locale] route yet). */
export function buildEnOnlyMetadata(path: string, copy: PublicMetadataInput): Metadata {
  const url = `${BASE_URL}${path}`;
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: url,
      languages: { "x-default": url, en: url },
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      locale: "en_GB",
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

const DEFAULT_OG_IMAGE = {
  url: `${BASE_URL}/social-card.png`,
  width: 1200,
  height: 630,
  alt: "PinkPepper - AI Food Safety Compliance Software for EU and UK Businesses",
};
