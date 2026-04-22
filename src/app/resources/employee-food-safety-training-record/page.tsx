import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Employee Food Safety Training Record Template | PinkPepper",
  description:
    "Learn what staff food safety training records must capture to demonstrate competence during inspections under EU and UK food hygiene regulations.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/employee-food-safety-training-record",
    languages: { "x-default": "https://pinkpepper.io/resources/employee-food-safety-training-record", en: "https://pinkpepper.io/resources/employee-food-safety-training-record" },
  },
};

export default function EmployeeFoodSafetyTrainingRecordPage() {
  return (
    <ResourceTemplate
      category="Training resource"
      title="What employee food safety training records need to capture"
      intro="EU Regulation 852/2004 and UK food hygiene regulations require that food handlers are trained commensurate with their work activity. Training records are how you demonstrate that. An attendance log isn't enough — the record needs to show what was covered and whether it was understood."
      summaryPoints={[
        "Each employee linked to specific topics, not just an induction date.",
        "Refresher events recorded with a reason — not just a date.",
        "Assessment outcome, not just attendance, is what shows training was effective.",
      ]}
      documentHighlights={[
        {
          label: "Employee name and role",
          description:
            "Name, job role, and start date. The role matters because training requirements differ — a chef has different exposure to hazards than someone at the front of house.",
        },
        {
          label: "Training topic columns",
          description:
            "Specific topics — personal hygiene, allergens, temperature controls, cross-contamination — not just 'food hygiene induction'. An inspector will want to see what was actually covered.",
        },
        {
          label: "Delivery method and trainer name",
          description:
            "In-person, online, on-the-job — the method matters. So does who delivered it. These columns show the training was real, not just a box ticked.",
        },
        {
          label: "Assessment outcome",
          description:
            "Pass, retest required, practical sign-off — whatever the assessment looked like. Attendance alone doesn't demonstrate competence.",
        },
      ]}
      sections={[
        {
          title: "What you record for each employee",
          body:
            "Name, role, date, topic, delivery method, trainer, assessment outcome. That's the full picture. An attendance record alone — 'completed induction 3 March' — doesn't show the employee understood what they were taught. That distinction matters when an inspector asks.",
        },
        {
          title: "Induction and ongoing training are different records",
          body:
            "New starters need a food safety induction before or right after starting. That's the baseline. But inspectors also look at whether training is current — not just whether it happened once. Refreshers, procedure-specific updates when something changes, allergen training — all of that needs its own entry.",
        },
        {
          title: "Allergen training deserves its own row",
          body:
            "Given the legal and safety implications, allergen training should be clearly flagged or recorded separately. Who received it, when, and what it covered. If something goes wrong and allergen training records are missing or vague, that's a significant problem.",
        },
      ]}
      ctaTitle="Create a training record system for your team"
      ctaBody="PinkPepper can help you draft a food safety training record template and induction checklist appropriate for your team size, roles, and the hazards present in your operation."
      templateSlug="employee-food-safety-training-record"
      relatedLinks={[
        { href: "/resources/personal-hygiene-policy-template", label: "Personal hygiene policy" },
        { href: "/resources/allergen-matrix-template", label: "Allergen matrix template" },
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
      ]}
    />
  );
}
