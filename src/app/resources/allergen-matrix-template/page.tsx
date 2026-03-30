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
      intro="An allergen matrix should do more than list ingredients once. It should support updates, cross-contact review, and communication between kitchen and front-of-house teams."
      summaryPoints={[
        "A useful allergen matrix needs ingredient-level clarity and update discipline.",
        "Cross-contact controls should be documented alongside declared allergens where relevant.",
        "The matrix works best when linked to recipe changes, labels, and service communication.",
      ]}
      sections={[
        {
          title: "Ingredient data is only the starting point",
          body:
            "A matrix usually begins with ingredient and recipe information, but it becomes operationally useful only when it also reflects shared tools, shared stations, storage controls, and verification steps before service or dispatch.",
        },
        {
          title: "The real challenge is maintenance",
          body:
            "Many teams build a matrix once and then let it drift. New suppliers, substitutions, menu changes, and seasonal items quickly make the document unreliable. A better workflow makes updates part of the system.",
        },
        {
          title: "The matrix should support real communication",
          body:
            "A matrix is not only for auditors. It should help managers, chefs, and front-of-house teams answer customer questions consistently and identify when extra verification is needed.",
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
