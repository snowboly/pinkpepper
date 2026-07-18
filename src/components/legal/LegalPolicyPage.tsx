import Link from "next/link";
import type { LegalDocument } from "@/lib/legal/types";
import { LEGAL_POLICY_SLUGS } from "@/lib/legal/config";
import { buildLegalPath } from "@/lib/legal/routes";

type Props = { document: LegalDocument };

function renderText(text: string) {
  return text;
}

export function LegalPolicyPage({ document }: Props) {
  const policy = document.slug === "hub" ? null : document.slug;
  return (
    <main className="pp-container max-w-4xl py-16">
      <div className="mb-8 border-b border-[#F1F5F9] pb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">PinkPepper legal</p>
        <h1 className="mt-4 text-4xl font-semibold text-[#0F172A]">{document.title}</h1>
        <p className="mt-2 text-sm text-[#64748B]">Version {document.version}. {document.publishedLabel}. {document.effectiveLabel}.</p>
      </div>
      <nav aria-label="Legal policies" className="mb-10 flex flex-wrap gap-2 text-sm">
        <Link href={buildLegalPath("terms", document.locale)} className="rounded-full border border-[#E2E8F0] px-3 py-1 text-[#475569]">Terms</Link>
        <Link href={buildLegalPath("privacy", document.locale)} className="rounded-full border border-[#E2E8F0] px-3 py-1 text-[#475569]">Privacy</Link>
        <Link href={buildLegalPath("cookies", document.locale)} className="rounded-full border border-[#E2E8F0] px-3 py-1 text-[#475569]">Cookies</Link>
        <Link href={buildLegalPath("dpa", document.locale)} className="rounded-full border border-[#E2E8F0] px-3 py-1 text-[#475569]">DPA</Link>
        <Link href={buildLegalPath("acceptable-use", document.locale)} className="rounded-full border border-[#E2E8F0] px-3 py-1 text-[#475569]">Acceptable use</Link>
        <Link href={buildLegalPath("refund", document.locale)} className="rounded-full border border-[#E2E8F0] px-3 py-1 text-[#475569]">Refund</Link>
      </nav>
      <div className="space-y-10 text-[#374151] leading-relaxed">
        {document.clauses.map((clause) => (
          <section key={clause.id} id={clause.id}>
            <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">{clause.heading}</h2>
            <div className="space-y-3">
              {clause.blocks.map((block, index) => {
                if (block.type === "paragraph") return <p key={index}>{renderText(block.text)}</p>;
                if (block.type === "list") return <ul key={index} className="list-disc space-y-2 pl-6">{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
                if (block.type === "callout") return <p key={index} className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-4 text-sm text-[#78350F]">{block.text}</p>;
                if (block.type === "link") return <p key={index}><Link href={block.href} className="text-[#E11D48] underline">{block.label}</Link></p>;
                return <table key={index} className="w-full border-collapse text-sm"><thead><tr>{block.headers.map((h) => <th key={h} className="border p-2 text-left">{h}</th>)}</tr></thead><tbody>{block.rows.map((row) => <tr key={row.join('|')}>{row.map((cell) => <td key={cell} className="border p-2">{cell}</td>)}</tr>)}</tbody></table>;
              })}
            </div>
          </section>
        ))}
      </div>
      {policy ? <p className="mt-12 text-sm text-[#64748B]">Current policy: {policy}. Available policy slugs: {LEGAL_POLICY_SLUGS.join(", ")}.</p> : null}
    </main>
  );
}
