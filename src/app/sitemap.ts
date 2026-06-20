import { MetadataRoute } from "next";
import {
  getIndexableEnglishArticleSummaries,
  getLocalizedArticleSummaries,
} from "@/lib/article-index-feed";
import { publicContentRoutePaths, publicLaunchLocales } from "@/i18n/public";
import { localizePublicPath } from "@/lib/public-routes";
import { resourceEntries } from "@/lib/resources";

const BASE_URL = "https://pinkpepper.io";
const SITE_REFRESHED_AT = "2026-06-18";
const MARKETING_REFRESHED_AT = "2026-06-18";
const USE_CASES_REFRESHED_AT = "2026-05-16";
const LEGAL_REFRESHED_AT = "2026-04-15";

const useCasePaths = [
  "/use-cases",
  "/use-cases/restaurants",
  "/use-cases/cafes",
  "/use-cases/catering",
  "/use-cases/food-manufacturing",
] as const;

const legalPaths = ["/legal/terms", "/legal/privacy"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = getIndexableEnglishArticleSummaries();
  const localizedArticles = publicLaunchLocales
    .filter((locale) => locale !== "en")
    .map((locale) => ({
      locale,
      articles: getLocalizedArticleSummaries(locale),
    }));

  const localizedPublicEntries = publicContentRoutePaths.flatMap((path) =>
    publicLaunchLocales.filter((locale) => locale !== "en").map((locale) => ({
      url: `${BASE_URL}${localizePublicPath(locale, path)}`,
      lastModified: new Date(MARKETING_REFRESHED_AT),
      changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 0.9 : 0.7,
    })),
  );

  const englishPublicEntries = publicContentRoutePaths
    .filter((path) => path !== "/")
    .map((path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(MARKETING_REFRESHED_AT),
      changeFrequency: path === "/articles" ? ("weekly" as const) : ("monthly" as const),
      priority:
        path === "/pricing"
          ? 0.9
          : path === "/about" || path === "/features/haccp-plan-generator"
            ? 0.8
            : 0.7,
    }));

  return [
    { url: BASE_URL, lastModified: new Date(SITE_REFRESHED_AT), changeFrequency: "weekly", priority: 1 },
    ...englishPublicEntries,
    ...localizedPublicEntries,
    { url: `${BASE_URL}/resources`, lastModified: new Date(SITE_REFRESHED_AT), changeFrequency: "weekly", priority: 0.8 },
    ...resourceEntries.map((resource) => ({
      url: `${BASE_URL}${resource.href}`,
      lastModified: new Date(resource.updatedAt),
      changeFrequency: "monthly" as const,
      priority:
        resource.href === "/resources/haccp-plan-template" ||
        resource.href === "/resources/food-safety-document-checklist"
          ? 0.8
          : 0.7,
    })),
    ...useCasePaths.map((path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(USE_CASES_REFRESHED_AT),
      changeFrequency: "monthly" as const,
      priority: path === "/use-cases" ? 0.8 : 0.7,
    })),
    ...articles.map((article) => ({
      url: `${BASE_URL}/articles/${article.slug}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...localizedArticles.flatMap(({ locale, articles: localized }) =>
      localized.map((article) => ({
        url: `${BASE_URL}/${locale}/articles/${article.slug}`,
        lastModified: new Date(article.publishedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ),
    { url: `${BASE_URL}/security`, lastModified: new Date(MARKETING_REFRESHED_AT), changeFrequency: "monthly", priority: 0.7 },
    ...legalPaths.map((path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(LEGAL_REFRESHED_AT),
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
