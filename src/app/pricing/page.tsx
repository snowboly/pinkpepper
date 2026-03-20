import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail, Star, XCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import PricingActions from "@/components/pricing/PricingActions";

export const metadata: Metadata = {
  title: "Pricing | PinkPepper - AI Food Safety Compliance Software",
  description:
    "Pricing for food safety teams that need faster document production, safer audit prep, and food safety consultancy when the risk is higher.",
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
        description: "15 AI queries per day, 3 photo analyses per day, 3 voice transcriptions, 10 saved conversations.",
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
        description: "100 AI queries per day, 10 photo analyses per day, Word templates, document uploads, PDF conversation export, unlimited saved conversations.",
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
          "1,000 AI queries per day, 50 photo analyses per day, Word templates, PDF and DOCX export, 3 hours of food safety consultancy per month.",
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
            Your AI food safety consultant — in your pocket
          </h1>
          <p className="mt-4 text-lg text-[#475569]">
            Snap a photo of a pest, a fridge, a label, a delivery — and get an instant compliance analysis backed by EU and UK food safety law. Ask questions, upload documents, and get expert consultancy when you need it most.
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
              <h2 className="mt-2 text-lg font-semibold text-[#0F172A]">Ask and snap before you commit</h2>
              <p className="mt-2 text-sm text-[#64748B]">
                Ask compliance questions and analyse up to 3 photos a day — kitchens, labels, pests, deliveries — before spending a penny.
              </p>
            </div>
            <div className="rounded-2xl border border-[#FBCFE8] bg-[#FFF1F2] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#BE123C]">Plus</p>
              <h2 className="mt-2 text-lg font-semibold text-[#0F172A]">Daily compliance analysis at scale</h2>
              <p className="mt-2 text-sm text-[#64748B]">
                10 photo analyses per day, higher query limits, document uploads, voice transcription, Word templates, and PDF export.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Pro</p>
              <h2 className="mt-2 text-lg font-semibold text-[#0F172A]">AI consultant backed by a real specialist</h2>
              <p className="mt-2 text-sm text-[#64748B]">
                50 photo analyses per day, Word templates, full export, plus 3 hours of qualified food safety consultancy each month.
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
                Best for operators testing fit on real questions and day-to-day visual checks.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">€</span>0</span>
                <span className="text-base text-[#94A3B8]">/month</span>
              </div>
              <div className="my-6 border-t border-[#F1F5F9]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  Snap 3 photos per day — pests, kitchens, labels, deliveries, temperatures — and get instant compliance analysis
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  15 AI queries per day with regulation-backed answers
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  3 voice transcriptions per day
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  Up to 10 saved conversations with 30-day history
                </li>
                <li className="flex items-start gap-2.5 opacity-50">
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#94A3B8]" />
                  No Word templates or document export
                </li>
                <li className="flex items-start gap-2.5 opacity-50">
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#94A3B8]" />
                  No consultancy
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
                For operators who need daily photo analysis, templates to work from, and full document handling.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">€</span>19</span>
                <span className="text-base text-[#94A3B8]">/month + VAT</span>
              </div>
              <div className="my-6 border-t border-[#FCE7F3]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  10 photo analyses per day — snap pests, kitchens, labels, deliveries, and temperature displays
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  100 AI queries per day with regulation-backed answers
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  Downloadable Word templates — HACCP plans, SOPs, logs, and more — ready to adapt to your operation
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  Upload your own documents for AI review and feedback
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  Export conversations as PDF — for filing, handover, or internal review
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  Unlimited saved conversations with full history
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
                For operators who want an AI food safety consultant on call — with a real specialist behind it when the stakes are high.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">€</span>99</span>
                <span className="text-base text-[#94A3B8]">/month + VAT</span>
              </div>
              <div className="my-6 border-t border-[#F1F5F9]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  50 photo analyses per day — pests, kitchens, labels, deliveries, equipment, waste areas, and more
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  1,000 AI queries per day for heavy audit prep and multi-site operations
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  Downloadable Word templates for all major compliance documents — adapt and own them
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  Full PDF and DOCX export for internal editing and external sharing
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  3 hours of food safety consultancy each month — document review, async Q&A, and specialist guidance
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
                Ask questions and analyse 3 photos per day. Test it on a real pest sighting, a label, or a fridge check before you commit.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E11D48]/20 bg-[#FFF1F2] p-6">
              <h3 className="mb-1 font-semibold text-[#0F172A]">Plus</h3>
              <p className="text-sm text-[#64748B]">
                10 photo analyses per day, higher query limits, Word templates for all compliance documents, document uploads, and PDF export.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
              <h3 className="mb-1 font-semibold text-[#0F172A]">Pro</h3>
              <p className="text-sm text-[#64748B]">
                50 photo analyses per day, 1,000 queries, Word templates, full export, and 3 hours/month of qualified food safety consultancy.
              </p>
            </div>
          </div>
          <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-6">
            <h3 className="text-sm font-semibold text-[#0F172A]">Entitlement detail</h3>
            <div className="mt-4 grid gap-4 text-sm text-[#64748B] md:grid-cols-3">
              <div>
                <p className="font-medium text-[#334155]">Free</p>
                <p className="mt-1">15 queries/day, 3 photo analyses/day, 3 transcriptions/day, 10 saved conversations, 30-day retention.</p>
              </div>
              <div>
                <p className="font-medium text-[#334155]">Plus</p>
                <p className="mt-1">100 queries/day, 10 photo analyses/day, 25 transcriptions/day, Word templates, PDF conversation export, unlimited saved conversations.</p>
              </div>
              <div>
                <p className="font-medium text-[#334155]">Pro</p>
                <p className="mt-1">1,000 queries/day, 50 photo analyses/day, 200 transcriptions/day, Word templates, DOCX/PDF export, 3 consultancy hours/month.</p>
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
                q: "How do consultancy hours work?",
                a: "Pro users receive 3 hours of food safety consultancy each month. Use them for document review, document generation support, async Q&A, or any other food safety guidance. Hours are tracked in 15-minute increments.",
              },
              {
                q: "What does consultancy cover?",
                a: "Your consultancy hours can be used for reviewing AI-generated documents, helping produce compliance documentation, answering complex food safety questions, and providing specialist guidance. All consultancy is delivered by qualified food safety professionals.",
              },
              {
                q: "Can I buy extra consultancy hours?",
                a: "Yes. Additional consultancy is available on an hourly basis. Contact us or request extra hours from your dashboard.",
              },
              {
                q: "Do unused consultancy hours roll over?",
                a: "No. Consultancy hours reset at the start of each billing month and do not carry over.",
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
                a: "PinkPepper generates AI-assisted drafts to support your compliance work. All outputs should be reviewed and approved by a qualified food safety professional before being used in audits, inspections, or submitted to enforcement authorities. Our food safety consultancy service (Pro plan) is designed to help with exactly this.",
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

