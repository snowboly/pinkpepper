import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getArticleManifest } from "@/lib/articles";

const featuredGuides = [
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
    href: "/use-cases/food-manufacturing",
    title: "See the manufacturing use case",
    description: "Follow the food manufacturing path if your work is driven by records, traceability, and audit pressure.",
  },
];

export const metadata: Metadata = {
  title: "Food Safety Articles & Insights | PinkPepper",
  description:
    "Practical articles on HACCP, allergen management, food safety audits, and compliance for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/articles",
  },
};

export default async function ArticlesPage() {
  const articles = await getArticleManifest();

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
            analysis, allergen control, audits, and the day-to-day records that make food safety systems hold up.
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
                href={guide.href}
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
        <div className="pp-container grid gap-5 md:grid-cols-3">
          {workflowLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
            {articles.map((article) => (
              <article
                key={article.slug}
                className="group/article-card flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#E2E8F0] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-shadow duration-200 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]"
              >
                <div className="relative aspect-[16/9] overflow-hidden border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {article.image ? (
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover/article-card:scale-[1.02]"
                      sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_#FFE4E6,_#F8FAFC_62%)]">
                      <span className="text-sm font-medium text-[#64748B]">Article image coming soon</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6 md:p-7">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E11D48]">
                    {article.category}
                  </p>
                  <h2 className="mt-3 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0F172A] md:text-[2rem]">
                    <Link href={`/articles/${article.slug}`} className="transition-colors hover:text-[#BE123C]">
                      {article.title}
                    </Link>
                  </h2>
                  <p className="mt-3 text-sm font-medium text-[#64748B]">{article.publishedAt}</p>
                  <p className="mt-4 flex-1 text-[15px] leading-7 text-[#475569]">{article.excerpt}</p>
                  <div className="mt-6 border-t border-[#F1F5F9] pt-4">
                    <Link
                      href={`/articles/${article.slug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#FDA4AF] hover:text-[#BE123C]"
                    >
                      <span>Read article</span>
                      <span aria-hidden="true">+</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
