import type { DocumentType } from "./types";

const JSON_SCHEMA = `{
  "documentType": string,
  "title": string,
  "documentNumber": string,
  "version": string,
  "date": string,
  "approvedBy": string,
  "scope": string,
  "sections": [{ "heading": string, "content": string, "subsections"?: [{ "heading": string, "content": string }] }],
  "tables"?: [{ "caption"?: string, "columns": [{ "header": string }], "rows": [{ [key: string]: string }] }]
}`;

const INSTRUCTIONS: Record<DocumentType, string> = {
  haccp_plan: `Generate a complete, audit-ready HACCP Plan document.
Include: scope, product/process description, process flow, hazard analysis table, CCPs with critical limits, monitoring procedures, corrective actions, verification, and record-keeping.
Use EU/UK compliant temperature and allergen control language. Include a version control block.`,

  cleaning_sop: `Generate a complete Cleaning and Disinfection SOP.
Include: purpose, scope, responsibilities, materials/chemicals, step-by-step procedure, frequency schedule, verification, corrective action, and records section.
Include an example cleaning schedule table and a sign-off log table.`,

  temperature_log: `Generate a Temperature Monitoring Log pack.
Include separate monitoring tables for fridges, freezers, hot-holding, cooking, and deliveries.
Each table should include: date, time, equipment, reading, limit, pass/fail, corrective action, initials.
Add brief guidance on out-of-limit actions.`,

  supplier_approval: `Generate a complete Supplier Approval Procedure.
Include: onboarding checklist, approval criteria, ongoing monitoring schedule, non-conformance handling, and reapproval process.
Include a supplier questionnaire/checklist template table.`,

  allergen_policy: `Generate a comprehensive Allergen Management Policy.
Include: policy statement, scope, the 14 major allergens (EU/UK), labelling requirements, cross-contamination controls, staff training, customer communication, and emergency response.
Reference Natasha's Law (PPDS) and Regulation 1169/2011 where relevant.`,
};

export function buildGenerateSystemPrompt(documentType: DocumentType): string {
  const instructions = INSTRUCTIONS[documentType];
  return `You are a food safety compliance expert specialising in EU and UK food law.
Your task is to generate a professional, audit-ready food safety document.

${instructions}

Respond ONLY with a valid JSON object matching this schema exactly:
${JSON_SCHEMA}

Rules:
- documentNumber should be formatted like "PP-${documentType.toUpperCase().replace(/_/g, "-")}-001"
- version should be "1.0"
- date should be today's date in DD/MM/YYYY format
- All content must be practical, specific, and comply with current EU/UK food safety legislation
- Do NOT include any markdown, code blocks, or text outside the JSON object`;
}

export function buildGenerateUserPrompt(documentType: DocumentType, answers: string[]): string {
  const labels: Record<DocumentType, string[]> = {
    haccp_plan: ["Business name and type", "Products/processes covered", "Number of staff", "Premises description", "Any known CCPs or hazards", "Additional requirements"],
    cleaning_sop: ["Business name and type", "Kitchen/premises description", "Cleaning chemicals in use", "Cleaning frequency requirements", "Additional requirements"],
    temperature_log: ["Business name and type", "Equipment to monitor (fridges, freezers, hot-holding, etc.)", "Monitoring frequency", "Additional requirements"],
    supplier_approval: ["Business name and type", "Types of suppliers (raw materials, packaging, etc.)", "Approval criteria priorities", "Monitoring frequency", "Additional requirements"],
    allergen_policy: ["Business name and type", "Allergens present or handled", "Customer-facing context (menu, labels, etc.)", "Additional requirements"],
  };

  const fields = labels[documentType] ?? [];
  const details = answers
    .map((ans, i) => `${fields[i] ?? `Detail ${i + 1}`}: ${ans}`)
    .join("\n");

  return `Generate a ${documentType.replace(/_/g, " ")} document for the following business:

${details}`;
}
