"use client";

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

const QUICK_CHECK_OPTIONS = [
  { value: "async_qa",        label: "Async Q&A",           desc: "Written answer to a specific food safety question." },
  { value: "process_flow",    label: "Process Flow Review",  desc: "Review of a described production or preparation process." },
  { value: "log_review",      label: "Log / Record Review",  desc: "Temperature logs, cleaning records, monitoring sheets." },
  { value: "short_procedure", label: "Short Procedure",      desc: "A single SOP or procedure document (approx. 1–2 pages)." },
];

const FULL_REVIEW_OPTIONS = [
  { value: "full_haccp_plan",   label: "Full HACCP Plan",    desc: "Complete 7-principle HACCP plan with CCP analysis." },
  { value: "ccp_review",        label: "CCP Review",         desc: "Focused review of critical control points." },
  { value: "prps_review",       label: "PRPs Review",        desc: "Prerequisite programmes: cleaning, pest control, supplier approval, etc." },
  { value: "operations_manual", label: "Operations Manual",  desc: "Multi-section food safety management manual." },
];

function categoryLabel(category: string): string {
  const all = [...QUICK_CHECK_OPTIONS, ...FULL_REVIEW_OPTIONS];
  return all.find((o) => o.value === category)?.label ?? category;
}

export default function ReviewModal({
  open,
  conversationId,
  isAdmin,
  reviewEligible,
  allowFullDocumentReview,
  reviewTurnaround,
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
          <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Review Request Submitted</h3>
          <p className="text-sm text-[#64748B] mb-4">
            You&apos;ll receive an email when your review is picked up and when it&apos;s complete.
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="/dashboard/reviews"
              className="rounded-full bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white hover:bg-[#BE123C] inline-block"
            >
              Track your reviews
            </a>
            <button
              onClick={onClose}
              className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8F9FB]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isFullReview = FULL_REVIEW_OPTIONS.some((o) => o.value === documentCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-[#0F172A]">Request Expert Review</h3>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#64748B]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Usage counter */}
        {reviewInfo && !isAdmin && (
          <p className="mt-1 text-xs text-[#64748B]">
            Reviews used this month: <span className="font-semibold">{reviewInfo.used}/{reviewInfo.limit ?? "unlimited"}</span>
          </p>
        )}

        {/* Previous requests for this conversation */}
        {conversationId && reviewRequests.length > 0 && (
          <div className="mt-2 mb-1 flex flex-wrap gap-2">
            {reviewRequests.slice(0, 3).map((r) => (
              <span key={r.id} className="rounded-full border border-[#E2E8F0] bg-[#F8F9FB] px-2 py-0.5 text-xs text-[#64748B]">
                {r.document_category ? categoryLabel(r.document_category) : (r.review_type === "quick_check" ? "Quick Check" : "Full Review")}: {r.status}
              </span>
            ))}
          </div>
        )}

        {/* Disclosure panel */}
        <div className="mt-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs text-[#475569] space-y-1">
          <p className="font-semibold text-[#334155]">What to expect</p>
          <p>Reviews are conducted by qualified food safety consultants. Feedback is returned as structured written notes via your dashboard.</p>
          <p>Reviews are scoped to the content of the selected conversation. Off-topic or out-of-scope requests may be declined.</p>
          <p>Turnaround: <span className="font-medium">{reviewTurnaround === "N/A" ? "not available on your plan" : reviewTurnaround}</span>.</p>
          {allowFullDocumentReview && (
            <p className="text-[#92400E] bg-[#FFFBEB] rounded px-2 py-1 mt-1">
              Full document reviews use your entire monthly quota. You cannot combine them with quick checks in the same month.
            </p>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {/* Category selection */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-[#475569]">Document type</legend>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-1">Quick Check</p>
              {QUICK_CHECK_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                    documentCategory === opt.value
                      ? "border-[#E11D48] bg-[#FFF1F2]"
                      : "border-[#E2E8F0] bg-white hover:bg-[#F8F9FB]"
                  }`}
                >
                  <input
                    type="radio"
                    name="documentCategory"
                    value={opt.value}
                    checked={documentCategory === opt.value}
                    onChange={() => onSetDocumentCategory(opt.value)}
                    className="mt-0.5 accent-[#E11D48]"
                  />
                  <span>
                    <span className="block text-sm font-medium text-[#0F172A]">{opt.label}</span>
                    <span className="block text-xs text-[#64748B]">{opt.desc}</span>
                  </span>
                </label>
              ))}
            </div>

            {allowFullDocumentReview && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-1">Full Document Review <span className="normal-case text-[#92400E]">— uses full monthly quota</span></p>
                {FULL_REVIEW_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                      documentCategory === opt.value
                        ? "border-[#E11D48] bg-[#FFF1F2]"
                        : "border-[#E2E8F0] bg-white hover:bg-[#F8F9FB]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="documentCategory"
                      value={opt.value}
                      checked={documentCategory === opt.value}
                      onChange={() => onSetDocumentCategory(opt.value)}
                      className="mt-0.5 accent-[#E11D48]"
                    />
                    <span>
                      <span className="block text-sm font-medium text-[#0F172A]">{opt.label}</span>
                      <span className="block text-xs text-[#64748B]">{opt.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          {/* Full review cost warning */}
          {isFullReview && (
            <p className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-xs text-[#92400E]">
              This will use all 6 of your monthly review slots. You won&apos;t be able to submit additional reviews this month.
            </p>
          )}

          {/* Notes */}
          <label className="block text-sm">
            <span className="mb-1 block text-[#475569] font-medium">Notes for reviewer (optional)</span>
            <textarea
              value={reviewNotes}
              onChange={(e) => onSetReviewNotes(e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm outline-none focus:border-[#E11D48]"
              placeholder="Tell the reviewer what you want checked."
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8F9FB]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={reviewLoading || !conversationId || !reviewEligible}
            className="rounded-full bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white hover:bg-[#BE123C] disabled:opacity-50"
          >
            {reviewLoading ? "Submitting..." : "Submit request"}
          </button>
        </div>
      </div>
    </div>
  );
}
