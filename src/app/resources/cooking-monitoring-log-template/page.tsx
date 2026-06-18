import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Cooking Monitoring Log Template | PinkPepper",
  description:
    "Learn what to include in a cooking monitoring log template for core temperatures, batch checks, sign-off, and corrective actions.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/cooking-monitoring-log-template",
    languages: {
      "x-default": "https://pinkpepper.io/resources/cooking-monitoring-log-template",
      en: "https://pinkpepper.io/resources/cooking-monitoring-log-template",
    },
  },
};

export default function CookingMonitoringLogTemplatePage() {
  return (
    <ResourceTemplate
      category="Monitoring resource"
      title="What a cooking monitoring log template should capture"
      intro="A cooking log is where you prove that the product reached the temperature and hold conditions your process depends on. It needs enough context that someone can trace the batch, the reading, the checker, and the corrective action without guessing."
      summaryPoints={[
        "Batch identity, product description, and time of check matter as much as the temperature itself.",
        "The log needs space for failed checks and the action taken, not just successful readings.",
        "Probe verification and operator sign-off keep the record defensible.",
      ]}
      documentHighlights={[
        {
          label: "Batch and product fields",
          description:
            "The log should identify what was cooked, when, and which batch or service period it relates to. That makes later traceability and investigation possible.",
        },
        {
          label: "Target and actual temperature",
          description:
            "Record the actual result, not a tick-box saying the batch was fine. A target column helps staff and reviewers see immediately what pass or fail means.",
        },
        {
          label: "Corrective action entry",
          description:
            "If the food does not meet the target, the record should show whether it was cooked longer, discarded, rechecked, or held back from service.",
        },
        {
          label: "Probe and operator sign-off",
          description:
            "Who took the reading and what measuring equipment was used. If the probe is wrong or the batch is questioned, this is where the trail starts.",
        },
      ]}
      sections={[
        {
          title: "Cooking logs need to be batch-specific",
          body:
            "One temperature written at the top of the day does not prove the rest of the day was under control. Useful logs tie each reading back to a batch, tray, pan, or service run so there is a real operational record behind the number.",
        },
        {
          title: "A clean-looking log with no failures can be a weak one",
          body:
            "If a cooking log never shows a miss, a recheck, or an adjustment, it often means staff are only writing down ideal results. A stronger record includes the occasional deviation and shows how the team handled it.",
        },
        {
          title: "The cooking log should connect to wider HACCP monitoring",
          body:
            "Cooking checks do not stand alone. They should sit alongside chilled storage, hot holding, cooling, and corrective action records so your monitoring chain makes sense across the whole process.",
        },
      ]}
      ctaTitle="Generate clearer cooking and temperature records"
      ctaBody="PinkPepper helps food businesses create cooking logs, temperature checks, and corrective action records that are easier to review and maintain."
      templateSlug="cooking-monitoring-log-template"
      relatedLinks={[
        { href: "/resources/temperature-monitoring-log-template", label: "Temperature monitoring log template" },
        { href: "/resources/food-temperature-poster", label: "Food temperature poster" },
        { href: "/articles/temperature-control-in-haccp-limits-and-monitoring", label: "Temperature control in HACCP" },
      ]}
    />
  );
}
