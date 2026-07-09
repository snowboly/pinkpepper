import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Methodology | PinkPepper",
  description:
    "See how PinkPepper forms food safety answers and drafts across EU and UK regulations, official guidance, HACCP methodology, and practical business context.",
  alternates: {
    canonical: "https://pinkpepper.io/methodology",
    languages: {
      "x-default": "https://pinkpepper.io/methodology",
      en: "https://pinkpepper.io/methodology",
    },
  },
};

const foundationGroups = [
  {
    title: "Regulations with direct legal force",
    body:
      "PinkPepper is grounded in the legal frameworks food businesses actually operate under, including EU regulations, retained UK law, and relevant UK statutory instruments.",
    bullets: [
      "General food law, hygiene, food information, traceability, and official controls",
      "Retained UK versions of EU food law where they still form the operative framework",
      "Food Safety Act 1990 and key UK food-information and hygiene instruments",
    ],
  },
  {
    title: "Official guidance and recognised standards",
    body:
      "Where the law sets the destination but not the working method, PinkPepper relies on official guidance, regulator publications, and recognised audit or hygiene frameworks to help structure the answer.",
    bullets: [
      "FSA guidance and practical enforcement-facing material",
      "European Commission guidance on HACCP and official controls",
      "Codex and recognised audit structures where they help users work through the task",
    ],
  },
  {
    title: "Methodology-dependent HACCP decisions",
    body:
      "Some questions cannot be answered by pointing at one article of law. HACCP decisions often depend on process flow, kill steps, intended use, shelf life, and what is actually happening on the site.",
    bullets: [
      "Hazard identification, control selection, and CCP logic",
      "Monitoring structure and corrective-action design",
      "Business-specific decisions that need the operator's real facts, not generic assumptions",
    ],
  },
];

const strengths = [
  "Drafting HACCP plans, SOPs, allergen records, and monitoring structures faster",
  "Mapping practical document work back to the right regulatory or guidance layer",
  "Helping teams structure recurring compliance questions instead of starting from a blank page",
  "Supporting import and export workflow thinking where the route depends on product and operational facts",
];

const limits = [
  "It does not replace legal advice, certification decisions, or enforcement representation.",
  "It cannot validate a shelf life, swab a site, or carry out physical verification of your operation.",
  "It should not be treated as the final sign-off when the answer depends on site-specific evidence or higher-risk judgement.",
];

const nextLinks = [
  {
    href: "/regulations-covered",
    title: "See the regulations covered",
    description: "Use the coverage page if you want the regulatory footprint grouped more explicitly.",
  },
  {
    href: "/pricing",
    title: "See how this fits the product",
    description: "Use pricing to understand where Consultant mode, Auditor mode, and human consultancy fit together.",
  },
  {
    href: "/articles/how-to-import-food-into-great-britain-from-non-eu-countries",
    title: "Read a worked import guide",
    description: "Open the GB import guide to see how PinkPepper handles a structured, regulation-heavy operational topic.",
  },
];

export default function MethodologyPage() {
  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Methodology</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">
            How PinkPepper forms food safety answers and drafts
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            PinkPepper is an AI food safety consultant built for EU and UK food businesses. It helps with
            HACCP, allergen records, SOPs, monitoring logs, traceability, audit preparation, and import or export
            workflows. This page explains what sits behind the output, what the system is strong at, and where your
            own judgement still matters.
          </p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-14">
        <div className="pp-container max-w-4xl">
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-8">
            <h2 className="text-2xl font-semibold text-[#0F172A]">What PinkPepper is built to do</h2>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              PinkPepper is built to reduce the friction of everyday food safety compliance work. It helps businesses
              move faster on recurring documentation and structured questions, but it is not a substitute for a
              competent operator, a certifying body, or a site-specific expert review where the risk is higher.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              The output should be treated as working material: a stronger first draft, a better-structured answer, or
              a clearer route through a regulation-heavy task. The responsibility for the final document and the final
              operational decision still belongs to the business.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="pp-container max-w-4xl space-y-10">
          <article>
            <h2 className="text-2xl font-semibold text-[#0F172A]">What PinkPepper is grounded in</h2>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              The system does not rely on one layer of authority alone. Some answers are driven by legal requirements.
              Others depend on official guidance, regulator process instructions, or established HACCP methodology.
              Good output comes from separating those layers instead of pretending they are all the same thing.
            </p>
          </article>

          {foundationGroups.map((group) => (
            <article key={group.title}>
              <h3 className="text-xl font-semibold text-[#0F172A]">{group.title}</h3>
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
          <h2 className="text-2xl font-semibold text-[#0F172A]">How PinkPepper forms answers and drafts</h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-[#475569]">
            <p>
              The system first maps the likely regulatory area. A question about date marking, for example, may sit
              partly in food information law, partly in microbiological expectations, and partly in operational shelf
              life practice.
            </p>
            <p>
              It then layers on official guidance or recognised HACCP working structure where the law sets an outcome
              but not a detailed method. That matters because many food safety tasks are not solved by finding a
              single article number and stopping there.
            </p>
            <p>
              Finally, the system depends on the business facts you provide. If the answer turns on whether a product
              is ready-to-eat, whether there is a kill step, or whether the site exports to more than one market, the
              quality of the output depends directly on those inputs.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="pp-container max-w-5xl">
          <div className="grid gap-8 md:grid-cols-2">
            <article className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-8">
              <h2 className="text-2xl font-semibold text-[#0F172A]">Where the system is strong</h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#475569]">
                {strengths.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-8">
              <h2 className="text-2xl font-semibold text-[#0F172A]">Where human judgement is still necessary</h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#475569]">
                {limits.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-[#F1F5F9] bg-[#F8FAFC] py-14">
        <div className="pp-container max-w-4xl">
          <h2 className="text-2xl font-semibold text-[#0F172A]">How users should work with the output</h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-[#475569]">
            <p>
              Review the draft, do not rubber-stamp it. If the system assumed a kill step and your process does not
              have one, the draft has to change.
            </p>
            <p>
              Treat clarifying prompts as checkpoints. When the system asks for operational facts, the answer matters.
              Weak inputs produce weak output.
            </p>
            <p>
              Escalate when the issue is higher risk. Novel processes, enforcement questions, certification-facing
              decisions, validation work, and site-specific disputes still need competent human review.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="pp-container max-w-5xl">
          <h2 className="text-2xl font-semibold text-[#0F172A]">Practical next steps</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
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
