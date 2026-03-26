import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Food Safety Articles & Insights | PinkPepper",
  description:
    "Practical articles on HACCP, allergen management, food safety audits, and compliance for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/articles",
  },
};

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Articles</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">
            Food safety insights for EU and UK operators
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            Practical guidance on HACCP, allergen management, audits, and day-to-day compliance — written for the people
            who actually run food businesses.
          </p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16">
        <div className="pp-container">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <article key={article.slug} className="rounded-3xl border border-[#E2E8F0] bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E11D48]">{article.category}</p>
                <h2 className="mt-3 text-2xl font-semibold text-[#0F172A]">
                  <Link href={`/articles/${article.slug}`} className="hover:text-[#BE123C]">
                    {article.title}
                  </Link>
                </h2>
                <p className="mt-3 text-sm text-[#64748B]">{article.publishedAt}</p>
                <p className="mt-4 text-sm leading-relaxed text-[#475569]">{article.excerpt}</p>
                <Link
                  href={`/articles/${article.slug}`}
                  className="mt-6 inline-flex rounded-full border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#FDA4AF] hover:text-[#BE123C]"
                >
                  Read article
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
