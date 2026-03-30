import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "HACCP Plan Generator | PinkPepper",
  description:
    "Generate HACCP plans for restaurants, cafes, caterers, and food manufacturers with AI structured for EU and UK food safety compliance.",
  alternates: {
    canonical: "https://pinkpepper.io/features/haccp-plan-generator",
  },
};

export default function HaccpPlanGeneratorPage() {
  return (
    <FeatureTemplate
      eyebrow="HACCP software"
      title="Generate HACCP plans without starting from a blank document"
      description="PinkPepper helps food businesses turn operating details into structured HACCP plans with hazards, CCPs, monitoring steps, corrective actions, and recordkeeping logic that teams can review and export."
      primaryCta="Start a HACCP draft"
      painPoints={[
        "Most teams know their process but lose time formalising hazards, CCPs, and monitoring logic.",
        "Consultancy support is expensive when you only need a strong first draft and a review workflow.",
        "Generic AI tools do not understand food safety structure or the evidence inspectors expect to see.",
      ]}
      outcomes={[
        "Build hazard analysis and control logic faster.",
        "Produce cleaner drafts for consultant or internal review.",
        "Keep HACCP documentation aligned with day-to-day operations.",
      ]}
      sections={[
        {
          title: "Built for operating reality",
          body:
            "PinkPepper starts with the way your site actually works: menu items, workflow steps, cold chain, cooking, cooling, reheating, and service. That produces a more useful HACCP draft than a generic template.",
        },
        {
          title: "Structured around review and export",
          body:
            "Once the draft exists, teams can refine the wording, export the result, and route higher-stakes documents for food safety consultancy instead of rebuilding everything manually.",
        },
        {
          title: "Useful for multiple business types",
          body:
            "The workflow is relevant to restaurants, cafes, bakeries, caterers, and small manufacturers that need practical HACCP structure under EU and UK compliance expectations.",
        },
      ]}
      heroImage={{
        src: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=1200&q=80",
        alt: "Clean commercial kitchen ready for food preparation",
      }}
      relatedLinks={[
        {
          href: "/features/allergen-documentation",
          label: "Allergen documentation",
          description: "Pair your HACCP plan with allergen controls and menu-change documentation.",
        },
        {
          href: "/features/food-safety-sop-generator",
          label: "Food safety SOP generator",
          description: "Turn HACCP controls into day-to-day SOPs, logs, and hygiene records.",
        },
        {
          href: "/pricing",
          label: "Pricing",
          description: "See which plan fits document generation, exports, and audit workflows.",
        },
      ]}
    />
  );
}
