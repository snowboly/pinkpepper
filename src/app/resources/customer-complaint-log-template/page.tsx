import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Customer Complaint Log Template | PinkPepper",
  description:
    "Learn what a customer complaint log should capture to investigate food safety issues, identify trends, and feed findings back into your HACCP corrective action process.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/customer-complaint-log-template",
    languages: { "x-default": "https://pinkpepper.io/resources/customer-complaint-log-template", en: "https://pinkpepper.io/resources/customer-complaint-log-template" },
  },
};

export default function CustomerComplaintLogTemplatePage() {
  return (
    <ResourceTemplate
      category="HACCP resource"
      title="What a customer complaint log template should capture"
      intro="A customer complaint log records the nature of each complaint, the investigation carried out, and the outcome. It's both a legal record and a feedback mechanism — complaints are one of the few real-world signals that something in your food safety system may not be working."
      summaryPoints={[
        "Every complaint with a potential food safety dimension must be investigated, not just acknowledged.",
        "Root cause analysis turns an individual complaint into a system improvement.",
        "Trends only emerge when complaints are reviewed collectively, not in isolation.",
      ]}
      documentHighlights={[
        {
          label: "Complaint details",
          description:
            "Date received, product name, batch or lot code if known, nature of the complaint (foreign body, illness, labelling, quality), and how the complaint was received. Enough detail that the entry can be understood without the original message.",
        },
        {
          label: "Investigation record",
          description:
            "What was checked, by whom, and what was found. Did the retained sample show anything? Were any production records reviewed? If the complaint cannot be verified, that conclusion should also be documented.",
        },
        {
          label: "Root cause and corrective action",
          description:
            "What caused the issue and what was done to prevent recurrence. This links the complaint log to your corrective action process. If the same root cause appears in multiple complaints, the log is the evidence that it isn't an isolated incident.",
        },
        {
          label: "Customer response and closure",
          description:
            "What was communicated to the customer and when the complaint was closed. Regulators and auditors look for evidence that complaints are resolved, not just received and filed.",
        },
      ]}
      sections={[
        {
          title: "A complaint is an inspection signal",
          body:
            "Complaints about foreign bodies, illness, or allergen reactions are food safety events, not just customer service issues. They need to be investigated using the same framework as any other HACCP deviation: what happened, why, and what prevents it recurring. An acknowledgement letter without an investigation record doesn't meet that standard.",
        },
        {
          title: "Root cause is what closes the loop",
          body:
            "Resolving the individual complaint — a refund, an apology, a replacement — deals with the customer. Identifying why it happened deals with the system. A complaint log that only records outcomes without root cause analysis is missing the part that makes the record useful for food safety management.",
        },
        {
          title: "Trend review should be scheduled, not reactive",
          body:
            "A single complaint about a product may be an anomaly. Three complaints about the same product line in two months is a pattern. Complaint logs only reveal patterns when they're reviewed periodically as a set. Monthly or quarterly review of complaint categories, root causes, and product lines is what turns individual records into actionable information.",
        },
      ]}
      ctaTitle="Generate a complaint log that feeds your HACCP system"
      ctaBody="PinkPepper can help you build a customer complaint log that connects to your corrective action process, with fields appropriate to your product categories and complaint types."
      templateSlug="customer-complaint-log-template"
      relatedLinks={[
        { href: "/resources/corrective-action-log-template", label: "Corrective action log template" },
        { href: "/resources/haccp-plan-template", label: "HACCP plan template" },
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
      ]}
    />
  );
}
