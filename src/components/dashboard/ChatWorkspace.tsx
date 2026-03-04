"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { SubscriptionTier } from "@/lib/tier";
import { TIER_CAPABILITIES } from "@/lib/tier";
import type { Citation } from "@/lib/rag/citations";
import { SourceCardsList } from "@/components/chat/SourceCard";

type Message = {
  role: "user" | "assistant";
  content: string;
  imagePreview?: string; // data URL shown in the user bubble for attached photos
  citations?: Citation[];
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
  dailyImageUploads: number;
  canExportPdf: boolean;
  canExportWord: boolean;
  isAdmin?: boolean;
};

export default function ChatWorkspace({
  userEmail,
  initialTier,
  initialUsage,
  usageLimit,
  dailyImageUploads,
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Image attachment state
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canUploadImages = isAdmin || dailyImageUploads > 0;

  const usageLabel = useMemo(
    () => (isAdmin ? `${usage} today (unlimited)` : `${usage}/${usageLimit} messages`),
    [isAdmin, usage, usageLimit]
  );
  const usagePercent = useMemo(() => {
    if (isAdmin) return 0;
    return Math.min(100, Math.round((usage / Math.max(usageLimit, 1)) * 100));
  }, [isAdmin, usage, usageLimit]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  function handleTextareaInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

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

  function startNewChat() {
    setConversationId(null);
    setMessages([]);
    setReviewRequests([]);
    clearImage();
    setError(null);
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

  async function requestHumanReview() {
    if (!conversationId || reviewLoading) return;
    setReviewLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, reviewType, notes: reviewNotes }),
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
      if (data.request) setReviewRequests((prev) => [data.request!, ...prev]);
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

    try {
      let res: Response;

      if (currentImage) {
        // Image upload path — FormData
        const fd = new FormData();
        fd.append("image", currentImage);
        fd.append("message", value);
        if (conversationId) fd.append("conversationId", conversationId);
        res = await fetch("/api/chat", { method: "POST", body: fd });
      } else {
        // Text-only path — JSON
        res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: value, conversationId }),
        });
      }

      const data = (await res.json()) as {
        error?: string;
        assistantMessage?: string;
        citations?: Citation[];
        ragEnabled?: boolean;
        conversationId?: string;
        usage?: { used: number; limit: number | null; tier: SubscriptionTier; isAdmin?: boolean };
      };

      if (!res.ok) {
        setError(data.error ?? "Request failed");
        setMessages((prev) => prev.slice(0, -1));
        setPrompt(value);
        if (currentImage) {
          setAttachedImage(currentImage);
          setImagePreview(currentImagePreview);
        }
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
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendPrompt(e as unknown as FormEvent);
    }
  }

  useEffect(() => { void loadConversations(); }, []);

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

  return (
    <>
      {/* Full-viewport chat layout below the sticky site header */}
      <div className="fixed left-0 right-0 bottom-0 top-14 md:top-16 flex overflow-hidden bg-[#F8F9FB]">
        {/* ── Sidebar ── */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } flex-shrink-0 transition-[width] duration-200 overflow-hidden border-r border-[#E2E8F0] bg-white flex flex-col`}
        >
          <div className="flex-shrink-0 px-3 pt-4 pb-3 border-b border-[#E2E8F0]">
            <button
              onClick={startNewChat}
              className="flex w-full items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] px-3 py-2 text-sm font-medium text-[#0F172A] transition-colors hover:bg-[#F1F5F9]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#E11D48]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingConversations ? (
              <p className="px-3 py-2 text-xs text-[#94A3B8]">Loading...</p>
            ) : conversations.length === 0 ? (
              <p className="px-3 py-2 text-xs text-[#94A3B8]">No conversations yet.</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs cursor-pointer transition-colors ${
                    conversationId === conv.id
                      ? "bg-[#FEF2F2] text-[#0F172A]"
                      : "text-[#334155] hover:bg-[#F1F5F9]"
                  }`}
                >
                  <button
                    onClick={() => void loadConversationMessages(conv.id)}
                    className="flex-1 text-left leading-snug font-medium truncate"
                  >
                    {conv.title || "Untitled conversation"}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); void removeConversation(conv.id); }}
                    className="ml-1 hidden group-hover:block flex-shrink-0 text-[#94A3B8] hover:text-[#E11D48]"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Sidebar footer: user info + billing */}
          <div className="flex-shrink-0 border-t border-[#E2E8F0] p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tierColour}`}>
                {isAdmin ? "Admin" : tier}
              </span>
              <span className="text-[11px] text-[#64748B] truncate">{usageLabel}</span>
            </div>
            {!isAdmin && (
              <div className="h-1 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                <div className="h-full rounded-full bg-[#E11D48]" style={{ width: `${usagePercent}%` }} />
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={refreshBillingStatus}
                disabled={billingLoading}
                className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-[11px] text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50"
              >
                {billingLoading ? "..." : "Refresh plan"}
              </button>
              <button
                onClick={openBillingPortal}
                disabled={billingLoading}
                className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-[11px] text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50"
              >
                Billing
              </button>
            </div>
            <p className="text-[10px] text-[#94A3B8] truncate">{userEmail}</p>
          </div>
        </aside>

        {/* ── Main chat area ── */}
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
              <Image src="/logo/PP_logo_nopadding.png" alt="PinkPepper" width={100} height={28} className="h-7 w-auto" />
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
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
              {messages.length === 0 && !loadingMessages && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-6">
                    <Image src="/logo/PP_logo_nopadding.png" alt="PinkPepper" width={160} height={44} className="h-11 w-auto mx-auto opacity-80" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#0F172A] mb-2">Food Safety Assistant</h2>
                  <p className="text-sm text-[#64748B] max-w-md">
                    Ask food safety questions, generate HACCP plans, create SOPs, or{" "}
                    {canUploadImages ? "attach a photo of your kitchen or a food label for instant analysis." : "upgrade to Plus or Pro to attach photos for analysis."}
                  </p>
                  <div className="mt-6 grid gap-2 grid-cols-1 sm:grid-cols-2 w-full max-w-lg">
                    {[
                      "Create a HACCP plan for a 25-seat café with hot holding",
                      "Draft a cleaning SOP for a commercial kitchen",
                      "What allergens must be declared under EU 1169/2011?",
                      "Generate a temperature monitoring log template",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => { setPrompt(suggestion); textareaRef.current?.focus(); }}
                        className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5 text-xs text-left text-[#475569] hover:bg-[#F8F9FB] hover:border-[#CBD5E1] transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loadingMessages && (
                <div className="flex justify-center py-8">
                  <span className="text-sm text-[#94A3B8]">Loading conversation...</span>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={`${msg.role}-${idx}`}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="mr-3 mt-1 flex-shrink-0">
                      <div className="h-7 w-7 rounded-full bg-[#E11D48] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  <div className={`max-w-[80%] ${msg.role === "user" ? "" : "flex-1"}`}>
                    {msg.imagePreview && (
                      <div className="mb-2 flex justify-end">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={msg.imagePreview}
                          alt="Attached photo"
                          className="max-h-48 max-w-xs rounded-xl border border-[#E2E8F0] object-cover"
                        />
                      </div>
                    )}

                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#E11D48] text-white rounded-br-sm"
                          : "bg-white border border-[#E2E8F0] text-[#0F172A] rounded-bl-sm"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>

                    {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2">
                        <SourceCardsList citations={msg.citations} maxInitialDisplay={3} />
                      </div>
                    )}

                    {msg.role === "assistant" && reviewEligible && conversationId && idx === messages.length - 1 && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => setReviewModalOpen(true)}
                          className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#64748B] hover:bg-[#F8F9FB] transition-colors"
                        >
                          Request expert review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="mr-3 mt-1 flex-shrink-0">
                    <div className="h-7 w-7 rounded-full bg-[#E11D48] flex items-center justify-center animate-pulse">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div className="rounded-2xl rounded-bl-sm border border-[#E2E8F0] bg-white px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-[#CBD5E1] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-[#CBD5E1] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-[#CBD5E1] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 border-t border-[#E2E8F0] bg-white px-4 py-3">
            <div className="mx-auto max-w-3xl">
              {/* Image preview strip */}
              {imagePreview && (
                <div className="mb-2 flex items-start gap-2">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Attached" className="h-16 w-16 rounded-lg object-cover border border-[#E2E8F0]" />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-[#E11D48] text-white flex items-center justify-center hover:bg-[#BE123C] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-xs text-[#64748B] mt-1">
                    {attachedImage?.name} — food safety analysis will be performed on this photo.
                  </span>
                </div>
              )}

              <form onSubmit={sendPrompt} className="flex items-end gap-2">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageSelect(f); }}
                />

                {/* Attach button */}
                {canUploadImages ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 rounded-xl border border-[#E2E8F0] bg-white p-2.5 text-[#64748B] hover:bg-[#F8F9FB] hover:text-[#0F172A] transition-colors"
                    title="Attach a photo for food safety analysis"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    href="/pricing"
                    className="flex-shrink-0 rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8F9FB] p-2.5 text-[#CBD5E1]"
                    title="Upgrade to Plus or Pro to analyse photos"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </Link>
                )}

                {/* Textarea */}
                <div className="relative flex-1">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => { setPrompt(e.target.value); handleTextareaInput(); }}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    className="w-full resize-none rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 pr-12 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-colors overflow-hidden"
                    placeholder={attachedImage ? "Add a note about this photo (optional)..." : "Ask a food safety question... (Shift+Enter for new line)"}
                    style={{ minHeight: "44px", maxHeight: "160px" }}
                  />
                </div>

                {/* Send button */}
                <button
                  type="submit"
                  disabled={loading || (!prompt.trim() && !attachedImage)}
                  className="flex-shrink-0 rounded-xl bg-[#E11D48] p-2.5 text-white hover:bg-[#BE123C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>

              <p className="mt-2 text-center text-[10px] text-[#94A3B8]">
                AI-assisted outputs must be reviewed by qualified personnel before use.
                {!isAdmin && tier === "free" && (
                  <> {" · "}<Link href="/pricing" className="underline hover:text-[#64748B]">Upgrade for photo analysis &amp; exports</Link></>
                )}
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Review modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-semibold text-[#0F172A]">Request Expert Review</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-[#94A3B8] hover:text-[#64748B]">
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
                  onChange={(e) => setReviewType(e.target.value as "quick_check" | "full_review")}
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
                  onChange={(e) => setReviewNotes(e.target.value)}
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
                onClick={() => setReviewModalOpen(false)}
                className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8F9FB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void requestHumanReview()}
                disabled={reviewLoading || !conversationId || !reviewEligible}
                className="rounded-full bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white hover:bg-[#BE123C] disabled:opacity-50"
              >
                {reviewLoading ? "Submitting..." : "Submit request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
