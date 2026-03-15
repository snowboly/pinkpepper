"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { track } from "@vercel/analytics";
import type { SubscriptionTier } from "@/lib/tier";
import { TIER_CAPABILITIES } from "@/lib/tier";
import type { Citation } from "@/lib/rag/citations";
import { getPersonaForConversation } from "@/lib/personas";
import type { Message, Conversation, Project, ChatWorkspaceProps, PersonaInfo } from "./types";
import ChatSidebar from "./ChatSidebar";
import ChatMessages, { type StarterSuggestion } from "./ChatMessages";
import ChatInput from "./ChatInput";
import OnboardingModal from "./OnboardingModal";
import UpgradeModal from "./UpgradeModal";
import ReviewContactModal from "./ReviewContactModal";
import { useAttachments } from "./useAttachments";
import { useAudioRecording } from "./useAudioRecording";
import { parseMessageArtifact, parseMessageCitations } from "./chat-message-metadata";
import { applyStreamError } from "./chat-stream-state";

type StreamUsage = { used: number; limit: number | null; tier: SubscriptionTier; isAdmin?: boolean };
type WorkspaceMode = "ask" | "virtual_audit";
type DocWizard = {
  id: string;
  wizardKey: string;
  questionCount: number;
  buildPrompt: (answers: string[]) => string;
};



const DOC_WIZARDS: Record<string, DocWizard> = {
  "HACCP plan": {
    id: "haccp_plan",
    wizardKey: "haccpPlan",
    questionCount: 6,
    buildPrompt: (answers) =>
      `Create a complete, audit-ready HACCP Plan document using the business details below.\n\n` +
      `Business details:\n` +
      `1) ${answers[0] ?? ""}\n` +
      `2) ${answers[1] ?? ""}\n` +
      `3) ${answers[2] ?? ""}\n` +
      `4) ${answers[3] ?? ""}\n` +
      `5) ${answers[4] ?? ""}\n` +
      `6) ${answers[5] ?? ""}\n\n` +
      `Output requirements:\n` +
      `- Full HACCP structure: scope, product/process description, flow, hazard analysis, CCPs, critical limits, monitoring, corrective actions, verification, records.\n` +
      `- Use clear headings and practical tables.\n` +
      `- Use EU/UK compliant temperature and allergen control language where relevant.\n` +
      `- Include version control block (Document No, Version, Date, Approved by).`,
  },
  "Cleaning SOP": {
    id: "cleaning_sop",
    wizardKey: "cleaningSop",
    questionCount: 5,
    buildPrompt: (answers) =>
      `Draft a complete Cleaning and Disinfection SOP using the following details:\n\n` +
      `1) ${answers[0] ?? ""}\n` +
      `2) ${answers[1] ?? ""}\n` +
      `3) ${answers[2] ?? ""}\n` +
      `4) ${answers[3] ?? ""}\n` +
      `5) ${answers[4] ?? ""}\n\n` +
      `Requirements:\n` +
      `- Structure: Purpose, Scope, Responsibilities, Materials/Chemicals, Procedure, Frequency, Verification, Corrective Action, Records.\n` +
      `- Include example cleaning schedule and sign-off log table.\n` +
      `- Keep wording operational and audit-friendly.`,
  },
  "Temp monitoring log": {
    id: "temp_log",
    wizardKey: "tempLog",
    questionCount: 4,
    buildPrompt: (answers) =>
      `Generate a practical Temperature Monitoring Log pack based on:\n\n` +
      `1) ${answers[0] ?? ""}\n` +
      `2) ${answers[1] ?? ""}\n` +
      `3) ${answers[2] ?? ""}\n` +
      `4) ${answers[3] ?? ""}\n\n` +
      `Requirements:\n` +
      `- Provide separate tables where useful (fridge/freezer/hot-hold/cooking/delivery).\n` +
      `- Include date, time, item/equipment, reading, limit, pass/fail, corrective action, initials/sign-off.\n` +
      `- Add concise guidance on what to do when limits are breached.`,
  },
  "Supplier approval": {
    id: "supplier_approval",
    wizardKey: "supplierApproval",
    questionCount: 5,
    buildPrompt: (answers) =>
      `Create a full Supplier Approval Procedure using:\n\n` +
      `1) ${answers[0] ?? ""}\n` +
      `2) ${answers[1] ?? ""}\n` +
      `3) ${answers[2] ?? ""}\n` +
      `4) ${answers[3] ?? ""}\n` +
      `5) ${answers[4] ?? ""}\n\n` +
      `Requirements:\n` +
      `- Include onboarding checks, approval criteria, ongoing monitoring, non-conformance handling, and reapproval.\n` +
      `- Include a supplier questionnaire/checklist template.\n` +
      `- Include record-keeping table and responsibilities.`,
  },
};

const DOC_GENERATION_TYPES: Record<DocWizard["id"], string> = {
  haccp_plan: "haccp_plan",
  cleaning_sop: "cleaning_sop",
  temp_log: "temperature_log",
  supplier_approval: "supplier_approval",
};

function summarizeArtifactContent(content: string) {
  const flattened = content
    .replace(/[#*_`>\-\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (flattened.length <= 160) {
    return flattened;
  }

  return `${flattened.slice(0, 157).trimEnd()}...`;
}

export default function ChatWorkspace({
  userEmail,
  initialTier,
  initialUsage,
  usageLimit,
  dailyImageUploads,
  canExportPdf,
  canExportWord,
  canReview,
  isAdmin: initialIsAdmin = false,
  onboardingCompleted = false,
}: ChatWorkspaceProps) {
  const tw = useTranslations("workspace");
  const tc = useTranslations("chat");
  // ── Core chat state ──
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentPersona, setCurrentPersona] = useState<PersonaInfo | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Projects state ──
  const [projects, setProjects] = useState<Project[]>([]);

  // ── Billing state ──
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [tier, setTier] = useState<SubscriptionTier>(initialTier);
  const [usage, setUsage] = useState(initialUsage);
  const [currentUsageLimit, setUsageLimit] = useState(usageLimit);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);

  // ── Export state ──
  const [exportLoading, setExportLoading] = useState<"pdf" | null>(null);


  // ── Image attachment state ──

  // ── Document attachment state ──


  // ── Onboarding state ──
  const [showOnboarding, setShowOnboarding] = useState(!onboardingCompleted);

  // ── Review contact modal ──
  const [showReviewModal, setShowReviewModal] = useState(false);

  // ── Upgrade modal state ──
  const [upgradeModalTrigger, setUpgradeModalTrigger] = useState<"message_limit" | "image_limit" | "export" | "review" | "audit_mode" | "transcription_limit" | "document_generation" | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("ask");
  const [activeDocWizard, setActiveDocWizard] = useState<DocWizard | null>(null);
  const [docWizardStep, setDocWizardStep] = useState(0);
  const [docWizardAnswers, setDocWizardAnswers] = useState<string[]>([]);

  // ── UI state ──
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const typingQueueRef = useRef("");
  const typingIntervalRef = useRef<number | null>(null);
  const pendingDoneRef = useRef<{ citations?: Citation[]; usage?: StreamUsage } | null>(null);

  const canUploadImages = isAdmin || dailyImageUploads > 0;

  // Never allow API responses to downgrade a paid tier to free (e.g. due to a transient
  // DB error returning null profile data). Only refreshBillingStatus() should freely
  // change tier since it queries the authoritative billing endpoint.
  const TIER_RANK: Record<SubscriptionTier, number> = { free: 0, plus: 1, pro: 2 };
  const safeTierUpdate = useCallback((incoming: SubscriptionTier) => {
    setTier((current) => TIER_RANK[incoming] >= TIER_RANK[current] ? incoming : current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushAssistantMessage = useCallback((content: string, persona?: PersonaInfo | null) => {
    setMessages((prev) => [...prev, { role: "assistant", content, persona: persona ?? undefined }]);
  }, []);

  const clearTypingInterval = useCallback(() => {
    if (typingIntervalRef.current) {
      cancelAnimationFrame(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  }, []);

  const finalizeStreamingMessage = useCallback((doneData: { citations?: Citation[]; usage?: StreamUsage } | null) => {
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last?.isStreaming) {
        updated[updated.length - 1] = {
          ...last,
          isStreaming: false,
          citations: doneData?.citations,
        };
      }
      return updated;
    });
    if (doneData?.usage) {
      setUsage(doneData.usage.used);
      safeTierUpdate(doneData.usage.tier);
      setIsAdmin(Boolean(doneData.usage.isAdmin));
    }
  }, [safeTierUpdate]);

  const startTypingDrain = useCallback(() => {
    if (typingIntervalRef.current) return;
    const drain = () => {
      const queue = typingQueueRef.current;

      if (queue.length > 0) {
        const chunkSize = queue.length > 40 ? 4 : queue.length > 20 ? 3 : 2;
        const nextChunk = queue.slice(0, chunkSize);
        typingQueueRef.current = queue.slice(chunkSize);
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (!last) return prev;
          updated[updated.length - 1] = { ...last, content: last.content + nextChunk };
          return updated;
        });
        typingIntervalRef.current = requestAnimationFrame(drain);
        return;
      }

      if (pendingDoneRef.current) {
        finalizeStreamingMessage(pendingDoneRef.current);
        pendingDoneRef.current = null;
      }
      typingIntervalRef.current = null;
    };
    typingIntervalRef.current = requestAnimationFrame(drain);
  }, [finalizeStreamingMessage]);

  // ── Drag & drop image onto chat area ──
  function handleDragOver(e: React.DragEvent) {
    if (!canUploadImages) return;
    e.preventDefault();
    setIsDraggingOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingOver(false);
    if (!canUploadImages) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  }

  // ── Derived values ──
  const usagePercent = useMemo(() => {
    if (isAdmin) return 0;
    return Math.min(100, Math.round((usage / Math.max(currentUsageLimit, 1)) * 100));
  }, [isAdmin, usage, currentUsageLimit]);

  const dynamicCapabilities = isAdmin
    ? { ...TIER_CAPABILITIES.pro, allowPdfExport: true, allowWordExport: true, monthlyHumanReviews: Number.MAX_SAFE_INTEGER }
    : {
        ...TIER_CAPABILITIES[tier],
        allowPdfExport: TIER_CAPABILITIES[tier].allowPdfExport || canExportPdf,
        allowWordExport: TIER_CAPABILITIES[tier].allowWordExport || canExportWord,
      };

  const reviewEligible = isAdmin || dynamicCapabilities.monthlyHumanReviews > 0 || canReview;

  const tierColour = isAdmin
    ? "border-[#7C3AED] bg-[#F5F3FF] text-[#5B21B6]"
    : tier === "pro"
    ? "border-[#059669] bg-[#ECFDF5] text-[#047857]"
    : tier === "plus"
    ? "border-[#D97706] bg-[#FFFBEB] text-[#92400E]"
    : "border-[#E2E8F0] bg-white text-[#64748B]";

  const artifacts = useMemo(
    () =>
      messages
        .filter((message) => message.artifact)
        .map((message) => message.artifact!),
    [messages]
  );

  const {
    attachedImage,
    imagePreview,
    attachedDocument,
    setAttachedDocument,
    handleImageSelect,
    clearImage,
    restoreImage,
    clearDocument,
  } = useAttachments({ canUploadImages, setError });

  // ── Image helpers ──
  function trackWorkspaceEvent(eventName: string, payload: Record<string, string | number | boolean | null>) {
    try {
      track(eventName, payload);
    } catch {
      // Best-effort telemetry only.
    }
  }

  const {
    isRecording,
    isTranscribing,
    recordingError,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecording({
    loading,
    setPrompt,
    sendPromptValue,
    onTranscriptionLimit: () => setUpgradeModalTrigger("transcription_limit"),
    t: tc,
  });

  // ── Billing ──
  async function refreshBillingStatus() {
    setBillingError(null);
    setBillingLoading(true);
    try {
      const res = await fetch("/api/billing/status");
      const data = (await res.json()) as { tier?: SubscriptionTier; isAdmin?: boolean; usage?: number; usageLimit?: number; error?: string };
      if (!res.ok || !data.tier) {
        setBillingError(data.error ?? "Failed to refresh billing status.");
        return;
      }
      setTier(data.tier);
      setIsAdmin(Boolean(data.isAdmin));
      if (typeof data.usage === "number") setUsage(data.usage);
      if (typeof data.usageLimit === "number") setUsageLimit(data.usageLimit);
    } catch {
      setBillingError("Network error while refreshing billing status.");
    } finally {
      setBillingLoading(false);
    }
  }

  // ── Conversations ──
  const loadConversations = useCallback(async (silent = false) => {
    if (!silent) setLoadingConversations(true);
    try {
      const res = await fetch("/api/chat/conversations");
      const data = (await res.json()) as { conversations?: Conversation[]; error?: string };
      if (!res.ok) {
        if (!silent) setError(data.error ?? "Failed to load conversations.");
        return;
      }
      setConversations(data.conversations ?? []);
    } catch {
      if (!silent) setError("Network error while loading conversations.");
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  }, []);

  async function loadConversationMessages(id: string) {
    abortControllerRef.current?.abort();
    setLoadingMessages(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat/conversations/${id}/messages`);
      const data = (await res.json()) as { messages?: Array<{ role: "user" | "assistant"; content: string; metadata?: unknown }>; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to load messages.");
        return;
      }
      const persona = getPersonaForConversation(id);
      setCurrentPersona(persona);
      setConversationId(id);
      setMessages((data.messages ?? []).map((m) => ({
        role: m.role,
        content: m.content,
        citations: parseMessageCitations(m.metadata),
        artifact: parseMessageArtifact(m.metadata),
        ...(m.role === "assistant" ? { persona: { id: persona.id, name: persona.name } } : {}),
      })));
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
        window.history.replaceState(null, "", window.location.pathname);
      }
    } catch {
      setError("Network error while deleting conversation.");
    }
  }

  async function archiveConversation(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/chat/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived_at: new Date().toISOString() }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Failed to archive conversation.");
        return;
      }
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (conversationId === id) {
        setConversationId(null);
        setMessages([]);
        window.history.replaceState(null, "", window.location.pathname);
      }
    } catch {
      setError("Network error while archiving conversation.");
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

  // ── Projects ──
  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = (await res.json()) as { projects?: Project[]; error?: string };
      if (res.ok) setProjects(data.projects ?? []);
    } catch {
      // Non-blocking
    }
  }, []);

  async function createProject(name: string, emoji: string) {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emoji }),
      });
      const data = (await res.json()) as { project?: Project };
      if (res.ok && data.project) {
        setProjects((prev) => [...prev, data.project!]);
      }
    } catch {
      // Non-blocking
    }
  }

  async function renameProject(id: string, name: string, emoji: string) {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emoji }),
      });
      if (res.ok) {
        setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name, emoji } : p)));
      }
    } catch {
      // Non-blocking
    }
  }

  async function deleteProject(id: string) {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        // Unassign conversations that belonged to this project
        setConversations((prev) =>
          prev.map((c) => (c.project_id === id ? { ...c, project_id: null } : c))
        );
      }
    } catch {
      // Non-blocking
    }
  }

  async function moveConversation(convId: string, projectId: string | null) {
    try {
      const res = await fetch(`/api/chat/conversations/${convId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, project_id: projectId } : c))
        );
      }
    } catch {
      // Non-blocking
    }
  }

  function startNewChat() {
    abortControllerRef.current?.abort();
    typingQueueRef.current = "";
    pendingDoneRef.current = null;
    clearTypingInterval();
    setActiveDocWizard(null);
    setDocWizardStep(0);
    setDocWizardAnswers([]);
    setConversationId(null);
    setCurrentPersona(null);
    setMessages([]);
    clearImage();
    clearDocument();
    setError(null);
    window.history.replaceState(null, "", window.location.pathname);
  }

  function switchMode(nextMode: WorkspaceMode) {
    if (nextMode === "virtual_audit" && !isAdmin && tier !== "pro") {
      trackWorkspaceEvent("upgrade_gate_hit", { trigger: "audit_mode", tier, source: "workspace_mode_toggle" });
      setUpgradeModalTrigger("audit_mode");
      return;
    }
    if (nextMode === "virtual_audit") {
      trackWorkspaceEvent("virtual_audit_started", { tier, source: "workspace_mode_toggle" });
    }
    setWorkspaceMode(nextMode);
    setActiveDocWizard(null);
    setDocWizardStep(0);
    setDocWizardAnswers([]);
    // Start a fresh conversation when entering virtual audit mode
    if (nextMode === "virtual_audit") {
      startNewChat();
    }
  }

  function startDocumentWizard(suggestion: StarterSuggestion) {
    const wizard = DOC_WIZARDS[suggestion.label];
    if (!wizard) {
      void sendPromptValue(suggestion.text);
      return;
    }
    setActiveDocWizard(wizard);
    setDocWizardStep(0);
    setDocWizardAnswers([]);
    const intro = tw(`wizards.${wizard.wizardKey}.intro`);
    const q1 = tw(`wizards.${wizard.wizardKey}.q1`);
    pushAssistantMessage(`${intro}\n\nQuestion 1/${wizard.questionCount}: ${q1}`, currentPersona);
    setPrompt("");
    textareaRef.current?.focus();
  }


  async function handleDocWizardInput(rawPrompt: string): Promise<boolean> {
    if (!activeDocWizard) return false;
    const answer = rawPrompt.trim();
    if (!answer) return true;

    setPrompt("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setMessages((prev) => [...prev, { role: "user", content: answer }]);

    if (["cancel", "/cancel", "stop"].includes(answer.toLowerCase())) {
      setActiveDocWizard(null);
      setDocWizardStep(0);
      setDocWizardAnswers([]);
      pushAssistantMessage(tw("wizardCancelled"), currentPersona);
      return true;
    }

    const nextAnswers = [...docWizardAnswers, answer];
    const nextStep = docWizardStep + 1;

    if (nextStep < activeDocWizard.questionCount) {
      setDocWizardAnswers(nextAnswers);
      setDocWizardStep(nextStep);
      const nextQ = tw(`wizards.${activeDocWizard.wizardKey}.q${nextStep + 1}`);
      pushAssistantMessage(`Question ${nextStep + 1}/${activeDocWizard.questionCount}: ${nextQ}`, currentPersona);
      return true;
    }

    const completedWizard = activeDocWizard;
    setActiveDocWizard(null);
    setDocWizardStep(0);
    setDocWizardAnswers([]);
    pushAssistantMessage(tw("wizardGenerating"), currentPersona);

    const wizardTitle = tw(`wizards.${completedWizard.wizardKey}.title`);
    const displayPrompt = `Generate the ${wizardTitle} document using the provided business details.`;
    const documentType = DOC_GENERATION_TYPES[completedWizard.id];
    const userMessage: Message = { role: "user", content: displayPrompt };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    trackWorkspaceEvent("document_generation_requested", {
      wizard: completedWizard.id,
      tier,
      source: "document_wizard",
    });

    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType,
          answers: nextAnswers,
          format: "json",
          conversationId,
          displayPrompt,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        assistantMessage?: string;
        conversationId?: string;
        artifact?: Message["artifact"];
        usage?: { used: number; limit: number | null; tier: SubscriptionTier; isAdmin?: boolean };
      };

      if (!res.ok) {
        if (res.status === 402) {
          setUpgradeModalTrigger("document_generation");
        } else {
          setError(data.error ?? "Document generation failed.");
        }
        setMessages((prev) => prev.slice(0, -1));
        return true;
      }

      if (data.conversationId) setConversationId(data.conversationId);
      if (data.assistantMessage) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.assistantMessage!,
            persona: currentPersona ?? undefined,
            artifact: data.artifact ?? {
              id: `${completedWizard.id}-${Date.now()}`,
              kind: "document",
              title: wizardTitle,
              summary: summarizeArtifactContent(data.assistantMessage!),
              status: "ready",
              documentType,
            },
          },
        ]);
      }
      if (data.usage) {
        setUsage(data.usage.used);
        safeTierUpdate(data.usage.tier);
        setIsAdmin(Boolean(data.usage.isAdmin));
      }
      await loadConversations(true);
    } catch {
      setError("Network error while generating document.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }

    return true;
  }

  // ── Reviews ──

  // ── Export ──
  async function exportDocument(format: "pdf") {
    setError(null);
    if (!conversationId) {
      setError("Send at least one message before exporting.");
      return;
    }
    setExportLoading(format);
    try {
      trackWorkspaceEvent("export_started", { format, tier, source: "workspace", conversationId: conversationId ?? null });
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
      trackWorkspaceEvent("export_completed", { format, tier, source: "workspace", conversationId: conversationId ?? null });
    } catch {
      setError("Network error while exporting.");
    } finally {
      setExportLoading(null);
    }
  }

  // ── Send message (with streaming for text, JSON for images) ──
  async function sendPromptValue(rawPrompt: string, options?: { displayPrompt?: string }) {
    if (await handleDocWizardInput(rawPrompt)) return;

    let value = rawPrompt.trim();
    if ((!value && !attachedImage && !attachedDocument) || loading) return;

    setLoading(true);
    setError(null);
    setPrompt("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // If a document is attached but no text was typed, provide a default query
    if (attachedDocument && !value) {
      value = `Please analyse the document I just uploaded (${attachedDocument.name}) and summarise its key points.`;
    }

    const userMessage: Message = {
      role: "user",
      content: attachedImage
        ? (value || "Analyse this image for food safety concerns.")
        : (options?.displayPrompt ?? value),
      imagePreview: imagePreview ?? undefined,
      documentName: attachedDocument?.name ?? undefined,
    };
    setMessages((prev) => [...prev, userMessage]);

    const currentImage = attachedImage;
    const currentImagePreview = imagePreview;
    const currentDocument = attachedDocument;
    clearImage();
    clearDocument();

    // Document uploads: send to /api/documents/upload for text extraction + embedding storage,
    // then fall through to the streaming chat flow so the LLM responds using the content.
    if (currentDocument) {
      try {
        const fd = new FormData();
        fd.append("file", currentDocument);
        const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
        const data = (await res.json()) as { chunksStored?: number; warning?: string; error?: string };
        if (!res.ok || (data.chunksStored ?? 0) === 0) {
          const reason = data.warning ?? data.error ?? "could not extract text";
          pushAssistantMessage(
            `I received **${currentDocument.name}** but couldn't process it (${reason}). Please try a plain text or supported file format.`
          );
          setLoading(false);
          return;
        }
        // Partial extraction warning — inform the LLM so it can caveat its answer
        if (data.warning) {
          value += `\n\n[Note: The uploaded document "${currentDocument.name}" was only partially extracted: ${data.warning}]`;
        }
        // Success — fall through to the streaming chat flow below.
        // retrieveUserDocumentContext() in /api/chat/stream will find the just-uploaded chunks.
      } catch (e) {
        console.error("Document upload error:", e);
        pushAssistantMessage("Sorry, there was an error processing your document. Please try again.");
        setLoading(false);
        return;
      }
    }

    // Image uploads use the existing JSON endpoint
    if (currentImage) {
      // Push a streaming placeholder immediately (matching text chat behaviour) so the
      // thinking animation shows while waiting and typing cadence works on response.
      typingQueueRef.current = "";
      pendingDoneRef.current = null;
      clearTypingInterval();
      setMessages((prev) => [...prev, { role: "assistant", content: "", isStreaming: true, persona: currentPersona ?? undefined }]);
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
          persona?: PersonaInfo;
          usage?: { used: number; limit: number | null; tier: SubscriptionTier; isAdmin?: boolean };
        };
        if (!res.ok) {
          if (res.status === 402) {
            setUpgradeModalTrigger("image_limit");
          } else {
            setError(data.error ?? "Request failed");
          }
          setMessages((prev) => prev.slice(0, -2)); // remove user + streaming placeholder
          setPrompt(value);
          restoreImage(currentImage, currentImagePreview);
          return;
        }
        if (data.conversationId) setConversationId(data.conversationId);
        if (data.persona) {
          setCurrentPersona(data.persona);
          // Stamp persona on the streaming placeholder
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.isStreaming) {
              updated[updated.length - 1] = { ...last, persona: data.persona };
            }
            return updated;
          });
        }
        if (data.usage) {
          setUsage(data.usage.used);
          safeTierUpdate(data.usage.tier);
          setIsAdmin(Boolean(data.usage.isAdmin));
        }
        if (data.assistantMessage) {
          // Feed content into typing queue for animated display (matching text chat cadence)
          typingQueueRef.current = data.assistantMessage;
          pendingDoneRef.current = { citations: data.citations };
          startTypingDrain();
        }
        await loadConversations(true);
      } catch {
        setError("Network error. Please try again.");
        setMessages((prev) => prev.slice(0, -2)); // remove user + streaming placeholder
        setPrompt(value);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Text messages use the streaming endpoint
    abortControllerRef.current = new AbortController();
    typingQueueRef.current = "";
    pendingDoneRef.current = null;
    clearTypingInterval();
    setMessages((prev) => [...prev, { role: "assistant", content: "", isStreaming: true, persona: currentPersona ?? undefined }]);

    try {
      const streamEndpoint = workspaceMode === "virtual_audit" ? "/api/audit/stream" : "/api/chat/stream";
      const res = await fetch(streamEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value, conversationId }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        let errMsg = "Request failed";
        const isLimit = res.status === 402;
        try {
          const data = await res.json();
          errMsg = data.error ?? errMsg;
        } catch { /* body may not be JSON */ }
        if (isLimit && workspaceMode === "virtual_audit") {
          setUpgradeModalTrigger("audit_mode");
        } else if (isLimit) {
          setUpgradeModalTrigger("message_limit");
        } else {
          setError(errMsg);
        }
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

          let event: { type: string; delta?: string; conversationId?: string; citations?: Citation[]; usage?: StreamUsage; persona?: PersonaInfo; message?: string };
          try {
            event = JSON.parse(payload);
          } catch {
            continue;
          }

          if (event.type === "metadata") {
            if (event.conversationId) setConversationId(event.conversationId);
            if (event.persona) {
              const p = event.persona as PersonaInfo;
              setCurrentPersona(p);
              // Stamp persona on the streaming assistant message
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.isStreaming) {
                  updated[updated.length - 1] = { ...last, persona: p };
                }
                return updated;
              });
            }
          } else if (event.type === "content" && event.delta) {
            typingQueueRef.current += event.delta;
            startTypingDrain();
          } else if (event.type === "error") {
            typingQueueRef.current = "";
            pendingDoneRef.current = null;
            clearTypingInterval();
            setMessages((prev) => applyStreamError({
              messages: prev,
              promptValue: value,
              errorMessage: event.message,
            }).messages);
            setPrompt(value);
            setError(event.message ?? "Stream interrupted");
          } else if (event.type === "done") {
            pendingDoneRef.current = { citations: event.citations, usage: event.usage };
            startTypingDrain();
          }
        }
      }

      if (typingQueueRef.current.length === 0 && pendingDoneRef.current) {
        finalizeStreamingMessage(pendingDoneRef.current);
        pendingDoneRef.current = null;
      }

      await loadConversations(true);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        typingQueueRef.current = "";
        pendingDoneRef.current = null;
        clearTypingInterval();
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
        typingQueueRef.current = "";
        pendingDoneRef.current = null;
        clearTypingInterval();
        setMessages((prev) => applyStreamError({
          messages: prev,
          promptValue: value,
          errorMessage: "Network error. Please try again.",
        }).messages);
        setError("Network error. Please try again.");
        setPrompt(value);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }

  async function sendPrompt(event: FormEvent) {
    event.preventDefault();
    await sendPromptValue(prompt);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendPromptValue(prompt);
    }
  }

  // ── Effects ──
  useEffect(() => { void loadConversations(); }, [loadConversations]);
  useEffect(() => { void loadProjects(); }, [loadProjects]);

  // Track whether conversationId was set by user clicking sidebar (not by streaming metadata)
  const loadConvOnSelect = useRef<string | null>(null);

  function selectConversation(id: string) {
    loadConvOnSelect.current = id;
    setConversationId(id);
    window.history.replaceState(null, "", `?c=${id}`);
  }

  useEffect(() => {
    if (!conversationId) return;
    // Only load messages from DB when user explicitly selected a conversation,
    // NOT when conversationId was set by streaming metadata (which would abort the active stream).
    if (loadConvOnSelect.current === conversationId) {
      loadConvOnSelect.current = null;
      void loadConversationMessages(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing") === "success") void refreshBillingStatus();
    const cId = params.get("c");
    if (cId) selectConversation(cId);
  }, []);

  useEffect(() => {
    return () => clearTypingInterval();
  }, [clearTypingInterval]);


  // ── Render ──
  return (
    <>
      <div className="workspace-shell fixed inset-0 flex overflow-hidden bg-[#F8F9FB]">
        {/* Sidebar */}
        <ChatSidebar
          conversations={conversations}
          projects={projects}
          activeConversationId={conversationId}
          loadingConversations={loadingConversations}
          sidebarOpen={sidebarOpen}
          userEmail={userEmail}
          tier={tier}
          isAdmin={isAdmin}
          tierColour={tierColour}
          onNewChat={startNewChat}
          onSelectConversation={(id) => { selectConversation(id); }}
          onDeleteConversation={(id) => void removeConversation(id)}
          onArchiveConversation={(id) => void archiveConversation(id)}
          onRenameConversation={(id, title) => void renameConversation(id, title)}
          onMoveConversation={(convId, projectId) => void moveConversation(convId, projectId)}
          onCreateProject={(name, emoji) => void createProject(name, emoji)}
          onRenameProject={(id, name, emoji) => void renameProject(id, name, emoji)}
          onDeleteProject={(id) => void deleteProject(id)}
        />

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main chat area */}
        <main
          className={`relative flex flex-1 flex-col overflow-hidden transition-colors ${isDraggingOver ? "bg-[#FEF2F2] ring-2 ring-inset ring-[#E11D48]" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className={`absolute left-3 top-3 z-30 rounded-lg border border-[#E2E8F0] bg-white p-1.5 text-[#64748B] shadow-sm hover:bg-[#F1F5F9] transition-colors ${
              sidebarOpen ? "md:hidden" : ""
            }`}
            title={sidebarOpen ? tw("collapseSidebar") : tw("expandSidebar")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {isDraggingOver && canUploadImages && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              <div className="rounded-2xl border-2 border-dashed border-[#E11D48] bg-white/90 px-8 py-6 text-center shadow-lg">
                <p className="text-sm font-semibold text-[#E11D48]">{tw("dropPhotoToAnalyse")}</p>
                <p className="text-xs text-[#64748B] mt-1">{tw("dropPhotoHint")}</p>
              </div>
            </div>
          )}

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
          {artifacts.length > 0 && (
            <div className="flex-shrink-0 border-b border-[#E2E8F0] bg-white px-4 py-3">
              <div className="mx-auto max-w-5xl">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#E11D48]">Artifacts</p>
                    <p className="mt-1 text-sm text-[#475569]">Reusable outputs generated in this conversation.</p>
                  </div>
                  <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-[#64748B]">
                    {artifacts.length} saved
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {artifacts.map((artifact) => (
                    <div key={artifact.id} className="rounded-2xl border border-[#E2E8F0] bg-[#FCFDFE] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-[#FFF4F6] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#BE123C]">
                          {artifact.kind}
                        </span>
                        <span className="rounded-full border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11px] font-medium text-[#64748B]">
                          {artifact.status}
                        </span>
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-[#0F172A]">{artifact.title}</h3>
                      {artifact.summary && (
                        <p className="mt-2 text-sm leading-6 text-[#475569]">{artifact.summary}</p>
                      )}
                      <div className="mt-3 text-xs text-[#64748B]">
                        Use the response card below to copy content, then export the conversation when the draft is ready.
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <ChatMessages
            messages={messages}
            loading={loading}
            loadingMessages={loadingMessages}
            conversationId={conversationId}
            reviewEligible={reviewEligible}
            canUploadImages={canUploadImages}
            tier={tier}
            isAdmin={isAdmin}
            onSetPrompt={setPrompt}
            onFocusInput={() => textareaRef.current?.focus()}
            onQuickSuggestion={(suggestion) => {
              if (workspaceMode === "virtual_audit") {
                void sendPromptValue(`Start virtual audit focus: ${suggestion.text}`);
                return;
              }
              if (suggestion.category === "document") {
                startDocumentWizard(suggestion);
              } else {
                void sendPromptValue(suggestion.text);
              }
            }}
            onRequestReview={() => { window.location.href = "/dashboard/reviews"; }}
            onUpgradeForReview={!reviewEligible ? () => setUpgradeModalTrigger("review") : undefined}
            currentPersona={currentPersona}
          />

          <div className="flex-shrink-0 border-t border-[#E2E8F0] bg-white px-4 py-2">
            <div className="mx-auto flex max-w-5xl items-center gap-2 overflow-x-auto">
              <div className="flex items-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC] p-0.5">
                <button
                  type="button"
                  onClick={() => switchMode("ask")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    workspaceMode === "ask" ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B]"
                  }`}
                >
                  {tw("ask")}
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("virtual_audit")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    workspaceMode === "virtual_audit" ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B]"
                  }`}
                >
                  {tw("virtualAudit")}
                </button>
              </div>
              {(reviewEligible) && (
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="rounded-full border border-[#059669] bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#047857] hover:bg-[#D1FAE5] transition-colors"
                >
                  Send for Review
                </button>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-full border border-[#7C3AED] bg-[#F5F3FF] px-3 py-1 text-xs font-bold uppercase text-[#5B21B6]"
                >
                  {tw("adminPanel")}
                </Link>
              )}
              {workspaceMode === "virtual_audit" && (
                <button
                  type="button"
                  onClick={() =>
                    void sendPromptValue(
                      "Generate the final virtual audit report now with: scope, evidence reviewed, findings table (Compliant/Minor NC/Major NC/Critical NC), CAPA plan, overall verdict, and evidence still required."
                    )
                  }
                  disabled={loading}
                  className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50 md:hidden"
                >
                  {tw("generateReport")}
                </button>
              )}
              {conversationId && (
                <button
                  onClick={() => void exportDocument("pdf")}
                  disabled={exportLoading !== null}
                  className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50"
                >
                  {exportLoading === "pdf" ? tw("exporting") : tw("exportConversation")}
                </button>
              )}
            </div>
          </div>

          {/* Input */}
          <ChatInput
            prompt={prompt}
            loading={loading}
            attachedImage={attachedImage}
            imagePreview={imagePreview}
            canUploadImages={canUploadImages}
            attachedDocument={attachedDocument}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            recordingError={recordingError}
            onPromptChange={setPrompt}
            onSubmit={sendPrompt}
            onStop={() => abortControllerRef.current?.abort()}
            onImageSelect={handleImageSelect}
            onClearImage={clearImage}
            onDocumentSelect={setAttachedDocument}
            onClearDocument={clearDocument}
            onStartRecording={() => void startRecording()}
            onStopRecording={stopRecording}
            onCancelRecording={cancelRecording}
            onKeyDown={handleKeyDown}
            textareaRef={textareaRef}
            onUpgradeForImages={() => setUpgradeModalTrigger("image_limit")}
            placeholder={
              workspaceMode === "virtual_audit"
                ? tw("virtualAuditPlaceholder")
                : undefined
            }
          />
        </main>
      </div>

      {/* Onboarding modal */}
      {showOnboarding && !initialIsAdmin && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Upgrade modal */}
      {upgradeModalTrigger && !isAdmin && (
        <UpgradeModal
          trigger={upgradeModalTrigger}
          currentTier={tier}
          onClose={() => setUpgradeModalTrigger(null)}
        />
      )}

      {/* Review contact modal */}
      {showReviewModal && (
        <ReviewContactModal
          userEmail={userEmail}
          onClose={() => setShowReviewModal(false)}
        />
      )}

    </>
  );
}
