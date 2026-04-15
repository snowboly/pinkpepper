import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact PinkPepper",
  url: "https://www.pinkpepper.io/contact",
  description:
    "Contact PinkPepper for questions about HACCP plans, food safety compliance, pricing, or enterprise plans.",
  mainEntity: {
    "@type": "Organization",
    name: "PinkPepper",
    url: "https://pinkpepper.io",
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@pinkpepper.io",
      contactType: "customer support",
      availableLanguage: ["English", "German", "French", "Spanish", "Portuguese", "Italian"],
      responseTime: "P1D",
    },
  },
};

export const metadata: Metadata = {
  title: "Contact PinkPepper — Food Safety Compliance Support",
  description:
    "Questions about HACCP plans, pricing, or enterprise plans? Contact PinkPepper for food safety compliance support. We respond within 1 business day.",
  alternates: {
    canonical: "https://www.pinkpepper.io/contact",
  },
};

export default function ContactPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <section className="py-16 text-center">
        <div className="pp-container max-w-3xl">
          <h1 className="text-4xl font-black tracking-tight text-[#2B2B2B] md:text-5xl">
            Contact &amp; Support
          </h1>
          <p className="mt-4 text-lg text-[#6B6B6B]">
            We&apos;re here to help with food safety compliance software questions, account issues, and feedback.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-[#475569]">
            <Link href="/features/haccp-plan-generator" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              Explore HACCP workflows
            </Link>
            <Link href="/pricing" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              View pricing
            </Link>
            <Link href="/use-cases/restaurants" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              See restaurant workflows
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="pp-container max-w-xl">
          <div className="rounded-2xl border border-[#E8DADA] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1F2]">
              <Mail className="h-6 w-6 text-[#E11D48]" />
            </div>
            <a
              href="mailto:support@pinkpepper.io"
              className="text-lg font-semibold text-[#E11D48] underline underline-offset-2 transition-colors hover:text-[#BE123C]"
            >
              support@pinkpepper.io
            </a>
            <p className="mt-3 text-sm text-[#6B6B6B]">
              We aim to reply within 1 business day.
            </p>
          </div>

          <p className="mt-8 text-center text-sm text-[#6B6B6B]">
            Pro subscribers receive priority support for compliance questions.
          </p>
        </div>
      </section>
    </main>
  );
}
