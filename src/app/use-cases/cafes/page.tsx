import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "Food Safety Software for Cafes | PinkPepper",
  description:
    "PinkPepper helps cafes create HACCP plans, hygiene SOPs, allergen records, and audit documentation for smaller food operations.",
  alternates: {
    canonical: "https://pinkpepper.io/use-cases/cafes",
  },
};

export default function CafeUseCasePage() {
  return (
    <FeatureTemplate
      eyebrow="Cafe use case"
      title="Food safety software for cafes, coffee shops, and bakery-led operations"
      description="Cafe operators often need lighter-weight systems than large manufacturers, but the compliance burden is still real. PinkPepper helps smaller teams draft HACCP plans, cleaning SOPs, allergen records, and opening or closing checks faster."
      primaryCta="Start cafe documentation"
      painPoints={[
        "Smaller teams still need strong documentation but usually do not have dedicated compliance staff.",
        "Cafes often manage mixed workflows: beverages, chilled foods, reheating, pastries, and front-counter service.",
        "Simple sites still need credible records for allergens, hygiene, cleaning, and temperature control.",
      ]}
      outcomes={[
        "Reduce time spent adapting generic templates.",
        "Document mixed cafe and bakery workflows more clearly.",
        "Maintain lighter systems without losing compliance structure.",
      ]}
      sections={[
        {
          title: "Built for smaller operational teams",
          body:
            "Cafe operators need documents that are fast to create and easy to maintain. PinkPepper is positioned for that middle ground between expensive consultancy and weak copy-paste templates.",
        },
        {
          title: "Useful for repeatable routine controls",
          body:
            "Opening checks, display-fridge temperatures, cleaning schedules, allergen matrices, and staff hygiene SOPs are exactly the kinds of documents this workflow can accelerate.",
        },
        {
          title: "A better first draft for review",
          body:
            "Where consultancy is needed, the product helps generate a stronger first version so specialist time is spent improving the document rather than inventing it.",
        },
      ]}
      relatedLinks={[
        {
          href: "/features/food-safety-sop-generator",
          label: "Food safety SOP generator",
          description: "Generate daily checklists, cleaning SOPs, and hygiene procedures for smaller teams.",
        },
        {
          href: "/features/allergen-documentation",
          label: "Allergen documentation",
          description: "Document bakery, pastry, and menu allergen controls more cleanly.",
        },
        {
          href: "/pricing",
          label: "Pricing",
          description: "See which tier fits smaller teams moving from questions to usable documents.",
        },
      ]}
    />
  );
}
