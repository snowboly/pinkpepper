import type { Metadata } from "next";
import Link from "next/link";
import { ResourcesGrid } from "@/components/site/ResourcesGrid";
import { getFeaturedResources, resourceEntries } from "@/lib/resources";

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
    href: "/articles",
    title: "Read the compliance articles",
    description: "Go deeper on HACCP, allergen control, audits, and traceability with practical operational guidance.",
  },
  {
    href: "/use-cases",
    title: "Match the templates to your operation",
    description: "Use the restaurants, catering, cafes, and manufacturing pages when you need templates in a more business-specific workflow.",
  },
];

export const metadata: Metadata = {
  title: "Free Food Safety Templates & Guides | PinkPepper",
  description:
    "Free food safety templates, posters, and guides for HACCP plans, hazard analysis, allergen matrices, opening and closing checklists, SOPs, temperature logs, traceability, and supplier approval for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/resources",
    languages: { "x-default": "https://pinkpepper.io/resources", en: "https://pinkpepper.io/resources" },
  },
  openGraph: {
    title: "Free Food Safety Templates & Guides | PinkPepper",
    description:
      "Free food safety templates, posters, and guides for HACCP plans, hazard analysis, allergen matrices, opening and closing checklists, SOPs, temperature logs, traceability, and supplier approval for EU and UK food businesses.",
    locale: "en_GB",
    images: [
      {
        url: "https://pinkpepper.io/social-card.png",
        width: 1200,
        height: 630,
        alt: "PinkPepper - AI Food Safety Consultant for HACCP and compliance",
      },
    ],
  },
};

export default function ResourcesPage() {
  const priorityResources = getFeaturedResources();

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
        <div className="pp-container grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
          <ResourcesGrid resources={resourceEntries} />
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
