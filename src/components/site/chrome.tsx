import Image from "next/image";
import Link from "next/link";

const nav = [
  { href: "/pricing", label: "Pricing" },
  { href: "/resources", label: "Resources" },
  { href: "/compliance", label: "Compliance" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="pp-container flex h-14 items-center justify-between md:h-16">
        <div className="flex items-center gap-8 lg:gap-12">
          <Link href="/" className="flex items-center leading-none">
            <Image
              src="/logo/LogoV3.png"
              alt="PinkPepper"
              width={220}
              height={44}
              priority
              className="h-8 w-auto object-contain md:h-9"
            />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold tracking-[0.01em] text-[#64748B] lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-[#0F172A]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="/login"
            className="hidden text-sm font-semibold text-[#64748B] transition-colors hover:text-[#0F172A] sm:block"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#BE123C] md:px-5 md:py-2.5"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#F1F5F9] bg-white py-16">
      <div className="pp-container mb-12 grid gap-12 md:grid-cols-4">
        <div>
          <Link href="/" className="inline-flex items-center leading-none">
            <Image
              src="/logo/LogoV3.png"
              alt="PinkPepper"
              width={180}
              height={36}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-[#6B6B6B]">
            AI Food Safety and Compliance Assistant for EU and UK food businesses.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://www.linkedin.com/company/pinkpepper-io"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="PinkPepper on LinkedIn"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E8F0] text-[#64748B] transition-colors hover:border-[#CBD5E1] hover:text-[#0F172A]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-[#1A1A1A]">Platform</h4>
          <ul className="space-y-3 text-sm text-[#6B6B6B]">
            <li><Link href="/dashboard" className="transition-colors hover:text-[#1A1A1A]">Dashboard</Link></li>
            <li><Link href="/pricing" className="transition-colors hover:text-[#1A1A1A]">Pricing</Link></li>
            <li><Link href="/login" className="transition-colors hover:text-[#1A1A1A]">Log In</Link></li>
            <li><Link href="/signup" className="transition-colors hover:text-[#1A1A1A]">Create Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-[#1A1A1A]">Resources</h4>
          <ul className="space-y-3 text-sm text-[#6B6B6B]">
            <li><Link href="/" className="transition-colors hover:text-[#1A1A1A]">Features</Link></li>
            <li><Link href="/resources" className="transition-colors hover:text-[#1A1A1A]">Updates</Link></li>
            <li><Link href="/compliance" className="transition-colors hover:text-[#1A1A1A]">Compliance Notes</Link></li>
            <li><Link href="/contact" className="transition-colors hover:text-[#1A1A1A]">Contact & Support</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-[#1A1A1A]">Legal</h4>
          <ul className="space-y-3 text-sm text-[#6B6B6B]">
            <li><Link href="/legal/terms" className="transition-colors hover:text-[#1A1A1A]">Terms of Service</Link></li>
            <li><Link href="/legal/privacy" className="transition-colors hover:text-[#1A1A1A]">Privacy Policy</Link></li>
            <li><Link href="/legal/cookies" className="transition-colors hover:text-[#1A1A1A]">Cookie Policy</Link></li>
            <li><Link href="/legal/dpa" className="transition-colors hover:text-[#1A1A1A]">DPA</Link></li>
            <li><Link href="/legal/refund" className="transition-colors hover:text-[#1A1A1A]">Refund Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="pp-container border-t border-[#F1F5F9] pt-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-[#9B9B9B] md:flex-row md:text-left">
          <p>&copy; {new Date().getFullYear()} PinkPepper.io. All rights reserved.</p>
          <p className="max-w-lg">
            AI-assisted drafts for food safety documentation. Outputs must be reviewed by qualified personnel.
          </p>
        </div>
      </div>
    </footer>
  );
}
