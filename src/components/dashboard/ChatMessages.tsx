"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
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
  { category: "document" as const, key: "allergenPolicy" },
  { category: "document" as const, key: "cleaningPlan" },
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
  canUploadImages,
  onSetPrompt,
  onFocusInput,
  onQuickSuggestion,
  currentPersona,
}: ChatMessagesProps) {
  const t = useTranslations("chat");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  function syncScrollState() {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const nearBottom = distanceFromBottom < 120;
    shouldStickToBottomRef.current = nearBottom;
    setShowJumpToLatest(!nearBottom && messages.length > 0);
  }

  function jumpToLatest() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    shouldStickToBottomRef.current = true;
    setShowJumpToLatest(false);
  }

  useEffect(() => {
    if (!shouldStickToBottomRef.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: messages.length > 1 ? "smooth" : "auto" });
  }, [messages, loading]);

  const suggestions: StarterSuggestion[] = SUGGESTION_KEYS.map((s) => ({
    category: s.category,
    label: t(`suggestions.${s.key}.label`),
    text: t(`suggestions.${s.key}.text`),
  }));

  return (
    <div ref={scrollContainerRef} onScroll={syncScrollState} className="relative flex-1 overflow-y-auto">
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
            {canUploadImages ? t("descriptionWithImages") : t("descriptionUpgradeImages")}
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

      {loadingMessages && (
        <div className="flex justify-center py-8">
          <span className="text-base text-[#6B7280]">{t("loadingConversation")}</span>
        </div>
      )}

      {messages.map((msg, idx) => (
        <MessageItem
          key={`${msg.role}-${idx}`}
          message={msg}
        />
      ))}

      {loading && (messages.length === 0 || !messages[messages.length - 1]?.isStreaming) && (
        <div className="py-5" style={{ animation: "thinking-fade-in 0.18s ease-out both" }}>
          <div className="mx-auto max-w-5xl px-4 md:px-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#E11D48] text-[10px] font-bold text-white">
                PP
              </div>
              <span className="text-sm font-semibold text-[#0F172A]">
                {currentPersona ? currentPersona.name : t("pinkPepper")}
              </span>
            </div>
            <div className="pl-9">
              <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-[#E2E8F0] bg-[#F8F9FB] px-4 py-3">
                {([0, 150, 300] as const).map((delay) => (
                  <span
                    key={delay}
                    className="h-2 w-2 rounded-full bg-[#CBD5E1]"
                    style={{ animation: "thinking-wave 1.3s ease-in-out infinite", animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showJumpToLatest && (
        <div className="sticky bottom-4 z-10 flex justify-center px-4">
          <button
            type="button"
            onClick={jumpToLatest}
            className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-semibold text-[#0F172A] shadow-lg shadow-black/10 transition-colors hover:bg-[#F8F9FB]"
          >
            Jump to latest
          </button>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
