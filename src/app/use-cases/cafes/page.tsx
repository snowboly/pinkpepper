import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "Food Safety Software for Cafes | PinkPepper",
  description:
    "PinkPepper helps cafes create HACCP plans, hygiene SOPs, allergen records, and audit documentation for smaller food operations.",
  alternates: {
    canonical: "https://www.pinkpepper.io/use-cases/cafes",
  },
};

export default function CafeUseCasePage() {
  return (
    <FeatureTemplate
      eyebrow="Cafes & bakeries"
      title="Food safety docs for cafes and bakeries where one person does everything"
      description="You don't have a compliance manager. You have an owner-operator who also makes coffee, bakes scones, and restocks the display fridge. PinkPepper gives small teams the same documentation quality as bigger operations — opening checks, allergen records, cleaning SOPs, HACCP — without needing a consultant for every document."
      primaryCta="Start your cafe HACCP"
      painPoints={[
        "You need HACCP, allergen records, and cleaning schedules — but nobody's job title is 'compliance officer.'",
        "Cafes mix beverage prep, ambient pastry, chilled sandwiches, reheated soups, and front-counter service all in one small space.",
        "EHO inspectors expect the same documentation rigour from a 12-seat cafe as a 200-cover restaurant.",
      ]}
      outcomes={[
        "A HACCP plan sized for your operation — not a 40-page document designed for a factory.",
        "Opening and closing checklists your team will actually complete every shift.",
        "Allergen records that cover baked goods, display items, and counter service in one place.",
      ]}
      sections={[
        {
          title: "Small space, mixed risks",
          body:
            "A cafe handles ambient pastries, chilled grab-and-go, reheated soups, milk-based drinks, and display-fridge storage — often with shared equipment and one prep area. PinkPepper structures HACCP controls around that reality instead of treating it like a simplified restaurant.",
        },
        {
          title: "Daily routines that actually get done",
          body:
            "The biggest compliance gap in cafes isn't missing a HACCP plan — it's that the opening checks, fridge logs, and cleaning records aren't getting filled in. PinkPepper generates short, clear checklists designed to survive a morning rush.",
        },
        {
          title: "Bakery-specific allergen complexity",
          body:
            "Flour dust, nut toppings, shared ovens, egg wash cross-contact — bakery allergen risks are different from restaurant risks. PinkPepper generates allergen matrices and cross-contact SOPs that account for baking-specific hazards, not just menu-level declarations.",
        },
      ]}
      heroImage={{
        src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80",
        alt: "Cafe interior with pastry display and coffee counter",
      }}
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
