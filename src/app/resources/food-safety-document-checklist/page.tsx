import type { Metadata } from "next";
import Link from "next/link";

const checklistSections = [
  {
    title: "Core food safety system documents",
    items: [
      "HACCP plan or equivalent food safety management system documentation",
      "Process flow or product/process descriptions relevant to the business",
      "Prerequisite programme or supporting hygiene procedures",
      "Cleaning and disinfection SOPs and schedules",
      "Personal hygiene and illness reporting procedures",
      "Pest control arrangements and monitoring records",
    ],
  },
  {
    title: "Monitoring and verification records",
    items: [
      "Fridge, freezer, hot-hold, cooling, and reheating temperature logs",
      "Corrective action records linked to out-of-limit events",
      "Calibration records for thermometers and measuring equipment",
      "Cleaning verification records where used",
      "Internal review or verification checklists",
      "Training records and refresher evidence",
    ],
  },
  {
    title: "Allergen, traceability, and supplier control",
    items: [
      "Allergen matrix or documented allergen information source",
      "Cross-contact prevention procedures",
      "Supplier approval records and specifications",
      "Goods-inward or delivery inspection records",
      "Traceability and recall procedure documentation",
      "Mock recall or traceability exercise evidence where applicable",
    ],
  },
];

export const metadata: Metadata = {
  title: "EU and UK Food Safety Document Checklist | PinkPepper",
  description:
    "Use this EU and UK food safety document checklist to review HACCP, SOPs, allergen records, traceability, monitoring logs, and audit-readiness documents.",
  alternates: {
    canonical: "https://www.pinkpepper.io/resources/food-safety-document-checklist",
  },
};

export default function FoodSafetyDocumentChecklistPage() {
  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Authority asset</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">
            EU and UK food safety document checklist
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            This checklist is designed to help food businesses review whether their documentation system is complete enough
            for day-to-day control, internal review, and audit preparation. It is broad enough to be useful across restaurants,
            cafes, catering businesses, and smaller manufacturing operations.
          </p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16">
        <div className="pp-container grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
            <p className="text-base font-semibold leading-relaxed text-[#0F172A]">
              Use it to spot missing documents before inspection pressure hits.
            </p>
          </div>
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
            <p className="text-base font-semibold leading-relaxed text-[#0F172A]">
              Use it as a framework for internal review and document cleanup.
            </p>
          </div>
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
            <p className="text-base font-semibold leading-relaxed text-[#0F172A]">
              Use it to move from scattered records to a clearer compliance system.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="pp-container max-w-5xl space-y-8">
          {checklistSections.map((section) => (
            <section key={section.title} className="rounded-3xl border border-[#E2E8F0] bg-white p-8">
              <h2 className="text-2xl font-semibold text-[#0F172A]">{section.title}</h2>
              <ul className="mt-6 space-y-4 text-sm leading-relaxed text-[#475569]">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#E11D48]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="pp-container text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Ready to start?</p>
          <h2 className="pp-display mx-auto mt-3 max-w-xl text-3xl text-[#0F172A] md:text-4xl">
            Start free. No card required.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-[#64748B]">
            Try PinkPepper on a real compliance question today.
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
