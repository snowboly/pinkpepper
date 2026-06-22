import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Traceability and Recall Readiness Poster | PinkPepper",
  description:
    "Use a traceability and recall readiness poster to reinforce batch linking, withdrawal triggers, escalation, and record discipline for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/traceability-recall-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/traceability-recall-poster",
      en: "https://pinkpepper.io/resources/traceability-recall-poster",
    },
  },
};

export default function TraceabilityRecallPosterPage() {
  return (
    <ResourceTemplate
      category="Traceability resource"
      title="What a traceability and recall readiness poster should keep visible"
      intro="A traceability and recall readiness poster should reinforce the habits that make a withdrawal or recall possible: clear batch identification, lot linking, supplier and customer trace-back, and immediate escalation when safety concerns appear. For EU and UK businesses, its role is to support working discipline around records, not to replace the recall procedure."
      summaryPoints={[
        "The best recall-readiness posters remind teams that traceability depends on accurate records made at the moment work happens.",
        "A useful visual prompt focuses on batch identification, lot linkage, escalation triggers, and who needs to know first.",
        "The poster should support the actual traceability and recall procedure already used by the business, not invent a second system on the wall.",
      ]}
      documentHighlights={[
        {
          label: "Batch and lot discipline",
          description:
            "The poster should reinforce that ingredients, work-in-progress, and finished product need identifiable links if the business is going to trace anything quickly later.",
        },
        {
          label: "One step back, one step forward",
          description:
            "Visible prompts should remind staff what traceability means in practice: knowing what came in, what it became, and where it went.",
        },
        {
          label: "Early escalation triggers",
          description:
            "The poster is more useful when it tells staff what kinds of issue require immediate escalation, such as complaints, labelling errors, supplier alerts, contamination concerns, or missing records.",
        },
        {
          label: "Recall readiness, not recall theatre",
          description:
            "The message should point people back to the real records and contacts that make a withdrawal or recall work, not just use dramatic language about emergencies.",
        },
      ]}
      sections={[
        {
          title: "Recall readiness is built long before a recall happens",
          body:
            "When the problem arrives, the business does not suddenly become traceable. It either has usable records and clear escalation habits already, or it does not. That is why a visible poster can help: it keeps the daily behaviours behind traceability from becoming invisible routine gaps.",
        },
        {
          title: "The visible message should support record quality",
          body:
            "If labels, lots, or internal links are treated casually during production or service, no policy document will fix that later. A stronger poster message helps remind the team that these small record details are what make targeted action possible.",
        },
        {
          title: "Keep the escalation route simple",
          body:
            "Staff do not need a wall poster explaining every recall scenario. They need to know what kinds of issue matter, what records to protect, and who to alert immediately so the business can assess scope without delay.",
        },
      ]}
      ctaTitle="Support recall readiness with stronger daily traceability habits"
      ctaBody="PinkPepper helps teams connect visible traceability prompts with log templates, incoming-goods checks, and recall procedures so the business is easier to trace under pressure."
      templateSlug="traceability-recall-poster"
      relatedLinks={[
        { href: "/resources/traceability-log-template", label: "Traceability log template" },
        { href: "/resources/product-recall-procedure-template", label: "Product recall procedure template" },
        { href: "/resources/incoming-goods-template", label: "Incoming goods inspection template" },
      ]}
    />
  );
}
