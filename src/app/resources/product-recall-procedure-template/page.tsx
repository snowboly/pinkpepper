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
      intro="A recall or withdrawal procedure is required under EU Regulation 178/2002 and UK retained food law. The point isn't to have a document — it's to be able to act quickly, trace affected product, notify the right people, and show the action was effective."
      summaryPoints={[
        "One named person responsible for initiating and managing the recall — not 'the team'.",
        "Traceability records are what make the procedure work. Without them, scope assessment is guesswork.",
        "A mock recall at least annually shows the procedure is functional, not just filed.",
      ]}
      documentHighlights={[
        {
          label: "Trigger criteria",
          description:
            "What events activate the procedure — failed product test, allergen mislabelling, supplier notification, customer complaint with a safety element. Also the distinction between a withdrawal (supply chain only) and a full recall (including consumer-facing communication).",
        },
        {
          label: "Roles and contact list",
          description:
            "Recall coordinator, their deputy, and the contact details for the relevant authority — FSA in the UK, national body in EU member states. Agreed in advance, not worked out under pressure.",
        },
        {
          label: "Traceability scope worksheet",
          description:
            "Where to work out which lots or batches are affected, how far they've distributed, and what needs to be recovered. This is the practical core of the procedure — and it only works if traceability records exist.",
        },
        {
          label: "Effectiveness check section",
          description:
            "What was recovered vs what was distributed, as a percentage. Whether communication reached all relevant parties. Post-recall review findings. This is what closes the procedure properly.",
        },
      ]}
      sections={[
        {
          title: "The trigger criteria need to be clear in advance",
          body:
            "When something goes wrong is not the time to decide whether it constitutes a recall. The procedure should define the events that trigger it — and the difference between a withdrawal (out of the supply chain before consumers) and a full recall that includes regulatory notification and possibly public communication.",
        },
        {
          title: "Roles and contacts can't be improvised",
          body:
            "Who coordinates the recall, who stands in if that person is unavailable, who calls the FSA, who talks to retailers, who handles any media — these decisions need to be made and documented beforehand. Media and social communication lines agreed in advance are far better than responses drafted under pressure.",
        },
        {
          title: "The practical core is traceability",
          body:
            "How quickly can your team identify which lot or batch is affected, where it went, and how much has been recovered? That depends entirely on traceability records. A recall procedure that assumes those records exist but doesn't reference or test them is not actually ready to use.",
        },
      ]}
      ctaTitle="Draft a recall procedure matched to your operation"
      ctaBody="PinkPepper can help you produce a product recall and withdrawal procedure that reflects your distribution chain, lot coding system, and notification contacts."
      templateSlug="product-recall-procedure-template"
      relatedLinks={[
        { href: "/resources/traceability-log-template", label: "Traceability log template" },
        { href: "/resources/haccp-plan-template", label: "HACCP plan template" },
        { href: "/resources/food-safety-document-checklist", label: "EU and UK document checklist" },
      ]}
    />
  );
}
