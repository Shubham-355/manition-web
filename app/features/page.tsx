import { parseStyle } from "../lib/css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { Hover } from "../components/Interactive";
import FeaturesStudio from "../components/FeaturesStudio";

const CAPS = [
  { num: "01", name: "Functions & graphs", desc: "Plots, transformations, asymptotes and animated parameters.", ex: "“plot 1/x and zoom into the asymptote”" },
  { num: "02", name: "Calculus", desc: "Riemann sums, derivatives as slopes, limits and areas.", ex: "“show a Riemann sum converging as n grows”" },
  { num: "03", name: "Linear algebra", desc: "Vectors, matrix transforms, eigenvectors and spans.", ex: "“apply a shear matrix to the unit grid”" },
  { num: "04", name: "Geometry", desc: "Constructions, proofs, transformations and tilings.", ex: "“inscribe a hexagon and unroll its perimeter”" },
  { num: "05", name: "Trigonometry", desc: "Unit circle, wave build-ups, phase and amplitude.", ex: "“trace sin(x) out of the unit circle”" },
  { num: "06", name: "Probability", desc: "Distributions, sampling, and the law of large numbers.", ex: "“drop 500 balls through a Galton board”" },
];

export default function Features() {
  return (
    <div
      style={parseStyle(
        "font-family:'IBM Plex Sans',ui-sans-serif,system-ui; color:#16161a; background:#f7f6f3; overflow-x:hidden;",
      )}
    >
      <Nav active="features" />

      {/* header */}
      <section style={parseStyle("max-width:1180px; margin:0 auto; padding:78px 30px 46px;")}>
        <p style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#3b62e0; margin:0 0 18px;")}>
          Features
        </p>
        <div style={parseStyle("display:flex; align-items:flex-end; justify-content:space-between; gap:24px; flex-wrap:wrap;")}>
          <h1 style={parseStyle("margin:0; max-width:660px; font-family:'Space Grotesk'; font-weight:700; font-size:54px; line-height:1.02; letter-spacing:-0.035em;")}>
            Everything you need to turn an idea into an animation.
          </h1>
          <p style={parseStyle("margin:0 0 6px; font-family:'IBM Plex Mono',monospace; font-size:12px; line-height:1.9; color:#8a8a82; text-align:right;")}>
            04 steps
            <br />
            06 math domains
            <br />
            one sentence in
          </p>
        </div>
        <p style={parseStyle("margin:22px 0 0; max-width:520px; font-size:16.5px; line-height:1.6; color:#54545c;")}>
          Manition pairs a plain-language interface with a real rendering engine. Watch the whole
          pipeline below - it plays itself.
        </p>
      </section>

      {/* studio walkthrough */}
      <FeaturesStudio />

      {/* what it animates */}
      <section id="cap" style={parseStyle("max-width:1180px; margin:0 auto; padding:44px 30px 20px;")}>
        <div style={parseStyle("max-width:600px; margin-bottom:34px;")}>
          <h2 style={parseStyle("margin:0 0 12px; font-family:'Space Grotesk'; font-weight:700; font-size:32px; letter-spacing:-0.03em;")}>
            What can it animate?
          </h2>
          <p style={parseStyle("margin:0; font-size:15px; color:#6b6b73; line-height:1.6;")}>
            If Manim can draw it, you can describe it. A few of the things people reach for most:
          </p>
        </div>
        <div style={parseStyle("border-top:1px solid #e0dcd2;")}>
          {CAPS.map((c) => (
            <Hover
              key={c.num}
              as="div"
              className="fr-cap"
              style="display:grid; grid-template-columns:52px 1.05fr 1fr; gap:18px; align-items:baseline; border-bottom:1px solid #e0dcd2; padding:19px 8px; transition:background .15s;"
              hoverStyle={{ background: "#f1eee8" }}
            >
              <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12px; color:#a6a29a;")}>{c.num}</span>
              <div>
                <h3 style={parseStyle("margin:0 0 4px; font-family:'Space Grotesk'; font-weight:600; font-size:18px; letter-spacing:-0.01em;")}>{c.name}</h3>
                <p style={parseStyle("margin:0; font-size:13.5px; color:#6b6b73; line-height:1.55;")}>{c.desc}</p>
              </div>
              <p className="fr-ex" style={parseStyle("margin:0; font-family:'IBM Plex Mono',monospace; font-size:12px; line-height:1.6; color:#8a8a82; text-align:right;")}>{c.ex}</p>
            </Hover>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={parseStyle("max-width:1180px; margin:0 auto; padding:50px 30px 90px;")}>
        <div style={parseStyle("position:relative; overflow:hidden; background:#0c0c0f; border-radius:22px; padding:56px 40px; text-align:center;")}>
          <div style={parseStyle("position:absolute; inset:0; opacity:0.5; background:radial-gradient(600px 300px at 50% -10%, rgba(59,98,224,0.22), transparent);")}></div>
          <div style={parseStyle("position:relative;")}>
            <h2 style={parseStyle("margin:0 0 14px; font-family:'Space Grotesk'; font-weight:700; font-size:34px; letter-spacing:-0.03em; color:#f7f6f3;")}>
              See it move.
            </h2>
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
        </div>
      </section>

      <Footer />
    </div>
  );
}
