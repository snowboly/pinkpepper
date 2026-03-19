"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Message, PersonaInfo } from "./types";
import MessageItem from "./MessageItem";

export type StarterSuggestion = {
  category: "document" | "audit" | "qa";
  key?: string;
  label: string;
  text: string;
};

type ChatMessagesProps = {
  messages: Message[];
  loading: boolean;
  loadingMessages: boolean;
  conversationId: string | null;
  canUploadImages: boolean;
  onSetPrompt: (s: string) => void;
  onFocusInput: () => void;
  onQuickSuggestion?: (s: StarterSuggestion) => void;
  currentPersona?: PersonaInfo | null;
  showDocumentStarters?: boolean;
};

type DocCategory = {
  titleKey: string;
  items: { key: string }[];
};

const DOC_CATEGORIES: DocCategory[] = [
  {
    titleKey: "docCategories.corePlans",
    items: [
      { key: "haccpPlan" },
      { key: "foodSafetyPolicy" },
    ],
  },
  {
    titleKey: "docCategories.procedures",
    items: [
      { key: "traceabilityProcedure" },
      { key: "pestControlProcedure" },
      { key: "wasteManagementProcedure" },
    ],
  },
  {
    titleKey: "docCategories.logsRecords",
    items: [
      { key: "tempLog" },
    ],
  },
];

export default function ChatMessages({
  messages,
  loading,
  loadingMessages,
  canUploadImages,
  onSetPrompt,
  onFocusInput,
  onQuickSuggestion,
  currentPersona,
  showDocumentStarters = true,
}: ChatMessagesProps) {
  const t = useTranslations("chat");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [docMenuOpen, setDocMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!docMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDocMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [docMenuOpen]);

  function handleDocSelect(key: string) {
    setDocMenuOpen(false);
    const suggestion: StarterSuggestion = {
      category: "document",
      key,
      label: t(`suggestions.${key}.label`),
      text: t(`suggestions.${key}.text`),
    };
    if (onQuickSuggestion) {
      onQuickSuggestion(suggestion);
    } else {
      onSetPrompt(suggestion.text);
      onFocusInput();
    }
  }

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

          {showDocumentStarters && (
            <div ref={menuRef} className="relative mt-6">
              <button
                type="button"
                onClick={() => setDocMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] shadow-sm hover:bg-[#F8F9FB] hover:border-[#CBD5E1] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t("createDocument")}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-[#94A3B8] transition-transform ${docMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {docMenuOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white shadow-lg z-20">
                  {DOC_CATEGORIES.map((cat) => (
                    <div key={cat.titleKey}>
                      <div className="px-4 pt-3 pb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                          {t(cat.titleKey)}
                        </span>
                      </div>
                      {cat.items.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => handleDocSelect(item.key)}
                          className="w-full px-4 py-2 text-left hover:bg-[#F8F9FB] transition-colors"
                        >
                          <span className="block text-sm font-medium text-[#0F172A]">
                            {t(`suggestions.${item.key}.label`)}
                          </span>
                          <span className="block text-xs text-[#64748B]">
                            {t(`suggestions.${item.key}.text`)}
                          </span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
