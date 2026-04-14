import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

async function renderArticlesPageForTest() {
  vi.resetModules();
  vi.doMock("@/lib/articles", () => ({
    getArticleManifest: vi.fn().mockResolvedValue([
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
    ]),
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

describe("SEO surface", () => {
  it("uses the Phase 1 compliance software positioning in shared metadata", () => {
    const layout = readPage("src/app/layout.tsx");

    expect(layout).toContain("AI Food Safety Compliance Software");
    expect(layout).toContain("EU and UK food businesses");
  });

  it("points social metadata at a dedicated static social card", () => {
    const layout = readPage("src/app/layout.tsx");

    expect(layout).toContain('url: "https://www.pinkpepper.io/social-card.png"');
    expect(layout).toContain("width: 1200");
    expect(layout).toContain("height: 630");
    expect(layout).toContain('images: ["https://www.pinkpepper.io/social-card.png"]');
    expect(layout).toContain('title: "PinkPepper | AI HACCP & Food Safety Software — EU & UK"');
    expect(layout).toContain("grounded in 35+ EU & UK regulations. Try free.");
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

    expect(entries).toContain("https://www.pinkpepper.io/features");
    expect(entries).toContain("https://www.pinkpepper.io/use-cases");
    expect(entries).toContain("https://www.pinkpepper.io/resources");
    expect(entries).not.toContain("https://www.pinkpepper.io/login");
    expect(entries).not.toContain("https://www.pinkpepper.io/dashboard");
    expect(disallowLists).toEqual(
      expect.arrayContaining(["/dashboard/", "/admin/", "/api/", "/auth/"]),
    );
  });
});

describe("public SEO copy and linking", () => {
  it("aligns the homepage with the compliance software category narrative", () => {
    const homepage = readPage("src/app/page.tsx");

    expect(homepage).toContain("AI food safety compliance software");
    expect(homepage).toContain("/features/haccp-plan-generator");
    expect(homepage).toContain("/pricing");
    expect(homepage).not.toContain("â€”");
    expect(homepage).not.toContain("â†’");
    expect(homepage).not.toContain("â‚¬");
  });

  it("routes core public pages into deeper commercial paths", () => {
    const pricing = readPage("src/app/pricing/page.tsx");
    const about = readPage("src/app/about/page.tsx");
    const security = readPage("src/app/security/page.tsx");
    const contact = readPage("src/app/contact/page.tsx");
    const features = readPage("src/app/features/page.tsx");
    const useCases = readPage("src/app/use-cases/page.tsx");
    const resources = readPage("src/app/resources/page.tsx");

    expect(pricing).toContain("/features/");
    expect(about).toContain("/pricing");
    expect(security).toContain("/pricing");
    expect(contact).toContain("/features/");
    expect(features).toContain("/pricing");
    expect(useCases).toContain("/features/");
    expect(resources).toContain("/features/");
  });

  it("renders the articles hub as a curated resource page with key route links", async () => {
    const markup = await renderArticlesPageForTest();

    expect(markup).toContain("resource hub");
    expect(markup).toContain("operational compliance");
  });

  it("renders article cards with article links and fallback imagery", async () => {
    const markup = await renderArticlesPageForTest();

    expectLink(markup, "/articles/thermometer-checks-small-kitchens", "Thermometer Checks for Small Kitchens");
    expectLink(markup, "/articles/allergen-updates-before-service", "Allergen Updates Before Service");
    expect(markup).toContain('src="https://images.example.com/thermometer.jpg"');
    expect(markup).toContain('alt="Thermometer Checks for Small Kitchens"');
    expect(markup).toContain("Article image coming soon");
  });

  it("tightens the public article detail hero hierarchy", () => {
    const articleDetail = readPage("src/app/articles/[slug]/page.tsx");

    expect(articleDetail).toContain("pp-article-hero-meta");
    expect(articleDetail).toContain("text-4xl font-bold leading-[1.05]");
    expect(articleDetail).toContain("text-lg leading-8");
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
    const features = readPage("src/app/features/page.tsx");
    const useCases = readPage("src/app/use-cases/page.tsx");
    const resources = readPage("src/app/resources/page.tsx");

    expect(features).not.toContain("revenue-driving search intent");
    expect(useCases).not.toContain("prospects can see their own workflow");
    expect(resources).not.toContain("long-tail questions and template searches");
  });

  it("biases homepage article links toward cleaned evergreen pages", () => {
    const randomLinks = readPage("src/components/homepage/RandomArticleLinks.tsx");

    expect(randomLinks).toContain("/articles/building-a-haccp-process-flow-diagram");
    expect(randomLinks).toContain("/articles/haccp-for-burger-vans-eu");
    expect(randomLinks).toContain("/articles/haccp-for-artisanal-bakeries-eu");
    expect(randomLinks).not.toContain("/articles/cooling-and-reheating-haccp-high-risk-steps");
    expect(randomLinks).not.toContain("/articles/correcting-non-conformities-in-haccp");
  });

  it("keeps current public marketing pages fresh in the sitemap", async () => {
    const entries = await sitemap();
    const currentPages = [
      "https://www.pinkpepper.io",
      "https://www.pinkpepper.io/about",
      "https://www.pinkpepper.io/pricing",
      "https://www.pinkpepper.io/contact",
      "https://www.pinkpepper.io/security",
    ];

    for (const url of currentPages) {
      const entry = entries.find((item) => item.url === url);
      expect(new Date(entry?.lastModified ?? "").toISOString()).toContain("2026-03-18");
    }
  });

});

describe("premium quality regressions", () => {
  it("does not ship mojibake on core marketing pages", () => {
    const about = readPage("src/app/about/page.tsx");
    const pricing = readPage("src/app/pricing/page.tsx");

    expect(about).not.toContain("â");
    expect(pricing).not.toContain("â");
  });

  it("uses compliance software wording consistently in shared brand surfaces", () => {
    const headerFooter = readPage("src/components/site/chrome.tsx");
    const pricing = readPage("src/app/pricing/page.tsx");
    const features = readPage("src/app/features/page.tsx");

    expect(headerFooter).toContain("AI food safety compliance software");
    expect(headerFooter).not.toContain("AI Food Safety and Compliance Assistant");
    expect(pricing).not.toContain("AI food safety assistant");
    expect(headerFooter).toContain("Services");
    expect(headerFooter).not.toContain(">Features<");
    expect(features).not.toContain("â€¢");
  });

  it("provides a dedicated mobile navigation trigger in the shared header", () => {
    const chrome = readPage("src/components/site/chrome.tsx");

    expect(chrome).toContain('aria-label="Open navigation menu"');
    expect(chrome).toContain("lg:hidden");
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
});

