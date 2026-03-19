import type { ChangeEvent } from "react";

import type { DocumentBuilderRowValue } from "./document-builder-payload";
import {
  createEmptyAdvancedBuilderRow,
  getAdvancedBuilderRowConfig,
  getAdvancedBuilderRowEmptyState,
} from "./advanced-doc-builder";

type AdvancedDocumentBuilderRowsProps = {
  fieldKey: string;
  rows: DocumentBuilderRowValue[];
  invalidRowIndexes?: number[];
  onChange: (rows: DocumentBuilderRowValue[]) => void;
};

export default function AdvancedDocumentBuilderRows({
  fieldKey,
  rows,
  invalidRowIndexes = [],
  onChange,
}: AdvancedDocumentBuilderRowsProps) {
  const config = getAdvancedBuilderRowConfig(fieldKey);
  if (!config) {
    return null;
  }
  const emptyState = getAdvancedBuilderRowEmptyState(fieldKey);

  const nextRows = rows.length > 0 ? rows : [];

  function updateCell(rowIndex: number, columnKey: string, value: string) {
    onChange(
      nextRows.map((row, index) =>
        index === rowIndex ? { ...row, [columnKey]: value } : row,
      ),
    );
  }

  function removeRow(rowIndex: number) {
    onChange(nextRows.filter((_, index) => index !== rowIndex));
  }

  function addRow() {
    onChange([...nextRows, createEmptyAdvancedBuilderRow(fieldKey)]);
  }

  return (
    <div className="space-y-3">
      {nextRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
          <p className="font-medium text-[#475569]">{emptyState.title}</p>
          <p className="mt-1">{emptyState.body}</p>
        </div>
      ) : null}

      {nextRows.map((row, rowIndex) => (
        <div
          key={`${fieldKey}-${rowIndex}`}
          className={`rounded-2xl border bg-[#F8FAFC] p-3 ${
            invalidRowIndexes.includes(rowIndex) ? "border-[#E11D48]" : "border-[#E2E8F0]"
          }`}
        >
          <div className="grid gap-3 md:grid-cols-2">
            {config.columns.map((column) => (
              <label key={column.key} className="block text-sm">
                <span className="mb-1 block font-medium text-[#475569]">{column.label}</span>
                <input
                  type="text"
                  value={row[column.key] ?? ""}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateCell(rowIndex, column.key, event.target.value)
                  }
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#E11D48]"
                />
              </label>
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => removeRow(rowIndex)}
              className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-medium text-[#64748B] hover:bg-[#F8F9FB]"
            >
              Remove row
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] hover:bg-[#F8F9FB]"
      >
        Add row
      </button>
    </div>
  );
}
