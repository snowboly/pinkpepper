"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { SubscriptionTier } from "@/lib/tier";
import { TIER_CAPABILITIES } from "@/lib/tier";
import type { Citation } from "@/lib/rag/citations";
import type { Message, Conversation, ChatWorkspaceProps } from "./types";
import ChatSidebar from "./ChatSidebar";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import ReviewModal from "./ReviewModal";

export default function ChatWorkspace({
  userEmail,
  initialTier,
  initialUsage,
  usageLimit,
  dailyImageUploads,
  canExportPdf,
  canExportWord,
  isAdmin: initialIsAdmin = false,
}: ChatWorkspaceProps) {
  // ── Core chat state ──
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Billing state ──
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [tier, setTier] = useState<SubscriptionTier>(initialTier);
  const [usage, setUsage] = useState(initialUsage);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);

  // ── Export state ──
  const [exportLoading, setExportLoading] = useState<"pdf" | "docx" | null>(null);

  // ── Review state ──
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [documentCategory, setDocumentCategory] = useState("async_qa");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewInfo, setReviewInfo] = useState<{ used: number; limit: number | null } | null>(null);
  const [reviewRequests, setReviewRequests] = useState<Array<{ id: string; status: string; review_type: string; document_category?: string; created_at: string }>>([]);

  // ── Image attachment state ──
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ── UI state ──
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const canUploadImages = isAdmin || dailyImageUploads > 0;

  // ── Derived values ──
  const usageLabel = useMemo(
    () => (isAdmin ? `${usage} today (unlimited)` : `${usage}/${usageLimit} messages`),
    [isAdmin, usage, usageLimit]
  );
  const usagePercent = useMemo(() => {
    if (isAdmin) return 0;
    return Math.min(100, Math.round((usage / Math.max(usageLimit, 1)) * 100));
  }, [isAdmin, usage, usageLimit]);

  const dynamicCapabilities = isAdmin
    ? { ...TIER_CAPABILITIES.pro, allowPdfExport: true, allowWordExport: true, monthlyHumanReviews: Number.MAX_SAFE_INTEGER }
    : {
        ...TIER_CAPABILITIES[tier],
        allowPdfExport: TIER_CAPABILITIES[tier].allowPdfExport || canExportPdf,
        allowWordExport: TIER_CAPABILITIES[tier].allowWordExport || canExportWord,
      };

  const reviewEligible = isAdmin || dynamicCapabilities.monthlyHumanReviews > 0;

  const tierColour = isAdmin
    ? "border-[#7C3AED] bg-[#F5F3FF] text-[#5B21B6]"
    : tier === "pro"
    ? "border-[#059669] bg-[#ECFDF5] text-[#047857]"
    : tier === "plus"
    ? "border-[#D97706] bg-[#FFFBEB] text-[#92400E]"
    : "border-[#E2E8F0] bg-white text-[#64748B]";

  // ── Image helpers ──
  function handleImageSelect(file: File) {
    if (!canUploadImages) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG, WebP, and GIF images are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    setAttachedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setAttachedImage(null);
    setImagePreview(null);
  }

  // ── Billing ──
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

  // ── Conversations ──
  const loadConversations = useCallback(async () => {
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
  }, []);

  async function loadConversationMessages(id: string) {
    abortControllerRef.current?.abort();
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

  async function renameConversation(id: string, newTitle: string) {
    try {
      const res = await fetch(`/api/chat/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
        );
      }
    } catch {
      // Non-blocking
    }
  }

  function startNewChat() {
    abortControllerRef.current?.abort();
    setConversationId(null);
    setMessages([]);
    setReviewRequests([]);
    clearImage();
    setError(null);
  }

  // ── Reviews ──
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

  async function requestHumanReview() {
    if (!conversationId || reviewLoading) return;
    setReviewLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, documentCategory, notes: reviewNotes }),
      });
      const data = (await res.json()) as {
        error?: string;
        usage?: { used: number; limit: number | null };
        request?: { id: string; status: string; review_type: string; document_category?: string; created_at: string };
      };
      if (!res.ok) {
        setError(data.error ?? "Failed to submit review request.");
        return;
      }
      setReviewInfo(data.usage ?? null);
      if (data.request) setReviewRequests((prev) => [data.request!, ...prev]);
      setReviewSubmitted(true);
      setDocumentCategory("async_qa");
      setReviewNotes("");
    } catch {
      setError("Network error while requesting review.");
    } finally {
      setReviewLoading(false);
    }
  }

  // ── Export ──
  async function exportDocument(format: "pdf" | "docx") {
    setError(null);
    if (!conversationId) {
      setError("Send at least one message before exporting.");
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

  // ── Send message (with streaming for text, JSON for images) ──
  async function sendPrompt(event: FormEvent) {
    event.preventDefault();
    const value = prompt.trim();
    if ((!value && !attachedImage) || loading) return;

    setLoading(true);
    setError(null);
    setPrompt("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMessage: Message = {
      role: "user",
      content: attachedImage ? (value || "Analyse this image for food safety concerns.") : value,
      imagePreview: imagePreview ?? undefined,
    };
    setMessages((prev) => [...prev, userMessage]);

    const currentImage = attachedImage;
    const currentImagePreview = imagePreview;
    clearImage();

    // Image uploads use the existing JSON endpoint
    if (currentImage) {
      try {
        const fd = new FormData();
        fd.append("image", currentImage);
        fd.append("message", value);
        if (conversationId) fd.append("conversationId", conversationId);
        const res = await fetch("/api/chat", { method: "POST", body: fd });
        const data = (await res.json()) as {
          error?: string;
          assistantMessage?: string;
          citations?: Citation[];
          conversationId?: string;
          usage?: { used: number; limit: number | null; tier: SubscriptionTier; isAdmin?: boolean };
        };
        if (!res.ok) {
          setError(data.error ?? "Request failed");
          setMessages((prev) => prev.slice(0, -1));
          setPrompt(value);
          setAttachedImage(currentImage);
          setImagePreview(currentImagePreview);
          return;
        }
        if (data.conversationId) setConversationId(data.conversationId);
        if (data.assistantMessage) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.assistantMessage!, citations: data.citations },
          ]);
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
      return;
    }

    // Text messages use the streaming endpoint
    abortControllerRef.current = new AbortController();
    setMessages((prev) => [...prev, { role: "assistant", content: "", isStreaming: true }]);

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value, conversationId }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        let errMsg = "Request failed";
        try {
          const data = await res.json();
          errMsg = data.error ?? errMsg;
        } catch { /* body may not be JSON */ }
        setError(errMsg);
        setMessages((prev) => prev.slice(0, -2)); // remove user + placeholder
        setPrompt(value);
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;

        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last potentially incomplete line in the buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") continue;

          let event: { type: string; delta?: string; conversationId?: string; citations?: Citation[]; usage?: { used: number; limit: number | null; tier: SubscriptionTier; isAdmin?: boolean } };
          try {
            event = JSON.parse(payload);
          } catch {
            continue;
          }

          if (event.type === "metadata" && event.conversationId) {
            setConversationId(event.conversationId);
          } else if (event.type === "content" && event.delta) {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              updated[updated.length - 1] = { ...last, content: last.content + event.delta };
              return updated;
            });
          } else if (event.type === "done") {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              updated[updated.length - 1] = {
                ...last,
                isStreaming: false,
                citations: event.citations,
              };
              return updated;
            });
            if (event.usage) {
              setUsage(event.usage.used);
              setTier(event.usage.tier);
              setIsAdmin(Boolean(event.usage.isAdmin));
            }
          }
        }
      }

      await loadConversations();
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User navigated away — keep partial content visible
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.isStreaming) {
            updated[updated.length - 1] = { ...last, isStreaming: false };
          }
          return updated;
        });
      } else {
        setError("Network error. Please try again.");
        setMessages((prev) => prev.slice(0, -2));
        setPrompt(value);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendPrompt(e as unknown as FormEvent);
    }
  }

  // ── Effects ──
  useEffect(() => { void loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (conversationId) {
      void loadConversationMessages(conversationId);
      void loadReviewRequests(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing") === "success") void refreshBillingStatus();
  }, []);

  // ── Render ──
  return (
    <>
      <div className="fixed left-0 right-0 bottom-0 top-14 md:top-16 flex overflow-hidden bg-[#F8F9FB]">
        {/* Sidebar */}
        <ChatSidebar
          conversations={conversations}
          activeConversationId={conversationId}
          loadingConversations={loadingConversations}
          sidebarOpen={sidebarOpen}
          userEmail={userEmail}
          tier={tier}
          isAdmin={isAdmin}
          usageLabel={usageLabel}
          usagePercent={usagePercent}
          billingLoading={billingLoading}
          tierColour={tierColour}
          onNewChat={startNewChat}
          onSelectConversation={(id) => { setConversationId(id); }}
          onDeleteConversation={(id) => void removeConversation(id)}
          onRenameConversation={(id, title) => void renameConversation(id, title)}
          onRefreshBilling={() => void refreshBillingStatus()}
          onOpenBilling={() => void openBillingPortal()}
        />

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main chat area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <div className="flex-shrink-0 flex items-center gap-2 border-b border-[#E2E8F0] bg-white px-4 py-2.5">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-1.5">
              <Image src="/logo/LogoV3.png" alt="PinkPepper" width={100} height={28} className="h-7 w-auto" />
            </div>

            <div className="ml-auto flex items-center gap-2">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-full border border-[#7C3AED] bg-[#F5F3FF] px-3 py-1 text-xs font-bold uppercase text-[#5B21B6]"
                >
                  Admin
                </Link>
              )}
              {reviewEligible && conversationId && (
                <button
                  onClick={() => setReviewModalOpen(true)}
                  disabled={reviewLoading}
                  className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50"
                >
                  Request review
                </button>
              )}
              {dynamicCapabilities.allowPdfExport && (
                <button
                  onClick={() => void exportDocument("pdf")}
                  disabled={exportLoading !== null || !conversationId}
                  className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50"
                >
                  {exportLoading === "pdf" ? "Exporting..." : "PDF"}
                </button>
              )}
              {dynamicCapabilities.allowWordExport && (
                <button
                  onClick={() => void exportDocument("docx")}
                  disabled={exportLoading !== null || !conversationId}
                  className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50"
                >
                  {exportLoading === "docx" ? "Exporting..." : "DOCX"}
                </button>
              )}
            </div>
          </div>

          {/* Error banners */}
          {(error || billingError) && (
            <div className="flex-shrink-0 bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700 flex items-center justify-between">
              <span>{error ?? billingError}</span>
              <button onClick={() => { setError(null); setBillingError(null); }} className="text-red-400 hover:text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Messages */}
          <ChatMessages
            messages={messages}
            loading={loading}
            loadingMessages={loadingMessages}
            conversationId={conversationId}
            reviewEligible={reviewEligible}
            canUploadImages={canUploadImages}
            onSetPrompt={setPrompt}
            onFocusInput={() => textareaRef.current?.focus()}
            onRequestReview={() => setReviewModalOpen(true)}
          />

          {/* Input */}
          <ChatInput
            prompt={prompt}
            loading={loading}
            attachedImage={attachedImage}
            imagePreview={imagePreview}
            canUploadImages={canUploadImages}
            isAdmin={isAdmin}
            tier={tier}
            onPromptChange={setPrompt}
            onSubmit={sendPrompt}
            onImageSelect={handleImageSelect}
            onClearImage={clearImage}
            onKeyDown={handleKeyDown}
            textareaRef={textareaRef}
          />
        </main>
      </div>

      {/* Review modal */}
      <ReviewModal
        open={reviewModalOpen}
        conversationId={conversationId}
        isAdmin={isAdmin}
        reviewEligible={reviewEligible}
        allowFullDocumentReview={dynamicCapabilities.allowFullDocumentReview ?? false}
        reviewTurnaround={dynamicCapabilities.reviewTurnaround}
        documentCategory={documentCategory}
        reviewNotes={reviewNotes}
        reviewLoading={reviewLoading}
        reviewSubmitted={reviewSubmitted}
        reviewInfo={reviewInfo}
        reviewRequests={reviewRequests}
        onClose={() => { setReviewModalOpen(false); setReviewSubmitted(false); }}
        onSetDocumentCategory={setDocumentCategory}
        onSetReviewNotes={setReviewNotes}
        onSubmit={() => void requestHumanReview()}
      />
    </>
  );
}
