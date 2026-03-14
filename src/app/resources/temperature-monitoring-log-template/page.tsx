import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Temperature Monitoring Log Template | PinkPepper",
  description:
    "Learn what to include in a food safety temperature monitoring log template for chilled, frozen, and hot-held foods.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/temperature-monitoring-log-template",
  },
};

export default function TemperatureMonitoringLogTemplatePage() {
  return (
    <ResourceTemplate
      category="Monitoring resource"
      title="What a temperature monitoring log template should record"
      intro="Temperature logs are useful only when they create a traceable record of what was checked, when it was checked, what the result was, and what happened when things were out of range."
      summaryPoints={[
        "A good log needs the reading, timing, location or asset, and responsible person.",
        "Corrective action fields matter as much as the normal readings.",
        "Logs should support trend review, not just one-off sign-offs.",
      ]}
      sections={[
        {
          title: "Capture enough context to be useful",
          body:
            "Fridge, freezer, cooling, and hot-hold logs should identify the location or equipment, record the reading, capture the date and time, and show who performed the check. Without that context, the record is much weaker in review.",
        },
        {
          title: "Do not treat exceptions as an afterthought",
          body:
            "The most valuable part of a monitoring log is often the corrective action entry. What was done when the reading fell outside limits, and was the issue closed properly? A template should make this easy to record.",
        },
        {
          title: "Logs should support management review",
          body:
            "A temperature log is more than a compliance artifact. It can also show recurring equipment issues, weak shift handovers, or process drift when reviewed regularly.",
        },
      ]}
      ctaTitle="Draft better monitoring logs and corrective action records"
      ctaBody="PinkPepper helps food businesses generate temperature logs and related SOPs that are easier to review and maintain."
      relatedLinks={[
        { href: "/features/food-safety-sop-generator", label: "Food safety SOP generator" },
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
        { href: "/use-cases/restaurants", label: "Restaurant use case" },
      ]}
    />
  );
}
