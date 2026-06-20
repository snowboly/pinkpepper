import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { generateArticleMetadata } from "@/app/articles/[slug]/page";
import { buildPublicMetadata } from "@/lib/seo/public-metadata";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

async function renderArticlesPageForTest(
  mockArticles = [
    {
      title: "Thermometer Checks for Small Kitchens",
      slug: "thermometer-checks-small-kitchens",
      excerpt: "Probe use, calibration, and daily checks for small teams.",
      category: "Operations",
      publishedAt: "2026-04-01",
      image: "https://images.example.com/thermometer.jpg",
    },
    {
      title: "Allergen Updates Before Service",
      slug: "allergen-updates-before-service",
      excerpt: "How to keep substitutions and allergen information current.",
      category: "Allergens",
      publishedAt: "2026-04-02",
    },
  ],
) {
  vi.resetModules();
  vi.doMock("@/lib/articles", () => ({
    getArticleManifest: vi.fn().mockResolvedValue(mockArticles),
  }));
  vi.doMock("next/image", () => ({
    default: (props: Record<string, unknown>) => {
      const rest = { ...props };
      delete rest.fill;
      return createElement("img", rest);
    },
  }));
  vi.doMock("next/link", () => ({
    default: ({ href, children, ...props }: { href: string; children?: ReactNode } & Record<string, unknown>) =>
      createElement("a", { href, ...props }, children),
  }));

  const articlesPageModule = await import("@/app/articles/page");
  const ArticlesPage = articlesPageModule.default;
  return renderToStaticMarkup(await ArticlesPage());
}

async function renderArticleDetailPageForTest() {
  vi.resetModules();
  vi.doMock("@/lib/articles", () => ({
    getArticleBySlug: vi.fn().mockResolvedValue({
      title: "Cooling and Reheating in HACCP: The High-Risk Steps Operators Miss",
      slug: "cooling-and-reheating-haccp-high-risk-steps",
      excerpt: "A practical guide to cooling and reheating controls in HACCP.",
      category: "Operations",
      publishedAt: "2025-12-25",
      body: "<h2>Cooling and Reheating</h2><p>Body copy</p>",
      image: "https://images.example.com/cooling.jpg",
    }),
    getArticleManifest: vi.fn().mockResolvedValue([
      {
        title: "Cooling and Reheating in HACCP: The High-Risk Steps Operators Miss",
        slug: "cooling-and-reheating-haccp-high-risk-steps",
        excerpt: "A practical guide to cooling and reheating controls in HACCP.",
        category: "Operations",
        publishedAt: "2025-12-25",
        image: "https://images.example.com/cooling.jpg",
      },
      {
        title: "Temperature Control in HACCP: Limits and Monitoring",
        slug: "temperature-control-in-haccp-limits-and-monitoring",
        excerpt: "The main temperature control guide.",
        category: "Operations",
        publishedAt: "2025-12-27",
      },
      {
        title: "How to Build a HACCP Process Flow Diagram",
        slug: "building-a-haccp-process-flow-diagram",
        excerpt: "Build a stronger process map.",
        category: "Compliance",
        publishedAt: "2025-11-29",
      },
      {
        title: "HACCP Checklist for New Food Businesses",
        slug: "haccp-checklist-for-new-food-businesses",
        excerpt: "Launch-ready checklist.",
        category: "Compliance",
        publishedAt: "2025-10-19",
      },
    ]),
    isArticlePreferredForIndexing: vi.fn().mockReturnValue(true),
  }));
  vi.doMock("@/lib/article-content", () => ({
    processArticleContent: vi.fn().mockReturnValue({
      processedContent: "<h2>Cooling and Reheating</h2><p>Body copy</p>",
    }),
  }));
  vi.doMock("next/image", () => ({
    default: (props: Record<string, unknown>) => createElement("img", props),
  }));
  vi.doMock("next/link", () => ({
    default: ({ href, children, ...props }: { href: string; children?: ReactNode } & Record<string, unknown>) =>
      createElement("a", { href, ...props }, children),
  }));

  const articleDetailPageModule = await import("@/app/articles/[slug]/page");
  const ArticleDetailPage = articleDetailPageModule.default;
  return renderToStaticMarkup(
    await ArticleDetailPage({
      params: Promise.resolve({ slug: "cooling-and-reheating-haccp-high-risk-steps" }),
    }),
  );
}

function expectLink(markup: string, href: string, label?: string) {
  expect(markup).toContain(`href="${href}"`);
  if (label) expect(markup).toContain(label);
}

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("SEO surface", () => {
  it("builds locale alternates for phase-1 public pages", () => {
    const metadata = buildPublicMetadata("fr", "/pricing", {
      title: "Tarifs",
      description: "Description",
    });
    const englishMetadata = buildPublicMetadata("en", "/pricing", {
      title: "Pricing",
      description: "Description",
    });

    expect(metadata.alternates?.canonical).toBe("https://pinkpepper.io/fr/pricing");
    expect(metadata.alternates?.languages).toEqual({
      "x-default": "https://pinkpepper.io/pricing",
      en: "https://pinkpepper.io/pricing",
      fr: "https://pinkpepper.io/fr/pricing",
      de: "https://pinkpepper.io/de/pricing",
      pt: "https://pinkpepper.io/pt/pricing",
    });
    expect(englishMetadata.alternates?.canonical).toBe("https://pinkpepper.io/pricing");
    expect(englishMetadata.alternates?.languages).toEqual({
      "x-default": "https://pinkpepper.io/pricing",
      en: "https://pinkpepper.io/pricing",
      fr: "https://pinkpepper.io/fr/pricing",
      de: "https://pinkpepper.io/de/pricing",
      pt: "https://pinkpepper.io/pt/pricing",
    });
  });

  it("uses the Phase 1 compliance software positioning in shared metadata", () => {
    const layout = readPage("src/app/layout.tsx");

    expect(layout).toContain("AI Food Safety Compliance Software");
    expect(layout).toContain("EU and UK food businesses");
  });

  it("points social metadata at a dedicated static social card", () => {
    const layout = readPage("src/app/layout.tsx");

    expect(layout).toContain('url: "https://pinkpepper.io/social-card.png"');
    expect(layout).toContain("width: 1200");
    expect(layout).toContain("height: 630");
    expect(layout).toContain('images: ["https://pinkpepper.io/social-card.png"]');
    expect(layout).toContain('title: "PinkPepper | AI Food Safety Compliance Software - EU & UK"');
    expect(layout).toContain(
      "AI food safety compliance software for EU and UK food businesses. Generate HACCP plans, SOPs, allergen documentation, and practical compliance records faster."
    );
  });

  it("allows article imagery from the configured external sources", () => {
    // next/image remote patterns still live in next.config.ts; the CSP
    // img-src allowlist moved to src/lib/security/csp.ts when CSP became
    // per-request (middleware generates a nonce per response).
    const nextConfig = readPage("next.config.ts");
    const csp = readPage("src/lib/security/csp.ts");

    expect(nextConfig).toContain('hostname: "images.unsplash.com"');
    expect(nextConfig).toContain('hostname: "images.pexels.com"');
    expect(csp).toContain("img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com https://images.pexels.com");
  });

  it("includes public marketing pages and excludes auth/dashboard routes from sitemap and robots", async () => {
    const entries = (await sitemap()).map((entry) => entry.url);
    const robotRules = robots().rules;
    const robotRuleList = Array.isArray(robotRules) ? robotRules : [robotRules];
    const disallowLists = robotRuleList.flatMap((rule) => {
      const { disallow } = rule;
      return Array.isArray(disallow) ? disallow : disallow ? [disallow] : [];
    });

    expect(entries).toContain("https://pinkpepper.io/resources");
    expect(entries).toContain("https://pinkpepper.io/fr");
    expect(entries).toContain("https://pinkpepper.io/pt/pricing");
    expect(entries).toContain("https://pinkpepper.io/de/features/haccp-plan-generator");
    expect(entries).toContain("https://pinkpepper.io/features/haccp-plan-generator");
    expect(entries).toContain("https://pinkpepper.io/methodology");
    expect(entries).toContain("https://pinkpepper.io/human-review");
    expect(entries).toContain("https://pinkpepper.io/regulations-covered");
    expect(entries).toContain("https://pinkpepper.io/compare/pinkpepper-vs-consultant");
    expect(entries).toContain("https://pinkpepper.io/use-cases/restaurants");
    expect(entries).toContain("https://pinkpepper.io/articles/identifying-critical-control-points-in-food-safety");
    expect(entries).not.toContain("https://pinkpepper.io/login");
    expect(entries).not.toContain("https://pinkpepper.io/dashboard");
    expect(entries).not.toContain("https://pinkpepper.io/legal/cookies");
    expect(entries).not.toContain("https://pinkpepper.io/legal/dpa");
    expect(entries).not.toContain("https://pinkpepper.io/legal/refund");
    expect(entries).not.toContain("https://pinkpepper.io/articles/haccp-for-meal-prep-services-eu");
    expect(robots().sitemap).toBe("https://pinkpepper.io/sitemap.xml");
    expect(disallowLists).toEqual(
      expect.arrayContaining(["/dashboard/", "/admin/", "/api/", "/auth/"]),
    );
  });
});

describe("public SEO copy and linking", () => {
  it("aligns the homepage with the compliance software category narrative", () => {
    const homepage = readPage("src/app/page.tsx");
    const heroChatForm = readPage("src/components/homepage/HeroChatForm.tsx");
    const demoTabSwitcher = readPage("src/components/homepage/DemoTabSwitcher.tsx");

    expect(homepage).toContain("AI food safety compliance software");
    expect(homepage).toContain("/features/haccp-plan-generator");
    expect(homepage).toContain("/pricing");
    expect(heroChatForm).toContain("data-nosnippet");
    expect(demoTabSwitcher).toContain("data-nosnippet");
    expect(homepage).not.toContain("Ã¢â‚¬");
    expect(homepage).not.toContain("Ã¢â‚¬â„¢");
    expect(homepage).not.toContain("Ã¢â‚¬â€œ");
    expect(homepage).not.toContain("ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â");
    expect(homepage).not.toContain("ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢");
    expect(homepage).not.toContain("ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬");
  });

  it("routes core public pages into deeper commercial paths", () => {
    const pricing = readPage("src/app/pricing/page.tsx");
    const about = readPage("src/app/about/page.tsx");
    const security = readPage("src/app/security/page.tsx");
    const contact = readPage("src/app/contact/page.tsx");
    const resources = readPage("src/app/resources/page.tsx");
    const chrome = readPage("src/components/site/chrome.tsx");

    expect(pricing).toContain("/features/");
    expect(about).toContain("/pricing");
    expect(about).toContain("/methodology");
    expect(about).toContain("/human-review");
    expect(pricing).toContain("/human-review");
    expect(security).toContain("/pricing");
    expect(contact).toContain("/features/");
    expect(resources).toContain("/features/");
    expect(chrome).toContain('"/use-cases"');
    expect(about).not.toContain("ilovehaccp.com");
    expect(about).not.toContain("Part of the iLoveHACCP family");
    expect(about).toContain("How PinkPepper is built");
    expect(about).toContain("Where human review still matters");
  });

  it("renders the articles hub as a curated resource page with key route links", async () => {
    const markup = await renderArticlesPageForTest();

    expect(markup).toContain("resource hub");
    expect(markup).toContain("operational compliance");
    expect(markup).toContain("/use-cases");
    expect(markup).toContain("Browse by cluster");
  });

  it("renders article cards with article links and fallback imagery", async () => {
    const markup = await renderArticlesPageForTest();

    expectLink(markup, "/articles/thermometer-checks-small-kitchens", "Thermometer Checks for Small Kitchens");
    expectLink(markup, "/articles/allergen-updates-before-service", "Allergen Updates Before Service");
    expect(markup).toContain('src="https://images.example.com/thermometer.jpg"');
    expect(markup).toContain('alt="Thermometer Checks for Small Kitchens"');
    expect(markup).toContain("Article image coming soon");
  });

  it("caps the initial library render and defers the remaining article cards", async () => {
    const manyArticles = Array.from({ length: 30 }, (_, index) => ({
      title: `Article ${index + 1}`,
      slug: `article-${index + 1}`,
      excerpt: `Excerpt ${index + 1}`,
      category: "Operations",
      publishedAt: `2026-04-${String(index + 1).padStart(2, "0")}`,
    }));

    const markup = await renderArticlesPageForTest(manyArticles);

    expect(markup).toContain("Article 1");
    expect(markup).toContain("Article 24");
    expect(markup).not.toContain("Article 25");
    expect(markup).toContain("Show the remaining 6 articles");
  });

  it("tightens the public article detail hero hierarchy", () => {
    const articleDetail = readPage("src/app/articles/[slug]/page.tsx");

    expect(articleDetail).toContain("pp-article-hero-meta");
    expect(articleDetail).toContain("text-4xl font-bold leading-[1.05]");
    expect(articleDetail).toContain("text-lg leading-8");
    expect(articleDetail).toContain("https://pinkpepper.io/articles/${slug}");
    expect(articleDetail).toContain("https://pinkpepper.io/${locale}/articles/${slug}");
    expect(articleDetail).not.toContain("https://www.pinkpepper.io/articles");
  });

  it("renders related reading links on article detail pages", async () => {
    const markup = await renderArticleDetailPageForTest();

    expect(markup).toContain("Related reading");
    expect(markup).toContain("Keep building the same cluster");
    expect(markup).toContain('href="/articles/temperature-control-in-haccp-limits-and-monitoring"');
    expect(markup).toContain('href="/articles/building-a-haccp-process-flow-diagram"');
    expect(markup).toContain('href="/articles/haccp-checklist-for-new-food-businesses"');
    expect(markup).toContain('href="/articles"');
  });

  it("expands scoped article-body typography without touching dashboard markdown", () => {
    const articleDetail = readPage("src/app/articles/[slug]/page.tsx");
    const globals = readPage("src/app/globals.css");

    expect(articleDetail).toContain("pp-article-body");
    expect(globals).toContain(".pp-article-body h2");
    expect(globals).toContain(".pp-article-body strong");
    expect(globals).toContain("font-weight: 700");
    expect(globals).toContain(".pp-article-body ul {");
    expect(globals).toContain("list-style-type: disc;");
    expect(globals).toContain(".pp-article-body ol {");
    expect(globals).toContain("list-style-type: decimal;");
    expect(globals).toContain(".pp-article-body a {");
    expect(globals).toContain("text-decoration-line: underline;");
    expect(globals).toContain(".pp-article-body table {");
    expect(globals).toContain("border-collapse: collapse;");
    expect(globals).toContain(".pp-article-body blockquote");
    expect(globals).toContain(".pp-article-body figure");
    expect(globals).toContain(".pp-article-body img");
    expect(globals).toContain(".pp-markdown strong");
  });

  it("keeps hub-page copy user-facing instead of talking about SEO strategy", () => {
    const resources = readPage("src/app/resources/page.tsx");

    expect(resources).not.toContain("long-tail questions and template searches");
  });

  it("biases homepage article links toward cleaned evergreen pages", () => {
    const randomLinks = readPage("src/components/homepage/RandomArticleLinks.tsx");

    expect(randomLinks).toContain("/articles/building-a-haccp-process-flow-diagram");
    expect(randomLinks).toContain("/articles/haccp-ccp-examples-uk-eu");
    expect(randomLinks).toContain("/resources/haccp-plan-template");
    expect(randomLinks).not.toContain("/articles/cooling-and-reheating-haccp-high-risk-steps");
    expect(randomLinks).not.toContain("/articles/correcting-non-conformities-in-haccp");
  });

  it("surfaces priority under-indexed URLs from the homepage and article hub", () => {
    const homepage = readPage("src/app/page.tsx");
    const articlesHub = readPage("src/app/articles/page.tsx");
    const resources = readPage("src/app/resources/page.tsx");

    expect(homepage).toContain("/about");
    expect(homepage).toContain("/articles/building-a-haccp-process-flow-diagram");
    expect(homepage).toContain("/articles/haccp-ccp-examples-uk-eu");
    expect(homepage).toContain("/use-cases");

    expect(articlesHub).toContain("/articles/building-a-haccp-process-flow-diagram");
    expect(articlesHub).toContain("/articles/how-to-import-food-into-great-britain-from-non-eu-countries");
    expect(articlesHub).toContain("/articles/how-to-export-food-from-great-britain-to-the-eu");
    expect(articlesHub).toContain("/articles/chemical-hazards-in-haccp-controls-limits-and-what-to-record");
    expect(articlesHub).toContain("/articles/cooling-and-reheating-haccp-high-risk-steps");
    expect(articlesHub).toContain("/articles/haccp-for-artisanal-bakeries-eu");
    expect(articlesHub).toContain("/regulations-covered");
    expect(articlesHub).toContain("/use-cases/restaurants");
    expect(articlesHub).toContain("/use-cases/food-manufacturing");

    expect(resources).toContain("/use-cases");
  });

  it("keeps current public marketing pages fresh in the sitemap", async () => {
    const entries = await sitemap();
    const currentPages = [
      "https://pinkpepper.io",
      "https://pinkpepper.io/about",
      "https://pinkpepper.io/human-review",
      "https://pinkpepper.io/methodology",
      "https://pinkpepper.io/pricing",
      "https://pinkpepper.io/contact",
      "https://pinkpepper.io/regulations-covered",
      "https://pinkpepper.io/security",
    ];

    for (const url of currentPages) {
      const entry = entries.find((item) => item.url === url);
      expect(new Date(entry?.lastModified ?? "").toISOString()).toContain("2026-06-18");
    }
  });

  it("keeps the sitemap aligned with the live resource library", async () => {
    const entries = (await sitemap()).map((entry) => entry.url);

    expect(entries).toContain("https://pinkpepper.io/resources/allergen-checklist-poster");
    expect(entries).toContain("https://pinkpepper.io/resources/cooking-monitoring-log-template");
    expect(entries).toContain("https://pinkpepper.io/resources/food-temperature-poster");
    expect(entries).toContain("https://pinkpepper.io/resources/gmp-poster");
    expect(entries).toContain("https://pinkpepper.io/resources/halal-compliance-poster");
    expect(entries).toContain("https://pinkpepper.io/resources/kosher-compliance-poster");
    expect(entries).toContain("https://pinkpepper.io/resources/restaurant-closing-checklist");
    expect(entries).toContain("https://pinkpepper.io/resources/restaurant-opening-checklist");
    expect(entries).toContain("https://pinkpepper.io/resources/restaurant-opening-poster");
    expect(entries).toContain("https://pinkpepper.io/resources/supplier-registration-log");
  });

  it("keeps the IndexNow payload aligned with the canonical public surface", async () => {
    vi.resetModules();
    vi.doMock("@/lib/article-index-feed", () => ({
      getIndexableEnglishArticleSummaries: vi.fn().mockReturnValue([
        {
          title: "Preferred article",
          slug: "preferred-article",
          excerpt: "Summary",
          category: "Compliance",
          publishedAt: "2026-06-18",
          source: "pinkpepper",
        },
        {
          title: "Imported weak article",
          slug: "haccp-for-meal-prep-services-eu",
          excerpt: "Summary",
          category: "Industry Guides",
          publishedAt: "2026-06-18",
          source: "ilovehaccp",
        },
      ]),
    }));
    vi.doMock("@/lib/resources", () => ({
      resourceEntries: [
        { href: "/resources/haccp-plan-template" },
        { href: "/resources/gmp-poster" },
      ],
    }));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "",
    });
    vi.stubGlobal("fetch", fetchMock);
    process.env.CRON_SECRET = "test-secret";

    const { GET } = await import("@/app/api/cron/indexnow/route");
    const response = await GET(
      new Request("https://pinkpepper.io/api/cron/indexnow", {
        headers: { authorization: "Bearer test-secret" },
      }),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(requestInit.body)) as { urlList: string[] };

    expect(payload.urlList).toContain("https://pinkpepper.io/pricing");
    expect(payload.urlList).toContain("https://pinkpepper.io/human-review");
    expect(payload.urlList).toContain("https://pinkpepper.io/methodology");
    expect(payload.urlList).toContain("https://pinkpepper.io/regulations-covered");
    expect(payload.urlList).toContain("https://pinkpepper.io/compare/pinkpepper-vs-consultant");
    expect(payload.urlList).not.toContain("https://pinkpepper.io/en/pricing");
    expect(payload.urlList).not.toContain("https://pinkpepper.io/");
    expect(payload.urlList).toContain("https://pinkpepper.io/fr");
    expect(payload.urlList).toContain("https://pinkpepper.io/resources/gmp-poster");
    expect(payload.urlList).toContain("https://pinkpepper.io/articles/preferred-article");
    expect(payload.urlList).not.toContain("https://pinkpepper.io/articles/haccp-for-meal-prep-services-eu");
    expect(payload.urlList).not.toContain("https://pinkpepper.io/legal/cookies");
    expect(payload.urlList).not.toContain("https://pinkpepper.io/legal/dpa");
    expect(payload.urlList).not.toContain("https://pinkpepper.io/legal/refund");
  });

  it("keeps the compare entry live while the generic compare route still redirects", () => {
    const nextConfig = readPage("next.config.ts");
    const comparePage = readPage("src/app/compare/pinkpepper-vs-consultant/page.tsx");
    const regulationsPage = readPage("src/app/regulations-covered/page.tsx");

    expect(nextConfig).toContain('{ source: "/compare", destination: "/pricing", permanent: true }');
    expect(nextConfig).toContain('{ source: "/compare/haccp-software-alternatives", destination: "/pricing", permanent: true }');
    expect(nextConfig).not.toContain("/compare/pinkpepper-vs-consultant\", destination: \"/pricing\"");

    expect(comparePage).toContain('href="/pricing"');
    expect(comparePage).toContain('href="/regulations-covered"');
    expect(comparePage).toContain('href="/about"');

    expect(regulationsPage).toContain("/articles/how-to-import-food-into-great-britain-from-non-eu-countries");
    expect(regulationsPage).toContain("/articles/how-to-export-food-from-great-britain-to-the-eu");
  });

  it("points export readers to export-side fish and organic guidance", () => {
    const exportGuide = readPage("content/articles/how-to-export-food-from-great-britain-to-the-eu.md");

    expect(exportGuide).toContain("https://www.gov.uk/guidance/exporting-or-moving-fish-from-the-uk");
    expect(exportGuide).toContain("https://www.gov.uk/guidance/exporting-organic-food-from-the-uk");
    expect(exportGuide).not.toContain("https://www.gov.uk/guidance/importing-or-moving-fish-to-the-uk");
    expect(exportGuide).not.toContain("https://www.gov.uk/guidance/importing-organic-food-to-the-uk");
  });

  it("deprioritizes weak imported articles without removing stronger article pages from indexing", async () => {
    const weakerImported = await generateArticleMetadata("haccp-for-meal-prep-services-eu", "en");
    const strongerImported = await generateArticleMetadata("identifying-critical-control-points-in-food-safety", "en");

    expect(weakerImported.robots).toEqual({ index: false, follow: true });
    expect(strongerImported.robots).toBeUndefined();
  });

});

describe("premium quality regressions", () => {
  it("does not ship mojibake on core marketing pages", () => {
    const about = readPage("src/app/about/page.tsx");
    const pricing = readPage("src/app/pricing/page.tsx");
    const contact = readPage("src/app/contact/page.tsx");

    expect(about).not.toContain("Ã¢â‚¬");
    expect(about).not.toContain("Ã¢â‚¬â„¢");
    expect(about).not.toContain("Ã¢â‚¬â€œ");
    expect(pricing).not.toContain("Ã¢â‚¬");
    expect(pricing).not.toContain("Ã¢â‚¬â„¢");
    expect(pricing).not.toContain("Ã¢â‚¬â€œ");
    expect(about).not.toContain("ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢");
    expect(pricing).not.toContain("ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢");
    expect(pricing).toContain("Pricing | PinkPepper Food Safety Compliance Software");
    expect(contact).toContain("Contact PinkPepper | Food Safety Compliance Support");
    expect(pricing).toContain("Save EUR 18,000+/year on compliance costs.");
  });

  it("uses compliance software wording consistently in shared brand surfaces", () => {
    const headerFooter = readPage("src/components/site/chrome.tsx");
    const pricing = readPage("src/app/pricing/page.tsx");

    expect(headerFooter).toContain("AI food safety compliance software");
    expect(headerFooter).not.toContain("AI Food Safety and Compliance Assistant");
    expect(pricing).not.toContain("AI food safety assistant");
  });

  it("provides a dedicated mobile navigation trigger in the shared header", () => {
    const chrome = readPage("src/components/site/chrome.tsx");
    const mobileNav = readPage("src/components/site/MobileNavMenu.tsx");

    expect(chrome).toContain("MobileNavMenu");
    expect(mobileNav).toContain('aria-label="Open navigation menu"');
    expect(mobileNav).toContain("lg:hidden");
  });

  it("keeps the premium shared chrome and avoids blanket hover lift motion", () => {
    const chrome = readPage("src/components/site/chrome.tsx");
    const globals = readPage("src/app/globals.css");

    expect(chrome).toContain("AI food safety compliance software");
    expect(chrome).toContain("pp-shell-link");
    expect(globals).not.toContain("a[href]:hover,");
    expect(globals).toContain(".pp-interactive");
  });

  it("recomposes the homepage around trust and workflow narrative sections", () => {
    const homepage = readPage("src/app/page.tsx");

    expect(homepage).toContain("Built for real world operators");
    expect(homepage).toContain("From raw notes to review-ready compliance work");
    expect(homepage).toContain("Switch from Consultant to Auditor when the job changes");
    expect(homepage).toContain("human consultancy");
  });

  it("keeps homepage pricing CTAs cache-friendly and attributed separately from the pricing page", () => {
    const homepage = readPage("src/app/page.tsx");
    const pricingActions = readPage("src/components/pricing/PricingActions.tsx");

    expect(homepage).not.toContain('await createClient()');
    expect(homepage).not.toContain("supabase.auth.getUser()");
    expect(homepage).toContain('source="homepage"');
    expect(pricingActions).toContain('source?: "pricing_page" | "homepage"');
    expect(pricingActions).toContain('source = "pricing_page"');
    expect(pricingActions).toContain('track("checkout_started", { plan, source })');
  });

  it("makes the Pro tier clearly about Auditor mode plus human consultancy", () => {
    const pricing = readPage("src/app/pricing/page.tsx");

    expect(pricing).toContain("Auditor mode");
    expect(pricing).toContain("2h/month of human food safety consultancy");
    expect(pricing).toContain("separate from the in-app Consultant and Auditor modes");
    expect(pricing).not.toContain("Full PDF and DOCX export");
    expect(pricing).not.toContain("100 AI queries per day");
    expect(pricing).not.toContain("voice transcriptions");
  });

  it("normalizes paid pricing CTA buttons to match the link CTA layout", () => {
    const pricingActions = readPage("src/components/pricing/PricingActions.tsx");

    expect(pricingActions).toContain('className="w-full"');
    expect(pricingActions).toContain("appearance-none");
    expect(pricingActions).toContain("items-center justify-center");
    expect(pricingActions).toContain('className={`${className} w-full flex items-center justify-center appearance-none`}');
    expect(pricingActions).not.toContain("inline-flex");
  });

  it("guards checkout launchers against rapid double clicks", () => {
    const pricingActions = readPage("src/components/pricing/PricingActions.tsx");
    const upgradeModal = readPage("src/components/dashboard/UpgradeModal.tsx");

    expect(pricingActions).toContain("const checkoutInFlight = useRef(false);");
    expect(pricingActions).toContain("if (checkoutInFlight.current) return;");
    expect(pricingActions).toContain("checkoutInFlight.current = true;");
    expect(pricingActions).toContain("checkoutInFlight.current = false;");

    expect(upgradeModal).toContain("const checkoutInFlight = useRef(false);");
    expect(upgradeModal).toContain("if (checkoutInFlight.current) return;");
    expect(upgradeModal).toContain("checkoutInFlight.current = true;");
    expect(upgradeModal).toContain("checkoutInFlight.current = false;");
  });

  it("makes article next-step account CTAs clickable signup links", () => {
    const articlePaths = [
      "content/articles/what-documents-does-a-food-hygiene-inspector-ask-for-first-uk.md",
      "content/articles/what-regulators-really-expect-from-small-food-businesses.md",
      "content/articles/cooling-and-reheating-haccp-high-risk-steps.md",
      "content/articles/temperature-control-in-haccp-limits-and-monitoring.md",
      "content/articles/allergen-management-within-haccp-plans.md",
    ];

    for (const articlePath of articlePaths) {
      const article = readPage(articlePath);

      expect(article).toContain('href="/signup"');
    }
  });
});

