import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { publicLaunchLocales } from "@/i18n/public";
import { getArticleBySlug, getArticleManifest, localizedSeoPriorityArticleSlugs } from "@/lib/articles";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("localized SEO priority articles", () => {
  it("defines the SEO priority article set for localization", () => {
    expect(localizedSeoPriorityArticleSlugs).toEqual([
      "how-to-create-a-haccp-plan-step-by-step",
      "how-to-perform-a-hazard-analysis-correctly",
      "identifying-critical-control-points-in-food-safety",
      "haccp-ccp-examples-uk-eu",
      "temperature-control-in-haccp-limits-and-monitoring",
      "allergen-management-within-haccp-plans",
      "cooling-and-reheating-haccp-high-risk-steps",
      "haccp-monitoring-record-templates",
      "top-reasons-haccp-plans-fail-during-audits",
      "haccp-vs-brcgs-vs-ifs",
    ]);
  });

  it("loads localized manifests and article bodies for every launch content locale", async () => {
    for (const locale of publicLaunchLocales.filter((locale) => locale !== "en")) {
      const manifest = await getArticleManifest({ locale });

      expect(manifest.map((article) => article.slug)).toEqual(localizedSeoPriorityArticleSlugs);

      for (const slug of localizedSeoPriorityArticleSlugs) {
        const article = await getArticleBySlug(slug, { locale });

        expect(article?.locale).toBe(locale);
        expect(article?.slug).toBe(slug);
        expect(article?.title).toBeTruthy();
        expect(article?.excerpt.length).toBeGreaterThan(90);
        expect(article?.body).toContain("<h2>");
        expect(article?.body).not.toContain("appliquér");
        expect(article?.body).not.toContain("This article is available in English");
      }
    }
  });

  it("adds localized article detail routes and SEO discovery", () => {
    const localizedArticlePage = readPage("src/app/[locale]/articles/[slug]/page.tsx");
    const articlePage = readPage("src/app/articles/[slug]/page.tsx");
    const sitemap = readPage("src/app/sitemap.ts");

    expect(localizedArticlePage).toContain("generateStaticParams");
    expect(localizedArticlePage).toContain("generateArticleMetadata");
    expect(localizedArticlePage).toContain("<ArticleDetailPage");
    expect(articlePage).toContain("buildArticleLanguageAlternates");
    expect(sitemap).toContain("getLocalizedArticleManifest");
    expect(sitemap).toContain("${BASE_URL}/${locale}/articles/${article.slug}");
  });
});
