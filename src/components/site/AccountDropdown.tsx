"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function AccountDropdown({
  initials,
  email,
}: {
  initials: string;
  email: string | null;
}) {
  const pathname = usePathname();

  return <AccountDropdownMenu key={pathname} initials={initials} email={email} />;
}

function AccountDropdownMenu({
  initials,
  email,
}: {
  initials: string;
  email: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Toggle account dropdown"
        onClick={() => setOpen((value) => !value)}
        className="pp-interactive flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-xs font-bold tracking-wide text-[#0F172A] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] md:h-10 md:w-10"
        title={email ?? "Account"}
      >
        {initials}
      </button>

      {open ? (
        <div className="pp-glass-card absolute right-0 top-[calc(100%+10px)] z-50 w-48 rounded-2xl p-1.5">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
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
      ) : null}
    </div>
  );
}
