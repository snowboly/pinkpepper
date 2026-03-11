"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useTranslations } from "next-intl";
import type { Message } from "./types";

type MessageItemProps = {
  message: Message;
  isLastAssistantMessage: boolean;
  reviewEligible: boolean;
  conversationId: string | null;
  onRequestReview: () => void;
  onUpgradeForReview?: () => void;
};

export default function MessageItem({
  message,
  isLastAssistantMessage,
  reviewEligible,
  conversationId,
  onRequestReview,
  onUpgradeForReview,
}: MessageItemProps) {
  const t = useTranslations("chat");
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  function copyToClipboard() {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="py-5">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        {isUser ? (
          /* ── User message: right-aligned rounded bubble ── */
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl bg-[#f4f4f4] px-4 py-3">
              {message.imagePreview && (
                <div className="mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={message.imagePreview}
                    alt={t("attachedPhoto")}
                    className="max-h-48 rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="text-base leading-relaxed text-[#0F172A] whitespace-pre-wrap">
                {message.content}
              </div>
            </div>
          </div>
        ) : (
          /* ── Assistant message: left-aligned, no bubble ── */
          <>
            <div className="mb-1.5 flex items-center gap-2">
              <div className="relative h-5 w-5 rounded-full bg-[#E11D48]">
                <span className="absolute left-[5px] top-[4px] h-1.5 w-1.5 rounded-full bg-white/80" />
              </div>
              <span className="text-base font-semibold text-[#0F172A]">
                {message.persona ? `${message.persona.name}` : t("pinkPepper")}
              </span>
              {message.persona && (
                <span className="text-xs text-[#94A3B8] font-normal">{t("pinkPepper")}</span>
              )}
            </div>

            <div className="text-base text-[#0F172A] pp-markdown">
              <ReactMarkdown>{message.content}</ReactMarkdown>
              {message.isStreaming && (
                <span className="inline-block w-0.5 h-4 bg-[#0F172A] animate-pulse ml-0.5 align-text-bottom" />
              )}
            </div>

            {!message.isStreaming && message.content && (
              <>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-sm text-[#64748B] hover:bg-[#F8F9FB] transition-colors"
                    title={t("copyResponse")}
                  >
                    {copied ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {t("copied")}
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {t("copy")}
                      </>
                    )}
                  </button>
                  {isLastAssistantMessage && reviewEligible && conversationId && (
                    <button
                      type="button"
                      onClick={onRequestReview}
                      className="flex items-center gap-1.5 rounded-full border border-[#059669] bg-[#ECFDF5] px-3 py-1 text-sm font-medium text-[#047857] hover:bg-[#D1FAE5] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t("requestExpertReview")}
                    </button>
                  )}
                </div>

                {/* Review upsell for long responses when user is not review-eligible */}
                {isLastAssistantMessage && !reviewEligible && conversationId && message.content.length > 800 && onUpgradeForReview && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#059669]/10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0F172A]">{t("reviewUpsellTitle")}</p>
                      <p className="text-xs text-[#64748B]">{t("reviewUpsellBody")}</p>
                    </div>
                    <button
                      type="button"
                      onClick={onUpgradeForReview}
                      className="flex-shrink-0 rounded-lg bg-[#059669] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#047857] transition-colors"
                    >
                      {t("reviewUpsellCta")}
                    </button>
                  </div>
                )}

              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
