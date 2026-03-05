"use client";

import { useState, useEffect, useCallback } from "react";

type ReviewRequest = {
  id: string;
  user_id: string;
  user_email: string;
  conversation_id: string;
  review_type: string;
  document_category: string | null;
  status: string;
  priority: string;
  notes: string | null;
  reviewer_notes: string | null;
  reviewer_file_id: string | null;
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

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AdminReviewQueue() {
  const [reviews, setReviews] = useState<ReviewRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState<Record<string, string>>({});
  const [reviewerFiles, setReviewerFiles] = useState<Record<string, File>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (tab !== "all") params.set("status", tab);
      const res = await fetch(`/api/admin/reviews?${params}`);
      if (!res.ok) throw new Error("Failed to load reviews");
      const data = await res.json();
      setReviews(data.requests);
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

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const notes = reviewerNotes[id]?.trim() ?? "";
    if ((newStatus === "completed" || newStatus === "rejected") && !notes) {
      setError("Please add reviewer notes before completing or rejecting.");
      return;
    }

    setActionLoading(id);
    setError(null);
    try {
      const file = reviewerFiles[id];
      let res: Response;

      if (file) {
        // Use FormData when a file is attached
        const fd = new FormData();
        fd.append("status", newStatus);
        if (notes) fd.append("reviewer_notes", notes);
        fd.append("file", file);
        res = await fetch(`/api/admin/reviews/${id}`, { method: "PATCH", body: fd });
      } else {
        res = await fetch(`/api/admin/reviews/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus, reviewer_notes: notes || undefined }),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update review");
      }
      // Clean up local state for this review
      setReviewerFiles((prev) => { const next = { ...prev }; delete next[id]; return next; });
      await fetchReviews();
      setExpandedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update review.");
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#E2E8F0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-[#64748B] hover:text-[#0F172A] text-sm">&larr; Dashboard</a>
            <h1 className="text-xl font-semibold text-[#0F172A]">Review Queue</h1>
            <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs text-[#64748B]">{total} total</span>
          </div>
          <button onClick={fetchReviews} className="rounded-full border border-[#E2E8F0] px-3 py-1.5 text-sm text-[#64748B] hover:bg-[#F8F9FB]">
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-6">
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
          <div className="py-12 text-center text-[#94A3B8]">No reviews found.</div>
        )}

        {/* Review cards */}
        {!loading && reviews.length > 0 && (
          <div className="space-y-3">
            {reviews.map((r) => {
              const colors = STATUS_COLORS[r.status] ?? STATUS_COLORS.queued;
              const isExpanded = expandedId === r.id;
              const isActionable = r.status === "queued" || r.status === "in_review";

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
                        {r.priority === "priority" && (
                          <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                            Priority
                          </span>
                        )}
                        <span className="text-sm font-medium text-[#0F172A]">
                          {CATEGORY_LABELS[r.document_category ?? ""] ?? r.review_type}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-[#94A3B8]">
                        <span>{r.user_email}</span>
                        <span>{r.review_type === "full_review" ? "Full Review" : "Quick Check"}</span>
                        <span>{timeAgo(r.created_at)}</span>
                      </div>
                      {r.notes && !isExpanded && (
                        <p className="mt-1 text-xs text-[#64748B] line-clamp-2">{r.notes}</p>
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
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-1">User Notes</p>
                          <p className="text-sm text-[#475569] whitespace-pre-wrap">{r.notes}</p>
                        </div>
                      )}

                      {/* Snapshot content */}
                      {r.snapshot_content && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-1">Snapshot Content</p>
                          <div className="max-h-64 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-sm text-[#334155] whitespace-pre-wrap">
                            {r.snapshot_content}
                          </div>
                        </div>
                      )}

                      {/* Existing reviewer notes (read-only for completed/rejected) */}
                      {!isActionable && r.reviewer_notes && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-1">Reviewer Notes</p>
                          <div className="rounded-xl border border-[#E2E8F0] bg-[#F0FDF4] p-3 text-sm text-[#334155] whitespace-pre-wrap">
                            {r.reviewer_notes}
                          </div>
                        </div>
                      )}

                      {/* Existing attached file (read-only for completed/rejected) */}
                      {!isActionable && r.reviewer_file_id && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-1">Attached Document</p>
                          <a
                            href={`/api/reviews/${r.id}/file`}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#64748B] hover:bg-[#F8F9FB]"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download annotated document
                          </a>
                        </div>
                      )}

                      {/* Reviewer notes input + actions (for actionable reviews) */}
                      {isActionable && (
                        <>
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-1">
                              Reviewer Notes {r.status === "in_review" && <span className="normal-case text-[#64748B]">(required to complete/reject)</span>}
                            </label>
                            <textarea
                              value={reviewerNotes[r.id] ?? r.reviewer_notes ?? ""}
                              onChange={(e) => setReviewerNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                              rows={4}
                              className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm outline-none focus:border-[#E11D48]"
                              placeholder="Add feedback for the user..."
                            />
                          </div>
                          {/* File attachment (optional) */}
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-1">
                              Attach annotated document <span className="normal-case text-[#64748B]">(optional, PDF or DOCX)</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) setReviewerFiles((prev) => ({ ...prev, [r.id]: f }));
                                }}
                                className="text-sm text-[#64748B] file:mr-2 file:rounded-full file:border file:border-[#E2E8F0] file:bg-white file:px-3 file:py-1 file:text-xs file:text-[#64748B] hover:file:bg-[#F8F9FB]"
                              />
                              {reviewerFiles[r.id] && (
                                <button
                                  onClick={() => setReviewerFiles((prev) => { const next = { ...prev }; delete next[r.id]; return next; })}
                                  className="text-xs text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {r.status === "queued" && (
                              <button
                                onClick={() => handleStatusUpdate(r.id, "in_review")}
                                disabled={actionLoading === r.id}
                                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                              >
                                {actionLoading === r.id ? "Updating..." : "Pick Up"}
                              </button>
                            )}
                            {r.status === "in_review" && (
                              <button
                                onClick={() => handleStatusUpdate(r.id, "completed")}
                                disabled={actionLoading === r.id}
                                className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                              >
                                {actionLoading === r.id ? "Updating..." : "Complete"}
                              </button>
                            )}
                            <button
                              onClick={() => handleStatusUpdate(r.id, "rejected")}
                              disabled={actionLoading === r.id}
                              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </>
                      )}
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
