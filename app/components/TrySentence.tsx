"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { parseStyle } from "../lib/css";
import GalleryVideo from "./GalleryVideo";

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

const WALL: (Item & { short: string })[] = [
  { scene: "stickhole", short: "Explainer", text: "explain black holes with a stick figure, and make it funny", label: "How not to fall into a black hole", cls: "StickFigureBlackHole", mob: 126, anim: 38, lines: 402, mb: 22.6, secs: 402, dur: "2:07" },
  { scene: "tree", short: "Seasons", text: "grow a tree from one seed and run it through four seasons", label: "A year in one tree", cls: "SeasonTree", mob: 340, anim: 7, lines: 176, mb: 10.2, secs: 198, dur: "0:34" },
  { scene: "aurora", short: "Aurora", text: "put the aurora over a frozen lake and let it drift", label: "Aurora over a frozen lake", cls: "AuroraCurtains", mob: 146, anim: 6, lines: 158, mb: 9.4, secs: 174, dur: "0:30" },
  { scene: "nebula", short: "Nebula", text: "grow an emission nebula out of the dark and light it up", label: "Nebula, condensing", cls: "NebulaGrow", mob: 4000, anim: 4, lines: 121, mb: 7.8, secs: 104, dur: "0:16" },
  { scene: "blackhole", short: "Black hole", text: "bend starlight around a black hole, edge on", label: "Light bending around a black hole", cls: "LensedBlackHole", mob: 1480, anim: 7, lines: 164, mb: 8.2, secs: 137, dur: "0:20" },
  { scene: "curl", short: "Dye", text: "pour dye into a swirling field and let it draw", label: "Dye in a curl field", cls: "CurlDye", mob: 150, anim: 3, lines: 104, mb: 6.1, secs: 83, dur: "0:16" },
  { scene: "dejong", short: "Attractor", text: "morph a de Jong attractor through its parameters", label: "de Jong attractor", cls: "DeJongMorph", mob: 60000, anim: 3, lines: 88, mb: 6.9, secs: 92, dur: "0:18" },
  { scene: "galaxy", short: "Galaxies", text: "collide two galaxies and keep the tidal tails", label: "Galaxy collision", cls: "GalaxyPass", mob: 1400, anim: 3, lines: 134, mb: 7.1, secs: 112, dur: "0:20" },
  { scene: "turing", short: "Turing", text: "grow Turing patterns from reaction-diffusion", label: "Gray-Scott patterns", cls: "GrayScott", mob: 4, anim: 2, lines: 126, mb: 5.9, secs: 96, dur: "0:18" },
  { scene: "phyllo", short: "Bloom", text: "pack seeds at the golden angle", label: "Phyllotaxis bloom", cls: "GoldenBloom", mob: 430, anim: 2, lines: 61, mb: 3.6, secs: 39, dur: "0:14" },
];

// The scene the panel opens on.
const START = WALL[0];

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

// The design types the sentence out character by character before rendering.
// This layout dropped the prompt bar, so only the delay is still observable;
// it is summed once here rather than run as one timer per character.
function typeDelay(text: string) {
  let ms = 110;
  for (let i = 1; i < text.length; i++) ms += 16 + Math.random() * 22;
  return ms;
}

type Ctl = {
  timers: ReturnType<typeof setTimeout>[];
  tick: ReturnType<typeof setInterval> | null;
  setBusy: (v: boolean) => void;
  setPct: (v: number) => void;
  setLog: (v: LogLine[]) => void;
  setScene: (v: string) => void;
  setLabel: (v: string) => void;
};

function clearRun(c: Ctl) {
  c.timers.forEach(clearTimeout);
  c.timers = [];
  if (c.tick) clearInterval(c.tick);
}

function render(c: Ctl, p: Item) {
  const lines = logFor(p);
  c.setBusy(true);
  c.setPct(0);
  c.setLog([lines[0]]);
  c.timers.push(...LOG_AT.map((ms, i) => setTimeout(() => c.setLog(lines.slice(0, i + 1)), ms)));
  const t0 = Date.now();
  c.tick = setInterval(() => c.setPct(Math.min(1, (Date.now() - t0) / LOG_TOTAL)), 50);
  c.timers.push(
    setTimeout(() => {
      if (c.tick) clearInterval(c.tick);
      c.setBusy(false);
      c.setPct(1);
      c.setScene(p.scene);
      c.setLabel(p.label);
    }, LOG_TOTAL),
  );
}

function run(c: Ctl, p: Item) {
  clearRun(c);
  c.setBusy(false);
  c.setLog([]);
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    render(c, p);
    return;
  }
  c.timers.push(setTimeout(() => render(c, p), typeDelay(p.text)));
}

export default function TrySentence() {
  const [scene, setScene] = useState(START.scene);
  const [label, setLabel] = useState(START.label);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [log, setLog] = useState<LogLine[]>([]);

  const ctl = useRef<Ctl>({
    timers: [],
    tick: null,
    setBusy,
    setPct,
    setLog,
    setScene,
    setLabel,
  });
  const cur = useRef<Item>(START);

  useEffect(() => {
    const c = ctl.current;
    return () => clearRun(c);
  }, []);

  const pick = (p: Item) => {
    cur.current = p;
    run(ctl.current, p);
  };

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
              Watch Manition write the Manim and render it. Every scene below is drawn live on the spot, not a clip, and
              nothing was tidied up afterwards.
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
          <div
            style={parseStyle(
              "background:#0d0d12; border:1px solid #23232c; border-radius:20px; padding:clamp(12px,1.7vw,18px); box-shadow:0 30px 70px -36px rgba(10,10,16,0.55);",
            )}
          >
            <div style={parseStyle("position:relative; aspect-ratio:16/9; border-radius:14px; overflow:hidden; background:#0a0a0d; border:1px solid #1f1f26;")}>
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

            <div style={parseStyle("margin:16px 0 9px;")}></div>

            <div className="hh-thumbs" style={parseStyle("display:grid; grid-template-columns:repeat(auto-fill,minmax(102px,1fr)); gap:8px;")}>
              {WALL.map((w) => (
                <button
                  key={w.scene}
                  onClick={() => pick(w)}
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
