"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { Message } from "./types";
import MessageItem from "./MessageItem";

type ChatMessagesProps = {
  messages: Message[];
  loading: boolean;
  loadingMessages: boolean;
  conversationId: string | null;
  reviewEligible: boolean;
  canUploadImages: boolean;
  onSetPrompt: (s: string) => void;
  onFocusInput: () => void;
  onRequestReview: () => void;
};

const SUGGESTIONS = [
  "Create a HACCP plan for a 25-seat café with hot holding",
  "Draft a cleaning SOP for a commercial kitchen",
  "What allergens must be declared under EU 1169/2011?",
  "Generate a temperature monitoring log template",
];

export default function ChatMessages({
  messages,
  loading,
  loadingMessages,
  conversationId,
  reviewEligible,
  canUploadImages,
  onSetPrompt,
  onFocusInput,
  onRequestReview,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
          <h2 className="text-xl font-semibold text-[#0F172A] mb-2">Food Safety Assistant</h2>
          <p className="text-sm text-[#64748B] max-w-md">
            Ask food safety questions, generate HACCP plans, create SOPs, or{" "}
            {canUploadImages
              ? "attach a photo of your kitchen or a food label for instant analysis."
              : "upgrade to Plus or Pro to attach photos for analysis."}
          </p>
          <div className="mt-6 grid gap-2 grid-cols-1 sm:grid-cols-2 w-full max-w-lg">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => { onSetPrompt(suggestion); onFocusInput(); }}
                className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5 text-xs text-left text-[#475569] hover:bg-[#F8F9FB] hover:border-[#CBD5E1] transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading conversation messages */}
      {loadingMessages && (
        <div className="flex justify-center py-8">
          <span className="text-sm text-[#94A3B8]">Loading conversation...</span>
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
          <div className="mx-auto max-w-3xl px-4">
            <div className="mb-1.5 flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-[#E11D48] flex items-center justify-center animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-[#0F172A]">PinkPepper</span>
            </div>
            <div className="flex gap-1 ml-7">
              <span className="h-2 w-2 rounded-full bg-[#CBD5E1] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-[#CBD5E1] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-[#CBD5E1] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
