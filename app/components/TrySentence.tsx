"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { parseStyle } from "../lib/css";
import GalleryVideo from "./GalleryVideo";
import { Hover } from "./Interactive";

type Item = {
  text: string;
  scene: string;
  label: string;
  cls: string;
  mob: number;
  anim: number;
  lines: number;
  mb: number;
  secs: number;
  dur: string;
};

const AUDIENCES: { name: string; tag: string; items: Item[] }[] = [
  {
    name: "For teaching",
    tag: "lecture-ready in minutes",
    items: [
      { text: "unroll sin(x) from the unit circle, slowly", scene: "sine", label: "Sine from the unit circle", cls: "SineFromCircle", mob: 7, anim: 4, lines: 64, mb: 3.1, secs: 34, dur: "0:12" },
      { text: "show why eigenvectors do not rotate", scene: "eigen", label: "Eigenvectors on their span", cls: "EigenSpan", mob: 11, anim: 6, lines: 96, mb: 4.8, secs: 51, dur: "0:20" },
      { text: "refine Riemann sums until the area lands", scene: "riemann", label: "Riemann sums refining", cls: "RiemannRefine", mob: 34, anim: 7, lines: 88, mb: 4.2, secs: 46, dur: "0:18" },
    ],
  },
  {
    name: "For video",
    tag: "broadcast-quality, no animator",
    items: [
      { text: "bend starlight around a black hole, edge on", scene: "blackhole", label: "Light bending around a black hole", cls: "LensedBlackHole", mob: 1480, anim: 7, lines: 164, mb: 8.2, secs: 137, dur: "0:20" },
      { text: "fall into the Mandelbrot set, scanline by scanline", scene: "mandel", label: "Mandelbrot render", cls: "MandelScan", mob: 9, anim: 3, lines: 118, mb: 5.6, secs: 71, dur: "0:16" },
      { text: "flock 200 birds, then send in a hawk", scene: "boids", label: "Flocking, then a hawk", cls: "BoidsHawk", mob: 201, anim: 4, lines: 143, mb: 6.4, secs: 88, dur: "0:20" },
    ],
  },
  {
    name: "For research",
    tag: "figures your paper is missing",
    items: [
      { text: "trace the Lorenz attractor in 3D", scene: "lorenz", label: "Lorenz attractor", cls: "LorenzTrace", mob: 6, anim: 3, lines: 79, mb: 4.4, secs: 49, dur: "0:18" },
      { text: "grow Turing patterns from reaction-diffusion", scene: "turing", label: "Gray-Scott patterns", cls: "GrayScott", mob: 4, anim: 2, lines: 126, mb: 5.9, secs: 96, dur: "0:18" },
      { text: "collide two galaxies and keep the tidal tails", scene: "galaxy", label: "Galaxy collision", cls: "GalaxyPass", mob: 1400, anim: 3, lines: 134, mb: 7.1, secs: 112, dur: "0:20" },
    ],
  },
  {
    name: "Just curious",
    tag: "one sentence, no setup",
    items: [
      { text: "grow a Barnsley fern with the chaos game", scene: "chaosgame", label: "Barnsley fern", cls: "ChaosFern", mob: 5, anim: 2, lines: 58, mb: 3.8, secs: 40, dur: "0:17" },
      { text: "walk e^(iθ) around the circle until it hits -1", scene: "euler", label: "Euler's identity", cls: "EulerWalk", mob: 10, anim: 5, lines: 72, mb: 3.5, secs: 37, dur: "0:14" },
      { text: "unfold a square into a cube into a tesseract", scene: "tesseract", label: "Square to tesseract", cls: "Tesseract", mob: 16, anim: 6, lines: 91, mb: 4.6, secs: 58, dur: "0:18" },
    ],
  },
];

const WALL: (Item & { short: string })[] = [
  { scene: "pendulum", short: "Chaos", text: "run two double pendulums 0.001 rad apart", label: "Double pendulum divergence", cls: "PendulumSplit", mob: 8, anim: 3, lines: 84, mb: 4.3, secs: 47, dur: "0:16" },
  { scene: "phyllo", short: "Bloom", text: "pack seeds at the golden angle", label: "Phyllotaxis bloom", cls: "GoldenBloom", mob: 430, anim: 2, lines: 61, mb: 3.6, secs: 39, dur: "0:14" },
  { scene: "waves", short: "Waves", text: "interfere two point sources in a ripple tank", label: "Two-source interference", cls: "RippleTank", mob: 3, anim: 4, lines: 77, mb: 4.1, secs: 43, dur: "0:14" },
  { scene: "montecarlo", short: "Monte Carlo", text: "estimate pi by throwing 4000 darts", label: "Monte Carlo pi", cls: "DartsPi", mob: 4002, anim: 3, lines: 66, mb: 3.9, secs: 41, dur: "0:16" },
  { scene: "koch", short: "Koch", text: "iterate a Koch snowflake five times", label: "Koch snowflake", cls: "KochFlake", mob: 6, anim: 5, lines: 54, mb: 3.3, secs: 35, dur: "0:15" },
  { scene: "hilbert", short: "Hilbert", text: "fill a square with a Hilbert curve", label: "Hilbert curve", cls: "HilbertFill", mob: 5, anim: 4, lines: 69, mb: 3.7, secs: 42, dur: "0:16" },
  { scene: "primes", short: "Primes", text: "spiral the integers and light up the primes", label: "Ulam spiral", cls: "UlamSpiral", mob: 529, anim: 3, lines: 74, mb: 4.5, secs: 53, dur: "0:22" },
  { scene: "modular", short: "Cardioid", text: "draw times-table chords from 2 up to 5", label: "Times-table chords", cls: "TimesChords", mob: 180, anim: 4, lines: 63, mb: 4.0, secs: 45, dur: "0:16" },
];

const START = AUDIENCES[1].items[0];
const LOG_AT = [0, 250, 510, 810, 1180, 1620];
const LOG_TOTAL = 1870;

type LogLine = { k: string; v: string; color: string };

function logFor(p: Item): LogLine[] {
  return [
    { k: "parse", v: "“" + p.text + "”", color: "#c7cbd8" },
    { k: "plan", v: "scene graph · " + p.mob + " mobjects · " + p.anim + " animations", color: "#c7cbd8" },
    { k: "write", v: p.cls + ".py · " + p.lines + " lines", color: "#c7cbd8" },
    { k: "render", v: "manim -qh " + p.cls + ".py " + p.cls, color: "#c7cbd8" },
    { k: "encode", v: "h.264 · 1080p60 · " + p.mb + " MB", color: "#c7cbd8" },
    { k: "done", v: p.dur + " · rendered in " + p.secs + "s", color: "#7fd79c" },
  ];
}

const metaOf = (p: Item) => p.dur + " · 1080p · MP4 · 60 fps";

export default function TrySentence() {
  const [aud, setAud] = useState(1);
  const [scene, setScene] = useState(START.scene);
  const [label, setLabel] = useState(START.label);
  const [meta, setMeta] = useState(metaOf(START));
  const [stageText, setStageText] = useState(START.text);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [log, setLog] = useState<LogLine[]>([]);
  const [blink, setBlink] = useState(true);

  const cur = useRef<Item>(START);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearRun = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (tick.current) clearInterval(tick.current);
  };

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const b = setInterval(() => setBlink((v) => !v), 530);
    return () => clearInterval(b);
  }, []);

  useEffect(() => clearRun, []);

  const render = (p: Item) => {
    const lines = logFor(p);
    setBusy(true);
    setPct(0);
    setLog([lines[0]]);
    timers.current.push(
      ...LOG_AT.map((ms, i) => setTimeout(() => setLog(lines.slice(0, i + 1)), ms)),
    );
    const t0 = Date.now();
    tick.current = setInterval(() => setPct(Math.min(1, (Date.now() - t0) / LOG_TOTAL)), 50);
    timers.current.push(
      setTimeout(() => {
        if (tick.current) clearInterval(tick.current);
        setBusy(false);
        setPct(1);
        setScene(p.scene);
        setLabel(p.label);
        setMeta(metaOf(p));
      }, LOG_TOTAL),
    );
  };

  const run = (p: Item) => {
    clearRun();
    cur.current = p;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setStageText(p.text);
      setTyping(false);
      render(p);
      return;
    }
    let at = 0;
    setStageText("");
    setTyping(true);
    setBusy(false);
    setLog([]);
    const step = () => {
      at += 1;
      setStageText(p.text.slice(0, at));
      if (at >= p.text.length) {
        setTyping(false);
        render(p);
        return;
      }
      timers.current.push(setTimeout(step, 16 + Math.random() * 22));
    };
    timers.current.push(setTimeout(step, 110));
  };

  const caret = typing ? (blink ? 1 : 0.25) : 0;

  return (
    <section style={parseStyle("background:#efece7; border-top:1px solid #e6e2da; border-bottom:1px solid #e6e2da;")}>
      <div
        className="hh-wrap"
        style={parseStyle("max-width:1200px; margin:0 auto; padding:clamp(47px,6.3vw,76px) clamp(18px,4vw,30px) clamp(50px,6.7vw,80px);")}
      >
        <div className="hh-secthead" style={parseStyle("display:grid; grid-template-columns:1fr auto; gap:28px; align-items:end; margin-bottom:36px;")}>
          <div style={parseStyle("max-width:620px;")}>
            <p style={parseStyle("margin:0 0 14px; font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:0.14em; text-transform:uppercase; color:#3b62e0;")}>
              <span style={parseStyle("color:#b3ad9e;")}>01</span> &nbsp;Try a sentence
            </p>
            <h2 style={parseStyle("margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(27px,4.9vw,38px); letter-spacing:-0.03em; line-height:1.08;")}>
              One sentence in. A finished scene out.
            </h2>
            <p style={parseStyle("margin:16px 0 0; font-size:15px; line-height:1.7; color:#6b6b73; max-width:520px; text-wrap:pretty;")}>
              Say who you are, pick a sentence, and watch Manition write the Manim and render it. Every scene below is
              drawn live on the spot, not a clip, and nothing was tidied up afterwards.
            </p>
          </div>
          <Link
            href="/gallery"
            style={parseStyle("display:inline-flex; align-items:center; gap:7px; text-decoration:none; font-size:14px; font-weight:600; color:#16161a; white-space:nowrap;")}
          >
            Browse the gallery
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M13 6l6 6-6 6"></path>
            </svg>
          </Link>
        </div>

        <div style={parseStyle("max-width:1060px; margin:0 auto; display:flex; flex-direction:column; gap:15px;")}>
          <div style={parseStyle("display:flex; flex-wrap:wrap; gap:12px; align-items:baseline; justify-content:space-between;")}>
            <div style={parseStyle("display:flex; flex-wrap:wrap; gap:7px;")}>
              {AUDIENCES.map((a, i) => {
                const on = i === aud;
                return (
                  <button
                    key={a.name}
                    onClick={() => setAud(i)}
                    style={parseStyle(
                      `appearance:none; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.07em; text-transform:uppercase; line-height:1.3; padding:9px 15px; border-radius:100px; background:${on ? "#16161a" : "#ffffff"}; border:1px solid ${on ? "#16161a" : "#e0dcd2"}; color:${on ? "#f7f6f3" : "#54545c"}; transition:background .18s, border-color .18s, color .18s;`,
                    )}
                  >
                    {a.name}
                  </button>
                );
              })}
            </div>
            <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#8b8779; white-space:nowrap;")}>
              {AUDIENCES[aud].tag}
            </span>
          </div>

          <div
            style={parseStyle(
              "background:#0d0d12; border:1px solid #23232c; border-radius:20px; padding:clamp(12px,1.7vw,18px); box-shadow:0 30px 70px -36px rgba(10,10,16,0.55);",
            )}
          >
            <div style={parseStyle("display:flex; align-items:center; justify-content:space-between; gap:12px; padding:2px 5px 12px;")}>
              <span style={parseStyle("display:inline-flex; align-items:center; gap:8px; font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:0.13em; text-transform:uppercase; color:#5b5f6e;")}>
                <span style={parseStyle("display:block; width:6px; height:6px; border-radius:50%; background:#3b62e0;")}></span>
                manition studio
              </span>
              <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:#5b5f6e; white-space:nowrap;")}>{meta}</span>
            </div>

            <div
              className="hh-prompt"
              style={parseStyle("display:flex; align-items:center; gap:12px; background:#15151b; border:1px solid #272730; border-radius:13px; padding:10px 10px 10px 16px;")}
            >
              <span style={parseStyle("flex:none; font-family:'IBM Plex Mono',monospace; font-size:12.5px; color:#3b62e0;")}>&gt;</span>
              <span
                className="hh-prompt-text"
                style={parseStyle("flex:1; min-width:0; font-family:'IBM Plex Mono',monospace; font-size:13.5px; color:#eceef4; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;")}
              >
                {stageText}
                <span style={{ color: "#3b62e0", opacity: caret }}>▌</span>
              </span>
              <Hover
                as="button"
                type="button"
                onClick={() => run(cur.current)}
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

            <div style={parseStyle("display:flex; flex-wrap:wrap; gap:8px; margin-top:10px;")}>
              {AUDIENCES[aud].items.map((p) => {
                const on = scene === p.scene;
                return (
                  <button
                    key={p.scene}
                    onClick={() => run(p)}
                    style={parseStyle(
                      `appearance:none; cursor:pointer; text-align:left; font-family:'IBM Plex Mono',monospace; font-size:11.5px; line-height:1.3; padding:9px 14px; border-radius:100px; background:${on ? "#22222c" : "#15151b"}; border:1px solid ${on ? "#3b62e0" : "#272730"}; color:${on ? "#eceef4" : "#969aa8"}; transition:background .18s, border-color .18s, color .18s;`,
                    )}
                  >
                    {p.text}
                  </button>
                );
              })}
            </div>

            <div style={parseStyle("position:relative; aspect-ratio:16/9; border-radius:14px; overflow:hidden; background:#0a0a0d; border:1px solid #1f1f26; margin-top:12px;")}>
              <GalleryVideo scene={scene} label={label} autoplay />
              {busy ? (
                <div
                  style={parseStyle(
                    "position:absolute; inset:0; display:flex; flex-direction:column; justify-content:flex-end; background:rgba(8,8,11,0.93); padding:clamp(14px,2.3vw,24px);",
                  )}
                >
                  <div style={parseStyle("display:flex; flex-direction:column; gap:5px;")}>
                    {log.map((l) => (
                      <div
                        key={l.k}
                        style={{
                          ...parseStyle("display:flex; gap:12px; font-family:'IBM Plex Mono',monospace; font-size:11.5px; line-height:1.5;"),
                          color: l.color,
                        }}
                      >
                        <span style={parseStyle("flex:none; width:50px; color:#4d5265;")}>{l.k}</span>
                        <span style={parseStyle("min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;")}>{l.v}</span>
                      </div>
                    ))}
                  </div>
                  <span style={parseStyle("display:block; margin-top:14px; height:3px; border-radius:2px; background:#1b1f2c; overflow:hidden;")}>
                    <span style={{ ...parseStyle("display:block; height:100%; background:#3b62e0;"), width: Math.round(pct * 100) + "%" }}></span>
                  </span>
                </div>
              ) : null}
            </div>

            <div style={parseStyle("display:flex; flex-wrap:wrap; align-items:baseline; justify-content:space-between; gap:10px; margin:16px 3px 9px;")}>
              <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:0.11em; text-transform:uppercase; color:#5b5f6e;")}>
                Hover to preview · click to render
              </span>
              <span style={parseStyle("font-size:12.5px; color:#787d8c;")}>
                Every scene ships with its{" "}
                <Link href="/features" style={parseStyle("color:#a8b5e4; font-weight:500;")}>
                  Manim source
                </Link>
                .
              </span>
            </div>

            <div style={parseStyle("display:grid; grid-template-columns:repeat(auto-fill,minmax(102px,1fr)); gap:8px;")}>
              {WALL.map((w) => (
                <button
                  key={w.scene}
                  onClick={() => run(w)}
                  style={parseStyle(
                    `appearance:none; padding:0; cursor:pointer; position:relative; aspect-ratio:16/9; border-radius:9px; overflow:hidden; background:#0a0a0d; border:1px solid ${scene === w.scene ? "#3b62e0" : "#23232c"}; transition:border-color .18s;`,
                  )}
                >
                  <GalleryVideo scene={w.scene} label={w.short} mini />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
