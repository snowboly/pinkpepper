import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Product Recall Procedure Template | PinkPepper",
  description:
    "Understand what a food product recall or withdrawal procedure must contain for EU and UK compliance, including traceability, communication, and effectiveness testing.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/product-recall-procedure-template",
  },
};

export default function ProductRecallProcedureTemplatePage() {
  return (
    <ResourceTemplate
      category="HACCP resource"
      title="What a product recall procedure template must include"
      intro="A recall or withdrawal procedure is required under EU Regulation 178/2002 and UK retained food law. Its purpose is not just to have a document — it is to enable your team to act quickly, trace affected product, notify the right people, and demonstrate the action was effective."
      summaryPoints={[
        "The procedure must identify the person responsible for initiating and managing a recall or withdrawal.",
        "Traceability links are what make the procedure work — without them, scope assessment is guesswork.",
        "A mock recall or test exercise at least annually demonstrates the procedure is functional, not just filed.",
      ]}
      sections={[
        {
          title: "Scope and trigger criteria",
          body: "The procedure should define what events trigger it: a failed product test, a customer complaint identifying a safety issue, an allergen mislabelling event, or a supplier notification. It should also clarify the difference between a withdrawal (from the supply chain before it reaches consumers) and a full recall (including consumer-facing communication and regulatory notification).",
        },
        {
          title: "Roles, contacts, and communication",
          body: "At minimum, the procedure needs to name the recall coordinator, their deputy, and the contact details for the relevant competent authority — the FSA in the UK, or the relevant national body in EU member states. It should also identify who communicates to retailers, distributors, and if needed, the public. Media or social communication lines should be agreed in advance rather than improvised under pressure.",
        },
        {
          title: "Traceability, scope assessment, and effectiveness check",
          body: "The practical core of a recall procedure is how quickly your team can identify the affected lot or batch, determine how far it has distributed, and quantify what has been recovered. This depends on traceability records. The procedure should include a post-recall review: how much product was recovered, what percentage that represents, and whether the communication reached all relevant parties.",
        },
      ]}
      ctaTitle="Draft a recall procedure matched to your operation"
      ctaBody="PinkPepper can help you produce a product recall and withdrawal procedure that reflects your distribution chain, lot coding system, and notification contacts."
      relatedLinks={[
        { href: "/resources/traceability-log-template", label: "Traceability log template" },
        { href: "/resources/haccp-plan-template", label: "HACCP plan template" },
        { href: "/resources/food-safety-document-checklist", label: "EU and UK document checklist" },
      ]}
    />
  );
}
