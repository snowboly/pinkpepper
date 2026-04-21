import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">404</p>
      <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-5xl">Page not found</h1>
      <p className="mt-6 max-w-md text-lg leading-relaxed text-[#475569]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="rounded-full bg-[#E11D48] px-6 py-3 text-sm font-semibold text-white hover:bg-[#BE123C]"
        >
          Go home
        </Link>
        <Link
          href="/articles"
          className="rounded-full border border-[#E2E8F0] px-6 py-3 text-sm font-semibold text-[#475569] hover:border-[#CBD5E1] hover:text-[#0F172A]"
        >
          Browse articles
        </Link>
        <Link
          href="/resources"
          className="rounded-full border border-[#E2E8F0] px-6 py-3 text-sm font-semibold text-[#475569] hover:border-[#CBD5E1] hover:text-[#0F172A]"
        >
          Free templates
        </Link>
      </div>
    </main>
  );
}
