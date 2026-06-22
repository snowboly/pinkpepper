import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Supplier Registration Log | PinkPepper",
  description:
    "Learn what to include in a supplier registration log for approval status, review dates, product scope, and due-diligence follow-up.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/supplier-registration-log",
    languages: { "x-default": "https://pinkpepper.io/resources/supplier-registration-log", en: "https://pinkpepper.io/resources/supplier-registration-log" },
  },
};

export default function SupplierRegistrationLogPage() {
  return (
    <ResourceTemplate
      category="Supplier resource"
      title="What a supplier registration log should help you track"
      intro="A supplier registration log should give you one place to see who is approved, what they supply, when they were last reviewed, and what still needs follow-up. It is not just a contact list. It is the working register behind supplier approval and re-approval."
      summaryPoints={[
        "One row per supplier, not one row per document.",
        "Approval status, scope, and review timing should be visible at a glance.",
        "Useful enough for daily follow-up, not just audit-day evidence.",
      ]}
      documentHighlights={[
        {
          label: "Supplier and product scope fields",
          description:
            "The log should show who the supplier is and what they actually provide. That makes it easier to separate high-risk ingredient suppliers from lower-risk service providers or packaging suppliers.",
        },
        {
          label: "Approval status and risk level",
          description:
            "Pending, approved, conditionally approved, blocked, or under review should be obvious. Risk level should sit alongside that so teams know which suppliers need tighter follow-up.",
        },
        {
          label: "Review and re-approval dates",
          description:
            "A working supplier register needs dates that trigger action. Without review dates, approvals drift and no one notices until an inspection or supplier issue forces the question.",
        },
        {
          label: "Documents checked and actions outstanding",
          description:
            "The useful log records what evidence has been checked and what is still missing. That is what turns supplier approval into an active due-diligence process rather than a box-ticking exercise.",
        },
      ]}
      sections={[
        {
          title: "The log should support the approval process, not sit beside it",
          body:
            "A questionnaire or certificate on its own does not show the state of your supplier base. The log is the document that tells you who is approved, who is overdue for review, and where follow-up is still open. Without that register, supplier approval becomes scattered across emails and folders.",
        },
        {
          title: "Keep the supplier view and the risk view together",
          body:
            "If the team has to open three different files to understand what a supplier provides and whether they are approved, the process will not stay current. A stronger supplier registration log keeps supplier name, supplied products, approval status, risk level, and next review date in the same place.",
        },
        {
          title: "A good register makes audits and corrective actions easier",
          body:
            "When a supplier issue comes up, the register should help you see the current status quickly, not rebuild the story from scratch. It becomes easier to show due diligence during audit review and easier to decide whether the next step is re-approval, escalation, or blocking supply.",
        },
      ]}
      ctaTitle="Keep supplier approvals in one working register"
      ctaBody="PinkPepper helps teams create supplier approval questionnaires, working registration logs, and follow-up records that are easier to review and maintain."
      templateSlug="supplier-registration-log"
      relatedLinks={[
        { href: "/articles/supplier-approval-in-haccp-records-and-requirements", label: "Supplier approval guide" },
        { href: "/resources/supplier-approval-questionnaire", label: "Supplier approval questionnaire" },
        { href: "/resources/traceability-log-template", label: "Traceability log template" },
        { href: "/features/food-safety-sop-generator", label: "Food safety SOP generator" },
      ]}
    />
  );
}
