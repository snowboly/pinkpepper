import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Supplier Approval Questionnaire | PinkPepper",
  description:
    "Learn what to include in a supplier approval questionnaire for food safety due diligence, specifications, traceability, and review.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/supplier-approval-questionnaire",
  },
};

export default function SupplierApprovalQuestionnairePage() {
  return (
    <ResourceTemplate
      category="Supplier resource"
      title="What to ask in a supplier approval questionnaire"
      intro="A supplier approval questionnaire should help you understand risk, not just collect contact details. The strongest versions ask for the evidence and operating details that affect food safety, traceability, specifications, and review frequency."
      summaryPoints={[
        "Supplier questionnaires should gather both facts and supporting evidence.",
        "Approval should reflect product risk, not just whether a form was returned.",
        "Re-approval and non-conformance follow-up should be part of the same workflow.",
      ]}
      sections={[
        {
          title: "Start with risk and scope",
          body:
            "Questions should establish what the supplier provides, how critical those materials are, and what the compliance risk looks like. A low-risk dry-goods supplier and a chilled high-risk ingredient supplier should not be reviewed in exactly the same way.",
        },
        {
          title: "Request useful evidence",
          body:
            "Specifications, certifications, traceability capability, allergen controls, complaints handling, and recall readiness often matter more than generic company details. A strong questionnaire pulls those details together early.",
        },
        {
          title: "Approval is not a one-time event",
          body:
            "A supplier approval form is only part of the process. Teams also need re-approval schedules, non-conformance review, and a way to document what happens when supplier performance changes.",
        },
      ]}
      ctaTitle="Create supplier approval documents more efficiently"
      ctaBody="PinkPepper helps teams draft supplier approval questionnaires, non-conformance reports, and re-approval records faster."
      relatedLinks={[
        { href: "/features/food-safety-sop-generator", label: "Food safety SOP generator" },
        { href: "/use-cases/catering", label: "Catering use case" },
        { href: "/resources/haccp-plan-template", label: "HACCP plan template" },
      ]}
    />
  );
}
