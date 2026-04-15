import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Supplier Approval Questionnaire | PinkPepper",
  description:
    "Learn what to include in a supplier approval questionnaire for food safety due diligence, specifications, traceability, and review.",
  alternates: {
    canonical: "https://www.pinkpepper.io/resources/supplier-approval-questionnaire",
  },
};

export default function SupplierApprovalQuestionnairePage() {
  return (
    <ResourceTemplate
      category="Supplier resource"
      title="What to ask in a supplier approval questionnaire"
      intro="A supplier approval questionnaire should help you understand risk, not just collect contact details. The useful ones ask for the evidence and operating specifics that actually affect food safety — not generic company information."
      summaryPoints={[
        "Facts and supporting evidence — both, not just one.",
        "Approval should reflect product risk, not just whether a form was returned.",
        "Re-approval and non-conformance follow-up are part of the same process.",
      ]}
      documentHighlights={[
        {
          label: "Food safety certification section",
          description:
            "What approvals they hold, what standards they're certified to, and when those certifications expire. A certificate referenced but not current is worse than no certificate — it suggests nobody's checking.",
        },
        {
          label: "Product specification fields",
          description:
            "What they supply, how it's packed and labelled, allergen status, shelf life, and storage requirements. The information you need to assess risk and keep your own documentation current.",
        },
        {
          label: "Traceability and recall capability",
          description:
            "Can they identify and recall a specific lot? How quickly? This section asks the question most questionnaires skip — and it's the one that matters when something goes wrong.",
        },
        {
          label: "Re-approval date",
          description:
            "When this approval needs to be revisited. High-risk suppliers more frequently, lower-risk ones less so. The date is what turns a one-time approval into an ongoing process.",
        },
      ]}
      sections={[
        {
          title: "Risk and scope first, admin second",
          body:
            "Questions should establish what the supplier provides and how critical those materials are before anything else. A low-risk dry-goods supplier and a chilled high-risk ingredient supplier don't need the same level of scrutiny. The questionnaire should reflect that difference.",
        },
        {
          title: "Ask for the evidence, not just the answer",
          body:
            "Specifications, certifications, allergen controls, traceability capability, complaints handling, recall readiness — these tell you far more than company contact details. A strong questionnaire pulls this information together at the approval stage rather than chasing it later.",
        },
        {
          title: "Approval is not a one-time event",
          body:
            "The questionnaire is only part of the process. Re-approval schedules, non-conformance review, and a way to track what happens when supplier performance changes — all of that needs to be built into the workflow, not treated as separate tasks.",
        },
      ]}
      ctaTitle="Create supplier approval documents more efficiently"
      ctaBody="PinkPepper helps teams draft supplier approval questionnaires, non-conformance reports, and re-approval records faster."
      templateSlug="supplier-approval-questionnaire"
      relatedLinks={[
        { href: "/features/food-safety-sop-generator", label: "Food safety SOP generator" },
        { href: "/use-cases/catering", label: "Catering use case" },
        { href: "/resources/haccp-plan-template", label: "HACCP plan template" },
      ]}
    />
  );
}
