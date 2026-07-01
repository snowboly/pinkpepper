import articleManifest from "../../content/articles/manifest.json";
import deArticleManifest from "../../content/articles/de/manifest.json";
import frArticleManifest from "../../content/articles/fr/manifest.json";
import ptArticleManifest from "../../content/articles/pt/manifest.json";
import { isArticlePreferredForIndexing } from "@/lib/article-indexing";
import type { PublicLocale } from "@/i18n/public";

export type IndexedArticleSummary = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  image?: string;
  source?: string;
};

const englishArticleManifest = articleManifest as IndexedArticleSummary[];
const localizedArticleManifests: Record<Exclude<PublicLocale, "en">, IndexedArticleSummary[]> = {
  de: deArticleManifest as IndexedArticleSummary[],
  fr: frArticleManifest as IndexedArticleSummary[],
  pt: ptArticleManifest as IndexedArticleSummary[],
};

export function getEnglishArticleSummaries() {
  return englishArticleManifest;
}

export function getIndexableEnglishArticleSummaries() {
  return englishArticleManifest.filter(isArticlePreferredForIndexing);
}

export function getLocalizedArticleSummaries(locale: Exclude<PublicLocale, "en">) {
  return localizedArticleManifests[locale];
}
