"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useTranslations } from "next-intl";
import {
  deduplicateCitations,
  getSourceTypeLabel,
  groupCitationsByType,
  sortCitationsByRelevance,
} from "@/lib/rag/citations";
import type { Message } from "./types";

type MessageItemProps = {
  message: Message;
};

export default function MessageItem({ message }: MessageItemProps) {
  const t = useTranslations("chat");
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  const citations = useMemo(
    () => deduplicateCitations(sortCitationsByRelevance(message.citations ?? [])),
    [message.citations]
  );
  const citationGroups = useMemo(() => groupCitationsByType(citations), [citations]);

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
    <div className="py-5">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="rounded-[28px] border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#E11D48] text-sm font-bold text-white shadow-sm shadow-[#E11D48]/20">
                  PP
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-semibold text-[#0F172A]">
                      {message.persona ? message.persona.name : t("pinkPepper")}
                    </span>
                    <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-medium text-[#64748B]">
                      Assistant
                    </span>
                    {message.isStreaming && (
                      <span className="rounded-full border border-[#FBCFE8] bg-[#FFF1F2] px-2 py-0.5 text-[11px] font-medium text-[#BE123C]">
                        {t("thinking")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#64748B]">
                    {message.persona ? t("pinkPepper") : "Food safety guidance"}
                  </p>
                </div>
              </div>

              {!message.isStreaming && message.content && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-[#475569] transition-colors hover:bg-[#F8F9FB]"
                    title={t("copyResponse")}
                  >
                    {copied ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {t("copied")}
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {t("copy")}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-5 py-5">
            {message.artifact && (
              <div className="mb-4 rounded-2xl border border-[#E2E8F0] bg-[#FCFDFE] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#E11D48]">Saved artifact</p>
                    <h3 className="mt-1 text-sm font-semibold text-[#0F172A]">{message.artifact.title}</h3>
                  </div>
                  <span className="rounded-full border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11px] font-medium text-[#64748B]">
                    {message.artifact.status}
                  </span>
                </div>
                {message.artifact.summary && (
                  <p className="mt-2 text-sm leading-6 text-[#475569]">{message.artifact.summary}</p>
                )}
              </div>
            )}

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#FFF4F6] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#BE123C]">
                Response
              </span>
              {citations.length > 0 && (
                <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-medium text-[#475569]">
                  {citations.length} source{citations.length === 1 ? "" : "s"}
                </span>
              )}
            </div>

            <div className="pp-markdown text-base text-[#0F172A]">
              <ReactMarkdown>{message.content}</ReactMarkdown>
              {message.isStreaming && (
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse align-text-bottom bg-[#0F172A]" />
              )}
            </div>
          </div>

          {(citations.length > 0 || !message.isStreaming) && (
            <div className="border-t border-[#E2E8F0] bg-[#FCFDFE] px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Evidence and next steps</p>
                  <p className="text-xs text-[#64748B]">
                    {citations.length > 0
                      ? "Review the source material behind this answer before using it operationally."
                      : "Use copy or export when this response is ready to move into a document or workflow."}
                  </p>
                </div>

                {citations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setEvidenceOpen((open) => !open)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm font-medium text-[#475569] transition-colors hover:bg-[#F8F9FB]"
                  >
                    <span>{evidenceOpen ? "Hide evidence" : "View evidence"}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${evidenceOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {evidenceOpen && citations.length > 0 && (
                <div className="mt-4 space-y-4">
                  {Object.entries(citationGroups).map(([sourceType, items]) => (
                    <div key={sourceType} className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="text-sm font-semibold text-[#0F172A]">{getSourceTypeLabel(sourceType)}</h4>
                        <span className="text-xs text-[#94A3B8]">
                          {items.length} item{items.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {items.map((citation) => (
                          <div key={citation.id} className="rounded-xl bg-[#F8FAFC] p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-[#0F172A]">{citation.title}</span>
                              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-[#64748B]">
                                {Math.round(citation.similarity * 100)}% match
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-[#64748B]">
                              {citation.sourceName}
                              {citation.sectionRef ? ` · ${citation.sectionRef}` : ""}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[#334155]">{citation.excerpt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
