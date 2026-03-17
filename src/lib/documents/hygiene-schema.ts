export type HygieneMetadata = {
  businessName: string;
  docNo: string;
  revision: string;
  date: string;
  approvedBy: string;
  reviewDate: string;
};

export type HygieneClothingRow = {
  item: string;
  requirement: string;
};

export type HygieneJewelleryRow = {
  item: string;
  rule: string;
};

export type HygieneIllnessRow = {
  symptomCondition: string;
  action: string;
};

export type HygieneMonitoringRow = {
  check: string;
  frequency: string;
  responsible: string;
};

export type HygieneReturnToWorkField = {
  field: string;
  detail: string;
};

export type HygieneRecordRow = {
  record: string;
  location: string;
  retention: string;
};

export type HygienePolicyData = {
  metadata: HygieneMetadata;
  scope: string;
  handwashingWhen: string[];
  handwashingHow: string[];
  handwashingFacilities: string[];
  protectiveClothing: HygieneClothingRow[];
  jewellery: HygieneJewelleryRow[];
  illnessReporting: HygieneIllnessRow[];
  cutsAndWounds: string[];
  visitorRules: string[];
  monitoring: HygieneMonitoringRow[];
  returnToWorkForm: HygieneReturnToWorkField[];
  records: HygieneRecordRow[];
};

export const DEFAULT_HANDWASHING_WHEN: string[] = [
  "On entering a food handling area",
  "After using the toilet",
  "After handling raw food (especially raw meat, poultry, fish, eggs)",
  "After handling waste or waste bins",
  "After cleaning tasks",
  "After touching face, hair, nose, or mouth",
  "After sneezing, coughing, or blowing nose",
  "After smoking, eating, or drinking",
  "After handling packaging, cardboard, or non-food items",
  "After handling money",
  "After any break from food handling",
];

export const DEFAULT_HANDWASHING_HOW: string[] = [
  "Wet hands under warm running water",
  "Apply liquid antibacterial soap from a dispenser",
  "Rub hands together for at least 20 seconds — covering all surfaces (palms, backs of hands, between fingers, thumbs, fingertips, wrists)",
  "Rinse thoroughly under clean running water",
  "Dry hands completely using single-use paper towels or a warm-air dryer",
  "Use a paper towel to turn off taps (if not sensor-operated)",
];

export const DEFAULT_HANDWASHING_FACILITIES: string[] = [
  "Dedicated for handwashing only (not used for food preparation or equipment washing)",
  "Supplied with hot and cold (or warm) running water",
  "Stocked with liquid antibacterial soap and paper towels at all times",
  "Located at entry to food areas and near toilet facilities",
];

export const DEFAULT_PROTECTIVE_CLOTHING: HygieneClothingRow[] = [
  { item: "Clean uniform / whites", requirement: "Changed daily or when soiled; not worn outside the premises" },
  { item: "Apron", requirement: "Clean apron worn over uniform during food handling; changed when soiled or between tasks" },
  { item: "Hair covering", requirement: "Hair net, hat, or snood covering all head hair; beard snoods for facial hair" },
  { item: "Footwear", requirement: "Clean, enclosed, non-slip safety shoes; not worn outside the premises" },
  { item: "Gloves (if used)", requirement: "Single-use; changed between tasks and when torn; hands washed before and after use" },
];

export const DEFAULT_JEWELLERY: HygieneJewelleryRow[] = [
  { item: "Jewellery", rule: "No jewellery in food areas (exception: plain wedding band and sleeper earrings, subject to risk assessment)" },
  { item: "Watches", rule: "Not permitted in food handling areas" },
  { item: "Nail polish / false nails", rule: "Not permitted" },
  { item: "Nails", rule: "Short, clean, unvarnished" },
  { item: "Perfume / aftershave", rule: "Strong fragrances avoided; risk of taint to food" },
  { item: "Mobile phones", rule: "Not permitted in food handling areas" },
  { item: "Personal medication", rule: "Stored in locker; not brought into food areas (except epinephrine auto-injectors with manager approval)" },
];

export const DEFAULT_ILLNESS_REPORTING: HygieneIllnessRow[] = [
  { symptomCondition: "Vomiting", action: "Exclude from food handling; do not return until 48 hours symptom-free" },
  { symptomCondition: "Diarrhoea", action: "Exclude from food handling; do not return until 48 hours symptom-free" },
  { symptomCondition: "Nausea / stomach cramps", action: "Assess; exclude if vomiting/diarrhoea develops" },
  { symptomCondition: "Jaundice", action: "Exclude; seek medical advice; notify EHO" },
  { symptomCondition: "Sore throat with fever", action: "Assess; exclude from open food handling" },
  { symptomCondition: "Infected skin lesion (boils, septic cuts)", action: "Exclude or cover with blue waterproof dressing and glove" },
  { symptomCondition: "Ear, eye, or nose discharge", action: "Assess; exclude if discharge cannot be contained" },
  { symptomCondition: "Contact with infectious disease (household member)", action: "Assess; monitor for symptoms; exclude if symptoms develop" },
  { symptomCondition: "Recent travel to high-risk area with GI illness", action: "Assess; stool testing may be required" },
];

export const DEFAULT_CUTS_AND_WOUNDS: string[] = [
  "Report any cut, wound, or skin abrasion to supervisor immediately",
  "Clean the wound thoroughly",
  "Cover with a blue detectable waterproof dressing (metal-detectable type preferred)",
  "Wear a disposable glove over the dressing if the wound is on a hand",
  "Change the dressing regularly and if it becomes wet, loose, or soiled",
  "Exclude from food handling if the wound cannot be adequately covered",
];

export const DEFAULT_VISITOR_RULES: string[] = [
  "Sign in at reception",
  "Be briefed on hygiene requirements before entry",
  "Wear protective clothing (provided): coat, hair net, overshoes (as required)",
  "Remove jewellery and watches",
  "Wash hands on entry to food areas",
  "Be accompanied by a member of staff at all times",
  "Declare any illness symptoms (vomiting, diarrhoea) — entry refused if symptomatic",
];

export const DEFAULT_MONITORING: HygieneMonitoringRow[] = [
  { check: "Visual hygiene checks (clothing, hair nets, handwashing)", frequency: "Every shift", responsible: "Supervisor" },
  { check: "Handwash station supplies check", frequency: "Daily", responsible: "Cleaning operative / supervisor" },
  { check: "Staff illness log review", frequency: "Weekly", responsible: "Manager" },
  { check: "Hygiene training refresher", frequency: "Annually (or on concern)", responsible: "Manager / Trainer" },
  { check: "Audit of protective clothing condition", frequency: "Monthly", responsible: "Supervisor" },
];

export const DEFAULT_RETURN_TO_WORK_FORM: HygieneReturnToWorkField[] = [
  { field: "Employee name", detail: "_______________" },
  { field: "Date of absence", detail: "_______________" },
  { field: "Symptoms experienced", detail: "Vomiting / Diarrhoea / Jaundice / Skin infection / Other" },
  { field: "Date symptoms ceased", detail: "_______________" },
  { field: "48-hour symptom-free period observed", detail: "Yes / No" },
  { field: "GP / medical clearance obtained", detail: "Yes / No / Not required" },
  { field: "Stool sample submitted (if required)", detail: "Yes / No / Not required" },
  { field: "Fit to return to food handling duties", detail: "Yes / No — alternative duties assigned" },
  { field: "Employee signature", detail: "_______________" },
  { field: "Manager signature", detail: "_______________" },
  { field: "Date of return", detail: "_______________" },
];

export const DEFAULT_RECORDS: HygieneRecordRow[] = [
  { record: "Staff illness / absence log", location: "HR / Manager's file", retention: "12 months" },
  { record: "Return-to-work fitness forms", location: "HR file", retention: "Duration of employment" },
  { record: "Hygiene training records", location: "Training file", retention: "Duration of employment" },
  { record: "Visitor sign-in log", location: "Reception / office", retention: "12 months" },
  { record: "Non-compliance / disciplinary records", location: "HR file", retention: "Per HR policy" },
];
