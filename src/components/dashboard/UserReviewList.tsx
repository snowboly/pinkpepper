"use client";

import { useState, useEffect, useCallback } from "react";

type ReviewRequest = {
  id: string;
  conversation_id: string;
  review_type: string;
  document_category: string | null;
  status: string;
  notes: string | null;
  reviewer_notes: string | null;
  snapshot_content: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  async_qa: "Async Q&A",
  process_flow: "Process Flow Review",
  log_review: "Log / Record Review",
  short_procedure: "Short Procedure",
  full_haccp_plan: "Full HACCP Plan",
  ccp_review: "CCP Review",
  prps_review: "PRPs Review",
  operations_manual: "Operations Manual",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  queued: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  in_review: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  completed: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

const TABS = ["all", "queued", "in_review", "completed", "rejected"] as const;
const TAB_LABELS: Record<string, string> = {
  all: "All",
  queued: "Queued",
  in_review: "In Review",
  completed: "Completed",
  rejected: "Rejected",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function UserReviewList() {
  const [reviews, setReviews] = useState<ReviewRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      const res = await fetch(`/api/reviews?${params}`);
      if (!res.ok) throw new Error("Failed to load reviews");
      const data = await res.json();
      // Client-side filter by tab
      const filtered = tab === "all" ? data.requests : data.requests.filter((r: ReviewRequest) => r.status === tab);
      setReviews(filtered);
      setTotal(data.total);
    } catch {
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, [page, tab]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#E2E8F0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-[#64748B] hover:text-[#0F172A] text-sm">&larr; Dashboard</a>
            <h1 className="text-xl font-semibold text-[#0F172A]">My Reviews</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-6">
        {/* Filter tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1); }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-[#E11D48] text-white"
                  : "border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8F9FB]"
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-12 text-center text-[#94A3B8]">Loading reviews...</div>
        )}

        {/* Empty */}
        {!loading && reviews.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-[#94A3B8] mb-2">No reviews found.</p>
            <p className="text-xs text-[#94A3B8]">Submit a review request from any conversation in your dashboard.</p>
          </div>
        )}

        {/* Review cards */}
        {!loading && reviews.length > 0 && (
          <div className="space-y-3">
            {reviews.map((r) => {
              const colors = STATUS_COLORS[r.status] ?? STATUS_COLORS.queued;
              const isExpanded = expandedId === r.id;
              const hasReviewerFeedback = r.reviewer_notes && (r.status === "completed" || r.status === "rejected");

              return (
                <div key={r.id} className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
                  {/* Card header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    className="flex w-full items-start gap-3 px-5 py-4 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                          {r.status.replace("_", " ")}
                        </span>
                        <span className="text-sm font-medium text-[#0F172A]">
                          {CATEGORY_LABELS[r.document_category ?? ""] ?? r.review_type}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-[#94A3B8]">
                        <span>{r.review_type === "full_review" ? "Full Review" : "Quick Check"}</span>
                        <span>Submitted {formatDate(r.created_at)}</span>
                        {r.completed_at && <span>Completed {formatDate(r.completed_at)}</span>}
                      </div>
                      {hasReviewerFeedback && !isExpanded && (
                        <p className="mt-1 text-xs text-green-700 font-medium">Feedback available — click to view</p>
                      )}
                    </div>
                    <svg
                      className={`h-5 w-5 text-[#94A3B8] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-[#E2E8F0] px-5 py-4 space-y-4">
                      {/* User notes */}
                      {r.notes && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-1">Your Notes</p>
                          <p className="text-sm text-[#475569] whitespace-pre-wrap">{r.notes}</p>
                        </div>
                      )}

                      {/* Snapshot content preview */}
                      {r.snapshot_content && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-1">Submitted Content</p>
                          <div className="max-h-40 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-sm text-[#334155] whitespace-pre-wrap">
                            {r.snapshot_content}
                          </div>
                        </div>
                      )}

                      {/* Reviewer feedback */}
                      {r.status === "completed" && r.reviewer_notes && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-1">Reviewer Feedback</p>
                          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-[#334155] whitespace-pre-wrap">
                            {r.reviewer_notes}
                          </div>
                        </div>
                      )}

                      {/* Rejection reason */}
                      {r.status === "rejected" && r.reviewer_notes && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-red-600 mb-1">Reason for Decline</p>
                          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#334155] whitespace-pre-wrap">
                            {r.reviewer_notes}
                          </div>
                          <p className="mt-2 text-xs text-[#94A3B8]">This does not count against your monthly review quota.</p>
                        </div>
                      )}

                      {/* Link to conversation */}
                      <a
                        href={`/dashboard?conversation=${r.conversation_id}`}
                        className="inline-block rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8F9FB]"
                      >
                        Open conversation
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-full border border-[#E2E8F0] px-3 py-1.5 text-sm text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-[#64748B]">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-full border border-[#E2E8F0] px-3 py-1.5 text-sm text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
