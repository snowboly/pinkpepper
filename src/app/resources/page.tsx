import type { Metadata } from "next";
import Link from "next/link";

const resources = [
  {
    href: "/resources/haccp-plan-template",
    title: "HACCP plan template",
    description: "What a practical HACCP plan should include before you turn it into a site-specific document.",
  },
  {
    href: "/resources/allergen-matrix-template",
    title: "Allergen matrix template",
    description: "How to structure allergen information so kitchen and front-of-house teams can use it.",
  },
  {
    href: "/resources/food-safety-audit-checklist",
    title: "Food safety audit checklist",
    description: "A practical structure for monthly internal review and inspection preparation.",
  },
  {
    href: "/resources/cleaning-and-disinfection-sop",
    title: "Cleaning and disinfection SOP",
    description: "How to draft a cleaning SOP that is specific enough to follow and simple enough to keep updated.",
  },
  {
    href: "/resources/temperature-monitoring-log-template",
    title: "Temperature monitoring log template",
    description: "What to include in fridge, freezer, hot-hold, and corrective action logs.",
  },
  {
    href: "/resources/supplier-approval-questionnaire",
    title: "Supplier approval questionnaire",
    description: "Questions and evidence points food businesses use when approving or re-approving suppliers.",
  },
  {
    href: "/resources/food-safety-document-checklist",
    title: "EU and UK food safety document checklist",
    description: "A broader authority asset covering HACCP, SOPs, allergen, traceability, monitoring, and audit-readiness documents.",
  },
];

export const metadata: Metadata = {
  title: "Resources | PinkPepper",
  description:
    "Explore PinkPepper resources and templates for HACCP plans, allergen matrices, SOPs, audit checklists, temperature logs, and supplier approval.",
  alternates: {
    canonical: "https://pinkpepper.io/resources",
  },
};

export default function ResourcesPage() {
  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Resources</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">
            Supporting content for HACCP, allergen, SOP, and audit search intent
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            These resource pages target the long-tail questions and template searches that support PinkPepper&apos;s
            commercial pages. They are designed to educate, capture demand, and route qualified visitors into product pages.
          </p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16">
        <div className="pp-container grid gap-6 md:grid-cols-2">
          {resources.map((resource) => (
            <Link
              key={resource.href}
              href={resource.href}
              className="rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
            >
              <p className="text-2xl font-semibold text-[#0F172A]">{resource.title}</p>
              <p className="mt-4 text-sm leading-relaxed text-[#475569]">{resource.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="pp-container">
          <div className="mx-auto max-w-4xl rounded-3xl border border-[#FBCFE8] bg-[#FFF1F2] p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#BE123C]">From template to workflow</p>
            <h2 className="mt-4 text-3xl font-semibold text-[#0F172A] md:text-4xl">
              Use the resource pages as entry points, then move into product workflows
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#475569]">
              These guides answer search intent clearly, but the higher-value next step is turning a template or checklist
              into a usable draft for your operation. PinkPepper helps teams do that faster across HACCP, allergen, SOP, and audit work.
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
    </main>
  );
}
