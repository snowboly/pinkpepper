import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Temperature Monitoring Log Template | PinkPepper",
  description:
    "Learn what to include in a food safety temperature monitoring log template for chilled, frozen, and hot-held foods.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/temperature-monitoring-log-template",
    languages: { "x-default": "https://pinkpepper.io/resources/temperature-monitoring-log-template", en: "https://pinkpepper.io/resources/temperature-monitoring-log-template" },
  },
};

export default function TemperatureMonitoringLogTemplatePage() {
  return (
    <ResourceTemplate
      category="Monitoring resource"
      title="What a temperature monitoring log template should record"
      intro="Temperature logs are only useful when they create a traceable record of what was checked, when, by whom, what the result was, and what happened when something was out of range."
      summaryPoints={[
        "Reading, time, location or equipment, and who did the check — all four, every time.",
        "Corrective action fields matter as much as the normal readings.",
        "Logs reviewed over time tell you things a single entry never can.",
      ]}
      documentHighlights={[
        {
          label: "Equipment or location column",
          description:
            "Which fridge, freezer, hot-hold unit, or probe reading this entry refers to. Without this, all you have is a number — not a record anyone can act on.",
        },
        {
          label: "Time and reading fields",
          description:
            "Not just one entry per day. The time matters — a reading taken at 7am and another at 7pm tell a different story than a single daily average. The actual temperature recorded, not an estimated range.",
        },
        {
          label: "Corrective action row",
          description:
            "What was done when the reading was out of range. What happened to the food, what was adjusted, and who made the decision. This row is often skipped, and it's usually the one inspectors look at first.",
        },
        {
          label: "Sign-off column",
          description:
            "Who performed the check. Not optional. Without this the record can't be traced back to an individual if it needs to be verified or queried.",
        },
      ]}
      sections={[
        {
          title: "Context is what makes a reading useful",
          body:
            "A temperature of 6°C means nothing without knowing which piece of equipment it came from, when it was taken, and who took it. Logs that miss any of those fields are much weaker in review — not because the reading is wrong, but because the record can't be traced.",
        },
        {
          title: "The corrective action row is the most important one",
          body:
            "Normal readings are expected. What tells you whether the system is working is how the team responds when something falls outside limits. Was action taken? Was the food safe? Was the issue resolved? A log with no corrective action entries over a long period is actually a red flag, not a clean record.",
        },
        {
          title: "Review logs for trends, not just compliance",
          body:
            "A fridge that reads 7°C occasionally isn't the same problem as one that reads 7°C every Monday morning. Equipment issues, shift handover gaps, and process drift tend to show up as patterns — and patterns only appear when you look at the records together, not one entry at a time.",
        },
      ]}
      ctaTitle="Draft better monitoring logs and corrective action records"
      ctaBody="PinkPepper helps food businesses generate temperature logs and related SOPs that are easier to review and maintain."
      templateSlug="temperature-monitoring-log-template"
      relatedLinks={[
        { href: "/features/food-safety-sop-generator", label: "Food safety SOP generator" },
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
        { href: "/articles", label: "Food safety articles" },
      ]}
    />
  );
}
