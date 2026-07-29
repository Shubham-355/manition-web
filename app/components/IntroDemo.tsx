"use client";

import { useEffect, useRef } from "react";
import { parseStyle } from "../lib/css";

const LOOP = "26s";
const LOOP_MS = 26000;

const COLS = ["#7ea6d9", "#8fc9a0", "#c9a86b", "#c98f8f"];
const TERMS = [1, 3, 5, 7];
const AMP = 44 * (4 / Math.PI);
const CX = 112;
const CY = 150;
const X0 = 216;
const X1 = 462;
const SPEED = 54;

// Watch-phase progress points at which each harmonic joins the rig.
const JOINS = [0.595, 0.68, 0.765, 0.85];

const codeLine = "opacity:0; animation:mv-line " + LOOP + " linear infinite;";
const kw = "color:#8f7ab8;";

export default function IntroDemo() {
  const fsRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const g = rigRef.current;
    const fs = fsRef.current;
    if (!g) return;

    const NS = "http://www.w3.org/2000/svg";
    const mk = (tag: string, attrs: Record<string, string>) => {
      const el = document.createElementNS(NS, tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      g.appendChild(el);
      return el;
    };

    const parts = TERMS.map((n, i) => ({
      n,
      amp: i === 0 ? 1 : 0,
      circle: mk("circle", { fill: "none", stroke: COLS[i], "stroke-opacity": "0.45", "stroke-width": "1.2" }),
      arm: mk("line", { stroke: COLS[i], "stroke-width": "1.7", "stroke-linecap": "round" }),
      dot: mk("circle", { r: "2.1", fill: COLS[i] }),
    }));
    const conn = mk("line", { stroke: "#52525b", "stroke-width": "1", "stroke-dasharray": "3 4" });
    const traceGlow = mk("path", { fill: "none", stroke: "rgba(126,166,217,0.28)", "stroke-width": "5.5", "stroke-linecap": "round", "stroke-linejoin": "round" });
    const trace = mk("path", { fill: "none", stroke: "#e4e4e7", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" });
    const penGlow = mk("circle", { r: "7", fill: "rgba(255,255,255,0.16)" });
    const pen = mk("circle", { r: "3.2", fill: "#ffffff" });

    // Drive the rig off the mv-fs CSS animation's clock so the harmonics join in
    // step with the watch phase even if the tab throttles rAF.
    let clock: Animation | null = null;
    const findClock = () => {
      if (clock) return clock;
      const running = fs && fs.getAnimations ? fs.getAnimations() : [];
      for (const a of running) {
        if ((a as CSSAnimation).animationName === "mv-fs") clock = a;
      }
      return clock;
    };

    const pts: { t: number; y: number }[] = [];
    const t0 = performance.now();
    let last = t0;
    let raf = 0;

    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min(0.06, (now - last) / 1000);
      last = now;

      const a = findClock();
      const ms = a && a.currentTime != null ? Number(a.currentTime) : now - t0;
      const p = (ms % LOOP_MS) / LOOP_MS;
      let k = 0;
      for (const j of JOINS) if (p >= j) k++;
      if (k < 1) k = 1;

      const phase = (now / 2400) * 2 * Math.PI;
      let x = CX;
      let y = CY;
      parts.forEach((part, i) => {
        part.amp += ((i < k ? 1 : 0) - part.amp) * Math.min(1, dt * 5);
        const r = Math.max((AMP / part.n) * part.amp, 0.01);
        const ang = part.n * phase;
        const on = part.amp > 0.04 ? "1" : "0";
        part.circle.setAttribute("cx", String(x));
        part.circle.setAttribute("cy", String(y));
        part.circle.setAttribute("r", String(r));
        part.circle.setAttribute("opacity", on);
        const nx = x + r * Math.cos(ang);
        const ny = y - r * Math.sin(ang);
        part.arm.setAttribute("x1", String(x));
        part.arm.setAttribute("y1", String(y));
        part.arm.setAttribute("x2", String(nx));
        part.arm.setAttribute("y2", String(ny));
        part.arm.setAttribute("opacity", on);
        part.dot.setAttribute("cx", String(nx));
        part.dot.setAttribute("cy", String(ny));
        part.dot.setAttribute("opacity", on);
        x = nx;
        y = ny;
      });

      pen.setAttribute("cx", String(x));
      pen.setAttribute("cy", String(y));
      penGlow.setAttribute("cx", String(x));
      penGlow.setAttribute("cy", String(y));
      conn.setAttribute("x1", String(x));
      conn.setAttribute("y1", String(y));
      conn.setAttribute("x2", String(X0));
      conn.setAttribute("y2", String(y));

      const tSec = now / 1000;
      pts.unshift({ t: tSec, y });
      while (pts.length > 2 && X0 + (tSec - pts[pts.length - 1].t) * SPEED > X1 + 6) pts.pop();
      if (pts.length > 500) pts.length = 500;
      let d = "";
      for (let i = 0; i < pts.length; i++) {
        const px = X0 + (tSec - pts[i].t) * SPEED;
        d += (i === 0 ? "M" : "L") + px.toFixed(2) + " " + pts[i].y.toFixed(2);
      }
      trace.setAttribute("d", d);
      traceGlow.setAttribute("d", d);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      while (g.firstChild) g.removeChild(g.firstChild);
    };
  }, []);

  return (
    <div style={parseStyle("width:100%; display:flex; flex-direction:column; align-items:center; font-family:'Space Grotesk','IBM Plex Sans',ui-sans-serif,system-ui;")}>
      <div style={parseStyle(`position:relative; width:min(560px, 100%); animation:mv-float 9s ease-in-out infinite;`)}>
        <div style={parseStyle("position:absolute; inset:-48px -70px; background:radial-gradient(50% 55% at 50% 45%, rgba(126,166,217,0.08) 0%, rgba(9,9,11,0) 70%); pointer-events:none;")}></div>
        <div style={parseStyle("position:relative; width:100%; box-sizing:border-box; border:1px solid #26262c; border-radius:15px; background:rgba(13,13,16,0.92); box-shadow:0 32px 80px rgba(0,0,0,0.45), 0 2px 0 rgba(255,255,255,0.03) inset; overflow:hidden; backdrop-filter:blur(6px);")}>

          {/* title bar */}
          <div style={parseStyle("display:flex; align-items:center; gap:7px; padding:11px 14px; border-bottom:1px solid #1c1c21; background:rgba(20,20,24,0.8);")}>
            <span style={parseStyle("width:9px; height:9px; border-radius:50%; background:#33343a;")}></span>
            <span style={parseStyle("width:9px; height:9px; border-radius:50%; background:#33343a;")}></span>
            <span style={parseStyle("width:9px; height:9px; border-radius:50%; background:#33343a;")}></span>
            <span style={parseStyle("flex:1; text-align:center; font-size:11px; color:#5b5b63; letter-spacing:0.02em;")}>Manition</span>
            <span style={parseStyle("width:43px;")}></span>
          </div>

          {/* stage */}
          <div style={parseStyle("position:relative; aspect-ratio:16/10; overflow:hidden;")}>

            {/* continuous app UI */}
            <div style={parseStyle(`position:absolute; inset:0; display:flex; flex-direction:column; transform-origin:50% 48%; animation:mv-ui ${LOOP} linear infinite, mv-zoom ${LOOP} linear infinite;`)}>

              <div style={parseStyle("flex:1 1 0; min-height:0; overflow:hidden; position:relative;")}>
                <div style={parseStyle("padding:12px 14px 0; display:flex; flex-direction:column; gap:8px;")}>

                  <div style={parseStyle(`align-self:flex-end; max-width:80%; background:#1f1f24; border:1px solid #2c2c33; border-radius:10px 10px 3px 10px; padding:7px 11px; max-height:44px; overflow:hidden; opacity:0; animation:mv-bub ${LOOP} linear infinite, mv-fold2 ${LOOP} cubic-bezier(.45,0,.2,1) infinite;`)}>
                    <p style={parseStyle("margin:0; font-size:10.5px; line-height:1.5; color:#e4e4e7;")}>Draw a square wave with spinning Fourier circles</p>
                  </div>

                  <div style={parseStyle(`border:1px solid #26262c; border-radius:10px; overflow:hidden; background:#0f0f12; opacity:0; animation:mv-code ${LOOP} linear infinite;`)}>
                    <div style={parseStyle("display:flex; align-items:center; gap:8px; padding:5px 6px 5px 12px; background:#17171b; border-bottom:1px solid #26262c;")}>
                      <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:9.5px; color:#71717a;")}>scene.py</span>
                      <span style={parseStyle("position:relative; display:block; flex:1; height:12px; font-size:9.5px;")}>
                        <span style={parseStyle(`position:absolute; inset:0; text-align:right; color:#71717a; opacity:0; animation:mvG1 ${LOOP} linear infinite;`)}>writing scene…</span>
                        <span style={parseStyle(`position:absolute; inset:0; text-align:right; color:#8fc9a0; opacity:0; animation:mvG2 ${LOOP} linear infinite;`)}>✓ scene ready</span>
                      </span>
                      <span style={parseStyle(`display:inline-flex; align-items:center; gap:5px; border:1px solid #2c2c33; border-radius:7px; padding:4px 9px; font-size:9.5px; font-weight:600; color:#a1a1aa; animation:mv-run ${LOOP} linear infinite;`)}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21"></polygon></svg>
                        Run
                      </span>
                    </div>
                    <div style={parseStyle(`padding:9px 13px; max-height:96px; overflow:hidden; font-family:'IBM Plex Mono',monospace; font-size:10px; line-height:1.75; color:#b0b0b8; animation:mv-fold ${LOOP} cubic-bezier(.45,0,.2,1) infinite;`)}>
                      <div style={parseStyle(codeLine)}>
                        <span style={parseStyle(kw)}>from</span> manim <span style={parseStyle(kw)}>import</span> *
                      </div>
                      <div style={parseStyle(codeLine + " animation-delay:0.35s;")}>
                        <span style={parseStyle(kw)}>class</span> <span style={parseStyle("color:#c9a86b;")}>FourierSquare</span>(Scene):
                      </div>
                      <div style={parseStyle(codeLine + " animation-delay:0.7s;")}>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span style={parseStyle(kw)}>def</span> <span style={parseStyle("color:#7ea6d9;")}>construct</span>(self):
                      </div>
                      <div style={parseStyle(codeLine + " animation-delay:1.05s;")}>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;rig = FourierRig(n=[1, 3, 5, 7])
                      </div>
                      <div style={parseStyle(codeLine + " animation-delay:1.4s;")}>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.play(Create(rig), Trace(rig))
                        <span style={parseStyle("display:inline-block; width:5px; height:10px; background:#a1a1aa; vertical-align:-1px; margin-left:4px; animation:mv-caret 1s steps(1) infinite;")}></span>
                      </div>
                    </div>
                  </div>

                  <div style={parseStyle(`position:relative; width:100%; box-sizing:border-box; aspect-ratio:16/6.6; max-height:clamp(80px, 32.5vw - 182px, 240px); flex:0 0 auto; border:1px solid #26262c; border-radius:10px; overflow:hidden; background:#000; opacity:0; animation:mv-slot ${LOOP} linear infinite;`)}>
                    <div style={parseStyle(`position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; opacity:0; animation:mv-rend ${LOOP} linear infinite;`)}>
                      <svg viewBox="0 0 24 24" fill="none" style={parseStyle("width:16px; height:16px; animation:mn-spin .9s linear infinite;")}>
                        <circle cx="12" cy="12" r="10" stroke="#2b2b31" strokeWidth="4"></circle>
                        <path d="M4 12a8 8 0 018-8" stroke="#a1a1aa" strokeWidth="4" strokeLinecap="round"></path>
                      </svg>
                      <p style={parseStyle("margin:9px 0 0; font-size:10.5px; font-weight:600; color:#d4d4d8;")}>Rendering animation…</p>
                      <div style={parseStyle("width:150px; margin-top:9px; height:3px; border-radius:99px; background:#222227; overflow:hidden;")}>
                        <div style={parseStyle(`height:100%; width:0%; border-radius:99px; background:#a1a1aa; animation:mv-prog ${LOOP} linear infinite;`)}></div>
                      </div>
                      <div style={parseStyle("position:relative; width:100%; height:12px; margin-top:8px; font-family:'IBM Plex Mono',monospace; font-size:8.5px; color:#5b5b63; text-align:center;")}>
                        <span style={parseStyle(`position:absolute; inset:0; opacity:0; animation:mvR1 ${LOOP} linear infinite;`)}>compiling scene graph…</span>
                        <span style={parseStyle(`position:absolute; inset:0; opacity:0; animation:mvR2 ${LOOP} linear infinite;`)}>rendering epicycles · 1080p</span>
                        <span style={parseStyle(`position:absolute; inset:0; opacity:0; animation:mvR3 ${LOOP} linear infinite;`)}>encoding h.264 · almost there</span>
                      </div>
                    </div>
                  </div>

                </div>

                <div style={parseStyle(`position:absolute; top:52px; left:14px; display:flex; align-items:center; gap:7px; background:#141418; border:1px solid #232329; border-radius:9px; padding:6px 10px; opacity:0; animation:mv-think ${LOOP} linear infinite;`)}>
                  <svg viewBox="0 0 24 24" fill="none" style={parseStyle("width:10px; height:10px; animation:mn-spin .8s linear infinite;")}>
                    <circle cx="12" cy="12" r="10" stroke="#2b2b31" strokeWidth="4"></circle>
                    <path d="M4 12a8 8 0 018-8" stroke="#8b8b93" strokeWidth="4" strokeLinecap="round"></path>
                  </svg>
                  <span style={parseStyle("font-size:10px; color:#8b8b93;")}>Thinking…</span>
                </div>
              </div>

              {/* composer */}
              <div style={parseStyle("flex:0 0 auto; padding:9px 12px 11px; border-top:1px solid #1a1a1f; background:rgba(17,17,21,0.65);")}>
                <div style={parseStyle(`display:flex; align-items:center; gap:9px; background:#141418; border:1px solid #26262c; border-radius:11px; padding:7px 7px 7px 12px; animation:mv-focus ${LOOP} linear infinite;`)}>
                  <div style={parseStyle("position:relative; flex:1; min-width:0; height:15px;")}>
                    <span style={parseStyle(`position:absolute; inset:0; display:flex; align-items:center; font-size:10.5px; color:#4b4b52; animation:mv-ph ${LOOP} linear infinite;`)}>Describe the animation you want to create…</span>
                    <span style={parseStyle(`position:absolute; inset:0; display:flex; align-items:center; overflow:hidden; opacity:0; animation:mv-carwin ${LOOP} linear infinite;`)}>
                      <span style={parseStyle(`display:block; overflow:hidden; white-space:nowrap; width:0ch; font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:#e4e4e7; animation:mv-type ${LOOP} linear infinite;`)}>Draw a square wave with spinning Fourier circles</span>
                      <span style={parseStyle("width:1.5px; height:12px; flex:0 0 auto; background:#e4e4e7; margin-left:2px; animation:mv-caret 1.1s steps(1) infinite;")}></span>
                    </span>
                  </div>
                  <div style={parseStyle(`width:28px; height:28px; flex:0 0 auto; display:flex; align-items:center; justify-content:center; border-radius:8px; background:#26262b; color:#5b5b63; animation:mv-send ${LOOP} linear infinite;`)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19V5"></path>
                      <path d="M6 11l6-6 6 6"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div style={parseStyle("position:absolute; inset:0; z-index:3; pointer-events:none; background:radial-gradient(115% 95% at 50% 40%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.26) 100%);")}></div>

            <div style={parseStyle(`position:absolute; inset-block:0; left:0; width:46%; z-index:6; background:linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%); transform:translateX(-140%) skewX(-16deg); opacity:0; animation:mv-sheen ${LOOP} linear infinite; pointer-events:none;`)}></div>

            <span style={parseStyle(`position:absolute; left:30%; top:calc(100% - 27px); width:32px; height:32px; margin:-16px 0 0 -16px; border-radius:50%; border:1.5px solid #d4d4d8; opacity:0; transform:scale(0.2); animation:mv-rip1 ${LOOP} linear infinite; pointer-events:none;`)}></span>
            <span style={parseStyle(`position:absolute; left:calc(100% - 33px); top:calc(100% - 27px); width:32px; height:32px; margin:-16px 0 0 -16px; border-radius:50%; border:1.5px solid #d4d4d8; opacity:0; transform:scale(0.2); animation:mv-rip2 ${LOOP} linear infinite; pointer-events:none;`)}></span>
            <span style={parseStyle(`position:absolute; left:calc(100% - 46px); top:68px; width:32px; height:32px; margin:-16px 0 0 -16px; border-radius:50%; border:1.5px solid #d4d4d8; opacity:0; transform:scale(0.2); animation:mv-rip3 ${LOOP} linear infinite; pointer-events:none;`)}></span>

            <div style={parseStyle(`position:absolute; left:72%; top:55%; z-index:6; opacity:0; pointer-events:none; animation:mv-cur ${LOOP} cubic-bezier(.5,.08,.24,1) infinite;`)}>
              <svg width="17" height="17" viewBox="0 0 24 24" style={parseStyle(`display:block; transform-origin:5px 3px; animation:mv-press ${LOOP} linear infinite; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.55));`)}>
                <path d="M5.2 2.6 L5.2 19.4 L9.6 15.4 L12.2 21.4 L15.3 20 L12.7 14.1 L18.6 13.7 Z" fill="#f4f4f5" stroke="#18181b" strokeWidth="1.1" strokeLinejoin="round"></path>
              </svg>
            </div>

            {/* fullscreen video · watch phase */}
            <div ref={fsRef} style={parseStyle(`position:absolute; inset:0; z-index:4; background:#000; opacity:0; transform-origin:50% 48%; animation:mv-fs ${LOOP} linear infinite; pointer-events:none;`)}>
              <svg viewBox="0 0 480 300" preserveAspectRatio="xMidYMid meet" style={parseStyle("position:absolute; inset:0; width:100%; height:100%;")}>
                <defs>
                  <pattern id="mvGridP" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M32 0H0V32" fill="none" stroke="#131318" strokeWidth="1"></path>
                  </pattern>
                </defs>
                <rect x="0" y="0" width="480" height="300" fill="url(#mvGridP)"></rect>
                <line x1="216" y1="18" x2="216" y2="282" stroke="#191920" strokeWidth="1"></line>
                <line x1="18" y1="150" x2="462" y2="150" stroke="#232330" strokeWidth="1"></line>
                <g ref={rigRef}></g>
              </svg>
              <span style={parseStyle("position:absolute; top:12px; left:14px; background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:4px 8px; font-family:'IBM Plex Mono',monospace; font-size:9.5px; color:#a1a1aa; white-space:nowrap;")}>fourier_square.mp4 · 1080p</span>
              <span style={parseStyle("position:absolute; top:12px; right:14px; font-family:'IBM Plex Mono',monospace; font-size:9.5px; color:#71717a;")}>
                <span style={parseStyle(`position:absolute; right:0; white-space:nowrap; opacity:0; animation:mvL1 ${LOOP} linear infinite;`)}>n = 1</span>
                <span style={parseStyle(`position:absolute; right:0; white-space:nowrap; opacity:0; animation:mvL2 ${LOOP} linear infinite;`)}>n = 1, 3</span>
                <span style={parseStyle(`position:absolute; right:0; white-space:nowrap; opacity:0; animation:mvL3 ${LOOP} linear infinite;`)}>n = 1, 3, 5</span>
                <span style={parseStyle(`position:absolute; right:0; white-space:nowrap; opacity:0; animation:mvL4 ${LOOP} linear infinite;`)}>n = 1, 3, 5, 7</span>
              </span>
              <p style={parseStyle("position:absolute; inset-inline:0; bottom:34px; margin:0; text-align:center; font-family:Georgia, serif; font-style:italic; font-size:13px; color:#71717a;")}>f(t) = 4/π · Σ sin(nt) / n</p>
              <div style={parseStyle("position:absolute; inset-inline:0; bottom:0; display:flex; align-items:center; gap:10px; padding:11px 14px; background:linear-gradient(to top, rgba(0,0,0,0.8), transparent);")}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#e4e4e7">
                  <rect x="5" y="4" width="4.5" height="16" rx="1"></rect>
                  <rect x="14.5" y="4" width="4.5" height="16" rx="1"></rect>
                </svg>
                <div style={parseStyle("flex:1; height:3px; border-radius:2px; background:rgba(255,255,255,0.16); position:relative;")}>
                  <div style={parseStyle(`height:100%; width:0%; border-radius:2px; background:#e4e4e7; animation:mv-scrub ${LOOP} linear infinite;`)}></div>
                  <div style={parseStyle(`position:absolute; top:50%; left:0%; width:8px; height:8px; border-radius:50%; background:#fff; transform:translate(-50%,-50%); animation:mv-scrubdot ${LOOP} linear infinite;`)}></div>
                </div>
                <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:9.5px; color:#a1a1aa;")}>0:12</span>
              </div>
            </div>

            {/* opening title card */}
            <div style={parseStyle(`position:absolute; inset:0; z-index:7; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; background:#0b0b0e; overflow:hidden; animation:mv-open ${LOOP} linear infinite; pointer-events:none;`)}>
              <div style={parseStyle(`position:absolute; inset:-30%; background:radial-gradient(42% 42% at 50% 46%, rgba(126,166,217,0.13) 0%, rgba(11,11,14,0) 70%); opacity:0; animation:mv-open-glow ${LOOP} linear infinite;`)}></div>
              <div style={parseStyle(`position:relative; display:flex; align-items:center; gap:13px; opacity:0; animation:mv-open-mark ${LOOP} linear infinite;`)}>
                <div style={parseStyle("width:44px; height:44px; flex:0 0 auto; border-radius:13px; border:1px solid #3f3f46; display:flex; align-items:center; justify-content:center; background:#0e0e11; box-shadow:0 0 34px rgba(126,166,217,0.12);")}>
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="7" pathLength="100" fill="none" stroke="#e4e4e7" strokeWidth="2" strokeLinecap="round" strokeDasharray="100" transform="rotate(-90 10 10)" style={parseStyle(`animation:mv-open-ring ${LOOP} linear infinite;`)}></circle>
                  </svg>
                </div>
                <span style={parseStyle("font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:32px; letter-spacing:-0.01em; color:#fafafa;")}>Manition</span>
              </div>
            </div>

            {/* outro brand card */}
            <div style={parseStyle(`position:absolute; inset:0; z-index:5; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; background:#09090b; opacity:0; animation:mv-outro ${LOOP} linear infinite; pointer-events:none;`)}>
              <div style={parseStyle(`display:flex; align-items:center; opacity:0; animation:mv-outro-mark ${LOOP} cubic-bezier(.2,.7,.2,1) infinite;`)}>
                <span style={parseStyle("font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:34px; letter-spacing:-0.01em; color:#fafafa;")}>Manition</span>
              </div>
              <p style={parseStyle(`margin:0; font-size:13px; letter-spacing:0.02em; color:#71717a; opacity:0; animation:mv-outro-mark ${LOOP} cubic-bezier(.2,.7,.2,1) infinite; animation-delay:0.35s;`)}>Describe it. We animate it.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
