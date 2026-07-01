import type { Metadata } from "next";
import Link from "next/link";

const useCases = [
  {
    href: "/use-cases/restaurants",
    title: "Restaurants",
    description:
      "HACCP plans built around prep schedules, line service, hot-hold, cooling, reheating, and the allergen handoff between kitchen and front of house. Designed for kitchens that move fast and still need records that hold up.",
  },
  {
    href: "/use-cases/cafes",
    title: "Cafes",
    description:
      "Light-touch documentation workflows for small teams handling display fridges, ambient pastries, milk-based drinks, reheated foods, and shared prep areas. Practical enough for an owner-operator, thorough enough for an EHO visit.",
  },
  {
    href: "/use-cases/catering",
    title: "Catering businesses",
    description:
      "Event-level HACCP records that follow the food from production kitchen to van to temporary setup to service. Built for changing menus, changing venues, and staff handoffs that span multiple locations.",
  },
  {
    href: "/use-cases/food-manufacturing",
    title: "Food manufacturing",
    description:
      "Full production-line documentation from process flow and CCP monitoring through to corrective actions, traceability, and audit packs. Made for technical managers dealing with BRC, SALSA, and retailer expectations.",
  },
];

const relatedLinks = [
  {
    href: "/features/haccp-plan-generator",
    title: "HACCP plan generator",
    description:
      "See how PinkPepper turns business-specific process information into practical HACCP plans and supporting records.",
  },
  {
    href: "/features/food-safety-sop-generator",
    title: "Food safety SOP generator",
    description:
      "Build opening checks, cleaning procedures, closing routines, and daily records that fit each operating environment.",
  },
  {
    href: "/faqs",
    title: "Food safety FAQs",
    description: "Answer practical questions about HACCP, allergen controls, records, and how the workflow fits your business.",
  },
];

export const metadata: Metadata = {
  title: "Food Safety Software for Restaurants, Cafes, Caterers & Manufacturers | PinkPepper",
  description:
    "Food safety documentation tailored to your business type. HACCP plans, records, and audit-ready workflows for restaurants, cafes, caterers, and manufacturers.",
  alternates: {
    canonical: "https://pinkpepper.io/use-cases",
  },
};

export default function UseCasesPage() {
  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">
            Food safety documentation built for how you actually operate
          </p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">
            HACCP plans, records, and audit docs that fit your business type
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            A restaurant kitchen on a Friday night does not work the same way as a contract caterer running an off-site
            event. Your food safety paperwork should not look identical either. PinkPepper adapts to the workflows,
            risks, and daily routines of different food businesses, so the documentation you produce actually reflects
            the operation you run.
          </p>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#64748B]">
            Choose the workflow that matches your kitchen, service model, or production site. Then go deeper into the
            SOPs, HACCP structure, and supporting records that make sense for that environment.
          </p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16">
        <div className="pp-container grid gap-6 md:grid-cols-2">
          {useCases.map((item) => (
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
        <div className="pp-container">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Related workflows</p>
            <h2 className="pp-display mt-4 text-3xl text-[#0F172A] md:text-4xl">
              Go deeper once you know the operating context
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              Once the business type is clear, the next step is choosing the right documentation layer: HACCP plans,
              daily SOPs, and the common questions teams need answered when they are setting the system up.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {relatedLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
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
