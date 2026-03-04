"use client";

import type { Message } from "./types";
import { SourceCardsList } from "@/components/chat/SourceCard";

type MessageItemProps = {
  message: Message;
  isLastAssistantMessage: boolean;
  reviewEligible: boolean;
  conversationId: string | null;
  onRequestReview: () => void;
};

export default function MessageItem({
  message,
  isLastAssistantMessage,
  reviewEligible,
  conversationId,
  onRequestReview,
}: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div className={`py-5 ${isUser ? "bg-[#F8F9FB]" : ""}`}>
      <div className="mx-auto max-w-3xl px-4">
        {/* Role label */}
        <div className="mb-1.5 flex items-center gap-2">
          {isUser ? (
            <span className="text-sm font-semibold text-[#0F172A]">You</span>
          ) : (
            <>
              <div className="h-5 w-5 rounded-full bg-[#E11D48] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-[#0F172A]">PinkPepper</span>
            </>
          )}
        </div>

        {/* Image attachment (user only) */}
        {message.imagePreview && (
          <div className="mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.imagePreview}
              alt="Attached photo"
              className="max-h-48 rounded-lg border border-[#E2E8F0] object-cover"
            />
          </div>
        )}

        {/* Message content — full width, no bubble */}
        <div className="text-sm leading-relaxed text-[#0F172A] whitespace-pre-wrap">
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-[#0F172A] animate-pulse ml-0.5 align-text-bottom" />
          )}
        </div>

        {/* Citations */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-3">
            <SourceCardsList citations={message.citations} maxInitialDisplay={3} />
          </div>
        )}

        {/* Review button on last assistant message */}
        {!isUser && isLastAssistantMessage && reviewEligible && conversationId && (
          <div className="mt-2">
            <button
              type="button"
              onClick={onRequestReview}
              className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#64748B] hover:bg-[#F8F9FB] transition-colors"
            >
              Request expert review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
