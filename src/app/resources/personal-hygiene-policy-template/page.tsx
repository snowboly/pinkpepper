import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Personal Hygiene Policy Template | PinkPepper",
  description:
    "Learn what a staff personal hygiene policy should cover to meet EU and UK food hygiene regulations and to be enforceable in practice.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/personal-hygiene-policy-template",
    languages: { "x-default": "https://pinkpepper.io/resources/personal-hygiene-policy-template", en: "https://pinkpepper.io/resources/personal-hygiene-policy-template" },
  },
};

export default function PersonalHygienePolicyTemplatePage() {
  return (
    <ResourceTemplate
      category="Training resource"
      title="What a personal hygiene policy template should cover"
      intro="A personal hygiene policy communicates the standards food handlers must follow and gives the business a basis for enforcement. Too vague and it can't be enforced. Too long and no one reads it. The goal is a clear, practical document staff can refer to and managers can actually act on."
      summaryPoints={[
        "Handwashing, protective clothing, illness reporting, and prohibited behaviours — all need to be explicit.",
        "Illness reporting is the section most often underdeveloped, and most important to get right.",
        "Each employee signs it at induction. That signature matters if something goes wrong later.",
      ]}
      documentHighlights={[
        {
          label: "Handwashing requirements",
          description:
            "When handwashing is required — before starting, after raw food, after the toilet, after breaks — and how. Soap and water, minimum 20 seconds. Any site-specific additions like sanitiser gel at certain points.",
        },
        {
          label: "Protective clothing and conduct rules",
          description:
            "What to wear, when, and what's not allowed — jewellery, nail polish, false nails, hair coverings, footwear. Prohibited behaviours in food areas: eating, drinking, phone use. Written down, not assumed.",
        },
        {
          label: "Illness and injury reporting procedure",
          description:
            "Which symptoms require reporting and staying off — GI illness, vomiting, diarrhoea, skin infections. Who to report to, the exclusion period, and when return to work is permitted.",
        },
        {
          label: "Employee acknowledgement section",
          description:
            "A signature line at the bottom. Signed and dated by the employee at induction. This is what makes the policy enforceable rather than just advisory.",
        },
      ]}
      sections={[
        {
          title: "Handwashing rules need to be specific to be useful",
          body:
            "A policy that says 'wash hands regularly' is not a policy. The trigger points — before starting, after raw food, after the toilet, after touching the face, after any break — need to be listed. So does the method. Staff shouldn't be guessing what counts.",
        },
        {
          title: "Protective clothing and site conduct",
          body:
            "What to wear and when, rules around workwear outside the site, hair and beard coverings, footwear. Prohibited behaviours — eating, drinking, vaping, phone use in food areas — should be listed explicitly. If it isn't written down, it's hard to enforce consistently.",
        },
        {
          title: "The illness section is the one that gets skipped",
          body:
            "This is frequently the weakest part of the policy and the most important. It should name the symptoms that trigger exclusion, the exclusion period, who to report to, and what the return-to-work process looks like. For injuries, it should explain when wounds need to be covered and what covering is required — blue plasters in food handling areas, for instance. Getting this wrong has consequences.",
        },
      ]}
      ctaTitle="Draft a personal hygiene policy for your team"
      ctaBody="PinkPepper can help you create a personal hygiene policy that is specific to your operation, appropriate to your food safety risks, and written in a format your team will actually read."
      templateSlug="personal-hygiene-policy-template"
      relatedLinks={[
        { href: "/resources/employee-food-safety-training-record", label: "Staff training records" },
        { href: "/resources/cleaning-and-disinfection-sop", label: "Cleaning and disinfection SOP" },
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
      ]}
    />
  );
}
