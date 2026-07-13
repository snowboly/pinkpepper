import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Regulations Covered | PinkPepper",
  description:
    "See which EU and UK food safety regulations, official guidance areas, and HACCP topics PinkPepper covers across hygiene, allergens, traceability, import/export, and official controls.",
  alternates: {
    canonical: "https://pinkpepper.io/regulations-covered",
    languages: {
      "x-default": "https://pinkpepper.io/regulations-covered",
      en: "https://pinkpepper.io/regulations-covered",
    },
  },
};

const coverageGroups = [
  {
    title: "General food law and traceability",
    body:
      "PinkPepper covers the core obligations behind traceability, withdrawal, recall, and food-business responsibility, including the structure businesses rely on for one-step-back and one-step-forward control.",
    bullets: [
      "General food law and unsafe-food response duties",
      "Traceability and batch-reference expectations",
      "Recall and withdrawal workflow design",
    ],
  },
  {
    title: "Hygiene and HACCP",
    body:
      "This is the main operational layer: prerequisite controls, HACCP methodology, hazard analysis, critical limits, monitoring, corrective action, verification, and food safety management system structure.",
    bullets: [
      "Regulation-driven hygiene expectations",
      "Codex-based HACCP methodology and working interpretation",
      "Monitoring records, CCP logic, and corrective actions",
    ],
  },
  {
    title: "Food information and allergens",
    body:
      "PinkPepper covers allergen communication, written allergen control, recipe-change discipline, and food-information obligations that affect menus, labels, and staff answers.",
    bullets: [
      "EU and UK food-information duties",
      "Natasha's Law and PPDS context where relevant",
      "Allergen matrices, change control, and service communication",
    ],
  },
  {
    title: "Official controls, imports, and exports",
    body:
      "PinkPepper covers the operational side of import and export compliance, including official-control concepts, border process structure, certification dependencies, and product-route decision points.",
    bullets: [
      "Official controls and border-process structure",
      "Great Britain imports from non-EU countries",
      "Great Britain exports into the European Union",
    ],
  },
];

const nextLinks = [
  {
    href: "/ai-food-safety-consultant",
    title: "AI food safety consultant",
    description: "See how AI drafts fit with optional human food safety consultant review and user responsibility.",
  },
  {
    href: "/methodology",
    title: "Understand the methodology",
    description: "See how PinkPepper separates legal requirements, guidance, and methodology-dependent decisions.",
  },
  {
    href: "/articles/how-to-import-food-into-great-britain-from-non-eu-countries",
    title: "Import food into Great Britain",
    description: "Use the full GB non-EU import guide when you need a step-by-step border and document workflow.",
  },
  {
    href: "/articles/how-to-export-food-from-great-britain-to-the-eu",
    title: "Export food from Great Britain to the EU",
    description: "Use the export guide when you need the Great Britain to EU route mapped out practically.",
  },
  {
    href: "/features/haccp-plan-generator",
    title: "See the HACCP workflow",
    description: "Move from legal coverage into the product workflow for hazard analysis, CCP logic, and corrective action drafting.",
  },
  {
    href: "/resources/food-safety-document-checklist",
    title: "Start with the document checklist",
    description: "Use the document checklist if you need a clearer map of the working records food businesses are usually asked to maintain.",
  },
];

export default function RegulationsCoveredPage() {
  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Coverage</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">What regulations and compliance areas PinkPepper covers</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            PinkPepper is built for EU and UK food businesses that need practical help with HACCP, allergens,
            monitoring records, traceability, and import or export workflows. This page explains the coverage boundary
            clearly so you can see what the product is grounded in and where human review is still necessary.
          </p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-14">
        <div className="pp-container max-w-4xl">
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-8">
            <h2 className="text-2xl font-semibold text-[#0F172A]">Three important distinctions</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                <p className="text-sm font-semibold text-[#0F172A]">Legal requirements</p>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  Where primary law or retained law clearly creates an obligation, PinkPepper should point to that directly.
                </p>
              </div>
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                <p className="text-sm font-semibold text-[#0F172A]">Official guidance and operational practice</p>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  Some answers depend on regulator guidance, border process instructions, or accepted working practice rather than one article of law alone.
                </p>
              </div>
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                <p className="text-sm font-semibold text-[#0F172A]">Methodology-dependent HACCP decisions</p>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  HACCP classification and control design can depend on the site, the process, and the chosen methodology. PinkPepper should say that plainly instead of pretending every answer is universal law.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="pp-container max-w-4xl space-y-10">
          {coverageGroups.map((group) => (
            <article key={group.title}>
              <h2 className="text-2xl font-semibold text-[#0F172A]">{group.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-[#475569]">{group.body}</p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#475569]">
                {group.bullets.map((bullet) => (
                  <li key={bullet}>- {bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#F1F5F9] bg-[#FFF7ED] py-14">
        <div className="pp-container max-w-4xl">
          <h2 className="text-2xl font-semibold text-[#0F172A]">What this page does not mean</h2>
          <p className="mt-4 text-base leading-relaxed text-[#475569]">
            Coverage is not the same as legal advice, third-party certification, or site-specific approval. PinkPepper
            helps teams work faster with stronger draft documents, clearer regulatory direction, and better structured
            questions. Your business still carries responsibility for the final document set, the implemented controls,
            and the decision to escalate to a qualified food safety professional where risk is higher.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="pp-container max-w-5xl">
          <h2 className="text-2xl font-semibold text-[#0F172A]">Where to go next</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {nextLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-7 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
              >
                <p className="text-lg font-semibold text-[#0F172A]">{link.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#475569]">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
