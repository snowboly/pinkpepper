import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Workplace Compliance Poster | PinkPepper",
  description:
    "Use a workplace compliance poster to reinforce the day-to-day site rules around hygiene, conduct, protective clothing, reporting, and safe food handling.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/workplace-compliance-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/workplace-compliance-poster",
      en: "https://pinkpepper.io/resources/workplace-compliance-poster",
    },
  },
};

export default function WorkplaceCompliancePosterPage() {
  return (
    <ResourceTemplate
      category="Training resource"
      title="What a workplace compliance poster should make obvious"
      intro="A workplace compliance poster helps keep the everyday site rules visible: what staff should wear, what behaviour is not acceptable, what needs reporting, and how hygiene and handling standards should look in practice. It is useful when the message is direct enough to support action during the shift."
      summaryPoints={[
        "The strongest workplace posters reinforce conduct and hygiene rules that supervisors already expect teams to follow.",
        "Visible prompts are especially useful where turnover, agency labour, or shift handovers increase the risk of drift.",
        "A compliance poster should support consistent workplace behaviour without trying to replace policy documents or induction.",
      ]}
      documentHighlights={[
        {
          label: "Clear conduct expectations",
          description:
            "The poster should help staff see the practical site rules around clothing, personal items, reporting issues, and movement through the workplace.",
        },
        {
          label: "Hygiene and handling prompts",
          description:
            "The content should reinforce the day-to-day behaviours that protect food, equipment, and working areas from unnecessary risk.",
        },
        {
          label: "Fast onboarding support",
          description:
            "A visible poster gives line leaders a simple reference point during inductions, briefings, and correction of repeated bad habits.",
        },
        {
          label: "Readable production-area format",
          description:
            "The file needs to stay clear once printed and posted in staff entry points, prep areas, or other live work zones.",
        },
      ]}
      sections={[
        {
          title: "The value is in visible day-to-day expectations",
          body:
            "Most workplace compliance issues are not technical mysteries. They are repeated small behaviours: the wrong clothing, poor personal-item control, weak reporting discipline, or avoidable shortcuts during handling and cleaning. A poster helps put those expectations back in view.",
        },
        {
          title: "Useful posters support supervision, not just decoration",
          body:
            "A good workplace compliance poster gives supervisors something practical to point to during shift starts and corrective conversations. It works better as a live coaching tool than as a generic wall graphic no one uses.",
        },
        {
          title: "It should align with your actual site rules",
          body:
            "The poster becomes more credible when it reflects the standards already built into your policies, hygiene rules, and training records. That alignment is what makes it feel like part of the system rather than a disconnected poster campaign.",
        },
      ]}
      ctaTitle="Support site rules with practical training records"
      ctaBody="PinkPepper helps teams connect visible workplace standards with hygiene policies, training evidence, and supporting operational documents."
      templateSlug="workplace-compliance-poster"
      relatedLinks={[
        { href: "/resources/gmp-poster", label: "GMP poster" },
        { href: "/resources/personal-hygiene-policy-template", label: "Personal hygiene policy template" },
        { href: "/resources/employee-food-safety-training-record", label: "Employee food safety training record" },
        { href: "/resources/handwashing-poster", label: "Handwashing poster" },
      ]}
    />
  );
}
