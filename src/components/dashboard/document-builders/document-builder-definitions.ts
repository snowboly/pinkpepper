import { buildHaccpWizardDefinition } from "@/lib/documents/haccp-wizard";
import {
  buildSharedDocumentMetadataFields,
  getSharedDocumentMetadataDefaults,
} from "./shared-document-metadata";
import { createRowBuilderConfig } from "./shared-row-builder";
import type {
  DocumentBuilderDefinition,
  DocumentBuilderField,
  DocumentBuilderSection,
} from "./document-builder-types";

function createSection(key: string, title: string, fields: DocumentBuilderField[]): DocumentBuilderSection {
  return { key, title, fields };
}

function createMetadataSection(fields: DocumentBuilderField[]): DocumentBuilderSection {
  return createSection("metadata", "Document metadata", fields);
}

const HACCP_WIZARD = buildHaccpWizardDefinition();

const TEMPERATURE_LOG_METADATA_FIELDS = buildSharedDocumentMetadataFields({
  includeVersion: false,
  includeDate: false,
  includeCreatedBy: true,
  includeApprovedBy: true,
  includeReviewDate: false,
});

const TEMPERATURE_LOG_CONTENT_FIELDS: DocumentBuilderField[] = [
  {
    key: "logType",
    label: "Log type",
    type: "select",
    required: true,
    defaultValue: "Fridge",
    options: [
      { label: "Fridge", value: "Fridge" },
      { label: "Freezer", value: "Freezer" },
      { label: "Hot hold", value: "Hot hold" },
      { label: "Cooking", value: "Cooking" },
      { label: "Delivery", value: "Delivery" },
      { label: "Custom", value: "Custom" },
    ],
  },
  {
    key: "targetRange",
    label: "Target temperature range or critical limit",
    type: "text",
    required: true,
    defaultValue: "0C to 4C",
  },
  { key: "unitId", label: "Unit or area being monitored", type: "text", required: true },
  {
    key: "checksPerDay",
    label: "Checks per day",
    type: "select",
    required: true,
    defaultValue: "2",
    options: [
      { label: "1", value: "1" },
      { label: "2", value: "2" },
      { label: "3", value: "3" },
      { label: "4", value: "4" },
    ],
  },
  {
    key: "probeCount",
    label: "Readings per check",
    type: "select",
    required: true,
    defaultValue: "2",
    options: [
      { label: "1", value: "1" },
      { label: "2", value: "2" },
      { label: "3", value: "3" },
      { label: "4", value: "4" },
    ],
  },
  { key: "probeLocation", label: "Probe location / note", type: "text", required: true },
  { key: "month", label: "Month", type: "text", required: true },
  { key: "year", label: "Year", type: "text", required: true },
];

const CLEANING_SCHEDULE_METADATA_FIELDS = buildSharedDocumentMetadataFields({
  includeVersion: false,
  includeDate: false,
  includeCreatedBy: false,
  includeApprovedBy: true,
  includeReviewDate: true,
});

const CHEMICAL_REFERENCE_ROWS = createRowBuilderConfig({
  key: "chemicalReference",
  label: "Cleaning chemicals",
  columns: [
    { key: "chemicalName", label: "Chemical name", required: true },
    { key: "product", label: "Product", required: true },
    { key: "dilution", label: "Dilution", required: true },
    { key: "contactTime", label: "Contact time", required: true },
    { key: "activeIngredient", label: "Active ingredient", required: true },
    { key: "coshhLocation", label: "COSHH location", required: true },
  ],
});

const DAILY_TASK_ROWS = createRowBuilderConfig({
  key: "dailyTasks",
  label: "Daily tasks",
  columns: [
    { key: "item", label: "Item / area", required: true },
    { key: "method", label: "Method code", required: true },
    { key: "chemical", label: "Chemical", required: true },
    { key: "dilution", label: "Dilution", required: true },
    { key: "contactTime", label: "Contact time", required: true },
    { key: "frequency", label: "Frequency", required: true },
    { key: "responsible", label: "Responsible", required: true },
    { key: "verification", label: "Verification", required: true },
  ],
});

const WEEKLY_TASK_ROWS = createRowBuilderConfig({
  key: "weeklyTasks",
  label: "Weekly tasks",
  columns: [
    { key: "item", label: "Item / area", required: true },
    { key: "method", label: "Method code", required: true },
    { key: "chemical", label: "Chemical", required: true },
    { key: "dilution", label: "Dilution", required: true },
    { key: "contactTime", label: "Contact time", required: true },
    { key: "responsible", label: "Responsible", required: true },
    { key: "verification", label: "Verification", required: true },
  ],
});

const MONTHLY_TASK_ROWS = createRowBuilderConfig({
  key: "monthlyTasks",
  label: "Monthly tasks",
  columns: [
    { key: "item", label: "Item / area", required: true },
    { key: "method", label: "Method code", required: true },
    { key: "chemical", label: "Chemical", required: true },
    { key: "responsible", label: "Responsible", required: true },
    { key: "verification", label: "Verification", required: true },
  ],
});

const ATP_TARGET_ROWS = createRowBuilderConfig({
  key: "atpTargets",
  label: "ATP targets",
  columns: [
    { key: "surfaceCategory", label: "Surface category", required: true },
    { key: "pass", label: "Pass", required: true },
    { key: "borderline", label: "Borderline", required: true },
    { key: "fail", label: "Fail", required: true },
  ],
});

const STANDARD_CHEMICAL_ROWS = createRowBuilderConfig({
  key: "chemicals",
  label: "Chemicals",
  columns: [
    { key: "product", label: "Product", required: true },
    { key: "purpose", label: "Purpose", required: true },
    { key: "dilution", label: "Dilution", required: true },
    { key: "contactTime", label: "Contact time", required: true },
  ],
});

const SIMPLE_RECORD_ROWS = createRowBuilderConfig({
  key: "records",
  label: "Records",
  columns: [
    { key: "recordName", label: "Record", required: true },
    { key: "owner", label: "Owner", required: true },
  ],
});

const QUALIFICATION_ROWS = createRowBuilderConfig({
  key: "qualifications",
  label: "Qualifications",
  columns: [
    { key: "qualification", label: "Qualification", required: true },
    { key: "level", label: "Level", required: false },
    { key: "provider", label: "Provider", required: false },
    { key: "dateAchieved", label: "Date achieved", required: false },
    { key: "certificateNumber", label: "Certificate number", required: false },
    { key: "expiryDate", label: "Expiry date", required: false },
  ],
});

const TRAINING_LOG_ROWS = createRowBuilderConfig({
  key: "trainingLogRows",
  label: "Training rows",
  columns: [
    { key: "date", label: "Date", required: true },
    { key: "topic", label: "Task / topic", required: true },
    { key: "trainer", label: "Trainer", required: true },
    { key: "duration", label: "Duration", required: false },
    { key: "assessment", label: "Assessment", required: false },
    { key: "status", label: "Signature / status", required: false },
  ],
});

const NUTRITION_ROWS = createRowBuilderConfig({
  key: "nutritionRows",
  label: "Nutrition values",
  columns: [
    { key: "nutrient", label: "Nutrient", required: true },
    { key: "value", label: "Value", required: true },
  ],
});

const MICROBIOLOGY_ROWS = createRowBuilderConfig({
  key: "microbiologyRows",
  label: "Microbiology rows",
  columns: [
    { key: "parameter", label: "Parameter", required: true },
    { key: "limit", label: "Limit", required: true },
    { key: "method", label: "Method", required: false },
    { key: "frequency", label: "Frequency", required: false },
  ],
});

const PRODUCT_METADATA_FIELDS = buildSharedDocumentMetadataFields({
  includeVersion: false,
  includeDate: true,
  includeCreatedBy: false,
  includeApprovedBy: true,
  includeReviewDate: false,
});

const TRAINING_METADATA_FIELDS = buildSharedDocumentMetadataFields({
  includeVersion: false,
  includeDate: true,
  includeCreatedBy: false,
  includeApprovedBy: true,
  includeReviewDate: false,
});

const SOP_METADATA_FIELDS = buildSharedDocumentMetadataFields({
  includeVersion: false,
  includeDate: true,
  includeCreatedBy: false,
  includeApprovedBy: true,
  includeReviewDate: true,
});

const PRODUCT_DATA_SHEET_FIELDS: DocumentBuilderField[] = [
  { key: "productName", label: "Product name", type: "text", required: true },
  { key: "productCode", label: "Product code / SKU", type: "text", required: true },
  { key: "category", label: "Product category", type: "text", required: true },
  { key: "description", label: "Product description", type: "text", required: true },
  { key: "countryOfOrigin", label: "Country of origin", type: "text", required: true },
  { key: "ingredients", label: "Ingredients list", type: "text", required: true },
  { key: "allergenContains", label: "Contains", type: "text", required: false },
  { key: "allergenMayContain", label: "May contain", type: "text", required: false },
  { key: "allergenFreeFrom", label: "Free from", type: "text", required: false },
  { key: "storageConditions", label: "Storage conditions", type: "text", required: true, defaultValue: "Keep refrigerated at 0C to 4C" },
  { key: "shelfLifeUnopened", label: "Shelf life unopened", type: "text", required: true },
  { key: "shelfLifeOpened", label: "Shelf life once opened", type: "text", required: false },
  { key: "netWeight", label: "Net weight / volume", type: "text", required: false },
  { key: "packagingType", label: "Packaging type", type: "text", required: false },
];

const TRAINING_RECORD_FIELDS: DocumentBuilderField[] = [
  { key: "employeeName", label: "Employee name", type: "text", required: true },
  { key: "jobRole", label: "Job role", type: "text", required: true },
  { key: "department", label: "Department", type: "text", required: true },
  { key: "startDate", label: "Start date", type: "date", required: true },
  {
    key: "inductionCompleted",
    label: "Induction completed",
    type: "select",
    required: true,
    defaultValue: "Yes",
    options: [
      { label: "Yes", value: "Yes" },
      { label: "No", value: "No" },
    ],
  },
  { key: "inductionDate", label: "Induction date", type: "date", required: false },
  { key: "trainerName", label: "Trainer name", type: "text", required: false },
  {
    key: "inductionAssessment",
    label: "Induction assessment",
    type: "select",
    required: false,
    options: [
      { label: "Competent", value: "Competent" },
      { label: "Further training required", value: "Further training required" },
    ],
  },
];

const CLEANING_SOP_FIELDS: DocumentBuilderField[] = [
  { key: "premises", label: "Area or operation covered", type: "text", required: true },
  { key: "purpose", label: "Purpose of the SOP", type: "text", required: false },
  { key: "cleaningOwner", label: "Who carries out cleaning", type: "text", required: true },
  { key: "verificationOwner", label: "Who verifies cleaning", type: "text", required: true },
  { key: "surfacesCovered", label: "Surfaces / equipment covered", type: "text", required: true },
  { key: "cleaningFrequencies", label: "Cleaning frequencies", type: "text", required: false },
  { key: "standardMethod", label: "Core cleaning method", type: "text", required: false },
  { key: "verificationMethod", label: "Verification method", type: "text", required: false },
  { key: "correctiveAction", label: "Corrective action", type: "text", required: false },
];

const TRACEABILITY_FIELDS: DocumentBuilderField[] = [
  { key: "operationType", label: "Business type / operation", type: "text", required: true },
  { key: "productCategories", label: "Products or categories covered", type: "text", required: true },
  { key: "supplierInputs", label: "Supplier inputs to trace", type: "text", required: true },
  { key: "identificationSystem", label: "Identification system", type: "text", required: true },
  { key: "incomingRecords", label: "Incoming records", type: "text", required: true },
  { key: "internalTraceability", label: "Internal traceability", type: "text", required: true },
  { key: "outgoingRecords", label: "Outgoing records", type: "text", required: true },
  { key: "traceabilityOwner", label: "Traceability owner", type: "text", required: true },
  { key: "recallLead", label: "Recall lead", type: "text", required: true },
  { key: "recallContacts", label: "Recall contacts", type: "text", required: false },
  { key: "retentionPeriod", label: "Retention period", type: "text", required: true },
  { key: "mockRecallFrequency", label: "Mock recall frequency", type: "text", required: false },
];

const PEST_CONTROL_FIELDS: DocumentBuilderField[] = [
  { key: "operationType", label: "Business type / site type", type: "text", required: true },
  { key: "premisesAndSurroundings", label: "Premises and surroundings", type: "text", required: true },
  { key: "pestRisks", label: "Relevant pest risks", type: "text", required: true },
  { key: "externalContractor", label: "External contractor", type: "text", required: false },
  { key: "monitoringMethods", label: "Monitoring methods", type: "text", required: false },
  { key: "internalChecks", label: "Internal checks", type: "text", required: false },
  { key: "escalationFlow", label: "Escalation flow", type: "text", required: false },
  { key: "preventionControls", label: "Prevention controls", type: "text", required: false },
  { key: "retentionPeriod", label: "Retention period", type: "text", required: false },
];

const WASTE_MANAGEMENT_FIELDS: DocumentBuilderField[] = [
  { key: "operationType", label: "Business type", type: "text", required: true },
  { key: "wasteStreams", label: "Waste streams", type: "text", required: true },
  { key: "segregationMethod", label: "Segregation / storage", type: "text", required: true },
  { key: "handlingOwner", label: "Who handles waste", type: "text", required: true },
  { key: "cleaningVerification", label: "Who verifies waste areas", type: "text", required: false },
  { key: "contractors", label: "Waste contractors", type: "text", required: false },
  { key: "legalRequirements", label: "Legal requirements", type: "text", required: false },
  { key: "usedOilHandling", label: "Used cooking oil handling", type: "text", required: false },
  { key: "animalByProducts", label: "Animal by-products", type: "text", required: false },
  { key: "correctiveAction", label: "Corrective action", type: "text", required: false },
  { key: "retentionPeriod", label: "Retention period", type: "text", required: false },
];

const FOOD_SAFETY_POLICY_FIELDS: DocumentBuilderField[] = [
  { key: "operationType", label: "Business type", type: "text", required: true },
  { key: "siteScope", label: "Site scope", type: "text", required: true },
  { key: "productCategories", label: "Products or services covered", type: "text", required: true },
  { key: "foodSafetyLead", label: "Overall food safety responsibility", type: "text", required: true },
  { key: "dayToDayOwner", label: "Day-to-day implementation owner", type: "text", required: true },
  { key: "coreCommitments", label: "Core commitments", type: "text", required: true },
  { key: "reviewFrequency", label: "Review frequency", type: "text", required: true },
  { key: "standards", label: "Standards / frameworks", type: "text", required: false },
  { key: "managementStatement", label: "Management statement", type: "text", required: false },
];

export const DOCUMENT_BUILDERS: Record<string, DocumentBuilderDefinition> = {
  haccpPlan: {
    id: "haccp_plan",
    wizardKey: "haccpPlan",
    documentType: "haccp_plan",
    title: "HACCP plan",
    sections: [
      createSection(
        "content",
        "HACCP content",
        HACCP_WIZARD.questions.map((question) => ({
          key: question.key,
          label: question.prompt,
          type: "text",
          required: true,
        })),
      ),
    ],
  },
  tempLog: {
    id: "temperature_log",
    wizardKey: "tempLog",
    documentType: "temperature_log",
    title: "Temperature log",
    sections: [
      createMetadataSection(TEMPERATURE_LOG_METADATA_FIELDS),
      createSection("content", "Temperature log setup", TEMPERATURE_LOG_CONTENT_FIELDS),
    ],
  },
  cleaningSchedule: {
    id: "cleaning_schedule",
    wizardKey: "cleaningSchedule",
    documentType: "cleaning_schedule",
    title: "Cleaning schedule",
    sections: [
      createMetadataSection(CLEANING_SCHEDULE_METADATA_FIELDS),
      createSection("chemicals", "Chemical reference", [
        {
          key: CHEMICAL_REFERENCE_ROWS.key,
          label: CHEMICAL_REFERENCE_ROWS.label,
          type: "rows",
          required: false,
        },
      ]),
      createSection("daily", "Daily tasks", [
        {
          key: DAILY_TASK_ROWS.key,
          label: DAILY_TASK_ROWS.label,
          type: "rows",
          required: false,
        },
      ]),
      createSection("weekly", "Weekly tasks", [
        {
          key: WEEKLY_TASK_ROWS.key,
          label: WEEKLY_TASK_ROWS.label,
          type: "rows",
          required: false,
        },
      ]),
      createSection("monthly", "Monthly tasks", [
        {
          key: MONTHLY_TASK_ROWS.key,
          label: MONTHLY_TASK_ROWS.label,
          type: "rows",
          required: false,
        },
      ]),
      createSection("verification", "ATP targets", [
        {
          key: ATP_TARGET_ROWS.key,
          label: ATP_TARGET_ROWS.label,
          type: "rows",
          required: false,
        },
      ]),
    ],
  },
  foodSafetyPolicy: {
    id: "food_safety_policy",
    wizardKey: "foodSafetyPolicy",
    documentType: "food_safety_policy",
    title: "Food safety policy",
    sections: [
      createMetadataSection(SOP_METADATA_FIELDS),
      createSection("content", "Policy details", FOOD_SAFETY_POLICY_FIELDS),
    ],
  },
  traceabilityProcedure: {
    id: "traceability_procedure",
    wizardKey: "traceabilityProcedure",
    documentType: "traceability_procedure",
    title: "Traceability procedure",
    sections: [
      createMetadataSection(SOP_METADATA_FIELDS),
      createSection("content", "Traceability details", TRACEABILITY_FIELDS),
    ],
  },
  pestControlProcedure: {
    id: "pest_control_procedure",
    wizardKey: "pestControlProcedure",
    documentType: "pest_control_procedure",
    title: "Pest control procedure",
    sections: [
      createMetadataSection(SOP_METADATA_FIELDS),
      createSection("content", "Pest control details", PEST_CONTROL_FIELDS),
    ],
  },
  wasteManagementProcedure: {
    id: "waste_management_procedure",
    wizardKey: "wasteManagementProcedure",
    documentType: "waste_management_procedure",
    title: "Waste management procedure",
    sections: [
      createMetadataSection(SOP_METADATA_FIELDS),
      createSection("content", "Waste management details", WASTE_MANAGEMENT_FIELDS),
    ],
  },
  cleaningSop: {
    id: "cleaning_sop",
    wizardKey: "cleaningSop",
    documentType: "cleaning_sop",
    title: "Cleaning SOP",
    sections: [
      createMetadataSection(SOP_METADATA_FIELDS),
      createSection("content", "Cleaning SOP details", CLEANING_SOP_FIELDS),
      createSection("chemicals", "Chemicals", [
        { key: STANDARD_CHEMICAL_ROWS.key, label: STANDARD_CHEMICAL_ROWS.label, type: "rows", required: false },
      ]),
      createSection("records", "Records", [
        { key: SIMPLE_RECORD_ROWS.key, label: SIMPLE_RECORD_ROWS.label, type: "rows", required: false },
      ]),
    ],
  },
  staffTrainingRecord: {
    id: "staff_training_record",
    wizardKey: "staffTrainingRecord",
    documentType: "staff_training_record",
    title: "Staff training record",
    sections: [
      createMetadataSection(TRAINING_METADATA_FIELDS),
      createSection("employee", "Employee details", TRAINING_RECORD_FIELDS),
      createSection("qualifications", "Qualifications", [
        { key: QUALIFICATION_ROWS.key, label: QUALIFICATION_ROWS.label, type: "rows", required: false },
      ]),
      createSection("trainingLog", "Training log", [
        { key: TRAINING_LOG_ROWS.key, label: TRAINING_LOG_ROWS.label, type: "rows", required: false },
      ]),
    ],
  },
  productDataSheet: {
    id: "product_data_sheet",
    wizardKey: "productDataSheet",
    documentType: "product_data_sheet",
    title: "Product data sheet",
    sections: [
      createMetadataSection(PRODUCT_METADATA_FIELDS),
      createSection("content", "Product details", PRODUCT_DATA_SHEET_FIELDS),
      createSection("nutrition", "Nutrition", [
        { key: NUTRITION_ROWS.key, label: NUTRITION_ROWS.label, type: "rows", required: false },
      ]),
      createSection("microbiology", "Microbiology", [
        { key: MICROBIOLOGY_ROWS.key, label: MICROBIOLOGY_ROWS.label, type: "rows", required: false },
      ]),
    ],
  },
};

export function getDocumentBuilderDefinition(key: string): DocumentBuilderDefinition | undefined {
  return DOCUMENT_BUILDERS[key];
}

export function getDocumentBuilderDefaults(key: string): Record<string, string> {
  const definition = getDocumentBuilderDefinition(key);
  if (!definition) return {};

  const metadataDefaults = definition.sections
    .filter((section) => section.key === "metadata")
    .reduce<Record<string, string>>((acc, section) => {
      const includeVersion = section.fields.some((field) => field.key === "version");
      const includeDate = section.fields.some((field) => field.key === "date");
      const includeCreatedBy = section.fields.some((field) => field.key === "createdBy");
      const includeApprovedBy = section.fields.some((field) => field.key === "approvedBy");
      const includeReviewDate = section.fields.some((field) => field.key === "reviewDate");

      return {
        ...acc,
        ...getSharedDocumentMetadataDefaults({
          includeVersion,
          includeDate,
          includeCreatedBy,
          includeApprovedBy,
          includeReviewDate,
        }),
      };
    }, {});

  const contentDefaults = definition.sections.reduce<Record<string, string>>((acc, section) => {
    for (const field of section.fields) {
      if (field.key in acc) continue;
      acc[field.key] = field.defaultValue ?? "";
    }
    return acc;
  }, {});

  return {
    ...metadataDefaults,
    ...contentDefaults,
  };
}
