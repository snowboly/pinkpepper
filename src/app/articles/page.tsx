import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Food Safety Articles & Insights | PinkPepper",
  description:
    "Practical articles on HACCP, allergen management, food safety audits, and compliance for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/articles",
  },
};

export default function ArticlesPage() {
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
        <div className="pp-container max-w-4xl text-center">
          <p className="text-lg font-medium text-[#475569]">New articles are on the way. Check back soon.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/resources"
              className="rounded-full bg-[#E11D48] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C]"
            >
              Browse free templates
            </Link>
            <Link
              href="/features"
              className="rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
            >
              Explore features
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
