import type { Metadata } from "next";
import Link from "next/link";

const featurePages = [
  {
    href: "/features/haccp-plan-generator",
    title: "HACCP plans",
    description:
      "Support for building practical HACCP documentation that reflects your process, your controls, and the gaps you need to close next.",
    includes: ["Hazard analysis", "CCP and monitoring structure", "Corrective action logic"],
  },
  {
    href: "/features/allergen-documentation",
    title: "Allergen records",
    description:
      "Help with the records and control documents teams need to manage allergens clearly across menus, recipes, and process changes.",
    includes: ["Allergen matrices", "Cross-contact controls", "Menu and recipe updates"],
  },
  {
    href: "/features/food-safety-sop-generator",
    title: "SOPs and hygiene procedures",
    description:
      "Practical support for the day-to-day documents that keep operations consistent, reviewable, and easier to hand over internally.",
    includes: ["Cleaning and hygiene procedures", "Temperature and training records", "Routine operational templates"],
  },
  {
    href: "/features/food-safety-audit-prep",
    title: "Audit prep and corrective actions",
    description:
      "Get ready for inspections, customer audits, and follow-up actions with cleaner evidence, tighter drafts, and fewer loose ends.",
    includes: ["Audit-readiness support", "Evidence pack preparation", "Corrective action follow-up"],
  },
];

const supportingLinks = [
  {
    href: "/resources",
    title: "Template library",
    description: "Use the resource hub if you need a strong starting structure before generating a custom draft.",
  },
  {
    href: "/use-cases",
    title: "Use-case pages",
    description: "Start there if you want the workflow framed around restaurants, cafes, catering, or manufacturing.",
  },
  {
    href: "/about",
    title: "About PinkPepper",
    description: "See the operating philosophy behind the product and how PinkPepper relates to consultancy support.",
  },
];

export const metadata: Metadata = {
  title: "Food Safety Services for HACCP, SOPs, Allergen Records & Audit Prep | PinkPepper Features",
  description:
    "Explore PinkPepper services for HACCP plans, allergen documentation, SOP support, audit preparation, exports, templates, and specialist food safety support.",
  alternates: {
    canonical: "https://pinkpepper.io/features",
  },
};

export default function FeaturesPage() {
  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Services</p>
          <h1 className="pp-display mt-4 max-w-4xl text-4xl text-[#0F172A] md:text-6xl">
            Food safety support for teams that need practical compliance work done properly
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            These are the core PinkPepper workflows we want people to land on first: HACCP, allergen records, SOPs,
            and audit preparation. Everything else should connect back to these pages.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="pp-interactive rounded-full bg-[#0F172A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1E293B]"
            >
              See pricing
            </Link>
            <Link
              href="/use-cases"
              className="pp-interactive rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
            >
              Browse use cases
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16">
        <div className="pp-container">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Core workflows</p>
            <h2 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-5xl">
              Start with the product pages that carry the most value
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {featurePages.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-[#E2E8F0] bg-white p-8">
                <p className="text-2xl font-semibold text-[#0F172A]">{feature.title}</p>
                <p className="mt-4 text-sm leading-relaxed text-[#475569]">{feature.description}</p>
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E11D48]">Typical support includes</p>
                  <ul className="mt-3 space-y-2 text-sm text-[#475569]">
                    {feature.includes.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
                <Link
                  href={feature.href}
                  className="mt-6 inline-flex text-sm font-semibold text-[#BE123C] transition-colors hover:text-[#9F1239]"
                >
                  Learn more
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#F1F5F9] bg-white py-16">
        <div className="pp-container">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Keep exploring</p>
            <h2 className="pp-display mt-4 text-3xl text-[#0F172A] md:text-4xl">
              Follow the strongest supporting paths from here
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {supportingLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-8 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
              >
                <p className="text-xl font-semibold text-[#0F172A]">{item.title}</p>
                <p className="mt-4 text-sm leading-relaxed text-[#475569]">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
