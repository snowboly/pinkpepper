import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "HACCP Plan Template | PinkPepper",
  description:
    "Learn what to include in a HACCP plan template for restaurants, cafes, caterers, and food manufacturers.",
  alternates: {
    canonical: "https://www.pinkpepper.io/resources/haccp-plan-template",
  },
};

export default function HaccpPlanTemplatePage() {
  return (
    <ResourceTemplate
      category="HACCP resource"
      title="What a useful HACCP plan template should actually contain"
      intro="A HACCP plan template is only useful if it helps your team move from process flow to hazards, controls, monitoring, corrective actions, and records. Good templates create structure. Bad templates create busywork."
      summaryPoints={[
        "Built around process flow, not a blank form to fill in.",
        "Monitoring steps your team can actually use on shift.",
        "A faster route to a solid first draft — not a shortcut past the review.",
      ]}
      documentHighlights={[
        {
          label: "Process steps follow your operation",
          description:
            "The rows go through receiving, storage, prep, cooking, cooling, dispatch — in order. Not a generic list. You fill in what actually happens at your site.",
        },
        {
          label: "B / P / C split per step",
          description:
            "Each hazard type gets its own row. Lumping them together is how things get missed, and auditors notice.",
        },
        {
          label: "Risk score columns",
          description:
            "Probability, severity, residual risk — three columns so you can show the reasoning, not just the outcome. That's what makes the CCP decisions defensible.",
        },
        {
          label: "Control measures kept separate from the CCP column",
          description:
            "A lot of templates muddle these two things together. This one doesn't. The designation — CCP, PPR, OPRP — sits in its own column so the logic is clear when someone reviews it later.",
        },
      ]}
      sections={[
        {
          title: "Start with the process, not the form",
          body:
            "Most templates hand you a blank table and expect you to figure out the rest. The good ones are built around how food actually moves through a site — from goods in, through every prep and cook step, to the point it leaves. If your template isn't structured around that flow, you're fighting it from day one.",
        },
        {
          title: "If the control logic doesn't work on shift, it doesn't work",
          body:
            "A monitoring step that says 'check temperatures regularly' is not a monitoring step. Your team needs to know what to check, when, how often, and what to do when something's wrong. That clarity is the difference between a HACCP plan that gets used and one that sits in a folder until the next audit.",
        },
        {
          title: "A template is a starting point, not a finished document",
          body:
            "No generic template reflects your operation. It gets you to a better first draft faster — but someone with knowledge of the site still needs to review it, challenge the assumptions, and sign off. That part doesn't get skipped.",
        },
      ]}
      ctaTitle="Turn a HACCP template into a real first draft"
      ctaBody="PinkPepper can help you move from abstract template sections to a site-specific HACCP draft with hazards, CCPs, monitoring logic, and corrective actions."
      templateSlugs={["haccp-plan-template_hazzards", "haccp-plan-template_steps"]}
      relatedLinks={[
        { href: "/features/haccp-plan-generator", label: "HACCP plan generator" },
        { href: "/articles", label: "Food safety articles" },
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
      ]}
    />
  );
}
