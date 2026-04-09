import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import RandomArticleLinks from "@/components/homepage/RandomArticleLinks";
import PricingActions from "@/components/pricing/PricingActions";
import { getCspNonce } from "@/lib/security/csp";
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

export const metadata: Metadata = {
  title: "PinkPepper | AI HACCP & Food Safety Software for EU & UK Businesses",
  description:
    "Generate HACCP plans, allergen records, SOPs & audit-ready documents in minutes. AI food safety software grounded in 35+ EU & UK regulations. Start free.",
  alternates: {
    canonical: "https://pinkpepper.io",
  },
};

export default async function HomePage() {
  const nonce = await getCspNonce();
  const t = await getTranslations("home");

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
      <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="relative overflow-hidden pb-20 pt-16 md:pb-28 md:pt-28">
        {/* Background image + dark overlay */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero-bg.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            quality={55}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/70" />
        </div>

        <div className="pp-container relative z-10">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/90 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              {t("heroBadge")}
            </div>

            <h1 className="pp-display mx-auto mb-8 max-w-4xl text-2xl leading-[1.15] tracking-[-0.02em] text-white sm:text-3xl md:text-4xl lg:text-5xl">
              {t("heroTitle")}
            </h1>

            <p className="mx-auto mb-8 max-w-3xl text-base leading-relaxed text-white/80 sm:text-lg">
              {t("heroDescription")}
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
                  {t("heroEurLex")} <span className="font-semibold text-white">{t("heroEurLexBrand")}</span>
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
              { title: t("trust1Title"), body: t("trust1Body") },
              { title: t("trust2Title"), body: t("trust2Body") },
              { title: t("trust3Title"), body: t("trust3Body") },
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
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">{t("featuresLabel")}</p>
            <h2 className="pp-display mt-4 text-4xl font-semibold tracking-[-0.01em] text-[#0F172A] md:text-5xl">
              {t("featuresTitle")}
            </h2>
            <p className="mt-4 text-lg text-[#475569]">
              {t("featuresDescription")}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="pp-interactive group rounded-2xl border border-[#E2E8F0] bg-white p-7 transition-all duration-200 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F2] text-[#E11D48]">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#0F172A]">{t("feature1Title")}</h3>
                <p className="text-[#64748B]">{t("feature1Body")}</p>
              </div>

              <div className="pp-interactive group rounded-2xl border border-[#E2E8F0] bg-white p-7 transition-all duration-200 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F2] text-[#E11D48]">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#0F172A]">{t("feature2Title")}</h3>
                <p className="text-[#64748B]">{t("feature2Body")}</p>
              </div>

              <div className="pp-interactive group rounded-2xl border border-[#E2E8F0] bg-white p-7 transition-all duration-200 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F2] text-[#E11D48]">
                  <Download className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#0F172A]">{t("feature3Title")}</h3>
                <p className="text-[#64748B]">{t("feature3Body")}</p>
              </div>

              <div className="pp-interactive group rounded-2xl border border-[#E2E8F0] bg-white p-7 transition-all duration-200 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F2] text-[#E11D48]">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#0F172A]">{t("feature4Title")}</h3>
                <p className="text-[#64748B]">{t("feature4Body")}</p>
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
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">{t("aiLabel")}</p>
                <h2 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-5xl">
                  {t("aiTitle")}
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-[#475569]">
                  {t("aiDescription")}
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {/* Card 1: AI + Specialist */}
              <div className="flex flex-col rounded-3xl bg-[#0F172A] p-8 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                </div>
                <p className="text-3xl font-extrabold text-white">{t("stat1Title")}</p>
                <p className="mt-1 text-sm font-semibold text-slate-400">{t("stat1Subtitle")}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">{t("stat1Body")}</p>
              </div>

              {/* Card 2: Time saved */}
              <div className="flex flex-col rounded-3xl bg-[#0F172A] p-8 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-extrabold text-white">{t("stat2Title")}</p>
                <p className="mt-1 text-sm font-semibold text-slate-400">{t("stat2Subtitle")}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">{t("stat2Body")}</p>
              </div>

              {/* Card 3: Cost saving */}
              <div className="flex flex-col rounded-3xl bg-[#0F172A] p-8 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                </div>
                <p className="text-3xl font-extrabold text-white">{t("stat3Title")}</p>
                <p className="mt-1 text-sm font-semibold text-slate-400">{t("stat3Subtitle")}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">{t("stat3Body")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="relative overflow-hidden border-y border-[#F1F5F9] bg-white py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-white" />
        </div>

        <div className="pp-container relative z-10">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="pp-display mb-4 text-4xl text-[#0F172A] md:text-5xl">{t("pricingTitle")}</h2>
            <p className="text-lg text-[#64748B]">{t("pricingDescription")} <Link href="/pricing" className="underline hover:text-[#0F172A]">{t("pricingSeeFull")}</Link>.</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
            <div className="flex flex-col rounded-3xl border border-[#E2E8F0] bg-[#FCFDFE] p-8">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">{t("pricingFreeTitle")}</h3>
              <p className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-[#64748B]">{t("pricingFreeDesc")}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">€</span>0</span>
                <span className="text-base text-[#94A3B8]">{t("pricingFreeMonthly")}</span>
              </div>
              <div className="my-6 border-t border-[#F1F5F9]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />{t("pricingFreeFeature1")}</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />{t("pricingFreeFeature2")}</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />{t("pricingFreeFeature3")}</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />{t("pricingFreeFeature4")}</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />{t("pricingFreeFeature5")}</li>
              </ul>
              <Link href="/signup" className="mt-8 block rounded-xl border border-[#E2E8F0] bg-white py-3.5 text-center text-sm font-semibold text-[#0F172A] transition-all duration-200 hover:bg-[#F8FAFC] hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]">
                {t("pricingFreeButton")}
              </Link>
            </div>

            <div className="relative flex flex-col rounded-3xl border-2 border-[#E11D48] bg-white p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#E11D48] px-4 py-1 text-xs font-bold text-white">{t("pricingMostPopular")}</div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">{t("pricingPlusTitle")}</h3>
              <p className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-[#64748B]">{t("pricingPlusDesc")}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">€</span>19</span>
                <span className="text-base text-[#94A3B8]">{t("pricingPlusMonthly")}</span>
              </div>
              <div className="my-6 border-t border-[#FCE7F3]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />{t("pricingPlusFeature1")}</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />{t("pricingPlusFeature2")}</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />{t("pricingPlusFeature3")}</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />{t("pricingPlusFeature4")}</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />{t("pricingPlusFeature5")}</li>
              </ul>
              <PricingActions
                plan="plus"
                label={t("pricingPlusButton")}
                source="homepage"
                className="mt-8 block rounded-xl border border-[#FBCFE8] bg-[#FFF1F2] py-3.5 text-center text-sm font-semibold text-[#BE123C] transition-all duration-200 hover:bg-[#FFE4E6] hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
              />
            </div>

            <div className="flex flex-col rounded-3xl border border-[#F9A8D4] bg-[#FFF8FB] p-8">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#BE123C]">{t("pricingProTitle")}</h3>
              <p className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-[#64748B]">{t("pricingProDesc")}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">€</span>99</span>
                <span className="text-base text-[#94A3B8]">{t("pricingProMonthly")}</span>
              </div>
              <div className="my-6 border-t border-[#F1F5F9]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />{t("pricingProFeature1")}</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />{t("pricingProFeature2")}</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />{t("pricingProFeature3")}</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />{t("pricingProFeature4")}</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />{t("pricingProFeature5")}</li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />{t("pricingProFeature6")}</li>
              </ul>
              <PricingActions
                plan="pro"
                label={t("pricingProButton")}
                source="homepage"
                className="mt-8 block rounded-xl bg-[#E11D48] py-3.5 text-center text-sm font-semibold text-white transition-all duration-200 hover:bg-[#BE123C] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#E11D48]/25 active:scale-[0.98]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#F1F5F9] bg-white py-16">
        <div className="pp-container">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">{t("articlesLabel")}</p>
                <h2 className="pp-display mt-2 text-2xl text-[#0F172A] md:text-3xl">{t("articlesTitle")}</h2>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#94A3B8]">
                  <Link href="/features/haccp-plan-generator" className="hover:text-[#475569]">{t("articlesFeaturedHaccp")}</Link>
                  <Link href="/features/food-safety-audit-prep" className="hover:text-[#475569]">{t("articlesFeaturedAudit")}</Link>
                </div>
              </div>
              <Link href="/articles" className="text-sm font-semibold text-[#475569] hover:text-[#0F172A]">
                {t("articlesBrowseAll")}
              </Link>
            </div>
            <RandomArticleLinks />
          </div>
        </div>
      </section>

      <section className="border-b border-[#F1F5F9] bg-[#FFF8FB] py-20">
        <div className="pp-container">
          <div className="flex flex-col gap-14 lg:flex-row lg:items-center lg:gap-20">
            <div className="max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E11D48]">{t("specialistsLabel")}</p>
              <h2 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-5xl">{t("specialistsTitle")}</h2>
              <p className="mt-5 text-lg leading-relaxed text-[#475569]">
                {t("specialistsBody")}
              </p>
              <p className="mt-4 text-sm text-[#94A3B8]">{t("specialistsNote")}</p>
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
            <h2 className="pp-display text-center text-4xl text-[#0F172A] md:text-5xl">{t("faqTitle")}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-[#64748B]">
              {t("faqSubtitle")}
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
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-[#64748B]">
            {t("ctaBody")}
          </p>
          <Link
            href="/signup"
            className="pp-interactive inline-flex items-center gap-3 rounded-full bg-[#E11D48] px-10 py-4 text-lg font-semibold text-white shadow-xl shadow-[#E11D48]/20 transition-all duration-200 hover:bg-[#BE123C] hover:shadow-2xl hover:shadow-[#E11D48]/30 active:scale-[0.97]"
          >
            {t("ctaButton")}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
