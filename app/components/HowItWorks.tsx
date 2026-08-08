"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { parseStyle } from "../lib/css";
import GalleryVideo from "./GalleryVideo";

/**
 * "One sentence in, a finished video out." - ported from Home.dc.html.
 *
 * The active step auto-advances every 5.2s (the duration of the bar filling
 * across the top of the active button); clicking a step jumps to it and
 * restarts the cycle. Honours prefers-reduced-motion by not auto-cycling.
 */

const CYCLE_MS = 5200;

const eyebrow =
  "font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#3b62e0; margin:0 0 14px;";
const paneLabel =
  "font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.15em; text-transform:uppercase; color:#5b6070;";
const paneNote = "margin:0; font-size:13px; line-height:1.65; color:#7d8393;";
const chip =
  "font-size:12px; color:#c3c8d4; background:#161a26; border:1px solid #232839; border-radius:100px; padding:5px 11px;";
const meta =
  "display:block; margin-top:3px; font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:#6d7385;";

const STEPS = [
  {
    title: "Describe the scene",
    blurb: "Say what you want to see, the way you would explain it at a whiteboard.",
  },
  {
    title: "Manition animates it",
    blurb: "It writes the scene, keeps the maths honest, and renders it in HD on our GPUs.",
  },
  {
    title: "Take the video",
    blurb: "Download an MP4 or grab a link. It is yours to use anywhere.",
  },
];

const STAGES = ["Scene written", "Rendered on GPU", "Ready"];

const downloadIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v11"></path>
    <path d="M7 11l5 5 5-5"></path>
    <path d="M5 20h14"></path>
  </svg>
);

function Export({
  name,
  detail,
  primary,
}: {
  name: string;
  detail: string;
  primary?: boolean;
}) {
  return (
    <div
      style={parseStyle(
        `display:flex; align-items:center; justify-content:space-between; gap:14px; padding:13px 15px; border-radius:11px; background:${primary ? "#141a2b" : "#0f1117"}; border:1px solid ${primary ? "#2b3352" : "#1c2030"};`,
      )}
    >
      <span style={parseStyle("display:block; min-width:0;")}>
        <span style={parseStyle("display:block; font-size:13.5px; font-weight:600; color:#e8eaef;")}>{name}</span>
        <span style={parseStyle(meta)}>{detail}</span>
      </span>
      <span
        style={parseStyle(
          `flex:none; display:inline-flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600; color:${primary ? "#9fb2f2" : "#8a90a1"};`,
        )}
      >
        {downloadIcon}
        Download
      </span>
    </div>
  );
}

export default function HowItWorks() {
  const [step, setStep] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduce = useRef(false);

  const startCycle = () => {
    if (timer.current) clearInterval(timer.current);
    if (reduce.current) return;
    timer.current = setInterval(() => setStep((s) => (s + 1) % 3), CYCLE_MS);
  };

  useEffect(() => {
    reduce.current =
      typeof window !== "undefined" &&
      !!window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    startCycle();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const jump = (i: number) => {
    startCycle();
    setStep(i);
  };

  const pane = (i: number) =>
    parseStyle(
      `display:${step === i ? "flex" : "none"}; min-height:352px; flex-direction:column; gap:16px; animation:hh-swap .35s cubic-bezier(.22,1,.36,1);`,
    );

  return (
    <section
      id="how"
      style={parseStyle("background:#efece7; border-top:1px solid #e6e2da; border-bottom:1px solid #e6e2da;")}
    >
      <div style={parseStyle("max-width:1200px; margin:0 auto; padding:86px 30px 80px;")}>
        <div style={parseStyle("max-width:640px; margin-bottom:40px;")}>
          <p style={parseStyle(eyebrow)}>How it works</p>
          <h2
            style={parseStyle(
              "margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(27px,4.9vw,38px); letter-spacing:-0.03em; line-height:1.08; color:#16161a;",
            )}
          >
            One sentence in, a finished video out.
          </h2>
          <p style={parseStyle("margin:16px 0 0; font-size:15px; line-height:1.7; color:#6b6b73; max-width:520px;")}>
            Three steps, and only the first one is yours. Follow along, or click a step to see it.
          </p>
        </div>

        <div className="hh-hw" style={parseStyle("display:grid; grid-template-columns:0.84fr 1.16fr; gap:26px; align-items:start;")}>
          {/* ── the steps ── */}
          <div style={parseStyle("display:flex; flex-direction:column; gap:8px;")}>
            {STEPS.map((s, i) => {
              const on = step === i;
              return (
                <button
                  key={s.title}
                  onClick={() => jump(i)}
                  style={parseStyle(
                    `appearance:none; text-align:left; cursor:pointer; display:flex; gap:15px; padding:19px 20px 20px; border-radius:14px; background:${on ? "#ffffff" : "transparent"}; border:1px solid ${on ? "#e6e2da" : "transparent"}; font:inherit; transition:background .25s ease, border-color .25s ease; position:relative; overflow:hidden;`,
                  )}
                >
                  <span
                    style={parseStyle(
                      `position:absolute; left:0; right:0; top:0; height:2px; background:#e6e2da; display:${on ? "block" : "none"};`,
                    )}
                  >
                    <span
                      className="hh-fragbar"
                      style={parseStyle(
                        `position:absolute; inset:0 auto 0 0; width:0%; background:#3b62e0; animation:hh-bar ${CYCLE_MS / 1000}s linear forwards;`,
                      )}
                    ></span>
                  </span>
                  <span
                    style={parseStyle(
                      `flex:none; width:27px; height:27px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-family:'IBM Plex Mono',monospace; font-size:11.5px; font-weight:600; background:${on ? "#eef1fc" : "#e4e0d8"}; color:${on ? "#3b62e0" : "#8b8779"}; transition:background .25s, color .25s;`,
                    )}
                  >
                    0{i + 1}
                  </span>
                  <span style={parseStyle("display:block; min-width:0;")}>
                    <span
                      style={parseStyle(
                        `display:block; font-family:'Space Grotesk'; font-weight:600; font-size:17px; letter-spacing:-0.012em; color:${on ? "#16161a" : "#4b4b52"}; transition:color .25s;`,
                      )}
                    >
                      {s.title}
                    </span>
                    <span style={parseStyle("display:block; margin-top:6px; font-size:13.5px; line-height:1.6; color:#6b6b73;")}>
                      {s.blurb}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── the panel ── */}
          <div
            style={parseStyle(
              "background:#0f1117; border:1px solid #1c2030; border-radius:18px; overflow:hidden; box-shadow:0 38px 70px -50px rgba(15,17,23,0.8);",
            )}
          >
            <div
              style={parseStyle(
                "display:flex; align-items:center; gap:9px; padding:13px 16px; border-bottom:1px solid #1c2030; background:#12141c;",
              )}
            >
              <span style={parseStyle("display:flex; gap:6px;")}>
                <span style={parseStyle("width:9px; height:9px; border-radius:50%; background:#2b303f;")}></span>
                <span style={parseStyle("width:9px; height:9px; border-radius:50%; background:#2b303f;")}></span>
                <span style={parseStyle("width:9px; height:9px; border-radius:50%; background:#2b303f;")}></span>
              </span>
              <span style={parseStyle("margin-left:4px; font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:0.05em; color:#5b6070;")}>
                manition · new scene
              </span>
            </div>

            {/* 01 · the prompt */}
            <div className="hh-hwp" style={{ ...pane(0), padding: "26px 26px 24px" }}>
              <div style={parseStyle(paneLabel)}>Your prompt</div>
              <div
                style={parseStyle(
                  "background:#0a0c11; border:1px solid #232839; border-radius:13px; padding:18px 18px 14px; display:flex; flex-direction:column; gap:16px;",
                )}
              >
                <div style={parseStyle("font-size:15.5px; line-height:1.65; color:#e8eaef;")}>
                  Build a square wave out of spinning circles, then show the first four harmonics adding up.
                  <span
                    style={parseStyle(
                      "display:inline-block; width:7px; height:15px; background:#4d5364; margin-left:3px; vertical-align:-2px; animation:hh-caret 1s step-end infinite;",
                    )}
                  ></span>
                </div>
                <div style={parseStyle("display:flex; align-items:center; justify-content:space-between; gap:12px;")}>
                  <div style={parseStyle("display:flex; gap:7px; flex-wrap:wrap;")}>
                    <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:10px; color:#8a90a1; background:#161a26; border:1px solid #232839; border-radius:100px; padding:5px 10px;")}>
                      1080p
                    </span>
                    <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:10px; color:#8a90a1; background:#161a26; border:1px solid #232839; border-radius:100px; padding:5px 10px;")}>
                      dark
                    </span>
                  </div>
                  <span
                    style={parseStyle(
                      "display:inline-flex; align-items:center; gap:7px; background:#3b62e0; color:#fff; border-radius:9px; padding:9px 15px; font-size:13px; font-weight:600;",
                    )}
                  >
                    Animate
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="M13 6l6 6-6 6"></path>
                    </svg>
                  </span>
                </div>
              </div>
              <p style={parseStyle("margin:auto 0 0; font-size:13px; line-height:1.65; color:#7d8393;")}>
                Plain sentences only. No syntax to remember, no timeline to arrange.
              </p>
            </div>

            {/* 02 · the render */}
            <div className="hh-hwp" style={{ ...pane(1), padding: "22px 22px 20px" }}>
              <div style={parseStyle("display:flex; flex-wrap:wrap; align-items:center; gap:18px;")}>
                {STAGES.map((label, i) => (
                  <div key={label} style={parseStyle("display:flex; align-items:center; gap:9px;")}>
                    <span
                      style={parseStyle(
                        "width:17px; height:17px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#1c2b4f; color:#7f97e8; font-family:'IBM Plex Mono',monospace; font-size:9px;",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span
                      style={parseStyle(
                        "font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#c3c8d4;",
                      )}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={parseStyle(
                  "flex:1; position:relative; border-radius:12px; overflow:hidden; background:#0a0a0d; border:1px solid #1c2030; min-height:232px;",
                )}
              >
                <GalleryVideo scene="fourier" label="Fourier square wave" />
              </div>
              <p style={parseStyle(paneNote)}>
                Real output, not a mock-up - this is the scene that sentence produces.
              </p>
            </div>

            {/* 03 · the export */}
            <div className="hh-hwp" style={{ ...pane(2), padding: "26px 26px 24px" }}>
              <div style={parseStyle(paneLabel)}>Export</div>
              <div style={parseStyle("display:flex; flex-direction:column; gap:9px;")}>
                <Export name="MP4 · 1080p" detail="0:14 · 4.2 MB · 60 fps" primary />
                <Export name="MP4 · 4K" detail="0:14 · 18.6 MB · 60 fps" />
                <Export name="WebM · transparent" detail="0:14 · 6.1 MB · alpha" />
              </div>
              <div
                style={parseStyle(
                  "margin-top:auto; padding-top:16px; border-top:1px solid #1b1f2c; display:flex; flex-wrap:wrap; align-items:center; gap:9px;",
                )}
              >
                <span style={parseStyle("font-size:12.5px; color:#7d8393; margin-right:2px;")}>Drops straight into</span>
                <span style={parseStyle(chip)}>slides</span>
                <span style={parseStyle(chip)}>your video editor</span>
                <span style={parseStyle(chip)}>a post</span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={parseStyle(
            "margin-top:22px; background:#fff; border:1px solid #e6e2da; border-radius:16px; padding:20px 24px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:14px;",
          )}
        >
          <p style={parseStyle("margin:0; font-size:14px; line-height:1.6; color:#6b6b73; max-width:640px;")}>
            <strong style={parseStyle("color:#16161a; font-weight:600;")}>Know Python?</strong> Every scene ships with
            its Manim source - open it, change a value, re-render. Ignorable if that is not you.
          </p>
          <Link
            href="/features"
            style={parseStyle(
              "display:inline-flex; align-items:center; gap:7px; text-decoration:none; font-size:14px; font-weight:600; color:#16161a; flex:none;",
            )}
          >
            See what is under the hood
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M13 6l6 6-6 6"></path>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
