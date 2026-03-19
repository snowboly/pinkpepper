import type { ChangeEvent } from "react";

import type { DocumentBuilderField } from "./document-builder-types";

type AdvancedDocumentBuilderFieldProps = {
  field: DocumentBuilderField;
  value: string;
  invalid?: boolean;
  onChange: (value: string) => void;
};

export default function AdvancedDocumentBuilderField({
  field,
  value,
  invalid = false,
  onChange,
}: AdvancedDocumentBuilderFieldProps) {
  if (field.type === "select") {
    return (
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-[#475569]">{field.label}</span>
        <select
          value={value}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}
          className={`w-full rounded-xl border bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#E11D48] ${
            invalid ? "border-[#E11D48]" : "border-[#E2E8F0]"
          }`}
        >
          <option value="">Select…</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-[#475569]">{field.label}</span>
      <input
        type={field.type === "date" ? "date" : "text"}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        className={`w-full rounded-xl border bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#E11D48] ${
          invalid ? "border-[#E11D48]" : "border-[#E2E8F0]"
        }`}
      />
    </label>
  );
}
