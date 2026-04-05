import type { Metadata } from "next";
import Link from "next/link";
import { ResourcesGrid, type ResourceEntry } from "@/components/site/ResourcesGrid";

const resources: ResourceEntry[] = [
  // HACCP
  {
    href: "/resources/haccp-plan-template",
    title: "HACCP plan template",
    description: "What a practical HACCP plan should include before you turn it into a site-specific document.",
    category: "haccp",
    categoryLabel: "HACCP",
  },
  {
    href: "/resources/corrective-action-log-template",
    title: "Corrective action log template",
    description: "How to document deviations, root causes, and actions taken to restore process control.",
    category: "haccp",
    categoryLabel: "HACCP",
  },
  {
    href: "/resources/product-recall-procedure-template",
    title: "Product recall procedure template",
    description: "The structure a recall procedure needs to enable a fast, traceable withdrawal or recall.",
    category: "haccp",
    categoryLabel: "HACCP",
  },
  // Allergen
  {
    href: "/resources/allergen-matrix-template",
    title: "Allergen matrix template",
    description: "How to structure allergen information so kitchen and front-of-house teams can use it.",
    category: "allergen",
    categoryLabel: "Allergen",
  },
  // Cleaning
  {
    href: "/resources/cleaning-and-disinfection-sop",
    title: "Cleaning and disinfection SOP",
    description: "How to draft a cleaning SOP that is specific enough to follow and simple enough to keep updated.",
    category: "cleaning",
    categoryLabel: "Cleaning",
  },
  // Monitoring
  {
    href: "/resources/temperature-monitoring-log-template",
    title: "Temperature monitoring log template",
    description: "What to include in fridge, freezer, hot-hold, and corrective action logs.",
    category: "monitoring",
    categoryLabel: "Monitoring",
  },
  {
    href: "/resources/pest-control-log-template",
    title: "Pest control log template",
    description: "How to record pest activity findings, contractor visits, and remedial actions.",
    category: "monitoring",
    categoryLabel: "Monitoring",
  },
  {
    href: "/resources/waste-management-log-template",
    title: "Waste management log template",
    description: "A structure for recording food waste disposal, condemned stock, and waste contractor details.",
    category: "monitoring",
    categoryLabel: "Monitoring",
  },
  {
    href: "/resources/waste-management-sop-template",
    title: "Waste management SOP template",
    description: "How to write a waste management procedure covering segregation, storage, contractor arrangements, and compliance.",
    category: "monitoring",
    categoryLabel: "Monitoring",
  },
  // Traceability
  {
    href: "/resources/traceability-log-template",
    title: "Traceability log template",
    description: "What one-step-back, one-step-forward traceability records should capture for EU and UK compliance.",
    category: "traceability",
    categoryLabel: "Traceability",
  },
  // Supplier
  {
    href: "/resources/supplier-approval-questionnaire",
    title: "Supplier approval questionnaire",
    description: "Questions and evidence points food businesses use when approving or re-approving suppliers.",
    category: "supplier",
    categoryLabel: "Supplier",
  },
  // Audit
  {
    href: "/resources/food-safety-audit-checklist",
    title: "Food safety audit checklist",
    description: "A practical structure for monthly internal review and inspection preparation.",
    category: "audit",
    categoryLabel: "Audit",
  },
  {
    href: "/resources/food-safety-document-checklist",
    title: "EU and UK food safety document checklist",
    description: "A broader authority asset covering HACCP, SOPs, allergen, traceability, monitoring, and audit-readiness documents.",
    category: "audit",
    categoryLabel: "Audit",
  },
  {
    href: "/resources/food-safety-management-system-template",
    title: "Food safety management system template",
    description: "How to structure the overarching FSMS document that ties your HACCP plan, SOPs, and records together.",
    category: "audit",
    categoryLabel: "Audit",
  },
  // Training
  {
    href: "/resources/employee-food-safety-training-record",
    title: "Employee food safety training record",
    description: "What training records should capture to demonstrate staff competence during inspections.",
    category: "training",
    categoryLabel: "Training",
  },
  {
    href: "/resources/personal-hygiene-policy-template",
    title: "Personal hygiene policy template",
    description: "The key elements a staff hygiene policy should cover to be enforceable and inspection-ready.",
    category: "training",
    categoryLabel: "Training",
  },
];

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Free Food Safety Templates & Guides | HACCP, Allergen, SOP, Audit | PinkPepper",
  description:
    "15 free food safety templates and guides for HACCP plans, allergen matrices, audit checklists, SOPs, temperature logs, traceability, and supplier approval — for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/resources",
  },
};

export default function ResourcesPage() {
  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">
            Free templates
          </p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">
            Food safety templates and guides
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            {resources.length} free templates covering HACCP, allergen management, cleaning, temperature
            monitoring, traceability, supplier approval, audit preparation, and staff training. Use
            them to understand what good food safety documents should contain before turning them into
            site-specific drafts.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-[#E11D48] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C]"
            >
              Generate a custom draft
            </Link>
            <Link
              href="/features/haccp-plan-generator"
              className="rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Grid with category filter */}
      <section className="bg-[#F8FAFC] py-14">
        <div className="pp-container">
          <ResourcesGrid resources={resources} />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16">
        <div className="pp-container text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Ready to start?</p>
          <h2 className="pp-display mx-auto mt-3 max-w-xl text-3xl text-[#0F172A] md:text-4xl">
            Start free. No card required.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-[#64748B]">
            Try PinkPepper on a real compliance question today. Or{" "}
            <Link href="/features" className="underline hover:text-[#0F172A]">explore the features</Link>{" "}
            to see what&apos;s possible.
          </p>
          <div className="mt-7">
            <Link
              href="/signup"
              className="pp-interactive inline-block rounded-full bg-[#E11D48] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[#BE123C]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
