"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { parseStyle } from "../lib/css";
import GalleryVideo from "./GalleryVideo";
import { Hover } from "./Interactive";

const DEMOS = [
  {
    text: "build a square wave out of spinning circles",
    meta: "0:16 · 1080p · MP4 · 60 fps",
    scene: "fourier",
    label: "Square wave from circles",
  },
  {
    text: "show why eigenvectors do not rotate",
    meta: "0:20 · 1080p · MP4 · 60 fps",
    scene: "eigen",
    label: "Eigenvectors on their span",
  },
  {
    text: "trace the Lorenz attractor in 3D",
    meta: "0:18 · 1080p · MP4 · 60 fps",
    scene: "lorenz",
    label: "Lorenz attractor",
  },
  {
    text: "grow a Barnsley fern with the chaos game",
    meta: "0:17 · 1080p · MP4 · 60 fps",
    scene: "chaosgame",
    label: "Barnsley fern",
  },
];

const RENDER_MS = 820;

export default function TrySentence() {
  const [demo, setDemo] = useState(0);
  const [pending, setPending] = useState(0);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const timers = useRef<{ tick?: ReturnType<typeof setInterval>; done?: ReturnType<typeof setTimeout> }>({});

  useEffect(
    () => () => {
      clearInterval(timers.current.tick);
      clearTimeout(timers.current.done);
    },
    [],
  );

  const run = (i: number) => {
    if (busy) return;
    clearInterval(timers.current.tick);
    clearTimeout(timers.current.done);
    const t0 = Date.now();
    setBusy(true);
    setPending(i);
    setPct(0);
    timers.current.tick = setInterval(() => setPct(Math.min(1, (Date.now() - t0) / RENDER_MS)), 55);
    timers.current.done = setTimeout(() => {
      clearInterval(timers.current.tick);
      setDemo(i);
      setBusy(false);
      setPct(1);
    }, RENDER_MS);
  };

  const shown = busy ? pending : demo;

  return (
    <section style={parseStyle("background:#efece7; border-top:1px solid #e6e2da; border-bottom:1px solid #e6e2da;")}>
      <div
        className="hh-wrap"
        style={parseStyle("max-width:1200px; margin:0 auto; padding:clamp(47px,6.3vw,76px) clamp(18px,4vw,30px) clamp(50px,6.7vw,80px);")}
      >
        <div className="hh-secthead" style={parseStyle("display:grid; grid-template-columns:1fr auto; gap:28px; align-items:end; margin-bottom:36px;")}>
          <div style={parseStyle("max-width:620px;")}>
            <p style={parseStyle(sectionEyebrow)}>
              <span style={parseStyle("color:#b3ad9e;")}>01</span> &nbsp;Try a sentence
            </p>
            <h2
              style={parseStyle(
                "margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(27px,4.9vw,38px); letter-spacing:-0.03em; line-height:1.08;",
              )}
            >
              Writing the sentence is the whole job.
            </h2>
            <p style={parseStyle("margin:16px 0 0; font-size:15px; line-height:1.7; color:#6b6b73; max-width:520px; text-wrap:pretty;")}>
              Pick a prompt below and watch it render. These are live scenes drawn on the spot, not clips, and nothing was
              tidied up afterwards.
            </p>
          </div>
          <Link
            href="/gallery"
            style={parseStyle(
              "display:inline-flex; align-items:center; gap:7px; text-decoration:none; font-size:14px; font-weight:600; color:#16161a; white-space:nowrap;",
            )}
          >
            Browse the gallery
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M13 6l6 6-6 6"></path>
            </svg>
          </Link>
        </div>

        <div style={parseStyle("max-width:880px; margin:0 auto; display:flex; flex-direction:column; gap:13px;")}>
          <div
            className="hh-prompt"
            style={parseStyle(
              "display:flex; align-items:center; gap:12px; background:#fff; border:1px solid #e0dcd2; border-radius:14px; padding:11px 11px 11px 18px; box-shadow:0 1px 2px rgba(24,24,27,0.04);",
            )}
          >
            <span style={parseStyle("flex:none; font-family:'IBM Plex Mono',monospace; font-size:12.5px; color:#3b62e0;")}>&gt;</span>
            <span
              className="hh-prompt-text"
              style={parseStyle(
                "flex:1; min-width:0; font-family:'IBM Plex Mono',monospace; font-size:13.5px; color:#2a2a30; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;",
              )}
            >
              {DEMOS[shown].text}
            </span>
            <Hover
              as="button"
              type="button"
              onClick={() => run(demo)}
              style="flex:none; appearance:none; cursor:pointer; display:inline-flex; align-items:center; gap:7px; background:#3b62e0; color:#fff; border:0; border-radius:10px; font-family:inherit; font-size:13px; font-weight:600; padding:10px 16px; transition:background .15s;"
              hoverStyle={{ background: "#2f4fc0" }}
            >
              Animate
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M13 6l6 6-6 6"></path>
              </svg>
            </Hover>
          </div>

          <div style={parseStyle("display:flex; flex-wrap:wrap; gap:8px;")}>
            {DEMOS.map((d, i) => {
              const on = i === shown;
              return (
                <button
                  key={d.scene}
                  onClick={() => run(i)}
                  style={parseStyle(
                    `appearance:none; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11.5px; line-height:1.3; padding:9px 14px; border-radius:100px; background:${on ? "#16161a" : "#ffffff"}; border:1px solid ${on ? "#16161a" : "#e0dcd2"}; color:${on ? "#f7f6f3" : "#54545c"}; transition:background .18s, border-color .18s, color .18s;`,
                  )}
                >
                  {d.text}
                </button>
              );
            })}
          </div>

          <div
            style={parseStyle(
              "position:relative; aspect-ratio:16/9; border-radius:16px; overflow:hidden; background:#0a0a0d; border:1px solid #1f1f26; margin-top:5px;",
            )}
          >
            {busy ? (
              <div
                style={parseStyle(
                  "position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:15px; background:#0a0a0d;",
                )}
              >
                <span
                  style={parseStyle(
                    "font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:#6d7385;",
                  )}
                >
                  rendering · manim · 1080p
                </span>
                <span style={parseStyle("display:block; width:190px; height:3px; border-radius:2px; background:#1c2030; overflow:hidden;")}>
                  <span style={{ ...parseStyle("display:block; height:100%; background:#3b62e0;"), width: Math.round(pct * 100) + "%" }}></span>
                </span>
              </div>
            ) : (
              <GalleryVideo key={DEMOS[demo].scene} scene={DEMOS[demo].scene} label={DEMOS[demo].label} />
            )}
          </div>

          <div style={parseStyle("display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; padding:2px 2px 0;")}>
            <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8b8779;")}>{DEMOS[demo].meta}</span>
            <span style={parseStyle("font-size:13px; color:#6b6b73;")}>
              Every scene ships with its{" "}
              <Link href="/features" style={parseStyle("font-weight:500;")}>
                Manim source
              </Link>
              .
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

const sectionEyebrow =
  "margin:0 0 14px; font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:0.14em; text-transform:uppercase; color:#3b62e0;";
