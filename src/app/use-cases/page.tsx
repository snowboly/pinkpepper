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
            Food safety software pages mapped to real business types
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            PinkPepper is easier to buy when prospects can see their own workflow on the page. These use-case pages
            translate product features into restaurant, cafe, catering, and manufacturing contexts.
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
    </main>
  );
}
