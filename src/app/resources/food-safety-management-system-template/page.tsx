import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Food Safety Management System Template | PinkPepper",
  description:
    "Understand how to structure a food safety management system (FSMS) document that ties HACCP, SOPs, monitoring records, and audit procedures together for EU and UK compliance.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/food-safety-management-system-template",
    languages: { "x-default": "https://pinkpepper.io/resources/food-safety-management-system-template", en: "https://pinkpepper.io/resources/food-safety-management-system-template" },
  },
};

export default function FoodSafetyManagementSystemTemplatePage() {
  return (
    <ResourceTemplate
      category="Audit resource"
      title="How to structure a food safety management system document"
      intro="A food safety management system (FSMS) is the document that ties everything else together — HACCP plan, SOPs, allergen policy, monitoring records, audit procedures. An inspector should be able to pick it up and understand how the whole system connects."
      summaryPoints={[
        "Scope statement first — which sites, products, and processes are covered.",
        "A controlled index of all component documents, not just a list of what exists.",
        "Management commitment and review frequency named explicitly, not assumed.",
      ]}
      documentHighlights={[
        {
          label: "Scope statement",
          description:
            "Which premises, which product categories, which processes are in — and which are out. This is what tells an inspector (and your own team) exactly what the system covers.",
        },
        {
          label: "Document register",
          description:
            "A controlled index listing every component — HACCP plan, each SOP, allergen policy, traceability procedure, audit checklist — with version number, last review date, and the person responsible for it.",
        },
        {
          label: "Management commitment section",
          description:
            "Who is responsible for food safety at the site, what their role is, and how often the system gets reviewed. This answers one of the most common inspection questions before it's even asked.",
        },
        {
          label: "Review log",
          description:
            "Dates and brief outcomes of each system review. Even a few lines per review is enough — it's what turns a static document into evidence that the system is actively managed.",
        },
      ]}
      sections={[
        {
          title: "The scope statement matters more than people think",
          body:
            "A lot of FSMS documents skip this or write it vaguely. But scope is what defines the whole system. Which premises does it cover? Which products? If part of the operation is excluded, why? Getting this right at the start prevents a lot of confusion when the document is reviewed by someone unfamiliar with the site.",
        },
        {
          title: "The body of the document is essentially an index",
          body:
            "For each component — HACCP plan, each SOP, allergen policy, traceability procedure — the FSMS records the document title, version number, last review date, and who owns it. That's what shows the system is maintained, not just assembled once and put in a folder.",
        },
        {
          title: "An FSMS that isn't reviewed degrades",
          body:
            "Operations change. New products, new processes, new legislation. The document should state how often the whole system is reviewed — annually is typical — and what triggers an unscheduled review. Documenting the outcome of each review, even briefly, provides the audit trail that shows someone is actually in charge of this.",
        },
      ]}
      ctaTitle="Build a complete FSMS document structure"
      ctaBody="PinkPepper can help you create an FSMS framework document that connects your HACCP plan, SOPs, allergen policy, and monitoring records into a coherent, inspection-ready system."
      templateSlug="food-safety-management-system-template"
      relatedLinks={[
        { href: "/resources/haccp-plan-template", label: "HACCP plan template" },
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
        { href: "/resources/food-safety-document-checklist", label: "EU and UK document checklist" },
      ]}
    />
  );
}
