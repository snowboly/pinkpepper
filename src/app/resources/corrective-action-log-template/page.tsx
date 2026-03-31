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
      intro="A corrective action log documents what went wrong, why it happened, and what was done to bring the process back under control. It's a legal requirement under HACCP and one of the first records an inspector will ask to see."
      summaryPoints={[
        "Specific enough that someone unfamiliar with the incident can read the entry and understand what happened.",
        "Root cause and immediate action are different things — the log records both separately.",
        "Verification sign-off turns an entry into closed audit evidence, not just an open note.",
      ]}
      documentHighlights={[
        {
          label: "Deviation description",
          description:
            "Date, time, which CCP or monitoring point was out of limits, the actual reading, and who found it. 'Temperature problem' isn't a useful entry. It needs to be specific.",
        },
        {
          label: "Immediate action field",
          description:
            "What was done with the affected product right away — held, destroyed, reworked, returned. Separate from the root cause column because they're two different decisions.",
        },
        {
          label: "Root cause entry",
          description:
            "Why did the limit get breached? A faulty door seal, a missed monitoring task, a process change nobody communicated. The answer here is what prevents it happening again.",
        },
        {
          label: "Verification sign-off",
          description:
            "Who confirmed the action was effective and that the process is back under control. Without this column, the log shows problems were found but not that they were actually resolved.",
        },
      ]}
      sections={[
        {
          title: "The record needs to stand on its own",
          body:
            "When an inspector picks up this log, they shouldn't need to ask anyone what happened. The date, the CCP, the actual reading, who found it — all of that needs to be in the entry. Vague notes like 'fridge warm, sorted' don't hold up.",
        },
        {
          title: "Immediate action and root cause are not the same thing",
          body:
            "Disposing of or recooking product deals with the immediate risk. Identifying that a fridge door seal was worn, or that Monday mornings have a pattern of missed checks, deals with the cause. A good log has space for both, and teams fill in both.",
        },
        {
          title: "The verification column is the one most often skipped",
          body:
            "A corrective action isn't complete until someone confirms it worked — that normal process control is restored and the issue won't recur. That sign-off is what closes the entry. Logs without it tend to accumulate open-ended entries that look unresolved in audit.",
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
