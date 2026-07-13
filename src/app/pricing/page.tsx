import { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import PricingPlans from "@/components/pricing/PricingPlans";
import { faqs as sharedFaqs } from "@/data/faqs";
import { type PublicLocale } from "@/i18n/public";
import { getPublicPageHref } from "@/lib/public-routes";
import { createClient } from "@/utils/supabase/server";
import { getCspNonce } from "@/lib/security/csp";

export const metadata: Metadata = {
  title: "Pricing | PinkPepper AI Food Safety Consultant",
  description:
    "Start free with AI food safety consultant features. Plus supports daily HACCP and SOP work. Pro adds AI support plus human food safety consultancy/review.",
  alternates: {
    canonical: "https://pinkpepper.io/pricing",
    languages: {
      "x-default": "https://pinkpepper.io/pricing",
      en: "https://pinkpepper.io/pricing",
      fr: "https://pinkpepper.io/fr/pricing",
      de: "https://pinkpepper.io/de/pricing",
      pt: "https://pinkpepper.io/pt/pricing",
    },
  },
};

const pricingFaqs = [
  (() => {
    const modeFaq = sharedFaqs.find((faq) => faq.id === "consultant-vs-auditor");
    if (!modeFaq) {
      throw new Error("Missing consultant-vs-auditor FAQ");
    }

    return { q: modeFaq.question, a: modeFaq.answer };
  })(),
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

type PricingPageProps = {
  locale?: PublicLocale;
};

export default async function PricingPage({ locale }: PricingPageProps = {}) {
  const nonce = await getCspNonce();
  const haccpHref = locale ? getPublicPageHref(locale, "/features/haccp-plan-generator") : "/features/haccp-plan-generator";
  const signupHref = locale ? getPublicPageHref(locale, "/signup") : "/signup";
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
      "AI food safety consultant for EU and UK food businesses. Use it for HACCP, allergen documentation, SOP support, compliance workflows, templates, and optional human food safety consultant review.",
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
            AI speed, human food safety expertise when needed.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#475569]">
            Free and Plus include AI food safety assistant and consultant features. Pro adds AI support plus human food safety consultancy/review for higher-risk work.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-[#475569]">
            <Link href={haccpHref} className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              Review HACCP plan workflows
            </Link>
            <Link href="/resources/food-safety-document-checklist" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              Review the document checklist
            </Link>
            <Link href="/articles/what-documents-does-a-food-hygiene-inspector-ask-for-first-uk" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              See what inspectors ask for first
            </Link>
            <Link href="/compare/pinkpepper-vs-consultant" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              Compare PinkPepper vs consultant
            </Link>
            <Link href="/compare/haccp-software-alternatives" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              Compare HACCP software alternatives
            </Link>
            <Link href="/ai-food-safety-consultant" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              AI food safety consultant
            </Link>
            <Link href="/human-review" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              See when human review is needed
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-[#F1F5F9] bg-white py-16">
        <div className="pp-container">
          <PricingPlans
            isLoggedIn={isLoggedIn}
            signupHref={signupHref}
            ctaNeutral={ctaNeutral}
            ctaSecondary={ctaSecondary}
            ctaPrimary={ctaPrimary}
          />
        </div>
      </section>

      <section className="border-t border-[#F1F5F9] bg-[#F8FAFC] py-16">
        <div className="pp-container max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-[#0F172A]">Frequently asked questions</h2>
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
              <h3 className="font-semibold text-[#0F172A]">Need help choosing?</h3>
              <p className="mt-1 text-sm text-[#64748B]">
                If you are unsure which plan fits your workload, talk to us and we will help you decide.
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
