export type HaccpHazardType = "Biological" | "Chemical" | "Physical" | "Allergen";
export type YesNo = "Yes" | "No";

export type HaccpMetadata = {
  companyName: string;
  logoUrl?: string | null;
  version: string;
  date: string;
  createdBy: string;
  approvedBy: string;
};

export type HaccpProcessStep = {
  stepNo: number;
  stepName: string;
  fullStepDescription: string;
};

export type HaccpHazardRow = {
  stepNo: number;
  stepName: string;
  hazardType: HaccpHazardType;
  hazardDescription: string;
  controlMeasure: string;
  isCcp: YesNo;
};

export type HaccpCcpRow = {
  ccpNo: number;
  stepName: string;
  hazard: string;
  criticalLimit: string;
  monitoring: string;
  correctiveAction: string;
};

export type HaccpDocumentData = {
  metadata: HaccpMetadata;
  processFlow: string[];
  steps: HaccpProcessStep[];
  hazards: HaccpHazardRow[];
  ccps: HaccpCcpRow[];
};

const HAZARD_TYPES: HaccpHazardType[] = ["Biological", "Chemical", "Physical", "Allergen"];

export function normalizeHazardType(input: string): HaccpHazardType {
  const normalized = input.trim().toLowerCase();
  const match = HAZARD_TYPES.find((value) => value.toLowerCase() === normalized);

  if (!match) {
    throw new Error("Unsupported hazard type");
  }

  return match;
}

export function shouldRenderCcpSection(data: Pick<HaccpDocumentData, "hazards">): boolean {
  return data.hazards.some((hazard) => hazard.isCcp === "Yes");
}
