"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { SubscriptionTier } from "@/lib/tier";
import { TIER_CAPABILITIES } from "@/lib/tier";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Conversation = {
  id: string;
  title: string | null;
  updated_at: string;
};

type Props = {
  userEmail: string;
  initialTier: SubscriptionTier;
  initialUsage: number;
  usageLimit: number;
  canExportPdf: boolean;
  canExportWord: boolean;
  isAdmin?: boolean;
};

export default function ChatWorkspace({
  userEmail,
  initialTier,
  initialUsage,
  usageLimit,
  canExportPdf,
  canExportWord,
  isAdmin: initialIsAdmin = false,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState<"pdf" | "docx" | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewType, setReviewType] = useState<"quick_check" | "full_review">("quick_check");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewInfo, setReviewInfo] = useState<{ used: number; limit: number | null } | null>(null);
  const [reviewRequests, setReviewRequests] = useState<Array<{ id: string; status: string; review_type: string; created_at: string }>>([]);
  const [tier, setTier] = useState<SubscriptionTier>(initialTier);
  const [usage, setUsage] = useState(initialUsage);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);

  const usageLabel = useMemo(
    () => (isAdmin ? `${usage} messages today (unlimited)` : `${usage}/${usageLimit} daily messages`),
    [isAdmin, usage, usageLimit]
  );
  const usagePercent = useMemo(() => {
    if (isAdmin) return 0;
    return Math.min(100, Math.round((usage / Math.max(usageLimit, 1)) * 100));
  }, [isAdmin, usage, usageLimit]);

  async function refreshBillingStatus() {
    setBillingError(null);
    setBillingLoading(true);
    try {
      const res = await fetch("/api/billing/status");
      const data = (await res.json()) as { tier?: SubscriptionTier; isAdmin?: boolean; error?: string };
      if (!res.ok || !data.tier) {
        setBillingError(data.error ?? "Failed to refresh billing status.");
        return;
      }
      setTier(data.tier);
      setIsAdmin(Boolean(data.isAdmin));
    } catch {
      setBillingError("Network error while refreshing billing status.");
    } finally {
      setBillingLoading(false);
    }
  }

  async function loadConversations() {
    setLoadingConversations(true);
    try {
      const res = await fetch("/api/chat/conversations");
      const data = (await res.json()) as { conversations?: Conversation[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to load conversations.");
        return;
      }
      setConversations(data.conversations ?? []);
    } catch {
      setError("Network error while loading conversations.");
    } finally {
      setLoadingConversations(false);
    }
  }

  async function loadConversationMessages(id: string) {
    setLoadingMessages(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat/conversations/${id}/messages`);
      const data = (await res.json()) as { messages?: Array<{ role: "user" | "assistant"; content: string }>; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to load messages.");
        return;
      }
      setConversationId(id);
      setMessages((data.messages ?? []).map((m) => ({ role: m.role, content: m.content })));
    } catch {
      setError("Network error while loading messages.");
    } finally {
      setLoadingMessages(false);
    }
  }

  async function loadReviewRequests(id: string) {
    try {
      const res = await fetch(`/api/reviews?conversationId=${encodeURIComponent(id)}`);
      const data = (await res.json()) as {
        requests?: Array<{ id: string; status: string; review_type: string; created_at: string }>;
      };
      if (!res.ok) return;
      setReviewRequests(data.requests ?? []);
    } catch {
      // Non-blocking
    }
  }

  async function removeConversation(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/chat/conversations/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to delete conversation.");
        return;
      }

      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (conversationId === id) {
        setConversationId(null);
        setMessages([]);
      }
    } catch {
      setError("Network error while deleting conversation.");
    }
  }

  async function openBillingPortal() {
    setBillingError(null);
    setBillingLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setBillingError(data.error ?? "Unable to open billing portal.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setBillingError("Network error while opening billing portal.");
    } finally {
      setBillingLoading(false);
    }
  }

  async function exportDocument(format: "pdf" | "docx") {
    setError(null);
    if (!conversationId) {
      setError("Send at least one prompt before exporting.");
      return;
    }

    setExportLoading(format);

    try {
      const res = await fetch(`/api/export/${format}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Export failed.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pinkpepper-export.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Network error while exporting.");
    } finally {
      setExportLoading(null);
    }
  }

  async function requestHumanReview() {
    if (!conversationId || reviewLoading) return;
    setReviewLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          reviewType,
          notes: reviewNotes,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        usage?: { used: number; limit: number | null };
        request?: { id: string; status: string; review_type: string; created_at: string };
      };

      if (!res.ok) {
        setError(data.error ?? "Failed to submit review request.");
        return;
      }

      setReviewInfo(data.usage ?? null);
      const createdRequest = data.request;
      if (createdRequest) {
        setReviewRequests((prev) => [createdRequest, ...prev]);
      }
      setReviewModalOpen(false);
      setReviewType("quick_check");
      setReviewNotes("");
    } catch {
      setError("Network error while requesting review.");
    } finally {
      setReviewLoading(false);
    }
  }

  async function sendPrompt(event: FormEvent) {
    event.preventDefault();
    const value = prompt.trim();
    if (!value || loading) return;

    setLoading(true);
    setError(null);
    setPrompt("");
    setMessages((prev) => [...prev, { role: "user", content: value }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value, conversationId }),
      });

      const data = (await res.json()) as {
        error?: string;
        assistantMessage?: string;
        conversationId?: string;
        usage?: { used: number; limit: number | null; tier: SubscriptionTier; isAdmin?: boolean };
      };

      if (!res.ok) {
        setError(data.error ?? "Request failed");
        setMessages((prev) => prev.slice(0, -1));
        setPrompt(value);
        return;
      }

      if (data.conversationId) setConversationId(data.conversationId);
      if (data.assistantMessage) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.assistantMessage! }]);
      }
      if (data.usage) {
        setUsage(data.usage.used);
        setTier(data.usage.tier);
        setIsAdmin(Boolean(data.usage.isAdmin));
      }

      await loadConversations();
    } catch {
      setError("Network error. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
      setPrompt(value);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      void loadConversationMessages(conversationId);
      void loadReviewRequests(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing") === "success") {
      void refreshBillingStatus();
    }
  }, []);

  const dynamicCapabilities = isAdmin
    ? {
        ...TIER_CAPABILITIES.pro,
        allowPdfExport: true,
        allowWordExport: true,
        monthlyHumanReviews: Number.MAX_SAFE_INTEGER,
      }
    : {
        ...TIER_CAPABILITIES[tier],
        allowPdfExport: TIER_CAPABILITIES[tier].allowPdfExport || canExportPdf,
        allowWordExport: TIER_CAPABILITIES[tier].allowWordExport || canExportWord,
      };

  const reviewEligible = isAdmin || dynamicCapabilities.monthlyHumanReviews > 0;

  return (
    <main className="pp-container py-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">PinkPepper Assistant</h1>
          <p className="text-sm text-[#6B6B6B]">Signed in as {userEmail}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isAdmin && (
            <Link href="/admin" className="rounded-full border border-[#D96C6C] bg-[#FCEEEE] px-3 py-1 font-semibold uppercase text-[#7A2C2C]">
              Admin
            </Link>
          )}
          <span className="rounded-full border border-[#E8DADA] bg-white px-3 py-1 font-semibold uppercase">{tier}</span>
          <span className="rounded-full border border-[#E8DADA] bg-white px-3 py-1">{usageLabel}</span>
          <button onClick={refreshBillingStatus} disabled={billingLoading} className="rounded-full border border-[#E8DADA] bg-white px-3 py-1">
            {billingLoading ? "Refreshing..." : "Refresh Plan"}
          </button>
          <button onClick={openBillingPortal} disabled={billingLoading} className="rounded-full border border-[#E8DADA] bg-white px-3 py-1">
            Billing
          </button>
        </div>
      </div>

      {!isAdmin && (
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[#F0E5E3]">
          <div className="h-full bg-[#D96C6C]" style={{ width: `${usagePercent}%` }} />
        </div>
      )}

      {billingError && <p className="mb-3 text-sm text-red-700">{billingError}</p>}
      {error && <p className="mb-3 text-sm text-red-700">{error}</p>}

      <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="pp-card h-[65vh] overflow-hidden">
          <div className="border-b border-[#E8DADA] px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Conversations</h2>
              <button
                onClick={() => {
                  setConversationId(null);
                  setMessages([]);
                }}
                className="text-xs underline"
              >
                New Chat
              </button>
            </div>
          </div>
          <div className="h-[calc(65vh-53px)] overflow-y-auto p-2">
            {loadingConversations ? (
              <p className="px-2 py-1 text-xs text-[#6B6B6B]">Loading...</p>
            ) : conversations.length === 0 ? (
              <p className="px-2 py-1 text-xs text-[#6B6B6B]">No conversations yet.</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`mb-2 rounded-xl border p-2 text-xs ${conversationId === conv.id ? "border-[#D96C6C] bg-[#FCEEEE]" : "border-[#E8DADA] bg-white"}`}
                >
                  <button onClick={() => void loadConversationMessages(conv.id)} className="w-full text-left font-medium">
                    {conv.title || "Untitled conversation"}
                  </button>
                  <div className="mt-2 flex items-center justify-between text-[#6B6B6B]">
                    <span>{new Date(conv.updated_at).toLocaleDateString()}</span>
                    <button onClick={() => void removeConversation(conv.id)} className="underline">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <section className="pp-card flex min-h-[65vh] flex-col overflow-hidden">
          <div className="border-b border-[#E8DADA] bg-[#FCFAF9] px-4 py-3 text-sm text-[#6B6B6B]">
            Ask food safety questions and generate structured documentation outputs.
            {reviewInfo && !isAdmin && (
              <span className="ml-2 inline-block rounded-full border border-[#E8DADA] bg-white px-2 py-0.5 text-xs">
                Reviews used this month: {reviewInfo.used}/{reviewInfo.limit ?? "unlimited"}
              </span>
            )}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
            {messages.length === 0 && !loadingMessages && (
              <div className="rounded-2xl border border-dashed border-[#E8DADA] bg-white p-6 text-sm text-[#6B6B6B]">
                Example prompt: Create a HACCP plan for a 25-seat cafe in Dublin with hot holding and chilled desserts.
              </div>
            )}

            {loadingMessages && (
              <div className="rounded-2xl border border-[#E8DADA] bg-white px-4 py-3 text-sm text-[#6B6B6B]">Loading conversation...</div>
            )}

            {messages.map((msg, idx) => (
              <article
                key={`${msg.role}-${idx}`}
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "ml-auto bg-[#FCEEEE] text-[#2B2B2B]"
                    : "mr-auto border border-[#E8DADA] bg-white text-[#2B2B2B]"
                }`}
              >
                {msg.content}
                {msg.role === "assistant" && reviewEligible && conversationId && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setReviewModalOpen(true)}
                      className="rounded-full border border-[#E8DADA] bg-white px-3 py-1 text-xs"
                    >
                      Send this for review
                    </button>
                  </div>
                )}
              </article>
            ))}

            {loading && (
              <div className="mr-auto max-w-[90%] rounded-2xl border border-[#E8DADA] bg-white px-4 py-3 text-sm text-[#6B6B6B]">
                Generating response...
              </div>
            )}
          </div>

          <div className="border-t border-[#E8DADA] p-4">
            <form onSubmit={sendPrompt} className="space-y-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-2xl border border-[#E8DADA] bg-white px-3 py-2 text-sm outline-none"
                placeholder="Ask a food safety question..."
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => void exportDocument("pdf")}
                    disabled={!dynamicCapabilities.allowPdfExport || exportLoading !== null}
                    className={`rounded-full border px-3 py-1 ${dynamicCapabilities.allowPdfExport ? "border-[#E8DADA] bg-white" : "border-[#E8DADA] bg-[#F5F1F0] text-[#9A8E8B]"}`}
                  >
                    {exportLoading === "pdf" ? "Exporting PDF..." : "Export PDF"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(true)}
                    disabled={!reviewEligible || !conversationId || reviewLoading}
                    className={`rounded-full border px-3 py-1 ${reviewEligible && conversationId ? "border-[#E8DADA] bg-white" : "border-[#E8DADA] bg-[#F5F1F0] text-[#9A8E8B]"}`}
                  >
                    {reviewLoading ? "Submitting..." : "Request Human Review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void exportDocument("docx")}
                    disabled={!dynamicCapabilities.allowWordExport || exportLoading !== null}
                    className={`rounded-full border px-3 py-1 ${dynamicCapabilities.allowWordExport ? "border-[#E8DADA] bg-white" : "border-[#E8DADA] bg-[#F5F1F0] text-[#9A8E8B]"}`}
                  >
                    {exportLoading === "docx" ? "Exporting DOCX..." : "Export DOCX"}
                  </button>
                </div>
                <button type="submit" disabled={loading || !prompt.trim()} className="pp-btn-primary">
                  {loading ? "Sending..." : "Send"}
                </button>
              </div>
            </form>

            {!isAdmin && tier === "free" && (
              <p className="mt-3 text-xs text-[#6B6B6B]">
                Free tier has limited daily messages, temporary storage, and no export. <Link href="/pricing" className="underline">Upgrade to Plus or Pro</Link>.
              </p>
            )}

            {conversationId && reviewRequests.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {reviewRequests.slice(0, 4).map((request) => (
                  <span key={request.id} className="rounded-full border border-[#E8DADA] bg-white px-3 py-1">
                    {request.review_type === "quick_check" ? "Quick Check" : "Full Review"}: {request.status}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      </section>

      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#E8DADA] bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-[#2B2B2B]">Request Human Review</h3>
            <p className="mt-1 text-sm text-[#6B6B6B]">A reviewer will assess this conversation output and return structured feedback.</p>

            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-[#6B6B6B]">Review Type</span>
                <select
                  value={reviewType}
                  onChange={(e) => setReviewType(e.target.value as "quick_check" | "full_review")}
                  className="w-full rounded-xl border border-[#E8DADA] bg-white px-3 py-2 text-sm"
                >
                  <option value="quick_check">Quick Check</option>
                  <option value="full_review">Full Review</option>
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-[#6B6B6B]">Notes for reviewer (optional)</span>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="w-full rounded-xl border border-[#E8DADA] bg-white px-3 py-2 text-sm"
                  placeholder="Tell the reviewer what you want checked."
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="rounded-full border border-[#E8DADA] bg-white px-3 py-1.5 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void requestHumanReview()}
                disabled={reviewLoading || !conversationId || !reviewEligible}
                className="pp-btn-primary"
              >
                {reviewLoading ? "Submitting..." : "Submit Review Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
