import type { Metadata } from "next";
import { publicLaunchLocales, type PublicLocale } from "@/i18n/public";
import { localizePublicPath } from "@/lib/public-routes";

const BASE_URL = "https://www.pinkpepper.io";

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

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: `${BASE_URL}${canonicalPath}`,
      languages: Object.fromEntries(
        publicLaunchLocales.map((lang) => [lang, `${BASE_URL}${localizePublicPath(lang, path)}`]),
      ),
    },
  };
}
