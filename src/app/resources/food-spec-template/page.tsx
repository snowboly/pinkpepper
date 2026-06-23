import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Food Specification Template | PinkPepper",
  description:
    "Learn what a food specification template should capture for ingredients or finished goods, including composition, allergens, storage conditions, shelf life, and approval details.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/food-spec-template",
    languages: { "x-default": "https://pinkpepper.io/resources/food-spec-template", en: "https://pinkpepper.io/resources/food-spec-template" },
  },
};

export default function FoodSpecTemplatePage() {
  return (
    <ResourceTemplate
      category="Supplier resource"
      title="What a food specification template should help you control"
      intro="A food specification should tell you exactly what you are buying, what legal or customer requirements apply to it, and what your team needs to know before approving, receiving, storing, or using it. It is the working reference behind supplier approval, allergen control, and release decisions."
      summaryPoints={[
        "Composition, allergens, and storage rules need to be explicit enough for receiving and production teams to use.",
        "Shelf life, origin, packaging, and approval status should sit in one record rather than across emails and PDFs.",
        "A useful specification is built for review and change control, not just for filing away after onboarding.",
      ]}
      documentHighlights={[
        {
          label: "Product identity and scope",
          description:
            "Product name, code, supplier, ingredient or finished-good category, country of origin, and pack format. Those fields stop teams from approving vague documents that cannot be matched back to the actual item being purchased.",
        },
        {
          label: "Composition and allergen declaration",
          description:
            "Ingredient list, declared allergens, may-contain statements, and any free-from claims. This is the part of the specification most likely to affect your allergen matrix, artwork checks, and recipe-change decisions.",
        },
        {
          label: "Storage, shelf life, and handling conditions",
          description:
            "Required storage temperature, shelf-life expectations, once-opened conditions, and any transport constraints. Without these fields, a business can approve a product commercially while still missing the operational controls needed on site.",
        },
        {
          label: "Approval and review controls",
          description:
            "Issue date, version, approved-by field, and next review point. That turns the document into a controlled supplier specification instead of a static attachment with no ownership.",
        },
      ]}
      sections={[
        {
          title: "Specifications sit upstream of several later compliance failures",
          body:
            "When a product arrives with the wrong allergen declaration, unclear shelf life, or storage instructions that do not match your process, the root problem often starts before the delivery reaches site. A stronger food specification catches those gaps during approval instead of leaving them to receiving, production, or complaint investigation.",
        },
        {
          title: "The specification should support both supplier approval and operational use",
          body:
            "A supplier can be commercially approved while the product data remains weak. The better document is the one your production, QA, and purchasing teams can all use: clear enough for intake checks, detailed enough for allergen review, and controlled enough for re-approval cycles.",
        },
        {
          title: "Version control matters as much as the data fields themselves",
          body:
            "Specifications drift when suppliers reformulate, relabel, change origin, or update shelf life. If the template has no issue date, version, or approval step, teams keep working from old product assumptions. That is how wrong-pack, wrong-allergen, and wrong-storage issues survive into the live operation.",
        },
      ]}
      ctaTitle="Build stronger product and supplier specs"
      ctaBody="PinkPepper helps teams create controlled food specifications, supplier approval records, and supporting allergen documentation that are easier to review and keep current."
      templateSlug="food-spec-template"
      relatedLinks={[
        { href: "/resources/supplier-approval-questionnaire", label: "Supplier approval questionnaire" },
        { href: "/resources/supplier-registration-log", label: "Supplier registration log" },
        { href: "/resources/incoming-goods-template", label: "Incoming goods inspection template" },
        { href: "/resources/allergen-matrix-template", label: "Allergen matrix template" },
      ]}
    />
  );
}
