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

      expect(
        manifest
          .map((article) => article.slug)
          .filter((slug) => localizedSeoPriorityArticleSlugs.includes(
            slug as (typeof localizedSeoPriorityArticleSlugs)[number],
          )),
      ).toEqual(localizedSeoPriorityArticleSlugs);

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

  it("publishes the complete German step-by-step HACCP guide", async () => {
    const manifest = await getArticleManifest({ locale: "de" });
    const article = await getArticleBySlug("how-to-create-a-haccp-plan-step-by-step", {
      locale: "de",
    });
    const summary = manifest.find(
      (candidate) => candidate.slug === "how-to-create-a-haccp-plan-step-by-step",
    );

    expect(article?.title).toBe("HACCP-Plan erstellen: 12 Schritte + Beispiel (2026)");
    expect(summary?.title).toBe(article?.title);
    expect(article?.excerpt.length).toBeGreaterThanOrEqual(145);
    expect(article?.excerpt.length).toBeLessThanOrEqual(165);
    expect(article?.body.length).toBeGreaterThan(10_000);
    expect(article?.body).toContain("Artikel 5 der Verordnung (EG) Nr. 852/2004");
    expect(article?.body).toContain("<table>");
    expect(article?.body).toContain("Validierung");
    expect(article?.body).toContain("Verifizierung");
    expect(article?.body).toContain(
      'href="https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32004R0852"',
    );
    expect(article?.body).toContain('href="/de/features/haccp-plan-generator"');
    expect(article?.body).not.toContain("<strong>Mindestens einmal jährlich</strong>");
    expect(article?.body).not.toContain("jede zweite Charge");
  });

  it("publishes the German HACCP process flow diagram guide", async () => {
    const manifest = await getArticleManifest({ locale: "de" });
    const article = await getArticleBySlug("building-a-haccp-process-flow-diagram", {
      locale: "de",
    });
    const summary = manifest.find(
      (candidate) => candidate.slug === "building-a-haccp-process-flow-diagram",
    );

    expect(article?.title).toBe("HACCP-Flussdiagramm erstellen: Prozessablauf für sichere Audits");
    expect(summary?.title).toBe(article?.title);
    expect(article?.publishedAt).toBe("2025-11-29");
    expect(article?.image).toContain("images.pexels.com/photos/5953663/");
    expect(article?.source).toBe("pinkpepper-localized");
    expect(article?.excerpt.length).toBeGreaterThanOrEqual(145);
    expect(article?.excerpt.length).toBeLessThanOrEqual(165);
    expect(article?.body).toContain("<h2>Was ein HACCP-Flussdiagramm zeigen muss</h2>");
    expect(article?.body).toContain("Nacharbeit");
    expect(article?.body).toContain("vor Ort");
    expect(article?.body).toContain('href="/resources/haccp-plan-template"');
    expect(article?.body).toContain('href="/de/features/haccp-plan-generator"');
    expect(article?.body).toContain(
      'href="/articles/correcting-non-conformities-in-haccp"',
    );
    expect(article?.body).not.toContain("example.com");
    expect(article?.body).not.toContain("EU-Verordnung 2021/382");
    expect(article?.body).not.toContain("Automatische CCP-Erkennung");
    expect(article?.body).not.toContain("```mermaid");
  });

  it("adds localized article detail routes and SEO discovery", () => {
    const localizedArticlePage = readPage("src/app/[locale]/articles/[slug]/page.tsx");
    const localizedArticlesHub = readPage("src/app/[locale]/articles/page.tsx");
    const articlesHub = readPage("src/app/articles/page.tsx");
    const articlePage = readPage("src/app/articles/[slug]/page.tsx");
    const sitemap = readPage("src/app/sitemap.ts");

    expect(localizedArticlePage).toContain("generateStaticParams");
    expect(localizedArticlePage).toContain("generateArticleMetadata");
    expect(localizedArticlePage).toContain("<ArticleDetailPage");
    expect(localizedArticlesHub).toContain("<ArticlesPage locale={locale} />");
    expect(articlesHub).toContain("function getArticleHref");
    expect(articlesHub).toContain('locale === "en" || !localizedSlugs.has(slug)');
    expect(articlesHub).toContain('return `/articles/${slug}`;');
    expect(articlesHub).toContain('return `/${locale}/articles/${slug}`;');
    expect(articlePage).toContain("buildArticleLanguageAlternates");
    expect(articlePage).toContain("Nächster Schritt");
    expect(articlePage).toContain("Weitere Artikel");
    expect(articlePage).toContain("Weiterlesen");
    expect(articlePage).toContain("Zurück zur Artikelübersicht");
    expect(sitemap).toContain("getLocalizedArticleManifest");
    expect(sitemap).toContain("${BASE_URL}/${locale}/articles/${article.slug}");
  });
});
