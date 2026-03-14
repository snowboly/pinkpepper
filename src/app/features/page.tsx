import type { Metadata } from "next";
import Link from "next/link";

const features = [
  {
    href: "/features/haccp-plan-generator",
    title: "HACCP plan generator",
    description:
      "Build hazard analysis, CCP logic, monitoring steps, and corrective actions for EU and UK food businesses.",
  },
  {
    href: "/features/allergen-documentation",
    title: "Allergen documentation",
    description:
      "Generate allergen matrices, cross-contact controls, and menu-change documentation for operational teams.",
  },
  {
    href: "/features/food-safety-sop-generator",
    title: "Food safety SOP generator",
    description:
      "Create opening checks, sanitation SOPs, temperature logs, hygiene policies, and training records faster.",
  },
  {
    href: "/features/food-safety-audit-prep",
    title: "Food safety audit prep",
    description:
      "Prepare audit evidence packs, monthly reviews, and corrective action follow-up before inspection day.",
  },
];

export const metadata: Metadata = {
  title: "Features | PinkPepper Food Safety Compliance Software",
  description:
    "Explore PinkPepper features for HACCP plans, allergen documentation, SOP generation, and food safety audit preparation.",
  alternates: {
    canonical: "https://pinkpepper.io/features",
  },
};

export default function FeaturesPage() {
  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Feature hub</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">
            Food safety compliance features built for revenue-driving search intent
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            PinkPepper is not one generic chat screen. These pages explain how the product handles HACCP plans,
            allergen documentation, SOP generation, and audit preparation for EU and UK food businesses.
          </p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16">
        <div className="pp-container grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
            >
              <p className="text-2xl font-semibold text-[#0F172A]">{feature.title}</p>
              <p className="mt-4 text-sm leading-relaxed text-[#475569]">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="pp-container grid gap-6 md:grid-cols-2">
          <Link
            href="/use-cases"
            className="rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E11D48]">Use cases</p>
            <p className="mt-3 text-2xl font-semibold text-[#0F172A]">See the product by business type</p>
            <p className="mt-4 text-sm leading-relaxed text-[#475569]">
              Explore landing pages for restaurants, cafes, caterers, and food manufacturers.
            </p>
          </Link>
          <Link
            href="/pricing"
            className="rounded-3xl border border-[#FBCFE8] bg-[#FFF1F2] p-8 transition-all hover:-translate-y-0.5 hover:border-[#FDA4AF] hover:shadow-xl hover:shadow-black/[0.04]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E11D48]">Pricing</p>
            <p className="mt-3 text-2xl font-semibold text-[#0F172A]">Match the feature set to the right plan</p>
            <p className="mt-4 text-sm leading-relaxed text-[#475569]">
              Compare Free, Plus, and Pro if you need faster document production, exports, and audit-readiness workflows.
            </p>
          </Link>
          <Link
            href="/compare"
            className="rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E11D48]">Comparisons</p>
            <p className="mt-3 text-2xl font-semibold text-[#0F172A]">Read commercial comparison pages</p>
            <p className="mt-4 text-sm leading-relaxed text-[#475569]">
              Compare PinkPepper with consultants and broader HACCP software alternatives.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
