import type { DocumentBuilderAnswerMap, DocumentBuilderAnswerValue, DocumentBuilderRowValue } from "./document-builder-payload";
import type { DocumentBuilderSection } from "./document-builder-types";
import AdvancedDocumentBuilderField from "./AdvancedDocumentBuilderField";
import AdvancedDocumentBuilderRows from "./AdvancedDocumentBuilderRows";

type AdvancedDocumentBuilderSectionProps = {
  section: DocumentBuilderSection;
  answers: DocumentBuilderAnswerMap;
  missingRequiredFields?: string[];
  rowErrors?: Record<string, number[]>;
  onChange: (key: string, value: DocumentBuilderAnswerValue) => void;
};

export default function AdvancedDocumentBuilderSection({
  section,
  answers,
  missingRequiredFields = [],
  rowErrors = {},
  onChange,
}: AdvancedDocumentBuilderSectionProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-[#E2E8F0] bg-white p-4">
      <div>
        <h3 className="text-base font-semibold text-[#0F172A]">{section.title}</h3>
      </div>

      <div className="space-y-4">
        {section.fields.map((field) => {
          const value = answers[field.key];

          if (field.type === "rows") {
            return (
              <div key={field.key}>
                <p className="mb-2 text-sm font-medium text-[#475569]">{field.label}</p>
                <AdvancedDocumentBuilderRows
                  fieldKey={field.key}
                  rows={Array.isArray(value) ? (value as DocumentBuilderRowValue[]) : []}
                  invalidRowIndexes={rowErrors[field.key] ?? []}
                  onChange={(rows) => onChange(field.key, rows)}
                />
              </div>
            );
          }

          return (
            <AdvancedDocumentBuilderField
              key={field.key}
              field={field}
              value={typeof value === "string" ? value : ""}
              invalid={missingRequiredFields.includes(field.key)}
              onChange={(nextValue) => onChange(field.key, nextValue)}
            />
          );
        })}
      </div>
    </section>
  );
}
