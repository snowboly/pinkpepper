import type { DocumentBuilderAnswerMap, DocumentBuilderAnswerValue } from "./document-builder-payload";
import type { DocumentBuilderDefinition } from "./document-builder-types";
import {
  getAdvancedBuilderDescription,
  getAdvancedBuilderValidation,
} from "./advanced-doc-builder";
import AdvancedDocumentBuilderSection from "./AdvancedDocumentBuilderSection";

type AdvancedDocumentBuilderModalProps = {
  open: boolean;
  definition: DocumentBuilderDefinition | null;
  answers: DocumentBuilderAnswerMap;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onChange: (key: string, value: DocumentBuilderAnswerValue) => void;
  onSubmit: () => void;
};

export default function AdvancedDocumentBuilderModal({
  open,
  definition,
  answers,
  loading,
  error,
  onClose,
  onChange,
  onSubmit,
}: AdvancedDocumentBuilderModalProps) {
  if (!open || !definition) {
    return null;
  }

  const validation = getAdvancedBuilderValidation(definition.wizardKey, answers);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[#E2E8F0] bg-[#F8F9FB] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#E2E8F0] bg-white px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold text-[#0F172A]">{definition.title}</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              {getAdvancedBuilderDescription(definition.wizardKey)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-[#64748B] hover:bg-[#F8F9FB]"
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {definition.sections.map((section) => (
            <AdvancedDocumentBuilderSection
              key={section.key}
              section={section}
              answers={answers}
              missingRequiredFields={validation.missingRequiredFields}
              rowErrors={validation.rowErrors}
              onChange={onChange}
            />
          ))}
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#E2E8F0] bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F8F9FB]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading || !validation.isValid}
            className="rounded-full bg-[#E11D48] px-5 py-2 text-sm font-semibold text-white hover:bg-[#BE123C] disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate document"}
          </button>
        </div>
      </div>
    </div>
  );
}
