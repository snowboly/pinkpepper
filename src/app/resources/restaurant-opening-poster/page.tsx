import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Restaurant Opening Poster | PinkPepper",
  description:
    "Use a restaurant opening poster to keep pre-service hygiene, temperature, allergen, and readiness checks visible for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/restaurant-opening-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/restaurant-opening-poster",
      en: "https://pinkpepper.io/resources/restaurant-opening-poster",
    },
  },
};

export default function RestaurantOpeningPosterPage() {
  return (
    <ResourceTemplate
      category="Monitoring resource"
      title="What a restaurant opening poster should reinforce before service"
      intro="A restaurant opening poster works when it keeps the most important pre-service checks visible in the kitchen or service area: handwash readiness, surface condition, temperature checks, allergen information, and equipment status. For EU and UK operators, it is a visual prompt that supports the real opening checklist rather than replacing it."
      summaryPoints={[
        "Opening posters are most useful when they highlight the checks teams rush past during setup.",
        "The poster should mirror the opening checklist and briefing process already used on site.",
        "Visible prompts reduce missed checks only when they are placed where the team actually starts work.",
      ]}
      documentHighlights={[
        {
          label: "Pre-service control prompts",
          description:
            "The poster should focus on the controls the team needs to remember quickly: hygiene setup, temperatures, allergen readiness, and key equipment checks.",
        },
        {
          label: "Short, readable wording",
          description:
            "A poster that tries to hold the whole SOP usually fails. The better version gives the team the prompts that point them back to the real checks and records.",
        },
        {
          label: "Shift-briefing support",
          description:
            "Opening posters work especially well when supervisors can use them during the first briefing of the day to confirm what has changed and what needs attention.",
        },
        {
          label: "Link to the working record",
          description:
            "The visual prompt should reflect the same sequence and logic already used on your opening checklist so the reminder and the evidence match.",
        },
      ]}
      sections={[
        {
          title: "A poster helps when service setup is repetitive and fast",
          body:
            "Opening routines are repeated daily, which is exactly why teams start skipping visible cues if the content is weak. A stronger poster focuses on the few checks that matter most before food handling and service pressure start to accelerate.",
        },
        {
          title: "The visible reminder should support the opening record, not compete with it",
          body:
            "If the poster lists one set of checks but the opening sheet asks for another, staff will eventually ignore one of them. The best result comes when the poster is a quick memory aid and the checklist is the record of what was actually done.",
        },
        {
          title: "Place the poster where the opening conversation really happens",
          body:
            "That might be a kitchen entry point, a prep area, a probe station, or the place where the duty manager briefs the team. Visibility matters more than decoration here. If the team does not naturally see it before work starts, it has limited value.",
        },
      ]}
      ctaTitle="Use visible prompts that match the real opening process"
      ctaBody="PinkPepper helps teams combine restaurant posters, opening checklists, and service-ready food safety documents so the visible prompt matches the way the shift actually starts."
      templateSlug="restaurant-opening-poster"
      relatedLinks={[
        { href: "/resources/restaurant-opening-checklist", label: "Restaurant opening checklist" },
        { href: "/resources/restaurant-closing-checklist", label: "Restaurant closing checklist" },
        { href: "/resources/food-temperature-poster", label: "Food temperature poster" },
      ]}
    />
  );
}
