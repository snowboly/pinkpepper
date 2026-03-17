export type TemperatureLogMetadata = {
  premises: string;
  docNo: string;
  revision: string;
  issueDate: string;      // document generation date (ISO)
  month: string;          // e.g. "March"
  year: string;           // e.g. "2026"
  unitId: string;         // Chamber / Cold Store ID — filled in on the form
  probeLocation: string;  // (*) probe location note — filled in on the form
  targetRange: string;    // e.g. "0°C to 5°C (fridge) | ≤ −18°C (freezer)"
  checksPerDay: number;   // how many readings per day (1–4)
  probeCount: number;     // how many probe/sensor columns per reading (1–4)
};

export type TemperatureLogData = {
  metadata: TemperatureLogMetadata;
};

export const DEFAULT_TARGET_RANGE = "0°C to 5°C (fridge)  |  ≤ −18°C (freezer)";
export const DEFAULT_CHECKS_PER_DAY = 2;
export const DEFAULT_PROBE_COUNT = 2;

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function currentMonth(): string {
  return new Date().toLocaleString("en-GB", { month: "long" });
}

export function currentYear(): string {
  return String(new Date().getFullYear());
}
