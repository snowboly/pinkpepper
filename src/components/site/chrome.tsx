import Image from "next/image";
import Link from "next/link";

const nav = [
  { href: "/pricing", label: "Pricing" },
  { href: "/resources", label: "Resources" },
  { href: "/compliance", label: "Compliance" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#2F1C1C]/15 bg-[#FFF7F2]/92 shadow-[0_1px_0_rgba(47,28,28,0.08)] backdrop-blur-xl">
      <div className="pp-container flex h-14 items-center justify-between md:h-16">
        <div className="flex items-center gap-8 lg:gap-12">
          <Link href="/" className="flex h-12 items-center overflow-hidden leading-none md:h-14">
            <Image
              src="/logo/PP_logo_nopadding.png"
              alt="PinkPepper"
              width={240}
              height={64}
              priority
              className="h-16 w-auto max-w-none scale-[1.3] md:h-[4.4rem] md:scale-[1.34]"
            />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold tracking-[0.01em] text-[#5E4747] lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-[#1F1212]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="/login"
            className="hidden text-sm font-semibold text-[#5E4747] transition-colors hover:text-[#1F1212] sm:block"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-gradient-to-r from-[#C62828] to-[#991B1B] px-4 py-2 text-sm font-semibold text-white transition-all hover:from-[#B91C1C] hover:to-[#7F1D1D] md:px-5 md:py-2.5"
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
    <footer className="border-t border-[#E8E4DF] bg-white py-16">
      <div className="pp-container mb-12 grid gap-12 md:grid-cols-4">
        <div>
          <Link href="/" className="inline-flex h-10 items-center overflow-hidden leading-none">
            <Image
              src="/logo/PP_logo_nopadding.png"
              alt="PinkPepper"
              width={180}
              height={48}
              className="h-10 w-auto max-w-none scale-[1.22]"
            />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-[#6B6B6B]">
            AI Food Safety and Compliance Assistant for EU and UK food businesses.
          </p>
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
            <li><Link href="/" className="transition-colors hover:text-[#1A1A1A]">Product Overview</Link></li>
            <li><Link href="/resources" className="transition-colors hover:text-[#1A1A1A]">Blog and Updates</Link></li>
            <li><Link href="/compliance" className="transition-colors hover:text-[#1A1A1A]">Compliance Notes</Link></li>
            <li><span className="text-[#9B9B9B]">Help Center (coming soon)</span></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-[#1A1A1A]">Legal</h4>
          <ul className="space-y-3 text-sm text-[#6B6B6B]">
            <li><Link href="/legal/terms" className="transition-colors hover:text-[#1A1A1A]">Terms of Service</Link></li>
            <li><Link href="/legal/privacy" className="transition-colors hover:text-[#1A1A1A]">Privacy Policy</Link></li>
            <li><Link href="/legal/cookies" className="transition-colors hover:text-[#1A1A1A]">Cookie Policy</Link></li>
            <li><Link href="/legal/dpa" className="transition-colors hover:text-[#1A1A1A]">DPA</Link></li>
          </ul>
        </div>
      </div>
      <div className="pp-container border-t border-[#E8E4DF] pt-8">
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
