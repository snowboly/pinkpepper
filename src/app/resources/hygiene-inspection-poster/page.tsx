import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Pre-Operational Hygiene Inspection Poster | PinkPepper",
  description:
    "Use a pre-operational hygiene inspection poster to reinforce line-release, cleanliness, setup, and handwash readiness checks for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/hygiene-inspection-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/hygiene-inspection-poster",
      en: "https://pinkpepper.io/resources/hygiene-inspection-poster",
    },
  },
};

export default function HygieneInspectionPosterPage() {
  return (
    <ResourceTemplate
      category="Monitoring resource"
      title="What a pre-operational hygiene inspection poster should prompt before start-up"
      intro="A pre-operational hygiene inspection poster should help teams pause before work starts and check the conditions that make safe production or service possible: clean surfaces, correct setup, handwash readiness, waste removal, and equipment condition. For EU and UK businesses, it should support the pre-start inspection or opening sheet already used on site."
      summaryPoints={[
        "Pre-operational posters are useful when they highlight the checks that should happen before food is exposed, not after the shift has already started.",
        "The strongest prompts focus on line release, cleanliness, handwash readiness, and setup condition rather than broad hygiene slogans.",
        "A visible inspection cue is most effective when supervisors use it during pre-start walkthroughs and shift release.",
      ]}
      documentHighlights={[
        {
          label: "Cleanliness and residue checks",
          description:
            "The poster should remind teams to confirm that food-contact surfaces, utensils, drains, and surrounding areas are clean and ready before work starts.",
        },
        {
          label: "Handwash and consumable readiness",
          description:
            "Soap, towels, sanitiser, protective clothing, and waste arrangements are practical controls that often get missed when the team is rushing to open.",
        },
        {
          label: "Equipment and line condition",
          description:
            "A useful poster also points staff toward damaged seals, loose fittings, missing covers, poor setup, or other conditions that should block release until corrected.",
        },
        {
          label: "Release only when checks are complete",
          description:
            "The inspection reminder should reinforce that work begins after the area passes checks, not while the checks are still being informally finished.",
        },
      ]}
      sections={[
        {
          title: "The pre-start check is where preventable problems are cheapest to fix",
          body:
            "Once product is open and the shift is moving, small hygiene gaps become harder to control. The poster helps by keeping attention on the moment when a clean-up issue, missing consumable, or damaged fitting can still be corrected before exposure starts.",
        },
        {
          title: "The visual prompt should match the release process you already use",
          body:
            "If supervisors release the area using one sequence and the poster suggests another, the poster becomes background noise. The strongest setup is a visible cue that mirrors the order of the real inspection routine.",
        },
        {
          title: "A short checklist can improve consistency between shifts",
          body:
            "Different supervisors will naturally focus on different details unless the standard is visible and shared. A good poster narrows that variation and makes handover expectations more consistent across EU and UK operations.",
        },
      ]}
      ctaTitle="Strengthen pre-start hygiene release checks"
      ctaBody="PinkPepper helps teams connect visible inspection prompts with opening checks, SOPs, and corrective action workflows so pre-start hygiene standards are easier to hold consistently."
      templateSlug="hygiene-inspection-poster"
      relatedLinks={[
        { href: "/resources/restaurant-opening-checklist", label: "Restaurant opening checklist" },
        { href: "/resources/personal-hygiene-poster", label: "Personal hygiene checklist poster" },
        { href: "/resources/cleaning-and-disinfection-sop", label: "Cleaning and disinfection SOP" },
      ]}
    />
  );
}
