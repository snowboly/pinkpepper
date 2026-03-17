import type { Metadata } from "next";
import Link from "next/link";

const comparisons = [
  {
    href: "/compare/pinkpepper-vs-consultant",
    title: "PinkPepper vs consultant",
    description:
      "Explain when AI-assisted documentation is enough to accelerate work and when food safety consultancy still matters.",
  },
  {
    href: "/compare/haccp-software-alternatives",
    title: "HACCP software alternatives",
    description:
      "Frame PinkPepper against broader HACCP and food safety software categories for commercial comparison intent.",
  },
];

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
            Commercial comparison pages for buyers already evaluating options
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            Search traffic converts faster when buyers can compare categories clearly. These pages position PinkPepper
            against consultants and alternative HACCP software paths without pretending every option serves the same need.
          </p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16">
        <div className="pp-container grid gap-6 md:grid-cols-2">
          {comparisons.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
            >
              <p className="text-2xl font-semibold text-[#0F172A]">{item.title}</p>
              <p className="mt-4 text-sm leading-relaxed text-[#475569]">{item.description}</p>
            </Link>
          ))}
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
