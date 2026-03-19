import type { Metadata } from "next";
import Link from "next/link";

const comparisons = [
  {
    href: "/compare/pinkpepper-vs-consultant",
    title: "PinkPepper vs a food safety consultant",
    description:
      "Where AI-assisted drafting reduces expensive consultant time on first drafts and routine updates — and where specialist expertise still matters.",
  },
  {
    href: "/compare/haccp-software-alternatives",
    title: "HACCP software alternatives",
    description:
      "How PinkPepper fits alongside record-keeping and checklist tools when the gap is document creation, not document storage.",
  },
];

export const metadata: Metadata = {
  title: "Compare PinkPepper | Food Safety Software Comparisons",
  description:
    "Compare PinkPepper with food safety consultants and HACCP software alternatives. Understand where AI-assisted drafting fits your compliance workflow.",
  alternates: {
    canonical: "https://pinkpepper.io/compare",
  },
};

export default function ComparePage() {
  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Comparisons</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">
            Compare PinkPepper with other ways of working
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            Understand where AI-assisted drafting fits, where consultancy still matters, and how broader HACCP tools
            compare — so you pick the right approach for your compliance stage.
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
            href="/features/haccp-plan-generator"
            className="rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E11D48]">Features</p>
            <p className="mt-3 text-2xl font-semibold text-[#0F172A]">See the workflows behind each comparison</p>
            <p className="mt-4 text-sm leading-relaxed text-[#475569]">
              Explore HACCP, allergen, SOP, and audit-prep features that make PinkPepper practical for day-to-day compliance work.
            </p>
          </Link>
          <Link
            href="/pricing"
            className="rounded-3xl border border-[#FBCFE8] bg-[#FFF1F2] p-8 transition-all hover:-translate-y-0.5 hover:border-[#FDA4AF] hover:shadow-xl hover:shadow-black/[0.04]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E11D48]">Pricing</p>
            <p className="mt-3 text-2xl font-semibold text-[#0F172A]">Choose a plan that fits</p>
            <p className="mt-4 text-sm leading-relaxed text-[#475569]">
              Compare Free, Plus, and Pro once you know which level of AI drafting and specialist support your team needs.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
