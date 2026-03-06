"use client";

import { FormEvent, useCallback, useEffect, useRef } from "react";

const MAX_PROMPT_CHARS = 2500;

type ChatInputProps = {
  prompt: string;
  loading: boolean;
  attachedImage: File | null;
  imagePreview: string | null;
  canUploadImages: boolean;
  onPromptChange: (s: string) => void;
  onSubmit: (e: FormEvent) => void;
  onStop: () => void;
  onImageSelect: (f: File) => void;
  onClearImage: () => void;
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
  onPromptChange,
  onSubmit,
  onStop,
  onImageSelect,
  onClearImage,
  onKeyDown,
  textareaRef,
  onUpgradeForImages,
  placeholder,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const remainingChars = MAX_PROMPT_CHARS - prompt.length;

  return (
    <div className="flex-shrink-0 bg-white px-4 py-3">
      <div className="mx-auto max-w-5xl">
        {imagePreview && (
          <div className="mb-2 flex items-start gap-2">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Attached" className="h-16 w-16 rounded-lg object-cover border border-[#E2E8F0]" />
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
              {attachedImage?.name} - food safety analysis will be performed on this photo.
            </span>
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
            }}
          />

          {canUploadImages ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 rounded-xl border border-[#E2E8F0] bg-white p-2.5 text-[#64748B] hover:bg-[#F8F9FB] hover:text-[#0F172A] transition-colors"
              title="Attach a photo for food safety analysis"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onUpgradeForImages?.()}
              className="group relative flex-shrink-0 rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8F9FB] p-2.5 text-[#CBD5E1] hover:border-[#E11D48] hover:text-[#E11D48] transition-colors"
              title="Upgrade to Plus or Pro to analyse photos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 rounded-lg bg-[#0F172A] px-2 py-1.5 text-center text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal">
                Upgrade for photo analysis
              </span>
            </button>
          )}

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
              className={`w-full resize-none rounded-xl border bg-white px-4 py-2.5 pr-14 text-base text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-colors ${remainingChars <= 100 ? "border-[#E11D48]" : "border-[#E2E8F0]"}`}
              placeholder={
                placeholder ??
                (attachedImage
                  ? "Add a note about this photo (optional)..."
                  : "Ask a food safety question... (Shift+Enter for new line)")
              }
              style={{ minHeight: "44px", maxHeight: "min(32vh, 220px)" }}
            />
            <span className={`pointer-events-none absolute bottom-1.5 right-3 text-[11px] ${remainingChars <= 100 ? "text-[#E11D48]" : "text-[#94A3B8]"}`}>
              {prompt.length}/{MAX_PROMPT_CHARS}
            </span>
          </div>

          {loading ? (
            <button
              type="button"
              onClick={onStop}
              className="flex-shrink-0 rounded-xl border-2 border-[#E11D48] bg-white p-2.5 text-[#E11D48] hover:bg-[#FEF2F2] transition-colors"
              title="Stop generating"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!prompt.trim() && !attachedImage}
              className="flex-shrink-0 rounded-xl bg-[#E11D48] p-2.5 text-white hover:bg-[#BE123C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          )}
        </form>

      </div>
    </div>
  );
}
