"use client";

import { useEffect, useState } from "react";
import { WalletButton } from "./WalletButton";
import { XIcon } from "./XIcon";
import { BRAND, SOCIAL } from "@/lib/master-data";

const NAV_LINKS = [
  { label: "Collection", href: "#collection" },
  { label: "About", href: "#about" },
  { label: "Traits", href: "#traits" },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-5" aria-hidden="true">
      <span
        className={`absolute left-0 top-0 h-px w-5 bg-current transition-transform duration-300 ${
          open ? "translate-y-2 rotate-45" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-2 h-px w-5 bg-current transition-opacity duration-300 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 top-4 h-px w-5 bg-current transition-transform duration-300 ${
          open ? "-translate-y-2 -rotate-45" : ""
        }`}
      />
    </span>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "border-b border-ink/10 bg-cream/90 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-10">
        <a href="#home" className="font-serif text-lg tracking-wide text-ink">
          {BRAND.name}
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium uppercase tracking-[0.2em] text-ink/70 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          <a
            href={SOCIAL.x}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${BRAND.name} on X`}
            className="text-ink/70 transition-colors hover:text-ink"
          >
            <XIcon className="h-4 w-4" />
          </a>
          <WalletButton tone="light" variant="primary" />
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <MenuIcon open={open} />
        </button>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Mobile"
        className={`overflow-hidden border-t border-ink/10 bg-cream transition-[max-height] duration-300 md:hidden ${
          open ? "max-h-80" : "max-h-0 border-t-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-3 text-sm font-medium uppercase tracking-[0.15em] text-ink/80"
            >
              {link.label}
            </a>
          ))}
          <a
            href={SOCIAL.x}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${BRAND.name} on X`}
            className="flex items-center gap-2 py-3 text-sm font-medium uppercase tracking-[0.15em] text-ink/80"
          >
            <XIcon className="h-4 w-4" />
            X
          </a>
          <WalletButton tone="light" variant="primary" fullWidth className="mt-2" />
        </div>
      </nav>
    </header>
  );
}
