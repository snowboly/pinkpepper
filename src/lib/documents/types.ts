export type DocumentType =
  | "haccp_plan"
  | "cleaning_sop"
  | "temperature_log"
  | "supplier_approval"
  | "allergen_policy"
  | "food_safety_policy"
  | "traceability_procedure"
  | "pest_control_procedure"
  | "staff_training_record"
  | "waste_management_procedure"
  | "personal_hygiene_policy"
  | "cleaning_schedule";

export type DocumentSection = {
  heading: string;
  content: string;
  subsections?: DocumentSection[];
};

export type TableColumn = { header: string };

export type DocumentTable = {
  caption?: string;
  columns: TableColumn[];
  rows: Record<string, string>[];
};

export type GeneratedDocument = {
  documentType: DocumentType;
  title: string;
  documentNumber: string;
  version: string;
  date: string;
  approvedBy: string;
  scope: string;
  sections: DocumentSection[];
  tables?: DocumentTable[];
};
