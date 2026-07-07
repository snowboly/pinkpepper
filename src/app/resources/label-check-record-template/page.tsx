import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Label Check Record Template | PinkPepper",
  description:
    "Use a label check record template to document allergen, date code, storage, and product identity checks during intake and prep.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/label-check-record-template",
    languages: {
      "x-default": "https://pinkpepper.io/resources/label-check-record-template",
      en: "https://pinkpepper.io/resources/label-check-record-template",
    },
  },
};

export default function LabelCheckRecordTemplatePage() {
  return (
    <ResourceTemplate
      category="Monitoring resource"
      title="What a label check record template should capture"
      intro="A label check only protects the business if the team can show what was reviewed, what was wrong, what decision was made, and who made it. A proper label check record turns allergen, date code, storage, and product identity checks into a usable due-diligence trail instead of a verbal habit nobody can verify later."
      summaryPoints={[
        "The record should capture the product, supplier, date checked, and who performed the review.",
        "Allergen, date code, storage, and product identity fields should be explicit, not left to free-text guesswork.",
        "Rejected items and corrective actions matter as much as accepted deliveries.",
      ]}
      documentHighlights={[
        {
          label: "Product and supplier details",
          description:
            "The sheet should identify exactly what was checked, who supplied it, and which batch or delivery it came from where relevant.",
        },
        {
          label: "Core label verification fields",
          description:
            "Allergens, use-by or best-before date, storage conditions, and product identity need their own check points so the review is consistent every time.",
        },
        {
          label: "Decision and action columns",
          description:
            "Accepted, rejected, held, or escalated should be visible on the sheet, along with the action taken if something did not match expectations.",
        },
        {
          label: "Traceable sign-off",
          description:
            "The person completing the check should sign or initial the entry so the record can be queried later if there is a complaint, recall, or audit review.",
        },
      ]}
      sections={[
        {
          title: "A visible check is not the same as a recorded control",
          body:
            "Teams often say they always read the label, but unless the important checks are written down, there is no clear record of what was reviewed when something goes wrong. A label check record gives structure to a control that otherwise disappears as soon as the product is unpacked or decanted.",
        },
        {
          title: "The strongest use is at intake and first use",
          body:
            "This kind of sheet is most useful where new stock is received, substitutes arrive, or products are opened for prep. That is where allergen changes, wrong storage conditions, and short shelf life are most likely to slip through if staff are moving quickly.",
        },
        {
          title: "It strengthens allergen and traceability routines",
          body:
            "A good label check record does not replace your specification file, allergen matrix, or incoming-goods process. It reinforces them by creating a simple, repeatable record that shows the site is checking the things that matter before products reach service.",
        },
      ]}
      ctaTitle="Record the check before the risk moves into service"
      ctaBody="PinkPepper helps teams connect label checks to allergen control, supplier approval, and traceability records so intake decisions stay easy to review later."
      templateSlug="label-check-record-template"
      relatedLinks={[
        { href: "/resources/label-check-poster", label: "Label check poster" },
        { href: "/resources/incoming-goods-template", label: "Incoming goods inspection template" },
        { href: "/resources/allergen-matrix-template", label: "Allergen matrix template" },
        { href: "/resources/food-spec-template", label: "Food specification template" },
      ]}
    />
  );
}
