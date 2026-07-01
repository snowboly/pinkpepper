import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Restaurant Closing Checklist | PinkPepper",
  description:
    "Use a restaurant closing checklist to structure end-of-day food safety checks, cleaning sign-off, storage controls, and handover notes for EU and UK operators.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/restaurant-closing-checklist",
    languages: {
      "x-default": "https://pinkpepper.io/resources/restaurant-closing-checklist",
      en: "https://pinkpepper.io/resources/restaurant-closing-checklist",
    },
  },
};

export default function RestaurantClosingChecklistPage() {
  return (
    <ResourceTemplate
      category="Monitoring resource"
      title="What a restaurant closing checklist should cover at the end of service"
      intro="A restaurant closing checklist should help teams leave the site safe for the next shift: food stored correctly, temperatures checked, waste removed, cleaning completed, equipment left in the right state, and unresolved issues handed over clearly. For EU and UK operators, the strongest checklist is short enough to be used daily and specific enough to show what was actually checked."
      summaryPoints={[
        "End-of-day checks should focus on storage, cleaning, waste, equipment status, and unresolved food safety issues.",
        "A useful closing sheet records exceptions and corrective actions, not just rows of routine ticks.",
        "The best format supports handover between teams instead of leaving tomorrow's shift to rediscover problems.",
      ]}
      documentHighlights={[
        {
          label: "Food storage and temperature checks",
          description:
            "The checklist should prompt staff to confirm chilled and frozen storage, date labelling, covers, segregation, and any closing temperature checks that support overnight control.",
        },
        {
          label: "Cleaning and sanitation completion",
          description:
            "Critical cleaning tasks, chemical storage, sanitiser readiness, and any incomplete work should be visible rather than assumed.",
        },
        {
          label: "Waste and pest-risk controls",
          description:
            "Waste removal, bin condition, spill control, and other housekeeping steps matter because missed close-down tasks create the next day's hygiene and pest issues.",
        },
        {
          label: "Handover notes and exceptions",
          description:
            "Where a fridge was out of range, stock was quarantined, or equipment was left awaiting repair, the checklist should capture that clearly enough for the next shift to act on it.",
        },
      ]}
      sections={[
        {
          title: "Closing checks protect tomorrow's opening shift",
          body:
            "A weak close leaves the next team to discover issues from scratch: unlabeled food, incomplete cleaning, or equipment left in the wrong state. A stronger checklist reduces that risk by making end-of-day controls visible and repeatable.",
        },
        {
          title: "Routine ticks are less useful than exception notes",
          body:
            "The real value of a restaurant closing checklist appears when something did not go to plan. That might be stock moved because of a temperature issue, a cleaning task left incomplete, or an equipment problem that changes the next morning's prep plan. The checklist should make those points easy to record.",
        },
        {
          title: "Keep the checklist close to the way the kitchen actually closes",
          body:
            "Restaurants, pubs, hotels, cafes, and quick-service sites all close differently. A stronger template follows the real order of close-down work on site so staff can complete it without fighting the format every night.",
        },
      ]}
      ctaTitle="Turn end-of-day checks into working restaurant controls"
      ctaBody="PinkPepper helps teams adapt generic close-down templates into site-specific restaurant records, SOPs, and follow-up controls that fit the way each service actually runs."
      templateSlug="restaurant-closing-checklist"
      relatedLinks={[
        { href: "/resources/restaurant-opening-checklist", label: "Restaurant opening checklist" },
        { href: "/resources/cleaning-and-disinfection-sop", label: "Cleaning and disinfection SOP" },
        { href: "/resources/temperature-monitoring-log-template", label: "Temperature monitoring log template" },
      ]}
    />
  );
}
