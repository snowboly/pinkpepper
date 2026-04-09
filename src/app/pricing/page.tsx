import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import PricingActions from "@/components/pricing/PricingActions";
import { faqs as sharedFaqs } from "@/data/faqs";
import { createClient } from "@/utils/supabase/server";
import { getCspNonce } from "@/lib/security/csp";

export const metadata: Metadata = {
  title: "Pricing — From €0/mo | PinkPepper Food Safety Software",
  description:
    "Start free. Plus at €19/mo for daily HACCP & SOP use. Pro at €99/mo adds Auditor mode + 2h human consultancy. Save €18,000+/year on compliance costs.",
  alternates: {
    canonical: "https://pinkpepper.io/pricing",
  },
};

const staticPricingFaqs = [
  {
    q: "How do the consultancy hours work on Pro?",
    a: "Pro includes 2 hours of human food safety consultancy each month. This is separate from the in-app Consultant and Auditor modes. Use it for review, guidance, and higher-risk support. Hours do not roll over.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes. You can upgrade, downgrade, or cancel from the billing portal. Changes take effect at the next billing cycle.",
  },
  {
    q: "Is VAT included in the prices shown?",
    a: "No. Prices shown are exclusive of VAT. VAT is applied at checkout where required.",
  },
  {
    q: "Can I rely on outputs without review?",
    a: "No. PinkPepper is there to help you move faster and work more clearly, but higher-risk compliance decisions and final documents should still be reviewed appropriately.",
  },
];

export default async function PricingPage() {
  const nonce = await getCspNonce();
  const t = await getTranslations("pricing");

  let isLoggedIn = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isLoggedIn = !!user;
  } catch {
    isLoggedIn = false;
  }

  const modeFaq = sharedFaqs.find((faq) => faq.id === "consultant-vs-auditor");
  if (!modeFaq) {
    throw new Error("Missing consultant-vs-auditor FAQ");
  }

  const pricingFaqs = [
    { q: modeFaq.question, a: modeFaq.answer },
    ...staticPricingFaqs,
  ];

  const ctaBase =
    "mt-8 block w-full rounded-xl py-3.5 text-center text-sm font-semibold transition-colors";
  const ctaPrimary = `${ctaBase} bg-[#E11D48] text-white hover:bg-[#BE123C]`;
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
      "Food safety compliance software for EU and UK food businesses. Use it for HACCP, allergen documentation, SOP support, audit preparation, templates, and specialist-backed review workflows.",
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "EUR",
        description:
          "Chat on web and mobile, write and edit food safety content, analyze text and images, and use PinkPepper for everyday compliance questions and checks.",
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
        description:
          "Everything in Free, plus more usage, unlimited saved conversations and projects, and downloadable templates for regular Consultant use.",
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
          "Everything in Plus, plus Auditor mode, 2h/month of human food safety consultancy, and priority support.",
      },
    ],
  };

  const pricingFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pricingFaqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
  };

  return (
    <main className="overflow-hidden">
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingFaqSchema) }}
      />

      <section className="py-16 md:py-20">
        <div className="pp-container max-w-4xl text-center">
          <h1 className="pp-display text-4xl font-black tracking-tight text-[#0F172A] md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#475569]">
            {t("description")}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-[#475569]">
            <Link href="/features" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              {t("linkServices")}
            </Link>
            <Link href="/features/haccp-plan-generator" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              {t("linkHaccp")}
            </Link>
            <Link href="/resources/food-safety-document-checklist" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              {t("linkChecklist")}
            </Link>
            <Link href="/contact" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              {t("linkContact")}
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-[#F1F5F9] bg-white py-16">
        <div className="pp-container">
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
            <div className="flex flex-col rounded-3xl border border-[#E2E8F0] bg-[#FCFDFE] p-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">{t("freeTitle")}</h2>
              <p className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-[#64748B]">
                {t("freeDesc")}
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">EUR </span>0</span>
                <span className="text-base text-[#94A3B8]">{t("monthly")}</span>
              </div>
              <div className="my-6 border-t border-[#F1F5F9]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  {t("freeFeature1")}
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  {t("freeFeature2")}
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  {t("freeFeature3")}
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  {t("freeFeature4")}
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" />
                  {t("freeFeature5")}
                </li>
              </ul>
              <Link href="/signup" className={ctaNeutral}>
                {t("freeButton")}
              </Link>
            </div>

            <div className="relative flex flex-col rounded-3xl border-2 border-[#E11D48] bg-white p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#E11D48] px-4 py-1 text-xs font-bold text-white">{t("mostPopular")}</div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">{t("plusTitle")}</h2>
              <p className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-[#64748B]">
                {t("plusDesc")}
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">EUR </span>19</span>
                <span className="text-base text-[#94A3B8]">{t("monthlyVat")}</span>
              </div>
              <div className="my-6 border-t border-[#FCE7F3]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  {t("plusFeature1")}
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  {t("plusFeature2")}
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  {t("plusFeature3")}
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  {t("plusFeature4")}
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  {t("plusFeature5")}
                </li>
              </ul>
              <PricingActions
                isLoggedIn={isLoggedIn}
                plan="plus"
                label={t("plusButton")}
                className={ctaSecondary}
              />
            </div>

            <div className="flex flex-col rounded-3xl border border-[#F9A8D4] bg-[#FFF8FB] p-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#BE123C]">{t("proTitle")}</h2>
              <p className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-[#64748B]">
                {t("proDesc")}
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">EUR </span>99</span>
                <span className="text-base text-[#94A3B8]">{t("monthlyVat")}</span>
              </div>
              <div className="my-6 border-t border-[#F1F5F9]" />
              <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  {t("proFeature1")}
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  {t("proFeature2")}
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  {t("proFeature3")}
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  {t("proFeature4")}
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  {t("proFeature5")}
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  {t("proFeature6")}
                </li>
              </ul>
              <PricingActions
                isLoggedIn={isLoggedIn}
                plan="pro"
                label={t("proButton")}
                className={ctaPrimary}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#F1F5F9] bg-[#F8FAFC] py-16">
        <div className="pp-container max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-[#0F172A]">{t("faqTitle")}</h2>
          <div className="space-y-6">
            {pricingFaqs.map(({ q, a }) => (
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
              <h3 className="font-semibold text-[#0F172A]">{t("helpTitle")}</h3>
              <p className="mt-1 text-sm text-[#64748B]">{t("helpBody")}</p>
            </div>
            <Link
              href="/contact"
              className="flex-shrink-0 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-2.5 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F1F5F9]"
            >
              {t("helpButton")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
