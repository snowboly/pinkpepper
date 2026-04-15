import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Traceability Log Template | PinkPepper",
  description:
    "Learn what traceability records must capture for EU Regulation 178/2002 and UK food law compliance — including one-step-back and one-step-forward requirements.",
  alternates: {
    canonical: "https://www.pinkpepper.io/resources/traceability-log-template",
  },
};

export default function TraceabilityLogTemplatePage() {
  return (
    <ResourceTemplate
      category="Traceability resource"
      title="What traceability records must capture for EU and UK compliance"
      intro="Traceability is a legal requirement under EU Regulation 178/2002 and UK retained food law. One step back, one step forward — where your ingredients came from, where your finished product went. The practical challenge is making those records work in a real recall scenario, not just on paper."
      summaryPoints={[
        "One step back: supplier, delivery date, lot or batch code, quantity received.",
        "One step forward: customer, dispatch date, batch reference, quantity sent.",
        "Internal traceability — linking ingredient lots to finished batches — is the link most operations are missing.",
      ]}
      documentHighlights={[
        {
          label: "Incoming goods section",
          description:
            "Supplier name, product description, delivery date, lot or batch code, and quantity received. For allergen-containing or high-risk ingredients, this record is particularly important if a supplier recall lands.",
        },
        {
          label: "Finished product and dispatch section",
          description:
            "Product name, your internal batch code, production date, customer or distribution point, quantity, and dispatch date. This is what tells you how far the product has gone if it needs to come back.",
        },
        {
          label: "Internal batch link",
          description:
            "Which ingredient lots went into which production batch. This is the field most operations are missing. Without it, you can't scope a recall accurately — you know when deliveries arrived but not which finished batches they ended up in.",
        },
        {
          label: "Mock recall worksheet",
          description:
            "A simple exercise section for testing the records — can you trace a specific lot backwards and forwards in a reasonable time? Running this once or twice a year shows whether the system actually works.",
        },
      ]}
      sections={[
        {
          title: "One step back means specific records, not general ones",
          body:
            "For each delivery, you need the supplier name, the product, the delivery date, the lot or batch code from the packaging, and the quantity. For allergen-containing and high-risk ingredients especially — if a supplier issues a recall, you need to identify immediately which deliveries are affected and what finished product they went into.",
        },
        {
          title: "One step forward follows the same logic",
          body:
            "For each batch dispatched, the record should include your internal lot code, the customer, the quantity, and the dispatch date. For direct-to-consumer businesses this works differently — you may not have individual records, but you should be able to identify the affected date range and sales channel.",
        },
        {
          title: "The missing link is usually internal traceability",
          body:
            "Most businesses handle incoming and outgoing records reasonably well. What breaks down is the connection between them — which ingredient lots went into which finished batches. Even a simple production log recording the date, product, and the lot codes of key ingredients used is enough to close this gap for most small and medium operations.",
        },
      ]}
      ctaTitle="Build a traceability system for your operation"
      ctaBody="PinkPepper can help you draft traceability procedures and log templates that match the way your operation actually receives, produces, and dispatches food."
      templateSlug="traceability-log-template"
      relatedLinks={[
        { href: "/resources/product-recall-procedure-template", label: "Product recall procedure" },
        { href: "/resources/supplier-approval-questionnaire", label: "Supplier approval questionnaire" },
        { href: "/resources/food-safety-document-checklist", label: "EU and UK document checklist" },
      ]}
    />
  );
}
