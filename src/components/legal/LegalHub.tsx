import Link from "next/link";
import { getLegalDocumentsForLocale } from "@/lib/legal/content";
import { LEGAL_OPERATOR } from "@/lib/legal/config";
import { buildLegalPath } from "@/lib/legal/routes";
import type { LegalLocale, LegalPolicySlug } from "@/lib/legal/types";

export function LegalHub({ locale }: { locale: LegalLocale }) {
  const documents = getLegalDocumentsForLocale(locale);
  return (
    <main className="pp-container max-w-5xl py-16 md:py-24">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Legal</p>
        <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-5xl">Legal policies</h1>
        <p className="mt-6 text-lg leading-8 text-[#475569]">PinkPepper is operated by {LEGAL_OPERATOR.legalName}, trading as {LEGAL_OPERATOR.tradingName}, {LEGAL_OPERATOR.taxIdLabel} {LEGAL_OPERATOR.taxId}, {LEGAL_OPERATOR.address}.</p>
        <p className="mt-4 text-base leading-7 text-[#475569]">PinkPepper is not currently registered in the Portuguese Electronic Complaints Book. See the policy pages for CNPD, ADR, complaints, and UK-representative risk information.</p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {documents.map((page) => (
          <Link key={page.slug} href={buildLegalPath(page.slug as LegalPolicySlug, locale)} className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 transition-colors hover:border-[#FDA4AF] hover:bg-[#FFF8F8]">
            <h2 className="text-xl font-semibold text-[#0F172A]">{page.title}</h2>
            <p className="mt-3 text-base leading-7 text-[#475569]">{page.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
