import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Sparkles,
  Users,
} from "lucide-react";
import { DemoTabSwitcher } from "@/components/homepage/DemoTabSwitcher";
import { HeroChatForm } from "@/components/homepage/HeroChatForm";
import { homepageFaqs } from "@/data/faqs";


export default function HomePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homepageFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="relative overflow-hidden pb-20 pt-16 md:pb-28 md:pt-28">
        {/* Background image + dark overlay */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/hero-bg.jpg'), linear-gradient(135deg, #1e1b2e 0%, #2d1f3d 40%, #3b1a2a 70%, #1a1020 100%)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/70" />
        </div>

        <div className="pp-container relative z-10">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/90 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              AI food safety compliance software for EU and UK businesses
            </div>

            <h1 className="pp-display mx-auto mb-8 max-w-4xl text-2xl leading-[1.15] tracking-[-0.02em] text-white sm:text-3xl md:text-4xl lg:text-5xl">
              AI food safety compliance software with a specialist consultant on retainer.
            </h1>

            <p className="mx-auto mb-8 max-w-3xl text-base leading-relaxed text-white/80 sm:text-lg">
              Ask source-grounded EU and UK food safety questions, build review-ready compliance work faster, and bring in
              qualified food safety consultants when you need specialist judgment.
            </p>

            <div className="mb-8 flex justify-center">
              <a
                href="https://eur-lex.europa.eu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center text-sm text-white/80 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15 hover:text-white"
              >
                <svg
                  aria-label="EU flag"
                  width="24"
                  height="16"
                  viewBox="0 0 60 40"
                  className="flex-shrink-0 rounded-sm"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="60" height="40" fill="#003399"/>
                  {/* 12 stars at 30 degree intervals, r=13.333, center (30,20), outer r=2.2, inner r=0.9 */}
                  {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg) => {
                    const rad = (deg * Math.PI) / 180;
                    const cx = 30 + 13.333 * Math.sin(rad);
                    const cy = 20 - 13.333 * Math.cos(rad);
                    const pts = [0,1,2,3,4,5,6,7,8,9].map((i) => {
                      const a = (i * 36 * Math.PI) / 180;
                      const r = i % 2 === 0 ? 2.2 : 0.9;
                      return `${cx + r * Math.sin(a)},${cy - r * Math.cos(a)}`;
                    }).join(" ");
                    return <polygon key={deg} fill="#FFCC00" points={pts} />;
                  })}
                </svg>
                <span className="leading-relaxed">
                  Regulation data powered by <span className="font-semibold text-white">EUR-Lex CELLAR</span>
                </span>
              </a>
            </div>

            <HeroChatForm />
          </div>
        </div>
      </section>

      <section className="border-y border-[#F1F5F9] bg-white py-8">
        <div className="pp-container">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "EU and UK source grounding",
                body: "Built around food safety regulations, official guidance, and practical references instead of generic AI copy.",
              },
              {
                title: "Export-ready outputs",
                body: "Turn useful conversations into clean records, templates, and handover material without reworking everything manually.",
              },
              {
                title: "Specialist backup",
                body: "Move faster with AI, then route the higher-risk work to qualified food safety consultants when needed.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                <p className="text-sm font-semibold text-[#0F172A]">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-[#F1F5F9] bg-[#F8FAFC] py-24">
        <div className="pp-container">
          <div className="mb-14 max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Built for real world operators</p>
            <h2 className="pp-display mt-4 text-4xl font-semibold tracking-[-0.01em] text-[#0F172A] md:text-5xl">
              What PinkPepper helps you do
            </h2>
            <p className="mt-4 text-lg text-[#475569]">
              From raw notes to review-ready compliance work, PinkPepper is designed to shorten the time between a food
              safety problem and something your team can actually use.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="pp-interactive group rounded-2xl border border-[#E2E8F0] bg-white p-7 transition-all duration-200 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F2] text-[#E11D48]">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#0F172A]">Answer compliance questions faster</h3>
                <p className="text-[#64748B]">
                  Get regulation-grounded answers anchored in EC 852/2004, UK FSA guidance, and Codex HACCP references.
                </p>
              </div>

              <div className="pp-interactive group rounded-2xl border border-[#E2E8F0] bg-white p-7 transition-all duration-200 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F2] text-[#E11D48]">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#0F172A]">Build HACCP and audit prep faster</h3>
                <p className="text-[#64748B]">
                  Move from hazard analysis and CCP logic to inspection prep and corrective actions without starting from blank pages.
                </p>
              </div>

              <div className="pp-interactive group rounded-2xl border border-[#E2E8F0] bg-white p-7 transition-all duration-200 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F2] text-[#E11D48]">
                  <Download className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#0F172A]">Reuse templates and export cleanly</h3>
                <p className="text-[#64748B]">
                  Download structured templates and export conversation work in a format that is easier to review and hand over.
                </p>
              </div>

              <div className="pp-interactive group rounded-2xl border border-[#E2E8F0] bg-white p-7 transition-all duration-200 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F2] text-[#E11D48]">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#0F172A]">AI speed with food safety consultancy</h3>
                <p className="text-[#64748B]">
                  Route higher-stakes drafts to qualified food safety consultants for review, generation support, and specialist guidance.
                </p>
              </div>
            </div>

            <DemoTabSwitcher />
          </div>
        </div>
      </section>

      <section className="border-b border-[#F1F5F9] bg-white py-24">
        <div className="pp-container">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Value in practice</p>
                <h2 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-5xl">
                  From raw notes to review-ready compliance work
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-[#475569]">
                  Use PinkPepper when you need quicker answers, cleaner working drafts, and a clearer route from day-to-day
                  operations to something defensible.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/features/food-safety-audit-prep" className="pp-interactive rounded-full bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1E293B]">
                  Explore audit-prep workflows
                </Link>
                <Link href="/features/haccp-plan-generator" className="pp-interactive rounded-full border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC]">
                  See HACCP plan generation
                </Link>
                <Link href="/pricing" className="pp-interactive rounded-full border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC]">
                  Compare plans
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                {
                  title: "Ask before you act",
                  body: "Check a requirement, compare EU and UK expectations, or pressure-test a draft before your team commits to it.",
                },
                {
                  title: "Tighten the working draft",
                  body: "Use AI to structure the first useful version, then refine it with your team instead of rewriting from scratch.",
                },
                {
                  title: "Escalate the risky part",
                  body: "Bring in qualified food safety consultants when the question moves from routine execution into specialist judgment.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
                  <h3 className="text-xl font-semibold text-[#0F172A]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#64748B]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#F1F5F9] bg-white py-20">
        <div className="pp-container">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Explore the site</p>
            <h2 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-5xl">
              Go deeper by feature, business type, or resource
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#475569]">
              Browse PinkPepper by product workflow, industry fit, or practical compliance template.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Link
              href="/features"
              className="pp-interactive rounded-3xl border border-[#E2E8F0] bg-[#FFF7ED] p-8 transition-all hover:shadow-lg hover:shadow-black/[0.04]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E11D48]">Features</p>
              <h3 className="mt-3 text-2xl font-semibold text-[#0F172A]">Commercial product pages</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#475569]">
                Explore HACCP, allergen, SOP, and audit-prep workflows with dedicated buying-intent landing pages.
              </p>
            </Link>
            <Link
              href="/use-cases"
              className="pp-interactive rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-8 transition-all hover:shadow-lg hover:shadow-black/[0.04]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E11D48]">Use Cases</p>
              <h3 className="mt-3 text-2xl font-semibold text-[#0F172A]">Pages by business type</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#475569]">
                See how PinkPepper fits restaurants, cafes, caterers, and food manufacturing teams.
              </p>
            </Link>
            <Link
              href="/resources"
              className="pp-interactive rounded-3xl border border-[#E2E8F0] bg-[#FFF1F2] p-8 transition-all hover:shadow-lg hover:shadow-black/[0.04]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E11D48]">Resources</p>
              <h3 className="mt-3 text-2xl font-semibold text-[#0F172A]">Templates and guides</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#475569]">
                Read supporting content for HACCP templates, allergen matrices, audit checklists, and SOP examples.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section id="pricing" className="relative overflow-hidden border-y border-[#F1F5F9] bg-white py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-white" />
        </div>

        <div className="pp-container relative z-10">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="pp-display mb-4 text-4xl text-[#0F172A] md:text-5xl">Pricing that follows the compliance job</h2>
            <p className="text-lg text-[#64748B]">Start free, move to Plus for regular operational use, and choose Pro when you need audit support and consultancy input.</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
            <div className="flex flex-col rounded-3xl border border-[#E2E8F0] bg-[#FCFDFE] p-8">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Free</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#64748B]">Use PinkPepper on real questions before you commit.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">€</span>0</span>
                <span className="text-base text-[#94A3B8]">/month</span>
              </div>
              <div className="my-6 border-t border-[#F1F5F9]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />15 messages per day</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />3 image uploads per day</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />10 saved conversations with 30-day history</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />No export or template downloads</li>
              </ul>
              <Link href="/signup" className="mt-8 block rounded-xl border border-[#E2E8F0] bg-white py-3.5 text-center text-sm font-semibold text-[#0F172A] transition-all duration-200 hover:bg-[#F8FAFC] hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]">
                Get started
              </Link>
            </div>

            <div className="flex flex-col rounded-3xl border border-[#E2E8F0] bg-white p-8">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Plus</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#64748B]">For teams that need regular day-to-day use, uploads, and template access.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">€</span>19</span>
                <span className="text-base text-[#94A3B8]">/month</span>
              </div>
              <div className="my-6 border-t border-[#FCE7F3]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />100 messages per day</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />10 image uploads per day</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />Unlimited saved conversations</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />Document uploads and downloadable templates</li>
              </ul>
              <Link href="/signup?plan=plus" className="mt-8 block rounded-xl border border-[#FBCFE8] bg-[#FFF1F2] py-3.5 text-center text-sm font-semibold text-[#BE123C] transition-all duration-200 hover:bg-[#FFE4E6] hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]">
                Choose Plus
              </Link>
            </div>

            <div className="flex flex-col rounded-3xl border border-[#F9A8D4] bg-[#FFF8FB] p-8">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#BE123C]">Pro</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#64748B]">For operators preparing for inspections, audits, and higher-risk work that needs direct consultancy support.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">€</span>99</span>
                <span className="text-base text-[#94A3B8]">/month</span>
              </div>
              <div className="my-6 border-t border-[#F1F5F9]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />1,000 messages per day and 50 image uploads per day</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />Unlimited conversations, uploads, and template downloads</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />DOCX conversation export and Virtual Audit</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />2 hours of food safety consultancy each month</li>
              </ul>
              <Link href="/signup?plan=pro" className="mt-8 block rounded-xl bg-[#E11D48] py-3.5 text-center text-sm font-semibold text-white transition-all duration-200 hover:bg-[#BE123C] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#E11D48]/25 active:scale-[0.98]">
                Choose Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#F1F5F9] bg-[#FFF8FB] py-20">
        <div className="pp-container">
          <div className="flex flex-col gap-14 lg:flex-row lg:items-center lg:gap-20">
            <div className="max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Your specialists</p>
              <h2 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-5xl">Five specialists. One subscription.</h2>
              <p className="mt-5 text-lg leading-relaxed text-[#475569]">
                Every PinkPepper conversation is handled by one of five AI food safety specialists. Each has a distinct approach — from step-by-step checklists to direct executive summaries — so you get the right tone for every situation.
              </p>
              <p className="mt-4 text-sm text-[#94A3B8]">Assigned automatically. Same conversation, same specialist.</p>
            </div>

            <div className="flex flex-1 flex-col items-center gap-8">
              <div className="flex flex-wrap justify-center gap-8">
                {[
                  { id: "ana", name: "Ana", descriptor: "Supportive" },
                  { id: "jack", name: "Jack", descriptor: "Direct" },
                  { id: "greta", name: "Greta", descriptor: "Methodical" },
                ].map((s) => (
                  <div key={s.name} className="flex flex-col items-center gap-2">
                    <Image
                      src={`/${s.id}.svg`}
                      alt={s.name}
                      width={96}
                      height={96}
                      className="rounded-full ring-4 ring-white shadow-md transition-transform duration-200 hover:-translate-y-1"
                    />
                    <p className="text-sm font-semibold text-[#0F172A]">{s.name}</p>
                    <p className="text-xs text-[#94A3B8]">{s.descriptor}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-8">
                {[
                  { id: "jason", name: "Jason", descriptor: "Mentor" },
                  { id: "egle", name: "Egle", descriptor: "Reassuring" },
                ].map((s) => (
                  <div key={s.name} className="flex flex-col items-center gap-2">
                    <Image
                      src={`/${s.id}.svg`}
                      alt={s.name}
                      width={96}
                      height={96}
                      className="rounded-full ring-4 ring-white shadow-md transition-transform duration-200 hover:-translate-y-1"
                    />
                    <p className="text-sm font-semibold text-[#0F172A]">{s.name}</p>
                    <p className="text-xs text-[#94A3B8]">{s.descriptor}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-[#F1F5F9] bg-[#F8FAFC] py-24">
        <div className="pp-container">
          <div className="mx-auto max-w-3xl">
            <h2 className="pp-display text-center text-4xl text-[#0F172A] md:text-5xl">Frequently asked questions</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-[#64748B]">
              Clear product, compliance, and responsibility answers before you deploy PinkPepper in your workflow.
            </p>

            <div className="mt-10 space-y-4">
              {homepageFaqs.map((faq) => (
                <details key={faq.id} className="group rounded-2xl border border-[#E2E8F0] bg-white p-6">
                  <summary className="cursor-pointer list-none text-lg font-semibold text-[#0F172A]">
                    {faq.question}
                  </summary>
                  <p className="mt-3 leading-relaxed text-[#475569]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 -z-10 bg-[#F8FAFC]" />
        <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#E11D48]/[0.04] to-[#E11D48]/[0.02] blur-[120px]" />

        <div className="pp-container text-center">
          <h2 className="pp-display mx-auto mb-5 max-w-3xl text-4xl text-[#0F172A] md:text-5xl">
            Ready to run compliance with less friction?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-[#64748B]">
            Start generating practical food safety documentation today, then scale with exports and review workflows.
          </p>
          <Link
            href="/signup"
            className="pp-interactive inline-flex items-center gap-3 rounded-full bg-[#E11D48] px-10 py-4 text-lg font-semibold text-white shadow-xl shadow-[#E11D48]/20 transition-all duration-200 hover:bg-[#BE123C] hover:shadow-2xl hover:shadow-[#E11D48]/30 active:scale-[0.97]"
          >
            Start for free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}

