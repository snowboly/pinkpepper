import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

const nav = [
  { href: "/features", label: "Features" },
  { href: "/use-cases", label: "Use Cases" },
  { href: "/resources", label: "Resources" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function getUserInitials(email: string | null | undefined, fullName: string | null | undefined) {
  if (fullName) {
    const words = fullName.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

export async function SiteHeader() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase env vars unavailable during build-time prerendering; show logged-out state.
  }
  const fullName =
    (typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null) ??
    (typeof user?.user_metadata?.name === "string" ? user.user_metadata.name : null);
  const initials = getUserInitials(user?.email, fullName);

  return (
    <header className="site-header sticky top-0 z-50 border-b border-[#E2E8F0]/80 bg-white/75 backdrop-blur-xl">
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
            {nav.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link pp-shell-link"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <details className="relative lg:hidden">
            <summary
              aria-label="Open navigation menu"
              className="pp-interactive flex h-9 w-9 list-none items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] md:h-10 md:w-10"
            >
              <span className="flex flex-col gap-1">
                <span className="block h-0.5 w-4 rounded-full bg-current" />
                <span className="block h-0.5 w-4 rounded-full bg-current" />
                <span className="block h-0.5 w-4 rounded-full bg-current" />
              </span>
            </summary>
            <div className="pp-glass-card absolute right-0 top-[calc(100%+10px)] z-50 w-72 rounded-3xl p-3">
              <nav className="flex flex-col">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl px-3 py-3 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                  >
                    {item.label}
                  </Link>
                ))}
                {!user && (
                  <>
                    <Link
                      href="/login"
                      className="rounded-2xl px-3 py-3 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className="pp-interactive mt-2 rounded-2xl bg-[#E11D48] px-3 py-3 text-center text-sm font-semibold text-white hover:bg-[#BE123C]"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </details>
          {user ? (
            <details className="group relative">
              <summary
                aria-label="Open account menu"
                className="pp-interactive flex h-9 w-9 list-none items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-xs font-bold tracking-wide text-[#0F172A] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] md:h-10 md:w-10"
                title={user.email ?? "Account"}
              >
                {initials}
              </summary>
              <div className="pp-glass-card absolute right-0 top-[calc(100%+10px)] z-50 w-48 rounded-2xl p-1.5">
                <Link
                  href="/dashboard"
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  Settings
                </Link>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#E11D48] hover:bg-[#FFF1F2]"
                  >
                    Log out
                  </button>
                </form>
              </div>
            </details>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-semibold text-[#64748B] transition-all duration-200 hover:text-[#0F172A] sm:block"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="pp-interactive rounded-full bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white hover:bg-[#BE123C] hover:shadow-lg hover:shadow-[#E11D48]/30 active:scale-[0.97] md:px-5 md:py-2.5"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer border-t border-[#F1F5F9] bg-[linear-gradient(180deg,#fff_0%,#fff7f8_100%)] py-16">
      <div className="pp-container mb-12 grid gap-12 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1.5fr]">
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
            AI food safety compliance software for EU and UK food businesses.
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
            <li><Link href="/features" className="pp-shell-link">Features</Link></li>
            <li><Link href="/use-cases" className="pp-shell-link">Use Cases</Link></li>
            <li><Link href="/resources" className="pp-shell-link">Resources</Link></li>
            <li><Link href="/about" className="pp-shell-link">About</Link></li>
            <li><Link href="/pricing" className="pp-shell-link">Pricing</Link></li>
            <li><Link href="/login" className="pp-shell-link">Log In</Link></li>
            <li><Link href="/signup" className="pp-shell-link">Create Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-[#1A1A1A]">Support</h4>
          <ul className="space-y-3 text-sm text-[#6B6B6B]">
            <li><Link href="/contact" className="pp-shell-link">Contact & Support</Link></li>
            <li><Link href="/compare" className="pp-shell-link">Comparisons</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-[#1A1A1A]">Security & Legal</h4>
          <ul className="space-y-3 text-sm text-[#6B6B6B]">
            <li><Link href="/security" className="pp-shell-link">Security</Link></li>
            <li><Link href="/legal/terms" className="pp-shell-link">Terms of Service</Link></li>
            <li><Link href="/legal/privacy" className="pp-shell-link">Privacy Policy</Link></li>
            <li><Link href="/legal/cookies" className="pp-shell-link">Cookie Policy</Link></li>
            <li><Link href="/legal/dpa" className="pp-shell-link">DPA</Link></li>
            <li><Link href="/legal/acceptable-use" className="pp-shell-link">Acceptable Use</Link></li>
            <li><Link href="/legal/refund" className="pp-shell-link">Refund Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="pp-container border-t border-[#F1F5F9] pt-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-[#9B9B9B] md:flex-row md:text-left">
          <p>&copy; {new Date().getFullYear()} PinkPepper.io. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
