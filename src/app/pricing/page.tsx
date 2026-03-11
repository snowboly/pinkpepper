import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail, Star, XCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import PricingActions from "@/components/pricing/PricingActions";

export const metadata: Metadata = {
  title: "Pricing | PinkPepper — AI Food Safety Compliance Software",
  description:
    "Simple, transparent pricing for AI-powered HACCP plans, SOP generation, and food safety documentation. Start free, upgrade when you need PDF export or expert human review.",
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
    // Supabase env vars unavailable during build-time prerendering — assume not logged in
  }

  const ctaBase =
    "mt-8 block w-full rounded-xl py-3.5 text-center text-sm font-semibold transition-colors";
  const ctaPrimary = `${ctaBase} bg-[#FDA4AF] text-[#9F1239] hover:bg-[#FECDD3]`;
  const ctaSecondary = `${ctaBase} border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]`;
  const ctaNeutral = `${ctaBase} border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]`;

  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="py-16 text-center">
        <div className="pp-container max-w-3xl">
          <h1 className="pp-display text-4xl font-black tracking-tight text-[#0F172A] md:text-5xl">
            Simple pricing, clear upgrades
          </h1>
          <p className="mt-4 text-lg text-[#475569]">
            Start free. Unlock PDF exports and expert human review as your compliance needs grow.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="relative overflow-hidden border-y border-[#F1F5F9] bg-white py-16">
        <div className="pp-container">
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
            {/* Free */}
            <div className="flex flex-col rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all duration-200 hover:shadow-lg hover:shadow-black/[0.04]">
              <h2 className="text-xl font-bold text-[#0F172A]">Free</h2>
              <p className="mt-2 text-sm text-[#64748B]">
                Perfect for validating fit and testing workflows.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">€</span>0</span>
                <span className="text-base text-[#94A3B8]">/month</span>
              </div>
              <div className="my-6 border-t border-[#F1F5F9]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  15 AI queries per day
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  1 photo analysis per day
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  10 saved conversations (30-day history)
                </li>
                <li className="flex items-start gap-2.5 opacity-50">
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#94A3B8]" />
                  No export
                </li>
                <li className="flex items-start gap-2.5 opacity-50">
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#94A3B8]" />
                  No human review
                </li>
              </ul>
              <Link href="/signup" className={ctaNeutral}>
                Get started free
              </Link>
            </div>

            {/* Plus */}
            <div className="flex flex-col rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all duration-200 hover:shadow-lg hover:shadow-black/[0.04]">
              <h2 className="text-xl font-bold text-[#0F172A]">Plus</h2>
              <p className="mt-2 text-sm text-[#64748B]">
                PDF export and higher limits for growing operations.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">€</span>19</span>
                <span className="text-base text-[#94A3B8]">/month + VAT</span>
              </div>
              <div className="my-6 border-t border-[#F1F5F9]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  100 AI queries per day
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  Longer conversation context
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  3 photo analyses per day
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  Export to PDF
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  Unlimited saved conversations
                </li>
                <li className="flex items-start gap-2.5 opacity-50">
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#94A3B8]" />
                  No document review
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
                Full document reviews and highest limits for serious operators.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">€</span>99</span>
                <span className="text-base text-[#94A3B8]">/month + VAT</span>
              </div>
              <div className="my-6 border-t border-[#F1F5F9]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  1,000 AI queries per day
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  20 photo analyses per day
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  Unlimited saved conversations
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  Word &amp; PDF export
                </li>
                <li className="flex items-start gap-2.5 font-medium text-[#9F1239]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  Food Safety Specialist reviews
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

      {/* Tier comparison summary */}
      <section className="py-16">
        <div className="pp-container max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-[#0F172A]">What each tier includes</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
              <h3 className="mb-1 font-semibold text-[#0F172A]">Free</h3>
              <p className="text-sm text-[#64748B]">
                15 daily queries, 1 image upload/day, 10 saved conversations. No export, no document review.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E11D48]/20 bg-[#FFF1F2] p-6">
              <h3 className="mb-1 font-semibold text-[#0F172A]">Plus</h3>
              <p className="text-sm text-[#64748B]">
                PDF export. 100 daily queries, 3 image uploads/day, 3 document generations/day. No document review.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
              <h3 className="mb-1 font-semibold text-[#0F172A]">Pro</h3>
              <p className="text-sm text-[#64748B]">
                Word &amp; PDF export, 1,000 daily queries, 20 image uploads/day, 3 review credits/month — small docs or full HACCP reviews.
              </p>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-[#94A3B8]">
            Entitlements enforced server-side via Supabase, synchronized with Stripe webhook events.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[#F1F5F9] bg-[#F8FAFC] py-16">
        <div className="pp-container max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-[#0F172A]">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "How do review credits work?",
                a: "Pro users receive 3 review credits per month. A quick check (short SOP, log review, label, statement, process flow) costs 1 credit — so you can request up to 3 per month. A full document review (complete HACCP plan, CCP analysis, PRPs review, QA or operations manual) costs all 3 credits and can only be requested once per month.",
              },
              {
                q: "How long does a review take?",
                a: "Quick checks (SOPs, logs, labels, records) are returned within 3 working days. Full document reviews (HACCP plans, CCP analysis, PRPs, QA manuals) are returned within 5 working days. You'll receive an email when your review begins and again when feedback is ready.",
              },
              {
                q: "What types of documents can I submit for review?",
                a: "Quick checks include: cleaning schedules, temperature logs, allergen statements, supplier approval forms, traceability records, labelling, and short procedures (1–2 pages). Full reviews cover: complete HACCP plans (all 7 principles), CCP critical limit analysis, PRPs (cleaning, pest control, supplier approval), and full QA or operations manuals.",
              },
              {
                q: "Can unused review credits roll over?",
                a: "No — review credits reset at the start of each billing month and do not carry over. We recommend submitting documents throughout the month rather than all at once.",
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
                <p className="text-sm text-[#64748B] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
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
