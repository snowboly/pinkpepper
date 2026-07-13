import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Food Safety Consultant with Human Expert Review | PinkPepper",
  description:
    "Use PinkPepper as an AI food safety consultant for HACCP, SOPs, allergen records, and compliance questions, with optional human food safety consultant review for higher-risk work.",
  alternates: { canonical: "https://pinkpepper.io/ai-food-safety-consultant" },
};

const helpItems = [
  "Draft HACCP plans, hazard analysis notes, monitoring records, and corrective action wording.",
  "Create practical SOPs for cleaning, hygiene, temperature checks, training, traceability, and supplier approval.",
  "Organise allergen records, recipe controls, cross-contact notes, and front-of-house guidance.",
  "Explain EU and UK food safety concepts in plain language so teams can review the draft more confidently.",
];

const useCases = ["HACCP plans", "SOPs", "allergen records", "cleaning schedules", "traceability", "supplier approval"];
const audiences = [
  { label: "restaurants", href: "/use-cases/restaurants" },
  { label: "cafés", href: "/use-cases/cafes" },
  { label: "caterers", href: "/use-cases/catering" },
  { label: "food manufacturers", href: "/use-cases/food-manufacturing" },
];

export default function AiFoodSafetyConsultantPage() {
  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-[#F8FAFC] py-16 md:py-24">
        <div className="pp-container max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">AI speed + human expertise</p>
          <h1 className="pp-display mt-4 max-w-4xl text-4xl font-bold leading-tight text-[#0F172A] md:text-6xl">
            AI food safety consultant with human expert review when needed
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            PinkPepper helps EU and UK food businesses move faster on HACCP, SOPs, allergen records, and compliance
            questions. Use AI for structured drafts and explanations, then add human food safety consultant review for
            higher-risk work that needs expert judgement.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-[#E11D48] px-6 py-3 text-sm font-semibold text-white hover:bg-[#BE123C]">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC]">See pricing</Link>
            <Link href="/human-review" className="rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC]">Human review</Link>
          </div>
        </div>
      </section>
      <section className="bg-white py-16"><div className="pp-container grid max-w-6xl gap-8 lg:grid-cols-2">
        <article className="rounded-3xl border border-[#E2E8F0] bg-white p-8"><h2 className="text-2xl font-semibold text-[#0F172A]">What an AI food safety consultant can help with</h2><ul className="mt-6 space-y-4 text-sm leading-relaxed text-[#475569]">{helpItems.map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />{item}</li>)}</ul></article>
        <article className="rounded-3xl border border-[#E2E8F0] bg-[#FFF8FB] p-8"><h2 className="text-2xl font-semibold text-[#0F172A]">Where human review fits</h2><p className="mt-4 text-sm leading-relaxed text-[#475569]">Human food safety consultant support is for escalation: unusual processes, validation questions, high-risk products, sensitive customer groups, enforcement issues, or a final sense-check before your team adopts important documents. It can review and challenge drafts, but it cannot certify your business, inspect conditions remotely, or remove your responsibility for implementation.</p></article>
      </div></section>
      <section className="border-y border-[#F1F5F9] bg-[#F8FAFC] py-16"><div className="pp-container max-w-5xl"><h2 className="text-2xl font-semibold text-[#0F172A]">Who it is for</h2><div className="mt-6 flex flex-wrap gap-3">{audiences.map((item) => <Link key={item.href} href={item.href} className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#475569] hover:text-[#0F172A]">{item.label}</Link>)}</div><h2 className="mt-12 text-2xl font-semibold text-[#0F172A]">Common use cases</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{useCases.map((item) => <div key={item} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 text-sm font-semibold text-[#0F172A]">{item}</div>)}</div></div></section>
      <section className="bg-white py-16"><div className="pp-container max-w-4xl rounded-3xl border border-[#FBCFE8] bg-[#FFF1F2] p-8"><h2 className="text-2xl font-semibold text-[#0F172A]">Limitations to understand</h2><p className="mt-4 text-sm leading-relaxed text-[#475569]">PinkPepper is not legal advice, certification, approval, or a replacement for competent site management. AI outputs are drafts that must be reviewed, adapted to your business, checked against local requirements, and implemented by the food business operator.</p></div></section>
    </main>
  );
}
