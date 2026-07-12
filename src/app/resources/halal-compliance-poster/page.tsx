import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Halal Compliance Poster | PinkPepper",
  description:
    "Use a halal compliance poster to reinforce segregation, ingredient checks, supplier assurance, and staff handling discipline for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/halal-compliance-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/halal-compliance-poster",
      en: "https://pinkpepper.io/resources/halal-compliance-poster",
    },
  },
  robots: { index: false, follow: true },
};

export default function HalalCompliancePosterPage() {
  return (
    <ResourceTemplate
      category="Training resource"
      title="What a halal compliance poster should help staff remember"
      intro="A halal compliance poster should reinforce the practical controls that protect halal status in day-to-day operations: approved sourcing, ingredient awareness, segregation, careful handling, and staff discipline. For EU and UK food businesses, its role is operational clarity, not a substitute for certification or supplier verification."
      summaryPoints={[
        "A strong halal poster keeps sourcing, segregation, and handling reminders visible where work happens.",
        "The poster should support your documented process, not make certification claims on its own.",
        "Staff need practical cues about ingredients, utensils, storage, and service handover, not vague promises of compliance.",
      ]}
      documentHighlights={[
        {
          label: "Approved source reminders",
          description:
            "The poster should reinforce that halal claims rely on approved suppliers, verified product scope, and current supporting evidence rather than assumption.",
        },
        {
          label: "Segregation and handling",
          description:
            "Separation from non-halal ingredients, utensils, storage areas, and service mix-ups should be obvious in the poster content because those are the points where operational errors usually occur.",
        },
        {
          label: "Ingredient awareness",
          description:
            "Composite ingredients, sauces, seasonings, and substitutions are common weak points. A good poster reminds staff to check the full ingredient picture, not just the headline product.",
        },
        {
          label: "Service and labelling discipline",
          description:
            "If products are described or sold as halal, the poster should reinforce careful communication and escalation when staff are unsure.",
        },
      ]}
      sections={[
        {
          title: "Operational discipline matters more than broad claims",
          body:
            "Many businesses focus on the label or the menu wording and not enough on the daily handling steps that protect the claim. The poster is useful when it points staff back to those repeated control points: source, segregation, utensils, storage, and communication.",
        },
        {
          title: "Use posters carefully where product claims are customer-facing",
          body:
            "If you market products as halal, the visible poster should align with the exact process and assurance you actually operate. It should support discipline on site, not overstate what has or has not been independently certified.",
        },
        {
          title: "The poster should reduce avoidable staff uncertainty",
          body:
            "When staff face ingredient changes, mixed storage, or service questions, the poster should make the safe next step clear: stop, verify the current product and source, keep segregation intact, and escalate if there is doubt.",
        },
      ]}
      ctaTitle="Support halal handling with clearer working controls"
      ctaBody="PinkPepper helps food businesses build the supporting records, supplier controls, and staff procedures that sit behind sensitive product-handling claims in EU and UK operations."
      templateSlug="halal-compliance-poster"
      relatedLinks={[
        { href: "/resources/supplier-approval-questionnaire", label: "Supplier approval questionnaire" },
        { href: "/resources/incoming-goods-template", label: "Incoming goods inspection template" },
        { href: "/resources/gmp-poster", label: "GMP poster" },
      ]}
    />
  );
}
