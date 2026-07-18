"use client";

import { useEffect, useRef, useState } from "react";
import { parseStyle } from "../lib/css";

/**
 * The auto-playing "studio walkthrough" from Features.dc.html - four tabs
 * (Describe / Generate / Render / Watch & keep), each with a description panel
 * and a matching stage visual. Advances every 6s, pauses while hovered, and
 * jumps when a tab is clicked.
 */

type Step = {
  label: string;
  accent: string;
  title: string;
  desc: string;
  points: string[];
};

const STEPS: Step[] = [
  {
    label: "Describe",
    accent: "#a78bfa",
    title: "Say it in plain language.",
    desc: "No syntax to memorize, no timeline to scrub. Describe the concept the way you'd explain it out loud, and Manition maps it to the right geometry, motion and pacing.",
    points: [
      "Follow-ups understood in context",
      "Works for geometry, calculus, algebra & more",
      "Suggests refinements when a prompt is vague",
    ],
  },
  {
    label: "Generate",
    accent: "#7f97e8",
    title: "Real Manim, never a black box.",
    desc: "Under the hood, every scene is genuine Manim - the open-source Python library for programmatic math animation. Open any scene in the built-in code editor, change a constant, and re-render in place.",
    points: [
      "Full source for every render",
      "Built-in editor - tweak the code and re-render, no re-prompting",
      "Export .py to keep or version-control",
    ],
  },
  {
    label: "Render",
    accent: "#e0b45f",
    title: "Cloud GPUs do the heavy lifting.",
    desc: "No local install, no Python environment, no waiting on your laptop's fans. Scenes render on our GPUs and stream a live preview while they work.",
    points: [
      "1080p and 4K output",
      "Transparent backgrounds for overlays",
      "Runs the same on a phone or a Chromebook",
    ],
  },
  {
    label: "Watch & keep",
    accent: "#7fd79c",
    title: "Preview, refine, and build a library.",
    desc: "Watch instantly, ask for changes in chat, then download the MP4. Every scene you make is saved, searchable and ready to re-render.",
    points: [
      "One-click MP4 download",
      "Searchable personal library",
      "Re-render any past scene at higher quality",
    ],
  },
];

const stageWrap = "width:min(430px,100%);";

export default function FeaturesStudio() {
  const [step, setStep] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!paused.current) setStep((s) => (s + 1) % 4);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const cur = STEPS[step];

  return (
    <section style={parseStyle("max-width:1180px; margin:0 auto; padding:0 30px 30px;")}>
      <div
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
        style={parseStyle(
          "background:#0c0c0f; border:1px solid #1f1f26; border-radius:22px; overflow:hidden; box-shadow:0 34px 70px -46px rgba(12,12,15,0.6);",
        )}
      >
        {/* tabs */}
        <div style={parseStyle("display:flex; border-bottom:1px solid #1f1f26;")}>
          {STEPS.map((s, k) => {
            const on = k === step;
            return (
              <button
                key={s.label}
                onClick={() => setStep(k)}
                style={parseStyle(
                  `appearance:none; background:none; border:0; border-right:${k < 3 ? "1px solid #1f1f26" : "0"}; flex:1; min-width:0; display:flex; align-items:center; justify-content:center; gap:10px; padding:17px 12px; cursor:pointer; position:relative; transition:background .15s;`,
                )}
              >
                <span style={parseStyle(`font-family:'IBM Plex Mono',monospace; font-size:12px; color:${on ? s.accent : "#3f3f46"}; transition:color .2s;`)}>
                  {"0" + (k + 1)}
                </span>
                <span
                  className="ft-lb"
                  style={parseStyle(`font-family:'Space Grotesk'; font-weight:600; font-size:14.5px; letter-spacing:-0.01em; color:${on ? "#f4f4f5" : "#55555d"}; transition:color .2s; white-space:nowrap;`)}
                >
                  {s.label}
                </span>
                <span style={parseStyle(`position:absolute; left:0; right:0; bottom:-1px; height:2px; background:${on ? s.accent : "transparent"}; transition:background .2s;`)}></span>
              </button>
            );
          })}
        </div>

        {/* body */}
        <div className="ft-body" style={parseStyle("display:grid; grid-template-columns:0.95fr 1.05fr;")}>
          <div style={parseStyle("padding:42px 40px; display:flex; flex-direction:column; justify-content:center;")}>
            <p style={parseStyle(`margin:0 0 12px; font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:${cur.accent};`)}>
              {"Step 0" + (step + 1)}
            </p>
            <h2 style={parseStyle("margin:0 0 14px; font-family:'Space Grotesk'; font-weight:700; font-size:30px; letter-spacing:-0.02em; line-height:1.1; color:#f4f4f5;")}>
              {cur.title}
            </h2>
            <p style={parseStyle("margin:0 0 22px; font-size:15px; line-height:1.65; color:#9aa0ad;")}>{cur.desc}</p>
            <div style={parseStyle("display:flex; flex-direction:column; gap:11px;")}>
              {cur.points.map((pt) => (
                <div key={pt} style={parseStyle("display:flex; align-items:flex-start; gap:11px; font-size:14px; line-height:1.55; color:#c8c8cc;")}>
                  <span style={parseStyle(`flex:none; margin-top:6px; width:5px; height:5px; border-radius:50%; background:${cur.accent};`)}></span>
                  {pt}
                </div>
              ))}
            </div>
          </div>

          <div
            className="ft-stage"
            style={parseStyle(
              "position:relative; border-left:1px solid #1f1f26; background:radial-gradient(560px 320px at 60% 30%, #13131b, #0a0a0d); min-height:420px; display:flex; align-items:center; justify-content:center; padding:34px;",
            )}
          >
            {step === 0 && (
              <div style={parseStyle(`${stageWrap} display:flex; flex-direction:column; gap:10px; animation:ftIn .4s ease both;`)}>
                <div style={parseStyle("align-self:flex-end; max-width:88%; background:#1f1f24; border:1px solid #2c2c33; border-radius:12px 12px 3px 12px; padding:10px 14px; font-size:13px; color:#e4e4e7;")}>
                  Show how a Fourier series builds a square wave, step by step
                </div>
                <div style={parseStyle("align-self:flex-start; max-width:88%; background:#141418; border:1px solid #26262c; border-radius:12px 12px 12px 3px; padding:10px 14px; font-size:13px; color:#a1a1aa;")}>
                  Building a 12-second scene adding harmonics n = 1, 3, 5, 7…
                </div>
                <div style={parseStyle("display:flex; align-items:center; gap:9px; background:#141418; border:1px solid #26262c; border-radius:12px; padding:9px 9px 9px 14px; margin-top:4px;")}>
                  <span style={parseStyle("flex:1; font-size:12.5px; color:#4b4b52;")}>Label the axes…</span>
                  <span style={parseStyle("width:28px; height:28px; border-radius:8px; background:#3b62e0; display:flex; align-items:center; justify-content:center; color:#fff;")}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"></path><path d="M6 11l6-6 6 6"></path></svg>
                  </span>
                </div>
              </div>
            )}

            {step === 1 && (
              <div style={parseStyle(`${stageWrap} background:#0a0c11; border:1px solid #262c3a; border-radius:13px; overflow:hidden; animation:ftIn .4s ease both;`)}>
                <div style={parseStyle("display:flex; align-items:center; gap:8px; padding:9px 14px; background:#10131b; border-bottom:1px solid #262c3a;")}>
                  <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#71717a;")}>scene.py</span>
                  <div style={parseStyle("flex:1;")}></div>
                  <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:10px; color:#8fc9a0;")}>✓ editable</span>
                </div>
                <pre style={parseStyle("margin:0; padding:16px; font-family:'IBM Plex Mono',monospace; font-size:12px; line-height:1.85; color:#c9c9d0;")}>
                  <span style={parseStyle("color:#8f7ab8;")}>from</span>{" manim "}
                  <span style={parseStyle("color:#8f7ab8;")}>import</span>{" *\n\n"}
                  <span style={parseStyle("color:#8f7ab8;")}>class</span>{" "}
                  <span style={parseStyle("color:#c9a86b;")}>SquareWave</span>{"(Scene):\n    "}
                  <span style={parseStyle("color:#8f7ab8;")}>def</span>{" "}
                  <span style={parseStyle("color:#7ea6d9;")}>construct</span>{"(self):\n        axes = Axes(x_range=[-"}
                  <span style={parseStyle("color:#6bb894;")}>4</span>{", "}
                  <span style={parseStyle("color:#6bb894;")}>4</span>{"])\n        wave = axes.plot(fourier_sq)\n        self.play("}
                  <span style={parseStyle("color:#e0a86a;")}>Create</span>{"(wave))"}
                </pre>
              </div>
            )}

            {step === 2 && (
              <div style={parseStyle(`${stageWrap} background:#0a0c11; border:1px solid #262c3a; border-radius:13px; padding:22px; display:flex; flex-direction:column; gap:14px; animation:ftIn .4s ease both;`)}>
                <div style={parseStyle("display:flex; align-items:center; justify-content:space-between;")}>
                  <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#a1a1aa;")}>Rendering · 1080p60</span>
                  <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#5b5b63;")}>00:09 / 00:12</span>
                </div>
                <div style={parseStyle("height:8px; border-radius:6px; background:#1c1c22; overflow:hidden;")}>
                  <div style={parseStyle("height:100%; width:74%; border-radius:6px; background:linear-gradient(90deg,#c2913a,#e0b45f);")}></div>
                </div>
                <div style={parseStyle("display:grid; grid-template-columns:repeat(4,1fr); gap:9px;")}>
                  <div style={parseStyle("aspect-ratio:16/10; border-radius:7px; background:#15151b; border:1px solid #23232a; display:flex; align-items:center; justify-content:center;")}>
                    <svg width="30" height="20" viewBox="0 0 30 20" fill="none" stroke="#7ea6d9" strokeWidth="1.6"><path d="M2 10 Q 8 2 15 10 T 28 10"></path></svg>
                  </div>
                  <div style={parseStyle("aspect-ratio:16/10; border-radius:7px; background:#15151b; border:1px solid #23232a; display:flex; align-items:center; justify-content:center;")}>
                    <svg width="26" height="20" viewBox="0 0 26 20" fill="none" stroke="#c2913a" strokeWidth="1.6"><circle cx="9" cy="10" r="6"></circle><path d="M9 10 L15 6"></path></svg>
                  </div>
                  <div style={parseStyle("aspect-ratio:16/10; border-radius:7px; background:#15151b; border:1px solid #23232a; display:flex; align-items:center; justify-content:center;")}>
                    <svg width="28" height="20" viewBox="0 0 28 20" fill="none" stroke="#5fbf7e" strokeWidth="1.6"><path d="M3 17 L11 8 L17 13 L25 3"></path></svg>
                  </div>
                  <div style={parseStyle("aspect-ratio:16/10; border-radius:7px; background:#15151b; border:1px solid #23232a; display:flex; align-items:center; justify-content:center; color:#3f3f46;")}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"></circle></svg>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={parseStyle(`${stageWrap} background:#0a0c11; border:1px solid #262c3a; border-radius:13px; overflow:hidden; animation:ftIn .4s ease both;`)}>
                <div style={parseStyle("aspect-ratio:16/9; background:radial-gradient(circle at 50% 45%,#141420,#0a0a0d); display:flex; align-items:center; justify-content:center; position:relative;")}>
                  <svg width="200" height="100" viewBox="0 0 180 90" fill="none"><path d="M6 45 Q 28 6 51 45 T 96 45 T 141 45 T 186 45" stroke="#7ea6d9" strokeWidth="2.4"></path></svg>
                  <span style={parseStyle("position:absolute; bottom:9px; left:11px; font-family:'IBM Plex Mono',monospace; font-size:9px; color:#8a8a92; background:rgba(0,0,0,0.5); padding:3px 6px; border-radius:5px;")}>fourier_square.mp4</span>
                </div>
                <div style={parseStyle("display:flex; align-items:center; gap:10px; padding:11px 14px; border-top:1px solid #1f1f26;")}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#e4e4e7"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
                  <div style={parseStyle("flex:1; height:4px; border-radius:3px; background:#26262c;")}>
                    <div style={parseStyle("width:40%; height:100%; border-radius:3px; background:#e4e4e7;")}></div>
                  </div>
                  <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:10px; color:#8a8a92;")}>0:12</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <p style={parseStyle("margin:14px 4px 0; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#a6a29a;")}>
        Plays automatically · hover to pause · click a step to jump
      </p>
    </section>
  );
}
