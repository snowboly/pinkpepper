"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Message, PersonaInfo } from "./types";
import MessageItem from "./MessageItem";
import { shouldShowGlobalThinkingRow } from "./chat-thinking-state";

type ChatMessagesProps = {
  messages: Message[];
  loading: boolean;
  loadingMessages: boolean;
  canUploadImages: boolean;
  currentPersona?: PersonaInfo | null;
  workspaceMode: "ask" | "virtual_audit";
};

export default function ChatMessages({
  messages,
  loading,
  loadingMessages,
  canUploadImages,
  currentPersona,
  workspaceMode,
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

  const modeKey = workspaceMode === "virtual_audit" ? "auditor" : "consultant";

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
          <div className="mt-6 w-full max-w-2xl rounded-2xl border border-[#E2E8F0] bg-white p-5 text-left shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[#EEF2F7] pb-3">
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">{t(`modeGuidance.${modeKey}.label`)}</p>
                <p className="mt-1 text-sm text-[#475569]">{t(`modeGuidance.${modeKey}.bestFor`)}</p>
              </div>
              <span className="rounded-full bg-[#F8FAFC] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                {workspaceMode === "virtual_audit" ? t("modeGuidance.auditor.badge") : t("modeGuidance.consultant.badge")}
              </span>
            </div>
            <p className="mt-3 text-sm text-[#64748B]">{t(`modeGuidance.${modeKey}.useWhen`)}</p>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">{t("modeGuidance.examplesLabel")}</p>
              <ul className="mt-2 space-y-2 text-sm text-[#0F172A]">
                <li>{t(`modeGuidance.${modeKey}.examples.0`)}</li>
                <li>{t(`modeGuidance.${modeKey}.examples.1`)}</li>
              </ul>
            </div>
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

      {shouldShowGlobalThinkingRow(messages, loading) && (
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
