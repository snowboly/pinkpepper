import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Food Safety Culture Poster | PinkPepper",
  description:
    "Use a food safety culture poster to reinforce ownership, escalation, communication, and day-to-day food safety behaviour across EU and UK teams.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/food-safety-culture-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/food-safety-culture-poster",
      en: "https://pinkpepper.io/resources/food-safety-culture-poster",
    },
  },
};

export default function FoodSafetyCulturePosterPage() {
  return (
    <ResourceTemplate
      category="Training resource"
      title="What a food safety culture poster should reinforce every day"
      intro="A food safety culture poster should make the expected behaviours obvious: speak up early, follow controls consistently, report problems honestly, and treat food safety as part of normal work rather than a separate exercise. For EU and UK businesses, it works best when the message is simple enough to support real supervision and team briefings."
      summaryPoints={[
        "Culture posters should focus on visible behaviours, not abstract values nobody can act on.",
        "The strongest message is usually about ownership, escalation, consistency, and honest reporting under pressure.",
        "A food safety culture poster is useful when supervisors actually use it in onboarding, shift briefings, and corrective conversations.",
      ]}
      documentHighlights={[
        {
          label: "Ownership and accountability",
          description:
            "Staff should be reminded that food safety is part of their role on every shift, not something left to the manager or the audit file.",
        },
        {
          label: "Speak-up expectations",
          description:
            "A useful culture poster tells staff to raise concerns early when they see temperature drift, allergen risk, damage, contamination, or procedure gaps.",
        },
        {
          label: "Consistency under pressure",
          description:
            "The message should reinforce that busy service is not the moment to drop key controls. That is usually when discipline matters most.",
        },
        {
          label: "Use in team discussions",
          description:
            "The poster works best when it becomes part of the briefing rhythm and not just another piece of wall art.",
        },
      ]}
      sections={[
        {
          title: "Culture only matters if it changes behaviour",
          body:
            "A polished statement about values is not enough. The poster is useful when it reminds staff what good behaviour looks like in practice: checking, reporting, asking, escalating, and sticking to controls even when the shift gets harder.",
        },
        {
          title: "Visible prompts help supervisors reinforce standards",
          body:
            "The better use of a culture poster is as a shared reference during briefings, onboarding, and follow-up. It gives managers a concrete way to point back to the behaviours they expect to see on the floor.",
        },
        {
          title: "The message should fit the site's real risks",
          body:
            "A kitchen, production line, and distribution site do not all need the same emphasis. The strongest poster language reflects the operational realities your team actually faces, whether that is allergen changes, cold chain, or equipment hygiene.",
        },
      ]}
      ctaTitle="Turn culture language into visible daily expectations"
      ctaBody="PinkPepper helps food businesses connect behaviour prompts with training records, SOPs, and review workflows so food safety culture is backed by working systems."
      templateSlug="food-safety-culture-poster"
      relatedLinks={[
        { href: "/resources/gmp-poster", label: "GMP poster" },
        { href: "/resources/employee-food-safety-training-record", label: "Employee food safety training record" },
        { href: "/methodology", label: "Methodology" },
      ]}
    />
  );
}
