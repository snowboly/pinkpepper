import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Human Review | PinkPepper",
  description:
    "See when PinkPepper output can move work forward on its own and when food safety decisions still need human review, site knowledge, validation, or specialist escalation.",
  alternates: {
    canonical: "https://pinkpepper.io/human-review",
    languages: {
      "x-default": "https://pinkpepper.io/human-review",
      en: "https://pinkpepper.io/human-review",
    },
  },
};

const safeUseCases = [
  "first drafts of HACCP plans, SOPs, allergen records, and monitoring logs",
  "structuring recurring compliance questions before internal review",
  "identifying obvious document gaps, missing records, or weak wording",
  "organising import or export workflows before the final commercial and certification checks",
];

const escalationTriggers = [
  "validation of cook, chill, or shelf-life decisions",
  "site-specific verification of controls, behaviours, or equipment performance",
  "enforcement, legal, or certification-facing disputes",
  "novel processes, unusual products, or high-risk consumer groups",
];

const reviewReasons = [
  {
    title: "The system cannot see your site",
    body:
      "PinkPepper can work from the facts you provide, but it cannot inspect premises, observe staff behaviour, or confirm that a written control is actually followed in practice.",
  },
  {
    title: "Some decisions need validation, not drafting",
    body:
      "When the real question is whether a critical limit is safe, whether a shelf life is justified, or whether a process genuinely controls a hazard, the right next step is evidence and professional judgement, not another draft paragraph.",
  },
  {
    title: "Accountability still sits with the business",
    body:
      "If a document is signed off, shown to an auditor, relied on for certification, or challenged by an authority, the business remains responsible for the final position taken.",
  },
];

const nextLinks = [
  {
    href: "/ai-food-safety-consultant",
    title: "AI food safety consultant",
    description: "See what AI can help with, where human review fits, and the limits users need to understand.",
  },
  {
    href: "/methodology",
    title: "Read the methodology",
    description: "Use methodology first if you want to understand how PinkPepper forms answers before you decide when to escalate.",
  },
  {
    href: "/compare/haccp-software-alternatives",
    title: "Compare HACCP software alternatives",
    description: "Use the alternatives page if you are deciding between generic tools, template libraries, and food-specific compliance software.",
  },
  {
    href: "/compare/pinkpepper-vs-consultant",
    title: "Compare PinkPepper vs consultant",
    description: "Use the comparison page if you want the boundary explained in a more commercial decision-making format.",
  },
  {
    href: "/pricing",
    title: "See how review fits the product",
    description: "Check pricing to understand where Consultant mode, Auditor mode, and human consultancy fit together.",
  },
];

export default function HumanReviewPage() {
  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Human review</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">
            Human food safety consultant review for higher-risk work
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            PinkPepper is designed to move routine food safety work forward faster. It is not designed to remove human
            judgement from higher-risk decisions. This page explains the boundary clearly: where AI food safety consultant support is enough to improve a draft, and where a competent human food safety consultant should review, validate, or take over.
          </p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-14">
        <div className="pp-container max-w-5xl">
          <div className="grid gap-8 md:grid-cols-2">
            <article className="rounded-3xl border border-[#E2E8F0] bg-white p-8">
              <h2 className="text-2xl font-semibold text-[#0F172A]">Usually fine without specialist escalation first</h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#475569]">
                {safeUseCases.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl border border-[#E2E8F0] bg-white p-8">
              <h2 className="text-2xl font-semibold text-[#0F172A]">Strong reasons to escalate to human review</h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#475569]">
                {escalationTriggers.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="pp-container max-w-4xl space-y-8">
          {reviewReasons.map((reason) => (
            <article key={reason.title}>
              <h2 className="text-2xl font-semibold text-[#0F172A]">{reason.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-[#475569]">{reason.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#F1F5F9] bg-[#FFF7ED] py-14">
        <div className="pp-container max-w-4xl">
          <h2 className="text-2xl font-semibold text-[#0F172A]">Practical rule of thumb</h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-[#475569]">
            <p>
              If the task is mostly about structure, drafting, checklist logic, or pulling together a clearer first
              pass, PinkPepper is usually a strong first stop.
            </p>
            <p>
              If the task depends on physical verification, specialist validation, local enforcement interpretation, or
              accepting responsibility for a higher-risk judgement call, the business should escalate to a competent
              human reviewer.
            </p>
            <p>
              The point is not to slow work down unnecessarily. The point is to use software where it genuinely helps
              and bring in human expertise where the real risk sits.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="pp-container max-w-5xl">
          <h2 className="text-2xl font-semibold text-[#0F172A]">Where to go next</h2>
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
