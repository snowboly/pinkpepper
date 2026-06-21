import type { Metadata } from "next";
import Link from "next/link";
import ArticleCard from "@/components/articles/ArticleCard";
import ArticleLibraryRemainder from "@/components/articles/ArticleLibraryRemainder";
import { getArticleManifest } from "@/lib/articles";
import { type PublicLocale } from "@/i18n/public";
import { getPublicPageHref } from "@/lib/public-routes";

const featuredGuides = [
  {
    href: "/articles/how-to-import-food-into-great-britain-from-non-eu-countries",
    title: "How to import food into Great Britain from non-EU countries",
    description: "A step-by-step import workflow covering classification, IPAFFS, border controls, customs, and post-import checks.",
  },
  {
    href: "/articles/how-to-export-food-from-great-britain-to-the-eu",
    title: "How to export food from Great Britain to the EU",
    description: "The practical export route for certification, TRACES pre-notification, border control posts, and post-export records.",
  },
  {
    href: "/articles/building-a-haccp-process-flow-diagram",
    title: "How to build a HACCP process flow diagram",
    description: "Use a clearer process map before you assess hazards, CCP logic, and monitoring responsibilities.",
  },
  {
    href: "/articles/how-to-create-a-haccp-plan-step-by-step",
    title: "How to create a HACCP plan step by step",
    description: "A practical starting point for building a HACCP plan that stays usable after the first draft.",
  },
  {
    href: "/articles/how-to-perform-a-hazard-analysis-correctly",
    title: "How to perform a hazard analysis correctly",
    description: "The core thinking behind identifying hazards, controls, and what actually needs tighter review.",
  },
  {
    href: "/articles/identifying-critical-control-points-in-food-safety",
    title: "Identifying critical control points in food safety",
    description: "How to separate genuine CCPs from steps that only need prerequisite controls or monitoring.",
  },
  {
    href: "/articles/top-reasons-haccp-plans-fail-during-audits",
    title: "Top reasons HACCP plans fail during audits",
    description: "The recurring weaknesses we see when plans are over-generic, outdated, or unsupported by records.",
  },
  {
    href: "/articles/what-documents-does-a-food-hygiene-inspector-ask-for-first-uk",
    title: "What documents a food hygiene inspector asks for first",
    description: "A practical inspection-readiness guide covering the records inspectors usually want first and the gaps that cause problems.",
  },
  {
    href: "/articles/haccp-vs-brcgs-vs-ifs",
    title: "HACCP vs BRCGS vs IFS",
    description: "Where HACCP fits, what certification schemes add, and why teams get tripped up moving between them.",
  },
  {
    href: "/articles/chemical-hazards-in-haccp-controls-limits-and-what-to-record",
    title: "Chemical hazards in HACCP: controls, limits, and what to record",
    description: "A practical guide to spotting chemical risks and documenting controls without turning the plan generic.",
  },
  {
    href: "/articles/cooling-and-reheating-haccp-high-risk-steps",
    title: "Cooling and reheating HACCP high-risk steps",
    description: "The operational controls and record points that matter most when teams cool, reheat, and hold food.",
  },
  {
    href: "/articles/haccp-for-artisanal-bakeries-eu",
    title: "HACCP for artisanal bakeries",
    description: "A sector-specific guide for bakery operators who need a more usable process and hazard structure.",
  },
];

const workflowLinks = [
  {
    href: "/regulations-covered",
    title: "Check the regulations covered",
    description: "Use the trust page when you need a clearer map of the EU and UK legal and guidance areas PinkPepper covers.",
  },
  {
    href: "/resources/haccp-plan-template",
    title: "Start with the HACCP plan template",
    description: "Use the template hub if you need a cleaner structure before drafting a site-specific plan.",
  },
  {
    href: "/features/haccp-plan-generator",
    title: "Move into the HACCP workflow",
    description: "See how PinkPepper supports hazard analysis, CCP structure, and corrective action drafting.",
  },
  {
    href: "/features/food-safety-sop-generator",
    title: "Build SOPs and records that fit the site",
    description:
      "Use the SOP workflow when the next job is turning guidance into opening checks, cleaning procedures, and daily records.",
  },
  {
    href: "/faqs",
    title: "Check the product FAQs",
    description:
      "Read direct answers on scope, pricing, accountability, and how PinkPepper fits into food safety work before you go deeper.",
  },
  {
    href: "/use-cases",
    title: "Find the right operating model",
    description:
      "Jump into restaurant, cafe, catering, and manufacturing workflows instead of treating every business like the same HACCP problem.",
  },
  {
    href: "/articles/what-documents-does-a-food-hygiene-inspector-ask-for-first-uk",
    title: "See the inspection-readiness guide",
    description:
      "Review the documents inspectors usually ask for first before you tighten logs, templates, or daily checks.",
  },
];

const clusterLinks = [
  {
    title: "Import and export workflows",
    description:
      "Use the operational guides that map the document, border, and traceability steps around moving food into or out of Great Britain.",
    links: [
      { href: "/articles/how-to-import-food-into-great-britain-from-non-eu-countries", label: "Import into Great Britain" },
      { href: "/articles/how-to-export-food-from-great-britain-to-the-eu", label: "Export to the EU" },
      { href: "/regulations-covered", label: "Regulations covered" },
    ],
  },
  {
    title: "HACCP fundamentals",
    description:
      "Start with the core guides that explain process flow, hazard analysis, CCP logic, and what belongs in the actual plan.",
    links: [
      { href: "/articles/building-a-haccp-process-flow-diagram", label: "Process flow diagrams" },
      { href: "/articles/how-to-perform-a-hazard-analysis-correctly", label: "Hazard analysis" },
      { href: "/articles/identifying-critical-control-points-in-food-safety", label: "CCP decisions" },
    ],
  },
  {
    title: "Monitoring and records",
    description:
      "Use the articles and templates that help teams record controls cleanly enough to survive audits and daily operational change.",
    links: [
      { href: "/articles/cooling-and-reheating-haccp-high-risk-steps", label: "Cooling and reheating" },
      { href: "/resources/temperature-monitoring-log-template", label: "Temperature logs" },
      { href: "/resources/corrective-action-log-template", label: "Corrective actions" },
      { href: "/articles/what-documents-does-a-food-hygiene-inspector-ask-for-first-uk", label: "Inspection-ready records" },
    ],
  },
  {
    title: "Industry-specific workflows",
    description:
      "When the operating model matters more than the generic principle, move into the use-case pages first.",
    links: [
      { href: "/use-cases/cafes", label: "Cafes" },
      { href: "/use-cases/restaurants", label: "Restaurants" },
      { href: "/use-cases/catering", label: "Catering" },
      { href: "/use-cases/food-manufacturing", label: "Food manufacturing" },
    ],
  },
];

const INITIAL_ARTICLE_COUNT = 24;
const INITIAL_FEATURED_GUIDE_COUNT = 8;

export const metadata: Metadata = {
  title: "Food Safety Articles & Insights | PinkPepper",
  description:
    "A curated library of practical guidance on HACCP, allergen management, food safety audits, and operational compliance for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/articles",
    languages: { "x-default": "https://pinkpepper.io/articles", en: "https://pinkpepper.io/articles" },
  },
  openGraph: {
    title: "Food Safety Articles & Insights | PinkPepper",
    description:
      "A curated library of practical guidance on HACCP, allergen management, food safety audits, and operational compliance for EU and UK food businesses.",
    locale: "en_GB",
    images: [
      {
        url: "https://pinkpepper.io/social-card.png",
        width: 1200,
        height: 630,
        alt: "PinkPepper - AI Food Safety Compliance Software",
      },
    ],
  },
};

function getArticleHref(slug: string, locale: PublicLocale, localizedSlugs: ReadonlySet<string>) {
  if (locale === "en" || !localizedSlugs.has(slug)) {
    return `/articles/${slug}`;
  }

  return `/${locale}/articles/${slug}`;
}

type ArticlesPageProps = {
  locale?: PublicLocale;
};

export default async function ArticlesPage({ locale = "en" }: ArticlesPageProps = {}) {
  const articles = await getArticleManifest({ locale });
  const localizedSlugs = new Set(articles.map((article) => article.slug));
  const articleHrefBySlug = Object.fromEntries(
    articles.map((article) => [article.slug, getArticleHref(article.slug, locale, localizedSlugs)]),
  );
  const initialArticles = articles.slice(0, INITIAL_ARTICLE_COUNT);
  const remainingArticles = articles.slice(INITIAL_ARTICLE_COUNT);

  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Articles</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">
            Food safety guidance for operators who need practical answers
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            This library is where we concentrate PinkPepper&apos;s strongest evergreen guidance on HACCP, hazard
            analysis, allergen control, audits, and operational compliance for the teams who actually run food
            businesses.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#64748B]">
            This is a curated resource hub, not just an archive: start with practical explanations, then move into
            templates and feature pages when you need something ready to use.
          </p>
        </div>
      </section>

      <section className="border-b border-[#F1F5F9] bg-white py-14">
        <div className="pp-container">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Start here</p>
            <h2 className="pp-display mt-4 text-3xl text-[#0F172A] md:text-4xl">The strongest guides to begin with</h2>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              If you are new to PinkPepper, start with these core articles before branching into narrower sector pages.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredGuides.slice(0, INITIAL_FEATURED_GUIDE_COUNT).map((guide) => (
              <Link
                key={guide.href}
                href={
                  guide.href.startsWith("/articles/")
                    ? getArticleHref(guide.href.replace("/articles/", ""), locale, localizedSlugs)
                    : getPublicPageHref(locale, guide.href)
                }
                className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-7 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
              >
                <p className="text-xl font-semibold leading-tight text-[#0F172A]">{guide.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#475569]">{guide.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#F1F5F9] bg-[#FFF7ED] py-14">
        <div className="pp-container grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {workflowLinks.map((item) => (
            <Link
              key={item.href}
              href={getPublicPageHref(locale, item.href)}
              className="rounded-3xl border border-[#FED7AA] bg-white p-7 transition-all hover:-translate-y-0.5 hover:border-[#FDBA74] hover:shadow-xl hover:shadow-black/[0.04]"
            >
              <p className="text-lg font-semibold text-[#0F172A]">{item.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#475569]">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-b border-[#F1F5F9] bg-white py-14">
        <div className="pp-container">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Browse by cluster</p>
            <h2 className="pp-display mt-4 text-3xl text-[#0F172A] md:text-4xl">
              Follow the topic path that matches the work in front of you
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              Use these cluster paths when you want a tighter route through the library instead of scanning every article card.
            </p>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {clusterLinks.map((cluster) => (
              <div key={cluster.title} className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-7">
                <p className="text-xl font-semibold text-[#0F172A]">{cluster.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#475569]">{cluster.description}</p>
                <div className="mt-5 flex flex-col gap-3">
                  {cluster.links.map((link) => (
                    <Link
                      key={link.href}
                      href={getPublicPageHref(locale, link.href)}
                      className="text-sm font-semibold text-[#BE123C] transition-colors hover:text-[#9F1239]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16">
        <div className="pp-container">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Full library</p>
            <h2 className="pp-display mt-4 text-3xl text-[#0F172A] md:text-4xl">Browse every published article</h2>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              The first set loads immediately, and the rest of the archive stays one click away when you want to go deeper.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {initialArticles.map((article) => (
              <ArticleCard
                key={article.slug}
                category={article.category}
                excerpt={article.excerpt}
                href={articleHrefBySlug[article.slug]}
                image={article.image}
                publishedAt={article.publishedAt}
                title={article.title}
              />
            ))}
          </div>
          <ArticleLibraryRemainder articles={remainingArticles} articleHrefBySlug={articleHrefBySlug} />
        </div>
      </section>
    </main>
  );
}
