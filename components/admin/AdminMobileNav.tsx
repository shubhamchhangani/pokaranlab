"use client";

import { useState } from "react";

export function AdminMobileNav({
  shortName,
  navItems,
  logoutAction,
}: {
  shortName: string;
  navItems: { href: string; label: string }[];
  logoutAction: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-20 border-b border-brand-ink/10 bg-white sm:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="font-display text-lg font-semibold text-brand-indigo">{shortName}</p>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg border border-brand-ink/15 p-2 text-brand-ink"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-brand-ink/10 p-3">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-ink/5"
            >
              {item.label}
            </a>
          ))}
          <form action={logoutAction} className="mt-1 border-t border-brand-ink/10 pt-2">
            <button className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">
              Log out
            </button>
          </form>
        </nav>
      )}
    </div>
  );
}
