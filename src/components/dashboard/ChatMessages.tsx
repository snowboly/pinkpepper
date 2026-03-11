"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { SubscriptionTier } from "@/lib/tier";
import type { Message, PersonaInfo } from "./types";
import MessageItem from "./MessageItem";

export type StarterSuggestion = {
  category: "document" | "audit" | "qa";
  label: string;
  text: string;
};

type ChatMessagesProps = {
  messages: Message[];
  loading: boolean;
  loadingMessages: boolean;
  conversationId: string | null;
  reviewEligible: boolean;
  canUploadImages: boolean;
  tier: SubscriptionTier;
  isAdmin: boolean;
  onSetPrompt: (s: string) => void;
  onFocusInput: () => void;
  onQuickSuggestion?: (s: StarterSuggestion) => void;
  onRequestReview: () => void;
  onUpgradeForReview?: () => void;
  currentPersona?: PersonaInfo | null;
};

const SUGGESTION_KEYS = [
  { category: "document" as const, key: "haccpPlan" },
  { category: "document" as const, key: "cleaningSop" },
  { category: "document" as const, key: "tempLog" },
  { category: "document" as const, key: "supplierApproval" },
  { category: "audit" as const, key: "brcAudit" },
  { category: "audit" as const, key: "allergenAudit" },
  { category: "qa" as const, key: "allergenLaw" },
  { category: "qa" as const, key: "traceabilityRules" },
];

const CATEGORY_COLOUR: Record<string, string> = {
  document: "text-[#7C3AED]",
  audit: "text-[#D97706]",
  qa: "text-[#E11D48]",
};

export default function ChatMessages({
  messages,
  loading,
  loadingMessages,
  conversationId,
  reviewEligible,
  canUploadImages,
  tier,
  isAdmin,
  onSetPrompt,
  onFocusInput,
  onQuickSuggestion,
  onRequestReview,
  onUpgradeForReview,
  currentPersona,
}: ChatMessagesProps) {
  const t = useTranslations("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const suggestions: StarterSuggestion[] = SUGGESTION_KEYS.map((s) => ({
    category: s.category,
    label: t(`suggestions.${s.key}.label`),
    text: t(`suggestions.${s.key}.text`),
  }));

  // Find the index of the last assistant message
  const lastAssistantIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i;
    }
    return -1;
  })();

  const showPremiumWorkflows = !isAdmin && tier !== "pro" && messages.length === 0 && !loadingMessages;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Premium Workflows upsell — hidden for Pro and Admin users */}
      {showPremiumWorkflows && (
        <div className="flex-shrink-0 border-b border-[#E2E8F0] bg-white px-4 py-5">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#7C3AED]">Premium Workflows</p>
                <p className="mt-0.5 text-sm text-[#475569]">Use PinkPepper for the work operators pay for</p>
              </div>
              <Link href="/pricing" className="text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition-colors">
                See plan differences
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { title: "Generate document", desc: "Create HACCP plans, SOPs, temperature logs, and supplier approval packs faster." },
                { title: "Run virtual audit", desc: "Simulate an inspection, capture findings, and produce a CAPA-ready report." },
                { title: "Request expert review", desc: "Send the current conversation for specialist feedback before you rely on it operationally." },
                { title: "Export PDF/DOCX", desc: "Download the current conversation as a working document you can share or file." },
              ].map((card) => (
                <div key={card.title} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{card.title}</p>
                  <p className="mt-1 text-xs text-[#64748B] leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {messages.length === 0 && !loadingMessages && (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="mb-6">
            <Image
              src="/logo/LogoV3.png"
              alt="PinkPepper"
              width={160}
              height={44}
              className="h-11 w-auto mx-auto opacity-80"
            />
          </div>
          <h2 className="text-2xl font-semibold text-[#0F172A] mb-2">{t("title")}</h2>
          <p className="text-base text-[#64748B] max-w-md">
            {t("description")}{" "}
            {canUploadImages
              ? t("descriptionWithImages")
              : t("descriptionUpgradeImages")}
          </p>
          <div className="mt-6 grid gap-2 grid-cols-1 sm:grid-cols-2 w-full max-w-xl">
            {suggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  if (onQuickSuggestion) {
                    onQuickSuggestion(s);
                  } else {
                    onSetPrompt(s.text);
                    onFocusInput();
                  }
                }}
                className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5 text-left hover:bg-[#F8F9FB] hover:border-[#CBD5E1] transition-colors"
              >
                <span className={`block text-xs font-semibold uppercase tracking-wide mb-0.5 ${CATEGORY_COLOUR[s.category]}`}>
                  {s.label}
                </span>
                <span className="block text-sm text-[#475569] leading-snug">{s.text}</span>
              </button>
            ))}
          </div>

          {/* Human review highlight */}
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#059669]/20 bg-[#ECFDF5] px-4 py-3 max-w-xl w-full text-left">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#059669]/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-sm text-[#047857]">
              {t("humanReviewHighlight")}
            </p>
          </div>
        </div>
      )}

      {/* Loading conversation messages */}
      {loadingMessages && (
        <div className="flex justify-center py-8">
          <span className="text-base text-[#6B7280]">{t("loadingConversation")}</span>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg, idx) => (
        <MessageItem
          key={`${msg.role}-${idx}`}
          message={msg}
          isLastAssistantMessage={idx === lastAssistantIdx}
          reviewEligible={reviewEligible}
          conversationId={conversationId}
          onRequestReview={onRequestReview}
          onUpgradeForReview={onUpgradeForReview}
        />
      ))}

      {/* Loading indicator — only shown when waiting for first token (no streaming message yet) */}
      {loading && (messages.length === 0 || !messages[messages.length - 1]?.isStreaming) && (
        <div className="py-5">
          <div className="mx-auto max-w-5xl px-4 md:px-6">
            <div className="mb-1.5 flex items-center gap-2">
              <div className="relative h-5 w-5 rounded-full bg-[#E11D48] animate-pulse">
                <span className="absolute left-[5px] top-[4px] h-1.5 w-1.5 rounded-full bg-white/80" />
              </div>
              <span className="text-sm font-semibold text-[#0F172A]">{currentPersona ? currentPersona.name : t("pinkPepper")}</span>
            </div>
            <div className="flex gap-1 ml-7">
              <span className="h-2 w-2 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
