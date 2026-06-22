import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Personal Hygiene Checklist Poster | PinkPepper",
  description:
    "Use a personal hygiene checklist poster to reinforce handwashing, illness reporting, protective clothing, and staff behaviour rules for EU and UK food teams.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/personal-hygiene-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/personal-hygiene-poster",
      en: "https://pinkpepper.io/resources/personal-hygiene-poster",
    },
  },
};

export default function PersonalHygienePosterPage() {
  return (
    <ResourceTemplate
      category="Training resource"
      title="What a personal hygiene checklist poster should help reinforce"
      intro="A personal hygiene checklist poster works when it keeps the non-negotiables visible: effective handwashing, clean protective clothing, illness reporting, jewellery and phone rules, and disciplined behaviour around exposed food. For EU and UK operators, it should reinforce the same expectations already set in induction and policy documents."
      summaryPoints={[
        "The best personal hygiene posters reduce ambiguity about what staff must do before they start work and while food is exposed.",
        "Short visual prompts work better than long policy text for handwash, illness, clothing, and behaviour controls.",
        "The poster should mirror the actual hygiene policy and training message used on site, not compete with it.",
      ]}
      documentHighlights={[
        {
          label: "Handwashing and hand condition",
          description:
            "The poster should remind staff about when to wash hands, how to restart after contamination events, and why cuts, gloves, and skin condition need active management.",
        },
        {
          label: "Illness and exclusion expectations",
          description:
            "Clear reminders about reporting sickness, diarrhoea, vomiting, and other symptoms matter because personal hygiene failures often begin with silence, not ignorance.",
        },
        {
          label: "Clothing and personal-item controls",
          description:
            "Protective clothing, jewellery restrictions, phone handling, and pocket discipline are practical controls that belong on the wall because they are easy to treat informally.",
        },
        {
          label: "Behaviour in food areas",
          description:
            "A good poster reinforces simple habits: no eating, no uncontrolled touching, no shortcuts after contamination, and no guesswork about when to rewash or change clothing.",
        },
      ]}
      sections={[
        {
          title: "Personal hygiene is one of the most visible food safety controls",
          body:
            "Supervisors, auditors, and inspectors notice hygiene discipline immediately because it is visible in the way staff move, wash, handle tools, and restart after contamination. A poster helps keep those habits obvious and shared across the team.",
        },
        {
          title: "The message should support action, not just awareness",
          body:
            "A poster that says 'maintain high standards' is not useful. A stronger one tells staff what good behaviour actually looks like in the working day so the expectations are harder to dilute.",
        },
        {
          title: "Visible reminders help most where staff turnover is real",
          body:
            "Sites with agency labour, seasonal hiring, and busy shift changeovers benefit from visible hygiene cues because they shorten the gap between induction, supervision, and repeated practice.",
        },
      ]}
      ctaTitle="Keep hygiene rules visible where food handling starts"
      ctaBody="PinkPepper helps food businesses pair hygiene posters with staff policies, training records, and operational SOPs so wall prompts match the documented rules."
      templateSlug="personal-hygiene-poster"
      relatedLinks={[
        { href: "/resources/personal-hygiene-policy-template", label: "Personal hygiene policy template" },
        { href: "/resources/employee-food-safety-training-record", label: "Employee food safety training record" },
        { href: "/resources/gmp-poster", label: "GMP poster" },
      ]}
    />
  );
}
