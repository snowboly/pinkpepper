import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Employee Food Safety Training Record Template | PinkPepper",
  description:
    "Learn what staff food safety training records must capture to demonstrate competence during inspections under EU and UK food hygiene regulations.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/employee-food-safety-training-record",
  },
};

export default function EmployeeFoodSafetyTrainingRecordPage() {
  return (
    <ResourceTemplate
      category="Training resource"
      title="What employee food safety training records need to capture"
      intro="EU Regulation 852/2004 and UK food hygiene regulations require that food handlers are supervised, instructed, and trained in food hygiene matters commensurate with their work activity. Training records are how you demonstrate compliance. A poorly structured record may leave a business unable to show that training actually happened."
      summaryPoints={[
        "Training records should link each employee to specific training topics, not just induction dates.",
        "Refresher training and the trigger for it — a procedure change, an incident, or a set interval — should be recorded.",
        "Competence assessment, not just attendance, is what demonstrates that training was effective.",
      ]}
      sections={[
        {
          title: "What to record for each employee",
          body: "A training record should capture the employee name and role, the date of training, the topic or procedure covered, the method of delivery (in-person, online course, on-the-job), and the name of the trainer or course provider. If the training involved an assessment — a test, a practical demonstration, or a supervisor sign-off — the outcome should be recorded. An attendance record alone does not show that the employee understood what they were taught.",
        },
        {
          title: "Induction versus ongoing training",
          body: "New starters should complete a food safety induction before or immediately after beginning work with food. This typically covers personal hygiene, cross-contamination prevention, allergen handling, temperature controls, and waste management. Ongoing training records should capture refresher events, procedure-specific training when processes change, and any formal qualifications obtained (Level 2 Food Hygiene certificate, for example). Inspectors will look at whether training is current, not just whether it was completed at some point.",
        },
        {
          title: "Allergen training as a separate record",
          body: "For businesses subject to allergen information requirements, allergen-specific training should be recorded separately or clearly flagged within the general training record. This includes understanding the 14 regulated allergens, how to communicate allergen information to customers, and what to do when a customer discloses an allergy or intolerance. Given the legal and safety implications of allergen errors, having a clear record of who has received allergen training and when is particularly important.",
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
