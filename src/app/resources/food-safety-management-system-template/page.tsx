import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Food Safety Management System Template | PinkPepper",
  description:
    "Understand how to structure a food safety management system (FSMS) document that ties HACCP, SOPs, monitoring records, and audit procedures together for EU and UK compliance.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/food-safety-management-system-template",
  },
};

export default function FoodSafetyManagementSystemTemplatePage() {
  return (
    <ResourceTemplate
      category="Audit resource"
      title="How to structure a food safety management system document"
      intro="A food safety management system (FSMS) is the overarching framework that ties your HACCP plan, prerequisite programmes, SOPs, monitoring records, and audit procedures together. An inspector reviewing your site should be able to pick up the FSMS document and understand how all the pieces connect."
      summaryPoints={[
        "The FSMS document should describe the scope of the system — which sites, products, and processes it covers.",
        "It should index all component documents: HACCP plan, SOPs, allergen policy, traceability procedure, and records.",
        "Management commitment and review frequency should be explicit, not assumed.",
      ]}
      sections={[
        {
          title: "Scope, context, and management commitment",
          body: "The FSMS document should open with a clear scope statement: which premises it covers, which product categories or processes are included, and which are excluded and why. A brief statement of management commitment — naming the person responsible for food safety and the review frequency — sets the tone for the system and satisfies a common inspection question before it is asked.",
        },
        {
          title: "Structure of component documents",
          body: "The body of the FSMS is essentially a controlled index. For each component — the HACCP plan, each SOP, the allergen policy, the traceability procedure, the audit checklist — the document should record the document title, its version number, the date of last review, and who is responsible for it. This makes it clear that the system is actively maintained rather than assembled once and forgotten.",
        },
        {
          title: "Review, verification, and continuous improvement",
          body: "An FSMS that is not reviewed degrades over time as the operation changes. The document should state how often the whole system is reviewed — annually is typical — and what triggers an out-of-cycle review: a new product, a process change, a customer complaint, a failed audit, or a change in legislation. Documenting the outcome of each review, even briefly, provides the audit trail that demonstrates the system is genuinely managed.",
        },
      ]}
      ctaTitle="Build a complete FSMS document structure"
      ctaBody="PinkPepper can help you create an FSMS framework document that connects your HACCP plan, SOPs, allergen policy, and monitoring records into a coherent, inspection-ready system."
      relatedLinks={[
        { href: "/resources/haccp-plan-template", label: "HACCP plan template" },
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
        { href: "/resources/food-safety-document-checklist", label: "EU and UK document checklist" },
      ]}
    />
  );
}
