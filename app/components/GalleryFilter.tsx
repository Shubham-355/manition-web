"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { parseStyle } from "../lib/css";
import GalleryVideo from "./GalleryVideo";
import { Hover } from "./Interactive";

export type GalleryCard = {
  scene: string;
  label: string;
  title: string;
  prompt: string;
};

const ALL = "All";

// Preferred order of the design's pill row. Categories are still derived from
// the cards themselves, so a label that isn't listed here still gets a pill
// (appended at the end) and a pill is never rendered for an empty category.
const PREFERRED_ORDER = [
  "Calculus",
  "Linear algebra",
  "Trigonometry",
  "Geometry",
  "Probability",
  "Chaos",
  "Physics",
  "Number theory",
  "Fractals",
];

// Labels are compared loosely so that stray case/whitespace in the card data
// can never make a card unreachable from its own pill.
const norm = (s: string) => s.trim().toLowerCase();

const pillActive =
  "font-size:13px; font-weight:600; color:#f7f6f3; background:#16161a; border:1px solid #16161a; padding:8px 15px; border-radius:100px;";
const pillBase =
  "font-size:13px; font-weight:500; color:#4b4b52; background:#fff; border:1px solid #e6e2da; padding:8px 15px; border-radius:100px;";

const srOnly = parseStyle(
  "position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; border:0;",
);

export default function GalleryFilter({ cards }: { cards: GalleryCard[] }) {
  const [active, setActive] = useState(ALL);
  const [hovered, setHovered] = useState<string | null>(null);

  const categories = useMemo(() => {
    // Keep the first spelling of each label as authored, keyed by its
    // normalised form.
    const seen = new Map<string, string>();
    for (const card of cards) {
      const label = card.label?.trim();
      if (!label) continue;
      if (!seen.has(norm(label))) seen.set(norm(label), label);
    }
    const ordered: string[] = [];
    for (const pref of PREFERRED_ORDER) {
      const hit = seen.get(norm(pref));
      if (hit) {
        ordered.push(hit);
        seen.delete(norm(pref));
      }
    }
    // Anything the card data has but PREFERRED_ORDER doesn't.
    for (const rest of seen.values()) ordered.push(rest);
    return [ALL, ...ordered];
  }, [cards]);

  // Read the filter out of the URL on mount (and on browser back/forward) so a
  // filtered gallery survives a refresh and can be linked to. Done in an effect
  // rather than during render to keep the server and client markup identical.
  useEffect(() => {
    const fromUrl = () => {
      const q = new URLSearchParams(window.location.search).get("category");
      const match = q ? categories.find((c) => norm(c) === norm(q)) : null;
      setActive(match ?? ALL);
    };
    fromUrl();
    window.addEventListener("popstate", fromUrl);
    return () => window.removeEventListener("popstate", fromUrl);
  }, [categories]);

  const select = useCallback((cat: string) => {
    setActive(cat);
    const url = new URL(window.location.href);
    if (cat === ALL) url.searchParams.delete("category");
    else url.searchParams.set("category", cat);
    window.history.replaceState(null, "", url);
  }, []);

  const matches = useCallback(
    (card: GalleryCard) =>
      active === ALL || norm(card.label ?? "") === norm(active),
    [active],
  );

  const count = cards.filter(matches).length;

  return (
    <>
      <div
        role="group"
        aria-label="Filter scenes by topic"
        style={parseStyle("display:flex; flex-wrap:wrap; gap:9px; margin-top:30px;")}
      >
        {categories.map((cat) => {
          const on = norm(cat) === norm(active);
          return (
            <button
              key={cat}
              type="button"
              aria-pressed={on}
              onClick={() => select(cat)}
              onMouseEnter={() => setHovered(cat)}
              onMouseLeave={() => setHovered(null)}
              style={{
                ...parseStyle(on ? pillActive : pillBase),
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "background .14s, border-color .14s, color .14s",
                ...(!on && hovered === cat
                  ? { borderColor: "#d0ccc2", color: "#16161a" }
                  : {}),
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" style={srOnly}>
        {count} {count === 1 ? "scene" : "scenes"}
        {active === ALL ? "" : " in " + active}
      </p>

      <div style={parseStyle("padding:42px 0 0;")}>
        {/* Every card stays mounted and non-matching ones are hidden, so the
            canvas players keep their frame / playhead across filter changes
            instead of tearing down and re-initialising. Hidden players stop
            themselves through their own intersection observer. */}
        <div className="gl-grid" style={parseStyle("display:grid; grid-template-columns:repeat(3,1fr); gap:18px;")}>
          {cards.map((card) => {
            const shown = matches(card);
            return (
              <div
                key={card.scene}
                className="gl-card"
                style={shown ? undefined : { display: "none" }}
                aria-hidden={shown ? undefined : true}
              >
                <div style={parseStyle("position:relative; aspect-ratio:16/10; background:#0a0a0d;")}>
                  <GalleryVideo scene={card.scene} label={card.label} />
                </div>
                <div style={parseStyle("padding:15px 17px 16px;")}>
                  <p style={parseStyle("margin:0 0 7px; font-family:'Space Grotesk'; font-weight:600; font-size:15.5px; color:#f4f4f5; letter-spacing:-0.01em;")}>
                    {card.title}
                  </p>
                  <p style={parseStyle("margin:0; font-size:12.5px; line-height:1.5; color:#8a8a92; font-style:italic;")}>
                    {card.prompt}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {count === 0 ? (
          <p style={parseStyle("margin:0; text-align:center; font-size:15px; color:#54545c;")}>
            No scenes in {active} yet.{" "}
            <button
              type="button"
              onClick={() => select(ALL)}
              style={parseStyle("background:none; border:0; padding:0; font:inherit; color:#3b62e0; cursor:pointer; text-decoration:underline;")}
            >
              Show all scenes
            </button>
          </p>
        ) : null}

        <div style={parseStyle("text-align:center; margin-top:44px;")}>
          <Hover
            as="a"
            href="/#waitlist"
            style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; background:#16161a; color:#f7f6f3; font-size:15px; font-weight:600; padding:14px 24px; border-radius:12px;"
            hoverStyle={{ background: "#000" }}
          >
            Make your own{" "}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M13 6l6 6-6 6"></path>
            </svg>
          </Hover>
        </div>
      </div>
    </>
  );
}
