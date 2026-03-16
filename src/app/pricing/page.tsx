import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail, Star, XCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import PricingActions from "@/components/pricing/PricingActions";

export const metadata: Metadata = {
  title: "Pricing | PinkPepper - AI Food Safety Compliance Software",
  description:
    "Pricing for food safety teams that need faster document production, safer audit prep, and specialist review when the risk is higher.",
  alternates: {
    canonical: "https://pinkpepper.io/pricing",
  },
};

export default async function PricingPage() {
  let isLoggedIn = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isLoggedIn = !!user;
  } catch {
    // Supabase env vars unavailable during build-time prerendering; assume not logged in
  }

  const ctaBase =
    "mt-8 block w-full rounded-xl py-3.5 text-center text-sm font-semibold transition-colors";
  const ctaPrimary = `${ctaBase} bg-[#FDA4AF] text-white hover:bg-[#FECDD3]`;
  const ctaSecondary = `${ctaBase} border border-[#FBCFE8] bg-[#FFF1F2] text-[#BE123C] hover:bg-[#FFE4E6]`;
  const ctaNeutral = `${ctaBase} border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]`;

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PinkPepper",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://pinkpepper.io",
    description:
      "AI food safety compliance software for EU and UK food businesses. Generate HACCP plans, allergen documentation, SOPs, and audit-ready compliance documentation.",
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "EUR",
        description: "15 AI queries per day, 3 voice transcriptions, 10 saved conversations.",
      },
      {
        "@type": "Offer",
        name: "Plus",
        price: "19",
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "19",
          priceCurrency: "EUR",
          unitCode: "MON",
        },
        description: "100 messages per day, PDF export, 3 image uploads per day.",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "99",
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "99",
          priceCurrency: "EUR",
          unitCode: "MON",
        },
        description:
          "Virtual audit workflows, PDF and DOCX export, 3 specialist review credits per month.",
      },
    ],
  };

  return (
    <main className="overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <section className="py-16 text-center">
        <div className="pp-container max-w-3xl">
          <h1 className="pp-display text-4xl font-black tracking-tight text-[#0F172A] md:text-5xl">
            Pricing for AI food safety compliance software
          </h1>
          <p className="mt-4 text-lg text-[#475569]">
            Start by asking questions. Upgrade when you need deeper analysis, conversation export, audit-ready workflows, and specialist review for EU and UK food businesses.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-[#475569]">
            <Link href="/features/haccp-plan-generator" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              Review HACCP plan workflows
            </Link>
            <Link href="/use-cases/restaurants" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              See restaurant use cases
            </Link>
            <Link href="/resources/food-safety-document-checklist" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              Read the document checklist
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-4">
        <div className="pp-container max-w-5xl">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">Free</p>
              <h2 className="mt-2 text-lg font-semibold text-[#0F172A]">Learn and validate fit</h2>
              <p className="mt-2 text-sm text-[#64748B]">
                Use PinkPepper on real compliance questions before you commit.
              </p>
            </div>
            <div className="rounded-2xl border border-[#FBCFE8] bg-[#FFF1F2] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#BE123C]">Plus</p>
              <h2 className="mt-2 text-lg font-semibold text-[#0F172A]">Analyse faster and keep your working context</h2>
              <p className="mt-2 text-sm text-[#64748B]">
                Upload, analyse, and export chat conversations without losing your working context.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Pro</p>
              <h2 className="mt-2 text-lg font-semibold text-[#0F172A]">AI draft speed with specialist human review</h2>
              <p className="mt-2 text-sm text-[#64748B]">
                Advanced HACCP generation with DOCX and PDF export, plus qualified food safety specialist review when the work matters most.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-[#F1F5F9] bg-white py-16">
        <div className="pp-container">
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
            <div className="flex flex-col rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all duration-200 hover:shadow-lg hover:shadow-black/[0.04]">
              <h2 className="text-xl font-bold text-[#0F172A]">Free</h2>
              <p className="mt-2 text-sm text-[#64748B]">
                Best for operators testing fit on real questions and small day-to-day checks.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">€</span>0</span>
                <span className="text-base text-[#94A3B8]">/month</span>
              </div>
              <div className="my-6 border-t border-[#F1F5F9]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  Ask food safety and compliance questions before you buy
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  Check one photo per day for labels, kitchens, or product issues
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  Keep up to 10 saved conversations with 30-day history
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  15 AI queries and 3 voice transcriptions per day
                </li>
                <li className="flex items-start gap-2.5 opacity-50">
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#94A3B8]" />
                  No document generation or export
                </li>
                <li className="flex items-start gap-2.5 opacity-50">
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#94A3B8]" />
                  No virtual audit or specialist review
                </li>
              </ul>
              <Link href="/signup" className={ctaNeutral}>
                Get started free
              </Link>
            </div>

            {/* Plus */}
            <div className="flex flex-col rounded-3xl border-2 border-[#FBCFE8] bg-white p-8 shadow-md shadow-[#FDA4AF]/[0.08] transition-all duration-200 hover:shadow-lg hover:shadow-[#FDA4AF]/[0.12]">
              <h2 className="text-xl font-bold text-[#0F172A]">Plus</h2>
              <p className="mt-2 text-sm text-[#64748B]">
                For teams that need deeper operational analysis, not just a basic free chat.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">€</span>19</span>
                <span className="text-base text-[#94A3B8]">/month + VAT</span>
              </div>
              <div className="my-6 border-t border-[#FCE7F3]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  No generated compliance documents on Plus - use chat, uploads, and conversation export instead
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  Export work as PDF for handover, filing, or internal review
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  100 AI queries per day
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  3 image uploads per day for label, kitchen, or product checks
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  Unlimited saved conversations with extended working context
                </li>
              </ul>
              <PricingActions
                isLoggedIn={isLoggedIn}
                plan="plus"
                label="Choose Plus"
                className={ctaSecondary}
              />
            </div>

            {/* Pro — Most Popular */}
            <div className="relative flex flex-col rounded-3xl border-2 border-[#E11D48] bg-white p-8 shadow-lg shadow-[#E11D48]/[0.06]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#E11D48] px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
                <Star className="mr-1 inline h-3 w-3" />
                Most Popular
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">Pro</h2>
              <p className="mt-2 text-sm text-[#64748B]">
                For operators who want AI speed for drafting and qualified food safety specialist review before higher-risk decisions.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">€</span>99</span>
                <span className="text-base text-[#94A3B8]">/month + VAT</span>
              </div>
              <div className="my-6 border-t border-[#F1F5F9]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  Run Virtual Audit workflows before inspections or internal reviews
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  Export in both PDF and DOCX for internal editing and external sharing
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  3 human specialist review credits each month for quick checks or one full review
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  Highest daily limits for ongoing audit prep and operational use
                </li>
                <li className="flex items-start gap-2.5 font-medium text-[#9F1239]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  AI-generated drafts plus qualified food safety specialist review when confidence matters most
                </li>
              </ul>
              <PricingActions
                isLoggedIn={isLoggedIn}
                plan="pro"
                label="Choose Pro"
                className={ctaPrimary}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="pp-container max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-[#0F172A]">What changes as you move up</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
              <h3 className="mb-1 font-semibold text-[#0F172A]">Free</h3>
              <p className="text-sm text-[#64748B]">
                Ask questions, test photo analysis, and decide whether PinkPepper fits your operation before paying.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E11D48]/20 bg-[#FFF1F2] p-6">
              <h3 className="mb-1 font-semibold text-[#0F172A]">Plus</h3>
              <p className="text-sm text-[#64748B]">
                Move from basic chat to stronger analysis, file uploads, and PDF export for chat conversations.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
              <h3 className="mb-1 font-semibold text-[#0F172A]">Pro</h3>
              <p className="text-sm text-[#64748B]">
                Add advanced HACCP generation, DOCX export, virtual audits, and qualified food safety specialist review when the consequences of getting it wrong are higher.
              </p>
            </div>
          </div>
          <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-6">
            <h3 className="text-sm font-semibold text-[#0F172A]">Entitlement detail</h3>
            <div className="mt-4 grid gap-4 text-sm text-[#64748B] md:grid-cols-3">
              <div>
                <p className="font-medium text-[#334155]">Free</p>
                <p className="mt-1">15 queries/day, 1 image/day, 3 transcriptions/day, 10 saved conversations, 30-day retention.</p>
              </div>
              <div>
                <p className="font-medium text-[#334155]">Plus</p>
                <p className="mt-1">100 queries/day, 3 images/day, 25 transcriptions/day, no document generation, PDF export for chat conversations.</p>
              </div>
              <div>
                <p className="font-medium text-[#334155]">Pro</p>
                <p className="mt-1">1,000 queries/day, 20 images/day, 200 transcriptions/day, 20 document generations/day, advanced HACCP DOCX/PDF export, 3 review credits/month.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#F1F5F9] bg-[#F8FAFC] py-16">
        <div className="pp-container max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-[#0F172A]">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "How do review credits work?",
                a: "Pro users receive 3 review credits per month. Use them for up to 3 quick checks, or spend all 3 on one full review such as a HACCP plan, PRPs review, CCP analysis, or operations manual.",
              },
              {
                q: "How long does a review take?",
                a: "Quick checks are returned within 3 working days. Full document reviews are returned within 5 working days. You receive an email when the review starts and again when feedback is ready.",
              },
              {
                q: "What types of documents can I submit for review?",
                a: "Quick checks cover shorter items like logs, labels, supplier forms, traceability records, and short procedures. Full reviews cover larger documents such as HACCP plans, CCP analysis, PRPs, and operations manuals.",
              },
              {
                q: "Can unused review credits roll over?",
                a: "No. Review credits reset at the start of each billing month and do not carry over.",
              },
              {
                q: "Can I cancel or change my plan?",
                a: "Yes. You can upgrade, downgrade, or cancel at any time from the billing portal in your dashboard. Changes take effect at the next billing cycle. No contracts, no lock-in.",
              },
              {
                q: "Is VAT included in the prices shown?",
                a: "Prices shown are exclusive of VAT. VAT is applied at checkout based on your location.",
              },
              {
                q: "Are AI outputs suitable for direct use in audits or inspections?",
                a: "PinkPepper generates AI-assisted drafts to support your compliance work. All outputs should be reviewed and approved by a qualified food safety professional before being used in audits, inspections, or submitted to enforcement authorities. Our Food Safety Specialist review service (Pro plan) is designed to help with exactly this.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
                <h3 className="mb-2 text-sm font-semibold text-[#0F172A]">{q}</h3>
                <p className="text-sm leading-relaxed text-[#64748B]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="pp-container max-w-3xl">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center sm:flex-row sm:text-left">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#FFF1F2]">
              <Mail className="h-5 w-5 text-[#E11D48]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#0F172A]">Still have questions?</h3>
              <p className="mt-1 text-sm text-[#64748B]">
                Not sure which plan fits your operation? Get in touch and we&apos;ll help you decide.
              </p>
            </div>
            <Link
              href="/contact"
              className="flex-shrink-0 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-2.5 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F1F5F9]"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

