import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "Allergen Documentation Software | PinkPepper",
  description:
    "Generate allergen matrices, cross-contact controls, menu-change records, and allergen documentation for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/features/allergen-documentation",
  },
};

export default function AllergenDocumentationPage() {
  return (
    <FeatureTemplate
      eyebrow="Allergen management"
      title="Create allergen documentation that operations teams can actually use"
      description="PinkPepper helps food businesses document allergen risks with matrices, recipe controls, label checks, cross-contact procedures, and menu-change workflows that are easier to maintain than spreadsheet sprawl."
      primaryCta="Create allergen documents"
      painPoints={[
        "Allergen information changes fast when recipes, suppliers, or prep stations change.",
        "Front-of-house and kitchen teams often need simpler documents than the ones buried in manuals.",
        "Allergen records break down when updates are handled across too many disconnected files.",
      ]}
      outcomes={[
        "Generate allergen matrices and control documents faster.",
        "Support recipe updates with clearer change-control records.",
        "Reduce the gap between documented controls and live service reality.",
      ]}
      sections={[
        {
          title: "From ingredients to service controls",
          body:
            "Use PinkPepper to document declared allergens, shared-equipment exposure, cross-contact controls, storage segregation, and final label or menu verification steps in one workflow.",
        },
        {
          title: "Better support for menu changes",
          body:
            "When a recipe, supplier, or product format changes, teams need a clean way to update their documentation. PinkPepper is designed to help structure that update work instead of forcing teams into ad hoc edits.",
        },
        {
          title: "Useful beyond one matrix",
          body:
            "The value is not limited to a single allergen chart. Teams can also draft SOPs, verification checklists, training notes, and supporting records that make allergen controls more operationally credible.",
        },
      ]}
      heroImage={{
        src: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=1200&q=80",
        alt: "Chef checking ingredients during food preparation",
      }}
      relatedLinks={[
        {
          href: "/features/haccp-plan-generator",
          label: "HACCP plan generator",
          description: "Connect allergen controls to broader hazard analysis and monitoring workflows.",
        },
        {
          href: "/features/food-safety-sop-generator",
          label: "Food safety SOP generator",
          description: "Document handwashing, cleaning, segregation, and label verification procedures.",
        },
        {
          href: "/pricing",
          label: "Pricing",
          description: "Compare plans for document generation, export, and food safety consultancy.",
        },
      ]}
    />
  );
}
