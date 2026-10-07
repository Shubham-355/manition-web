"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseStyle as css } from "../lib/css";
import NightShell from "../components/night/NightShell";
import { CARD, EYEBROW, GridBg, Ground, JoinCta, Stars } from "../components/night/parts";

const poster = (s: string) => `/scenes/${s}.jpg`;

const STEPS = [
  { label: "Describe", title: "Say it in plain language.", desc: "No syntax to memorize, no timeline to scrub. Describe the concept the way you'd explain it out loud, and Manition maps it to the right geometry, motion and pacing.", points: ["Follow-ups understood in context", "Works for geometry, calculus, algebra & more", "Suggests refinements when a prompt is vague"] },
  { label: "Generate", title: "Real Manim, never a black box.", desc: "Under the hood, every scene is genuine Manim - the open-source Python library for programmatic math animation. Open any scene in the built-in code editor, change a constant, and re-render in place.", points: ["Full source for every render", "Built-in editor - tweak the code and re-render, no re-prompting", "Export .py to keep or version-control"] },
  { label: "Render", title: "Cloud GPUs do the heavy lifting.", desc: "No local install, no Python environment, no waiting on your laptop's fans. Scenes render on our GPUs and stream a live preview while they work.", points: ["1080p and 4K output", "Transparent backgrounds for overlays", "Runs the same on a phone or a Chromebook"] },
  { label: "Watch & keep", title: "Preview, refine, and build a library.", desc: "Watch instantly, ask for changes in chat, then download the MP4. Every scene you make is saved, searchable and ready to re-render.", points: ["One-click MP4 download", "Searchable personal library", "Re-render any past scene at higher quality"] },
];

const TAB_ICONS = [
  <svg key="0" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 18 C 6 10, 10 4, 17 2 C 15 8, 11 13, 5 18Z" fill="#EDEAE3" /><path d="M5 18 L 13 7" stroke="#8C8A85" strokeWidth="1" /></svg>,
  <svg key="1" width="20" height="20" viewBox="0 0 20 20" fill="none"><ellipse cx="10" cy="12" rx="6" ry="5" fill="#c99a52" /><path d="M10 7 L10 2 M10 7 L6 3 M10 17 L4 19 M10 17 L16 19" stroke="#FF5B1F" strokeWidth="1.4" strokeDasharray="2 1.5" /></svg>,
  <svg key="2" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="9" width="10" height="7" fill="#c99a52" /><circle cx="5" cy="6" r="3" fill="#2a2230" stroke="#c99a52" /><circle cx="10" cy="6" r="3" fill="#2a2230" stroke="#c99a52" /><path d="M12 12 L19 9 L19 16 Z" fill="#FFD9A0" opacity=".8" /></svg>,
  <svg key="3" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="11" height="16" fill="#2a2230" stroke="#c99a52" /><path d="M5 4h1M5 8h1M5 12h1M5 16h1M11 4h1M11 8h1M11 12h1M11 16h1" stroke="#EDEAE3" /><path d="M14 13 C 19 13, 19 18, 16 18" stroke="#c99a52" strokeWidth="1.5" /></svg>,
];

const CAPS = [
  { num: "01", name: "Functions & graphs", desc: "Plots, transformations, asymptotes and animated parameters.", ex: "“plot 1/x and zoom into the asymptote”", sc: "limit" },
  { num: "02", name: "Calculus", desc: "Riemann sums, derivatives as slopes, limits and areas.", ex: "“show a Riemann sum converging as n grows”", sc: "riemann" },
  { num: "03", name: "Linear algebra", desc: "Vectors, matrix transforms, eigenvectors and spans.", ex: "“apply a shear matrix to the unit grid”", sc: "matrix" },
  { num: "04", name: "Geometry", desc: "Constructions, proofs, transformations and tilings.", ex: "“inscribe a hexagon and unroll its perimeter”", sc: "pyth" },
  { num: "05", name: "Trigonometry", desc: "Unit circle, wave build-ups, phase and amplitude.", ex: "“trace sin(x) out of the unit circle”", sc: "sine" },
  { num: "06", name: "Probability", desc: "Distributions, sampling, and the law of large numbers.", ex: "“drop 500 balls through a Galton board”", sc: "bell" },
];

const CAP_ICONS = [
  <svg key="0" width="32" height="32" viewBox="0 0 32 32"><rect x="3" y="5" width="26" height="20" rx="2" fill="#2a2d2f" stroke="#8a6a3e" strokeWidth="2" /><path d="M7 21 Q 12 8 16 14 T 26 9" stroke="#FF5B1F" strokeWidth="1.8" fill="none" /><path d="M10 27 L8 31 M22 27 L24 31" stroke="#8a6a3e" strokeWidth="2" /></svg>,
  <svg key="1" width="32" height="32" viewBox="0 0 32 32"><rect x="3" y="20" width="6" height="8" fill="#d8cfbe" /><rect x="10" y="15" width="6" height="13" fill="#c9bfae" /><rect x="17" y="10" width="6" height="18" fill="#b8ae9c" /><rect x="24" y="5" width="6" height="23" fill="#FF5B1F" /></svg>,
  <svg key="2" width="32" height="32" viewBox="0 0 32 32"><path d="M4 26 L12 6 L28 6 L20 26 Z" fill="#d8cfbe" /><path d="M8 16 H24 M10 11 H26 M6 21 H22 M16 6 L8 26 M22 6 L14 26" stroke="#8C8A85" strokeWidth="1" /><path d="M4 26 L20 26" stroke="#FF5B1F" strokeWidth="2" /></svg>,
  <svg key="3" width="32" height="32" viewBox="0 0 32 32"><path d="M16 3 L27 9.5 L27 22.5 L16 29 L5 22.5 L5 9.5 Z" fill="#c9bfae" stroke="#8a6a3e" strokeWidth="1.5" /><path d="M16 3 L16 16 L27 22.5 M16 16 L5 22.5" stroke="#8a7d6c" strokeWidth="1" /><circle cx="16" cy="16" r="2" fill="#FF5B1F" /></svg>,
  <svg key="4" width="32" height="32" viewBox="0 0 32 32"><circle cx="13" cy="16" r="10" fill="none" stroke="#c99a52" strokeWidth="2" /><path d="M13 16 L20 9" stroke="#EDEAE3" strokeWidth="1.6" /><path d="M20 9 Q 25 4 30 12" stroke="#FF5B1F" strokeWidth="1.8" fill="none" /></svg>,
  <svg key="5" width="32" height="32" viewBox="0 0 32 32"><g fill="#c99a52"><circle cx="16" cy="6" r="2" /><circle cx="11" cy="12" r="2" /><circle cx="21" cy="12" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="16" cy="18" r="2" /><circle cx="26" cy="18" r="2" /></g><circle cx="16" cy="25" r="3" fill="#FF5B1F" /></svg>,
];

const MONO = "font-family:'Geist Mono',monospace;";
const HL = "color:#0A0A0B; background:#FF5B1F; border-radius:3px; padding:0 3px;";

/** The four-step tabbed card. Holds its own fast ticker so the rest of the page doesn't re-render with it. */
function Pipeline({ step, setStep, setHovTab }: { step: number; setStep: (i: number) => void; setHovTab: (i: number | null) => void }) {
  const [fill, setFill] = useState(false);
  const [paused, setPaused] = useState(false);
  const [typed, setTyped] = useState(0);
  const [fr, setFr] = useState(0);
  const stepRef = useRef(step);
  const pausedRef = useRef(false);

  const go = useCallback(
    (i: number) => {
      stepRef.current = i;
      setStep(i);
      setFill(false);
      setTyped(0);
    },
    [setStep],
  );

  /* the progress line under the active tab fills over six seconds, then the next step takes over */
  useEffect(() => {
    if (fill) return;
    const t = setTimeout(() => setFill(true), 60);
    return () => clearTimeout(t);
  }, [fill, step]);

  useEffect(() => {
    const auto = setInterval(() => {
      if (!pausedRef.current) go((stepRef.current + 1) % 4);
    }, 6000);
    const tk = setInterval(() => {
      setTyped((n) => n + 1);
      setFr((f) => (f + 9) % 720);
    }, 120);
    return () => {
      clearInterval(auto);
      clearInterval(tk);
    };
  }, [go]);

  const cur = STEPS[step];
  const kval = ["4", "6", "8"][Math.floor(typed / 12) % 3];
  const on = (n: number) => (typed > n * 2 ? 1 : 0);
  const line = (n: number) => css(`opacity:${on(n)}; transition:opacity .2s;`);

  return (
    <div style={css(`${CARD} border-radius:24px; overflow:hidden; box-shadow:inset 0 1px 0 rgba(237,234,227,.07), 0 50px 70px -50px rgba(0,0,0,.95), 0 14px 28px -18px rgba(0,0,0,.7);`)}>
      <div role="tablist" aria-label="Pipeline steps" style={css("display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); border-bottom:1px solid rgba(237,234,227,.08);")}>
        {STEPS.map((x, n) => {
          const sel = n === step;
          return (
            <button
              key={x.label}
              role="tab"
              aria-selected={sel}
              className="ft-tab"
              onClick={() => {
                pausedRef.current = true;
                setPaused(true);
                go(n);
              }}
              onMouseEnter={() => setHovTab(n)}
              onMouseLeave={() => setHovTab(null)}
              style={css("appearance:none; background:none; border:0; border-right:1px solid rgba(237,234,227,.06); position:relative; display:flex; align-items:center; justify-content:center; gap:10px; padding:18px 10px; cursor:pointer; font-family:inherit; color:#EDEAE3;")}
            >
              <span style={css(`display:flex; opacity:${sel ? 1 : 0.55}; transition:opacity .3s;`)}>{TAB_ICONS[n]}</span>
              <span style={css(`${MONO} font-size:12px; color:${sel ? "#FF5B1F" : "#8C8A85"};`)}>0{n + 1}</span>
              <span className="ft-lb" style={css(`font-weight:500; font-size:14.5px; color:${sel ? "#EDEAE3" : "#8C8A85"}; white-space:nowrap;`)}>{x.label}</span>
              <span aria-hidden="true" style={css(`position:absolute; left:0; bottom:-1px; height:2px; background:#FF5B1F; width:${sel && (paused || fill) ? "100%" : "0%"}; transition:${sel && fill && !paused ? "width 6s linear" : "none"};`)} />
            </button>
          );
        })}
      </div>
      <div className="ft-body" style={css("display:grid; grid-template-columns:45fr 55fr;")}>
        <div style={css("padding:clamp(28px,4vw,48px); display:flex; flex-direction:column; justify-content:center;")}>
          <p style={css(`margin:0 0 12px; font-size:11.5px; ${EYEBROW}`)}>STEP 0{step + 1}</p>
          <h2 className="serif" style={css("margin:0 0 14px; font-size:clamp(28px,3vw,36px); line-height:1.08; letter-spacing:-0.02em;")}>{cur.title}</h2>
          <p style={css("margin:0 0 22px; font-size:15.5px; line-height:1.65; color:#a9a59d; text-wrap:pretty;")}>{cur.desc}</p>
          <div style={css("display:flex; flex-direction:column; gap:11px;")}>
            {cur.points.map((pt) => (
              <div key={pt} style={css("display:flex; align-items:flex-start; gap:11px; font-size:14.5px; line-height:1.55; color:#d6d2ca;")}>
                <span style={css("flex:none; margin-top:7px; width:5px; height:5px; border-radius:50%; background:#FF5B1F;")} />
                <span style={css("flex:1; min-width:0;")}>{pt}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ft-stage" style={css("position:relative; overflow:hidden; border-left:1px solid rgba(237,234,227,.08); background:radial-gradient(600px 340px at 30% 80%, rgba(255,140,80,.07), rgba(255,140,80,0)), #0e0e10; min-height:clamp(320px,36vw,440px); display:flex; align-items:center; justify-content:center; padding:clamp(22px,3vw,40px);")}>
          {step === 0 && (
            <div style={css("position:relative; width:min(440px,100%); display:flex; flex-direction:column; gap:10px;")}>
              <div style={css("position:relative; align-self:flex-end; max-width:88%; background:#1d1c20; border:1px solid rgba(237,234,227,.1); border-radius:14px 14px 4px 14px; padding:11px 15px; font-size:13.5px; line-height:1.5; color:#EDEAE3;")}>
                Show how a Fourier series builds a square wave, step by step
                <span data-drift="0" aria-hidden="true" style={css("position:absolute; right:30%; top:-6px; font-size:13px; color:#F4E9D0; pointer-events:none;")}>Fourier</span>
                <span data-drift="1" aria-hidden="true" style={css("position:absolute; right:12%; top:2px; font-size:13px; color:#F4E9D0; pointer-events:none;")}>square</span>
                <span data-drift="2" aria-hidden="true" style={css("position:absolute; right:4%; top:20px; font-size:13px; color:#F4E9D0; pointer-events:none;")}>wave</span>
              </div>
              <div style={css("align-self:flex-start; max-width:88%; background:#151517; border:1px solid rgba(237,234,227,.07); border-radius:14px 14px 14px 4px; padding:11px 15px; font-size:13.5px; line-height:1.5; color:#a9a59d;")}>
                Building a 12-second scene adding harmonics n = 1, 3, 5, 7…
              </div>
              <div style={css("display:flex; align-items:center; gap:9px; background:#151517; border:1px solid rgba(237,234,227,.1); border-radius:14px; padding:9px 9px 9px 15px; margin-top:6px;")}>
                <span style={css("flex:1; font-size:13px; color:#8C8A85;")}>Label the axes…</span>
                <span style={css("width:30px; height:30px; border-radius:9px; background:#FF5B1F; display:flex; align-items:center; justify-content:center; color:#0A0A0B;")}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5" /><path d="M6 11l6-6 6 6" /></svg>
                </span>
              </div>
            </div>
          )}
          {step === 1 && (
            <div style={css("width:min(440px,100%); background:#0b0b0d; border:1px solid rgba(237,234,227,.1); border-radius:14px; overflow:hidden;")}>
              <div style={css("display:flex; align-items:center; gap:8px; padding:10px 14px; background:#141416; border-bottom:1px solid rgba(237,234,227,.08);")}>
                <span style={css(`${MONO} font-size:11.5px; color:#a9a59d;`)}>scene.py</span>
                <span style={css("flex:1;")} />
                <span style={css(`${MONO} font-size:10.5px; color:#9fd3ad; border:1px solid rgba(159,211,173,.3); border-radius:6px; padding:2px 7px;`)}>✓ editable</span>
              </div>
              <div style={css(`padding:16px 18px; ${MONO} font-size:12.5px; line-height:1.9; color:#d1cdc5; white-space:pre;`)}>
                <div style={line(0)}><span style={css("color:#b49ad6;")}>from</span> manim <span style={css("color:#b49ad6;")}>import</span> *</div>
                <div style={line(1)}> </div>
                <div style={line(2)}><span style={css("color:#b49ad6;")}>class</span> <span style={css("color:#e2c48a;")}>SquareWave</span>(Scene):</div>
                <div style={line(3)}>{"    "}<span style={css("color:#b49ad6;")}>def</span> <span style={css("color:#9cbde6;")}>construct</span>(self):</div>
                <div style={line(4)}>{"        "}axes = Axes(x_range=[-<span style={css(HL)}>{kval}</span>, <span style={css(HL)}>{kval}</span>])</div>
                <div style={line(5)}>{"        "}wave = axes.plot(fourier_sq)</div>
                <div style={line(6)}>{"        "}self.play(<span style={css("color:#f0b27a;")}>Create</span>(wave))</div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div style={css("position:relative; width:min(440px,100%); background:#0b0b0d; border:1px solid rgba(237,234,227,.1); border-radius:14px; padding:22px; display:flex; flex-direction:column; gap:16px; overflow:hidden;")}>
              <div data-sweep="1" aria-hidden="true" style={css("position:absolute; top:-40%; bottom:-40%; left:0; width:38%; background:linear-gradient(90deg, rgba(255,216,160,0), rgba(255,216,160,.12), rgba(255,216,160,0)); transform:skewX(-18deg); pointer-events:none;")} />
              <div style={css("display:flex; align-items:center; justify-content:space-between; gap:12px;")}>
                <span style={css(`${MONO} font-size:12px; color:#d1cdc5;`)}>Rendering · 1080p · 60fps</span>
                <span style={css(`${MONO} font-size:12px; color:#a9a59d;`)}>frame {String(fr).padStart(4, "0")} / 720</span>
              </div>
              <div style={css("height:8px; border-radius:6px; background:#1d1c20; overflow:hidden;")}>
                <div style={css(`height:100%; width:${((fr / 720) * 100).toFixed(1)}%; border-radius:6px; background:linear-gradient(90deg,#c2410c,#FF5B1F);`)} />
              </div>
              <div style={css("display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:9px;")}>
                {["fourier", "sine", "riemann", "lorenz"].map((k, n) => (
                  <div key={k} style={css(`aspect-ratio:16/10; border-radius:7px; background:#151517; border:1px solid rgba(237,234,227,.08); overflow:hidden; opacity:${fr > n * 180 ? 1 : 0.15}; transition:opacity .3s;`)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={poster(k)} alt="" style={css("width:100%; height:100%; object-fit:cover; display:block;")} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div style={css("width:min(460px,100%); display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px;")}>
              {["lorenz", "galaxy", "aurora", "kaleido", "chaosgame", "fourier"].map((k) => (
                <div key={k} style={css("position:relative; aspect-ratio:16/10; border-radius:9px; overflow:hidden; background:#151517; border:1px solid rgba(237,234,227,.1); box-shadow:0 10px 18px -12px rgba(0,0,0,.9);")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={poster(k)} alt="" style={css("position:absolute; inset:0; width:100%; height:100%; object-fit:cover;")} />
                  <span style={css("position:absolute; left:7px; bottom:6px; width:20px; height:20px; border-radius:50%; background:rgba(10,10,11,.7); display:flex; align-items:center; justify-content:center;")}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="#EDEAE3"><polygon points="6 4 20 12 6 20" /></svg>
                  </span>
                  <span style={css("position:absolute; right:7px; bottom:6px; width:20px; height:20px; border-radius:50%; background:rgba(10,10,11,.7); display:flex; align-items:center; justify-content:center; color:#EDEAE3;")}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M12 4v12M6 11l6 6 6-6M5 21h14" /></svg>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FeaturesView({ fontClass }: { fontClass: string }) {
  const [step, setStep] = useState(0);
  const [hovTab, setHovTab] = useState<number | null>(null);
  const [hov, setHov] = useState<number | null>(null);
  const stepRef = useRef(0);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  const gl = hovTab ?? step;

  /* words drift off the prompt, the bench ribbon unspools, the lamp beam flickers, the render sweep passes */
  const onTick = useCallback((t: number, reduce: boolean) => {
    document.querySelectorAll<HTMLElement>("[data-drift]").forEach((e) => {
      const i = +(e.getAttribute("data-drift") || 0);
      const f = reduce ? 0.5 : (t / 5 + i * 0.33) % 1;
      e.style.transform = "translate(" + (f * 120).toFixed(1) + "px," + (-f * 34 + Math.sin(f * 6 + i) * 6).toFixed(1) + "px)";
      e.style.opacity = String((f < 0.15 ? f / 0.15 : 1 - f) * 0.8);
    });
    const r = document.querySelector("[data-ribbon]");
    if (r && !reduce) r.setAttribute("stroke-dashoffset", String(-(t * 18) % 400));
    const b = document.querySelector("[data-beam]");
    if (b) b.setAttribute("opacity", (0.55 + (reduce ? 0 : 0.12 * Math.sin(t * 7) * Math.sin(t * 2.3)) + (stepRef.current === 2 ? 0.25 : 0)).toFixed(2));
    const s = document.querySelector<HTMLElement>("[data-sweep]");
    if (s) s.style.left = (reduce ? 30 : ((t * 22) % 160) - 40) + "%";
  }, []);

  return (
    <NightShell fontClass={fontClass} active="features" sky="#2A1A2E" onTick={onTick}>
      {/* ============ HEADER: the workshop ============ */}
      <section style={css("position:relative; isolation:isolate; height:clamp(560px,46vw,620px); overflow:hidden; background:linear-gradient(180deg,#0A0A0B 0%,#1d1220 22%,#2A1A2E 40%,#5a2f3a 58%,#B5655A 72%,#d98a5c 76%);")}>
        <Stars place="left:0; right:0; top:0; height:45%;" opacity={0.3} />
        <div data-par="0.2" aria-hidden="true" style={css("position:absolute; inset:0; pointer-events:none;")}>
          <div style={css("position:absolute; left:-6%; top:50%; width:60%; height:52%; background:radial-gradient(ellipse 50% 50% at 30% 100%, rgba(255,190,120,.55), rgba(255,120,60,.18) 45%, rgba(255,91,31,0) 75%);")} />
          <div style={css("position:absolute; left:calc(9% - 60px); top:calc(76% - 106px); width:212px; height:106px; overflow:hidden;")}>
            <div style={css("position:absolute; left:60px; top:60px; width:92px; height:92px; border-radius:50%; background:radial-gradient(circle at 40% 60%, #fff4dc, #ffc98a 50%, #ff8a4a); box-shadow:0 0 50px 16px rgba(255,150,80,.4);")} />
          </div>
        </div>
        <Ground top="76%" tint="linear-gradient(180deg, rgba(217,138,92,.35), rgba(10,10,11,0) 40%), radial-gradient(ellipse 40% 80% at 12% 0%, rgba(255,160,90,.25), rgba(255,160,90,0) 70%)" />
        <div data-par="0.6" aria-hidden="true" className="ft-bench" style={css("position:absolute; right:-2%; bottom:6%; width:min(980px,68%); aspect-ratio:2000/900; pointer-events:none;")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v3/f-bench.webp" alt="" style={css("position:absolute; inset:0; width:100%; height:100%; filter:drop-shadow(-4px 3px 0 rgba(255,200,140,.12));")} />
          <svg viewBox="0 0 2000 900" style={css("position:absolute; inset:0; width:100%; height:100%; overflow:visible;")}>
            <defs>
              <radialGradient id="ftg" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#FFB070" stopOpacity=".75" />
                <stop offset=".5" stopColor="#FF5B1F" stopOpacity=".22" />
                <stop offset="1" stopColor="#FF5B1F" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="ftbeam" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#FFE8C0" stopOpacity=".75" />
                <stop offset="1" stopColor="#FFC48A" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[
              [460, 330, 190, 230],
              [830, 430, 200, 200],
              [1240, 370, 220, 200],
              [1620, 300, 190, 220],
            ].map(([cx, cy, rx, ry], i) => (
              <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#ftg)" style={css(`opacity:${gl === i ? 1 : 0}; transition:opacity .6s;`)} />
            ))}
            <path data-beam="1" d="M1370 422 L1515 250 L1515 380 Z" fill="url(#ftbeam)" opacity=".7" />
            <path data-ribbon="1" d="M600 125 C 640 60, 600 20, 650 -10 S 720 -40, 700 -80 S 760 -120, 800 -110 S 840 -150, 880 -170" fill="none" stroke="#F4E9D0" strokeWidth="3" strokeLinecap="round" strokeDasharray="14 10 4 10" opacity=".55" />
          </svg>
        </div>
        <div className="ft-head" style={css("position:relative; z-index:2; max-width:1360px; margin:0 auto; padding:clamp(120px,12vw,150px) clamp(16px,4vw,40px) 0;")}>
          <p style={css(`margin:0 0 18px; font-size:12.5px; ${EYEBROW}`)}>FEATURES</p>
          <h1 className="serif" style={css("margin:0; max-width:620px; font-size:clamp(40px,5.2vw,72px); line-height:1; letter-spacing:-0.03em; text-wrap:pretty;")}>
            Everything you need to turn an idea into <span style={css("font-style:italic; color:#FF5B1F;")}>an animation.</span>
          </h1>
          <p style={css("margin:22px 0 0; max-width:440px; font-size:17px; line-height:1.55; color:#d6d2ca;")}>Manition pairs a plain-language interface with a real rendering engine.</p>
          <p className="mono" style={css("margin:16px 0 0; font-size:12px; letter-spacing:.06em; color:#bdb7ad;")}>04 steps / 06 math domains / one sentence in</p>
        </div>
      </section>

      <GridBg>
        {/* ============ PIPELINE ============ */}
        <section style={css("position:relative; max-width:1240px; margin:0 auto; padding:clamp(40px,5vw,64px) clamp(16px,4vw,40px);")}>
          <Pipeline step={step} setStep={setStep} setHovTab={setHovTab} />
        </section>

        {/* ============ WHAT CAN IT ANIMATE ============ */}
        <section style={css("position:relative; max-width:1240px; margin:0 auto; padding:clamp(30px,4vw,56px) clamp(16px,4vw,40px);")}>
          <div data-reveal="1" style={css("max-width:600px; margin-bottom:28px;")}>
            <h2 className="serif" style={css("margin:0 0 12px; font-size:clamp(32px,3.6vw,46px); letter-spacing:-0.025em; line-height:1.04;")}>What can it animate?</h2>
            <p style={css("margin:0; font-size:16px; color:#a9a59d; line-height:1.6;")}>If Manim can draw it, you can describe it. A few of the things people reach for most:</p>
          </div>
          <div style={css(`${CARD} border-radius:22px; padding:8px clamp(10px,2vw,22px); box-shadow:inset 0 1px 0 rgba(237,234,227,.07), 0 50px 70px -50px rgba(0,0,0,.95);`)}>
            {CAPS.map((c, n) => {
              const h = hov === n;
              return (
                <div
                  key={c.num}
                  onMouseEnter={() => setHov(n)}
                  onMouseLeave={() => setHov(null)}
                  onClick={() => setHov(h ? null : n)}
                  className="ft-cap"
                  style={css(`position:relative; display:grid; grid-template-columns:40px 36px minmax(0,1fr) minmax(0,1fr); gap:6px 18px; align-items:center; padding:20px 12px; border-bottom:${n < 5 ? "1px solid rgba(237,234,227,.07)" : "0"}; border-radius:14px; cursor:default; transition:transform .25s, background .25s; transform:${h ? "translateY(-2px)" : "none"}; background:${h ? "rgba(237,234,227,.035)" : "transparent"};`)}
                >
                  <span className="ft-hidem" aria-hidden="true" style={css("display:flex;")}>{CAP_ICONS[n]}</span>
                  <span style={css(`${MONO} font-size:12px; color:#a9a59d;`)}>{c.num}</span>
                  <div>
                    <h3 style={css("margin:0 0 4px; font-weight:500; font-size:18px; letter-spacing:-0.01em;")}>{c.name}</h3>
                    <p style={css("margin:0; font-size:14px; color:#a9a59d; line-height:1.55;")}>{c.desc}</p>
                  </div>
                  <p className="ft-ex" style={css(`margin:0; ${MONO} font-style:italic; font-size:12.5px; line-height:1.6; color:#a9a59d; text-align:right;`)}>{c.ex}</p>
                  {h && (
                    <div className="ft-prev" aria-hidden="true" style={css("position:absolute; z-index:5; right:-12px; top:50%; transform:translate(100%,-50%); pointer-events:none;")}>
                      <span className="ft-thread" style={css("position:absolute; left:50%; bottom:100%; width:1px; height:120px; background:linear-gradient(180deg, rgba(237,234,227,0), rgba(237,234,227,.55));")} />
                      <span className="ft-thread" style={css("position:absolute; left:calc(50% - 4px); top:-4px; width:8px; height:8px; border-radius:50%; background:radial-gradient(circle at 35% 35%, #ffe2a3, #a8803f);")} />
                      <div style={css("width:240px; height:135px; padding:6px; background:#EDEAE3; border-radius:4px; box-shadow:0 24px 30px -18px rgba(0,0,0,.9); box-sizing:border-box;")}>
                        <video src={`/scenes/${c.sc}.mp4`} poster={poster(c.sc)} autoPlay muted loop playsInline style={css("width:100%; height:100%; display:block; object-fit:cover; background:#0a0a0d;")} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ============ CTA: see it move ============ */}
        <section style={css("position:relative; max-width:1240px; margin:0 auto; padding:clamp(40px,5vw,72px) clamp(16px,4vw,40px) clamp(150px,16vw,220px);")}>
          <div data-reveal="1" style={css(`position:relative; ${CARD} border-radius:24px; padding:clamp(40px,5.6vw,64px) clamp(22px,4.4vw,56px); box-shadow:inset 0 1px 0 rgba(237,234,227,.07), 0 60px 70px -50px rgba(0,0,0,.95);`)}>
            <div aria-hidden="true" style={css("position:absolute; left:8%; right:8%; bottom:-56px; height:40px; border-radius:50%; background:rgba(0,0,0,.55); filter:blur(18px);")} />
            <svg className="ft-hidem" aria-hidden="true" viewBox="0 0 260 300" style={css("position:absolute; right:-40px; top:30%; width:240px; overflow:visible; pointer-events:none;")}>
              <path d="M0 40 C 120 30, 200 70, 210 160 S 240 270, 300 300" fill="none" stroke="#1d1720" strokeWidth="44" />
              <path d="M0 40 C 120 30, 200 70, 210 160 S 240 270, 300 300" fill="none" stroke="#2e2430" strokeWidth="40" />
              <path d="M0 24 C 120 14, 216 56, 226 156 S 252 254, 306 282" fill="none" stroke="#EDEAE3" strokeWidth="5" strokeDasharray="6 9" opacity=".75" />
              <path d="M0 56 C 120 46, 184 84, 194 164 S 228 286, 294 318" fill="none" stroke="#EDEAE3" strokeWidth="5" strokeDasharray="6 9" opacity=".75" />
              <path d="M8 40 L 60 38" stroke="#FF5B1F" strokeWidth="2" opacity=".6" />
            </svg>
            <div style={css("position:relative; max-width:560px;")}>
              <h2 className="serif" style={css("margin:0 0 14px; font-size:clamp(36px,4.6vw,58px); letter-spacing:-0.03em; line-height:1;")}>
                See it <span style={css("font-style:italic; color:#FF5B1F;")}>move.</span>
              </h2>
              <p style={css("margin:0 0 28px; max-width:440px; font-size:16.5px; color:#a9a59d; line-height:1.6;")}>Join the waitlist and be among the first to turn a sentence into a rendered scene.</p>
              <JoinCta />
            </div>
          </div>
        </section>
      </GridBg>
    </NightShell>
  );
}
