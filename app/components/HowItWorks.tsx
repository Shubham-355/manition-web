"use client";

import { useEffect, useRef, useState } from "react";
import { parseStyle } from "../lib/css";

/**
 * "Every word is an instruction." - ported from Home.dc.html.
 *
 * A single prompt is broken into four clickable fragments. One is active at a
 * time: its word lights up, an underline bar fills, and a matching code+canvas
 * panel is shown. The active fragment auto-advances every 4.6s (the bar's
 * duration); clicking a word jumps to it and restarts the cycle. Honours
 * prefers-reduced-motion by not auto-cycling (the CSS also freezes the
 * per-panel animations).
 */

const FRAGMENTS = [
  { label: "unit circle", underline: "#c3cef2", bar: "#3b62e0", accent: "#3b62e0" },
  { label: "generating sin(x)", underline: "#cfc5f0", bar: "#5b46d9", accent: "#5b46d9" },
  { label: "slowly", underline: "#e6d3a3", bar: "#a8862e", accent: "#a8862e" },
  { label: "trace the wave", underline: "#bcdcc6", bar: "#2f7a4a", accent: "#2f7a4a" },
];

const CYCLE_MS = 4600;

// shared panel chrome
const panelBase =
  "flex-direction:column; background:#0f1117; border:1px solid #1c2030; border-radius:18px; padding:24px 26px; box-shadow:0 24px 48px -30px rgba(15,17,23,0.6); animation:hh-swap .4s cubic-bezier(.22,1,.36,1);";
const badgeRow =
  "display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:14px;";
const counter = "font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:#5b5b63;";
const paraStyle = "margin:0 0 14px; font-size:14px; line-height:1.6; color:#9aa0ad;";
const strong = "color:#e8e8ea; font-weight:600;";
const codeBox =
  "background:#0a0c11; border:1px solid #1c2030; border-radius:12px; padding:11px 14px; margin-bottom:14px; font-family:'IBM Plex Mono',monospace; font-size:11.5px; line-height:1.8; color:#cfd3dc; overflow:hidden;";
const canvasBox =
  "background:#0a0c11; border:1px solid #1c2030; border-radius:12px; padding:10px 12px;";
const codeCaret =
  "display:inline-block; width:6px; height:12px; background:#5b6070; margin-left:6px; animation:hh-caret 1s step-end infinite;";

function badge(color: string, bg: string) {
  return parseStyle(
    `font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:0.1em; text-transform:uppercase; color:${color}; background:${bg}; border-radius:100px; padding:5px 11px;`,
  );
}

export default function HowItWorks() {
  const [frag, setFrag] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduce = useRef(false);

  const startCycle = () => {
    if (timer.current) clearInterval(timer.current);
    if (reduce.current) return;
    timer.current = setInterval(() => setFrag((f) => (f + 1) % 4), CYCLE_MS);
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
    setFrag(i);
  };

  const panel = (i: number) =>
    parseStyle(`display:${frag === i ? "flex" : "none"}; ${panelBase}`);

  return (
    <section
      id="how"
      style={parseStyle(
        "background:#efece7; border-top:1px solid #e6e2da; border-bottom:1px solid #e6e2da;",
      )}
    >
      <div style={parseStyle("max-width:1200px; margin:0 auto; padding:82px 30px 72px;")}>
        <div
          style={parseStyle(
            "display:flex; flex-wrap:wrap; align-items:flex-end; justify-content:space-between; gap:18px; margin-bottom:52px;",
          )}
        >
          <div style={parseStyle("max-width:520px;")}>
            <p
              style={parseStyle(
                "font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#3b62e0; margin:0 0 14px;",
              )}
            >
              How it works
            </p>
            <h2
              style={parseStyle(
                "margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:38px; letter-spacing:-0.03em; line-height:1.08; color:#16161a;",
              )}
            >
              Every word is an instruction.
            </h2>
          </div>
          <p style={parseStyle("margin:0; max-width:420px; font-size:14.5px; line-height:1.65; color:#6b6b73;")}>
            You describe a scene, Manition writes real Manim code, cloud GPUs render the MP4. The
            magic is the middle step - here it is, word by word.{" "}
            <strong style={parseStyle("color:#16161a; font-weight:600;")}>Click any highlighted word.</strong>
          </p>
        </div>

        <div
          className="hh-how"
          style={parseStyle("display:grid; grid-template-columns:1.05fr 0.95fr; gap:60px; align-items:center;")}
        >
          {/* ── the prompt ── */}
          <div>
            <div
              style={parseStyle(
                "font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:#a6a29a; margin-bottom:24px; display:flex; align-items:center; gap:9px;",
              )}
            >
              <span style={parseStyle("width:7px; height:7px; border-radius:50%; background:#3b62e0; flex:none;")}></span>
              One prompt, as Manition reads it
            </div>
            <div
              className="hh-prompt"
              style={parseStyle(
                "font-family:'Space Grotesk'; font-weight:700; font-size:42px; letter-spacing:-0.025em; line-height:1.5; color:#b6afa0;",
              )}
            >
              Show a{" "}
              <FragWord index={0} active={frag === 0} onClick={jump} />{" "}
              <FragWord index={1} active={frag === 1} onClick={jump} />,{" "}
              <FragWord index={2} active={frag === 2} onClick={jump} /> - then{" "}
              <FragWord index={3} active={frag === 3} onClick={jump} />.
              <span
                style={parseStyle(
                  "display:inline-block; width:3px; height:0.68em; background:#16161a; margin-left:9px; animation:hh-caret 1.05s step-end infinite;",
                )}
              ></span>
            </div>
            <p style={parseStyle("margin:28px 0 0; font-size:14px; line-height:1.65; color:#8a8579; max-width:430px;")}>
              The dim words are grammar. The highlighted ones are decisions - each one becomes the
              code and the canvas on the right.
            </p>
          </div>

          {/* ── the panels ── */}
          <div>
            <div style={parseStyle("min-height:478px; display:flex; flex-direction:column; justify-content:flex-start;")}>
              {/* 01 · Nouns → objects */}
              <div style={panel(0)}>
                <div style={parseStyle(badgeRow)}>
                  <span style={badge("#7f97e8", "#1c2233")}>Nouns → objects</span>
                  <span style={parseStyle(counter)}>01 / 04</span>
                </div>
                <p style={parseStyle(paraStyle)}>
                  <strong style={parseStyle(strong)}>&ldquo;unit circle&rdquo;</strong> becomes real
                  geometry - an actual circle with a radius and center Manition can measure, spin,
                  and build on. Not clip-art.
                </p>
                <div style={parseStyle(codeBox)}>
                  <div className="hh-codeline" style={parseStyle("white-space:nowrap; animation:hh-code .5s steps(18,end) .1s both;")}>
                    circle = <span style={parseStyle("color:#ffcf6c;")}>Circle</span>(radius=<span style={parseStyle("color:#5fcf86;")}>1</span>)
                  </div>
                  <div className="hh-codeline" style={parseStyle("white-space:nowrap; animation:hh-code .6s steps(24,end) .4s both;")}>
                    dot = <span style={parseStyle("color:#ffcf6c;")}>Dot</span>(circle.point_at_angle(<span style={parseStyle("color:#5fcf86;")}>0</span>))
                    <span style={parseStyle(codeCaret)}></span>
                  </div>
                </div>
                <div style={parseStyle(canvasBox)}>
                  <svg viewBox="0 0 320 120" style={parseStyle("width:100%; height:auto; display:block;")}>
                    <line x1="90" y1="10" x2="90" y2="110" stroke="#232839" strokeWidth="1"></line>
                    <line x1="28" y1="60" x2="152" y2="60" stroke="#232839" strokeWidth="1"></line>
                    <circle className="hh-anim" cx="90" cy="60" r="38" fill="none" stroke="#7f97e8" strokeWidth="2.5" style={parseStyle("stroke-dasharray:240; stroke-dashoffset:240; animation:hh-draw 1.1s cubic-bezier(.4,0,.2,1) .55s forwards;")}></circle>
                    <line className="hh-anim" x1="90" y1="60" x2="128" y2="60" stroke="#ffcf6c" strokeWidth="2" style={parseStyle("stroke-dasharray:38; stroke-dashoffset:38; animation:hh-draw .35s ease 1.65s forwards;")}></line>
                    <circle className="hh-anim" cx="128" cy="60" r="4.5" fill="#ffcf6c" style={parseStyle("opacity:0; animation:hh-fadein .3s ease 1.95s forwards;")}></circle>
                    <text className="hh-anim" x="98" y="50" fontFamily="IBM Plex Mono,monospace" fontSize="11" fill="#ffcf6c" style={parseStyle("opacity:0; animation:hh-fadein .3s ease 1.95s forwards;")}>r = 1</text>
                    <text className="hh-anim" x="176" y="64" fontFamily="IBM Plex Mono,monospace" fontSize="11" fill="#5b6070" style={parseStyle("opacity:0; animation:hh-fadein .4s ease 2.2s forwards;")}>← real geometry</text>
                  </svg>
                </div>
              </div>

              {/* 02 · Math → plotted */}
              <div style={panel(1)}>
                <div style={parseStyle(badgeRow)}>
                  <span style={badge("#a78bfa", "#241f38")}>Math → plotted</span>
                  <span style={parseStyle(counter)}>02 / 04</span>
                </div>
                <p style={parseStyle(paraStyle)}>
                  <strong style={parseStyle(strong)}>&ldquo;generating sin(x)&rdquo;</strong> is
                  computed, not drawn by hand - the curve is plotted point by point on real axes,
                  exactly like the math says.
                </p>
                <div style={parseStyle(codeBox)}>
                  <div className="hh-codeline" style={parseStyle("white-space:nowrap; animation:hh-code .5s steps(20,end) .1s both;")}>
                    ax = <span style={parseStyle("color:#ffcf6c;")}>Axes</span>(x_range=[<span style={parseStyle("color:#5fcf86;")}>0</span>, <span style={parseStyle("color:#6cc7ff;")}>TAU</span>])
                  </div>
                  <div className="hh-codeline" style={parseStyle("white-space:nowrap; animation:hh-code .6s steps(18,end) .4s both;")}>
                    wave = ax.plot(np.sin)
                    <span style={parseStyle(codeCaret)}></span>
                  </div>
                </div>
                <div style={parseStyle(canvasBox)}>
                  <svg viewBox="0 0 320 120" style={parseStyle("width:100%; height:auto; display:block;")}>
                    <line className="hh-anim" x1="24" y1="100" x2="300" y2="100" stroke="#3a4157" strokeWidth="1.5" style={parseStyle("opacity:0; animation:hh-fadein .4s ease .5s forwards;")}></line>
                    <line className="hh-anim" x1="30" y1="12" x2="30" y2="106" stroke="#3a4157" strokeWidth="1.5" style={parseStyle("opacity:0; animation:hh-fadein .4s ease .5s forwards;")}></line>
                    <path className="hh-anim" d="M30,60 Q62.5,10 95,60 T160,60 T225,60 T290,60" fill="none" stroke="#a78bfa" strokeWidth="2.5" style={parseStyle("stroke-dasharray:312; stroke-dashoffset:312; animation:hh-draw 1.7s cubic-bezier(.3,0,.2,1) .85s forwards;")}></path>
                    <text className="hh-anim" x="238" y="26" fontFamily="IBM Plex Mono,monospace" fontSize="11" fill="#a78bfa" style={parseStyle("opacity:0; animation:hh-fadein .35s ease 2.4s forwards;")}>sin(x)</text>
                  </svg>
                </div>
              </div>

              {/* 03 · Adverbs → tempo */}
              <div style={panel(2)}>
                <div style={parseStyle(badgeRow)}>
                  <span style={badge("#e0b45f", "#2b2415")}>Adverbs → tempo</span>
                  <span style={parseStyle(counter)}>03 / 04</span>
                </div>
                <p style={parseStyle(paraStyle)}>
                  <strong style={parseStyle(strong)}>&ldquo;slowly&rdquo;</strong> sets the tempo -
                  the same scene, given twice the room to breathe. Say &ldquo;snappy&rdquo; instead
                  and it tightens right up.
                </p>
                <div style={parseStyle(codeBox)}>
                  <div className="hh-codeline" style={parseStyle("white-space:nowrap; animation:hh-code .5s steps(20,end) .1s both;")}>
                    run_time=<span style={parseStyle("color:#5fcf86;")}>6</span>, <span style={parseStyle("color:#5b6070;")}># &ldquo;slowly&rdquo; - was 3</span>
                  </div>
                  <div className="hh-codeline" style={parseStyle("white-space:nowrap; animation:hh-code .6s steps(14,end) .4s both;")}>
                    rate_func=<span style={parseStyle("color:#6cc7ff;")}>smooth</span>
                    <span style={parseStyle(codeCaret)}></span>
                  </div>
                </div>
                <div style={parseStyle(canvasBox)}>
                  <svg viewBox="0 0 320 120" style={parseStyle("width:100%; height:auto; display:block;")}>
                    <text x="20" y="20" fontFamily="IBM Plex Mono,monospace" fontSize="10" fill="#5b6070">&ldquo;snappy&rdquo; · run_time=3</text>
                    <path className="hh-anim" d="M20,44 Q50,20 80,44 T140,44 T200,44 T260,44" fill="none" stroke="#3a4157" strokeWidth="2" style={parseStyle("stroke-dasharray:280; stroke-dashoffset:280; animation:hh-draw .85s linear .55s forwards;")}></path>
                    <text x="20" y="76" fontFamily="IBM Plex Mono,monospace" fontSize="10" fill="#e0b45f">&ldquo;slowly&rdquo; · run_time=6</text>
                    <path className="hh-anim" d="M20,100 Q50,76 80,100 T140,100 T200,100 T260,100" fill="none" stroke="#e0b45f" strokeWidth="2.5" style={parseStyle("stroke-dasharray:280; stroke-dashoffset:280; animation:hh-draw 2.9s linear .55s forwards;")}></path>
                  </svg>
                </div>
              </div>

              {/* 04 · Verbs → motion */}
              <div style={panel(3)}>
                <div style={parseStyle(badgeRow)}>
                  <span style={badge("#7fd79c", "#16281d")}>Verbs → motion</span>
                  <span style={parseStyle(counter)}>04 / 04</span>
                </div>
                <p style={parseStyle(paraStyle)}>
                  <strong style={parseStyle(strong)}>&ldquo;trace the wave&rdquo;</strong> picks the
                  motion - the wave draws itself along its own path, right when your sentence says so.
                </p>
                <div style={parseStyle(codeBox)}>
                  <div className="hh-codeline" style={parseStyle("white-space:nowrap; animation:hh-code .5s steps(24,end) .1s both;")}>
                    <span style={parseStyle("color:#e88fb0;")}>self</span>.play(<span style={parseStyle("color:#ffcf6c;")}>Create</span>(wave), run_time=<span style={parseStyle("color:#5fcf86;")}>6</span>)
                  </div>
                  <div className="hh-codeline" style={parseStyle("white-space:nowrap; animation:hh-code .6s steps(10,end) .4s both;")}>
                    <span style={parseStyle("color:#e88fb0;")}>self</span>.wait()
                    <span style={parseStyle(codeCaret)}></span>
                  </div>
                </div>
                <div style={parseStyle(canvasBox)}>
                  <svg viewBox="0 0 320 120" style={parseStyle("width:100%; height:auto; display:block;")}>
                    <path d="M30,60 Q62.5,10 95,60 T160,60 T225,60 T290,60" fill="none" stroke="#1e2b23" strokeWidth="2"></path>
                    <path className="hh-anim" d="M30,60 Q62.5,10 95,60 T160,60 T225,60 T290,60" fill="none" stroke="#7fd79c" strokeWidth="2.5" style={parseStyle("stroke-dasharray:312; stroke-dashoffset:312; animation:hh-draw 2.5s linear .6s forwards;")}></path>
                    <circle className="hh-anim hh-tracedot" r="5" fill="#7fd79c" style={parseStyle("offset-path:path('M30,60 Q62.5,10 95,60 T160,60 T225,60 T290,60'); animation:hh-trace 2.5s linear .6s forwards;")}></circle>
                  </svg>
                </div>
              </div>
            </div>
            <div style={parseStyle("margin-top:13px; text-align:right; font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:0.06em; color:#a6a29a;")}>
              auto-plays · click a word to jump
            </div>
          </div>
        </div>

        {/* ── what one sentence buys you ── */}
        <div style={parseStyle("margin-top:56px; border-top:1px solid #ddd8cc; padding-top:30px;")}>
          <div style={parseStyle("display:flex; flex-wrap:wrap; align-items:flex-start; gap:22px;")}>
            <div
              className="hh-llabel"
              style={parseStyle(
                "flex:0 0 auto; margin-right:16px; max-width:150px; margin-top:2px; font-family:'Space Grotesk'; font-weight:700; font-size:17px; line-height:1.3; letter-spacing:-0.01em; color:#16161a;",
              )}
            >
              What one sentence buys you
            </div>
            <Stat label="You type" value="11 words" sub="one plain sentence" />
            <StatArrow />
            <Stat label="Manition writes" value="34 lines of Manim" sub="real, editable Python" />
            <StatArrow />
            <Stat label="GPUs render" value="288 frames" sub="1080p, in the cloud" />
            <StatArrow />
            <Stat label="You get" value="one MP4 · 0:12" sub="ready for slides, edits, posts" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FragWord({
  index,
  active,
  onClick,
}: {
  index: number;
  active: boolean;
  onClick: (i: number) => void;
}) {
  const f = FRAGMENTS[index];
  return (
    <button
      onClick={() => onClick(index)}
      style={parseStyle(
        `appearance:none; background:none; border:0; border-bottom:5px solid ${f.underline}; border-radius:0; padding:0 2px 1px; margin:0; cursor:pointer; font:inherit; letter-spacing:inherit; color:${active ? f.accent : "#16161a"}; position:relative; display:inline-block; transition:color .25s;`,
      )}
    >
      {f.label}
      <span
        className="hh-fragbar"
        style={parseStyle(
          `display:${active ? "block" : "none"}; position:absolute; left:0; bottom:-5px; height:5px; background:${f.bar}; width:0%; animation:hh-bar ${CYCLE_MS / 1000}s linear forwards;`,
        )}
      ></span>
    </button>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={parseStyle("flex:1; min-width:150px;")}>
      <div style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:#a6a29a; margin-bottom:8px;")}>
        {label}
      </div>
      <div style={parseStyle("font-family:'Space Grotesk'; font-weight:700; font-size:20px; letter-spacing:-0.015em; color:#16161a;")}>
        {value}
      </div>
      <div style={parseStyle("font-size:12.5px; color:#8a8a92; margin-top:4px;")}>{sub}</div>
    </div>
  );
}

function StatArrow() {
  return (
    <div className="hh-larrow" style={parseStyle("flex:none; color:#c2bcae; margin-top:24px;")}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14"></path>
        <path d="M13 6l6 6-6 6"></path>
      </svg>
    </div>
  );
}
