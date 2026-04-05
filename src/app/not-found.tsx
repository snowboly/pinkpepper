import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-[#0F172A]">404</h1>
      <h2 className="mt-3 text-xl font-semibold text-[#0F172A]">Page not found</h2>
      <p className="mt-2 max-w-md text-[#64748B]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-[#0F172A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E293B] transition-colors"
      >
        Back to homepage
      </Link>
    </div>
  );
}
