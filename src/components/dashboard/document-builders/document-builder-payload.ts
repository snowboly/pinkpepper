import { getDocumentBuilderDefinition } from "./document-builder-definitions";

export type DocumentBuilderRowValue = Record<string, string>;
export type DocumentBuilderAnswerValue = string | DocumentBuilderRowValue[];
export type DocumentBuilderAnswerMap = Record<string, DocumentBuilderAnswerValue>;

export function normaliseBuilderAnswers(
  answers: DocumentBuilderAnswerMap,
): DocumentBuilderAnswerMap {
  return Object.fromEntries(
    Object.entries(answers).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.trim()];
      }

      return [key, value.map((row) => Object.fromEntries(
        Object.entries(row).map(([columnKey, columnValue]) => [columnKey, columnValue.trim()]),
      ))];
    }),
  );
}

export function buildDocumentGenerationPayload(
  builderKey: string,
  answers: DocumentBuilderAnswerMap,
) {
  const definition = getDocumentBuilderDefinition(builderKey);
  if (!definition) {
    throw new Error(`Unknown document builder: ${builderKey}`);
  }

  return {
    documentType: definition.documentType,
    builderKey,
    builderData: normaliseBuilderAnswers(answers),
  };
}
