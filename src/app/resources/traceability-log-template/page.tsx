import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Traceability Log Template | PinkPepper",
  description:
    "Learn what traceability records must capture for EU Regulation 178/2002 and UK food law compliance — including one-step-back and one-step-forward requirements.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/traceability-log-template",
  },
};

export default function TraceabilityLogTemplatePage() {
  return (
    <ResourceTemplate
      category="Traceability resource"
      title="What traceability records must capture for EU and UK compliance"
      intro="Traceability is a legal requirement under EU Regulation 178/2002 and UK retained food law. The principle is one step back and one step forward: you must be able to identify where your ingredients came from and where your finished product went. The practical challenge is making those records usable in a real recall or withdrawal scenario."
      summaryPoints={[
        "One-step-back means recording supplier name, delivery date, lot or batch reference, and quantity received.",
        "One-step-forward means recording who received your finished product, when, in what quantity, and with which batch.",
        "Internal traceability — linking incoming ingredient lots to finished product batches — strengthens both directions.",
      ]}
      sections={[
        {
          title: "Incoming ingredient traceability",
          body: "For each delivery, your records should capture the supplier name, the product description, the delivery date, the lot or batch code from the packaging or delivery documentation, and the quantity received. For high-risk ingredients — allergens, raw proteins, imported products — the records are particularly important. If a supplier issues a recall, you need to be able to identify which deliveries from that supplier are affected and what products they went into.",
        },
        {
          title: "Finished product and distribution records",
          body: "For each batch of finished product dispatched, the record should include the product name, your internal lot or batch code, the production or packing date, the customer or distribution point, the quantity dispatched, and the dispatch date. For direct-to-consumer businesses, the mechanism differs — you may not have individual consumer records, but you should be able to identify the date range and sales channel affected.",
        },
        {
          title: "Internal traceability and the link between them",
          body: "Internal traceability — the record of which ingredient lots were used in which production batch — is often the weakest link. Without it, you cannot scope a recall accurately: you know which deliveries arrived but not which finished batches they went into. Even a simple production log that records the date, product, and the lot codes of key ingredients used is sufficient to close this gap for most small and medium operations.",
        },
      ]}
      ctaTitle="Build a traceability system for your operation"
      ctaBody="PinkPepper can help you draft traceability procedures and log templates that match the way your operation actually receives, produces, and dispatches food."
      relatedLinks={[
        { href: "/resources/product-recall-procedure-template", label: "Product recall procedure" },
        { href: "/resources/supplier-approval-questionnaire", label: "Supplier approval questionnaire" },
        { href: "/resources/food-safety-document-checklist", label: "EU and UK document checklist" },
      ]}
    />
  );
}
