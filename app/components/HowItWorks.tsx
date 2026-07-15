"use client";

import { useEffect, useRef } from "react";
import { parseStyle } from "../lib/css";

const numStyle =
  "font-family:'Space Grotesk'; font-weight:700; font-size:92px; line-height:0.8; letter-spacing:-0.04em; color:transparent; -webkit-text-stroke:1.4px #d5cfc2; margin:0 0 -28px -2px; user-select:none;";
const bodyStyle = "position:relative; width:100%; display:flex; flex-direction:column;";
const titleRow = "display:flex; align-items:center; gap:8px; margin:16px 0 8px;";
const stepH3 =
  "margin:0; font-family:'Space Grotesk'; font-weight:600; font-size:18px; letter-spacing:-0.01em; color:#16161a;";
const stepP = "margin:0; font-size:13.5px; line-height:1.6; color:#6b6b73;";
const visShell = "position:relative; width:100%; height:130px; border-radius:14px; overflow:hidden;";

export default function HowItWorks() {
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = stepsRef.current;
    if (!root) return;
    const steps = Array.from(root.querySelectorAll<HTMLElement>(".hh-step"));
    const bodies = steps.map((s) => s.querySelector<HTMLElement>(".hh-body"));
    const thresholds = [0.02, 0.34, 0.64, 0.9];
    const active = [false, false, false, false];
    const setPlaying = (step: HTMLElement, playing: boolean) => {
      step.querySelectorAll<HTMLElement>("*").forEach((el) => {
        const n = getComputedStyle(el).animationName;
        if (n && n !== "none") el.style.animationPlayState = playing ? "running" : "paused";
      });
    };
    const reduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      steps.forEach((s) => {
        s.style.opacity = "1";
      });
      return;
    }
    steps.forEach((s, i) => {
      s.style.opacity = "0";
      s.style.transition = "opacity .5s ease";
      const b = bodies[i];
      if (b) {
        b.style.transform = "translateY(20px)";
        b.style.transition = "transform .55s cubic-bezier(.22,1,.36,1)";
      }
      setPlaying(s, false);
    });
    const update = () => {
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const start = vh * 0.85,
        end = vh * 0.4;
      let p = (start - rect.top) / (start - end);
      p = Math.max(0, Math.min(1, p));
      steps.forEach((s, i) => {
        const local = Math.max(0, Math.min(1, (p - i * 0.1) / 0.28));
        s.style.opacity = String(local);
        const b = bodies[i];
        if (b) b.style.transform = "translateY(" + (1 - local) * 20 + "px)";
        const on = p >= thresholds[i];
        if (on !== active[i]) {
          active[i] = on;
          setPlaying(s, on);
        }
      });
    };
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section id="how" style={parseStyle("background:#efece7; border-top:1px solid #e6e2da; border-bottom:1px solid #e6e2da;")}>
      <div style={parseStyle("max-width:1200px; margin:0 auto; padding:78px 30px;")}>
        <div style={parseStyle("display:flex; flex-wrap:wrap; align-items:flex-end; justify-content:space-between; gap:18px; margin-bottom:54px;")}>
          <div style={parseStyle("max-width:640px;")}>
            <p style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#3b62e0; margin:0 0 14px;")}>
              How it works
            </p>
            <h2 style={parseStyle("margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:38px; letter-spacing:-0.03em; line-height:1.08; color:#16161a;")}>
              From a sentence to a rendered scene.
            </h2>
          </div>
        </div>
        <div ref={stepsRef} style={parseStyle("position:relative; padding-top:2px;")}>
          <svg
            className="hh-pipe"
            aria-hidden="true"
            style={parseStyle("position:absolute; inset:0; width:100%; height:100%; z-index:1; pointer-events:none;")}
            viewBox="0 0 1200 330"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M155 42 C 300 42 310 70 455 70 C 600 70 610 98 755 98 C 900 98 910 126 1055 126"
              stroke="#cfc9bc"
              strokeWidth="1.6"
              strokeDasharray="7 8"
              style={parseStyle("animation:hh-dash 10s linear infinite;")}
            ></path>
          </svg>
          <div className="hh-2col" style={parseStyle("display:grid; grid-template-columns:repeat(4,1fr); gap:0; position:relative; z-index:2;")}>
            {/* STEP 01 · Describe */}
            <div className="hh-step" style={parseStyle("position:relative; z-index:2; display:flex; flex-direction:column; padding:0 14px;")}>
              <div style={parseStyle(numStyle)}>01</div>
              <div className="hh-body" style={parseStyle(bodyStyle)}>
                <div style={parseStyle(`${visShell} border:1px solid #e6e2da; box-shadow:0 8px 20px -14px rgba(22,22,26,0.3);`)}>
                  <div style={parseStyle("position:absolute; inset:0; padding:15px; display:flex; flex-direction:column; justify-content:center; gap:10px; background:linear-gradient(180deg,#faf9f6,#f1eee9);")}>
                    <div style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:0.16em; color:#a6a29a; text-transform:uppercase;")}>Your prompt</div>
                    <div style={parseStyle("display:flex; align-items:center; gap:5px; background:#fff; border:1px solid #e6e2da; border-radius:9px; padding:9px 11px; box-shadow:0 1px 2px rgba(0,0,0,0.04);")}>
                      <span style={parseStyle("display:inline-block; overflow:hidden; white-space:nowrap; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#2a2a30; animation:hh-type 3.6s steps(21,end) infinite; animation-play-state:paused;")}>sine wave to a circle</span>
                      <span style={parseStyle("flex:none; width:1.5px; height:13px; background:#5b46d9; animation:hh-caret 0.9s step-end infinite; animation-play-state:paused;")}></span>
                    </div>
                  </div>
                </div>
                <div style={parseStyle(`${titleRow} color:#5b46d9;`)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                  <h3 style={parseStyle(stepH3)}>Describe</h3>
                </div>
                <p style={parseStyle(stepP)}>Type what you want to see - “a Fourier series building a square wave.” Plain English is the only syntax.</p>
              </div>
            </div>

            {/* STEP 02 · Generate */}
            <div className="hh-step" style={parseStyle("position:relative; z-index:2; display:flex; flex-direction:column; padding:0 14px; margin-top:28px;")}>
              <div style={parseStyle(numStyle)}>02</div>
              <div className="hh-body" style={parseStyle(bodyStyle)}>
                <div style={parseStyle(`${visShell} border:1px solid #1c2030; box-shadow:0 8px 20px -14px rgba(22,22,26,0.35);`)}>
                  <div style={parseStyle("position:absolute; inset:0; padding:14px 15px; background:#0f1117; display:flex; flex-direction:column; gap:5px; justify-content:center; font-family:'IBM Plex Mono',monospace; font-size:10px; line-height:1.35; color:#cfd3dc;")}>
                    <div style={parseStyle("white-space:nowrap; opacity:0; animation:hh-line 3s ease infinite; animation-delay:0s; animation-play-state:paused;")}><span style={parseStyle("color:#c98fff;")}>class</span> Sine(<span style={parseStyle("color:#6cc7ff;")}>Scene</span>):</div>
                    <div style={parseStyle("white-space:nowrap; opacity:0; animation:hh-line 3s ease infinite; animation-delay:.22s; animation-play-state:paused;")}>&nbsp;&nbsp;<span style={parseStyle("color:#c98fff;")}>def</span> construct(<span style={parseStyle("color:#e88fb0;")}>self</span>):</div>
                    <div style={parseStyle("white-space:nowrap; opacity:0; animation:hh-line 3s ease infinite; animation-delay:.44s; animation-play-state:paused;")}>&nbsp;&nbsp;&nbsp;&nbsp;ax = <span style={parseStyle("color:#ffcf6c;")}>Axes</span>()</div>
                    <div style={parseStyle("white-space:nowrap; opacity:0; animation:hh-line 3s ease infinite; animation-delay:.66s; animation-play-state:paused;")}>&nbsp;&nbsp;&nbsp;&nbsp;self.play(<span style={parseStyle("color:#ffcf6c;")}>Create</span>(ax))</div>
                  </div>
                </div>
                <div style={parseStyle(`${titleRow} color:#3b62e0;`)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                  <h3 style={parseStyle(stepH3)}>Generate</h3>
                </div>
                <p style={parseStyle(stepP)}>Manition writes real, editable Manim code for the scene, generated straight from your description.</p>
              </div>
            </div>

            {/* STEP 03 · Render */}
            <div className="hh-step" style={parseStyle("position:relative; z-index:2; display:flex; flex-direction:column; padding:0 14px; margin-top:56px;")}>
              <div style={parseStyle(numStyle)}>03</div>
              <div className="hh-body" style={parseStyle(bodyStyle)}>
                <div style={parseStyle(`${visShell} border:1px solid #e6e2da; box-shadow:0 8px 20px -14px rgba(22,22,26,0.3);`)}>
                  <div style={parseStyle("position:absolute; inset:0; padding:15px; background:linear-gradient(180deg,#faf9f6,#f1eee9); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px;")}>
                    <div style={parseStyle("width:30px; height:30px; border-radius:50%; border:3px solid #ece3cf; border-top-color:#c2913a; animation:hh-spin 0.9s linear infinite; animation-play-state:paused;")}></div>
                    <div style={parseStyle("width:100%;")}>
                      <div style={parseStyle("display:flex; justify-content:space-between; font-family:'IBM Plex Mono',monospace; font-size:9px; color:#8a8a82; margin-bottom:6px;")}><span>Rendering scene</span><span>1080p</span></div>
                      <div style={parseStyle("height:6px; background:#e6e2da; border-radius:4px; overflow:hidden;")}><div style={parseStyle("height:100%; width:0%; background:linear-gradient(90deg,#e0b45f,#c2913a); border-radius:4px; animation:hh-prog 2.8s ease-out infinite; animation-play-state:paused;")}></div></div>
                    </div>
                  </div>
                </div>
                <div style={parseStyle(`${titleRow} color:#c2913a;`)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="m4.9 4.9 2.8 2.8"></path><path d="m16.3 16.3 2.8 2.8"></path><path d="M2 12h4"></path><path d="M18 12h4"></path></svg>
                  <h3 style={parseStyle(stepH3)}>Render</h3>
                </div>
                <p style={parseStyle(stepP)}>Cloud GPUs render the scene to crisp 1080p or 4K. No installs, no dependencies, no waiting on your laptop.</p>
              </div>
            </div>

            {/* STEP 04 · Watch */}
            <div className="hh-step" style={parseStyle("position:relative; z-index:2; display:flex; flex-direction:column; padding:0 14px; margin-top:84px;")}>
              <div style={parseStyle(numStyle)}>04</div>
              <div className="hh-body" style={parseStyle(bodyStyle)}>
                <div style={parseStyle(`${visShell} border:1px solid #10140f; box-shadow:0 8px 20px -14px rgba(22,22,26,0.35);`)}>
                  <div style={parseStyle("position:absolute; inset:0; display:flex; flex-direction:column;")}>
                    <div style={parseStyle("flex:1; position:relative; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at 50% 42%, #21402a, #0f140f);")}>
                      <div style={parseStyle("width:38px; height:38px; border-radius:50%; background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.28); display:flex; align-items:center; justify-content:center;")}><svg width="14" height="14" viewBox="0 0 24 24" fill="#eafff0" style={parseStyle("margin-left:2px;")}><polygon points="6 4 20 12 6 20 6 4"></polygon></svg></div>
                    </div>
                    <div style={parseStyle("display:flex; align-items:center; gap:8px; padding:8px 11px; background:#0b0f0b;")}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#7fd79c"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
                      <div style={parseStyle("flex:1; height:4px; background:rgba(255,255,255,0.16); border-radius:3px; overflow:hidden;")}><div style={parseStyle("height:100%; width:0%; background:#5fcf86; border-radius:3px; animation:hh-scrub 3.4s linear infinite; animation-play-state:paused;")}></div></div>
                      <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:9px; color:#9fb7a5;")}>0:12</span>
                    </div>
                  </div>
                </div>
                <div style={parseStyle(`${titleRow} color:#2f7a4a;`)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="14" height="14" rx="2"></rect><polygon points="22 7 16 12 22 17"></polygon></svg>
                  <h3 style={parseStyle(stepH3)}>Watch</h3>
                </div>
                <p style={parseStyle(stepP)}>Preview instantly, refine in chat, then export the MP4. Every scene stays saved in your library.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
