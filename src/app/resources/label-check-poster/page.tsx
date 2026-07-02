import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Label Check Poster | PinkPepper",
  description:
    "Use a label check poster to keep allergen checks, date codes, storage instructions, and product identity visible at goods-in and prep.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/label-check-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/label-check-poster",
      en: "https://pinkpepper.io/resources/label-check-poster",
    },
  },
};

export default function LabelCheckPosterPage() {
  return (
    <ResourceTemplate
      category="Monitoring resource"
      title="What a label check poster should help staff remember"
      intro="A missed label check at goods-in or during prep is not a paperwork issue first. It is a product identity, allergen, storage, and shelf-life risk that can move straight into service if nobody stops it. A good label check poster keeps those core checks visible where stock is received, opened, decanted, and used."
      summaryPoints={[
        "The label is one of the fastest control points you have for allergens, shelf life, and traceability.",
        "A visual reminder is most valuable where substitutions and rushed decisions are most likely.",
        "The poster should reinforce behaviour at intake, storage, prep, and service handover, not just at one stage.",
      ]}
      documentHighlights={[
        {
          label: "Allergen visibility",
          description:
            "The poster should make allergen checking an active habit whenever ingredients are received, opened, or substituted.",
        },
        {
          label: "Product identity and storage",
          description:
            "Teams need a reminder to confirm that the product matches the order and that the storage instructions are actually being followed.",
        },
        {
          label: "Date code discipline",
          description:
            "Use-by and best-before checks are only useful when staff are expected to stop and read them before use, not after something is already in prep.",
        },
        {
          label: "Decanting and relabelling",
          description:
            "A poster should reinforce that critical information does not disappear when the original pack does. It needs to travel with the product.",
        },
      ]}
      sections={[
        {
          title: "The label is often the first and last warning",
          body:
            "You cannot safely rely on memory, appearance, or what you expected the supplier to send. Specifications change, substitutes arrive, and a single missed label can put the wrong ingredient into the wrong dish. A visible poster keeps label scrutiny as a normal part of work rather than something saved for audits.",
        },
        {
          title: "Useful at goods-in, prep, and service support points",
          body:
            "This kind of prompt matters anywhere staff touch packaged ingredients, not just at the delivery door. It belongs near intake, decanting benches, packing stations, and dry stores where quick decisions can otherwise bypass the checks that protect allergen control and stock integrity.",
        },
        {
          title: "Supports traceability and allergen routines in practice",
          body:
            "A label check poster does not replace your specification file, allergen matrix, or goods-in process. Its job is to strengthen the frontline behaviour that makes those systems reliable when the site is moving quickly and nobody wants to pause for a second check.",
        },
      ]}
      ctaTitle="Make label checking visible before mistakes travel"
      ctaBody="PinkPepper helps teams connect label discipline to allergen matrices, goods-in checks, and traceability records so the control stays usable in daily operations."
      templateSlug="label-check-poster"
      relatedLinks={[
        { href: "/resources/allergen-matrix-template", label: "Allergen matrix template" },
        { href: "/resources/incoming-goods-template", label: "Incoming goods inspection template" },
        { href: "/resources/traceability-log-template", label: "Traceability log template" },
        { href: "/resources/food-spec-template", label: "Food specification template" },
      ]}
    />
  );
}
