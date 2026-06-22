import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Kosher Compliance Poster | PinkPepper",
  description:
    "Use a kosher compliance poster to reinforce ingredient checks, segregation, equipment awareness, and handling discipline for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/kosher-compliance-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/kosher-compliance-poster",
      en: "https://pinkpepper.io/resources/kosher-compliance-poster",
    },
  },
};

export default function KosherCompliancePosterPage() {
  return (
    <ResourceTemplate
      category="Training resource"
      title="What a kosher compliance poster should reinforce in day-to-day handling"
      intro="A kosher compliance poster is most useful when it reinforces the operational controls staff must follow consistently: approved ingredients, clear separation, equipment awareness, careful storage, and disciplined communication. For EU and UK operators, the poster should support the real handling system rather than imply that a poster alone creates kosher compliance."
      summaryPoints={[
        "A useful kosher poster reinforces practical staff behavior around ingredients, equipment, and separation.",
        "The strongest version supports your actual approval and handling process instead of making broad unsupported claims.",
        "Visible prompts are most valuable where receiving, prep, and service teams make fast decisions about ingredients and equipment.",
      ]}
      documentHighlights={[
        {
          label: "Ingredient and source verification",
          description:
            "The poster should remind teams that kosher status depends on approved ingredients and current verification, especially when products, labels, or suppliers change.",
        },
        {
          label: "Segregation and equipment awareness",
          description:
            "Shared equipment, storage mix-ups, and unclear handling boundaries can undermine the process quickly. Strong poster content makes those risks visible.",
        },
        {
          label: "Operational clarity for staff",
          description:
            "The wording should make the correct action obvious for prep teams, receiving staff, and service staff when something looks unclear or inconsistent.",
        },
        {
          label: "Escalation rather than guesswork",
          description:
            "Where there is doubt over an ingredient, container, or process step, the safest poster message is to stop and verify rather than improvise.",
        },
      ]}
      sections={[
        {
          title: "Posters help when the risk is confusion, not ignorance",
          body:
            "Teams do not usually fail because nobody has heard the word kosher. They fail when a substituted ingredient is used without checking, when storage boundaries blur, or when equipment assumptions are made under pressure. A stronger poster aims directly at those situations.",
        },
        {
          title: "Keep the visible message tied to the real process",
          body:
            "If the poster says one thing but purchasing, prep, and service routines say another, staff will lose confidence in both. The visible prompt should match the supplier controls, ingredient checks, and handling rules your operation actually follows.",
        },
        {
          title: "The safest operational message is to verify before acting",
          body:
            "Where a claim or handling rule matters, the poster should encourage pause and escalation rather than confident guessing. That is especially important when new staff, new ingredients, or busy service conditions increase the chance of error.",
        },
      ]}
      ctaTitle="Back up visible reminders with stronger control records"
      ctaBody="PinkPepper helps businesses pair operational reminder posters with supplier controls, receiving checks, and working food safety documents that are easier to maintain across EU and UK sites."
      templateSlug="kosher-compliance-poster"
      relatedLinks={[
        { href: "/resources/supplier-approval-questionnaire", label: "Supplier approval questionnaire" },
        { href: "/resources/incoming-goods-template", label: "Incoming goods inspection template" },
        { href: "/resources/gmp-poster", label: "GMP poster" },
      ]}
    />
  );
}
