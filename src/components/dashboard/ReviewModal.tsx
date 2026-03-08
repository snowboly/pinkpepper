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
  allowFullDocumentReview: boolean;
  reviewTurnaround: string;
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

const QUICK_CHECK_KEYS = ["async_qa", "process_flow", "log_review", "short_procedure"] as const;
const FULL_REVIEW_KEYS = ["full_haccp_plan", "ccp_review", "prps_review", "operations_manual"] as const;
const ALL_CATEGORY_KEYS = [...QUICK_CHECK_KEYS, ...FULL_REVIEW_KEYS];

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

  const isFullReview = FULL_REVIEW_KEYS.some((k) => k === documentCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-[#0F172A]">{t("title")}</h3>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#64748B]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Credit counter */}
        {reviewInfo && !isAdmin && (
          <p className="mt-1 text-xs text-[#64748B]">
            {t("creditsUsed")} <span className="font-semibold">{reviewInfo.used}/{reviewInfo.limit ?? "unlimited"}</span>
          </p>
        )}

        {/* Previous requests for this conversation */}
        {conversationId && reviewRequests.length > 0 && (
          <div className="mt-2 mb-1 flex flex-wrap gap-2">
            {reviewRequests.slice(0, 3).map((r) => (
              <span key={r.id} className="rounded-full border border-[#E2E8F0] bg-[#F8F9FB] px-2 py-0.5 text-xs text-[#64748B]">
                {r.document_category && ALL_CATEGORY_KEYS.includes(r.document_category as typeof ALL_CATEGORY_KEYS[number])
                  ? t(`categories.${r.document_category}.label`)
                  : (r.review_type === "quick_check" ? t("quickCheck") : t("fullDocumentReview"))}: {r.status}
              </span>
            ))}
          </div>
        )}

        {/* Disclosure panel */}
        <div className="mt-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs text-[#475569] space-y-1">
          <p className="font-semibold text-[#334155]">{t("whatToExpect")}</p>
          <p>{t("whatToExpectBody")}</p>
          <p>{t("scopeNote")}</p>
          <p>{t("turnaround")} <span className="font-medium">{t("turnaroundTimes")}</span>.</p>
          {allowFullDocumentReview && (
            <p className="text-[#92400E] bg-[#FFFBEB] rounded px-2 py-1 mt-1">
              {t("fullReviewCostNote")}
            </p>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {/* Category selection */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-[#475569]">{t("documentType")}</legend>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-1">{t("quickCheck")} <span className="normal-case text-[#64748B]">{t("quickCheckCredits")}</span></p>
              {QUICK_CHECK_KEYS.map((key) => (
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
            </div>

            {allowFullDocumentReview && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-1">{t("fullDocumentReview")} <span className="normal-case text-[#92400E]">{t("fullDocumentReviewCredits")}</span></p>
                {FULL_REVIEW_KEYS.map((key) => (
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
              </div>
            )}
          </fieldset>

          {/* Full review cost warning */}
          {isFullReview && (
            <p className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-xs text-[#92400E]">
              {t("fullReviewWarning")}
            </p>
          )}

          {/* Notes */}
          <label className="block text-sm">
            <span className="mb-1 block text-[#475569] font-medium">{t("notesLabel")}</span>
            <textarea
              value={reviewNotes}
              onChange={(e) => onSetReviewNotes(e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm outline-none focus:border-[#E11D48]"
              placeholder={t("notesPlaceholder")}
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
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
            disabled={reviewLoading || !conversationId || !reviewEligible}
            className="rounded-full bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white hover:bg-[#BE123C] disabled:opacity-50"
          >
            {reviewLoading ? t("submitting") : t("submitRequest")}
          </button>
        </div>
      </div>
    </div>
  );
}
