import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Comparisons | PinkPepper",
  description:
    "Compare PinkPepper with consultants and HACCP software alternatives for food safety compliance work.",
  alternates: {
    canonical: "https://pinkpepper.io/compare",
  },
};

export default function ComparePage() {
  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Comparison hub</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">
            Compare PinkPepper with other ways food businesses handle compliance work
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            Some teams need software, some need consultancy, and many need a mix of both. These comparison pages explain
            where PinkPepper fits, what it replaces well, and where specialist review still adds value.
          </p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16">
        <div className="pp-container">
          <div className="mx-auto max-w-4xl rounded-3xl border border-[#E2E8F0] bg-white p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E11D48]">Comparison note</p>
            <h2 className="mt-4 text-3xl font-semibold text-[#0F172A] md:text-4xl">
              We are keeping comparison content deliberately narrow for now
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#475569]">
              PinkPepper is still refining how it presents detailed comparisons with consultants and broader software
              categories. For now, the clearest way to evaluate fit is through the product workflows, pricing, and
              resource pages.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/features"
                className="rounded-full bg-[#E11D48] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C]"
              >
                Explore features
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="pp-container grid gap-6 md:grid-cols-2">
          <Link
            href="/pricing"
            className="rounded-3xl border border-[#FBCFE8] bg-[#FFF1F2] p-8 transition-all hover:-translate-y-0.5 hover:border-[#FDA4AF] hover:shadow-xl hover:shadow-black/[0.04]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E11D48]">Pricing</p>
            <p className="mt-3 text-2xl font-semibold text-[#0F172A]">See which plan fits your risk and workflow</p>
            <p className="mt-4 text-sm leading-relaxed text-[#475569]">
              Compare pricing once you know whether you need document drafting, exports, or audit-prep support.
            </p>
          </Link>
          <Link
            href="/features"
            className="rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E11D48]">Features</p>
            <p className="mt-3 text-2xl font-semibold text-[#0F172A]">Review the product workflows behind the claims</p>
            <p className="mt-4 text-sm leading-relaxed text-[#475569]">
              Validate the comparison pages against PinkPepper&apos;s HACCP, allergen, SOP, and audit-prep features.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
