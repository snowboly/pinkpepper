import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Corrective Action Log Template | PinkPepper",
  description:
    "Learn what a corrective action log should capture for HACCP deviations, root cause analysis, and audit evidence in EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/corrective-action-log-template",
    languages: {
      "x-default": "https://pinkpepper.io/resources/corrective-action-log-template",
      en: "https://pinkpepper.io/resources/corrective-action-log-template",
    },
  },
};

export default function CorrectiveActionLogTemplatePage() {
  return (
    <ResourceTemplate
      category="HACCP resource"
      title="What a corrective action log template should capture"
      intro="A corrective action log documents what went wrong, why it happened, and what was done to bring the process back under control. It is a core HACCP record and one of the first documents an inspector or auditor will ask to see when a deviation appears in monitoring."
      summaryPoints={[
        "Specific enough that someone unfamiliar with the incident can read the entry and understand what happened.",
        "Root cause and immediate action are different things. The log needs both.",
        "The strongest corrective action logs tie the deviation back to the original hazard and control logic.",
      ]}
      documentHighlights={[
        {
          label: "Deviation description",
          description:
            "Date, time, which CCP or monitoring point was out of limits, the actual reading, and who found it. 'Temperature problem' is not a useful entry. It needs to be specific.",
        },
        {
          label: "Immediate action field",
          description:
            "What was done with the affected product right away: held, destroyed, reworked, or returned. Keep this separate from the root cause because they are two different decisions.",
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
            "When an inspector picks up this log, they should not need to ask anyone what happened. The date, the CCP, the actual reading, who found it, and what happened to the food all need to be in the entry. Vague notes like 'fridge warm, sorted' do not hold up.",
        },
        {
          title: "Immediate action and root cause are not the same thing",
          body:
            "Disposing of or recooking product deals with the immediate risk. Identifying that a fridge door seal was worn, or that Monday mornings have a pattern of missed checks, deals with the cause. A good log has space for both, and teams fill in both.",
        },
        {
          title: "Corrective action only makes sense when the hazard logic is clear",
          body:
            "A deviation is easier to close properly when the underlying hazard analysis and control structure are already clear. That is why corrective action records should sit close to the HACCP plan, not in a separate forgotten folder. If the team cannot explain why the limit exists, they usually struggle to document the right correction when it fails.",
        },
      ]}
      ctaTitle="Generate a corrective action log that fits your HACCP plan"
      ctaBody="PinkPepper can help you produce a corrective action log that matches your HACCP structure, with fields appropriate to your process steps, limits, and monitoring frequencies."
      templateSlug="corrective-action-log-template"
      relatedLinks={[
        { href: "/features/haccp-plan-generator", label: "HACCP plan generator" },
        { href: "/resources/hazard-analysis-template", label: "Hazard analysis template" },
        { href: "/articles/correcting-non-conformities-in-haccp", label: "Correcting non-conformities in HACCP" },
      ]}
    />
  );
}
