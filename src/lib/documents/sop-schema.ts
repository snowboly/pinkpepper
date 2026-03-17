import type { DocumentType } from "./types";

export type SopMetadata = {
  businessName: string;
  docNo: string;
  revision: string;
  date: string;
  approvedBy: string;
};

export type SopDocumentData = {
  metadata: SopMetadata;
  documentType: DocumentType;
};

// Default document numbers per type
const DOC_NUMBERS: Partial<Record<DocumentType, string>> = {
  cleaning_sop: "CL-SOP-001",
  allergen_policy: "AL-POL-001",
  food_safety_policy: "FS-POL-001",
  traceability_procedure: "TR-001",
  pest_control_procedure: "PC-001",
  staff_training_record: "TR-REC-001",
  waste_management_procedure: "WM-001",
  supplier_approval: "SA-001",
  temperature_log: "TL-001",
  personal_hygiene_policy: "PH-001",
};

export function getDefaultDocNo(documentType: DocumentType): string {
  return DOC_NUMBERS[documentType] ?? "SOP-001";
}
