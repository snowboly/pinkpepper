export type CleaningScheduleMetadata = {
  premises: string;
  docNo: string;
  revision: string;
  date: string;
  approvedBy: string;
  reviewDate: string;
};

export type DailyCleaningRow = {
  item: string;
  method: string;
  chemical: string;
  dilution: string;
  contactTime: string;
  frequency: string;
  responsible: string;
  verification: string;
};

export type WeeklyCleaningRow = {
  item: string;
  method: string;
  chemical: string;
  dilution: string;
  contactTime: string;
  responsible: string;
  verification: string;
};

export type MonthlyCleaningRow = {
  item: string;
  method: string;
  chemical: string;
  responsible: string;
  verification: string;
};

export type CleaningChemicalRef = {
  chemicalName: string;
  product: string;
  dilution: string;
  contactTime: string;
  activeIngredient: string;
  coshhLocation: string;
};

export type AtpTargetRow = {
  surfaceCategory: string;
  pass: string;
  borderline: string;
  fail: string;
};

export type CleaningScheduleData = {
  metadata: CleaningScheduleMetadata;
  chemicalReference: CleaningChemicalRef[];
  dailyTasks: DailyCleaningRow[];
  weeklyTasks: WeeklyCleaningRow[];
  monthlyTasks: MonthlyCleaningRow[];
  atpTargets: AtpTargetRow[];
};

export const DEFAULT_CHEMICAL_REFERENCE: CleaningChemicalRef[] = [
  { chemicalName: "General detergent", product: "[Product name]", dilution: "1:100", contactTime: "2 min", activeIngredient: "Anionic surfactant", coshhLocation: "Safety folder" },
  { chemicalName: "Degreaser", product: "[Product name]", dilution: "1:50", contactTime: "5 min", activeIngredient: "Alkaline + solvent", coshhLocation: "Safety folder" },
  { chemicalName: "Sanitiser (surface)", product: "[Product name]", dilution: "As directed", contactTime: "30 sec-2 min", activeIngredient: "QAC / hypochlorite", coshhLocation: "Safety folder" },
  { chemicalName: "Disinfectant (food-contact)", product: "[Product name]", dilution: "As directed", contactTime: "30 sec", activeIngredient: "Hypochlorite 1000 ppm", coshhLocation: "Safety folder" },
  { chemicalName: "Oven cleaner", product: "[Product name]", dilution: "Neat", contactTime: "30 min", activeIngredient: "Strong alkaline", coshhLocation: "Safety folder" },
  { chemicalName: "Drain cleaner", product: "[Product name]", dilution: "As directed", contactTime: "15 min", activeIngredient: "Caustic", coshhLocation: "Safety folder" },
];

export const DEFAULT_DAILY_TASKS: DailyCleaningRow[] = [
  { item: "Food preparation worktops (between tasks)", method: "M1", chemical: "Sanitiser", dilution: "As label", contactTime: "30 sec", frequency: "After each task and before change of food type", responsible: "All food handlers", verification: "Visual; supervisor check" },
  { item: "Food preparation worktops (end of day)", method: "M1", chemical: "Detergent + disinfectant", dilution: "As label", contactTime: "2 min", frequency: "Daily (end of operations)", responsible: "Cleaning operative", verification: "Supervisor sign-off" },
  { item: "Chopping boards", method: "M3 or M1", chemical: "Detergent + sanitiser", dilution: "As label", contactTime: "30 sec / cycle", frequency: "After each use; full wash end of day", responsible: "Food handlers / cleaning", verification: "Visual; supervisor check" },
  { item: "Knives and utensils", method: "M3", chemical: "Dishwasher", dilution: "-", contactTime: "60C wash", frequency: "After each use", responsible: "Food handlers", verification: "Visual" },
  { item: "Floors (food production/kitchen)", method: "M1", chemical: "Degreaser + disinfectant", dilution: "As label", contactTime: "2 min", frequency: "Daily (end of operations)", responsible: "Cleaning operative", verification: "Visual; supervisor check" },
  { item: "Handwash sinks", method: "M1", chemical: "Sanitiser", dilution: "As label", contactTime: "30 sec", frequency: "Minimum daily; inspect throughout day", responsible: "Cleaning operative", verification: "Visual" },
  { item: "Fridges (door handles and seals)", method: "M6", chemical: "Sanitiser", dilution: "As label", contactTime: "30 sec", frequency: "Daily", responsible: "Cleaning operative", verification: "Visual" },
  { item: "Bin lids and external surfaces", method: "M6", chemical: "Disinfectant", dilution: "As label", contactTime: "2 min", frequency: "Daily", responsible: "Cleaning operative", verification: "Visual" },
  { item: "Taps and handles (food area)", method: "M6", chemical: "Sanitiser", dilution: "As label", contactTime: "30 sec", frequency: "Daily", responsible: "Cleaning operative", verification: "Visual" },
];

export const DEFAULT_WEEKLY_TASKS: WeeklyCleaningRow[] = [
  { item: "Fridge interior (full deep clean)", method: "M1", chemical: "Detergent + food-safe disinfectant", dilution: "As label", contactTime: "2 min", responsible: "Cleaning operative", verification: "Supervisor sign-off" },
  { item: "Freezer interior (external wipe; full defrost when required)", method: "M5 or M1", chemical: "Food-safe disinfectant", dilution: "As label", contactTime: "2 min", responsible: "Cleaning operative", verification: "Supervisor check" },
  { item: "Oven interior", method: "M2 or M5", chemical: "Oven cleaner", dilution: "Neat or as label", contactTime: "30 min", responsible: "Cleaning operative", verification: "Visual; supervisor check" },
  { item: "Under and behind equipment (movable)", method: "M1", chemical: "Degreaser + disinfectant", dilution: "As label", contactTime: "2 min", responsible: "Cleaning operative", verification: "Supervisor sign-off" },
  { item: "Drains", method: "M1 + drain cleaner", chemical: "Drain cleaner", dilution: "As label", contactTime: "15 min", responsible: "Cleaning operative", verification: "Supervisor check" },
  { item: "Walls (food preparation areas)", method: "M1", chemical: "Sanitiser", dilution: "As label", contactTime: "2 min", responsible: "Cleaning operative", verification: "Visual" },
  { item: "Waste bins (internal)", method: "M1", chemical: "Disinfectant", dilution: "As label", contactTime: "2 min", responsible: "Cleaning operative", verification: "Visual" },
  { item: "Storage racking and shelving", method: "M1 or M6", chemical: "Detergent + sanitiser", dilution: "As label", contactTime: "2 min", responsible: "Cleaning operative", verification: "Visual" },
];

export const DEFAULT_MONTHLY_TASKS: MonthlyCleaningRow[] = [
  { item: "Deep clean of all kitchen equipment (internal mechanisms, gaskets)", method: "M1 or M4", chemical: "Detergent + disinfectant", responsible: "Cleaning operative + maintenance", verification: "Supervisor sign-off; ATP swab" },
  { item: "Ventilation hoods and duct inspections", method: "M2", chemical: "Degreaser", responsible: "Maintenance or specialist contractor", verification: "Contractor report" },
  { item: "Cold room walls and ceiling", method: "M1", chemical: "Food-safe disinfectant", responsible: "Cleaning operative", verification: "Supervisor sign-off" },
  { item: "Drain inspection and deep clean", method: "Specialist", chemical: "Drain jetter + cleaner", responsible: "Contractor / cleaning operative", verification: "Visual; flow test" },
];

export const DEFAULT_ATP_TARGETS: AtpTargetRow[] = [
  { surfaceCategory: "Food-contact surfaces (high-risk)", pass: "<10 RLU", borderline: "10-25 RLU", fail: ">25 RLU" },
  { surfaceCategory: "Food-contact surfaces (general)", pass: "<50 RLU", borderline: "50-100 RLU", fail: ">100 RLU" },
  { surfaceCategory: "Environmental (non-food contact)", pass: "<100 RLU", borderline: "100-200 RLU", fail: ">200 RLU" },
];
