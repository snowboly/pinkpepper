import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Food Temperature Poster | PinkPepper",
  description:
    "Use a food temperature poster to keep key chilled, frozen, cooking, hot-hold, cooling, and reheating limits visible in the kitchen.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/food-temperature-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/food-temperature-poster",
      en: "https://pinkpepper.io/resources/food-temperature-poster",
    },
  },
};

export default function FoodTemperaturePosterPage() {
  return (
    <ResourceTemplate
      category="Monitoring resource"
      title="What a food temperature poster should help staff remember"
      intro="A temperature poster is not a substitute for training or monitoring records. Its job is narrower: keep the core limits visible at the point where staff make quick decisions about storage, cooking, hot holding, cooling, and reheating."
      summaryPoints={[
        "The strongest posters focus on the limits staff need in the moment, not on long paragraphs of policy text.",
        "Temperature posters work best when the values match your actual monitoring records and SOPs.",
        "Placement matters: near prep, cooking, and storage areas, not in an office nobody checks.",
      ]}
      documentHighlights={[
        {
          label: "Core temperature bands",
          description:
            "Include the operational temperatures staff need most often, such as chilled storage, frozen storage, cooking, hot holding, cooling, and reheating.",
        },
        {
          label: "Clear visual hierarchy",
          description:
            "The key figures should be readable at a glance from a working distance. If staff need to study it, the poster is doing too much.",
        },
        {
          label: "Link back to records",
          description:
            "The poster should reinforce what is already expected in your logs and procedures. If the poster says one thing and the monitoring sheet says another, staff will follow neither consistently.",
        },
        {
          label: "Practical placement",
          description:
            "Print-ready format is useful only if the poster ends up where the team actually needs it, such as near ovens, probe stations, chillers, or hot-hold equipment.",
        },
      ]}
      sections={[
        {
          title: "A poster is a memory aid, not evidence",
          body:
            "The poster helps staff remember the right numbers quickly, but it does not replace your temperature logs or corrective action records. Think of it as frontline support for the real monitoring system.",
        },
        {
          title: "Keep the limits aligned with the way you train staff",
          body:
            "If your induction, SOPs, and monitoring sheets use one set of limits and the wall poster shows another, confusion is guaranteed. The poster should echo the limits already built into your working documents.",
        },
        {
          title: "Use posters to reduce hesitation during service",
          body:
            "When a team is moving fast, the right prompt in the right place reduces guesswork. That is where a good temperature poster earns its place: fewer pauses, fewer memory slips, and fewer avoidable monitoring errors.",
        },
      ]}
      ctaTitle="Keep temperature limits visible and usable"
      ctaBody="PinkPepper helps teams pair posters with practical monitoring logs, SOPs, and corrective action records so the visible reminder matches the real process."
      templateSlug="food-temperature-poster"
      relatedLinks={[
        { href: "/resources/cooking-monitoring-log-template", label: "Cooking monitoring log template" },
        { href: "/resources/temperature-monitoring-log-template", label: "Temperature monitoring log template" },
        { href: "/articles/temperature-control-in-haccp-limits-and-monitoring", label: "Temperature control in HACCP" },
      ]}
    />
  );
}
