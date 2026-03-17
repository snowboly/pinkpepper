import type { HaccpDocumentData } from "./haccp-schema";
import type { CleaningScheduleData } from "./cleaning-schedule-schema";
import type { TemperatureLogData } from "./temperature-log-schema";
import type { SopDocumentData } from "./sop-schema";
import type { TrainingRecordData } from "./training-record-schema";
import type { ProductDataSheetData } from "./product-data-sheet-schema";

export type DocumentType =
  | "haccp_plan"
  | "cleaning_sop"
  | "temperature_log"
  | "food_safety_policy"
  | "traceability_procedure"
  | "pest_control_procedure"
  | "staff_training_record"
  | "waste_management_procedure"
  | "cleaning_schedule"
  | "product_data_sheet";

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
  haccpData?: HaccpDocumentData;
  cleaningScheduleData?: CleaningScheduleData;
  temperatureLogData?: TemperatureLogData;
  sopData?: SopDocumentData;
  trainingRecordData?: TrainingRecordData;
  productDataSheetData?: ProductDataSheetData;
};
