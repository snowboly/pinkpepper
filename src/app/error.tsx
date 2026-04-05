"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold text-[#0F172A]">Something went wrong</h1>
      <p className="mt-3 max-w-md text-[#64748B]">
        An unexpected error occurred. Please try again or return to the homepage.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-[#0F172A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E293B] transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-[#E2E8F0] px-5 py-2.5 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
