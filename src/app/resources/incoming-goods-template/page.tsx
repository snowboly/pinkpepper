import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Incoming Goods Inspection Template | PinkPepper",
  description:
    "Learn what an incoming goods inspection record should capture to maintain traceability, reject non-conforming deliveries, and satisfy EU and UK food safety requirements.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/incoming-goods-template",
    languages: { "x-default": "https://pinkpepper.io/resources/incoming-goods-template", en: "https://pinkpepper.io/resources/incoming-goods-template" },
  },
};

export default function IncomingGoodsTemplatePage() {
  return (
    <ResourceTemplate
      category="Traceability resource"
      title="What an incoming goods inspection template should record"
      intro="An incoming goods record creates the first link in your traceability chain. It documents who delivered what, when, in what condition, and at what temperature — forming the evidence base for any trace-back investigation or inspection query."
      summaryPoints={[
        "Supplier name, product, batch or lot number, and delivery date are the minimum traceability fields.",
        "Temperature at receipt matters for chilled and frozen goods — record the actual reading, not an assumed range.",
        "Rejection or acceptance decisions must be documented with a reason, not left to memory.",
      ]}
      documentHighlights={[
        {
          label: "Supplier and delivery details",
          description:
            "Supplier name, delivery date, vehicle registration or driver name, and purchase order or delivery note reference. These link the incoming record to your supplier approval records and make trace-back possible.",
        },
        {
          label: "Product and batch identification",
          description:
            "Product name, quantity, unit of measure, batch or lot number, and best-before or use-by date. Without batch identification, a trace-back or recall cannot be completed.",
        },
        {
          label: "Condition and temperature check",
          description:
            "Visual condition of packaging, probe or ambient temperature reading for chilled and frozen lines, and any signs of damage, pest activity, or label irregularities. The actual reading goes in the field — not 'OK'.",
        },
        {
          label: "Accept or reject decision",
          description:
            "Whether the delivery was accepted, partially accepted, or rejected, and the reason if it was refused or quarantined. This column protects you if a supplier later disputes a rejection.",
        },
      ]}
      sections={[
        {
          title: "The incoming record is the start of the traceability chain",
          body:
            "One-step-back traceability means being able to identify where every ingredient came from. The incoming goods record is that evidence. If a batch needs to be traced following a customer complaint or withdrawal, the first document an investigator reaches for is the receiving log. If the batch reference isn't captured at the point of delivery, it can't be reconstructed later.",
        },
        {
          title: "Temperature at receipt is not the same as storage temperature",
          body:
            "A fridge that runs at 4°C doesn't tell you what condition a delivery arrived in. Chilled goods can arrive warm. Frozen goods can have started to thaw. The incoming log captures the product temperature at the point of receipt — before the goods enter storage — so you have a record of what you actually accepted, not just what you intended to store.",
        },
        {
          title: "Rejections need to be recorded as clearly as acceptances",
          body:
            "A delivery that was turned away or placed in quarantine is only protected by the paper record. If a supplier later claims goods were accepted and then mishandled, a signed rejection entry with the reason noted is the only counter-evidence. The log works in both directions — it records good deliveries and it records the ones that weren't accepted.",
        },
      ]}
      ctaTitle="Generate a goods receiving log for your site"
      ctaBody="PinkPepper can help you produce an incoming goods template that reflects your supplier list, the product categories you receive, and the monitoring frequencies your HACCP plan requires."
      templateSlug="incoming-goods-template"
      relatedLinks={[
        { href: "/resources/traceability-log-template", label: "Traceability log template" },
        { href: "/resources/supplier-approval-questionnaire", label: "Supplier approval questionnaire" },
        { href: "/resources/corrective-action-log-template", label: "Corrective action log template" },
      ]}
    />
  );
}
