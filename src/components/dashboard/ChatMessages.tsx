"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Message } from "./types";
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
  onSetPrompt: (s: string) => void;
  onFocusInput: () => void;
  onQuickSuggestion?: (s: StarterSuggestion) => void;
  onRequestReview: () => void;
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
  onSetPrompt,
  onFocusInput,
  onQuickSuggestion,
  onRequestReview,
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

  return (
    <div className="flex-1 overflow-y-auto">
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
              <span className="text-sm font-semibold text-[#0F172A]">{t("pinkPepper")}</span>
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
