import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { generateArticleMetadata } from "@/app/articles/[slug]/page";
import { metadata as allergenDocumentationMetadata } from "@/app/features/allergen-documentation/page";
import { metadata as brcChecklistPosterMetadata } from "@/app/resources/brc-checklist-poster/page";
import { metadata as halalCompliancePosterMetadata } from "@/app/resources/halal-compliance-poster/page";
import { metadata as iso22000ChecklistPosterMetadata } from "@/app/resources/iso22000-checklist-poster/page";
import { metadata as kosherCompliancePosterMetadata } from "@/app/resources/kosher-compliance-poster/page";
import { metadata as workplaceCompliancePosterMetadata } from "@/app/resources/workplace-compliance-poster/page";
import { generateMetadata as generateLocalizedAllergenDocumentationMetadata } from "@/app/[locale]/features/allergen-documentation/page";
import { generateMetadata as generateLocalizedHomeMetadata } from "@/app/[locale]/page";
import { generateMetadata as generateLocalizedPricingMetadata } from "@/app/[locale]/pricing/page";
import { buildPublicMetadata } from "@/lib/seo/public-metadata";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");
const SLOW_SEO_RENDER_TIMEOUT_MS = 60_000;

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
  libraryMode?: "full" | "lazy",
) {
  vi.resetModules();
  vi.unstubAllEnvs();
  if (libraryMode) {
    vi.stubEnv("ARTICLES_LIBRARY_MODE", libraryMode);
  } else {
    vi.stubEnv("ARTICLES_LIBRARY_MODE", "");
  }
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

async function renderArticleDetailPageForTest(locale: "en" | "fr" | "de" | "pt" = "en") {
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
    shouldIndexArticle: vi.fn().mockReturnValue(true),
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
      locale,
    }),
  );
}

function expectLink(markup: string, href: string, label?: string) {
  expect(markup).toContain(`href="${href}"`);
  if (label) expect(markup).toContain(label);
}

describe("SEO surface", () => {
  it("builds locale alternates for phase-1 public pages", () => {
    const metadata = buildPublicMetadata("fr", "/pricing", {
      title: "Tarifs",
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
  });

  it("uses the consultant positioning in shared metadata titles and descriptions", () => {
    const layout = readPage("src/app/layout.tsx");

    expect(layout).toContain("AI Food Safety Consultant for EU & UK Businesses");
    expect(layout).toContain("Get AI-powered food safety support with optional human consultant review. Create HACCP documents, SOPs, allergen records, and compliance workflows for EU and UK food businesses.");
    expect(layout).toContain("Create HACCP documents");
    expect(layout).not.toContain("AI Food Safety Compliance Software - EU & UK");
  });

  it("points social metadata at a dedicated static social card", () => {
    const layout = readPage("src/app/layout.tsx");

    expect(layout).toContain('url: "https://pinkpepper.io/social-card.png"');
    expect(layout).toContain("width: 1200");
    expect(layout).toContain("height: 630");
    expect(layout).toContain('images: ["https://pinkpepper.io/social-card.png"]');
    expect(layout).toContain('title: "AI Food Safety Consultant for EU & UK Businesses | PinkPepper"');
    expect(layout).toContain("Get AI-powered food safety support with optional human consultant review. Create HACCP documents, SOPs, allergen records, and compliance workflows for EU and UK food businesses.");
    expect(layout).toContain("Create HACCP documents");
    expect(layout).toContain("compliance workflows for EU and UK food businesses");
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
    expect(entries).toContain("https://pinkpepper.io/features/haccp-plan-generator");
    expect(entries).toContain("https://pinkpepper.io/use-cases/restaurants");
    expect(entries).toContain("https://pinkpepper.io/articles/identifying-critical-control-points-in-food-safety");
    expect(entries).not.toContain("https://pinkpepper.io/fr");
    expect(entries).not.toContain("https://pinkpepper.io/pt/pricing");
    expect(entries).not.toContain("https://pinkpepper.io/de/features/haccp-plan-generator");
    expect(entries).not.toContain("https://pinkpepper.io/fr/features/allergen-documentation");
    expect(entries).not.toContain("https://pinkpepper.io/fr/articles/haccp-vs-brcgs-vs-ifs");
    expect(entries).not.toContain("https://pinkpepper.io/articles/haccp-for-craft-breweries-eu");
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
  it("aligns the homepage with the consultant category narrative", () => {
    const homepage = readPage("src/app/page.tsx");
    const heroChatForm = readPage("src/components/homepage/HeroChatForm.tsx");
    const demoTabSwitcher = readPage("src/components/homepage/DemoTabSwitcher.tsx");

    expect(homepage).toContain("AI food safety consultant for EU and UK food businesses");
    expect(homepage).toContain("Create HACCP documents");
    expect(homepage).toContain("/features/haccp-plan-generator");
    expect(homepage).toContain("/pricing");
    expect(heroChatForm).toContain("data-nosnippet");
    expect(demoTabSwitcher).toContain("data-nosnippet");
    expect(homepage).not.toContain("â€");
    expect(homepage).not.toContain("â€™");
    expect(homepage).not.toContain("â€“");
    expect(homepage).not.toContain("ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â");
    expect(homepage).not.toContain("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢");
    expect(homepage).not.toContain("ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬");
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
    expect(security).toContain("/pricing");
    expect(contact).toContain("/features/");
    expect(resources).toContain("/features/");
    expect(chrome).not.toContain('href: "/use-cases"');
  });

  it("keeps a legal landing page behind the shared legal breadcrumb root", () => {
    const legalHub = readPage("src/app/legal/page.tsx");
    const legalLayout = readPage("src/app/legal/layout.tsx");

    expect(legalLayout).toContain("https://pinkpepper.io/legal");
    expect(legalHub).toContain("Legal policies");
    expect(legalHub).toContain("/legal/terms");
    expect(legalHub).toContain("/legal/privacy");
    expect(legalHub).toContain("/legal/cookies");
  });

  it("renders the articles hub as a curated resource page with key route links", async () => {
    const markup = await renderArticlesPageForTest();

    expect(markup).toContain("resource hub");
    expect(markup).toContain("operational compliance");
    expect(markup).toContain("/use-cases");
    expect(markup).toContain("Browse by cluster");
  }, SLOW_SEO_RENDER_TIMEOUT_MS);

  it("renders a secondary rotating discovery block below the fixed featured guides", async () => {
    const markup = await renderArticlesPageForTest([
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
      {
        title: "Opening Checks for Food Trucks",
        slug: "opening-checks-food-trucks",
        excerpt: "A quick pre-service checklist for mobile operations.",
        category: "Operations",
        publishedAt: "2026-04-03",
      },
      {
        title: "Supplier Review Notes",
        slug: "supplier-review-notes",
        excerpt: "What to capture when supplier evidence changes.",
        category: "Compliance",
        publishedAt: "2026-04-04",
      },
    ]);

    expect(markup).toContain("More guides to explore");
    expect(markup).toContain("Thermometer Checks for Small Kitchens");
    expect(markup).toContain("Allergen Updates Before Service");
  }, SLOW_SEO_RENDER_TIMEOUT_MS);

  it("surfaces the UK inspector paperwork guide in the strongest-guides block", () => {
    const articlesHub = readPage("src/app/articles/page.tsx");

    expect(articlesHub).toContain("const INITIAL_FEATURED_GUIDE_COUNT = 8;");
    expect(articlesHub).toContain("/articles/what-documents-does-a-food-hygiene-inspector-ask-for-first-uk");
    expect(articlesHub).toContain("What documents does a food hygiene inspector ask for first in the UK?");
  });

  it("renders article cards with article links and fallback imagery", async () => {
    const markup = await renderArticlesPageForTest();

    expectLink(markup, "/articles/thermometer-checks-small-kitchens", "Thermometer Checks for Small Kitchens");
    expectLink(markup, "/articles/allergen-updates-before-service", "Allergen Updates Before Service");
    expect(markup).toContain('src="https://images.example.com/thermometer.jpg"');
    expect(markup).toContain('alt="Thermometer Checks for Small Kitchens"');
    expect(markup).toContain("Article image coming soon");
  }, SLOW_SEO_RENDER_TIMEOUT_MS);

  it("renders the full library by default", async () => {
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
    expect(markup).toContain("Article 25");
    expect(markup).toContain("Article 30");
    expect(markup).not.toContain("Load more articles");
  }, SLOW_SEO_RENDER_TIMEOUT_MS);

  it("honors ARTICLES_LIBRARY_MODE=full", async () => {
    const manyArticles = Array.from({ length: 30 }, (_, index) => ({
      title: `Article ${index + 1}`,
      slug: `article-${index + 1}`,
      excerpt: `Excerpt ${index + 1}`,
      category: "Operations",
      publishedAt: `2026-04-${String(index + 1).padStart(2, "0")}`,
    }));

    const markup = await renderArticlesPageForTest(manyArticles, "full");

    expect(markup).toContain("Article 1");
    expect(markup).toContain("Article 24");
    expect(markup).toContain("Article 25");
    expect(markup).toContain("Article 30");
    expect(markup).not.toContain("Load more articles");
  });

  it("keeps the deferred remainder when ARTICLES_LIBRARY_MODE=lazy", async () => {
    const manyArticles = Array.from({ length: 30 }, (_, index) => ({
      title: `Article ${index + 1}`,
      slug: `article-${index + 1}`,
      excerpt: `Excerpt ${index + 1}`,
      category: "Operations",
      publishedAt: `2026-04-${String(index + 1).padStart(2, "0")}`,
    }));

    const markup = await renderArticlesPageForTest(manyArticles, "lazy");
    const readArticleLinks = markup.match(/Read article/g) ?? [];

    expect(readArticleLinks).toHaveLength(28);
    expect(markup).toContain("Load more articles");
  }, SLOW_SEO_RENDER_TIMEOUT_MS);

  it("keeps upgraded Pexels imagery on priority compliance and sector articles", () => {
    const articleManifest = readPage("content/articles/manifest.json");

    expect(articleManifest).toContain('"slug": "shelf-life-validation-in-haccp"');
    expect(articleManifest).toContain("photos/18338496/pexels-photo-18338496.jpeg");
    expect(articleManifest).toContain('"slug": "chemical-hazards-in-haccp-controls-limits-and-what-to-record"');
    expect(articleManifest).toContain("photos/3869239/pexels-photo-3869239.jpeg");
    expect(articleManifest).toContain('"slug": "radiological-hazards-in-haccp"');
    expect(articleManifest).toContain("photos/6170405/pexels-photo-6170405.jpeg");
    expect(articleManifest).toContain('"slug": "haccp-for-hospital-catering-eu"');
    expect(articleManifest).toContain("photos/18429457/pexels-photo-18429457.jpeg");
    expect(articleManifest).toContain('"slug": "failed-haccp-inspection-consequences-uk"');
    expect(articleManifest).toContain("photos/15671373/pexels-photo-15671373.jpeg");
    expect(articleManifest).toContain('"slug": "haccp-for-food-trucks"');
    expect(articleManifest).toContain("photos/5779380/pexels-photo-5779380.jpeg");
  });

  it("tightens the public article detail hero hierarchy", () => {
    const articleDetail = readPage("src/app/articles/[slug]/page.tsx");

    expect(articleDetail).toContain("pp-article-hero-meta");
    expect(articleDetail).toContain("text-4xl font-bold leading-[1.05]");
    expect(articleDetail).toContain("text-xl leading-9");
    expect(articleDetail).toContain("https://pinkpepper.io/articles/${slug}");
    expect(articleDetail).toContain("https://pinkpepper.io/${locale}/articles/${slug}");
    expect(articleDetail).not.toContain("https://www.pinkpepper.io/articles");
  });

  it("renders related reading links on article detail pages", async () => {
    const markup = await renderArticleDetailPageForTest();

    expect(markup).toContain("Published by:");
    expect(markup).toContain("Related reading");
    expect(markup).toContain("Keep building the same cluster");
    expect(markup).toContain('href="/articles/temperature-control-in-haccp-limits-and-monitoring"');
    expect(markup).toContain('href="/articles/building-a-haccp-process-flow-diagram"');
    expect(markup).toContain('href="/articles/haccp-checklist-for-new-food-businesses"');
    expect(markup).toContain('href="/articles"');
  });

  it("localizes article publisher labels on translated article pages", async () => {
    const markup = await renderArticleDetailPageForTest("fr");

    expect(markup).toContain("Publié par :");
    expect(markup).not.toContain("Published by:");
  });

  it("assigns stable randomized article publishers for author freshness", async () => {
    const articleDetailPageModule = await import("@/app/articles/[slug]/page");

    expect(articleDetailPageModule.getArticlePublisherName("cooling-and-reheating-haccp-high-risk-steps")).toBe(
      articleDetailPageModule.getArticlePublisherName("cooling-and-reheating-haccp-high-risk-steps"),
    );
    expect(
      [
        "how-to-create-a-haccp-plan-step-by-step",
        "temperature-control-in-haccp-limits-and-monitoring",
        "haccp-for-vegan-and-plant-based-cafes-eu",
        "cooling-and-reheating-haccp-high-risk-steps",
        "haccp-for-food-trucks",
      ].map((slug) => articleDetailPageModule.getArticlePublisherName(slug)),
    ).toContain("John");
  });

  it("uses larger article reading sizes and pair-based related-link grids", () => {
    const articleDetail = readPage("src/app/articles/[slug]/page.tsx");
    const globals = readPage("src/app/globals.css");
    const resourceTemplate = readPage("src/components/site/ResourceTemplate.tsx");
    const featureTemplate = readPage("src/components/site/FeatureTemplate.tsx");

    expect(articleDetail).toContain("pp-article-body");
    expect(articleDetail).toContain("text-base font-semibold text-[#64748B]");
    expect(articleDetail).toContain("mt-10 grid gap-6 md:grid-cols-2");
    expect(articleDetail).toContain("mt-3 text-base leading-8 text-[#475569]");
    expect(resourceTemplate).toContain("mt-8 grid gap-4 md:grid-cols-2");
    expect(featureTemplate).toContain("mt-8 grid gap-5 md:grid-cols-2");
    expect(globals).toContain(".pp-article-body h2");
    expect(globals).toContain("font-size: 1.0625rem;");
    expect(globals).toContain(".pp-article-body strong");
    expect(globals).toContain("font-weight: 700");
    expect(globals).toContain("font-size: 1.125rem;");
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

  it("adds FAQ schema and retrieval-friendly questions to the HACCP template page", () => {
    const haccpTemplatePage = readPage("src/app/resources/haccp-plan-template/page.tsx");

    expect(haccpTemplatePage).toContain('"@type": "FAQPage"');
    expect(haccpTemplatePage).toContain("Can AI generate HACCP documents?");
    expect(haccpTemplatePage).toContain("Can I ask food safety questions before finalising the paperwork?");
    expect(haccpTemplatePage).toContain("Frequently asked questions");
  });

  it("separates generator intent from template intent on the two main HACCP landing pages", () => {
    const generatorPage = readPage("src/app/features/haccp-plan-generator/page.tsx");
    const templatePage = readPage("src/app/resources/haccp-plan-template/page.tsx");

    expect(generatorPage).toContain('title: "AI HACCP Plan Generator for Food Businesses | PinkPepper"');
    expect(generatorPage).not.toContain('title: "HACCP Plan Template for Small Food Businesses | PinkPepper"');
    expect(generatorPage).toContain("AI HACCP plan generator");

    expect(templatePage).toContain('title: "Free HACCP Plan Template for Food Businesses | PinkPepper"');
    expect(templatePage).toContain("HACCP template");
  });

  it("keeps localized public SEO messages aligned with the primary English metadata", () => {
    const messages = readPage("src/i18n/messages/public/en.json");
    const publicMetadata = readPage("src/lib/seo/public-metadata.ts");

    expect(messages).toContain("Get AI-powered food safety support with optional human consultant review. Create HACCP documents, SOPs, allergen records, and compliance workflows for EU and UK food businesses.");
    expect(messages).toContain("AI Food Safety Consultant for EU & UK Businesses | PinkPepper");
    expect(messages).toContain("AI HACCP Plan Generator for Food Businesses | PinkPepper");
    expect(messages).toContain("FAQs - HACCP, Allergens, Regulations & More | PinkPepper");
    expect(messages).not.toContain("AI Food Safety Compliance Software - EU & UK");
    expect(messages).not.toContain("HACCP Plan Template for Small Food Businesses | PinkPepper");
    expect(publicMetadata).toContain("PinkPepper - AI Food Safety Consultant for HACCP and compliance");
  });

  it("adds software and breadcrumb schema to the HACCP generator page", () => {
    const generatorPage = readPage("src/app/features/haccp-plan-generator/page.tsx");

    expect(generatorPage).toContain('"@type": "SoftwareApplication"');
    expect(generatorPage).toContain('"@type": "BreadcrumbList"');
    expect(generatorPage).toContain("https://pinkpepper.io/features/haccp-plan-generator");
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
    expect(articlesHub).toContain("/articles/chemical-hazards-in-haccp-controls-limits-and-what-to-record");
    expect(articlesHub).toContain("/articles/cooling-and-reheating-haccp-high-risk-steps");
    expect(articlesHub).toContain("/articles/haccp-for-artisanal-bakeries-eu");
    expect(articlesHub).toContain("/use-cases/restaurants");
    expect(articlesHub).toContain("/use-cases/food-manufacturing");

    expect(resources).toContain("/use-cases");
  });

  it("keeps current public marketing pages fresh in the sitemap", async () => {
    const entries = await sitemap();
    const currentPages = [
      "https://pinkpepper.io",
      "https://pinkpepper.io/about",
      "https://pinkpepper.io/pricing",
      "https://pinkpepper.io/contact",
      "https://pinkpepper.io/security",
    ];

    for (const url of currentPages) {
      const entry = entries.find((item) => item.url === url);
      expect(new Date(entry?.lastModified ?? "").toISOString()).toContain("2026-07-09");
    }
  });

  it("keeps the sitemap aligned with the live resource library", async () => {
    const entries = (await sitemap()).map((entry) => entry.url);

    expect(entries).toContain("https://pinkpepper.io/resources/cooking-monitoring-log-template");
    expect(entries).toContain("https://pinkpepper.io/resources/food-spec-template");
    expect(entries).toContain("https://pinkpepper.io/resources/food-temperature-poster");
    expect(entries).toContain("https://pinkpepper.io/resources/gmp-poster");
    expect(entries).toContain("https://pinkpepper.io/resources/supplier-registration-log");
  });

  it("deprioritizes weak imported articles without removing stronger article pages from indexing", async () => {
    const weakerImported = await generateArticleMetadata("haccp-for-meal-prep-services-eu", "en");
    const strongerImported = await generateArticleMetadata("identifying-critical-control-points-in-food-safety", "en");
    const weakerSector = await generateArticleMetadata("haccp-for-craft-breweries-eu", "en");
    const weakerLocalized = await generateArticleMetadata("haccp-vs-brcgs-vs-ifs", "fr");
    const genericImported = await generateArticleMetadata("how-to-keep-haccp-practical-not-bureaucratic", "en");
    const keywordStuffedImported = await generateArticleMetadata("haccp-plan-example-restaurant", "en");

    expect(weakerImported.robots).toEqual({ index: false, follow: true });
    expect(weakerSector.robots).toEqual({ index: false, follow: true });
    expect(weakerLocalized.robots).toEqual({ index: false, follow: true });
    expect(genericImported.robots).toEqual({ index: false, follow: true });
    expect(keywordStuffedImported.robots).toEqual({ index: false, follow: true });
    expect(strongerImported.robots).toBeUndefined();
  });

  it("keeps English commercial pages indexable while noindexing weak localized wrappers", async () => {
    const localizedFeature = await generateLocalizedAllergenDocumentationMetadata({
      params: Promise.resolve({ locale: "fr" }),
    });
    const localizedHome = await generateLocalizedHomeMetadata({
      params: Promise.resolve({ locale: "fr" }),
    });
    const localizedPricing = await generateLocalizedPricingMetadata({
      params: Promise.resolve({ locale: "pt" }),
    });

    expect(allergenDocumentationMetadata.robots).toBeUndefined();
    expect(localizedFeature.robots).toEqual({ index: false, follow: true });
    expect(localizedHome.robots).toEqual({ index: false, follow: true });
    expect(localizedPricing.robots).toEqual({ index: false, follow: true });
  }, SLOW_SEO_RENDER_TIMEOUT_MS);

  it("keeps low-intent poster resources out of the indexable sitemap while preserving stronger resources", async () => {
    const entries = (await sitemap()).map((entry) => entry.url);

    expect(entries).toContain("https://pinkpepper.io/resources/haccp-plan-template");
    expect(entries).toContain("https://pinkpepper.io/resources/food-spec-template");
    expect(entries).toContain("https://pinkpepper.io/resources/temperature-monitoring-log-template");
    expect(entries).not.toContain("https://pinkpepper.io/resources/kosher-compliance-poster");
    expect(entries).not.toContain("https://pinkpepper.io/resources/halal-compliance-poster");
    expect(entries).not.toContain("https://pinkpepper.io/resources/workplace-compliance-poster");
    expect(entries).not.toContain("https://pinkpepper.io/resources/brc-checklist-poster");
    expect(entries).not.toContain("https://pinkpepper.io/resources/iso22000-checklist-poster");
    expect(kosherCompliancePosterMetadata.robots).toEqual({ index: false, follow: true });
    expect(halalCompliancePosterMetadata.robots).toEqual({ index: false, follow: true });
    expect(workplaceCompliancePosterMetadata.robots).toEqual({ index: false, follow: true });
    expect(brcChecklistPosterMetadata.robots).toEqual({ index: false, follow: true });
    expect(iso22000ChecklistPosterMetadata.robots).toEqual({ index: false, follow: true });
  });

});

describe("premium quality regressions", () => {
  it("does not ship mojibake on core marketing pages", () => {
    const about = readPage("src/app/about/page.tsx");
    const pricing = readPage("src/app/pricing/page.tsx");

    expect(about).not.toContain("â€");
    expect(about).not.toContain("â€™");
    expect(about).not.toContain("â€“");
    expect(pricing).not.toContain("â€");
    expect(pricing).not.toContain("â€™");
    expect(pricing).not.toContain("â€“");
    expect(about).not.toContain("ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢");
    expect(pricing).not.toContain("ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢");
  });

  it("keeps the FAQ page metadata title ASCII-clean", () => {
    const faqs = readPage("src/app/faqs/page.tsx");

    expect(faqs).not.toContain("Ã¢â‚¬");
    expect(faqs).not.toContain("Ã¢â‚¬â„¢");
    expect(faqs).not.toContain("Ã¢â‚¬â€œ");
    expect(faqs).toContain("FAQs - HACCP, Allergens, Regulations & More | PinkPepper");
  });

  it("uses consultant wording consistently in shared brand surfaces", () => {
    const headerFooter = readPage("src/components/site/chrome.tsx");
    const pricing = readPage("src/app/pricing/page.tsx");

    expect(headerFooter).toContain("AI food safety consultant");
    expect(headerFooter).not.toContain("AI Food Safety and Compliance Assistant");
    expect(pricing).toContain("AI food safety assistant and consultant features");
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

    expect(chrome).toContain("AI food safety consultant");
    expect(chrome).toContain("pp-shell-link");
    expect(globals).not.toContain("a[href]:hover,");
    expect(globals).toContain(".pp-interactive");
  });

  it("recomposes the homepage around trust and workflow narrative sections", () => {
    const homepage = readPage("src/app/page.tsx");

    expect(homepage).toContain("Built for real world operators");
    expect(homepage).toContain("From raw notes to practical compliance drafts");
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
