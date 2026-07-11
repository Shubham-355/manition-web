import Link from "next/link";
import { parseStyle } from "./lib/css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import IntroDemo from "./components/IntroDemo";
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
      <section id="how" style={parseStyle("background:#efece7; border-top:1px solid #e6e2da; border-bottom:1px solid #e6e2da;")}>
        <div style={parseStyle("max-width:1200px; margin:0 auto; padding:78px 30px;")}>
          <div style={parseStyle("max-width:640px; margin-bottom:46px;")}>
            <p style={parseStyle(eyebrow)}>How it works</p>
            <h2
              style={parseStyle(
                "margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:38px; letter-spacing:-0.03em; line-height:1.08; color:#16161a;",
              )}
            >
              From a sentence to a rendered scene, in four steps.
            </h2>
          </div>
          <div className="hh-2col" style={parseStyle("display:grid; grid-template-columns:repeat(4,1fr); gap:18px;")}>
            {[
              {
                icon: (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                  </svg>
                ),
                iconWrap: "background:#f0eef8; color:#5b46d9;",
                num: "01",
                title: "Describe",
                body: "Type what you want to see - “a Fourier series building a square wave.” Plain English is the only syntax.",
              },
              {
                icon: (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                ),
                iconWrap: "background:#eef2fd; color:#3b62e0;",
                num: "02",
                title: "Generate",
                body: "Manition writes real, editable Manim code for the scene, generated straight from your description.",
              },
              {
                icon: (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4"></path>
                    <path d="M12 18v4"></path>
                    <path d="m4.9 4.9 2.8 2.8"></path>
                    <path d="m16.3 16.3 2.8 2.8"></path>
                    <path d="M2 12h4"></path>
                    <path d="M18 12h4"></path>
                  </svg>
                ),
                iconWrap: "background:#fbf3e4; color:#c2913a;",
                num: "03",
                title: "Render",
                body: "Cloud GPUs render the scene to crisp 1080p or 4K. No installs, no dependencies, no waiting on your laptop.",
              },
              {
                icon: (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="14" height="14" rx="2"></rect>
                    <polygon points="22 7 16 12 22 17"></polygon>
                  </svg>
                ),
                iconWrap: "background:#e9f5ec; color:#2f7a4a;",
                num: "04",
                title: "Watch",
                body: "Preview instantly, refine in chat, then export the MP4. Every scene stays saved in your library.",
              },
            ].map((step) => (
              <div key={step.num} style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:16px; padding:24px;")}>
                <div
                  style={parseStyle(
                    `width:38px; height:38px; border-radius:10px; ${step.iconWrap} display:flex; align-items:center; justify-content:center; margin-bottom:18px;`,
                  )}
                >
                  {step.icon}
                </div>
                <p style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#9a9aa2; margin:0 0 6px;")}>{step.num}</p>
                <h3 style={parseStyle("margin:0 0 8px; font-family:'Space Grotesk'; font-weight:600; font-size:18px; letter-spacing:-0.01em;")}>{step.title}</h3>
                <p style={parseStyle("margin:0; font-size:13.5px; line-height:1.6; color:#6b6b73;")}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
        <div className="hh-3col" style={parseStyle("display:grid; grid-template-columns:repeat(3,1fr); gap:18px;")}>
          {[
            {
              title: "Plain-language prompts",
              body: "Say it the way you'd explain it at a whiteboard. Manition handles the geometry, timing and easing for you.",
            },
            {
              title: "Real, editable code",
              body: "Every scene is genuine Manim. Peek at the code, tweak a value, or export the script - nothing is locked away.",
            },
            {
              title: "Iterate in chat",
              body: "“Make it slower,” “add axis labels,” “use blue.” Refine any scene in conversation until it's exactly right.",
            },
            {
              title: "HD & 4K exports",
              body: "Download broadcast-quality MP4s with transparent backgrounds for slides, videos and lecture decks.",
            },
            {
              title: "A saved library",
              body: "Every render is kept, searchable and re-runnable. Build a personal collection of reusable explainers.",
            },
            {
              title: "Cloud rendering",
              body: "GPU rendering runs on our servers, so complex scenes finish fast even on a Chromebook or a phone.",
            },
          ].map((f) => (
            <div key={f.title} style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:16px; padding:26px;")}>
              <h3 style={parseStyle("margin:0 0 9px; font-family:'Space Grotesk'; font-weight:600; font-size:18px;")}>{f.title}</h3>
              <p style={parseStyle("margin:0; font-size:14px; line-height:1.6; color:#6b6b73;")}>{f.body}</p>
            </div>
          ))}
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
      <section style={parseStyle("background:#111114; color:#e8e8ea;")}>
        <div style={parseStyle("max-width:1200px; margin:0 auto; padding:82px 30px;")}>
          <div style={parseStyle("max-width:600px; margin-bottom:46px;")}>
            <p style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#7f97e8; margin:0 0 14px;")}>Who it&apos;s for</p>
            <h2 style={parseStyle("margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:38px; letter-spacing:-0.03em; line-height:1.08; color:#f7f6f3;")}>
              One tool, every kind of explainer.
            </h2>
          </div>
          <div className="hh-3col" style={parseStyle("display:grid; grid-template-columns:repeat(3,1fr); gap:18px;")}>
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10 12 5 2 10l10 5 10-5Z"></path>
                    <path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5"></path>
                  </svg>
                ),
                color: "#7f97e8",
                title: "Educators",
                body: "Turn the hard-to-picture moment of a lesson into a 15-second animation. Build a reusable bank of visuals for every unit.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="14" height="14" rx="2"></rect>
                    <polygon points="22 7 16 12 22 17"></polygon>
                  </svg>
                ),
                color: "#c2913a",
                title: "Creators",
                body: "Ship the polished, broadcast-quality visuals your channel deserves - without learning to code or hiring an animator.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M4 20V8a4 4 0 0 1 8 0v12"></path>
                    <path d="M4 12h8"></path>
                  </svg>
                ),
                color: "#5fbf7e",
                title: "Students & devs",
                body: "See the concept move before the exam. Prototype a visualization for a paper, README or talk in a single sentence.",
              },
            ].map((u) => (
              <div key={u.title} style={parseStyle("background:#17171c; border:1px solid #26262c; border-radius:16px; padding:28px;")}>
                <div
                  style={parseStyle(
                    `width:40px; height:40px; border-radius:11px; background:#20202a; display:flex; align-items:center; justify-content:center; margin-bottom:20px; color:${u.color};`,
                  )}
                >
                  {u.icon}
                </div>
                <h3 style={parseStyle("margin:0 0 10px; font-family:'Space Grotesk'; font-weight:600; font-size:20px; color:#f7f6f3;")}>{u.title}</h3>
                <p style={parseStyle("margin:0; font-size:14px; line-height:1.6; color:#a1a1aa;")}>{u.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section style={parseStyle("max-width:1200px; margin:0 auto; padding:82px 30px 50px;")}>
        <p style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#3b62e0; margin:0 0 14px; text-align:center;")}>
          Loved by explainers
        </p>
        <h2 style={parseStyle("margin:0 0 46px; text-align:center; font-family:'Space Grotesk'; font-weight:700; font-size:38px; letter-spacing:-0.03em; line-height:1.08;")}>
          People are making things they couldn&apos;t before.
        </h2>
        <div className="hh-3col" style={parseStyle("display:grid; grid-template-columns:repeat(3,1fr); gap:18px;")}>
          {[
            {
              quote:
                "“I described a Riemann sum and had a lecture-ready clip before my coffee was cold. This replaced an afternoon of fiddling with Manim.”",
              who: "Calculus lecturer",
            },
            {
              quote:
                "“My channel's visuals used to take days. Now I prototype ten ideas in an hour and only render the ones that land.”",
              who: "YouTube creator · 240k subs",
            },
            {
              quote:
                "“I finally understood eigenvectors because I could ask to see one rotate. Being able to change it in chat is the whole thing.”",
              who: "Undergraduate, physics",
            },
          ].map((t) => (
            <figure key={t.who} style={parseStyle("margin:0; background:#fff; border:1px solid #e6e2da; border-radius:16px; padding:26px;")}>
              <blockquote style={parseStyle("margin:0 0 20px; font-size:15.5px; line-height:1.6; color:#2a2a30;")}>{t.quote}</blockquote>
              <figcaption style={parseStyle("font-size:12.5px; color:#8a8a92;")}>{t.who}</figcaption>
            </figure>
          ))}
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
