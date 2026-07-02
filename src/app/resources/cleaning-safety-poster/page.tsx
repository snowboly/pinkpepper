import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Cleaning Safety Poster | PinkPepper",
  description:
    "Use a cleaning safety poster to reinforce chemical separation, safe cleaning sequence, and contamination control in food operations.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/cleaning-safety-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/cleaning-safety-poster",
      en: "https://pinkpepper.io/resources/cleaning-safety-poster",
    },
  },
};

export default function CleaningSafetyPosterPage() {
  return (
    <ResourceTemplate
      category="Cleaning resource"
      title="What a cleaning safety poster should help staff remember"
      intro="Cleaning in a food business is not only about appearance. Used well, it protects food and equipment. Used badly, it creates chemical, cross-contamination, and sequence failures that a later cooking step cannot fix. A good cleaning safety poster keeps the safe order and separation rules visible where cleaning actually happens."
      summaryPoints={[
        "The strongest cleaning posters focus on sequence, separation, and chemical control rather than vague reminders to keep things tidy.",
        "Visible prompts help prevent rushed chemical misuse and zone cross-over during close-down and between-shift cleans.",
        "The poster should support the same cleaning routine already expected in your SOPs and schedules.",
      ]}
      documentHighlights={[
        {
          label: "Chemical separation",
          description:
            "The poster should reinforce that cleaning chemicals stay labelled, segregated, and away from food and packaging at all times.",
        },
        {
          label: "Correct cleaning order",
          description:
            "Useful prompts focus on the sequence that matters: clear debris, wash, rinse where needed, sanitise, and let surfaces dry correctly.",
        },
        {
          label: "Zone control",
          description:
            "Cross-use of cloths and equipment between raw, high-care, and front-of-house areas is one of the easiest failures to prevent when it stays visible.",
        },
        {
          label: "Immediate reporting",
          description:
            "Damaged bottles, missing labels, or unexpected chemical reactions should trigger action at once, not get ignored until the next shift.",
        },
      ]}
      sections={[
        {
          title: "Chemical misuse creates hazards fast",
          body:
            "A wrongly used product or an unlabelled decanted bottle can contaminate food-contact surfaces or expose staff to unnecessary risk. These are not edge cases. They happen when routines drift and nobody has a visible prompt telling the team what stays separate, what gets labelled, and what never belongs near food.",
        },
        {
          title: "The sequence matters as much as the product",
          body:
            "Teams often focus on what chemical was used and ignore whether the cleaning order made sense. A surface can look clean and still be left unsafe because the sanitising step was skipped or the surface was not left to dry properly. A strong poster keeps the sequence in view during real work, not just in training notes.",
        },
        {
          title: "Supports chemical control and daily cleaning routines",
          body:
            "This poster works best when it backs up the practical controls already built into your cleaning procedures, prerequisite programmes, and daily schedules. Its role is to keep safe behaviour obvious at the point of use, especially in pot wash, chemical storage, and close-down areas.",
        },
      ]}
      ctaTitle="Put safe cleaning practice where the team works"
      ctaBody="PinkPepper helps teams connect posters with cleaning SOPs, hygiene routines, and corrective action records so visual reminders match the real standard on site."
      templateSlug="cleaning-safety-poster"
      relatedLinks={[
        { href: "/resources/cleaning-and-disinfection-sop", label: "Cleaning and disinfection SOP" },
        { href: "/resources/waste-management-sop-template", label: "Waste management SOP template" },
        { href: "/resources/gmp-poster", label: "GMP poster" },
        { href: "/resources/corrective-action-log-template", label: "Corrective action log template" },
      ]}
    />
  );
}
