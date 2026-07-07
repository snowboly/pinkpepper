import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Handwashing Poster | PinkPepper",
  description:
    "Use a handwashing poster to keep the critical moments and sequence for hand hygiene visible at sinks, prep zones, and staff entry points.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/handwashing-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/handwashing-poster",
      en: "https://pinkpepper.io/resources/handwashing-poster",
    },
  },
};

export default function HandwashingPosterPage() {
  return (
    <ResourceTemplate
      category="Training resource"
      title="What a handwashing poster should help staff remember"
      intro="Handwashing is one of the cheapest contamination controls in the building and one of the first habits to slip when service pressure rises. A handwashing poster is there to interrupt that drift, keep the critical moments visible, and make the correct sequence harder to ignore at the sink."
      summaryPoints={[
        "The strongest handwashing posters focus on the moments that matter, not on generic hygiene slogans.",
        "Visual prompts work best at every active basin, not hidden in a staff room or office.",
        "The poster should reinforce frontline behaviour without pretending to replace supervision or training.",
      ]}
      documentHighlights={[
        {
          label: "Critical handwash moments",
          description:
            "The most useful prompt is often not how to wash, but when the handwash is non-negotiable during the shift.",
        },
        {
          label: "Clear handwash sequence",
          description:
            "A kitchen poster should keep the sequence simple enough to scan quickly while still reinforcing proper soap, scrub, rinse, and drying steps.",
        },
        {
          label: "Placement at live work points",
          description:
            "Posters above handwash basins, near prep entrances, and in staff welfare areas are more effective than one isolated printout on the wall.",
        },
        {
          label: "Support for site discipline",
          description:
            "Visible prompts help turn hygiene into a live habit rather than something people remember only during induction or inspection week.",
        },
      ]}
      sections={[
        {
          title: "Behaviour slips before standards do",
          body:
            "The usual problem is not that staff have never heard the rule. It is that they move too fast, touch the wrong surface, and carry on without thinking. A poster at the basin acts as the interruption that puts the habit back in front of them at exactly the right time.",
        },
        {
          title: "Made for active sites, not just training packs",
          body:
            "This poster should be readable from across a busy prep area and useful in restaurants, cafes, catering kitchens, retail food counters, and manufacturing sites. It needs to support real movement through the site, not look good only in a compliance folder.",
        },
        {
          title: "Visible hygiene prompts strengthen inspection-readiness",
          body:
            "When sinks are stocked and the handwashing message is visible, it signals that hygiene control is being managed operationally. The poster does not replace records or supervision, but it supports the practical standard an inspector expects to see on the ground.",
        },
      ]}
      ctaTitle="Put the reminder where the habit starts"
      ctaBody="PinkPepper helps teams support hand hygiene with practical policies, checklists, and training records that stay usable after the poster goes up."
      templateSlug="handwashing-poster"
      relatedLinks={[
        { href: "/resources/personal-hygiene-policy-template", label: "Personal hygiene policy template" },
        { href: "/resources/gmp-poster", label: "GMP poster" },
        { href: "/resources/cleaning-and-disinfection-sop", label: "Cleaning and disinfection SOP" },
        { href: "/resources/employee-food-safety-training-record", label: "Employee food safety training record" },
      ]}
    />
  );
}
