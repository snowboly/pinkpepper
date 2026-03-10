"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { track } from "@vercel/analytics";
import type { SubscriptionTier } from "@/lib/tier";
import { TIER_CAPABILITIES } from "@/lib/tier";
import type { Citation } from "@/lib/rag/citations";
import type { Message, Conversation, Project, ChatWorkspaceProps, PersonaInfo } from "./types";
import ChatSidebar from "./ChatSidebar";
import ChatMessages, { type StarterSuggestion } from "./ChatMessages";
import ChatInput from "./ChatInput";
import ReviewModal from "./ReviewModal";
import OnboardingModal from "./OnboardingModal";
import UpgradeModal from "./UpgradeModal";

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

const ALLOWED_TRANSCRIPTION_MIME_TYPES = new Set(["audio/webm", "audio/mp4", "audio/wav"]);

function normalizeRecordedMimeType(mimeType: string | undefined) {
  let normalized = (mimeType ?? "").split(";")[0]?.trim().toLowerCase();
  if (normalized === "audio/x-wav") normalized = "audio/wav";
  if (normalized === "audio/m4a") normalized = "audio/mp4";
  if (ALLOWED_TRANSCRIPTION_MIME_TYPES.has(normalized)) {
    return normalized;
  }
  return "audio/webm";
}

export default function ChatWorkspace({
  userEmail,
  initialTier,
  initialUsage,
  usageLimit,
  dailyImageUploads,
  canExportPdf,
  canExportWord,
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

  // ── Document attachment state ──
  const [attachedDocument, setAttachedDocument] = useState<File | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // ── Onboarding state ──
  const [showOnboarding, setShowOnboarding] = useState(!onboardingCompleted);

  // ── Upgrade modal state ──
  const [upgradeModalTrigger, setUpgradeModalTrigger] = useState<"message_limit" | "image_limit" | "export" | "review" | "audit_mode" | "transcription_limit" | "document_generation" | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("ask");
  const [activeDocWizard, setActiveDocWizard] = useState<DocWizard | null>(null);
  const [docWizardStep, setDocWizardStep] = useState(0);
  const [docWizardAnswers, setDocWizardAnswers] = useState<string[]>([]);
  const [showDocumentLauncher, setShowDocumentLauncher] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // ── UI state ──
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const typingQueueRef = useRef("");
  const typingIntervalRef = useRef<number | null>(null);
  const pendingDoneRef = useRef<{ citations?: Citation[]; usage?: StreamUsage } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef<number | null>(null);
  const retryableTranscriptionRef = useRef<{ blob: Blob; durationMs: number; retries: number } | null>(null);

  const canUploadImages = isAdmin || dailyImageUploads > 0;

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
      setTier(doneData.usage.tier);
      setIsAdmin(Boolean(doneData.usage.isAdmin));
    }
  }, []);

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

  function cleanupRecordingStream() {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    recordingStartedAtRef.current = null;
  }

  function trackTranscriptionTelemetry(eventName: string, payload: Record<string, string | number | boolean>) {
    try {
      track(eventName, payload);
    } catch {
      // Best-effort telemetry only.
    }
  }

  async function transcribeAudioBlob(audioBlob: Blob, durationMs: number, retryCount = 0) {
    setIsTranscribing(true);
    setRecordingError(null);
    const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
    try {
      const normalizedMimeType = normalizeRecordedMimeType(audioBlob.type);
      const extension = normalizedMimeType === "audio/mp4" ? "mp4" : normalizedMimeType === "audio/wav" ? "wav" : "webm";
      const audioFile = new File([audioBlob], `recording.${extension}`, { type: normalizedMimeType });
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("durationMs", String(durationMs));
      formData.append("language", navigator.language || "en");

      const res = await fetch("/api/chat/transcribe", { method: "POST", body: formData });
      const data = (await res.json()) as { text?: string; error?: { message?: string } };
      if (!res.ok) {
        if (res.status === 402) {
          setUpgradeModalTrigger("transcription_limit");
        }
        throw new Error(data.error?.message ?? tc("transcriptionError"));
      }

      const transcript = (data.text ?? "").trim();
      if (!transcript) {
        throw new Error(tc("transcriptionEmptyError"));
      }

      let promptToSend = "";
      setPrompt((prev) => {
        const trimmed = prev.trimEnd();
        promptToSend = trimmed ? `${trimmed} ${transcript}` : transcript;
        return promptToSend;
      });
      setRecordingError(null);
      retryableTranscriptionRef.current = null;

      const latencyMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt);
      trackTranscriptionTelemetry("chat_transcription_success", {
        latencyMs,
        durationMs,
        retryCount,
      });

      await sendPromptValue(promptToSend);
    } catch {
      const latencyMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt);
      retryableTranscriptionRef.current = { blob: audioBlob, durationMs, retries: retryCount };
      setRecordingError(tc("transcriptionError"));
      trackTranscriptionTelemetry("chat_transcription_failure", {
        latencyMs,
        durationMs,
        retryCount,
      });
    } finally {
      setIsTranscribing(false);
    }
  }

  function retryTranscription() {
    const retry = retryableTranscriptionRef.current;
    if (!retry || isRecording || isTranscribing) return;
    void transcribeAudioBlob(retry.blob, retry.durationMs, retry.retries + 1);
  }

  async function startRecording() {
    if (isRecording || isTranscribing) return;
    if (retryableTranscriptionRef.current) {
      retryTranscription();
      return;
    }
    setRecordingError(null);
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRecordingError(tc("recordingUnsupported"));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/wav"].find((candidate) =>
        MediaRecorder.isTypeSupported(candidate)
      );
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const chunks = audioChunksRef.current;
        const firstChunkType = chunks[0]?.type;
        const blobType = normalizeRecordedMimeType(recorder.mimeType || firstChunkType);
        const blob = new Blob(chunks, { type: blobType });
        const durationMs = recordingStartedAtRef.current ? Date.now() - recordingStartedAtRef.current : 0;
        cleanupRecordingStream();
        if (blob.size > 0) {
          void transcribeAudioBlob(blob, durationMs);
        } else {
          setRecordingError(tc("transcriptionEmptyError"));
        }
      };

      mediaRecorderRef.current = recorder;
      recordingStartedAtRef.current = Date.now();
      recorder.start();
      setIsRecording(true);
    } catch {
      cleanupRecordingStream();
      setRecordingError(tc("recordingPermissionError"));
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    setIsRecording(false);
    recorder.stop();
  }

  function cancelRecording() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.onstop = null;
      recorder.stop();
    }
    setIsRecording(false);
    setRecordingError(null);
    cleanupRecordingStream();
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
    setReviewRequests([]);
    clearImage();
    setAttachedDocument(null);
    setError(null);
  }

  function switchMode(nextMode: WorkspaceMode) {
    if (nextMode === "virtual_audit" && !isAdmin && tier !== "pro") {
      setUpgradeModalTrigger("audit_mode");
      return;
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

  function openDocumentLauncher() {
    if (!isAdmin && dynamicCapabilities.dailyDocumentGenerations < 1) {
      setUpgradeModalTrigger("document_generation");
      return;
    }
    setShowExportOptions(false);
    setShowDocumentLauncher((prev) => !prev);
  }

  function launchDocumentWizard(wizardLabel: keyof typeof DOC_WIZARDS) {
    startDocumentWizard({
      category: "document",
      label: wizardLabel,
      text: `Generate a ${wizardLabel} document`,
    });
    setShowDocumentLauncher(false);
  }

  function openReviewAction() {
    if (!conversationId) {
      setError("Start a conversation before requesting expert review.");
      return;
    }
    if (!reviewEligible) {
      setUpgradeModalTrigger("review");
      return;
    }
    setShowDocumentLauncher(false);
    setShowExportOptions(false);
    setReviewModalOpen(true);
  }

  function openExportAction() {
    if (!dynamicCapabilities.allowPdfExport && !dynamicCapabilities.allowWordExport) {
      setUpgradeModalTrigger("export");
      return;
    }
    if (!conversationId) {
      setError("Send at least one message before exporting.");
      return;
    }
    setShowDocumentLauncher(false);
    setShowExportOptions((prev) => !prev);
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
    const compiledPrompt = completedWizard.buildPrompt(nextAnswers);
    await sendPromptValue(compiledPrompt, {
      displayPrompt: `Generate the ${wizardTitle} document using the provided business details.`,
    });

    return true;
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
  async function sendPromptValue(rawPrompt: string, options?: { displayPrompt?: string }) {
    if (await handleDocWizardInput(rawPrompt)) return;

    const value = rawPrompt.trim();
    if ((!value && !attachedImage) || loading) return;

    setLoading(true);
    setError(null);
    setPrompt("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMessage: Message = {
      role: "user",
      content: attachedImage
        ? (value || "Analyse this image for food safety concerns.")
        : (options?.displayPrompt ?? value),
      imagePreview: imagePreview ?? undefined,
    };
    setMessages((prev) => [...prev, userMessage]);

    const currentImage = attachedImage;
    const currentImagePreview = imagePreview;
    const currentDocument = attachedDocument;
    clearImage();
    setAttachedDocument(null);

    // Document uploads: send to /api/documents/upload for text extraction + embedding storage
    if (currentDocument) {
      try {
        const fd = new FormData();
        fd.append("file", currentDocument);
        const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
        const data = (await res.json()) as { chunksStored?: number; warning?: string; error?: string };
        if (res.ok && (data.chunksStored ?? 0) > 0) {
          pushAssistantMessage(
            `I've processed **${currentDocument.name}** and indexed ${data.chunksStored} text chunks. I'll use the content of this document to inform my answers. What would you like to know?`
          );
          setLoading(false);
          return;
        } else if (data.warning) {
          pushAssistantMessage(`I received **${currentDocument.name}** but couldn't extract its text (${data.warning}). Please try a plain text or supported file format.`);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Document upload error:", e);
        pushAssistantMessage("Sorry, there was an error processing your document. Please try again.");
        setLoading(false);
        return;
      }
    }

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
          if (res.status === 402) {
            setUpgradeModalTrigger("image_limit");
          } else {
            setError(data.error ?? "Request failed");
          }
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
            { role: "assistant", content: data.assistantMessage!, citations: data.citations, persona: currentPersona ?? undefined },
          ]);
        }
        if (data.usage) {
          setUsage(data.usage.used);
          setTier(data.usage.tier);
          setIsAdmin(Boolean(data.usage.isAdmin));
        }
        await loadConversations(true);
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

          let event: { type: string; delta?: string; conversationId?: string; citations?: Citation[]; usage?: StreamUsage; persona?: PersonaInfo };
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
        setError("Network error. Please try again.");
        setMessages((prev) => prev.slice(0, -2));
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
  }

  useEffect(() => {
    if (!conversationId) return;
    // Only load messages from DB when user explicitly selected a conversation,
    // NOT when conversationId was set by streaming metadata (which would abort the active stream).
    if (loadConvOnSelect.current === conversationId) {
      loadConvOnSelect.current = null;
      void loadConversationMessages(conversationId);
    }
    void loadReviewRequests(conversationId);
  }, [conversationId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing") === "success") void refreshBillingStatus();
  }, []);

  useEffect(() => {
    return () => clearTypingInterval();
  }, [clearTypingInterval]);

  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state === "recording") {
        recorder.onstop = null;
        recorder.stop();
      }
      cleanupRecordingStream();
    };
  }, []);

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
          usagePercent={usagePercent}
          billingLoading={billingLoading}
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
          onRefreshBilling={() => void refreshBillingStatus()}
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

          <div className="flex-shrink-0 border-b border-[#E2E8F0] bg-[#FCFCFD] px-4 py-3">
            <div className="mx-auto flex max-w-5xl flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">{tw("actions.eyebrow")}</p>
                  <h2 className="text-sm font-semibold text-[#0F172A]">{tw("actions.title")}</h2>
                </div>
                <Link href="/pricing" className="text-xs font-medium text-[#475569] underline underline-offset-2 hover:text-[#0F172A]">
                  {tw("actions.comparePlans")}
                </Link>
              </div>

              <div className="grid gap-2 md:grid-cols-4">
                <button
                  type="button"
                  onClick={openDocumentLauncher}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition-colors hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#0F172A]">{tw("actions.generateDocument.label")}</span>
                    {!isAdmin && dynamicCapabilities.dailyDocumentGenerations < 1 && (
                      <span className="rounded-full bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#C2410C]">
                        {tw("actions.locked")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#64748B]">{tw("actions.generateDocument.body")}</p>
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("virtual_audit")}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition-colors hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#0F172A]">{tw("actions.virtualAudit.label")}</span>
                    {!isAdmin && tier !== "pro" && (
                      <span className="rounded-full bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#C2410C]">
                        {tw("actions.proOnly")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#64748B]">{tw("actions.virtualAudit.body")}</p>
                </button>

                <button
                  type="button"
                  onClick={openReviewAction}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition-colors hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#0F172A]">{tw("actions.requestReview.label")}</span>
                    {!isAdmin && !reviewEligible && (
                      <span className="rounded-full bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#C2410C]">
                        {tw("actions.proOnly")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#64748B]">{tw("actions.requestReview.body")}</p>
                </button>

                <button
                  type="button"
                  onClick={openExportAction}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition-colors hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#0F172A]">{tw("actions.export.label")}</span>
                    {!isAdmin && !dynamicCapabilities.allowPdfExport && !dynamicCapabilities.allowWordExport && (
                      <span className="rounded-full bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#C2410C]">
                        {tw("actions.locked")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#64748B]">{tw("actions.export.body")}</p>
                </button>
              </div>

              {showDocumentLauncher && (
                <div className="flex flex-wrap gap-2 rounded-2xl border border-[#E2E8F0] bg-white p-3">
                  {Object.keys(DOC_WIZARDS).map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => launchDocumentWizard(label as keyof typeof DOC_WIZARDS)}
                      className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#334155] transition-colors hover:border-[#CBD5E1] hover:bg-white"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {showExportOptions && (
                <div className="flex flex-wrap gap-2 rounded-2xl border border-[#E2E8F0] bg-white p-3">
                  {dynamicCapabilities.allowPdfExport && (
                    <button
                      type="button"
                      onClick={() => void exportDocument("pdf")}
                      disabled={exportLoading !== null}
                      className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#334155] transition-colors hover:border-[#CBD5E1] hover:bg-white disabled:opacity-50"
                    >
                      {exportLoading === "pdf" ? tw("exporting") : tw("pdf")}
                    </button>
                  )}
                  {dynamicCapabilities.allowWordExport && (
                    <button
                      type="button"
                      onClick={() => void exportDocument("docx")}
                      disabled={exportLoading !== null}
                      className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#334155] transition-colors hover:border-[#CBD5E1] hover:bg-white disabled:opacity-50"
                    >
                      {exportLoading === "docx" ? tw("exporting") : tw("docx")}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

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
            onRequestReview={() => setReviewModalOpen(true)}
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
              <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${tierColour}`}>
                {isAdmin ? "Admin" : tier}
              </span>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-full border border-[#7C3AED] bg-[#F5F3FF] px-3 py-1 text-xs font-bold uppercase text-[#5B21B6]"
                >
                  {tw("adminPanel")}
                </Link>
              )}
              {reviewEligible && conversationId && (
                <button
                  onClick={() => setReviewModalOpen(true)}
                  disabled={reviewLoading}
                  className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50"
                >
                  {tw("requestReview")}
                </button>
              )}
              {workspaceMode === "virtual_audit" && (
                <button
                  onClick={() =>
                    void sendPromptValue(
                      "Generate the final virtual audit report now with: scope, evidence reviewed, findings table (Compliant/Minor NC/Major NC/Critical NC), CAPA plan, overall verdict, and evidence still required."
                    )
                  }
                  disabled={loading}
                  className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50"
                >
                  {tw("generateReport")}
                </button>
              )}
              {dynamicCapabilities.allowPdfExport && (
                <button
                  onClick={() => void exportDocument("pdf")}
                  disabled={exportLoading !== null || !conversationId}
                  className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50"
                >
                  {exportLoading === "pdf" ? tw("exporting") : tw("pdf")}
                </button>
              )}
              {dynamicCapabilities.allowWordExport && (
                <button
                  onClick={() => void exportDocument("docx")}
                  disabled={exportLoading !== null || !conversationId}
                  className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50"
                >
                  {exportLoading === "docx" ? tw("exporting") : tw("docx")}
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
            onDocumentSelect={(f) => setAttachedDocument(f)}
            onClearDocument={() => setAttachedDocument(null)}
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
