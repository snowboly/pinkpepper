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

  food_safety_policy: `Generate a comprehensive Food Safety Policy document.
Include: policy statement, scope, management commitment, legal obligations (Reg (EC) 852/2004, Food Safety Act 1990), organisational responsibilities, HACCP commitment, training requirements, monitoring and review schedule, and document control.
This is the overarching policy that underpins the entire food safety management system.`,

  traceability_procedure: `Generate a complete Traceability Procedure.
Include: purpose, scope, legal basis (Reg (EC) 178/2002 Articles 17-20), one-up/one-down traceability requirements, batch coding and labelling, incoming goods recording, internal traceability during processing, dispatch records, recall/withdrawal procedure with decision tree, mock recall testing schedule, and record retention periods.
Include a traceability record template table and a recall contact list template.`,

  pest_control_procedure: `Generate a complete Pest Control Procedure.
Include: purpose, scope, responsibilities, types of pests covered (rodents, insects, birds, stored product insects), prevention measures, monitoring methods (bait stations, fly units, inspection schedule), pest sighting log, corrective actions, contractor management requirements, and record-keeping.
Include a pest monitoring checklist table and pest sighting report template.`,

  staff_training_record: `Generate a Staff Training Record document.
Include: purpose, scope, training requirements by role (food handlers, supervisors, managers), induction training checklist, ongoing training schedule, training topics (food hygiene, allergens, HACCP, cleaning, personal hygiene, pest awareness), competency assessment method, and record-keeping requirements.`,

  waste_management_procedure: `Generate a Waste Management Procedure.
Include: purpose, scope, legal requirements (Annex II Reg (EC) 852/2004, Environmental Protection Act 1990), waste categories (general, food, recyclable, hazardous/oil), segregation and storage requirements, collection frequency and schedules, waste carrier licensing, duty of care requirements, and record-keeping.
Include a waste disposal log template table.`,

  cleaning_schedule: `Generate a Cleaning Schedule and Plan document.
Include: purpose, scope, area-by-area cleaning schedule (kitchen, storage, service areas, toilets, external), cleaning method for each item/area (what to clean, chemical/dilution, method, frequency, responsible person), deep cleaning schedule, equipment cleaning procedures, and verification/sign-off requirements.
Include a daily cleaning schedule table, weekly deep clean schedule table, and a cleaning verification log.`,

  product_data_sheet: `Generate a Product Data Sheet document.
Include: product name and code, product description, ingredients list (in descending order by weight), allergen information (contains/may contain/free from), storage conditions, shelf life (unopened and opened), packaging type and net weight, country of origin, nutritional information table (per 100g), microbiological specification, and customer/regulatory requirements.
Reference EU/UK food labelling requirements (Regulation 1169/2011) where relevant.`,
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
    food_safety_policy: ["Business name and type", "Number of sites/premises", "Key products or services", "Additional requirements"],
    traceability_procedure: ["Business name and type", "Products handled (raw materials, finished goods, etc.)", "Current batch coding/labelling system", "Additional requirements"],
    pest_control_procedure: ["Business name and type", "Premises type and surroundings", "Known pest risks or history", "Current pest control contractor (if any)", "Additional requirements"],
    staff_training_record: ["Business name and type", "Number of staff and roles", "Current training practices", "Additional requirements"],
    waste_management_procedure: ["Business name and type", "Types of waste generated", "Current waste collection arrangements", "Additional requirements"],
    cleaning_schedule: ["Business name and type", "Areas/zones to cover", "Cleaning chemicals available", "Cleaning frequency requirements", "Additional requirements"],
    product_data_sheet: ["Business name and type", "Product name, code/SKU, and category", "Product description and country of origin", "Ingredients list (in descending order by weight)", "Allergen information (contains, may contain, free from)", "Storage conditions and shelf life", "Net weight/volume and packaging type"],
  };

  const fields = labels[documentType] ?? [];
  const details = answers
    .map((ans, i) => `${fields[i] ?? `Detail ${i + 1}`}: ${ans}`)
    .join("\n");

  return `Generate a ${documentType.replace(/_/g, " ")} document for the following business:

${details}`;
}
