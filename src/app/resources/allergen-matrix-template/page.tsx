import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Allergen Matrix Template | PinkPepper",
  description:
    "Learn how to structure an allergen matrix template for menu items, ingredients, cross-contact controls, and updates.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/allergen-matrix-template",
  },
};

export default function AllergenMatrixTemplatePage() {
  return (
    <ResourceTemplate
      category="Allergen resource"
      title="How to build an allergen matrix template teams can keep updated"
      intro="An allergen matrix should do more than list ingredients once. It needs to stay current, flag cross-contact risks clearly, and be readable by the person actually answering a customer's question."
      summaryPoints={[
        "One row per menu item. One column per regulated allergen. Cross-contact flagged separately.",
        "Only useful if it gets updated — menu changes, supplier swaps, and seasonal items all need to feed back into it.",
        "The front-of-house team needs to be able to use it, not just the kitchen.",
      ]}
      documentHighlights={[
        {
          label: "Menu item rows",
          description:
            "One row per dish or product. The list needs to stay current — anything not on here is invisible to whoever's answering an allergen query at service.",
        },
        {
          label: "All 14 regulated allergen columns",
          description:
            "Celery, cereals containing gluten, crustaceans, eggs, fish, lupin, milk, molluscs, mustard, peanuts, sesame, soya, sulphur dioxide, tree nuts — each one has its own column, marked clearly per item.",
        },
        {
          label: "Cross-contact column",
          description:
            "Separate from declared allergens. Where shared equipment, surfaces, or ingredients create a cross-contact risk, it needs its own field — not buried in a note or assumed to be obvious.",
        },
        {
          label: "Version date and reviewed-by field",
          description:
            "A matrix without a date is hard to trust. This field shows when it was last reviewed, so whoever's relying on it knows whether it's current.",
        },
      ]}
      sections={[
        {
          title: "Ingredient data is only the starting point",
          body:
            "A matrix usually starts with recipe information. But it only becomes operationally useful when it also reflects shared tools, shared stations, and what gets verified before service. A lot of businesses get the first part right and skip the second.",
        },
        {
          title: "Maintenance is the hard part",
          body:
            "Most teams build a matrix once and then let it drift. New suppliers, substitutions, seasonal changes — any of these can invalidate an entry without anyone noticing. The businesses that handle this well have a process: recipe changes trigger a matrix review, not a separate task that gets done eventually.",
        },
        {
          title: "It needs to work at the point of service",
          body:
            "The matrix isn't just for auditors. It's for the person at the pass when a customer says they have a nut allergy. If it's not readable under pressure, or it hasn't been updated since last season, it fails at the moment it matters most.",
        },
      ]}
      ctaTitle="Create allergen documents that are easier to maintain"
      ctaBody="PinkPepper helps food businesses draft allergen matrices, control documents, and update workflows without relying on one static spreadsheet."
      templateSlug="allergen-matrix-template"
      relatedLinks={[
        { href: "/features/allergen-documentation", label: "Allergen documentation" },
        { href: "/use-cases/cafes", label: "Cafe use case" },
        { href: "/resources/cleaning-and-disinfection-sop", label: "Cleaning and disinfection SOP" },
      ]}
    />
  );
}
