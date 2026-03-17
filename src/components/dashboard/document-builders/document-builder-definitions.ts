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

const HACCP_METADATA_FIELDS = buildSharedDocumentMetadataFields({
  includeVersion: true,
  includeDate: true,
  includeCreatedBy: true,
  includeApprovedBy: true,
  includeReviewDate: false,
});

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

export const DOCUMENT_BUILDERS: Record<string, DocumentBuilderDefinition> = {
  haccpPlan: {
    id: "haccp_plan",
    wizardKey: "haccpPlan",
    documentType: "haccp_plan",
    title: "HACCP plan",
    sections: [
      createMetadataSection(HACCP_METADATA_FIELDS),
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
