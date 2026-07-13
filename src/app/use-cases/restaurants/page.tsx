import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "AI Food Safety Consultant for Restaurants | PinkPepper",
  description:
    "PinkPepper uses AI to draft HACCP plans, monitoring logs, allergen records, and SOPs that work inside the rhythm of a restaurant kitchen.",
  alternates: {
    canonical: "https://pinkpepper.io/use-cases/restaurants",
  },
};

export default function RestaurantUseCasePage() {
  return (
    <FeatureTemplate
      eyebrow="For restaurant kitchens and FOH teams"
      title="Food safety documentation that keeps up with service"
      description="PinkPepper uses AI to draft HACCP plans, monitoring logs, allergen records, and SOPs that work inside the rhythm of a restaurant kitchen. Prep schedules, line checks, hot-hold temperatures, cooling logs, reheating records, and the allergen handoff to front of house all live in one place. Built for EU and UK operators who need documentation that still works when the pass is full and the printer will not stop."
      primaryCta="Start a restaurant plan"
      painPoints={[
        "Paper logs get filled in after the fact because nobody has time to find the right clipboard during a busy service.",
        "Menu changes, specials, and supplier swaps break the HACCP plan that was written six months ago and never updated.",
        "Allergen communication between kitchen and front of house relies on verbal handoffs and a ring binder nobody checks.",
      ]}
      outcomes={[
        "Monitoring logs are quick enough to complete in real time, so your records reflect what actually happened during service.",
        "HACCP plans update when your menu changes, with CCPs recalculated for new dishes and modified prep steps.",
        "Front-of-house staff access live allergen matrices for every dish, so they answer customer questions without running to the pass.",
      ]}
      sections={[
        {
          title: "HACCP plans built around prep and service, not just theory",
          body:
            "A restaurant HACCP plan has to cover prep, cooking, hot-hold, cooling, and reheating, often across a split shift. PinkPepper structures your plan so each stage matches a real workflow: morning prep for the lunch service, afternoon prep for dinner, and the cooling and storage that happens between them. When your menu shifts seasonally or a supplier changes, you adjust the plan without rebuilding it from scratch. The document stays live and useful, not something that gathers dust on a shelf above the office door.",
        },
        {
          title: "Allergen records that connect kitchen and front of house",
          body:
            "The most common point of failure in restaurant allergen management is the gap between what the kitchen puts on a plate and what the server tells the customer. PinkPepper ties your allergen matrix to your dish specs and makes it accessible to FOH staff on the device they already carry. When a prep cook substitutes an ingredient or the pastry section changes a garnish, the matrix updates and the front-of-house team sees it immediately. No more shouting across the pass about whether the sauce contains dairy.",
        },
        {
          title: "Logs and records that survive a busy shift",
          body:
            "Temperature checks, line checks, fridge monitoring, and hot-hold logs need to be fast enough that they actually get done when the kitchen is under pressure. PinkPepper strips the process down to the essentials, with pre-set checklists, smart defaults, and a structure that works on a phone or tablet without zooming and scrolling. When an EHO walks in on a Saturday lunch service, you can pull up a week of completed logs instead of rifling through a folder with half the pages blank and the others unreadable.",
        },
      ]}
      heroImage={{
        src: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80",
        alt: "Professional chef plating food in a restaurant kitchen",
      }}
      relatedLinks={[
        {
          href: "/features/allergen-documentation",
          label: "Allergen documentation",
          description: "Keep kitchen and front-of-house allergen information aligned as dishes, garnishes, and ingredients change.",
        },
        {
          href: "/features/haccp-plan-generator",
          label: "HACCP plan generator",
          description: "Build HACCP plans that reflect prep, service, hot hold, cooling, and reheating in real restaurant workflows.",
        },
        {
          href: "/resources/temperature-monitoring-log-template",
          label: "Temperature monitoring log template",
          description: "Use a practical structure for line checks, hot-hold logs, cooling records, and fridge monitoring.",
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
