import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "Food Safety SOPs, Checklists and Daily Records | PinkPepper",
  description:
    "Create food safety SOPs, opening checks, closing checks, cleaning procedures, temperature logs, and hygiene records that match how your site actually operates.",
  alternates: {
    canonical: "https://pinkpepper.io/features/food-safety-sop-generator",
  },
};

export default function FoodSafetySopGeneratorPage() {
  return (
    <FeatureTemplate
      breadcrumbName="Food Safety SOP Generator"
      breadcrumbUrl="https://pinkpepper.io/features/food-safety-sop-generator"
      eyebrow="SOP generation"
      title="Food safety SOPs, checklists and daily records that match the way your site works"
      description="PinkPepper helps teams build opening checks, closing checks, cleaning procedures, temperature logs, and hygiene records that reflect the actual shift pattern, layout, and responsibilities on site."
      primaryCta="Build SOPs and checks"
      painPoints={[
        "Teams keep rewriting the same SOPs for cleaning, opening checks, closing checks, deliveries, and hygiene controls across different sites.",
        "Static templates drift away from the real process when equipment, responsibilities, or shift routines change.",
        "Managers still need records people can actually use during the day, not policy text that sits in a folder.",
      ]}
      outcomes={[
        "Standardise daily documentation without forcing every site into the same generic template.",
        "Give teams clearer SOPs, checklists, and logs they can follow during service and close-down.",
        "Roll out new controls faster after audits, HACCP reviews, menu changes, or process updates.",
      ]}
      sections={[
        {
          title: "Built for the documents teams actually use every day",
          body:
            "This is for the paperwork operators reach for every shift: opening checks, closing checks, cleaning procedures, handover sheets, temperature logs, hygiene records, and corrective action forms. PinkPepper helps you generate the draft, but the value is that the structure stays usable on the floor. People can follow it, sign it off, and review it without translating a generic consultant template into the reality of the site.",
        },
        {
          title: "Site-specific SOPs instead of copied templates",
          body:
            "A small cafe, a restaurant prep kitchen, and a production unit should not all be running the same opening routine or cleaning record. PinkPepper gives you a faster starting point, then lets you adapt wording, frequency, responsibilities, and verification checks to the site you are documenting. That keeps the SOP aligned with the real workflow instead of a version someone copied from another branch six months ago.",
        },
        {
          title: "Connect SOPs to the rest of the compliance workflow",
          body:
            "SOPs are stronger when they sit next to HACCP plans, allergen controls, monitoring logs, and audit follow-up instead of living as isolated documents. PinkPepper is designed around that wider workflow, so a new cleaning control, opening check, or corrective action record can be tied back to the reason it exists. That makes review easier for managers and more defensible when an inspector asks why a procedure changed.",
        },
      ]}
      heroImage={{
        src: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200&q=60",
        alt: "Kitchen staff following hygiene procedures during food preparation",
      }}
      relatedLinks={[
        {
          href: "/features/haccp-plan-generator",
          label: "HACCP plan generator",
          description: "Use HACCP outputs to define the controls, checks, and corrective actions your SOPs need to support.",
        },
        {
          href: "/resources/food-safety-opening-and-closing-checklist",
          label: "Food safety opening and closing checklist",
          description: "Start with a practical daily checklist structure for opening routines, close-down checks, and handover notes.",
        },
        {
          href: "/use-cases/cafes",
          label: "Food safety for cafes",
          description: "See how SOPs, daily records, and small-team routines fit into a cafe workflow.",
        },
      ]}
    />
  );
}
