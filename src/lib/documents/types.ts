/**
 * Structured HACCP document types.
 * The LLM generates these JSON structures; templates render them into DOCX/PDF.
 */

export type HACCPProcessStep = {
  step: string;
  hazard: string;
  hazard_type: "biological" | "chemical" | "physical" | "allergen";
  control_measure: string;
  monitoring: string;
};

export type CriticalControlPoint = {
  ccp_number: number;
  name: string;
  hazard: string;
  critical_limit: string;
  monitoring_procedure: string;
  monitoring_frequency: string;
  corrective_action: string;
  verification: string;
  records: string;
};

export type HACCPPlanData = {
  document_type: "haccp_plan";
  version: string;
  date: string;
  business_name: string;
  business_address?: string;
  product_description: string;
  intended_use: string;
  target_consumer?: string;
  process_steps: HACCPProcessStep[];
  ccps: CriticalControlPoint[];
  prerequisite_programmes?: string[];
  review_frequency?: string;
  approved_by?: string;
};

export type SOPStep = {
  step_number: number;
  action: string;
  details: string;
  responsible?: string;
};

export type SOPData = {
  document_type: "sop";
  version: string;
  date: string;
  business_name: string;
  title: string;
  purpose: string;
  scope: string;
  responsibilities: string[];
  equipment_materials?: string[];
  steps: SOPStep[];
  monitoring?: string;
  corrective_actions?: string;
  records?: string[];
  references?: string[];
  approved_by?: string;
};

export type CleaningLogEntry = {
  area: string;
  task: string;
  frequency: string;
  method: string;
  chemical: string;
  concentration: string;
  contact_time: string;
  responsible: string;
};

export type CleaningScheduleData = {
  document_type: "cleaning_schedule";
  version: string;
  date: string;
  business_name: string;
  entries: CleaningLogEntry[];
  approved_by?: string;
};

export type TemperatureLogColumn = {
  location: string;
  equipment: string;
  target_temp: string;
  acceptable_range: string;
  frequency: string;
  corrective_action: string;
};

export type TemperatureLogData = {
  document_type: "temperature_log";
  version: string;
  date: string;
  business_name: string;
  columns: TemperatureLogColumn[];
  approved_by?: string;
};

export type SupplierRecord = {
  supplier_name: string;
  products_supplied: string;
  approval_status: string;
  last_audit_date?: string;
  certificates_held?: string;
  next_review_date?: string;
};

export type SupplierApprovalData = {
  document_type: "supplier_approval";
  version: string;
  date: string;
  business_name: string;
  suppliers: SupplierRecord[];
  approval_criteria?: string[];
  approved_by?: string;
};

export type StructuredDocument =
  | HACCPPlanData
  | SOPData
  | CleaningScheduleData
  | TemperatureLogData
  | SupplierApprovalData;

export type DocumentType = StructuredDocument["document_type"];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  haccp_plan: "HACCP Plan",
  sop: "Standard Operating Procedure",
  cleaning_schedule: "Cleaning Schedule",
  temperature_log: "Temperature Monitoring Log",
  supplier_approval: "Supplier Approval List",
};
