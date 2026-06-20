import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Supplier Approval Checklist Poster | PinkPepper",
  description:
    "Use a supplier approval checklist poster to reinforce due diligence, product scope checks, review dates, and escalation points for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/supplier-approval-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/supplier-approval-poster",
      en: "https://pinkpepper.io/resources/supplier-approval-poster",
    },
  },
};

export default function SupplierApprovalPosterPage() {
  return (
    <ResourceTemplate
      category="Supplier resource"
      title="What a supplier approval poster should help teams check before buying or receiving"
      intro="A supplier approval poster should keep the due-diligence basics visible: approved status, product scope, supporting evidence, review timing, and escalation when information is missing. For EU and UK food businesses, it is a useful visual prompt for buyers, QA teams, and goods-in staff who need to see supplier approval as an active control rather than a file somewhere in the office."
      summaryPoints={[
        "Supplier approval posters are most useful when they reinforce the evidence and follow-up points that teams often scatter across emails and folders.",
        "The visible prompt should support your approval questionnaire, supplier register, and incoming-goods checks rather than sit apart from them.",
        "A good supplier checklist poster helps staff stop and escalate when a supplier, product, or document falls outside approved scope.",
      ]}
      documentHighlights={[
        {
          label: "Approved status and scope",
          description:
            "The poster should remind staff to check whether the supplier is approved for the exact product or category being purchased or received, not just whether the company is known to the business.",
        },
        {
          label: "Evidence and expiry points",
          description:
            "Useful prompts include specification checks, certification status, allergen or traceability evidence, and the review dates that show approval is still current.",
        },
        {
          label: "Goods-in and purchasing alignment",
          description:
            "The value of the poster increases when the same approval logic is visible both to the person ordering and the person receiving the delivery.",
        },
        {
          label: "Escalation when something is missing",
          description:
            "The poster should clearly support a stop-and-check response when product scope, paperwork, or approval status do not line up.",
        },
      ]}
      sections={[
        {
          title: "Supplier approval fails when it becomes passive paperwork",
          body:
            "A supplier can be 'approved' on paper and still drift out of scope in practice through changed products, missed reviews, expired evidence, or incomplete specifications. A poster helps by keeping the approval checkpoints visible at the point of decision.",
        },
        {
          title: "The best reminder connects purchasing and receiving",
          body:
            "Approval is not just a QA task. Buyers, managers, and goods-in teams all affect whether unapproved or poorly documented products enter the operation. A visible checklist helps make the same rules visible across that chain.",
        },
        {
          title: "A visual prompt is most useful when it supports escalation",
          body:
            "The strongest poster message is not 'trust approved suppliers'. It is 'verify the scope, verify the evidence, and stop when the details do not match'. That is where supplier approval becomes a real control instead of an archive.",
        },
      ]}
      ctaTitle="Keep supplier approval visible in daily decisions"
      ctaBody="PinkPepper helps businesses combine supplier posters with approval questionnaires, registers, and incoming-goods checks so the visible prompt supports real due diligence."
      templateSlug="supplier-approval-poster"
      relatedLinks={[
        { href: "/resources/supplier-approval-questionnaire", label: "Supplier approval questionnaire" },
        { href: "/resources/supplier-registration-log", label: "Supplier registration log" },
        { href: "/resources/incoming-goods-template", label: "Incoming goods inspection template" },
      ]}
    />
  );
}
