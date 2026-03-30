import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "HACCP Plan Template | PinkPepper",
  description:
    "Learn what to include in a HACCP plan template for restaurants, cafes, caterers, and food manufacturers.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/haccp-plan-template",
  },
};

export default function HaccpPlanTemplatePage() {
  return (
    <ResourceTemplate
      category="HACCP resource"
      title="What a useful HACCP plan template should actually contain"
      intro="A HACCP plan template is only useful if it helps your team move from process flow to hazards, controls, monitoring, corrective actions, and records. Good templates create structure. Bad templates create busywork."
      summaryPoints={[
        "A useful HACCP template should reflect process flow, not generic sections alone.",
        "Control measures and monitoring logic need to be practical enough for site teams to follow.",
        "The value is in producing a reviewable draft faster, not in pretending the template is final by itself.",
      ]}
      sections={[
        {
          title: "Start with the process, not the form",
          body:
            "Most weak HACCP templates begin with a pre-filled table and ask the operator to force the business into it. A better approach starts with your actual operation: receiving, storage, prep, cooking, cooling, hot hold, service, packaging, or dispatch. The template should reflect those stages clearly.",
        },
        {
          title: "Control logic has to be usable",
          body:
            "Hazards, controls, monitoring frequencies, corrective actions, and verification steps should be written in a way that managers and site teams can actually follow. If the wording sounds impressive but no one can use it on shift, the template has failed.",
        },
        {
          title: "Templates are for acceleration, not sign-off",
          body:
            "A strong template helps you draft a better first version. It does not remove the need for review, adaptation, and accountability. That is why PinkPepper positions AI output as a faster path to a stronger draft rather than a substitute for judgment.",
        },
      ]}
      ctaTitle="Turn a HACCP template into a real first draft"
      ctaBody="PinkPepper can help you move from abstract template sections to a site-specific HACCP draft with hazards, CCPs, monitoring logic, and corrective actions."
      templateSlugs={["haccp-plan-template_hazzards", "haccp-plan-template_steps"]}
      relatedLinks={[
        { href: "/features/haccp-plan-generator", label: "HACCP plan generator" },
        { href: "/use-cases/restaurants", label: "Restaurant use case" },
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
      ]}
    />
  );
}
