"use client";

import { useTranslations } from "next-intl";

type ReviewRequest = {
  id: string;
  status: string;
  review_type: string;
  document_category?: string;
  created_at: string;
};

type ReviewModalProps = {
  open: boolean;
  conversationId: string | null;
  isAdmin: boolean;
  reviewEligible: boolean;
  allowFullDocumentReview?: boolean;
  reviewTurnaround?: string;
  documentCategory: string;
  reviewNotes: string;
  reviewLoading: boolean;
  reviewSubmitted: boolean;
  reviewInfo: { used: number; limit: number | null } | null;
  reviewRequests: ReviewRequest[];
  onClose: () => void;
  onSetDocumentCategory: (category: string) => void;
  onSetReviewNotes: (notes: string) => void;
  onSubmit: () => void;
};

const CATEGORY_KEYS = ["produced_pdf", "produced_docx", "async_qa"] as const;
const ALL_CATEGORY_KEYS = [...CATEGORY_KEYS];

export default function ReviewModal({
  open,
  conversationId,
  isAdmin,
  reviewEligible,
  allowFullDocumentReview,
  documentCategory,
  reviewNotes,
  reviewLoading,
  reviewSubmitted,
  reviewInfo,
  reviewRequests,
  onClose,
  onSetDocumentCategory,
  onSetReviewNotes,
  onSubmit,
}: ReviewModalProps) {
  const t = useTranslations("review");
  if (!open) return null;

  // Confirmation state after successful submission
  if (reviewSubmitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{t("submitted")}</h3>
          <p className="text-sm text-[#64748B] mb-4">
            {t("submittedBody")}
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="/dashboard/reviews"
              className="rounded-full bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white hover:bg-[#BE123C] inline-block"
            >
              {t("trackReviews")}
            </a>
            <button
              onClick={onClose}
              className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8F9FB]"
            >
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-[#0F172A]">{t("title")}</h3>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#64748B]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Credit counter */}
        {reviewInfo && !isAdmin && (
          <p className="text-xs text-[#64748B] mb-3">
            {t("creditsUsed")} <span className="font-semibold">{reviewInfo.used}/{reviewInfo.limit ?? "unlimited"}</span>
          </p>
        )}

        {/* Category selection — simplified to 3 options */}
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium text-[#475569]">{t("documentType")}</legend>
          {CATEGORY_KEYS.map((key) => (
            <label
              key={key}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                documentCategory === key
                  ? "border-[#E11D48] bg-[#FFF1F2]"
                  : "border-[#E2E8F0] bg-white hover:bg-[#F8F9FB]"
              }`}
            >
              <input
                type="radio"
                name="documentCategory"
                value={key}
                checked={documentCategory === key}
                onChange={() => onSetDocumentCategory(key)}
                className="mt-0.5 accent-[#E11D48]"
              />
              <span>
                <span className="block text-sm font-medium text-[#0F172A]">{t(`categories.${key}.label`)}</span>
                <span className="block text-xs text-[#64748B]">{t(`categories.${key}.desc`)}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {/* Notes */}
        <label className="mt-3 block text-sm">
          <span className="mb-1 block text-[#475569] font-medium">{t("notesLabel")}</span>
          <textarea
            value={reviewNotes}
            onChange={(e) => onSetReviewNotes(e.target.value)}
            rows={2}
            maxLength={1000}
            className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm outline-none focus:border-[#E11D48]"
            placeholder={t("notesPlaceholder")}
          />
        </label>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8F9FB]"
          >
            {t("close")}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={reviewLoading || !conversationId || !reviewEligible || !documentCategory}
            className="rounded-full bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white hover:bg-[#BE123C] disabled:opacity-50"
          >
            {reviewLoading ? t("submitting") : t("submitRequest")}
          </button>
        </div>
      </div>
    </div>
  );
}
