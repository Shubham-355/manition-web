"use client";

import { useState } from "react";
import { parseStyle } from "../lib/css";
import GalleryVideo from "./GalleryVideo";
import { Hover } from "./Interactive";

export type GalleryCard = {
  scene: string;
  label: string;
  title: string;
  prompt: string;
};

// Category order matches the design's pill row. "All" shows everything.
const CATEGORIES = [
  "All",
  "Calculus",
  "Linear algebra",
  "Trigonometry",
  "Geometry",
  "Probability",
  "Chaos",
  "Physics",
];

const pillActive =
  "font-size:13px; font-weight:600; color:#f7f6f3; background:#16161a; border:1px solid #16161a; padding:8px 15px; border-radius:100px;";
const pillBase =
  "font-size:13px; font-weight:500; color:#4b4b52; background:#fff; border:1px solid #e6e2da; padding:8px 15px; border-radius:100px;";

export default function GalleryFilter({ cards }: { cards: GalleryCard[] }) {
  const [active, setActive] = useState("All");
  const [hovered, setHovered] = useState<string | null>(null);

  const shown =
    active === "All" ? cards : cards.filter((c) => c.label === active);

  return (
    <>
      <div style={parseStyle("display:flex; flex-wrap:wrap; gap:9px; margin-top:30px;")}>
        {CATEGORIES.map((cat) => {
          const on = cat === active;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
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

      <div style={parseStyle("padding:42px 0 0;")}>
        <div className="gl-grid" style={parseStyle("display:grid; grid-template-columns:repeat(3,1fr); gap:18px;")}>
          {shown.map((card) => (
            <div key={card.scene} className="gl-card">
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
          ))}
        </div>

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
