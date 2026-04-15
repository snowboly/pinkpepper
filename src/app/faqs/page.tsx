import type { Metadata } from "next";
import Link from "next/link";
import { faqs } from "@/data/faqs";

const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: typeof faq.answer === "string" ? faq.answer : faq.question,
    },
  })),
};

export const metadata: Metadata = {
  title: "FAQs — HACCP, Allergens, Regulations & More | PinkPepper",
  description:
    "Answers to common questions about PinkPepper: HACCP plans, allergen compliance, EU & UK regulations covered, data security, Consultant vs Auditor mode, and pricing.",
  alternates: {
    canonical: "https://www.pinkpepper.io/faqs",
  },
};

export default function FaqsPage() {
  return (
    <main className="overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">FAQs</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">Frequently asked questions</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">
            Quick answers about PinkPepper, food safety compliance, and how the platform fits into your workflow.
          </p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16">
        <div className="pp-container max-w-3xl space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.id}
              className="group rounded-2xl border border-[#E2E8F0] bg-white transition-shadow hover:shadow-lg hover:shadow-black/[0.04]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-semibold text-[#0F172A]">
                {faq.question}
                <svg
                  className="h-5 w-5 shrink-0 text-[#94A3B8] transition-transform duration-200 group-open:rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>
              <div className="border-t border-[#F1F5F9] px-6 pb-5 pt-4 text-sm leading-relaxed text-[#475569]">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="pp-container">
          <div className="mx-auto max-w-4xl rounded-3xl border border-[#FBCFE8] bg-[#FFF1F2] p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#BE123C]">Still have questions?</p>
            <h2 className="mt-4 text-3xl font-semibold text-[#0F172A] md:text-4xl">Get in touch</h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#475569]">
              If you have a question that is not covered here, reach out and we will get back to you.
            </p>
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-block rounded-full bg-[#E11D48] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C]"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
