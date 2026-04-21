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
      eyebrow="Restaurants"
      title="HACCP plans, SOPs, and allergen records that match how your kitchen actually runs"
      description="Your HACCP plan should reflect your menu, your prep flow, and your service model — not a generic template written for a different type of operation. PinkPepper drafts compliance documents around the way restaurants actually work: receiving, prep, cook, hot hold, cooling, plating, and service."
      primaryCta="Start your restaurant HACCP"
      painPoints={[
        "Menus change weekly but allergen records and HACCP plans are still based on last year's version.",
        "Compliance records live across paper forms, shared drives, and someone's WhatsApp photos.",
        "Documentation needs to survive a busy Friday night — if staff can't follow it during service, it's useless.",
      ]}
      outcomes={[
        "HACCP plans built around your actual menu and prep flow, not a generic food business template.",
        "Allergen matrices that update when your menu does — with cross-contact controls for each station.",
        "Audit evidence you can export and hand to an inspector without scrambling.",
      ]}
      sections={[
        {
          title: "Multi-station kitchens, one compliance system",
          body:
            "Restaurants juggle cold prep, hot cooking, holding, reheating, and plating across multiple stations. PinkPepper structures your HACCP around those stages so monitoring points and corrective actions map to what actually happens on shift — not a theoretical process flow.",
        },
        {
          title: "Allergen handoff between BOH and FOH",
          body:
            "The riskiest moment in restaurant allergen control is the handoff between kitchen and service. PinkPepper generates allergen matrices, menu-change records, and front-of-house communication SOPs so both sides of the pass have the same information.",
        },
        {
          title: "Menu changes without compliance lag",
          body:
            "New dish? Seasonal rotation? Supplier swap? Each change should trigger an allergen review and potentially a HACCP update. PinkPepper lets you regenerate the affected documentation in minutes instead of weeks.",
        },
      ]}
      heroImage={{
        src: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80",
        alt: "Professional chef plating food in a restaurant kitchen",
      }}
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
