import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PinkPepper vs Food Safety Consultant | PinkPepper",
  description:
    "See where PinkPepper fits well, where a human food safety consultant is still necessary, and how teams can use both together for EU and UK compliance work.",
  alternates: {
    canonical: "https://pinkpepper.io/compare/pinkpepper-vs-consultant",
    languages: {
      "x-default": "https://pinkpepper.io/compare/pinkpepper-vs-consultant",
      en: "https://pinkpepper.io/compare/pinkpepper-vs-consultant",
    },
  },
};

const comparisonRows = [
  {
    topic: "Routine documentation drafts",
    pinkpepper: "Strong fit. Useful for first drafts, structure, checklists, and recurring compliance questions.",
    consultant: "Usually unnecessary for every routine draft if the business already understands the operational context.",
  },
  {
    topic: "Site-specific verification",
    pinkpepper: "Cannot inspect premises, observe behaviors, or physically verify controls.",
    consultant: "Strong fit where physical review, validation, or implementation assessment is needed.",
  },
  {
    topic: "Audit-style findings and CAPA structure",
    pinkpepper: "Useful for structured preparation and evidence-gap thinking through Consultant and Auditor modes.",
    consultant: "Stronger where the finding requires professional judgement tied to a live site or external standard.",
  },
  {
    topic: "Higher-risk legal or enforcement situations",
    pinkpepper: "Not a substitute for legal advice or specialist representation.",
    consultant: "Often the correct escalation path, especially when enforcement, certification, or serious incidents are involved.",
  },
];

const whoItsFor = [
  {
    title: "Choose PinkPepper first when",
    bullets: [
      "you need faster first drafts of HACCP plans, SOPs, monitoring records, or allergen documents",
      "your team already knows the operation and needs structure more than external site review",
      "the work is repetitive, document-heavy, and too expensive to send to a consultant every time",
    ],
  },
  {
    title: "Choose a consultant first when",
    bullets: [
      "you need site validation, enforcement support, or certification-facing review",
      "the process is high risk and the business needs someone to assess the physical operation directly",
      "the decision cannot safely rely on document review and remote guidance alone",
    ],
  },
  {
    title: "Use both together when",
    bullets: [
      "you want PinkPepper to accelerate the drafting and review-prep work before human sign-off",
      "the team wants to reduce routine consultant hours while keeping expert escalation for the higher-risk decisions",
      "you need a cleaner working draft before paying for specialist review time",
    ],
  },
];

export default function PinkPepperVsConsultantPage() {
  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Comparison</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">PinkPepper vs a food safety consultant</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            This is not a serious software-versus-human argument. The useful question is narrower: which parts of food
            safety work are repetitive, document-heavy, and suitable for software support, and which parts still need
            site-specific professional judgement?
          </p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-14">
        <div className="pp-container max-w-4xl">
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-8">
            <h2 className="text-2xl font-semibold text-[#0F172A]">Short answer</h2>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              PinkPepper fits best where the job is drafting, structuring, reviewing, and iterating on compliance work
              that already depends on your own operational knowledge. A consultant still matters where someone needs to
              verify the site, apply specialist judgement to a live situation, or take responsibility for higher-risk
              review and escalation.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="pp-container max-w-5xl">
          <h2 className="text-2xl font-semibold text-[#0F172A]">Comparison table</h2>
          <div className="mt-8 overflow-hidden rounded-3xl border border-[#E2E8F0]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-left">
                  <th className="border-b border-[#E2E8F0] px-6 py-4 text-sm font-semibold text-[#0F172A]">Work type</th>
                  <th className="border-b border-[#E2E8F0] px-6 py-4 text-sm font-semibold text-[#0F172A]">PinkPepper</th>
                  <th className="border-b border-[#E2E8F0] px-6 py-4 text-sm font-semibold text-[#0F172A]">Consultant</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.topic} className="align-top">
                    <td className="border-b border-[#F1F5F9] px-6 py-5 text-sm font-semibold text-[#0F172A]">{row.topic}</td>
                    <td className="border-b border-[#F1F5F9] px-6 py-5 text-sm leading-relaxed text-[#475569]">{row.pinkpepper}</td>
                    <td className="border-b border-[#F1F5F9] px-6 py-5 text-sm leading-relaxed text-[#475569]">{row.consultant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-y border-[#F1F5F9] bg-[#FFF7ED] py-14">
        <div className="pp-container max-w-5xl">
          <div className="grid gap-6 md:grid-cols-3">
            {whoItsFor.map((section) => (
              <div key={section.title} className="rounded-3xl border border-[#FED7AA] bg-white p-7">
                <h2 className="text-lg font-semibold text-[#0F172A]">{section.title}</h2>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#475569]">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>- {bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="pp-container max-w-5xl">
          <h2 className="text-2xl font-semibold text-[#0F172A]">Useful next steps</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Link
              href="/pricing"
              className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-7 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
            >
              <p className="text-lg font-semibold text-[#0F172A]">Review pricing</p>
              <p className="mt-3 text-sm leading-relaxed text-[#475569]">See where Consultant mode, Auditor mode, and human consultancy fit in the current product model.</p>
            </Link>
            <Link
              href="/regulations-covered"
              className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-7 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
            >
              <p className="text-lg font-semibold text-[#0F172A]">See regulations covered</p>
              <p className="mt-3 text-sm leading-relaxed text-[#475569]">Understand the EU and UK regulatory areas PinkPepper is grounded in before you compare workflows.</p>
            </Link>
            <Link
              href="/about"
              className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-7 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
            >
              <p className="text-lg font-semibold text-[#0F172A]">Read the product background</p>
              <p className="mt-3 text-sm leading-relaxed text-[#475569]">Use the about page if you want the product context and founder rationale behind PinkPepper.</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
