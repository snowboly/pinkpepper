import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Personal Hygiene Policy Template | PinkPepper",
  description:
    "Learn what a staff personal hygiene policy should cover to meet EU and UK food hygiene regulations and to be enforceable in practice.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/personal-hygiene-policy-template",
  },
};

export default function PersonalHygienePolicyTemplatePage() {
  return (
    <ResourceTemplate
      category="Training resource"
      title="What a personal hygiene policy template should cover"
      intro="A personal hygiene policy communicates the standards that food handlers must follow and gives the business a basis for enforcement. A policy that is too vague cannot be enforced. A policy that is too prescriptive will not be read. The goal is a clear, practical document that staff can refer to and managers can act on."
      summaryPoints={[
        "The policy should cover handwashing, protective clothing, illness and injury reporting, and prohibited behaviours.",
        "Illness reporting procedures need to be specific: what symptoms trigger exclusion, who to report to, and when return is permitted.",
        "The policy should be signed and dated by each employee as part of induction.",
      ]}
      sections={[
        {
          title: "Handwashing and personal cleanliness",
          body: "The policy should state when handwashing is required — at minimum: before starting work, after handling raw food, after using the toilet, after handling waste, after touching the face or hair, and after any break. It should specify the method (soap and water, minimum 20 seconds) and any additional requirements for the operation, such as the use of sanitiser gel at critical points. Nail polish, false nails, and jewellery restrictions should also be stated clearly.",
        },
        {
          title: "Protective clothing and site conduct",
          body: "The policy should describe what protective clothing is required, when and how it should be worn, and the rules around wearing workwear outside the site. It should also address hair coverings, beard nets where relevant, and footwear. Prohibited behaviours — eating, drinking, smoking, or vaping in food areas — should be listed explicitly. If mobile phone use is restricted in certain areas, that should be stated.",
        },
        {
          title: "Illness, injury, and fitness to work",
          body: "This section is frequently underdeveloped but critically important. The policy should name the symptoms that require a food handler to report illness and stay away from food handling: gastrointestinal illness, vomiting, diarrhoea, skin infections in exposed areas, and infected wounds. It should state the reporting process, the exclusion period (typically 48 hours clear of symptoms for gastrointestinal illness), and the return-to-work procedure. For injuries, it should explain when and how wounds must be covered, including the use of blue plasters in food handling areas.",
        },
      ]}
      ctaTitle="Draft a personal hygiene policy for your team"
      ctaBody="PinkPepper can help you create a personal hygiene policy that is specific to your operation, appropriate to your food safety risks, and written in a format your team will actually read."
      relatedLinks={[
        { href: "/resources/employee-food-safety-training-record", label: "Staff training records" },
        { href: "/resources/cleaning-and-disinfection-sop", label: "Cleaning and disinfection SOP" },
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
      ]}
    />
  );
}
