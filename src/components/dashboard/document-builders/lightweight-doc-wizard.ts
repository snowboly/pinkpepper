import {
  getDocumentBuilderDefaults,
  getDocumentBuilderDefinition,
} from "./document-builder-definitions";
import type {
  DocumentBuilderField,
  DocumentBuilderFieldOption,
} from "./document-builder-types";
import type { DocumentBuilderAnswerMap } from "./document-builder-payload";

export type LightweightDocWizardQuestion = {
  key: string;
  prompt: string;
};

export type LightweightDocWizard = {
  builderKey: string;
  documentType: string;
  wizardKey: string;
  questionCount: number;
  title: string;
  questions: LightweightDocWizardQuestion[];
};

export const LIGHTWEIGHT_DOC_WIZARD_KEYS = [
  "haccpPlan",
  "tempLog",
  "foodSafetyPolicy",
  "traceabilityProcedure",
  "pestControlProcedure",
  "wasteManagementProcedure",
] as const;

function formatOptionLabels(options: DocumentBuilderFieldOption[]) {
  return options.map((option) => option.label).join(", ");
}

export function formatLightweightDocWizardPrompt(field: DocumentBuilderField) {
  const guidance: string[] = [];

  if (field.description) {
    guidance.push(field.description);
  }

  if (field.type === "select" && field.options?.length) {
    guidance.push(`Options: ${formatOptionLabels(field.options)}`);
  }

  if (field.type === "date") {
    guidance.push("Use YYYY-MM-DD.");
  }

  return guidance.length > 0 ? `${field.label}\n\n${guidance.join("\n\n")}` : field.label;
}

export function getLightweightDocWizard(builderKey: string): LightweightDocWizard | undefined {
  const definition = getDocumentBuilderDefinition(builderKey);
  if (!definition) {
    return undefined;
  }

  const questions = definition.sections.flatMap((section) =>
    section.fields
      .filter((field) => field.type !== "rows")
      .map((field) => ({
        key: field.key,
        prompt: formatLightweightDocWizardPrompt(field),
      })),
  );

  return {
    builderKey,
    documentType: definition.documentType,
    wizardKey: definition.wizardKey,
    title: definition.title,
    questionCount: questions.length,
    questions,
  };
}

export function getLightweightDocWizards(): Record<string, LightweightDocWizard> {
  return Object.fromEntries(
    LIGHTWEIGHT_DOC_WIZARD_KEYS.map((builderKey) => {
      const wizard = getLightweightDocWizard(builderKey);
      if (!wizard) {
        throw new Error(`Missing document builder definition for ${builderKey}`);
      }
      return [builderKey, wizard];
    }),
  );
}

export function getInitialLightweightDocWizardAnswers(builderKey: string): DocumentBuilderAnswerMap {
  return getDocumentBuilderDefaults(builderKey);
}

export function shouldShowDocumentStarters(workspaceMode: "ask" | "virtual_audit") {
  return workspaceMode === "ask";
}
