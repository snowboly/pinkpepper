import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "HACCP Plan Template | PinkPepper",
  description:
    "Learn what to include in a HACCP plan template for restaurants, cafes, caterers, and food manufacturers.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/haccp-plan-template",
    languages: { "x-default": "https://pinkpepper.io/resources/haccp-plan-template", en: "https://pinkpepper.io/resources/haccp-plan-template" },
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
        "Hazard analysis logic stays visible instead of being collapsed into one vague worksheet.",
        "Monitoring steps your team can actually use on shift.",
        "A faster route to a solid first draft, not a shortcut past the review.",
      ]}
      documentHighlights={[
        {
          label: "Process steps follow your operation",
          description:
            "The rows go through receiving, storage, prep, cooking, cooling, and dispatch in order. Not a generic list. You fill in what actually happens at your site.",
        },
        {
          label: "B / P / C split per step",
          description:
            "Each hazard type gets its own row. Lumping them together is how things get missed, and auditors notice.",
        },
        {
          label: "Risk score columns",
          description:
            "Probability, severity, and residual risk stay visible so you can show the reasoning, not just the outcome. That is what makes the CCP decisions defensible.",
        },
        {
          label: "Control measures kept separate from the CCP column",
          description:
            "A lot of templates muddle these two things together. This one does not. The designation, CCP, PPR, or OPRP, sits in its own column so the logic is clear when someone reviews it later.",
        },
      ]}
      sections={[
        {
          title: "Start with the process, not the form",
          body:
            "Most templates hand you a blank table and expect you to figure out the rest. The good ones are built around how food actually moves through a site, from goods in, through every prep and cook step, to the point it leaves. If your template is not structured around that flow, you are fighting it from day one.",
        },
        {
          title: "Hazard analysis needs its own working structure",
          body:
            "A HACCP plan gets harder to defend when the hazard analysis is buried inside one overstuffed table. Teams need a clearer way to record which biological, chemical, and physical hazards matter at each step, why they matter, and what controls already exist. That is why a separate hazard analysis worksheet is often the fastest way to strengthen the final plan.",
        },
        {
          title: "If the control logic does not work on shift, it does not work",
          body:
            "A monitoring step that says 'check temperatures regularly' is not a monitoring step. Your team needs to know what to check, when, how often, and what to do when something is wrong. That clarity is the difference between a HACCP plan that gets used and one that sits in a folder until the next audit.",
        },
        {
          title: "A template is a starting point, not a finished document",
          body:
            "No generic template reflects your operation. It gets you to a better first draft faster, but someone with knowledge of the site still needs to review it, challenge the assumptions, and sign off. That part does not get skipped.",
        },
      ]}
      ctaTitle="Turn a HACCP template into a real first draft"
      ctaBody="PinkPepper can help you move from abstract template sections to a site-specific HACCP draft with hazards, CCPs, monitoring logic, and corrective actions."
      templateSlugs={["haccp-plan-template_hazzards", "haccp-plan-template_steps"]}
      relatedLinks={[
        { href: "/resources/hazard-analysis-template", label: "Hazard analysis template" },
        { href: "/features/haccp-plan-generator", label: "HACCP plan generator" },
        { href: "/articles/how-to-perform-a-hazard-analysis-correctly", label: "How to perform a hazard analysis correctly" },
      ]}
    />
  );
}
