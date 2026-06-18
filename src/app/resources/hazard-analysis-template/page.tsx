import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Hazard Analysis Template | PinkPepper",
  description:
    "Learn what to include in a hazard analysis template for HACCP plans in restaurants, cafes, caterers, and food manufacturing sites.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/hazard-analysis-template",
    languages: {
      "x-default": "https://pinkpepper.io/resources/hazard-analysis-template",
      en: "https://pinkpepper.io/resources/hazard-analysis-template",
    },
  },
};

export default function HazardAnalysisTemplatePage() {
  return (
    <ResourceTemplate
      category="HACCP resource"
      title="What a useful hazard analysis template should capture"
      intro="A hazard analysis template should help you work step by step through your process, identify realistic biological, chemical, and physical hazards, and record why each control decision was made. The goal is not a bigger spreadsheet. The goal is a clearer HACCP decision trail."
      summaryPoints={[
        "Structured around real process steps, not a generic hazard list copied from another site.",
        "Clear enough to separate the hazard, the control measure, and the CCP decision instead of mixing them together.",
        "Useful as a working draft before you turn the analysis into a business-specific HACCP plan.",
      ]}
      documentHighlights={[
        {
          label: "Process-step column",
          description:
            "Each row starts with what is actually happening at that stage: receiving, chilled storage, prep, cooking, cooling, packing, or dispatch. Hazard analysis only makes sense when it follows the real flow.",
        },
        {
          label: "Separate B / C / P hazard entries",
          description:
            "Biological, chemical, and physical hazards should not be bundled into one vague note. Keeping them separate makes the controls and justification easier to review later.",
        },
        {
          label: "Significance and justification field",
          description:
            "A good template records why a hazard is or is not significant at that step. That reasoning is what supports later CCP decisions and helps the document hold up during review.",
        },
        {
          label: "Control and monitoring logic",
          description:
            "Control measures, critical limits, and monitoring steps should not be guessed at after the fact. The template should leave room to connect the hazard analysis to how the site will actually manage the risk.",
        },
      ]}
      sections={[
        {
          title: "The value is in the reasoning, not the list length",
          body:
            "Weak hazard analysis templates encourage teams to list every hazard they have ever heard of and move on. Strong ones force a narrower question: what can realistically go wrong at this step, how serious would it be, and what controls already exist? That is what makes the finished HACCP plan defensible.",
        },
        {
          title: "Hazards, controls, and CCP decisions need to stay separate",
          body:
            "One of the most common problems in HACCP documents is collapsing the hazard, the control measure, and the CCP call into one messy cell. A good template keeps those decisions apart so the logic can be reviewed properly. That matters when you revisit the plan after a menu, product, or process change.",
        },
        {
          title: "A template should speed up review, not replace it",
          body:
            "A hazard analysis worksheet helps teams get to a stronger first draft faster, but it does not remove the need for site knowledge and technical review. Someone still has to challenge the assumptions, confirm the controls make sense, and sign off the final logic for the operation.",
        },
      ]}
      ctaTitle="Build a hazard analysis that connects to the full HACCP plan"
      ctaBody="PinkPepper can help you move from a hazard analysis worksheet into a site-specific HACCP draft with clearer controls, CCP structure, and monitoring records."
      templateSlug="hazard-analysis-template"
      relatedLinks={[
        { href: "/features/haccp-plan-generator", label: "HACCP plan generator" },
        { href: "/resources/haccp-plan-template", label: "HACCP plan template" },
        { href: "/articles/how-to-perform-a-hazard-analysis-correctly", label: "How to perform a hazard analysis correctly" },
      ]}
    />
  );
}
