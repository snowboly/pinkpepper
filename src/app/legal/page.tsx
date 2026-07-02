import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal Policies | PinkPepper",
  description:
    "Access PinkPepper legal policies, including terms, privacy, cookies, data processing, acceptable use, and refunds.",
  alternates: { canonical: "https://pinkpepper.io/legal" },
};

const legalPages = [
  {
    href: "/legal/terms",
    title: "Terms of Service",
    description: "The terms governing access to and use of PinkPepper.",
  },
  {
    href: "/legal/privacy",
    title: "Privacy Policy",
    description: "How PinkPepper collects, uses, stores, and protects personal data.",
  },
  {
    href: "/legal/cookies",
    title: "Cookie Policy",
    description: "What cookies PinkPepper uses and how consent choices are handled.",
  },
  {
    href: "/legal/dpa",
    title: "Data Processing Agreement",
    description: "The processor terms relevant to business customers using PinkPepper.",
  },
  {
    href: "/legal/acceptable-use",
    title: "Acceptable Use Policy",
    description: "The usage rules and restrictions that apply across the service.",
  },
  {
    href: "/legal/refund",
    title: "Refund Policy",
    description: "How subscription cancellations and refund requests are handled.",
  },
] as const;

export default function LegalHubPage() {
  return (
    <main className="pp-container max-w-5xl py-16 md:py-24">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Legal</p>
        <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-5xl">Legal policies</h1>
        <p className="mt-6 text-lg leading-8 text-[#475569]">
          Use this page as the central entry point for PinkPepper&apos;s contractual, privacy, cookie, and data
          processing documents.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {legalPages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 transition-colors hover:border-[#FDA4AF] hover:bg-[#FFF8F8]"
          >
            <h2 className="text-xl font-semibold text-[#0F172A]">{page.title}</h2>
            <p className="mt-3 text-base leading-7 text-[#475569]">{page.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
