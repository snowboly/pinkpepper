import type {
  DocumentBuilderAnswerMap,
  DocumentBuilderRowValue,
} from "./document-builder-payload";
import {
  DEFAULT_ATP_TARGETS,
  DEFAULT_CHEMICAL_REFERENCE,
  DEFAULT_DAILY_TASKS,
  DEFAULT_MONTHLY_TASKS,
  DEFAULT_WEEKLY_TASKS,
} from "@/lib/documents/cleaning-schedule-schema";
import {
  getDocumentBuilderDefinition,
  getDocumentBuilderDefaults,
  getDocumentBuilderRowConfig,
} from "./document-builder-definitions";
import { createRowBuilderRow } from "./shared-row-builder";

export const ADVANCED_DOCUMENT_BUILDER_KEYS = [
  "cleaningSchedule",
  "productDataSheet",
  "staffTrainingRecord",
  "cleaningSop",
] as const;

export type AdvancedDocumentBuilderKey = (typeof ADVANCED_DOCUMENT_BUILDER_KEYS)[number];

export function isAdvancedDocumentBuilderKey(
  key: string,
): key is AdvancedDocumentBuilderKey {
  return (ADVANCED_DOCUMENT_BUILDER_KEYS as readonly string[]).includes(key);
}

export function getAdvancedDocumentBuilder(key: string) {
  if (!isAdvancedDocumentBuilderKey(key)) {
    return undefined;
  }

  return getDocumentBuilderDefinition(key);
}

export function createEmptyAdvancedBuilderRow(key: string) {
  const config = getDocumentBuilderRowConfig(key);
  if (!config) {
    throw new Error(`Unknown advanced builder row config: ${key}`);
  }

  return createRowBuilderRow(config);
}

export function getAdvancedBuilderRowConfig(key: string) {
  return getDocumentBuilderRowConfig(key);
}

export function getAdvancedBuilderDescription(builderKey: string): string {
  switch (builderKey) {
    case "cleaningSchedule":
      return "Build a practical cleaning schedule with structured chemicals, tasks, and verification targets.";
    case "productDataSheet":
      return "Capture product identity, storage, allergens, and optional nutrition or microbiology data in one structured sheet.";
    case "staffTrainingRecord":
      return "Record staff induction, qualifications, and on-the-job training in a structured training file.";
    case "cleaningSop":
      return "Capture responsibilities, chemicals, records, and working instructions in one structured SOP flow.";
    default:
      return "Structured builder for row-heavy compliance documents.";
  }
}

export function getAdvancedBuilderRowEmptyState(fieldKey: string): {
  title: string;
  body: string;
} {
  switch (fieldKey) {
    case "nutritionRows":
      return {
        title: "No rows added yet",
        body: "Add nutrition values if you want them included in the exported sheet.",
      };
    case "microbiologyRows":
      return {
        title: "No rows added yet",
        body: "Add microbiology specifications only if you want them included in the exported sheet.",
      };
    case "qualifications":
      return {
        title: "No rows added yet",
        body: "Add qualifications if you want them prefilled in the training record.",
      };
    case "trainingLogRows":
      return {
        title: "No rows added yet",
        body: "Add training log rows if you want recent training activity prefilled.",
      };
    case "chemicals":
      return {
        title: "No rows added yet",
        body: "Add the chemicals used in this SOP if you want them listed in the generated document.",
      };
    case "records":
      return {
        title: "No rows added yet",
        body: "Add any records or forms that should be referenced in the generated SOP.",
      };
    default:
      return {
        title: "No rows added yet",
        body: "Add your own rows or start from defaults.",
      };
  }
}

export function getInitialAdvancedBuilderAnswers(
  builderKey: string,
): DocumentBuilderAnswerMap {
  const definition = getAdvancedDocumentBuilder(builderKey);
  if (!definition) {
    return {};
  }

  const defaults: DocumentBuilderAnswerMap = Object.entries(
    getDocumentBuilderDefaults(builderKey),
  ).reduce<DocumentBuilderAnswerMap>((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

  for (const section of definition.sections) {
    for (const field of section.fields) {
      if (field.type === "rows") {
        defaults[field.key] = [];
      }
    }
  }

  if (builderKey === "cleaningSchedule") {
    defaults.chemicalReference = DEFAULT_CHEMICAL_REFERENCE.map((row) => ({ ...row }));
    defaults.dailyTasks = DEFAULT_DAILY_TASKS.map((row) => ({ ...row }));
    defaults.weeklyTasks = DEFAULT_WEEKLY_TASKS.map((row) => ({ ...row }));
    defaults.monthlyTasks = DEFAULT_MONTHLY_TASKS.map((row) => ({ ...row }));
    defaults.atpTargets = DEFAULT_ATP_TARGETS.map((row) => ({ ...row }));
  }

  return defaults;
}

export type AdvancedBuilderValidationResult = {
  isValid: boolean;
  missingRequiredFields: string[];
  rowErrors: Record<string, number[]>;
};

export function getAdvancedBuilderValidation(
  builderKey: string,
  answers: DocumentBuilderAnswerMap,
): AdvancedBuilderValidationResult {
  const definition = getAdvancedDocumentBuilder(builderKey);
  if (!definition) {
    return { isValid: false, missingRequiredFields: [], rowErrors: {} };
  }

  const missingRequiredFields: string[] = [];
  const rowErrors: Record<string, number[]> = {};

  for (const section of definition.sections) {
    for (const field of section.fields) {
      const value = answers[field.key];

      if (field.type === "rows") {
        const rows = Array.isArray(value) ? (value as DocumentBuilderRowValue[]) : [];
        const config = getAdvancedBuilderRowConfig(field.key);
        if (!config || rows.length === 0) {
          continue;
        }

        const invalidRowIndexes = rows
          .map((row, index) => {
            const hasMissingRequiredColumn = config.columns.some((column) => {
              if (!column.required) return false;
              return !row[column.key]?.trim();
            });
            return hasMissingRequiredColumn ? index : -1;
          })
          .filter((index) => index >= 0);

        if (invalidRowIndexes.length > 0) {
          rowErrors[field.key] = invalidRowIndexes;
        }
        continue;
      }

      if (!field.required) {
        continue;
      }

      if (typeof value !== "string" || value.trim().length === 0) {
        missingRequiredFields.push(field.key);
      }
    }
  }

  if (
    builderKey === "staffTrainingRecord" &&
    answers.inductionCompleted === "Yes" &&
    (typeof answers.inductionDate !== "string" || answers.inductionDate.trim().length === 0) &&
    !missingRequiredFields.includes("inductionDate")
  ) {
    missingRequiredFields.push("inductionDate");
  }

  return {
    isValid: missingRequiredFields.length === 0 && Object.keys(rowErrors).length === 0,
    missingRequiredFields,
    rowErrors,
  };
}
