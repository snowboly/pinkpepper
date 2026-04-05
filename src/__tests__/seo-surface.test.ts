import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("SEO surface", () => {
  it("uses the Phase 1 compliance software positioning in shared metadata", () => {
    const layout = readPage("src/app/layout.tsx");

    expect(layout).toContain("AI Food Safety Compliance Software");
    expect(layout).toContain("EU and UK food businesses");
  });

  it("points social metadata at the generated OG image route", () => {
    const layout = readPage("src/app/layout.tsx");

    expect(layout).toContain('url: "/og-image"');
    expect(layout).toContain('images: ["/og-image"]');
  });

  it("allows article imagery from the configured external sources", () => {
    const nextConfig = readPage("next.config.ts");

    expect(nextConfig).toContain('hostname: "images.unsplash.com"');
    expect(nextConfig).toContain('hostname: "images.pexels.com"');
    expect(nextConfig).toContain("img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com https://images.pexels.com");
  });

  it("includes public marketing pages and excludes auth/dashboard routes from sitemap and robots", async () => {
    const entries = (await sitemap()).map((entry) => entry.url);
    const robotRules = robots().rules;
    const robotRuleList = Array.isArray(robotRules) ? robotRules : [robotRules];
    const disallowLists = robotRuleList.flatMap((rule) => {
      const { disallow } = rule;
      return Array.isArray(disallow) ? disallow : disallow ? [disallow] : [];
    });

    expect(entries).toContain("https://pinkpepper.io/features");
    expect(entries).toContain("https://pinkpepper.io/use-cases");
    expect(entries).toContain("https://pinkpepper.io/resources");
    expect(entries).not.toContain("https://pinkpepper.io/login");
    expect(entries).not.toContain("https://pinkpepper.io/dashboard");
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

  it("renders article cards with image support and a fallback shell", () => {
    const articles = readPage("src/app/articles/page.tsx");

    expect(articles).toContain('from "next/image"');
    expect(articles).toContain("article.image ? (");
    expect(articles).toContain("Article image coming soon");
  });

  it("strengthens the public article index card hierarchy", () => {
    const articles = readPage("src/app/articles/page.tsx");

    expect(articles).toContain('group/article-card');
    expect(articles).toContain("font-bold");
    expect(articles).toContain("text-[11px] font-black uppercase tracking-[0.22em]");
    expect(articles).toContain("inline-flex items-center gap-2");
  });

  it("tightens the public article detail hero hierarchy", () => {
    const articleDetail = readPage("src/app/articles/[slug]/page.tsx");

    expect(articleDetail).toContain("pp-article-hero-meta");
    expect(articleDetail).toContain("text-4xl font-bold leading-[1.05]");
    expect(articleDetail).toContain("text-lg leading-8");
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
    expect(homepage).toContain("/features/food-safety-audit-prep");
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
});
