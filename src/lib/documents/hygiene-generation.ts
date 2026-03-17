import type { HygienePolicyData } from "@/lib/documents/hygiene-schema";
import {
  DEFAULT_CUTS_AND_WOUNDS,
  DEFAULT_HANDWASHING_FACILITIES,
  DEFAULT_HANDWASHING_HOW,
  DEFAULT_HANDWASHING_WHEN,
  DEFAULT_ILLNESS_REPORTING,
  DEFAULT_JEWELLERY,
  DEFAULT_MONITORING,
  DEFAULT_PROTECTIVE_CLOTHING,
  DEFAULT_RECORDS,
  DEFAULT_RETURN_TO_WORK_FORM,
  DEFAULT_VISITOR_RULES,
} from "@/lib/documents/hygiene-schema";

function todayIso(): string {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export function buildHygienePolicyDataFromAnswers(answers: string[]): HygienePolicyData {
  const businessName = answers[0]?.split(/[,\n]/)[0]?.trim() ?? "";
  const staffDescription = answers[1]?.trim() ?? "";

  return {
    metadata: {
      businessName,
      docNo: "PH-001",
      revision: "1",
      date: todayIso(),
      approvedBy: "",
      reviewDate: "",
    },
    scope: [
      `This policy applies to all staff who handle food or enter food handling areas at ${businessName || "the premises"}.`,
      staffDescription ? `Staff covered include: ${staffDescription}.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    handwashingWhen: DEFAULT_HANDWASHING_WHEN,
    handwashingHow: DEFAULT_HANDWASHING_HOW,
    handwashingFacilities: DEFAULT_HANDWASHING_FACILITIES,
    protectiveClothing: DEFAULT_PROTECTIVE_CLOTHING,
    jewellery: DEFAULT_JEWELLERY,
    illnessReporting: DEFAULT_ILLNESS_REPORTING,
    cutsAndWounds: DEFAULT_CUTS_AND_WOUNDS,
    visitorRules: DEFAULT_VISITOR_RULES,
    monitoring: DEFAULT_MONITORING,
    returnToWorkForm: DEFAULT_RETURN_TO_WORK_FORM,
    records: DEFAULT_RECORDS,
  };
}

export function buildHygienePolicyModelPrompt(data: HygienePolicyData): string {
  return [
    "Create a comprehensive Personal Hygiene Policy document.",
    "Include all required sections: policy statement, scope, handwashing procedure, protective clothing, jewellery rules, illness reporting, fitness to work, cuts and wounds, visitor hygiene, monitoring and enforcement, return-to-work form, and records.",
    "Reference Regulation (EC) 852/2004 Annex II Chapter VIII.",
    "Keep the document operational, specific to the business, and audit-ready.",
    JSON.stringify(data),
  ].join("\n\n");
}
