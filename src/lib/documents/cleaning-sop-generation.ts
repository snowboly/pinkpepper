import type { CleaningSopData } from "@/lib/documents/cleaning-sop-schema";
import {
  DEFAULT_CHEMICALS,
  DEFAULT_CLEANING_SOP_RECORDS,
  DEFAULT_CORRECTIVE,
  DEFAULT_DEFINITIONS,
  DEFAULT_FREQUENCY_SCHEDULE,
  DEFAULT_NON_FOOD_CONTACT_PROCEDURE,
  DEFAULT_RESPONSIBILITIES,
  DEFAULT_STANDARD_PROCEDURE,
  DEFAULT_VERIFICATION_ATP,
  DEFAULT_VERIFICATION_VISUAL,
} from "@/lib/documents/cleaning-sop-schema";

type CleaningSopBuilderData = {
  businessName?: string;
  approvedBy?: string;
  reviewDate?: string;
  premises?: string;
  scope?: string;
  responsibleRole?: string;
  verificationRole?: string;
  chemicals?: CleaningSopData["chemicals"];
  frequencySchedule?: CleaningSopData["frequencySchedule"];
  corrective?: string[];
  records?: CleaningSopData["records"];
};

function todayIso(): string {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export function buildCleaningSopDataFromAnswers(answers: string[]): CleaningSopData {
  const premises = answers[0]?.trim() ?? "";
  const businessName = premises.split(/[,\n]/)[0]?.trim() ?? premises;

  return {
    metadata: {
      businessName,
      premises,
      docNo: "CL-SOP-001",
      revision: "1",
      date: todayIso(),
      approvedBy: "",
      reviewDate: "",
    },
    scope: [
      "This SOP applies to all food preparation, storage, and service areas; food-contact surfaces, equipment, and utensils; non-food-contact surfaces; and welfare areas.",
      premises ? `Premises: ${premises}.` : "",
      answers[1] ? `Surfaces/equipment covered: ${answers[1]}.` : "",
      answers[3] ? `Responsible persons: ${answers[3]}.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    responsibilities: DEFAULT_RESPONSIBILITIES,
    definitions: DEFAULT_DEFINITIONS,
    chemicals: DEFAULT_CHEMICALS,
    standardProcedure: DEFAULT_STANDARD_PROCEDURE,
    nonFoodContactProcedure: DEFAULT_NON_FOOD_CONTACT_PROCEDURE,
    frequencySchedule: DEFAULT_FREQUENCY_SCHEDULE,
    verificationVisual: DEFAULT_VERIFICATION_VISUAL,
    verificationAtp: DEFAULT_VERIFICATION_ATP,
    corrective: DEFAULT_CORRECTIVE,
    records: DEFAULT_CLEANING_SOP_RECORDS,
  };
}

export function buildCleaningSopDataFromBuilder(
  builder: CleaningSopBuilderData,
): CleaningSopData {
  const scopeParts = [
    builder.scope?.trim() ?? "",
    builder.responsibleRole?.trim() ? `Responsible role: ${builder.responsibleRole?.trim()}.` : "",
    builder.verificationRole?.trim() ? `Verification role: ${builder.verificationRole?.trim()}.` : "",
  ].filter(Boolean);

  return {
    metadata: {
      businessName: builder.businessName?.trim() ?? "",
      premises: builder.premises?.trim() ?? "",
      docNo: "CL-SOP-001",
      revision: "1",
      date: todayIso(),
      approvedBy: builder.approvedBy?.trim() ?? "",
      reviewDate: builder.reviewDate?.trim() ?? "",
    },
    scope: scopeParts.join(" "),
    responsibilities: DEFAULT_RESPONSIBILITIES,
    definitions: DEFAULT_DEFINITIONS,
    chemicals: builder.chemicals && builder.chemicals.length > 0 ? builder.chemicals : DEFAULT_CHEMICALS,
    standardProcedure: DEFAULT_STANDARD_PROCEDURE,
    nonFoodContactProcedure: DEFAULT_NON_FOOD_CONTACT_PROCEDURE,
    frequencySchedule:
      builder.frequencySchedule && builder.frequencySchedule.length > 0
        ? builder.frequencySchedule
        : DEFAULT_FREQUENCY_SCHEDULE,
    verificationVisual: DEFAULT_VERIFICATION_VISUAL,
    verificationAtp: DEFAULT_VERIFICATION_ATP,
    corrective: builder.corrective && builder.corrective.length > 0 ? builder.corrective : DEFAULT_CORRECTIVE,
    records: builder.records && builder.records.length > 0 ? builder.records : DEFAULT_CLEANING_SOP_RECORDS,
  };
}

export function buildCleaningSopModelPrompt(data: CleaningSopData): string {
  return [
    "Create a complete Cleaning and Disinfection SOP document.",
    "Include all required sections: purpose, scope, responsibilities, definitions, materials and chemicals, step-by-step procedure, cleaning frequency schedule, verification, corrective actions, records, and sign-off log.",
    "Reference Regulation (EC) 852/2004, Annex II, Chapter I.",
    "Keep the document operational and audit-ready.",
    JSON.stringify(data),
  ].join("\n\n");
}
