import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "AI Food Safety Consultant for Food Manufacturing | PinkPepper",
  description:
    "PinkPepper helps draft your HACCP plans, process flow diagrams, CCP monitoring records, corrective action logs, and traceability documentation into a single working system.",
  alternates: {
    canonical: "https://pinkpepper.io/use-cases/food-manufacturing",
  },
};

export default function FoodManufacturingUseCasePage() {
  return (
    <FeatureTemplate
      eyebrow="For technical managers and HACCP team leads"
      title="Manufacturing documentation that holds up under audit pressure"
      description="PinkPepper helps draft your HACCP plans, process flow diagrams, CCP monitoring records, corrective action logs, and traceability documentation into a single working system. It is designed for production lines, QC checkpoints, technical review cycles, and the reality of unannounced audits. Not a Q and A tool. Not just another generic AI tool. Software that supports the documentation work your technical team already runs."
      primaryCta="See manufacturing features"
      painPoints={[
        "Process flow changes during line trials or recipe adjustments leave HACCP plans out of date and CCPs unaccounted for.",
        "Audit preparation still means chasing paper log sheets, scanning records, and manually cross-referencing corrective actions against monitoring deviations.",
        "Document control across multiple production lines and shifts creates version conflicts that technical managers have to resolve before every BRC or SALSA audit.",
      ]}
      outcomes={[
        "HACCP plans and process flows update together when a CCP, ingredient, or line layout changes.",
        "Every monitoring log is digitally traceable, with corrective actions linked directly to the deviation that triggered them.",
        "Audit packs compile in hours instead of days, with full document revision history visible to auditors.",
      ]}
      sections={[
        {
          title: "Process flow drives the paperwork, not the other way round",
          body:
            "Your HACCP plan should reflect what happens on the production floor, not a diagram someone drew two years ago and forgot to update. PinkPepper connects your process flow steps to CCPs, monitoring procedures, critical limits, and corrective actions. When you adjust a step during a line trial or recipe change, the system flags which documentation needs review. Technical sign-off happens against a live plan, not a static PDF that nobody on the floor recognises.",
        },
        {
          title: "Monitoring records and corrective actions that tell a complete story",
          body:
            "An auditor will trace a CCP deviation from the monitoring log straight through to the corrective action and verification check. If those records live in three different places, you spend the audit explaining gaps instead of demonstrating control. PinkPepper ties each monitoring entry to its corresponding action, with timestamps, operator ID, and sign-off stages. Line checks, metal detector logs, temperature records, and weight checks all feed into the same traceable structure.",
        },
        {
          title: "Traceability documentation that works forward and back",
          body:
            "Most traceability exercises start with a raw material batch code and need to reach every finished product SKU that contains it, or start with a customer complaint and need to trace back to the ingredient lot. PinkPepper structures your traceability records so forward and back traces follow the actual production flow, including rework, intermediate WIP, and split batches. When a major retailer requests a mock recall within four hours, your technical team runs the trace without opening six spreadsheets.",
        },
      ]}
      heroImage={{
        src: "https://images.pexels.com/photos/2889193/pexels-photo-2889193.jpeg?auto=compress&cs=tinysrgb&w=1600&q=80",
        alt: "Sweet potatoes being processed on a conveyor in a food manufacturing facility",
      }}
      relatedLinks={[
        {
          href: "/features/haccp-plan-generator",
          label: "HACCP plan generator",
          description: "Build process-flow-based HACCP documentation with clearer CCP, monitoring, and corrective action structure.",
        },
        {
          href: "/resources/traceability-log-template",
          label: "Traceability log template",
          description: "Structure forward and back trace records more clearly across intake, production, and finished product despatch.",
        },
        {
          href: "/resources/equipment-calibration-log-template",
          label: "Equipment calibration log template",
          description: "Support monitoring and verification records for probes, scales, and other critical measuring equipment.",
        },
        {
          href: "/ai-food-safety-consultant",
          label: "AI food safety consultant",
          description: "See how AI drafting and optional human consultant review fit EU and UK food safety work.",
        },
      ]}
    />
  );
}
