import type { Metadata } from "next";
import Link from "next/link";
import { ResourcesGrid, type ResourceEntry } from "@/components/site/ResourcesGrid";

const resources: ResourceEntry[] = [
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
  {
    href: "/resources/allergen-matrix-template",
    title: "Allergen matrix template",
    description: "How to structure allergen information so kitchen and front-of-house teams can use it.",
    category: "allergen",
    categoryLabel: "Allergen",
  },
  {
    href: "/resources/cleaning-and-disinfection-sop",
    title: "Cleaning and disinfection SOP",
    description: "How to draft a cleaning SOP that is specific enough to follow and simple enough to keep updated.",
    category: "cleaning",
    categoryLabel: "Cleaning",
  },
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
  {
    href: "/resources/traceability-log-template",
    title: "Traceability log template",
    description: "What one-step-back, one-step-forward traceability records should capture for EU and UK compliance.",
    category: "traceability",
    categoryLabel: "Traceability",
  },
  {
    href: "/resources/supplier-approval-questionnaire",
    title: "Supplier approval questionnaire",
    description: "Questions and evidence points food businesses use when approving or re-approving suppliers.",
    category: "supplier",
    categoryLabel: "Supplier",
  },
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

const featuredResources = [
  "/resources/haccp-plan-template",
  "/resources/allergen-matrix-template",
  "/resources/temperature-monitoring-log-template",
  "/resources/food-safety-audit-checklist",
  "/resources/corrective-action-log-template",
];

const relatedWorkflows = [
  {
    href: "/features/haccp-plan-generator",
    title: "Turn a template into a working HACCP draft",
    description: "See the product workflow behind hazard analysis, CCP structure, and corrective actions.",
  },
  {
    href: "/features/allergen-documentation",
    title: "Connect templates to allergen control",
    description: "Follow the allergen documentation path if your biggest gaps are matrix upkeep and change control.",
  },
  {
    href: "/use-cases/food-manufacturing",
    title: "See how manufacturers use these records",
    description: "Move from generic templates into a manufacturing-specific compliance workflow.",
  },
];

export const metadata: Metadata = {
  title: "Free Food Safety Templates & Guides | HACCP, Allergen, SOP, Audit | PinkPepper",
  description:
    "15 free food safety templates and guides for HACCP plans, allergen matrices, audit checklists, SOPs, temperature logs, traceability, and supplier approval for EU and UK food businesses.",
  alternates: {
    canonical: "https://www.pinkpepper.io/resources",
  },
};

export default function ResourcesPage() {
  const priorityResources = resources.filter((resource) => featuredResources.includes(resource.href));

  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Free templates</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">Food safety templates and guides</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            Use these resources to understand what strong food safety records should contain before you turn them into
            site-specific documents. Start with the core templates below, then branch into narrower logs and policies.
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
              See the HACCP workflow
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-[#F1F5F9] bg-white py-14">
        <div className="pp-container">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Start with these</p>
            <h2 className="pp-display mt-4 text-3xl text-[#0F172A] md:text-4xl">The five templates most teams need first</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {priorityResources.map((resource) => (
              <Link
                key={resource.href}
                href={resource.href}
                className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E11D48]">{resource.categoryLabel}</p>
                <p className="mt-3 text-lg font-semibold leading-tight text-[#0F172A]">{resource.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#475569]">{resource.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#F1F5F9] bg-[#FFF7ED] py-14">
        <div className="pp-container grid gap-5 md:grid-cols-3">
          {relatedWorkflows.map((item) => (
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

      <section className="bg-[#F8FAFC] py-14">
        <div className="pp-container">
          <ResourcesGrid resources={resources} />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="pp-container text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Need more than a template?</p>
          <h2 className="pp-display mx-auto mt-3 max-w-xl text-3xl text-[#0F172A] md:text-4xl">
            Move from static documents into live compliance workflows
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-[#64748B]">
            Use PinkPepper when you need help turning a template into a business-specific draft with clearer controls,
            records, and next steps.
          </p>
          <div className="mt-7">
            <Link
              href="/pricing"
              className="pp-interactive inline-block rounded-full bg-[#E11D48] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[#BE123C]"
            >
              Start free
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
