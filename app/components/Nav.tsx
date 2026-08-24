"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { parseStyle } from "../lib/css";
import { Hover } from "./Interactive";

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

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(min-width:821px)");
    const onWide = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onWide);
    return () => mq.removeEventListener("change", onWide);
  }, []);

  return (
    <header
      style={parseStyle(
        "position:sticky; top:0; z-index:100; display:flex; align-items:center; justify-content:center; background:rgba(247,246,243,0.82); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid #e7e4dc; font-family:'IBM Plex Sans',ui-sans-serif,system-ui;",
      )}
    >
      <div
        style={parseStyle(
          "width:100%; max-width:1200px; display:flex; align-items:center; gap:18px; padding:0 30px; height:66px;",
        )}
      >
        <Link
          href="/"
          style={parseStyle(
            "display:flex; align-items:center; gap:10px; text-decoration:none; margin-right:6px;",
          )}
        >
          <div
            style={parseStyle(
              "width:27px; height:27px; flex:0 0 auto; border-radius:8px; border:1px solid #d7d3c8; display:flex; align-items:center; justify-content:center; background:#ffffff; box-shadow:0 1px 2px rgba(24,24,27,0.05);",
            )}
          >
            <div
              style={parseStyle(
                "width:9px; height:9px; border-radius:50%; border:1.6px solid #16161a;",
              )}
            ></div>
          </div>
          <span
            style={parseStyle(
              "color:#16161a; font-family:'Space Grotesk'; font-weight:700; font-size:16px; letter-spacing:-0.02em;",
            )}
          >
            Manition
          </span>
        </Link>

        <nav
          className="nv-links"
          style={parseStyle(
            "display:flex; align-items:center; gap:2px; margin-left:8px;",
          )}
        >
          {NAV_ITEMS.map(({ key, label, href }) => {
            const on = key === active;
            const color = on ? "#16161a" : "#6b6b74";
            const bg = on ? "#eae7df" : "transparent";
            const weight = on ? "600" : "500";
            return (
              <Hover
                key={key}
                as="a"
                href={href}
                style={`text-decoration:none; font-size:13.5px; font-weight:${weight}; color:${color}; background:${bg}; padding:7px 12px; border-radius:9px; transition:background .15s,color .15s;`}
                hoverStyle={{ background: "#eeebe3", color: "#16161a" }}
              >
                {label}
              </Hover>
            );
          })}
        </nav>

        <div style={parseStyle("flex:1;")}></div>

        {/* Sign in is hidden until the auth page is ported.
        <Hover
          as="a"
          className="nv-signin"
          href="../Manition Auth v3.dc.html"
          style="text-decoration:none; font-size:13.5px; font-weight:500; color:#3f3f46; padding:7px 10px; border-radius:9px;"
          hoverStyle={{ color: "#16161a" }}
        >
          Sign in
        </Hover>
        */}
        <Hover
          as="a"
          className="nv-cta"
          href="/#waitlist"
          style="display:inline-flex; align-items:center; gap:7px; text-decoration:none; font-size:13.5px; font-weight:600; color:#f7f6f3; background:#16161a; padding:9px 15px; border-radius:10px; border:1px solid #16161a; white-space:nowrap; transition:transform .15s, background .15s;"
          hoverStyle={{ background: "#000", transform: "translateY(-1px)" }}
        >
          <span style={parseStyle("white-space:nowrap;")}>
            Join<span className="nv-cta-tail">&nbsp;waitlist</span>
          </span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14"></path>
            <path d="M13 6l6 6-6 6"></path>
          </svg>
        </Hover>

        <Hover
          as="button"
          className="nv-burger"
          onClick={() => setOpen((o) => !o)}
          ariaLabel={open ? "Close menu" : "Open menu"}
          ariaExpanded={open}
          style="appearance:none; width:38px; height:38px; flex:none; align-items:center; justify-content:center; background:#ffffff; border:1px solid #ddd9cf; border-radius:10px; cursor:pointer; color:#16161a; padding:0;"
          hoverStyle={{ borderColor: "#c9c4b8" }}
        >
          {open ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12"></path>
              <path d="M18 6L6 18"></path>
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16"></path>
              <path d="M4 12h16"></path>
              <path d="M4 17h16"></path>
            </svg>
          )}
        </Hover>
      </div>

      {open && (
        <div
          style={parseStyle(
            "position:absolute; top:66px; left:0; right:0; background:#faf9f6; border-bottom:1px solid #e7e4dc; box-shadow:0 18px 34px -24px rgba(22,22,26,0.35); animation:nv-drop .18s cubic-bezier(.22,1,.36,1);",
          )}
        >
          <div
            style={parseStyle(
              "max-width:1200px; margin:0 auto; padding:10px 22px 18px; display:flex; flex-direction:column;",
            )}
          >
            {DRAWER_ITEMS.map(({ key, label, href }) => {
              const on = key === active;
              return (
                <Link
                  key={key}
                  href={href}
                  onClick={() => setOpen(false)}
                  style={parseStyle(
                    `text-decoration:none; font-size:16px; font-weight:${on ? "600" : "500"}; color:${on ? "#16161a" : "#6b6b74"}; padding:14px 8px; border-bottom:1px solid #eae7df;`,
                  )}
                >
                  {label}
                </Link>
              );
            })}
            {/* Sign in is hidden until the auth page is ported.
            <a
              href="../Manition Auth v3.dc.html"
              style={parseStyle(
                "text-decoration:none; font-size:16px; font-weight:500; color:#3f3f46; padding:16px 8px 4px;",
              )}
            >
              Sign in
            </a>
            */}
          </div>
        </div>
      )}
    </header>
  );
}
