"use client";

import { useState } from "react";
import { parseStyle } from "../lib/css";

type Persona = {
  name: string;
  tag: string;
  accent: string;
  bg: string;
  desc: string;
  prompt: string;
  points: string[];
};

const PERSONAS: Persona[] = [
  {
    name: "Educators",
    tag: "Lecture-ready in minutes",
    accent: "#7f97e8",
    bg: "#1c2233",
    desc: "Turn the hard-to-picture moment of a lesson into a 15-second animation. Drop it into slides, replay it on the board, and build a bank of visuals your whole department reuses.",
    prompt: "show the unit circle generating sin(x), slowly",
    points: [
      "Finished clips drop straight into slides and LMS pages",
      "A reusable visual bank for every unit you teach",
      "Answer “but why?” with motion instead of arrows",
    ],
  },
  {
    name: "Creators",
    tag: "Broadcast-quality, no animator",
    accent: "#e0b45f",
    bg: "#2b2415",
    desc: "Ship the polished visuals your channel deserves - without learning Python or hiring out. Prototype fast, keep a consistent style, render only the ideas that land.",
    prompt: "a Fourier series building a square wave, 4K",
    points: [
      "Transparent 4K exports drop into any edit",
      "Prototype ten ideas an hour, render the keepers",
      "A consistent mathematical look across episodes",
    ],
  },
  {
    name: "Students & devs",
    tag: "Understand it by watching it",
    accent: "#7fd79c",
    bg: "#16281d",
    desc: "See the concept move before the exam - or generate the exact figure your paper, README or conference talk is missing, in one sentence.",
    prompt: "rotate a vector under a 2×2 matrix transform",
    points: [
      "Watch eigenvectors, limits and proofs actually move",
      "Figures for papers, READMEs and talks in minutes",
      "Export the Manim source and keep hacking",
    ],
  },
];

export default function UseCases() {
  const [sel, setSel] = useState(0);
  const cur = PERSONAS[sel];

  return (
    <section style={parseStyle("background:#111114; color:#e8e8ea;")}>
      <div style={parseStyle("max-width:1200px; margin:0 auto; padding:82px 30px;")}>
        <div style={parseStyle("max-width:600px; margin-bottom:46px;")}>
          <p style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#7f97e8; margin:0 0 14px;")}>
            Who it&apos;s for
          </p>
          <h2 style={parseStyle("margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:38px; letter-spacing:-0.03em; line-height:1.08; color:#f7f6f3;")}>
            One tool, every kind of explainer.
          </h2>
        </div>
        <div className="hh-who" style={parseStyle("display:grid; grid-template-columns:0.95fr 1.05fr; gap:56px; align-items:start;")}>
          <div style={parseStyle("display:flex; flex-direction:column;")}>
            {PERSONAS.map((p, i) => {
              const on = i === sel;
              return (
                <button
                  key={p.name}
                  onClick={() => setSel(i)}
                  style={parseStyle("appearance:none; background:none; border:0; border-top:1px solid #26262c; text-align:left; width:100%; padding:24px 6px; cursor:pointer; display:flex; align-items:center; gap:18px; transition:opacity .15s;")}
                >
                  <span style={parseStyle(`font-family:'IBM Plex Mono',monospace; font-size:12px; width:26px; flex:none; color:${on ? p.accent : "#3a3a42"}; transition:color .2s;`)}>
                    {"0" + (i + 1)}
                  </span>
                  <span style={parseStyle(`font-family:'Space Grotesk'; font-weight:700; font-size:31px; letter-spacing:-0.02em; line-height:1.1; color:${on ? "#f7f6f3" : "#55555d"}; transition:color .2s;`)}>
                    {p.name}
                  </span>
                  <span style={parseStyle(`margin-left:auto; flex:none; display:flex; opacity:${on ? 1 : 0}; transition:opacity .2s; color:#7f97e8;`)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M13 6l6 6-6 6"></path></svg>
                  </span>
                </button>
              );
            })}
            <div style={parseStyle("border-top:1px solid #26262c; padding:20px 6px 0; font-size:13px; color:#5b5b63; line-height:1.6;")}>
              Same engine underneath - pick a lane or wander between them.
            </div>
          </div>
          <div style={parseStyle("background:#17171c; border:1px solid #26262c; border-radius:18px; padding:28px 30px 30px; min-height:300px; box-sizing:border-box;")}>
            <span style={parseStyle(`display:inline-flex; font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:0.08em; text-transform:uppercase; color:${cur.accent}; background:${cur.bg}; border-radius:100px; padding:5px 11px; margin-bottom:16px;`)}>
              {cur.tag}
            </span>
            <p style={parseStyle("margin:0 0 22px; font-size:15.5px; line-height:1.65; color:#c8c8cc;")}>{cur.desc}</p>
            <div style={parseStyle("display:flex; align-items:center; gap:10px; background:#0f1117; border:1px solid #26262c; border-radius:12px; padding:12px 14px; margin-bottom:22px;")}>
              <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:#5b5b63; flex:none;")}>Try</span>
              <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12.5px; color:#e8e8ea; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;")}>{cur.prompt}</span>
              <span style={parseStyle("flex:none; margin-left:auto; width:26px; height:26px; border-radius:8px; background:#3b62e0; display:flex; align-items:center; justify-content:center;")}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"></path><path d="M6 11l6-6 6 6"></path></svg>
              </span>
            </div>
            <div style={parseStyle("display:flex; flex-direction:column; gap:11px;")}>
              {cur.points.map((pt, i) => (
                <div key={i} style={parseStyle("display:flex; align-items:flex-start; gap:10px; font-size:14px; line-height:1.55; color:#a1a1aa;")}>
                  <span style={parseStyle(`flex:none; margin-top:6px; width:5px; height:5px; border-radius:50%; background:${cur.accent};`)}></span>
                  {pt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
