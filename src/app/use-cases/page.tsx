import type { Metadata } from "next";
import Link from "next/link";

const useCases = [
  {
    href: "/use-cases/restaurants",
    title: "Restaurants",
    description:
      "HACCP plans, opening checks, allergen controls, and corrective action records for full-service and quick-service restaurants.",
  },
  {
    href: "/use-cases/cafes",
    title: "Cafes",
    description:
      "Practical food safety workflows for coffee shops, bakeries, and small grab-and-go operations.",
  },
  {
    href: "/use-cases/catering",
    title: "Catering businesses",
    description:
      "Document transport, hot-hold, cooling, event prep, and allergen controls across mobile and fixed operations.",
  },
  {
    href: "/use-cases/food-manufacturing",
    title: "Food manufacturing",
    description:
      "Support hazard analysis, SOP control, traceability, and internal audit prep for growing production sites.",
  },
];

export const metadata: Metadata = {
  title: "Use Cases | PinkPepper Food Safety Software",
  description:
    "See how PinkPepper supports restaurants, cafes, caterers, and food manufacturers with food safety compliance workflows.",
  alternates: {
    canonical: "https://pinkpepper.io/use-cases",
  },
};

export default function UseCasesPage() {
  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Use-case hub</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">
            Food safety workflows mapped to the way different food businesses operate
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            Restaurants, cafes, caterers, and manufacturers do not need the same controls, records, or review cycles.
            These pages show how PinkPepper fits each operating model so teams can start from workflows that feel familiar.
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
        <div className="pp-container grid gap-6 md:grid-cols-2">
          <Link
            href="/features/haccp-plan-generator"
            className="rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E11D48]">Features</p>
            <p className="mt-3 text-2xl font-semibold text-[#0F172A]">Connect each use case to the right workflow</p>
            <p className="mt-4 text-sm leading-relaxed text-[#475569]">
              Move from business-type pages into HACCP, allergen, SOP, and audit-prep feature details.
            </p>
          </Link>
          <Link
            href="/pricing"
            className="rounded-3xl border border-[#FBCFE8] bg-[#FFF1F2] p-8 transition-all hover:-translate-y-0.5 hover:border-[#FDA4AF] hover:shadow-xl hover:shadow-black/[0.04]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E11D48]">Pricing</p>
            <p className="mt-3 text-2xl font-semibold text-[#0F172A]">Choose a plan for your operating model</p>
            <p className="mt-4 text-sm leading-relaxed text-[#475569]">
              Compare plans once you know which documents, exports, and audit workflows your team needs most.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
