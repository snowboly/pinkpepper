import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Restaurant Opening Checklist | PinkPepper",
  description:
    "Use a restaurant opening checklist to structure pre-service hygiene, temperature, allergen, and equipment checks for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/restaurant-opening-checklist",
    languages: {
      "x-default": "https://pinkpepper.io/resources/restaurant-opening-checklist",
      en: "https://pinkpepper.io/resources/restaurant-opening-checklist",
    },
  },
};

export default function RestaurantOpeningChecklistPage() {
  return (
    <ResourceTemplate
      category="Monitoring resource"
      title="What a restaurant opening checklist should verify before service starts"
      intro="A restaurant opening checklist should help the team confirm that the site is ready for safe service: chilled storage is in range, handwash points are stocked, allergens and menu information are current, cleaning standards are acceptable, and equipment is ready for use. For EU and UK restaurants, the opening check is one of the clearest daily control points in the operation."
      summaryPoints={[
        "Opening checks should be completed before service pressure takes over, not halfway through prep.",
        "The strongest checklist balances hygiene, temperature, allergen, and equipment readiness in one usable flow.",
        "A short checklist used every day is stronger than a longer one staff stop trusting.",
      ]}
      documentHighlights={[
        {
          label: "Temperature and storage readiness",
          description:
            "The checklist should prompt checks on chilled and frozen storage, any hot-hold equipment brought online early, and the condition of food left from the previous shift where relevant.",
        },
        {
          label: "Hygiene and handwash readiness",
          description:
            "Stocked soap and paper towel points, clean prep surfaces, sanitiser availability, and obvious hygiene or pest concerns should be covered before prep accelerates.",
        },
        {
          label: "Allergen and service information",
          description:
            "Where menus, specials, or ingredients have changed, the checklist should confirm that allergen information and team briefings reflect the current offer.",
        },
        {
          label: "Equipment and corrective action prompts",
          description:
            "Probe availability, damaged equipment, and overnight issues should be recorded clearly enough for the team to act before service opens fully.",
        },
      ]}
      sections={[
        {
          title: "Opening checks create the day's first control point",
          body:
            "If the first serious checks happen after prep is already underway, problems have a habit of being worked around instead of fixed. A stronger opening checklist pulls the key controls forward so teams start from a known baseline.",
        },
        {
          title: "Restaurants need opening checks that reflect live service reality",
          body:
            "The strongest opening checklist is not a generic hygiene poster turned into a spreadsheet. It follows the real order of the shift: unlock, inspect, stock, verify temperatures, brief staff, confirm allergen information, and prepare for service.",
        },
        {
          title: "Make failed checks visible before the shift gets busy",
          body:
            "If a fridge is warm, sanitiser is missing, or allergen information is out of date, the document should force a clear note and action before service starts. That is what turns an opening checklist into a practical control record rather than a routine signature page.",
        },
      ]}
      ctaTitle="Build opening checks that fit your restaurant workflow"
      ctaBody="PinkPepper helps restaurants, cafes, and catering teams turn generic pre-service checklists into site-specific records that connect with SOPs, temperature logs, and allergen controls."
      templateSlug="restaurant-opening-checklist"
      relatedLinks={[
        { href: "/resources/restaurant-opening-poster", label: "Restaurant opening poster" },
        { href: "/resources/restaurant-closing-checklist", label: "Restaurant closing checklist" },
        { href: "/resources/allergen-matrix-template", label: "Allergen matrix template" },
      ]}
    />
  );
}
