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

const relatedLinks = [
  {
    href: "/features/haccp-plan-generator",
    title: "HACCP plan generator",
    description: "See the workflow behind hazard analysis, CCP structure, and corrective action drafting.",
  },
  {
    href: "/resources/haccp-plan-template",
    title: "HACCP plan template",
    description: "Start with the template if you need a cleaner structure before using the product workflow.",
  },
];

export const metadata: Metadata = {
  title: "Food Safety Software for Restaurants, Cafes, Caterers & Manufacturers | PinkPepper",
  description:
    "AI food safety software built for your operation. HACCP plans, SOPs, allergen records & audit prep for restaurants, cafes, caterers & manufacturers.",
  alternates: {
    canonical: "https://www.pinkpepper.io/use-cases",
  },
};

export default function UseCasesPage() {
  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Use-case hub</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">
            Food safety workflows mapped to how different food businesses actually operate
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            Restaurants, cafes, caterers, and manufacturers do not run the same controls or records. Start with the
            operating model that matches your business, then move into the relevant HACCP, allergen, SOP, and audit
            workflows.
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
