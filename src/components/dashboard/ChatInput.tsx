"use client";

import { FormEvent, useRef } from "react";
import Link from "next/link";
import type { SubscriptionTier } from "@/lib/tier";

type ChatInputProps = {
  prompt: string;
  loading: boolean;
  attachedImage: File | null;
  imagePreview: string | null;
  canUploadImages: boolean;
  isAdmin: boolean;
  tier: SubscriptionTier;
  onPromptChange: (s: string) => void;
  onSubmit: (e: FormEvent) => void;
  onImageSelect: (f: File) => void;
  onClearImage: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
};

export default function ChatInput({
  prompt,
  loading,
  attachedImage,
  imagePreview,
  canUploadImages,
  isAdmin,
  tier,
  onPromptChange,
  onSubmit,
  onImageSelect,
  onClearImage,
  onKeyDown,
  textareaRef,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleTextareaInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div className="flex-shrink-0 border-t border-[#E2E8F0] bg-white px-4 py-3">
      <div className="mx-auto max-w-3xl">
        {/* Image preview strip */}
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
            <span className="text-xs text-[#64748B] mt-1">
              {attachedImage?.name} — food safety analysis will be performed on this photo.
            </span>
          </div>
        )}

        <form onSubmit={onSubmit} className="flex items-end gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onImageSelect(f); }}
          />

          {/* Attach button */}
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
            <Link
              href="/pricing"
              className="flex-shrink-0 rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8F9FB] p-2.5 text-[#CBD5E1]"
              title="Upgrade to Plus or Pro to analyse photos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Link>
          )}

          {/* Textarea */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => { onPromptChange(e.target.value); handleTextareaInput(); }}
              onKeyDown={onKeyDown}
              rows={1}
              className="w-full resize-none rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 pr-12 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-colors overflow-hidden"
              placeholder={attachedImage ? "Add a note about this photo (optional)..." : "Ask a food safety question... (Shift+Enter for new line)"}
              style={{ minHeight: "44px", maxHeight: "160px" }}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={loading || (!prompt.trim() && !attachedImage)}
            className="flex-shrink-0 rounded-xl bg-[#E11D48] p-2.5 text-white hover:bg-[#BE123C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>

        <p className="mt-2 text-center text-[10px] text-[#94A3B8]">
          AI-assisted outputs must be reviewed by qualified personnel before use.
          {!isAdmin && tier === "free" && (
            <> {" · "}<Link href="/pricing" className="underline hover:text-[#64748B]">Upgrade for photo analysis &amp; exports</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
