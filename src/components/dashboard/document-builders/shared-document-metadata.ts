import type {
  DocumentBuilderField,
  DocumentBuilderMetadataOptions,
} from "./document-builder-types";

const BASE_FIELD: DocumentBuilderField = {
  key: "businessName",
  label: "Business / site name",
  type: "text",
  required: true,
};

export function buildSharedDocumentMetadataFields(
  options: DocumentBuilderMetadataOptions,
): DocumentBuilderField[] {
  const fields: DocumentBuilderField[] = [BASE_FIELD];

  if (options.includeVersion) {
    fields.push({ key: "version", label: "Version", type: "text", required: true });
  }
  if (options.includeDate) {
    fields.push({ key: "date", label: "Date", type: "date", required: true });
  }
  if (options.includeCreatedBy) {
    fields.push({ key: "createdBy", label: "Created by", type: "text", required: true });
  }
  if (options.includeApprovedBy) {
    fields.push({ key: "approvedBy", label: "Approved by", type: "text", required: true });
  }
  if (options.includeReviewDate) {
    fields.push({ key: "reviewDate", label: "Review date", type: "date", required: true });
  }

  return fields;
}

export function getSharedDocumentMetadataDefaults(
  options: DocumentBuilderMetadataOptions,
): Record<string, string> {
  return buildSharedDocumentMetadataFields(options).reduce<Record<string, string>>((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {});
}
