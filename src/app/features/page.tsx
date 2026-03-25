import type { Metadata } from "next";
import Link from "next/link";

const services = [
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
  {
    href: "/resources",
    title: "Downloadable compliance templates",
    description:
      "Access ready-made templates when you need a starting point that is easier to adapt than building records from scratch.",
    includes: ["Logs and forms", "Policies and procedures", "Handover-ready template packs"],
  },
  {
    href: "/pricing",
    title: "Conversation export and handover",
    description:
      "Keep useful work moving by exporting conversations into a format your team can file, review, and share more easily.",
    includes: ["DOCX conversation export", "Cleaner internal handover", "Review-ready working drafts"],
  },
  {
    href: "/contact",
    title: "Specialist review support",
    description:
      "Bring in human support when a decision carries more risk, needs a second pair of eyes, or should not rely on a draft alone.",
    includes: ["Higher-risk document review", "Specialist escalation", "Commercial support conversations"],
  },
  {
    href: "/pricing",
    title: "Virtual audit workflows",
    description:
      "Use PinkPepper to prepare for internal reviews and inspection pressure with a more structured way to check what is missing.",
    includes: ["Inspection prep", "Gap-spotting workflows", "Pro plan support"],
  },
];

const includedItems = [
  "Practical support for HACCP, SOPs, allergen records, and audit preparation",
  "Templates, exports, and working drafts your team can reuse internally",
  "A clearer route from day-to-day questions to specialist support when needed",
];

const reasons = [
  {
    title: "Written for real compliance work",
    body: "The page is built around the documents and checks teams actually need to complete, not abstract product language.",
  },
  {
    title: "Grounded in EU and UK food safety context",
    body: "PinkPepper is aimed at the operational and regulatory work food businesses face in practice.",
  },
  {
    title: "Useful when speed matters, safer when judgment matters",
    body: "Move faster on the routine work, then bring in specialist backup when the stakes are higher.",
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
            Food safety support for teams that need practical compliance work done properly.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            PinkPepper helps food businesses move faster on HACCP, allergen records, SOPs, audit preparation, templates,
            exports, and higher-risk review work without turning the page into software jargon.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="pp-interactive rounded-full bg-[#0F172A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1E293B]"
            >
              Talk to us
            </Link>
            <Link
              href="/pricing"
              className="pp-interactive rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-[#F1F5F9] bg-[#F8FAFC] py-12">
        <div className="pp-container grid gap-4 md:grid-cols-3">
          {includedItems.map((item) => (
            <div key={item} className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
              <p className="text-sm leading-relaxed text-[#475569]">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16">
        <div className="pp-container">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">What we help with</p>
            <h2 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-5xl">
              Practical support across the work most teams are trying to get under control.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service) => (
              <div key={service.title} className="rounded-3xl border border-[#E2E8F0] bg-white p-8">
                <p className="text-2xl font-semibold text-[#0F172A]">{service.title}</p>
                <p className="mt-4 text-sm leading-relaxed text-[#475569]">{service.description}</p>
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E11D48]">Typical support includes</p>
                  <ul className="mt-3 space-y-2 text-sm text-[#475569]">
                    {service.includes.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <Link
                  href={service.href}
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
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Why teams use PinkPepper</p>
            <h2 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-5xl">
              A clearer way to move from questions and drafts to usable compliance work.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {reasons.map((reason) => (
              <div key={reason.title} className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-8">
                <p className="text-xl font-semibold text-[#0F172A]">{reason.title}</p>
                <p className="mt-4 text-sm leading-relaxed text-[#475569]">{reason.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="pp-container rounded-3xl border border-[#FCE7F3] bg-[#FFF1F2] p-8 md:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Next step</p>
            <h2 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-5xl">
              If you need help with food safety work, start the conversation.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[#475569]">
              Use PinkPepper when you want quicker progress on the day-to-day work, then talk to us when the task needs a
              closer review or more specialist input.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="pp-interactive rounded-full bg-[#E11D48] px-6 py-3 text-sm font-semibold text-white hover:bg-[#BE123C]"
            >
              Talk to us
            </Link>
            <Link
              href="/pricing"
              className="pp-interactive rounded-full border border-[#FBCFE8] bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] hover:bg-[#FFF7F8]"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
