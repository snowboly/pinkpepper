import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "Food Safety Software for Cafes | PinkPepper",
  description:
    "PinkPepper handles the paperwork side of running a cafe: HACCP plans for display fridges and ambient counters, allergen records for sandwiches and baked goods, temperature logs, and SOPs for reheating and milk steaming.",
  alternates: {
    canonical: "https://pinkpepper.io/use-cases/cafes",
  },
};

export default function CafeUseCasePage() {
  return (
    <FeatureTemplate
      eyebrow="For coffee shops, bakeries, and grab-and-go food spots"
      title="Food safety documentation light enough for a small team, solid enough for audit"
      description="PinkPepper handles the paperwork side of running a cafe: HACCP plans for display fridges and ambient counters, allergen records for sandwiches and baked goods, temperature logs, and SOPs for reheating and milk steaming. Built for owner-operators and small teams who do not have a dedicated compliance person but still need records that stand up to an EHO inspection."
      primaryCta="Start a cafe plan"
      painPoints={[
        "HACCP templates designed for large kitchens expect dedicated monitoring roles that a three-person cafe team simply does not have.",
        "Display fridges, ambient bakery displays, and grab-and-go items create a mix of food safety risks that most generic checklists ignore.",
        "The owner-operator is also the head chef, barista, and food safety lead, with no time to maintain documentation that takes longer than the tasks it records.",
      ]}
      outcomes={[
        "Monitoring routines fit the cadence of a cafe shift: opening checks, mid-morning display fridge logs, and close-down records.",
        "Allergen information for sandwiches, cakes, and seasonal items stays current and accessible to counter staff during a rush.",
        "EHO-ready records compile quickly without pulling the owner away from the floor for half a day.",
      ]}
      sections={[
        {
          title: "Documentation that fits a cafe, not a hotel kitchen",
          body:
            "Most cafe teams run with two or three people on shift. One person opens, makes coffee, restocks the display, serves customers, and handles the closing checks. PinkPepper builds HACCP plans and monitoring logs around that reality. The system covers the workflows that actually matter in a cafe: display fridge temperature checks every few hours, ambient shelf-life tracking for pastries and cakes, steam wand cleaning logs, and reheat records for toasties and hot food items. No modules about sous-vide or blast chilling that you have to scroll past to find the relevant sections.",
        },
        {
          title: "Allergen management for counters and displays",
          body:
            "A cafe allergen risk is different from a restaurant. Customers pick items from a display, often without reading ingredient lists. Staff need to answer questions about milk alternatives, gluten content, nut traces, and egg in baked goods, quickly and accurately, while a queue forms at the till. PinkPepper builds an allergen matrix that covers your entire counter offer, including seasonal specials and supplier substitutions. Counter staff check it on the device they use for orders, and it updates whenever a recipe or ingredient changes. The information your team gives to a customer with a nut allergy is the same information the kitchen used when they prepped that banana bread this morning.",
        },
        {
          title: "Records that work for the owner-operator",
          body:
            "If you run a cafe, you are probably the person opening up at 6am, taking deliveries, prepping food, working the machine, and closing down at 5pm. Food safety documentation has to fit into the gaps between those tasks or it simply will not get done. PinkPepper gives you fast daily checklists, automatic prompts for the checks that matter at each point in the day, and a single place where all your records accumulate without you having to file anything. When an EHO visits, you can show them a complete set of logs and plans without apologising for gaps. That matters for your hygiene rating and it matters for the confidence you project when a customer asks about your controls.",
        },
      ]}
      heroImage={{
        src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80",
        alt: "Cafe interior with pastry display and coffee counter",
      }}
      relatedLinks={[
        {
          href: "/features/allergen-documentation",
          label: "Allergen documentation",
          description: "Keep sandwich, bakery, milk alternative, and seasonal-item allergen information accurate during busy counter service.",
        },
        {
          href: "/features/food-safety-sop-generator",
          label: "Food safety SOP generator",
          description: "Create opening checks, cleaning routines, reheating procedures, and daily records that suit small teams.",
        },
        {
          href: "/resources/food-safety-opening-and-closing-checklist",
          label: "Food safety opening and closing checklist",
          description: "Start with a practical daily checklist for opening checks, display monitoring, and close-down routines.",
        },
      ]}
    />
  );
}
