import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "Food Safety Software for Catering Businesses | PinkPepper",
  description:
    "PinkPepper helps caterers document HACCP plans, transport controls, event prep SOPs, allergen workflows, and food safety records.",
  alternates: {
    canonical: "https://pinkpepper.io/use-cases/catering",
  },
};

export default function CateringUseCasePage() {
  return (
    <FeatureTemplate
      eyebrow="Catering use case"
      title="Food safety software for catering businesses with moving operational risk"
      description="Caterers need compliance documentation that covers prep, transport, holding, service, and changeable event environments. PinkPepper helps structure those workflows into usable HACCP, SOP, allergen, and audit-prep documents."
      primaryCta="Start catering workflows"
      painPoints={[
        "Catering introduces transport, event setup, and temporary holding risks that static templates often miss.",
        "Menu variation and event-specific changes make allergen and traceability records harder to maintain.",
        "Documentation often needs to work across both production kitchens and event teams.",
      ]}
      outcomes={[
        "Document transport and event controls more clearly.",
        "Create SOPs that work across prep and service contexts.",
        "Support better pre-event and post-event review workflows.",
      ]}
      sections={[
        {
          title: "Captures movement and handoff risk",
          body:
            "Unlike a static restaurant workflow, catering requires clearer documentation around transport temperatures, off-site setup, hot-hold verification, chilled handling, and event-specific corrective actions.",
        },
        {
          title: "Supports event variation",
          body:
            "The product helps teams produce a faster first draft when menus, venues, and staffing patterns change from event to event.",
        },
        {
          title: "Better evidence before customer review",
          body:
            "For caterers handling business clients or venues, stronger documentation also supports customer due diligence and internal audit readiness.",
        },
      ]}
      relatedLinks={[
        {
          href: "/features/haccp-plan-generator",
          label: "HACCP plan generator",
          description: "Build hazard analysis for prep, transport, service, and event-specific controls.",
        },
        {
          href: "/features/food-safety-audit-prep",
          label: "Food safety audit prep",
          description: "Prepare evidence packs and corrective action reviews before customer or regulatory checks.",
        },
        {
          href: "/pricing",
          label: "Pricing",
          description: "See which plan supports document generation, exports, and review workflows.",
        },
      ]}
    />
  );
}
