"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslations } from "next-intl";
import type { Message } from "./types";
import {
  formatVerificationLabel,
  getVerificationBadgeClassName,
} from "./chat-message-metadata";

type MessageItemProps = {
  message: Message;
};

export default function MessageItem({ message }: MessageItemProps) {
  const t = useTranslations("chat");
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  function copyToClipboard() {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (isUser) {
    return (
      <div className="py-5">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
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
              {message.documentName && (
                <div className="mb-2 flex max-w-xs items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-[#E11D48]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#0F172A]">{message.documentName}</span>
                </div>
              )}
              <div className="whitespace-pre-wrap text-base leading-relaxed text-[#0F172A]">
                {message.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group py-5">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="mb-2 flex items-center gap-2">
          {message.persona ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/${message.persona.name.toLowerCase()}.svg`}
              alt={message.persona.name}
              className="h-7 w-7 flex-shrink-0 rounded-full"
            />
          ) : (
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#E11D48] text-[10px] font-bold text-white">
              PP
            </div>
          )}
          <span className="text-sm font-semibold text-[#0F172A]">
            {message.persona ? message.persona.name : t("pinkPepper")}
          </span>
          {message.verificationState ? (
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getVerificationBadgeClassName(message.verificationState)}`}
            >
              {formatVerificationLabel(message.verificationState)}
            </span>
          ) : null}
          {message.isStreaming && (
            <span className="text-xs text-[#94A3B8]">{t("thinking")}</span>
          )}
        </div>

        <div className="pl-9">
          <div className="pp-markdown text-base text-[#0F172A]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            {message.isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse align-text-bottom bg-[#0F172A]" />
            )}
          </div>

          {!message.isStreaming && message.content && (
            <div className="mt-2 opacity-100 sm:opacity-0 transition-opacity sm:group-hover:opacity-100">
              <button
                type="button"
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1 rounded-md p-1 text-[#94A3B8] transition-colors hover:text-[#475569]"
                title={t("copyResponse")}
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
