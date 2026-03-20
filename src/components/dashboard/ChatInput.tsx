"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const MAX_PROMPT_CHARS = 2500;

type ChatInputProps = {
  prompt: string;
  loading: boolean;
  attachedImage: File | null;
  imagePreview: string | null;
  canUploadImages: boolean;
  attachedDocument: File | null;
  isRecording: boolean;
  isTranscribing: boolean;
  recordingError: string | null;
  onPromptChange: (s: string) => void;
  onSubmit: (e: FormEvent) => void;
  onStop: () => void;
  onImageSelect: (f: File) => void;
  onClearImage: () => void;
  onDocumentSelect: (f: File) => void;
  onClearDocument: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onUpgradeForImages?: () => void;
  placeholder?: string;
};

export default function ChatInput({
  prompt,
  loading,
  attachedImage,
  imagePreview,
  canUploadImages,
  attachedDocument,
  isRecording,
  isTranscribing,
  recordingError,
  onPromptChange,
  onSubmit,
  onStop,
  onImageSelect,
  onClearImage,
  onDocumentSelect,
  onClearDocument,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onKeyDown,
  textareaRef,
  onUpgradeForImages,
  placeholder,
}: ChatInputProps) {
  const t = useTranslations("chat");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const maxHeight = window.innerWidth < 768 ? 160 : 220;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [textareaRef]);

  useEffect(() => {
    resizeTextarea();
  }, [prompt, resizeTextarea]);

  useEffect(() => {
    const onResize = () => resizeTextarea();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [resizeTextarea]);

  useEffect(() => {
    if (!actionMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!actionMenuRef.current?.contains(event.target as Node)) {
        setActionMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActionMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [actionMenuOpen]);

  const remainingChars = MAX_PROMPT_CHARS - prompt.length;

  return (
    <div className="flex-shrink-0 bg-white px-4 py-3">
      <div className="mx-auto max-w-5xl">
        {imagePreview && (
          <div className="mb-2 flex items-start gap-2">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt={t("attachedPhoto")} className="h-16 w-16 rounded-lg object-cover border border-[#E2E8F0]" />
              <button
                type="button"
                onClick={onClearImage}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-[#E11D48] text-white flex items-center justify-center hover:bg-[#BE123C] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <span className="text-sm text-[#64748B] mt-1">
              {t("imageAnalysisNote", { name: attachedImage?.name ?? "" })}
            </span>
          </div>
        )}

        {attachedDocument && (
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8F9FB] px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="min-w-0 flex-1 truncate text-sm text-[#0F172A]">{attachedDocument.name}</span>
            <button type="button" onClick={onClearDocument} className="ml-1 flex-shrink-0 text-[#9CA3AF] hover:text-[#E11D48] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <form onSubmit={onSubmit} className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImageSelect(f);
              e.target.value = "";
            }}
          />
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onDocumentSelect(f);
              e.target.value = "";
            }}
          />

          {/* Document attach — kept in action menu */}
          <div ref={actionMenuRef} className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setActionMenuOpen((open) => !open)}
              disabled={loading || isTranscribing}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-xl border border-[#E2E8F0] bg-white p-2.5 text-[#64748B] transition-colors hover:bg-[#F8F9FB] hover:text-[#0F172A] disabled:cursor-not-allowed disabled:opacity-60"
              title={t("attachDocumentTitle")}
              aria-expanded={actionMenuOpen}
              aria-label={t("attachDocumentTitle")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
            </button>

            {actionMenuOpen && (
              <div className="absolute bottom-full left-0 z-20 mb-2 w-56 rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setActionMenuOpen(false);
                    docInputRef.current?.click();
                  }}
                  disabled={loading}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[#0F172A] transition-colors hover:bg-[#F8F9FB] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{t("attachDocumentTitle")}</span>
                </button>
              </div>
            )}
          </div>

          {/* Camera / photo button — always visible, 1-tap access on mobile */}
          {canUploadImages ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || isTranscribing}
              className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white p-2.5 text-[#64748B] transition-colors hover:bg-[#F8F9FB] hover:text-[#0F172A] disabled:cursor-not-allowed disabled:opacity-60"
              title={t("attachPhotoTitle")}
              aria-label={t("attachPhotoTitle")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onUpgradeForImages?.()}
              disabled={loading || isTranscribing}
              className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white p-2.5 text-[#9CA3AF] transition-colors hover:bg-[#FEF2F2] hover:text-[#E11D48] disabled:cursor-not-allowed disabled:opacity-60"
              title={t("upgradePhotoTitle")}
              aria-label={t("upgradePhotoTitle")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={isRecording ? onStopRecording : onStartRecording}
            onKeyDown={(e) => {
              if (e.key === "Escape" && isRecording) {
                e.preventDefault();
                onCancelRecording();
              }
            }}
            disabled={loading || isTranscribing}
            aria-label={
              isTranscribing
                ? t("transcribing")
                : isRecording
                ? t("stopRecording")
                : t("startRecording")
            }
            title={
              isTranscribing
                ? t("transcribing")
                : isRecording
                ? t("stopRecording")
                : t("startRecording")
            }
            className={`flex-shrink-0 rounded-xl border p-2.5 transition-colors h-[44px] w-[44px] flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60 ${
              isTranscribing
                ? "border-[#FDBA74] bg-[#FFF7ED] text-[#C2410C]"
                : isRecording
                ? "border-[#E11D48] bg-[#FEF2F2] text-[#BE123C]"
                : "border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8F9FB] hover:text-[#0F172A]"
            }`}
          >
            {isTranscribing ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.75 12a7.25 7.25 0 017.25-7.25M19.25 12A7.25 7.25 0 0112 19.25" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4a3 3 0 00-3 3v5a3 3 0 106 0V7a3 3 0 00-3-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 11-14 0" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v3" />
              </svg>
            )}
          </button>

          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => {
                onPromptChange(e.target.value.slice(0, MAX_PROMPT_CHARS));
                resizeTextarea();
              }}
              onInput={resizeTextarea}
              onKeyDown={onKeyDown}
              rows={1}
              maxLength={MAX_PROMPT_CHARS}
              className={`w-full resize-none rounded-xl border bg-white px-4 py-2.5 pr-14 text-base text-[#0F172A] placeholder-[#9CA3AF] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-colors ${remainingChars <= 100 ? "border-[#E11D48]" : "border-[#E2E8F0]"}`}
              placeholder={
                placeholder ??
                (attachedImage
                  ? t("photoNote")
                  : t("placeholder"))
              }
              style={{ minHeight: "44px", maxHeight: "min(32vh, 220px)" }}
            />
            <span className={`pointer-events-none absolute bottom-1.5 right-3 text-[11px] ${remainingChars <= 100 ? "text-[#E11D48]" : "text-[#6B7280]"}`}>
              {prompt.length}/{MAX_PROMPT_CHARS}
            </span>
          </div>

          {loading ? (
            <button
              type="button"
              onClick={onStop}
              className="flex-shrink-0 rounded-xl border-2 border-[#E11D48] bg-white p-2.5 text-[#E11D48] hover:bg-[#FEF2F2] transition-colors h-[44px] w-[44px] flex items-center justify-center"
              title={t("stopGenerating")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!prompt.trim() && !attachedImage && !attachedDocument}
              className="flex-shrink-0 rounded-xl bg-[#E11D48] p-2.5 text-white hover:bg-[#BE123C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors h-[44px] w-[44px] flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          )}
        </form>
        <div className="mt-1 min-h-[18px] pl-1 text-xs">
          {isRecording ? (
            <span className="text-[#BE123C]">{t("recordingInProgress")}</span>
          ) : isTranscribing ? (
            <span className="text-[#C2410C]">{t("transcribing")}</span>
          ) : recordingError ? (
            <span className="text-[#E11D48]">{recordingError}</span>
          ) : null}
        </div>

      </div>
    </div>
  );
}
