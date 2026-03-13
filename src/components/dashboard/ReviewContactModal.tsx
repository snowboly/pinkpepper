"use client";

import { useRef, useState } from "react";

type Props = {
  userEmail: string;
  onClose: () => void;
};

export default function ReviewContactModal({ userEmail, onClose }: Props) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !subject.trim() || !message.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("subject", subject.trim());
      fd.append("message", message.trim());
      fd.append("file", file);

      const res = await fetch("/api/review-contact", { method: "POST", body: fd });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <h2 className="text-base font-semibold text-[#0F172A]">Send Document for Review</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-[#94A3B8] hover:text-[#0F172A] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="px-6 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF5]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#0F172A] mb-1">Request sent!</p>
            <p className="text-xs text-[#64748B]">Your document has been sent to our team. We&apos;ll reply to <strong>{userEmail}</strong> directly.</p>
            <button type="button" onClick={onClose} className="mt-5 rounded-xl bg-[#0F172A] px-5 py-2 text-sm font-medium text-white hover:bg-[#1E293B] transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* File upload */}
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Document <span className="text-[#E11D48]">*</span></label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8F9FB] px-4 py-3 hover:border-[#E11D48] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-[#E11D48]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="min-w-0 flex-1 truncate text-sm text-[#475569]">
                  {file ? file.name : "Click to attach PDF, DOCX or TXT"}
                </span>
                {file && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="flex-shrink-0 text-[#9CA3AF] hover:text-[#E11D48] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5" htmlFor="review-subject">
                Subject <span className="text-[#E11D48]">*</span>
              </label>
              <input
                id="review-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={150}
                placeholder="e.g. HACCP plan review request"
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] px-4 py-2.5 text-sm text-[#0F172A] placeholder-[#9CA3AF] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-colors"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5" htmlFor="review-message">
                Message <span className="text-[#E11D48]">*</span>
              </label>
              <textarea
                id="review-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Describe what you need reviewed and any specific questions..."
                className="w-full resize-none rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] px-4 py-2.5 text-sm text-[#0F172A] placeholder-[#9CA3AF] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-colors"
              />
            </div>

            {error && <p className="text-xs text-[#E11D48]">{error}</p>}

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-[#94A3B8]">Reply will be sent to <strong className="text-[#64748B]">{userEmail}</strong></p>
              <button
                type="submit"
                disabled={loading || !file || !subject.trim() || !message.trim()}
                className="rounded-xl bg-[#E11D48] px-5 py-2 text-sm font-semibold text-white hover:bg-[#BE123C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Sending…" : "Send for Review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
