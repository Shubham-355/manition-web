import { parseStyle } from "../lib/css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { Hover } from "../components/Interactive";

const rowBox =
  "display:grid; grid-template-columns:1fr 1fr; gap:36px; align-items:center; background:#fff; border:1px solid #e6e2da; border-radius:20px; padding:40px;";
const rowH2 =
  "margin:0 0 12px; font-family:'Space Grotesk'; font-weight:700; font-size:27px; letter-spacing:-0.02em; line-height:1.12;";
const rowP = "margin:0 0 18px; font-size:15px; line-height:1.65; color:#54545c;";
const bullet = "display:flex; gap:10px; font-size:14px; color:#3f3f46;";
const check = "color:#3b62e0;";
const capCard = "background:#fff; border:1px solid #e6e2da; border-radius:14px; padding:22px;";
const capH3 = "margin:0 0 6px; font-family:'Space Grotesk'; font-weight:600; font-size:16px;";
const capP = "margin:0; font-size:13.5px; color:#6b6b73; line-height:1.55;";

function tag(css: string, label: string) {
  return (
    <span
      style={parseStyle(
        `display:inline-block; font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; ${css} padding:5px 10px; border-radius:100px; margin-bottom:16px;`,
      )}
    >
      {label}
    </span>
  );
}

export default function Features() {
  return (
    <div
      style={parseStyle(
        "font-family:'IBM Plex Sans',ui-sans-serif,system-ui; color:#16161a; background:#f7f6f3; overflow-x:hidden;",
      )}
    >
      <Nav active="features" />

      {/* header */}
      <section style={parseStyle("max-width:880px; margin:0 auto; padding:76px 30px 30px; text-align:center;")}>
        <p style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#3b62e0; margin:0 0 16px;")}>
          Features
        </p>
        <h1 style={parseStyle("margin:0 auto; max-width:720px; font-family:'Space Grotesk'; font-weight:700; font-size:52px; line-height:1.04; letter-spacing:-0.035em;")}>
          Everything you need to turn an idea into an animation.
        </h1>
        <p style={parseStyle("margin:22px auto 0; max-width:520px; font-size:17px; line-height:1.6; color:#54545c;")}>
          Manition pairs a plain-language interface with a real rendering engine - so the distance from “I wish I could show this” to a finished clip is a single sentence.
        </p>
      </section>

      {/* alternating feature rows */}
      <section style={parseStyle("max-width:1120px; margin:0 auto; padding:40px 30px 20px; display:flex; flex-direction:column; gap:26px;")}>
        {/* Row 1 */}
        <div className="fr-row" style={parseStyle(rowBox)}>
          <div>
            {tag("color:#5b46d9; background:#f0eef8;", "Describe")}
            <h2 style={parseStyle(rowH2)}>Say it in plain language.</h2>
            <p style={parseStyle(rowP)}>
              No syntax to memorize, no timeline to scrub. Describe the concept the way you&apos;d explain it out loud, and Manition maps it to the right geometry, motion and pacing.
            </p>
            <ul style={parseStyle("margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:10px;")}>
              <li style={parseStyle(bullet)}><span style={parseStyle(check)}>✓</span> Follow-ups understood in context</li>
              <li style={parseStyle(bullet)}><span style={parseStyle(check)}>✓</span> Works for geometry, calculus, algebra &amp; more</li>
              <li style={parseStyle(bullet)}><span style={parseStyle(check)}>✓</span> Suggests refinements when a prompt is vague</li>
            </ul>
          </div>
          <div className="fr-vis" style={parseStyle("background:#0c0c0f; border:1px solid #1f1f26; border-radius:14px; padding:18px; display:flex; flex-direction:column; gap:10px;")}>
            <div style={parseStyle("align-self:flex-end; max-width:85%; background:#1f1f24; border:1px solid #2c2c33; border-radius:11px 11px 3px 11px; padding:9px 13px; font-size:12.5px; color:#e4e4e7;")}>
              Show how a Fourier series builds a square wave, step by step
            </div>
            <div style={parseStyle("align-self:flex-start; max-width:85%; background:#141418; border:1px solid #26262c; border-radius:11px 11px 11px 3px; padding:9px 13px; font-size:12.5px; color:#a1a1aa;")}>
              Rendering a 12-second scene adding harmonics n = 1, 3, 5, 7…
            </div>
            <div style={parseStyle("display:flex; align-items:center; gap:9px; background:#141418; border:1px solid #26262c; border-radius:11px; padding:8px 8px 8px 13px; margin-top:2px;")}>
              <span style={parseStyle("flex:1; font-size:12px; color:#4b4b52;")}>Make the axes labelled…</span>
              <span style={parseStyle("width:26px; height:26px; border-radius:7px; background:#3b62e0; display:flex; align-items:center; justify-content:center; color:#fff;")}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5"></path>
                  <path d="M6 11l6-6 6 6"></path>
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Row 2 (reversed) */}
        <div className="fr-row" style={parseStyle(rowBox)}>
          <div className="fr-vis" style={parseStyle("background:#0c0c0f; border:1px solid #1f1f26; border-radius:14px; overflow:hidden;")}>
            <div style={parseStyle("display:flex; align-items:center; gap:8px; padding:9px 13px; background:#141418; border-bottom:1px solid #26262c;")}>
              <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#71717a;")}>scene.py</span>
              <div style={parseStyle("flex:1;")}></div>
              <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:10px; color:#8fc9a0;")}>✓ editable</span>
            </div>
            <pre style={parseStyle("margin:0; padding:16px; font-family:'IBM Plex Mono',monospace; font-size:12px; line-height:1.8; color:#c9c9d0;")}>
              <span style={parseStyle("color:#8f7ab8;")}>from</span>{" manim "}
              <span style={parseStyle("color:#8f7ab8;")}>import</span>{" *\n\n"}
              <span style={parseStyle("color:#8f7ab8;")}>class</span>{" "}
              <span style={parseStyle("color:#c9a86b;")}>SquareWave</span>{"(Scene):\n    "}
              <span style={parseStyle("color:#8f7ab8;")}>def</span>{" "}
              <span style={parseStyle("color:#7ea6d9;")}>construct</span>{"(self):\n        axes = Axes(x_range=[-"}
              <span style={parseStyle("color:#6bb894;")}>4</span>{","}
              <span style={parseStyle("color:#6bb894;")}>4</span>{"])\n        wave = axes.plot(square_fourier)\n        self.play("}
              <span style={parseStyle("color:#e0a86a;")}>Create</span>{"(wave))"}
            </pre>
          </div>
          <div>
            {tag("color:#3b62e0; background:#eef2fd;", "Generate")}
            <h2 style={parseStyle(rowH2)}>Real Manim, never a black box.</h2>
            <p style={parseStyle(rowP)}>
              Under the hood, every scene is genuine Manim - the open-source Python library for programmatic math animation. Open the code, change a constant, or export the script to run it yourself.
            </p>
            <ul style={parseStyle("margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:10px;")}>
              <li style={parseStyle(bullet)}><span style={parseStyle(check)}>✓</span> Full source for every render</li>
              <li style={parseStyle(bullet)}><span style={parseStyle(check)}>✓</span> Tweak values without re-prompting</li>
              <li style={parseStyle(bullet)}><span style={parseStyle(check)}>✓</span> Export .py to keep or version-control</li>
            </ul>
          </div>
        </div>

        {/* Row 3 */}
        <div className="fr-row" style={parseStyle(rowBox)}>
          <div>
            {tag("color:#c2913a; background:#fbf3e4;", "Render")}
            <h2 style={parseStyle(rowH2)}>Cloud GPUs do the heavy lifting.</h2>
            <p style={parseStyle(rowP)}>
              No local install, no Python environment, no waiting on your laptop&apos;s fans. Scenes render on our GPUs and stream a live preview while they work.
            </p>
            <ul style={parseStyle("margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:10px;")}>
              <li style={parseStyle(bullet)}><span style={parseStyle(check)}>✓</span> 1080p and 4K output</li>
              <li style={parseStyle(bullet)}><span style={parseStyle(check)}>✓</span> Transparent backgrounds for overlays</li>
              <li style={parseStyle(bullet)}><span style={parseStyle(check)}>✓</span> Runs the same on a phone or a Chromebook</li>
            </ul>
          </div>
          <div className="fr-vis" style={parseStyle("background:#0c0c0f; border:1px solid #1f1f26; border-radius:14px; padding:24px; display:flex; flex-direction:column; justify-content:center; gap:14px;")}>
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
        </div>

        {/* Row 4 (reversed) */}
        <div className="fr-row" style={parseStyle(rowBox)}>
          <div className="fr-vis" style={parseStyle("background:#0c0c0f; border:1px solid #1f1f26; border-radius:14px; overflow:hidden;")}>
            <div style={parseStyle("aspect-ratio:16/9; background:radial-gradient(circle at 50% 45%,#141420,#0a0a0d); display:flex; align-items:center; justify-content:center; position:relative;")}>
              <svg width="180" height="90" viewBox="0 0 180 90" fill="none"><path d="M6 45 Q 28 6 51 45 T 96 45 T 141 45 T 186 45" stroke="#7ea6d9" strokeWidth="2.4"></path></svg>
              <span style={parseStyle("position:absolute; bottom:9px; left:11px; font-family:'IBM Plex Mono',monospace; font-size:9px; color:#8a8a92; background:rgba(0,0,0,0.5); padding:3px 6px; border-radius:5px;")}>fourier_square.mp4</span>
            </div>
            <div style={parseStyle("display:flex; align-items:center; gap:10px; padding:10px 13px; border-top:1px solid #1f1f26;")}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#e4e4e7"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
              <div style={parseStyle("flex:1; height:4px; border-radius:3px; background:#26262c;")}>
                <div style={parseStyle("width:40%; height:100%; border-radius:3px; background:#e4e4e7;")}></div>
              </div>
              <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:10px; color:#8a8a92;")}>0:12</span>
            </div>
          </div>
          <div>
            {tag("color:#2f7a4a; background:#e9f5ec;", "Watch & keep")}
            <h2 style={parseStyle(rowH2)}>Preview, refine, and build a library.</h2>
            <p style={parseStyle(rowP)}>
              Watch instantly, ask for changes in chat, then download the MP4. Every scene you make is saved, searchable and ready to re-render - a growing collection of your own explainers.
            </p>
            <ul style={parseStyle("margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:10px;")}>
              <li style={parseStyle(bullet)}><span style={parseStyle(check)}>✓</span> One-click MP4 download</li>
              <li style={parseStyle(bullet)}><span style={parseStyle(check)}>✓</span> Searchable personal library</li>
              <li style={parseStyle(bullet)}><span style={parseStyle(check)}>✓</span> Re-render any past scene at higher quality</li>
            </ul>
          </div>
        </div>
      </section>

      {/* capabilities grid */}
      <section style={parseStyle("max-width:1120px; margin:0 auto; padding:60px 30px 30px;")}>
        <div style={parseStyle("text-align:center; max-width:600px; margin:0 auto 40px;")}>
          <h2 style={parseStyle("margin:0 0 12px; font-family:'Space Grotesk'; font-weight:700; font-size:34px; letter-spacing:-0.03em;")}>What can it animate?</h2>
          <p style={parseStyle("margin:0; font-size:15px; color:#6b6b73; line-height:1.6;")}>
            If Manim can draw it, you can describe it. A few of the things people reach for most:
          </p>
        </div>
        <div className="fr-grid" style={parseStyle("display:grid; grid-template-columns:repeat(3,1fr); gap:14px;")}>
          {[
            { title: "Functions & graphs", body: "Plots, transformations, asymptotes and animated parameters." },
            { title: "Calculus", body: "Riemann sums, derivatives as slopes, limits and areas." },
            { title: "Linear algebra", body: "Vectors, matrix transforms, eigenvectors and spans." },
            { title: "Geometry", body: "Constructions, proofs, transformations and tilings." },
            { title: "Trigonometry", body: "Unit circle, wave build-ups, phase and amplitude." },
            { title: "Probability", body: "Distributions, sampling, and the law of large numbers." },
          ].map((c) => (
            <div key={c.title} style={parseStyle(capCard)}>
              <h3 style={parseStyle(capH3)}>{c.title}</h3>
              <p style={parseStyle(capP)}>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={parseStyle("max-width:1120px; margin:0 auto; padding:50px 30px 90px;")}>
        <div style={parseStyle("background:#16161a; border-radius:22px; padding:56px 40px; text-align:center;")}>
          <h2 style={parseStyle("margin:0 0 14px; font-family:'Space Grotesk'; font-weight:700; font-size:34px; letter-spacing:-0.03em; color:#f7f6f3;")}>See it move.</h2>
          <p style={parseStyle("margin:0 auto 28px; max-width:440px; font-size:15.5px; color:#a1a1aa; line-height:1.6;")}>
            Join the waitlist and be among the first to turn a sentence into a rendered scene.
          </p>
          <Hover
            as="a"
            href="/#waitlist"
            style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; background:#3b62e0; color:#fff; font-size:15px; font-weight:600; padding:14px 24px; border-radius:12px;"
            hoverStyle={{ background: "#2f4fc0" }}
          >
            Join the waitlist{" "}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M13 6l6 6-6 6"></path>
            </svg>
          </Hover>
        </div>
      </section>

      <Footer />
    </div>
  );
}
