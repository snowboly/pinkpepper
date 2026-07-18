import { describe, expect, it } from "vitest";
import { LEGAL_LOCALES, LEGAL_POLICY_SLUGS } from "@/lib/legal/config";
import { getAllLegalDocuments, getLegalDocument, getLegalHub } from "@/lib/legal/content";

function textOf(doc: ReturnType<typeof getLegalHub>) {
  return doc.clauses.flatMap((clause) => clause.blocks).map((block) => block.type === "paragraph" ? block.text : block.type === "list" ? block.items.join(" ") : "").join(" ");
}

describe("legal content registry", () => {
  it("has every policy in every locale with current versions", () => {
    expect(getAllLegalDocuments()).toHaveLength(LEGAL_LOCALES.length * LEGAL_POLICY_SLUGS.length);
    for (const locale of LEGAL_LOCALES) for (const slug of LEGAL_POLICY_SLUGS) {
      const doc = getLegalDocument(slug, locale);
      expect(doc.locale).toBe(locale);
      expect(doc.slug).toBe(slug);
      expect(doc.version).toBe("2026-07-18");
      expect(doc.clauses.length).toBeGreaterThan(0);
    }
  });

  it("publishes the Portuguese operator, refund, complaints, DPA, and UK caveat facts", () => {
    const joined = [getLegalHub("en"), ...LEGAL_POLICY_SLUGS.map((slug) => getLegalDocument(slug, "en"))].map(textOf).join(" ");
    expect(joined).toContain("Jo?o Pedro Reis");
    expect(joined).toContain("Rua Duarte Galv?o 14 r/c dto., 1500-254 Lisboa, Portugal");
    expect(joined).toContain("NIF 256709661");
    expect(joined).toContain("full unconditional 14-day refund");
    expect(joined).toContain("CNPD");
    expect(joined).toContain("not currently registered in the Portuguese Electronic Complaints Book");
    expect(joined).toContain("without undue delay");
    expect(joined).toContain("UK representative status is unresolved");
    expect(joined).not.toMatch(/Irish law|courts of Ireland|Data Protection Commission|ec\.europa\.eu\/consumers\/odr|72 hours/i);
  });
});
