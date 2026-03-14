import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "Food Safety Software for Restaurants | PinkPepper",
  description:
    "PinkPepper helps restaurants create HACCP plans, SOPs, allergen records, and audit-ready food safety documentation.",
  alternates: {
    canonical: "https://pinkpepper.io/use-cases/restaurants",
  },
};

export default function RestaurantUseCasePage() {
  return (
    <FeatureTemplate
      eyebrow="Restaurant use case"
      title="Food safety software for restaurants that need practical documentation fast"
      description="Restaurants need documentation that maps to prep, service, hot holding, cooling, allergen communication, and corrective action handling. PinkPepper helps operators draft and maintain those records without starting from zero each time."
      primaryCta="Start restaurant workflows"
      painPoints={[
        "Restaurant teams have frequent menu changes and varied service risk points.",
        "Food safety records are often scattered across paper forms, old Word docs, and informal checklists.",
        "Managers need documentation that staff can follow during busy service, not consultant language only.",
      ]}
      outcomes={[
        "Draft HACCP plans and SOPs around service reality.",
        "Improve allergen and temperature-control documentation.",
        "Prepare cleaner audit packs before inspection or review.",
      ]}
      sections={[
        {
          title: "Designed around kitchen flow",
          body:
            "PinkPepper is useful for restaurants because it can turn practical workflow details like chilled storage, prep, cook, hot hold, cooling, and service into clearer compliance documents.",
        },
        {
          title: "Supports FOH and BOH handoff",
          body:
            "Restaurant compliance breaks when allergen, menu, and corrective action communication does not move cleanly between back-of-house and front-of-house. These pages help frame that operational need clearly.",
        },
        {
          title: "Faster review cycles",
          body:
            "Operators can generate a strong draft, export the result, and review it internally or externally rather than waiting weeks to start from a blank document.",
        },
      ]}
      relatedLinks={[
        {
          href: "/features/haccp-plan-generator",
          label: "HACCP plan generator",
          description: "Build restaurant-specific hazard analysis and monitoring logic.",
        },
        {
          href: "/features/allergen-documentation",
          label: "Allergen documentation",
          description: "Keep allergen matrices and menu controls aligned with service changes.",
        },
        {
          href: "/pricing",
          label: "Pricing",
          description: "Review plans for document generation, exports, and review support.",
        },
      ]}
    />
  );
}
