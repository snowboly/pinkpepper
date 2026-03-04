"use client";

type ReviewRequest = {
  id: string;
  status: string;
  review_type: string;
  created_at: string;
};

type ReviewModalProps = {
  open: boolean;
  conversationId: string | null;
  isAdmin: boolean;
  reviewEligible: boolean;
  reviewType: "quick_check" | "full_review";
  reviewNotes: string;
  reviewLoading: boolean;
  reviewInfo: { used: number; limit: number | null } | null;
  reviewRequests: ReviewRequest[];
  onClose: () => void;
  onSetReviewType: (type: "quick_check" | "full_review") => void;
  onSetReviewNotes: (notes: string) => void;
  onSubmit: () => void;
};

export default function ReviewModal({
  open,
  conversationId,
  isAdmin,
  reviewEligible,
  reviewType,
  reviewNotes,
  reviewLoading,
  reviewInfo,
  reviewRequests,
  onClose,
  onSetReviewType,
  onSetReviewNotes,
  onSubmit,
}: ReviewModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-[#0F172A]">Request Expert Review</h3>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#64748B]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-[#64748B] mb-4">A reviewer will assess this conversation and return structured feedback.</p>

        {reviewInfo && !isAdmin && (
          <p className="mb-3 text-xs text-[#64748B]">
            Reviews used this month: {reviewInfo.used}/{reviewInfo.limit ?? "unlimited"}
          </p>
        )}

        {conversationId && reviewRequests.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {reviewRequests.slice(0, 3).map((r) => (
              <span key={r.id} className="rounded-full border border-[#E2E8F0] bg-[#F8F9FB] px-2 py-0.5 text-xs text-[#64748B]">
                {r.review_type === "quick_check" ? "Quick Check" : "Full Review"}: {r.status}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-[#475569] font-medium">Review type</span>
            <select
              value={reviewType}
              onChange={(e) => onSetReviewType(e.target.value as "quick_check" | "full_review")}
              className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm outline-none focus:border-[#E11D48]"
            >
              <option value="quick_check">Quick Check</option>
              <option value="full_review">Full Review</option>
            </select>
          </label>
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
