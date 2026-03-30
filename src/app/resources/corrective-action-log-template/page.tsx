import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Corrective Action Log Template | PinkPepper",
  description:
    "Learn what a corrective action log should capture for HACCP deviations, root cause analysis, and audit evidence in EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/corrective-action-log-template",
  },
};

export default function CorrectiveActionLogTemplatePage() {
  return (
    <ResourceTemplate
      category="HACCP resource"
      title="What a corrective action log template should capture"
      intro="A corrective action log documents what went wrong, why it happened, and what was done to bring the process back under control. It is a legal requirement under HACCP and one of the first records an inspector will ask to see."
      summaryPoints={[
        "A corrective action log must link the deviation to the specific CCP or prerequisite programme affected.",
        "Root cause entries should be specific enough to show that the cause — not just the symptom — was addressed.",
        "Verification and sign-off columns turn a log into audit evidence rather than an informal note.",
      ]}
      sections={[
        {
          title: "What triggered the deviation",
          body: "The log should record the date and time, which CCP or monitoring point was out of limits, the actual value recorded, and who identified the issue. Vague entries like 'temperature problem' are not useful. The record should be specific enough that someone unfamiliar with the incident can understand what happened from the log alone.",
        },
        {
          title: "Root cause and immediate action",
          body: "The most useful corrective action logs separate immediate action (what was done with the affected product) from root cause investigation (why the limit was breached). Disposing of or recooking product addresses the immediate risk. Identifying that a fridge door seal was faulty or that a monitoring task was missed addresses the underlying cause.",
        },
        {
          title: "Verification and sign-off",
          body: "A corrective action is not complete until someone verifies that the action taken was effective and that normal process control has been restored. The log should record who carried out the verification, what they checked, and the result. Without this column, the log shows problems were found but not that they were resolved.",
        },
      ]}
      ctaTitle="Generate a corrective action log for your site"
      ctaBody="PinkPepper can help you produce a corrective action log that matches your HACCP plan, with fields appropriate to your process steps and monitoring frequencies."
      templateSlug="corrective-action-log-template"
      relatedLinks={[
        { href: "/resources/haccp-plan-template", label: "HACCP plan template" },
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
        { href: "/resources/temperature-monitoring-log-template", label: "Temperature monitoring log" },
      ]}
    />
  );
}
