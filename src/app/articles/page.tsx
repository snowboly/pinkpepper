import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleLibraryRemainder } from "@/components/articles/ArticleLibraryRemainder";
import { getArticleManifest } from "@/lib/articles";
import { type PublicLocale } from "@/i18n/public";
import { getPublicPageHref } from "@/lib/public-routes";

const featuredGuides = [
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
    href: "/articles/what-regulators-really-expect-from-small-food-businesses",
    title: "What regulators really expect from small food businesses",
    description: "A more realistic view of what inspectors and auditors look for beyond generic paperwork advice.",
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
    href: "/resources",
    title: "Browse the template library",
    description: "Use the free templates if you need structured documents before moving into a custom compliance workflow.",
  },
  {
    href: "/use-cases/restaurants",
    title: "See the restaurant workflow",
    description: "Compare the guidance against a more concrete operating model for service kitchens and front-of-house controls.",
  },
  {
    href: "/use-cases/food-manufacturing",
    title: "See the manufacturing workflow",
    description: "Use the manufacturing path when the article topic needs tighter traceability, production controls, and formal records.",
  },
];

const INITIAL_ARTICLE_COUNT = 24;

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
    images: [{ url: "https://pinkpepper.io/social-card.png", width: 1200, height: 630, alt: "PinkPepper - AI Food Safety Compliance Software" }],
  },
};

function getArticleHref(
  slug: string,
  locale: PublicLocale = "en",
  localizedSlugs: ReadonlySet<string> = new Set(),
) {
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
  const localizedArticleSlugs = new Set(articles.map((article) => article.slug));
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
            {featuredGuides.map((guide) => (
              <Link
                key={guide.href}
                href={
                  guide.href.startsWith("/articles/")
                    ? getArticleHref(
                        guide.href.replace("/articles/", ""),
                        locale,
                        localizedArticleSlugs,
                      )
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
          <div className="md:col-span-2 xl:col-span-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Browse by cluster</p>
          </div>
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

      <section className="bg-[#F8FAFC] py-16">
        <div className="pp-container">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Full library</p>
            <h2 className="pp-display mt-4 text-3xl text-[#0F172A] md:text-4xl">Browse every published article</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {initialArticles.map((article) => (
              <ArticleCard
                key={article.slug}
                {...article}
                href={getArticleHref(article.slug, locale, localizedArticleSlugs)}
              />
            ))}
          </div>
          {remainingArticles.length > 0 ? (
            <ArticleLibraryRemainder
              articles={remainingArticles}
              locale={locale}
              localizedArticleSlugs={[...localizedArticleSlugs]}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}
