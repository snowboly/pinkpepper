import type {
  DocumentBuilderRowConfig,
  DocumentBuilderRowColumn,
} from "./document-builder-types";

type CreateRowBuilderConfigInput = {
  key: string;
  label: string;
  columns: DocumentBuilderRowColumn[];
};

export function createRowBuilderConfig(
  input: CreateRowBuilderConfigInput,
): DocumentBuilderRowConfig {
  return {
    key: input.key,
    label: input.label,
    columns: input.columns,
  };
}

export function createRowBuilderRow(config: DocumentBuilderRowConfig): Record<string, string> {
  return config.columns.reduce<Record<string, string>>((acc, column) => {
    acc[column.key] = "";
    return acc;
  }, {});
}
