import Link from "next/link";
import { parseStyle } from "./lib/css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ManitionDemo from "./components/film/ManitionDemo";
import HeroPrompt from "./components/HeroPrompt";
import TrySentence from "./components/TrySentence";
import UseCases from "./components/UseCases";
import { Hover, WaitlistForm } from "./components/Interactive";

const eyebrow =
  "margin:0 0 14px; font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:0.14em; text-transform:uppercase; color:#3b62e0;";

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

const QUOTES = [
  { quote: "“I described a Riemann sum and had a lecture-ready clip before my coffee was cold. This replaced an afternoon of fiddling with Manim.”", by: "Calculus lecturer · state university" },
  { quote: "“My channel’s visuals used to take days. Now I prototype ten ideas in an hour and only render the ones that land.”", by: "Video creator · 240k subscribers" },
  { quote: "“I finally understood eigenvectors because I could ask to see one rotate. Being able to change it in chat is the whole thing.”", by: "Physics undergraduate" },
];

const chevron = (
  <span className="faq-chevron" style={parseStyle("transition:transform .2s; color:#9a9aa2; display:flex;")}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M6 9l6 6 6-6"></path>
    </svg>
  </span>
);

function Faq({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <details style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:13px; padding:2px 20px;")}>
      <summary
        style={parseStyle(
          "display:flex; align-items:center; justify-content:space-between; gap:16px; padding:17px 0; font-family:'Space Grotesk'; font-weight:600; font-size:16px;",
        )}
      >
        {question}
        {chevron}
      </summary>
      <p style={parseStyle("margin:0 0 18px; font-size:14px; line-height:1.65; color:#6b6b73; max-width:560px;")}>{children}</p>
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
      <section id="demo" style={parseStyle("padding:clamp(32px,4.6vw,60px) 0 clamp(46px,6vw,76px);")}>
        <div
          className="hh-hero"
          style={parseStyle(
            "display:grid; grid-template-columns:minmax(0,0.92fr) minmax(0,1.08fr); gap:54px; align-items:center; padding-left:max(clamp(18px,4vw,30px), calc((100% - 1200px) / 2));",
          )}
        >
          <div className="hh-copy" style={parseStyle("min-width:0; max-width:540px;")}>
            <HeroPrompt />

            <h1
              style={parseStyle(
                "margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(42px,7vw,62px); line-height:1.0; letter-spacing:-0.038em; color:#16161a;",
              )}
            >
              Math,
              <br />
              animated.
            </h1>
            <p style={parseStyle("margin:24px 0 0; font-size:18px; line-height:1.55; color:#54545c; max-width:450px; text-wrap:pretty;")}>
              Describe a concept in plain language. Manition writes the animation, renders it in HD, and hands you a video you can drop into a lecture, a video, or a post.
            </p>

            <div style={parseStyle("display:flex; flex-wrap:wrap; gap:12px; margin-top:32px;")}>
              <Hover
                as="a"
                href="#waitlist"
                className="hh-cta"
                style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; background:#16161a; color:#f7f6f3; font-size:15px; font-weight:600; padding:14px 22px; border-radius:12px; border:1px solid #16161a; transition:transform .15s, background .15s;"
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
                className="hh-cta"
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
                Joined by <strong style={parseStyle("color:#16161a;")}>4,200+</strong> teachers, creators and students.
              </p>
            </div>
          </div>

          {/* The film is oversized and inset so it bleeds past the rounded frame. */}
          <div
            className="hh-film"
            style={parseStyle(
              "position:relative; width:100%; aspect-ratio:16/9; border-radius:18px 0 0 18px; overflow:hidden; background:#f7f6f3;",
            )}
          >
            <div style={parseStyle("position:absolute; left:-4.8%; top:-4.8%; width:109.6%; height:109.6%;")}>
              <ManitionDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ============ 01 · TRY A SENTENCE ============ */}
      <TrySentence />

      {/* ============ 02 · WHAT YOU GET ============ */}
      <section
        className="hh-wrap"
        style={parseStyle("max-width:1200px; margin:0 auto; padding:clamp(51px,6.8vw,82px) clamp(18px,4vw,30px) clamp(25px,3.3vw,40px);")}
      >
        <div className="hh-secthead" style={parseStyle("display:grid; grid-template-columns:1fr auto; gap:28px; align-items:end; margin-bottom:40px;")}>
          <div style={parseStyle("max-width:620px;")}>
            <p style={parseStyle(eyebrow)}>
              <span style={parseStyle("color:#b3ad9e;")}>02</span> &nbsp;What you get
            </p>
            <h2 style={parseStyle("margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(27px,4.9vw,38px); letter-spacing:-0.03em; line-height:1.08;")}>
              The power of Manim, without the Python.
            </h2>
          </div>
          <Link
            href="/features"
            style={parseStyle(
              "display:inline-flex; align-items:center; gap:7px; text-decoration:none; font-size:14px; font-weight:600; color:#16161a; white-space:nowrap;",
            )}
          >
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
                <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:0.16em; text-transform:uppercase; color:#8b8779;")}>You type</span>
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

      {/* ============ USE CASES ============ */}
      <UseCases />

      {/* ============ 04 · EARLY TESTERS ============ */}
      <section
        className="hh-wrap"
        style={parseStyle("max-width:1200px; margin:0 auto; padding:clamp(50px,6.7vw,80px) clamp(18px,4vw,30px) 20px;")}
      >
        <div style={parseStyle("max-width:620px; margin-bottom:34px;")}>
          <p style={parseStyle(eyebrow)}>
            <span style={parseStyle("color:#b3ad9e;")}>04</span> &nbsp;Early testers
          </p>
          <h2 style={parseStyle("margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(27px,4.9vw,38px); letter-spacing:-0.03em; line-height:1.08;")}>
            Making things they couldn&apos;t before.
          </h2>
        </div>
        <div className="hh-quotes" style={parseStyle("display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:clamp(24px,3vw,36px);")}>
          {QUOTES.map((q) => (
            <figure key={q.by} style={parseStyle("margin:0; border-top:1px solid #e6e2da; padding-top:22px;")}>
              <blockquote style={parseStyle("margin:0 0 16px; font-size:15.5px; line-height:1.6; color:#2a2a30; text-wrap:pretty;")}>
                {q.quote}
              </blockquote>
              <figcaption style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.06em; text-transform:uppercase; color:#8b8779;")}>
                {q.by}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ============ 05 · QUESTIONS ============ */}
      <section
        className="hh-wrap"
        style={parseStyle("max-width:1200px; margin:0 auto; padding:clamp(50px,6.7vw,80px) clamp(18px,4vw,30px) clamp(19px,2.5vw,30px);")}
      >
        <div className="hh-split" style={parseStyle("display:grid; grid-template-columns:0.72fr 1.28fr; gap:56px; align-items:start;")}>
          <div>
            <p style={parseStyle(eyebrow)}>
              <span style={parseStyle("color:#b3ad9e;")}>05</span> &nbsp;Questions
            </p>
            <h2 style={parseStyle("margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(26px,4.6vw,34px); letter-spacing:-0.03em; line-height:1.1;")}>
              Before you join.
            </h2>
            <p style={parseStyle("margin:16px 0 0; font-size:14.5px; line-height:1.65; color:#6b6b73; max-width:280px; text-wrap:pretty;")}>
              Everything else is in the <Link href="/docs" style={parseStyle("font-weight:500;")}>docs</Link>.
            </p>
          </div>
          <div style={parseStyle("display:flex; flex-direction:column; gap:10px;")}>
            <Faq question="Do I need to know Manim or Python?">
              Not at all. You describe the scene in plain language and Manition writes the Manim for you. If you do know Python, the generated code is fully editable and exportable.
            </Faq>
            <Faq question="What can it actually animate?">
              Graphs and functions, geometry, transformations, calculus visuals, vectors and matrices, number theory, and more. Anything the Manim engine supports, driven by your description.
            </Faq>
            <Faq question="How long does a render take?">
              Most short scenes render in well under a minute on our cloud GPUs. You see a live preview as it works, and everything happens off your device.
            </Faq>
            <Faq question="What will it cost?">
              There is a free tier for trying it, and paid plans are being shaped with our first cohort. Waitlist members help set
              the price and keep founder rates. <Link href="/pricing">See where pricing stands</Link>.
            </Faq>
          </div>
        </div>
      </section>

      {/* ============ WAITLIST CTA ============ */}
      <section
        id="waitlist"
        className="hh-wrap"
        style={parseStyle("max-width:1200px; margin:0 auto; padding:clamp(31px,4.2vw,50px) clamp(18px,4vw,30px) clamp(56px,7.5vw,90px);")}
      >
        <div style={parseStyle("position:relative; background:#0c0c0f; border-radius:24px; overflow:hidden; padding:clamp(40px,6vw,66px) clamp(20px,4.4vw,40px); text-align:center;")}>
          <div style={parseStyle("position:absolute; inset:0; opacity:0.5; background:radial-gradient(600px 300px at 50% -10%, rgba(59,98,224,0.22), transparent);")}></div>
          <div style={parseStyle("position:relative;")}>
            <h2 style={parseStyle("margin:0 0 14px; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(29px,5.6vw,42px); letter-spacing:-0.035em; line-height:1.05; color:#f7f6f3;")}>
              Get early access to Manition.
            </h2>
            <p style={parseStyle("margin:0 auto 30px; max-width:470px; font-size:16px; line-height:1.6; color:#a1a1aa; text-wrap:pretty;")}>
              Be first in line, help shape pricing, and lock in founder rates. No spam, just one email when it is your turn.
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
