"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type NavKey = "features" | "gallery" | "pricing" | "blog" | "docs";
type ActiveKey = NavKey | "home" | "about";

const NAV_ITEMS: { key: NavKey; label: string; href: string }[] = [
  { key: "features", label: "Features", href: "/features" },
  { key: "gallery", label: "Gallery", href: "/gallery" },
  { key: "pricing", label: "Pricing", href: "/pricing" },
  { key: "blog", label: "Blog", href: "/blog" },
  { key: "docs", label: "Docs", href: "/docs" },
];

const DRAWER_ITEMS: { key: ActiveKey; label: string; href: string }[] = [
  ...NAV_ITEMS,
  { key: "about", label: "About", href: "/about" },
];

export default function Nav({ active = "home" }: { active?: ActiveKey }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(min-width:821px)");
    const onWide = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onWide);
    return () => mq.removeEventListener("change", onWide);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={scrolled || open ? "nv nv-on" : "nv"}>
      <div className="nv-inner">
        <Link href="/" className="nv-brand">
          <span className="nv-mark" aria-hidden="true"></span>
          <span className="nv-word">Manition</span>
        </Link>

        <nav className="nv-links">
          {NAV_ITEMS.map(({ key, label, href }) => (
            <Link key={key} href={href} className={key === active ? "nv-a nv-a-on" : "nv-a"}>
              {label}
            </Link>
          ))}
        </nav>

        <span className="nv-spacer"></span>

        <Link href="/#waitlist" className="nv-cta">
          Join<span className="nv-cta-tail">&nbsp;waitlist</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="M13 6l6 6-6 6"></path>
          </svg>
        </Link>

        <button
          type="button"
          className="nv-burger"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12"></path>
              <path d="M18 6L6 18"></path>
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 8h16"></path>
              <path d="M4 16h16"></path>
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="nv-drawer">
          <div className="nv-drawer-in">
            {DRAWER_ITEMS.map(({ key, label, href }) => (
              <Link
                key={key}
                href={href}
                onClick={() => setOpen(false)}
                className={key === active ? "nv-d nv-d-on" : "nv-d"}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
