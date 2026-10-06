"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { parseStyle as css } from "../../lib/css";

export type NavKey = "" | "features" | "gallery" | "pricing" | "blog" | "docs";

const LINKS: { key: NavKey; href: string; label: string }[] = [
  { key: "features", href: "/features", label: "Features" },
  { key: "gallery", href: "/gallery", label: "Gallery" },
  { key: "pricing", href: "/pricing", label: "Pricing" },
  { key: "blog", href: "/blog", label: "Blog" },
  { key: "docs", href: "/docs", label: "Docs" },
];

const DOT =
  "position:absolute; left:50%; bottom:-9px; width:5px; height:5px; margin-left:-2.5px; border-radius:50%; background:#FF5B1F; box-shadow:0 0 8px rgba(255,91,31,.8);";

/** Fixed top bar: clear over the hero, frosted once the page scrolls; the orange dot circles the logo ring. */
export default function NightNav({ active = "", waitlistHref = "/#waitlist" }: { active?: NavKey; waitlistHref?: string }) {
  const nav = useRef<HTMLElement>(null);
  const orbit = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const n = nav.current;
      if (n) {
        const nb = window.scrollY > 8;
        n.style.background = nb ? "rgba(10,10,11,.74)" : "transparent";
        n.style.backdropFilter = nb ? "blur(14px)" : "none";
        n.style.setProperty("-webkit-backdrop-filter", nb ? "blur(14px)" : "none");
        n.style.borderBottomColor = nb ? "rgba(237,234,227,.08)" : "transparent";
      }
      if (orbit.current && !reduce) {
        const a = ((performance.now() - t0) / 20000) * Math.PI * 2;
        orbit.current.style.transform = "translate(" + Math.cos(a) * 4 + "px," + Math.sin(a) * 4 + "px)";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <nav ref={nav} style={css("position:fixed; top:0; left:0; right:0; z-index:100; border-bottom:1px solid transparent; transition:background .5s, border-color .5s;")}>
      <div style={css("max-width:1360px; margin:0 auto; padding:16px clamp(16px,4vw,40px); display:flex; align-items:center; justify-content:space-between; gap:24px;")}>
        <Link href="/" style={css("display:flex; align-items:center; gap:10px; text-decoration:none; color:#EDEAE3;")}>
          <span style={css("position:relative; width:22px; height:22px; border-radius:50%; border:1.5px solid #EDEAE3; box-sizing:border-box;")}>
            <span ref={orbit} style={css("position:absolute; left:50%; top:50%; width:7px; height:7px; margin:-3.5px 0 0 -3.5px; border-radius:50%; background:#FF5B1F;")} />
          </span>
          <span className="serif" style={css("font-size:24px; letter-spacing:-0.01em;")}>Manition</span>
        </Link>
        <div className="h3-navlinks" style={css("display:flex; align-items:center; gap:28px; font-size:14.5px;")}>
          {LINKS.map((n) => (
            <Link key={n.key} href={n.href} className={"h3-nl" + (n.key === active ? " on" : "")} style={css("position:relative;")} aria-current={n.key === active ? "page" : undefined}>
              {n.label}
              {n.key === active && <span aria-hidden="true" style={css(DOT)} />}
            </Link>
          ))}
        </div>
        <Link href={waitlistHref} className="h3-pill" style={css("gap:8px; font-size:14px; padding:10px 18px;")}>
          Join waitlist <span>→</span>
        </Link>
      </div>
    </nav>
  );
}
