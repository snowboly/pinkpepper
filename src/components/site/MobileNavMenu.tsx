"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type MobileNavItem =
  | { href: string; label: string }
  | { label: string; children: { href: string; label: string }[] };

type MobileNavMenuProps = {
  items: MobileNavItem[];
  loginHref: string;
  signupHref: string;
  loginLabel: string;
  signupLabel: string;
  showAuthLinks: boolean;
};

export function MobileNavMenu(props: MobileNavMenuProps) {
  const pathname = usePathname();

  return <MobileNavMenuPanel key={pathname} {...props} />;
}

function MobileNavMenuPanel({
  items,
  loginHref,
  signupHref,
  loginLabel,
  signupLabel,
  showAuthLinks,
}: MobileNavMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <div ref={menuRef} className="relative lg:hidden">
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-site-navigation"
        onClick={() => setOpen((current) => !current)}
        className="pp-interactive flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] md:h-10 md:w-10"
      >
        <span className="flex flex-col gap-1">
          <span className="block h-0.5 w-4 rounded-full bg-current" />
          <span className="block h-0.5 w-4 rounded-full bg-current" />
          <span className="block h-0.5 w-4 rounded-full bg-current" />
        </span>
      </button>
      {open && (
        <div
          id="mobile-site-navigation"
          className="pp-glass-card absolute right-0 top-[calc(100%+10px)] z-50 w-[min(18rem,calc(100vw-1.5rem))] rounded-3xl p-3"
        >
          <nav className="flex flex-col">
            {items.map((item) =>
              "href" in item ? (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="rounded-2xl px-3 py-3 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  {item.label}
                </Link>
              ) : (
                <div key={item.label}>
                  <button
                    type="button"
                    aria-expanded={expandedGroup === item.label}
                    onClick={() =>
                      setExpandedGroup((current) => (current === item.label ? null : item.label))
                    }
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                  >
                    {item.label}
                    <svg
                      className={`h-3.5 w-3.5 text-[#94A3B8] transition-transform duration-200 ${
                        expandedGroup === item.label ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {expandedGroup === item.label && (
                    <div className="ml-3 border-l border-[#E2E8F0] pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={closeMenu}
                          className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ),
            )}
            {showAuthLinks && (
              <>
                <Link
                  href={loginHref}
                  onClick={closeMenu}
                  className="rounded-2xl px-3 py-3 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  {loginLabel}
                </Link>
                <Link
                  href={signupHref}
                  onClick={closeMenu}
                  className="pp-interactive mt-2 rounded-2xl bg-[#E11D48] px-3 py-3 text-center text-sm font-semibold text-white hover:bg-[#BE123C]"
                >
                  {signupLabel}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
