export type DocumentBuilderFieldType = "text" | "date" | "select" | "multiselect" | "rows";

export type DocumentBuilderFieldOption = {
  label: string;
  value: string;
};

export type DocumentBuilderField = {
  key: string;
  label: string;
  type: DocumentBuilderFieldType;
  required: boolean;
  options?: DocumentBuilderFieldOption[];
  description?: string;
  defaultValue?: string;
};

export type DocumentBuilderMetadataOptions = {
  includeVersion: boolean;
  includeDate: boolean;
  includeCreatedBy: boolean;
  includeApprovedBy: boolean;
  includeReviewDate: boolean;
};

export type DocumentBuilderRowColumn = {
  key: string;
  label: string;
  required: boolean;
};

export type DocumentBuilderRowConfig = {
  key: string;
  label: string;
  columns: DocumentBuilderRowColumn[];
};

export type DocumentBuilderSection = {
  key: string;
  title: string;
  fields: DocumentBuilderField[];
};

export type DocumentBuilderDefinition = {
  id: string;
  wizardKey: string;
  documentType: string;
  title: string;
  sections: DocumentBuilderSection[];
};
