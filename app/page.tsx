import Link from "next/link";
import { parseStyle } from "./lib/css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import IntroDemo from "./components/IntroDemo";
import HowItWorks from "./components/HowItWorks";
import UseCases from "./components/UseCases";
import { Hover, WaitlistForm } from "./components/Interactive";

const eyebrow =
  "font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#3b62e0; margin:0 0 14px;";

const arrowSmall = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14"></path>
    <path d="M13 6l6 6-6 6"></path>
  </svg>
);

const chevron = (
  <span className="faq-chevron" style={parseStyle("transition:transform .2s; color:#9a9aa2;")}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M6 9l6 6 6-6"></path>
    </svg>
  </span>
);

function Faq({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <details style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:13px; padding:4px 20px;")}>
      <summary
        style={parseStyle(
          "display:flex; align-items:center; justify-content:space-between; gap:16px; padding:17px 0; font-family:'Space Grotesk'; font-weight:600; font-size:16px;",
        )}
      >
        {question}
        {chevron}
      </summary>
      <p style={parseStyle("margin:0 0 18px; font-size:14px; line-height:1.65; color:#6b6b73;")}>{children}</p>
    </details>
  );
}

export default function Home() {
  return (
    <div
      style={parseStyle(
        "font-family:'IBM Plex Sans',ui-sans-serif,system-ui; color:#16161a; background:#f7f6f3; overflow-x:hidden;",
      )}
    >
      <Nav active="home" />

      {/* ============ HERO ============ */}
      <section id="demo" style={parseStyle("max-width:1200px; margin:0 auto; padding:70px 30px 40px;")}>
        <div className="hh-hero" style={parseStyle("display:grid; grid-template-columns:1fr 1.02fr; gap:52px; align-items:center;")}>
          <div style={parseStyle("min-width:0;")}>
            <div
              style={parseStyle(
                "display:inline-flex; align-items:center; gap:9px; background:#fff; border:1px solid #e6e2da; border-radius:100px; padding:6px 13px 6px 8px; font-size:12px; color:#4b4b52; box-shadow:0 1px 2px rgba(24,24,27,0.04); margin-bottom:24px;",
              )}
            >
              <span
                style={parseStyle(
                  "display:inline-flex; align-items:center; gap:6px; background:#eef2fd; color:#2f4fc0; border-radius:100px; padding:3px 9px; font-weight:600; font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:0.02em;",
                )}
              >
                NEW
              </span>
              From prompt to rendered animation in seconds
            </div>

            <h1
              style={parseStyle(
                "margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:58px; line-height:1.02; letter-spacing:-0.035em; color:#16161a;",
              )}
            >
              Math,
              <br />
              animated.
            </h1>
            <p style={parseStyle("margin:22px 0 0; font-size:18px; line-height:1.55; color:#54545c; max-width:440px;")}>
              Describe a concept in plain language. Manition writes the animation, renders it in HD, and hands you a video you can drop into a lecture, a video, or a post - in minutes.
            </p>

            <div style={parseStyle("display:flex; flex-wrap:wrap; gap:12px; margin-top:32px;")}>
              <Hover
                as="a"
                href="#waitlist"
                style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; background:#16161a; color:#f7f6f3; font-size:15px; font-weight:600; padding:14px 22px; border-radius:12px; border:1px solid #16161a; transition:transform .15s,background .15s;"
                hoverStyle={{ background: "#000", transform: "translateY(-1px)" }}
              >
                Join the waitlist
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="M13 6l6 6-6 6"></path>
                </svg>
              </Hover>
              <Hover
                as="a"
                href="/gallery"
                style="display:inline-flex; align-items:center; gap:9px; text-decoration:none; background:#fff; color:#16161a; font-size:15px; font-weight:600; padding:14px 20px; border-radius:12px; border:1px solid #e0dcd2; transition:border-color .15s;"
                hoverStyle={{ borderColor: "#c9c4b8" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6 4 20 12 6 20 6 4"></polygon>
                </svg>
                Watch the gallery
              </Hover>
            </div>

            <div style={parseStyle("display:flex; align-items:center; gap:14px; margin-top:30px;")}>
              <div style={parseStyle("display:flex;")}>
                <div
                  style={parseStyle(
                    "width:30px; height:30px; border-radius:50%; background:#e7ddc9; border:2px solid #f7f6f3; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#8a6d2f;",
                  )}
                >
                  Ed
                </div>
                <div
                  style={parseStyle(
                    "width:30px; height:30px; border-radius:50%; background:#d9e2f7; border:2px solid #f7f6f3; margin-left:-9px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#3358c0;",
                  )}
                >
                  YT
                </div>
                <div
                  style={parseStyle(
                    "width:30px; height:30px; border-radius:50%; background:#dcefe0; border:2px solid #f7f6f3; margin-left:-9px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#2f7a4a;",
                  )}
                >
                  Ph
                </div>
              </div>
              <p style={parseStyle("margin:0; font-size:13px; color:#6b6b73; line-height:1.4;")}>
                Joined by <strong style={parseStyle("color:#16161a;")}>4,200+</strong> teachers, creators &amp; students on the list.
              </p>
            </div>
          </div>

          {/* animated product demo - shared IntroDemo component (same as the login page) */}
          <div>
            <IntroDemo theme="light" />
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <HowItWorks />

      {/* ============ FEATURES ============ */}
      <section style={parseStyle("max-width:1200px; margin:0 auto; padding:82px 30px 40px;")}>
        <div style={parseStyle("display:flex; flex-wrap:wrap; align-items:flex-end; justify-content:space-between; gap:16px; margin-bottom:44px;")}>
          <div style={parseStyle("max-width:560px;")}>
            <p style={parseStyle(eyebrow)}>Why Manition</p>
            <h2 style={parseStyle("margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:38px; letter-spacing:-0.03em; line-height:1.08;")}>
              The power of Manim, without the Python.
            </h2>
          </div>
          <Link href="/features" style={parseStyle("display:inline-flex; align-items:center; gap:7px; text-decoration:none; font-size:14px; font-weight:600; color:#16161a;")}>
            Explore all features {arrowSmall}
          </Link>
        </div>
        <div className="hh-bento" style={parseStyle("display:grid; grid-template-columns:repeat(12,1fr); gap:18px;")}>
          {/* Plain-language prompts · large cell */}
          <Hover
            as="div"
            style="grid-column:span 7; background:#fff; border:1px solid #e6e2da; border-radius:18px; padding:28px; display:flex; flex-direction:column; gap:24px; transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease;"
            hoverStyle={{ transform: "translateY(-4px)", boxShadow: "0 14px 30px -18px rgba(22,22,26,0.28)", borderColor: "#d9d3c8" }}
          >
            <div>
              <h3 style={parseStyle("margin:0 0 8px; font-family:'Space Grotesk'; font-weight:600; font-size:20px; letter-spacing:-0.01em;")}>Plain-language prompts</h3>
              <p style={parseStyle("margin:0; font-size:14px; line-height:1.6; color:#6b6b73; max-width:440px;")}>Say it the way you&apos;d explain it at a whiteboard. Manition handles the geometry, timing and easing for you.</p>
            </div>
            <div className="hh-flow" style={parseStyle("margin-top:auto; display:grid; grid-template-columns:1fr auto 1fr; align-items:stretch; gap:12px;")}>
              <div style={parseStyle("display:flex; flex-direction:column; justify-content:center; gap:8px; background:#faf9f6; border:1px solid #e6e2da; border-radius:12px; padding:14px 16px;")}>
                <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:0.16em; text-transform:uppercase; color:#a6a29a;")}>You type</span>
                <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12px; color:#2a2a30;")}>a sine wave unrolling from a circle</span>
              </div>
              <div className="hh-arrow" style={parseStyle("display:flex; align-items:center; justify-content:center; color:#c9c4b8;")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M13 6l6 6-6 6"></path></svg>
              </div>
              <div style={parseStyle("position:relative; border-radius:12px; overflow:hidden; background:radial-gradient(circle at 50% 40%,#15151d,#0b0b0e); border:1px solid #1f1f26; display:flex; align-items:center; justify-content:center; min-height:88px;")}>
                <svg width="116" height="60" viewBox="0 0 130 80" fill="none"><path d="M8 40 Q 30 6 52 40 T 96 40 T 130 40" stroke="#3b62e0" strokeWidth="2.4"></path><circle cx="24" cy="40" r="15" stroke="#33333d" strokeWidth="1.4"></circle></svg>
                <span style={parseStyle("position:absolute; right:10px; bottom:8px; font-family:'IBM Plex Mono',monospace; font-size:9px; color:#8a8a92;")}>0:12 · 1080p</span>
              </div>
            </div>
          </Hover>

          {/* Real, editable code · dark cell */}
          <Hover
            as="div"
            style="grid-column:span 5; background:#0f1117; border:1px solid #1c2030; border-radius:18px; padding:28px; display:flex; flex-direction:column; gap:20px; transition:transform .2s ease, box-shadow .2s ease;"
            hoverStyle={{ transform: "translateY(-4px)", boxShadow: "0 16px 34px -20px rgba(10,12,20,0.7)" }}
          >
            <div>
              <h3 style={parseStyle("margin:0 0 8px; font-family:'Space Grotesk'; font-weight:600; font-size:20px; letter-spacing:-0.01em; color:#f4f4f5;")}>Real, editable code</h3>
              <p style={parseStyle("margin:0; font-size:14px; line-height:1.6; color:#9aa0ad;")}>Every scene is genuine Manim. Peek at the code, tweak a value, or export the script - nothing is locked away.</p>
            </div>
            <div style={parseStyle("margin-top:auto; background:#0a0c11; border:1px solid #1c2030; border-radius:12px; padding:13px 16px; font-family:'IBM Plex Mono',monospace; font-size:11px; line-height:1.8; color:#cfd3dc; overflow:hidden;")}>
              <div style={parseStyle("white-space:nowrap;")}><span style={parseStyle("color:#c98fff;")}>class</span> SineToCircle(<span style={parseStyle("color:#6cc7ff;")}>Scene</span>):</div>
              <div style={parseStyle("white-space:nowrap;")}>&nbsp;&nbsp;<span style={parseStyle("color:#c98fff;")}>def</span> construct(<span style={parseStyle("color:#e88fb0;")}>self</span>):</div>
              <div style={parseStyle("white-space:nowrap; background:rgba(95,207,134,0.1); border-left:2px solid #5fcf86; margin:0 -16px; padding:0 16px 0 14px;")}>&nbsp;&nbsp;&nbsp;&nbsp;self.play(<span style={parseStyle("color:#ffcf6c;")}>Transform</span>(wave, dot), run_time=<span style={parseStyle("color:#5fcf86;")}>3</span>)</div>
              <div style={parseStyle("white-space:nowrap;")}>&nbsp;&nbsp;&nbsp;&nbsp;self.wait()</div>
            </div>
          </Hover>

          {/* Iterate in chat */}
          <Hover
            as="div"
            style="grid-column:span 4; background:#fff; border:1px solid #e6e2da; border-radius:18px; padding:26px; display:flex; flex-direction:column; transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease;"
            hoverStyle={{ transform: "translateY(-4px)", boxShadow: "0 14px 30px -18px rgba(22,22,26,0.28)", borderColor: "#d9d3c8" }}
          >
            <div style={parseStyle("display:flex; flex-direction:column; gap:7px; margin-bottom:24px;")}>
              <div style={parseStyle("align-self:flex-end; background:#16161a; color:#f7f6f3; border-radius:12px 12px 4px 12px; padding:7px 13px; font-size:12.5px;")}>make it slower</div>
              <div style={parseStyle("align-self:flex-end; background:#16161a; color:#f7f6f3; border-radius:12px 12px 4px 12px; padding:7px 13px; font-size:12.5px;")}>label the axes</div>
              <div style={parseStyle("align-self:flex-start; display:flex; align-items:center; gap:7px; background:#eef2fd; border:1px solid #d8e0f8; color:#2f4fc0; border-radius:12px 12px 12px 4px; padding:7px 13px; font-size:12px; font-weight:500;")}><span style={parseStyle("width:6px; height:6px; border-radius:50%; background:#3b62e0;")}></span>Re-rendered · 0:14</div>
            </div>
            <div style={parseStyle("margin-top:auto;")}>
              <h3 style={parseStyle("margin:0 0 8px; font-family:'Space Grotesk'; font-weight:600; font-size:18px;")}>Iterate in chat</h3>
              <p style={parseStyle("margin:0; font-size:14px; line-height:1.6; color:#6b6b73;")}>Refine any scene in conversation until it&apos;s exactly right - no timeline scrubbing, no re-exports.</p>
            </div>
          </Hover>

          {/* Cloud-rendered 4K exports · tinted */}
          <Hover
            as="div"
            style="grid-column:span 4; background:#eef2fd; border:1px solid #d8e0f8; border-radius:18px; padding:26px; display:flex; flex-direction:column; transition:transform .2s ease, box-shadow .2s ease;"
            hoverStyle={{ transform: "translateY(-4px)", boxShadow: "0 14px 30px -18px rgba(47,79,192,0.25)" }}
          >
            <div style={parseStyle("margin-bottom:24px;")}>
              <div style={parseStyle("font-family:'Space Grotesk'; font-weight:700; font-size:56px; line-height:0.95; letter-spacing:-0.04em; color:#2f4fc0;")}>4K</div>
              <div style={parseStyle("display:flex; flex-wrap:wrap; gap:6px; margin-top:14px;")}>
                <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.04em; background:#fff; border:1px solid #d8e0f8; color:#3b62e0; border-radius:100px; padding:4px 10px;")}>MP4</span>
                <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.04em; background:#fff; border:1px solid #d8e0f8; color:#3b62e0; border-radius:100px; padding:4px 10px;")}>Transparent</span>
                <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.04em; background:#fff; border:1px solid #d8e0f8; color:#3b62e0; border-radius:100px; padding:4px 10px;")}>60 fps</span>
              </div>
            </div>
            <div style={parseStyle("margin-top:auto;")}>
              <h3 style={parseStyle("margin:0 0 8px; font-family:'Space Grotesk'; font-weight:600; font-size:18px; color:#16161a;")}>Cloud-rendered exports</h3>
              <p style={parseStyle("margin:0; font-size:14px; line-height:1.6; color:#4b5a85;")}>GPU rendering runs on our servers - download broadcast-quality files, even from a Chromebook.</p>
            </div>
          </Hover>

          {/* A saved library */}
          <Hover
            as="div"
            style="grid-column:span 4; background:#fff; border:1px solid #e6e2da; border-radius:18px; padding:26px; display:flex; flex-direction:column; transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease;"
            hoverStyle={{ transform: "translateY(-4px)", boxShadow: "0 14px 30px -18px rgba(22,22,26,0.28)", borderColor: "#d9d3c8" }}
          >
            <div style={parseStyle("display:grid; grid-template-columns:repeat(3,1fr); gap:7px; margin-bottom:24px;")}>
              <div style={parseStyle("aspect-ratio:16/11; border-radius:8px; background:#101014; border:1px solid #1f1f26; display:flex; align-items:center; justify-content:center; overflow:hidden;")}><svg width="32" height="16" viewBox="0 0 34 18" fill="none"><path d="M1 9 Q 5.5 1 9.5 9 T 18 9 T 26.5 9 T 34 9" stroke="#3b62e0" strokeWidth="1.6"></path></svg></div>
              <div style={parseStyle("aspect-ratio:16/11; border-radius:8px; background:#101014; border:1px solid #1f1f26; display:flex; align-items:center; justify-content:center; overflow:hidden;")}><svg width="32" height="18" viewBox="0 0 34 19" fill="none"><path d="M2 17 C 10 17 12 3 17 3 C 22 3 24 17 32 17" stroke="#c2913a" strokeWidth="1.6"></path></svg></div>
              <div style={parseStyle("aspect-ratio:16/11; border-radius:8px; background:#101014; border:1px solid #1f1f26; display:flex; align-items:center; justify-content:center; overflow:hidden;")}><div style={parseStyle("width:16px; height:16px; border-radius:50%; background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.28); display:flex; align-items:center; justify-content:center;")}><svg width="7" height="7" viewBox="0 0 24 24" fill="#fff" style={parseStyle("margin-left:1px;")}><polygon points="6 4 20 12 6 20 6 4"></polygon></svg></div></div>
              <div style={parseStyle("aspect-ratio:16/11; border-radius:8px; background:#101014; border:1px solid #1f1f26; display:flex; align-items:center; justify-content:center; overflow:hidden;")}><svg width="30" height="18" viewBox="0 0 30 18" fill="none"><g stroke="#5fbf7e" strokeWidth="1.4"><line x1="5" y1="15" x2="11" y2="7"></line><line x1="16" y1="15" x2="22" y2="4"></line></g><g fill="#5fbf7e"><path d="M11 7 l-3.4 0.7 2.7 2 0.7-2.7Z"></path><path d="M22 4 l-3.4 0.7 2.7 2 0.7-2.7Z"></path></g></svg></div>
              <div style={parseStyle("aspect-ratio:16/11; border-radius:8px; background:#101014; border:1px solid #1f1f26; display:flex; align-items:center; justify-content:center; overflow:hidden;")}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#7f97e8" strokeWidth="1.4"></circle><line x1="10" y1="10" x2="15" y2="6" stroke="#7f97e8" strokeWidth="1.4"></line></svg></div>
              <div style={parseStyle("aspect-ratio:16/11; border-radius:8px; background:#101014; border:1px solid #1f1f26; display:flex; align-items:center; justify-content:center; overflow:hidden;")}><span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:10px; color:#8a8a92;")}>+128</span></div>
            </div>
            <div style={parseStyle("margin-top:auto;")}>
              <h3 style={parseStyle("margin:0 0 8px; font-family:'Space Grotesk'; font-weight:600; font-size:18px;")}>A saved library</h3>
              <p style={parseStyle("margin:0; font-size:14px; line-height:1.6; color:#6b6b73;")}>Every render is kept, searchable and re-runnable - a growing collection of reusable explainers.</p>
            </div>
          </Hover>
        </div>
      </section>

      {/* ============ GALLERY PREVIEW ============ */}
      <section style={parseStyle("max-width:1200px; margin:0 auto; padding:60px 30px 40px;")}>
        <div style={parseStyle("display:flex; flex-wrap:wrap; align-items:flex-end; justify-content:space-between; gap:16px; margin-bottom:34px;")}>
          <div style={parseStyle("max-width:560px;")}>
            <p style={parseStyle(eyebrow)}>Made with Manition</p>
            <h2 style={parseStyle("margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:38px; letter-spacing:-0.03em; line-height:1.08;")}>
              A gallery of one-sentence scenes.
            </h2>
          </div>
          <Link href="/gallery" style={parseStyle("display:inline-flex; align-items:center; gap:7px; text-decoration:none; font-size:14px; font-weight:600; color:#16161a;")}>
            Browse the gallery {arrowSmall}
          </Link>
        </div>
        <div className="hh-3col" style={parseStyle("display:grid; grid-template-columns:repeat(3,1fr); gap:18px;")}>
          <Hover
            as="a"
            href="/gallery"
            style="text-decoration:none; color:inherit; background:#0c0c0f; border:1px solid #1f1f26; border-radius:15px; overflow:hidden; display:block;"
            hoverStyle={{ transform: "translateY(-3px)" }}
          >
            <div style={parseStyle("aspect-ratio:16/10; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at 50% 40%,#15151d,#0b0b0e);")}>
              <svg width="130" height="80" viewBox="0 0 130 80" fill="none">
                <path d="M8 40 Q 30 6 52 40 T 96 40 T 130 40" stroke="#3b62e0" strokeWidth="2.4"></path>
                <circle cx="24" cy="40" r="15" stroke="#33333d" strokeWidth="1.4"></circle>
              </svg>
            </div>
            <div style={parseStyle("padding:15px 17px;")}>
              <p style={parseStyle("margin:0 0 4px; font-family:'Space Grotesk'; font-weight:600; font-size:15px; color:#f4f4f5;")}>Sine from a circle</p>
              <p style={parseStyle("margin:0; font-size:12.5px; color:#8a8a92;")}>Trigonometry · 0:12</p>
            </div>
          </Hover>
          <Hover
            as="a"
            href="/gallery"
            style="text-decoration:none; color:inherit; background:#0c0c0f; border:1px solid #1f1f26; border-radius:15px; overflow:hidden; display:block;"
            hoverStyle={{ transform: "translateY(-3px)" }}
          >
            <div style={parseStyle("aspect-ratio:16/10; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at 50% 40%,#15151d,#0b0b0e);")}>
              <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
                <path d="M10 70 L110 70 M10 70 L10 10" stroke="#33333d" strokeWidth="1.4"></path>
                <path d="M14 66 C 40 66 44 20 60 20 C 76 20 80 66 106 66" stroke="#c2913a" strokeWidth="2.4" fill="none"></path>
                <path d="M14 66 L106 66 L106 66 Z" fill="none"></path>
                <rect x="40" y="34" width="40" height="32" fill="#c2913a" opacity="0.14"></rect>
              </svg>
            </div>
            <div style={parseStyle("padding:15px 17px;")}>
              <p style={parseStyle("margin:0 0 4px; font-family:'Space Grotesk'; font-weight:600; font-size:15px; color:#f4f4f5;")}>Area under a curve</p>
              <p style={parseStyle("margin:0; font-size:12.5px; color:#8a8a92;")}>Calculus · 0:18</p>
            </div>
          </Hover>
          <Hover
            as="a"
            href="/gallery"
            style="text-decoration:none; color:inherit; background:#0c0c0f; border:1px solid #1f1f26; border-radius:15px; overflow:hidden; display:block;"
            hoverStyle={{ transform: "translateY(-3px)" }}
          >
            <div style={parseStyle("aspect-ratio:16/10; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at 50% 40%,#15151d,#0b0b0e);")}>
              <svg width="110" height="80" viewBox="0 0 110 80" fill="none">
                <g stroke="#5fbf7e" strokeWidth="1.6">
                  <line x1="20" y1="60" x2="34" y2="42"></line>
                  <line x1="45" y1="60" x2="59" y2="34"></line>
                  <line x1="70" y1="60" x2="84" y2="46"></line>
                </g>
                <g fill="#5fbf7e">
                  <path d="M34 42 l-5 1 4 3 1-4Z"></path>
                  <path d="M59 34 l-5 1 4 3 1-4Z"></path>
                  <path d="M84 46 l-5 1 4 3 1-4Z"></path>
                </g>
              </svg>
            </div>
            <div style={parseStyle("padding:15px 17px;")}>
              <p style={parseStyle("margin:0 0 4px; font-family:'Space Grotesk'; font-weight:600; font-size:15px; color:#f4f4f5;")}>Vector field flow</p>
              <p style={parseStyle("margin:0; font-size:12.5px; color:#8a8a92;")}>Linear algebra · 0:15</p>
            </div>
          </Hover>
        </div>
      </section>

      {/* ============ USE CASES ============ */}
      <UseCases />

      {/* ============ TESTIMONIALS ============ */}
      <section style={parseStyle("max-width:1200px; margin:0 auto; padding:82px 30px 50px;")}>
        <div className="hh-quotes" style={parseStyle("display:grid; grid-template-columns:0.8fr 1.2fr; gap:60px; align-items:start;")}>
          <div>
            <p style={parseStyle(eyebrow)}>Loved by explainers</p>
            <h2 style={parseStyle("margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:38px; letter-spacing:-0.03em; line-height:1.08;")}>
              People are making things they couldn&apos;t before.
            </h2>
            <p style={parseStyle("margin:18px 0 0; font-size:15px; line-height:1.6; color:#6b6b73; max-width:340px;")}>
              Notes from early testers - lecture halls, editing bays and dorm desks.
            </p>
          </div>
          <div>
            <figure style={parseStyle("margin:0; position:relative; padding:6px 0 32px;")}>
              <span aria-hidden="true" style={parseStyle("position:absolute; top:-34px; left:-8px; font-family:'Space Grotesk'; font-weight:700; font-size:130px; line-height:1; color:#dfe6fb; user-select:none; pointer-events:none;")}>“</span>
              <blockquote style={parseStyle("position:relative; margin:0 0 18px; font-family:'Space Grotesk'; font-weight:600; font-size:26px; line-height:1.4; letter-spacing:-0.015em; color:#16161a;")}>
                I described a Riemann sum and had a lecture-ready clip before my coffee was cold. This replaced an afternoon of fiddling with Manim.
              </blockquote>
              <figcaption style={parseStyle("display:flex; align-items:center; gap:10px;")}>
                <span style={parseStyle("width:30px; height:30px; border-radius:50%; background:#e7ddc9; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#8a6d2f; flex:none;")}>RK</span>
                <span style={parseStyle("font-size:13px; color:#6b6b73;")}><strong style={parseStyle("color:#16161a; font-weight:600;")}>Calculus lecturer</strong> · state university</span>
              </figcaption>
            </figure>
            <div className="hh-2col" style={parseStyle("display:grid; grid-template-columns:1fr 1fr; gap:40px; border-top:1px solid #e6e2da; padding-top:30px;")}>
              <figure style={parseStyle("margin:0;")}>
                <blockquote style={parseStyle("margin:0 0 14px; font-size:15px; line-height:1.65; color:#4b4b52;")}>“My channel&apos;s visuals used to take days. Now I prototype ten ideas in an hour and only render the ones that land.”</blockquote>
                <figcaption style={parseStyle("display:flex; align-items:center; gap:10px;")}>
                  <span style={parseStyle("width:28px; height:28px; border-radius:50%; background:#d9e2f7; display:flex; align-items:center; justify-content:center; font-size:10.5px; font-weight:700; color:#3358c0; flex:none;")}>YT</span>
                  <span style={parseStyle("font-size:12.5px; color:#8a8a92;")}>YouTube creator · 240k subs</span>
                </figcaption>
              </figure>
              <figure style={parseStyle("margin:0;")}>
                <blockquote style={parseStyle("margin:0 0 14px; font-size:15px; line-height:1.65; color:#4b4b52;")}>“I finally understood eigenvectors because I could ask to see one rotate. Being able to change it in chat is the whole thing.”</blockquote>
                <figcaption style={parseStyle("display:flex; align-items:center; gap:10px;")}>
                  <span style={parseStyle("width:28px; height:28px; border-radius:50%; background:#dcefe0; display:flex; align-items:center; justify-content:center; font-size:10.5px; font-weight:700; color:#2f7a4a; flex:none;")}>PH</span>
                  <span style={parseStyle("font-size:12.5px; color:#8a8a92;")}>Undergraduate, physics</span>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICING PREVIEW ============ */}
      <section style={parseStyle("background:#efece7; border-top:1px solid #e6e2da; border-bottom:1px solid #e6e2da;")}>
        <div style={parseStyle("max-width:1200px; margin:0 auto; padding:78px 30px;")}>
          <div style={parseStyle("text-align:center; max-width:600px; margin:0 auto 20px;")}>
            <p style={parseStyle(eyebrow)}>Pricing</p>
            <h2 style={parseStyle("margin:0 0 10px; font-family:'Space Grotesk'; font-weight:700; font-size:38px; letter-spacing:-0.03em; line-height:1.08;")}>
              Simple plans, still being shaped.
            </h2>
            <p style={parseStyle("margin:0; font-size:15px; color:#6b6b73; line-height:1.6;")}>
              We&apos;re finalizing pricing with our early community. Join the waitlist and you&apos;ll help set it - and lock in founder rates.
            </p>
          </div>
          <div className="hh-3col" style={parseStyle("display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-top:40px; align-items:start;")}>
            <div style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:16px; padding:28px;")}>
              <h3 style={parseStyle("margin:0 0 4px; font-family:'Space Grotesk'; font-weight:600; font-size:18px;")}>Free</h3>
              <p style={parseStyle("margin:0 0 18px; font-size:13px; color:#8a8a92;")}>Try it, no card needed</p>
              <p style={parseStyle("margin:0 0 20px; font-family:'Space Grotesk'; font-weight:700; font-size:34px; letter-spacing:-0.02em;")}>$0</p>
              <div style={parseStyle("display:flex; flex-direction:column; gap:10px; font-size:13.5px; color:#4b4b52;")}>
                <span>A handful of renders / month</span>
                <span>720p exports</span>
                <span>Public library</span>
              </div>
            </div>
            <div
              style={parseStyle(
                "background:#16161a; color:#f7f6f3; border:1px solid #16161a; border-radius:16px; padding:28px; position:relative; box-shadow:0 18px 40px -22px rgba(20,20,40,0.5);",
              )}
            >
              <span
                style={parseStyle(
                  "position:absolute; top:18px; right:18px; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; background:#3b62e0; color:#fff; padding:4px 9px; border-radius:100px;",
                )}
              >
                Popular
              </span>
              <h3 style={parseStyle("margin:0 0 4px; font-family:'Space Grotesk'; font-weight:600; font-size:18px; color:#fff;")}>Pro</h3>
              <p style={parseStyle("margin:0 0 18px; font-size:13px; color:#a1a1aa;")}>For regular explainers</p>
              <p style={parseStyle("margin:0 0 20px; font-family:'Space Grotesk'; font-weight:700; font-size:34px; letter-spacing:-0.02em; color:#fff;")}>
                TBD<span style={parseStyle("font-size:14px; color:#8a8a92; font-weight:500;")}> /mo</span>
              </p>
              <div style={parseStyle("display:flex; flex-direction:column; gap:10px; font-size:13.5px; color:#c8c8cc;")}>
                <span>Unlimited renders</span>
                <span>4K &amp; transparent exports</span>
                <span>Priority GPU queue</span>
                <span>Editable Manim source</span>
              </div>
            </div>
            <div style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:16px; padding:28px;")}>
              <h3 style={parseStyle("margin:0 0 4px; font-family:'Space Grotesk'; font-weight:600; font-size:18px;")}>Team</h3>
              <p style={parseStyle("margin:0 0 18px; font-size:13px; color:#8a8a92;")}>Departments &amp; studios</p>
              <p style={parseStyle("margin:0 0 20px; font-family:'Space Grotesk'; font-weight:700; font-size:34px; letter-spacing:-0.02em;")}>TBD</p>
              <div style={parseStyle("display:flex; flex-direction:column; gap:10px; font-size:13.5px; color:#4b4b52;")}>
                <span>Shared workspaces</span>
                <span>Brand kits &amp; templates</span>
                <span>SSO &amp; admin controls</span>
              </div>
            </div>
          </div>
          <p style={parseStyle("text-align:center; margin:26px 0 0;")}>
            <Link href="/pricing" style={parseStyle("font-size:14px; font-weight:600; text-decoration:none;")}>See the full pricing page →</Link>
          </p>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section style={parseStyle("max-width:820px; margin:0 auto; padding:82px 30px 40px;")}>
        <h2 style={parseStyle("margin:0 0 36px; text-align:center; font-family:'Space Grotesk'; font-weight:700; font-size:34px; letter-spacing:-0.03em;")}>
          Questions, answered.
        </h2>
        <div style={parseStyle("display:flex; flex-direction:column; gap:12px;")}>
          <Faq question="Do I need to know Manim or Python?">
            Not at all. You describe the scene in plain language and Manition writes the Manim for you. If you do know Python, the generated code is fully editable and exportable.
          </Faq>
          <Faq question="What can it actually animate?">
            Graphs and functions, geometry, transformations, calculus visuals, vectors and matrices, number theory, and more - anything the Manim engine supports, driven by your description.
          </Faq>
          <Faq question="How long does a render take?">
            Most short scenes render in well under a minute on our cloud GPUs. You&apos;ll see a live preview as it works, and everything happens off your device.
          </Faq>
          <Faq question="When does it launch?">
            We&apos;re rolling out access in waves right now. Join the waitlist and we&apos;ll bring you in as capacity opens - early members get founder pricing.
          </Faq>
        </div>
      </section>

      {/* ============ WAITLIST CTA ============ */}
      <section id="waitlist" style={parseStyle("max-width:1200px; margin:0 auto; padding:40px 30px 90px;")}>
        <div style={parseStyle("position:relative; background:#0c0c0f; border-radius:24px; overflow:hidden; padding:64px 40px; text-align:center;")}>
          <div style={parseStyle("position:absolute; inset:0; opacity:0.5; background:radial-gradient(600px 300px at 50% -10%, rgba(59,98,224,0.22), transparent);")}></div>
          <div style={parseStyle("position:relative;")}>
            <h2 style={parseStyle("margin:0 0 14px; font-family:'Space Grotesk'; font-weight:700; font-size:42px; letter-spacing:-0.035em; line-height:1.05; color:#f7f6f3;")}>
              Get early access to Manition.
            </h2>
            <p style={parseStyle("margin:0 auto 30px; max-width:480px; font-size:16px; line-height:1.6; color:#a1a1aa;")}>
              Be first in line, help shape pricing, and lock in founder rates. No spam - just one email when it&apos;s your turn.
            </p>

            <WaitlistForm />

            <p style={parseStyle("margin:22px 0 0; font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#5b5b63;")}>
              4,200+ already waiting · no credit card
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
