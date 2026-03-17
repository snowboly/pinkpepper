export type CleaningSopMetadata = {
  businessName: string;
  premises: string;
  docNo: string;
  revision: string;
  date: string;
  approvedBy: string;
  reviewDate: string;
};

export type CleaningSopRoleRow = {
  role: string;
  responsibility: string;
};

export type CleaningSopDefinitionRow = {
  term: string;
  definition: string;
};

export type CleaningSopChemicalRow = {
  chemical: string;
  purpose: string;
  dilution: string;
  contactTime: string;
  activeIngredient: string;
};

export type CleaningSopFrequencyRow = {
  itemArea: string;
  method: string;
  frequency: string;
  responsible: string;
};

export type CleaningSopAtpRow = {
  surfaceCategory: string;
  pass: string;
  borderline: string;
  fail: string;
};

export type CleaningSopRecordRow = {
  record: string;
  location: string;
  retention: string;
};

export type CleaningSopData = {
  metadata: CleaningSopMetadata;
  scope: string;
  responsibilities: CleaningSopRoleRow[];
  definitions: CleaningSopDefinitionRow[];
  chemicals: CleaningSopChemicalRow[];
  standardProcedure: string[];
  nonFoodContactProcedure: string[];
  frequencySchedule: CleaningSopFrequencyRow[];
  verificationVisual: string[];
  verificationAtp: CleaningSopAtpRow[];
  corrective: string[];
  records: CleaningSopRecordRow[];
};

export const DEFAULT_RESPONSIBILITIES: CleaningSopRoleRow[] = [
  { role: "Business Owner / Manager", responsibility: "Ensure adequate resources (chemicals, equipment, time) are provided; review SOP annually" },
  { role: "Supervisor / Team Leader", responsibility: "Monitor compliance; conduct verification checks; arrange corrective action" },
  { role: "Food Handlers / Cleaning Operatives", responsibility: "Carry out cleaning tasks as scheduled; report deficiencies" },
  { role: "Technical / Quality Manager", responsibility: "Validate cleaning effectiveness (ATP, swabs); update SOP on change" },
];

export const DEFAULT_DEFINITIONS: CleaningSopDefinitionRow[] = [
  { term: "Cleaning", definition: "Removal of dirt, grease, and food residues from a surface" },
  { term: "Disinfection", definition: "Reduction of microorganisms to a level that does not compromise food safety" },
  { term: "Sanitising", definition: "Combined cleaning and disinfection in one step (where a validated product is used)" },
];

export const DEFAULT_CHEMICALS: CleaningSopChemicalRow[] = [
  { chemical: "[General detergent]", purpose: "Routine cleaning", dilution: "[e.g. 1:100]", contactTime: "[e.g. 2 min]", activeIngredient: "[e.g. Anionic surfactant]" },
  { chemical: "[Surface sanitiser]", purpose: "Food-contact disinfection", dilution: "[As label]", contactTime: "[e.g. 30 sec]", activeIngredient: "[e.g. QAC / Hypochlorite]" },
  { chemical: "[Degreaser]", purpose: "Heavy soil / grease removal", dilution: "[e.g. 1:50]", contactTime: "[e.g. 5 min]", activeIngredient: "[e.g. Alkaline + solvent]" },
  { chemical: "[Oven cleaner]", purpose: "Oven / grill deep clean", dilution: "[Neat]", contactTime: "[e.g. 30 min]", activeIngredient: "[e.g. Strong alkaline]" },
];

export const DEFAULT_STANDARD_PROCEDURE: string[] = [
  "Remove loose debris and food residues (scrape, sweep, or wipe)",
  "Pre-rinse with warm water to loosen remaining soil",
  "Apply detergent at correct dilution using a clean cloth or spray",
  "Scrub / agitate to lift grease and residues; pay attention to joints and edges",
  "Rinse thoroughly with clean water to remove detergent",
  "Apply disinfectant at correct dilution; allow full contact time as per product label",
  "Final rinse (if required by product instructions)",
  "Air-dry — do not use tea towels on sanitised surfaces",
];

export const DEFAULT_NON_FOOD_CONTACT_PROCEDURE: string[] = [
  "Sweep or vacuum to remove debris",
  "Mop or wipe with detergent solution",
  "Rinse if required",
  "Apply disinfectant where specified (e.g. toilet areas, handwash stations)",
  "Allow to air-dry",
];

export const DEFAULT_FREQUENCY_SCHEDULE: CleaningSopFrequencyRow[] = [
  { itemArea: "Food preparation worktops", method: "Two-stage clean", frequency: "Between tasks and end of day", responsible: "Food handlers" },
  { itemArea: "Chopping boards", method: "Dishwasher or two-stage clean", frequency: "After each use", responsible: "Food handlers" },
  { itemArea: "Knives and utensils", method: "Dishwasher (≥60°C)", frequency: "After each use", responsible: "Food handlers" },
  { itemArea: "Floors (kitchen / production)", method: "Sweep + mop with degreaser + disinfect", frequency: "Daily (end of operations)", responsible: "Cleaning operative" },
  { itemArea: "Fridge interior", method: "Sanitiser wipe; full clean weekly", frequency: "Daily spills / weekly full", responsible: "Cleaning operative" },
  { itemArea: "Freezer interior", method: "Wipe exterior; defrost and clean as needed", frequency: "Weekly exterior / periodic full", responsible: "Cleaning operative" },
  { itemArea: "Oven / grill", method: "Oven cleaner; deep clean", frequency: "Weekly (or per schedule)", responsible: "Cleaning operative" },
  { itemArea: "Handwash sinks", method: "Sanitiser clean", frequency: "Daily minimum", responsible: "Cleaning operative" },
  { itemArea: "Drains", method: "Drain cleaner + flush", frequency: "Weekly", responsible: "Cleaning operative" },
  { itemArea: "Toilets and welfare areas", method: "Disinfectant clean", frequency: "Daily (minimum)", responsible: "Cleaning operative" },
  { itemArea: "Waste bins (internal)", method: "Empty, wash, disinfect", frequency: "Daily", responsible: "Cleaning operative" },
  { itemArea: "Ventilation / extraction filters", method: "Degrease; deep clean", frequency: "Weekly / monthly", responsible: "Maintenance" },
];

export const DEFAULT_VERIFICATION_VISUAL: string[] = [
  "Supervisors must visually inspect cleaned surfaces after each shift",
  "Any visible soil, grease, or residues = fail → re-clean before production",
];

export const DEFAULT_VERIFICATION_ATP: CleaningSopAtpRow[] = [
  { surfaceCategory: "Food-contact (high-risk)", pass: "<10 RLU", borderline: "10–25 RLU", fail: ">25 RLU" },
  { surfaceCategory: "Food-contact (general)", pass: "<50 RLU", borderline: "50–100 RLU", fail: ">100 RLU" },
  { surfaceCategory: "Environmental", pass: "<100 RLU", borderline: "100–200 RLU", fail: ">200 RLU" },
];

export const DEFAULT_CORRECTIVE: string[] = [
  "Re-clean using the full procedure",
  "Re-verify before food production resumes",
  "Record the failure and corrective action taken",
  "Investigate root cause (wrong dilution, missed step, damaged surface, untrained operative)",
  "Retrain operative if procedural failure identified",
  "Review SOP if systematic or repeat failures occur",
];

export const DEFAULT_CLEANING_SOP_RECORDS: CleaningSopRecordRow[] = [
  { record: "Daily cleaning schedule sign-off", location: "Kitchen folder", retention: "3 months" },
  { record: "ATP / swab verification results", location: "Technical file", retention: "12 months" },
  { record: "Corrective action records", location: "Technical file", retention: "12 months" },
  { record: "COSHH data sheets", location: "Safety folder", retention: "Current + 1 year" },
  { record: "Training records (cleaning)", location: "HR / Technical file", retention: "Duration of employment" },
];
