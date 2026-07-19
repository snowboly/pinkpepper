import { describe, expect, it } from "vitest";
import { LEGAL_LOCALES, LEGAL_POLICY_SLUGS } from "@/lib/legal/config";
import { getLegalDocument } from "@/lib/legal/content";

const expectedLaw = { en: "Portuguese law", fr: "droit portugais", de: "portugiesischem Recht", es: "Derecho portugués", it: "legge portoghese", pt: "direito português" } as const;

describe("localized legal policies", () => {
  it("preserves clause order and key facts across six locales", () => {
    const englishIds = Object.fromEntries(LEGAL_POLICY_SLUGS.map((slug) => [slug, getLegalDocument(slug, "en").clauses.map((clause) => clause.id)]));
    for (const locale of LEGAL_LOCALES) for (const slug of LEGAL_POLICY_SLUGS) {
      const doc = getLegalDocument(slug, locale);
      expect(doc.clauses.map((clause) => clause.id)).toEqual(englishIds[slug]);
      const text = doc.clauses.flatMap((clause) => clause.blocks).map((block) => block.type === "paragraph" ? block.text : "").join(" ");
      expect(text).toContain("João Pedro Reis");
      expect(text).toContain("256709661");
      expect(text).not.toMatch(/Irish law|courts of Ireland|Data Protection Commission|ec\.europa\.eu\/consumers\/odr|72 hours/i);
    }
    for (const locale of LEGAL_LOCALES) {
      const lawClause = getLegalDocument("terms", locale).clauses.find((clause) => clause.id === "law");
      expect(lawClause?.blocks[0]).toMatchObject({ text: expect.stringContaining(expectedLaw[locale]) });
    }
  });
});
