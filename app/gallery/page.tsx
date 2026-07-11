import type { ReactNode } from "react";
import { parseStyle } from "../lib/css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { Hover } from "../components/Interactive";

const pillActive =
  "font-size:13px; font-weight:600; color:#f7f6f3; background:#16161a; padding:8px 15px; border-radius:100px;";
const pill =
  "font-size:13px; font-weight:500; color:#4b4b52; background:#fff; border:1px solid #e6e2da; padding:8px 15px; border-radius:100px;";

const thumb =
  "aspect-ratio:16/10; position:relative; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at 50% 42%,#16161f,#0a0a0d);";
const catBadge =
  "position:absolute; top:11px; left:12px; font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.04em; color:#8a8a92; background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.06); padding:3px 7px; border-radius:5px;";
const durBadge =
  "position:absolute; bottom:11px; right:12px; font-family:'IBM Plex Mono',monospace; font-size:9.5px; color:#c8c8cc; background:rgba(0,0,0,0.55); padding:3px 7px; border-radius:5px;";
const playWrap =
  "position:absolute; bottom:11px; left:12px; width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,0.92); display:flex; align-items:center; justify-content:center;";

type Card = {
  category: string;
  duration: string;
  title: string;
  prompt: string;
  svg: ReactNode;
};

const CARDS: Card[] = [
  {
    category: "Trigonometry",
    duration: "0:12",
    title: "Sine from a circle",
    prompt: "“trace a sine wave from a rotating circle”",
    svg: (
      <>
        <circle cx="42" cy="65" r="30" stroke="#33333d" strokeWidth="1.4"></circle>
        <path d="M42 65 L64 52" stroke="#c2913a" strokeWidth="2"></path>
        <circle cx="64" cy="52" r="4" fill="#c2913a"></circle>
        <path d="M72 65 Q 100 15 128 65 T 184 65" stroke="#7ea6d9" strokeWidth="2.6"></path>
      </>
    ),
  },
  {
    category: "Calculus",
    duration: "0:18",
    title: "Area under a curve",
    prompt: "“shade the Riemann sum under a parabola”",
    svg: (
      <>
        <line x1="20" y1="105" x2="184" y2="105" stroke="#33333d" strokeWidth="1.2"></line>
        <path d="M28 100 C 70 100 74 30 102 30 C 130 30 134 100 176 100" stroke="#7ea6d9" strokeWidth="2.4"></path>
        <g fill="#7ea6d9" opacity="0.16">
          <rect x="60" y="58" width="16" height="47"></rect>
          <rect x="78" y="42" width="16" height="63"></rect>
          <rect x="96" y="34" width="16" height="71"></rect>
          <rect x="114" y="42" width="16" height="63"></rect>
        </g>
      </>
    ),
  },
  {
    category: "Linear algebra",
    duration: "0:15",
    title: "Vector field flow",
    prompt: "“animate a rotational vector field”",
    svg: (
      <>
        <g stroke="#5fbf7e" strokeWidth="1.6">
          <line x1="40" y1="90" x2="58" y2="66"></line>
          <line x1="82" y1="96" x2="100" y2="60"></line>
          <line x1="126" y1="90" x2="144" y2="70"></line>
          <line x1="60" y1="46" x2="80" y2="34"></line>
          <line x1="110" y1="44" x2="130" y2="34"></line>
        </g>
        <g fill="#5fbf7e">
          <path d="M58 66 l-6 1 5 4 1-5Z"></path>
          <path d="M100 60 l-6 1 5 4 1-5Z"></path>
          <path d="M144 70 l-6 1 5 4 1-5Z"></path>
          <path d="M80 34 l-6 1 5 4 1-5Z"></path>
          <path d="M130 34 l-6 1 5 4 1-5Z"></path>
        </g>
      </>
    ),
  },
  {
    category: "Linear algebra",
    duration: "0:20",
    title: "Eigenvectors",
    prompt: "“show which vectors keep their direction”",
    svg: (
      <>
        <line x1="20" y1="65" x2="184" y2="65" stroke="#26262c" strokeWidth="1"></line>
        <line x1="102" y1="12" x2="102" y2="118" stroke="#26262c" strokeWidth="1"></line>
        <line x1="102" y1="65" x2="160" y2="30" stroke="#c2913a" strokeWidth="2.4"></line>
        <line x1="102" y1="65" x2="150" y2="100" stroke="#7ea6d9" strokeWidth="2.4"></line>
        <path d="M160 30 l-9 0 4 7 5-7Z" fill="#c2913a"></path>
        <path d="M150 100 l-8 -3 1 8 7-5Z" fill="#7ea6d9"></path>
      </>
    ),
  },
  {
    category: "Geometry",
    duration: "0:16",
    title: "Pythagorean proof",
    prompt: "“prove a²+b² = c² by rearranging squares”",
    svg: (
      <>
        <polygon points="70,40 130,40 130,100 70,100" fill="none" stroke="#33333d" strokeWidth="1.4"></polygon>
        <polygon points="70,40 130,40 100,72" fill="#7ea6d9" opacity="0.2" stroke="#7ea6d9" strokeWidth="1.6"></polygon>
        <rect x="44" y="100" width="26" height="26" fill="#c2913a" opacity="0.18" stroke="#c2913a" strokeWidth="1.4"></rect>
        <rect x="130" y="14" width="26" height="26" fill="#5fbf7e" opacity="0.18" stroke="#5fbf7e" strokeWidth="1.4"></rect>
      </>
    ),
  },
  {
    category: "Probability",
    duration: "0:14",
    title: "Bell curve",
    prompt: "“build a normal distribution from samples”",
    svg: (
      <>
        <line x1="20" y1="104" x2="184" y2="104" stroke="#33333d" strokeWidth="1.2"></line>
        <path d="M24 102 C 70 102 78 34 102 34 C 126 34 134 102 180 102" stroke="#7ea6d9" strokeWidth="2.6"></path>
        <g fill="#5fbf7e" opacity="0.5">
          <rect x="86" y="70" width="9" height="34"></rect>
          <rect x="97" y="52" width="9" height="52"></rect>
          <rect x="108" y="66" width="9" height="38"></rect>
        </g>
      </>
    ),
  },
  {
    category: "Calculus",
    duration: "0:13",
    title: "Tangent line",
    prompt: "“sweep the tangent along a cubic”",
    svg: (
      <>
        <line x1="20" y1="70" x2="184" y2="70" stroke="#26262c" strokeWidth="1"></line>
        <path d="M34 108 C 72 108 78 24 102 46 C 126 68 132 20 170 20" stroke="#7ea6d9" strokeWidth="2.4"></path>
        <line x1="70" y1="94" x2="134" y2="44" stroke="#c2913a" strokeWidth="2"></line>
        <circle cx="102" cy="69" r="4" fill="#c2913a"></circle>
      </>
    ),
  },
  {
    category: "Linear algebra",
    duration: "0:17",
    title: "Matrix transform",
    prompt: "“shear a grid with a 2×2 matrix”",
    svg: (
      <>
        <g stroke="#26262c" strokeWidth="1">
          <line x1="40" y1="30" x2="150" y2="30"></line>
          <line x1="52" y1="60" x2="162" y2="60"></line>
          <line x1="64" y1="90" x2="174" y2="90"></line>
          <line x1="52" y1="24" x2="76" y2="96"></line>
          <line x1="86" y1="24" x2="110" y2="96"></line>
          <line x1="120" y1="24" x2="144" y2="96"></line>
        </g>
        <line x1="90" y1="60" x2="140" y2="44" stroke="#7ea6d9" strokeWidth="2.4"></line>
        <path d="M140 44 l-8 -1 3 7 5-6Z" fill="#7ea6d9"></path>
      </>
    ),
  },
  {
    category: "Geometry",
    duration: "0:22",
    title: "Spiral of primes",
    prompt: "“plot primes on an Ulam spiral”",
    svg: (
      <>
        <path d="M100 65 a 6 6 0 1 1 12 6 a 14 14 0 1 1 -26 4 a 24 24 0 1 1 42 8 a 34 34 0 1 1 -58 6" stroke="#33333d" strokeWidth="1.4" fill="none"></path>
        <g fill="#c2913a">
          <circle cx="112" cy="71" r="2.6"></circle>
          <circle cx="86" cy="75" r="2.6"></circle>
          <circle cx="128" cy="79" r="2.6"></circle>
          <circle cx="70" cy="61" r="2.6"></circle>
          <circle cx="118" cy="46" r="2.6"></circle>
          <circle cx="92" cy="98" r="2.6"></circle>
        </g>
      </>
    ),
  },
];

export default function Gallery() {
  return (
    <div
      style={parseStyle(
        "font-family:'IBM Plex Sans',ui-sans-serif,system-ui; color:#16161a; background:#f7f6f3; overflow-x:hidden;",
      )}
    >
      <Nav active="gallery" />

      <section style={parseStyle("max-width:1200px; margin:0 auto; padding:70px 30px 28px;")}>
        <p style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#3b62e0; margin:0 0 16px;")}>
          Gallery
        </p>
        <h1 style={parseStyle("margin:0; max-width:760px; font-family:'Space Grotesk'; font-weight:700; font-size:50px; line-height:1.05; letter-spacing:-0.035em;")}>
          Scenes made from a single sentence.
        </h1>
        <p style={parseStyle("margin:20px 0 0; max-width:540px; font-size:17px; line-height:1.6; color:#54545c;")}>
          Every clip below started as one plain-language prompt. The prompt is printed on each card - try to guess it, then imagine your own.
        </p>

        <div style={parseStyle("display:flex; flex-wrap:wrap; gap:9px; margin-top:30px;")}>
          <span style={parseStyle(pillActive)}>All</span>
          <span style={parseStyle(pill)}>Calculus</span>
          <span style={parseStyle(pill)}>Linear algebra</span>
          <span style={parseStyle(pill)}>Trigonometry</span>
          <span style={parseStyle(pill)}>Geometry</span>
          <span style={parseStyle(pill)}>Probability</span>
        </div>
      </section>

      <section style={parseStyle("max-width:1200px; margin:0 auto; padding:14px 30px 70px;")}>
        <div className="gl-grid" style={parseStyle("display:grid; grid-template-columns:repeat(3,1fr); gap:18px;")}>
          {CARDS.map((card, i) => (
            <a key={i} href="#" className="gl-card">
              <div style={parseStyle(thumb)}>
                <svg viewBox="0 0 200 130" style={parseStyle("width:74%; height:66%; display:block")} fill="none">
                  {card.svg}
                </svg>
                <span style={parseStyle(catBadge)}>{card.category}</span>
                <span style={parseStyle(durBadge)}>{card.duration}</span>
                <span style={parseStyle(playWrap)}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#16161a">
                    <polygon points="6 4 20 12 6 20 6 4"></polygon>
                  </svg>
                </span>
              </div>
              <div style={parseStyle("padding:15px 17px 16px;")}>
                <p style={parseStyle("margin:0 0 7px; font-family:'Space Grotesk'; font-weight:600; font-size:15.5px; color:#f4f4f5; letter-spacing:-0.01em;")}>
                  {card.title}
                </p>
                <p style={parseStyle("margin:0; font-size:12.5px; line-height:1.5; color:#8a8a92; font-style:italic;")}>
                  {card.prompt}
                </p>
              </div>
            </a>
          ))}
        </div>

        <div style={parseStyle("text-align:center; margin-top:44px;")}>
          <Hover
            as="a"
            href="/#waitlist"
            style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; background:#16161a; color:#f7f6f3; font-size:15px; font-weight:600; padding:14px 24px; border-radius:12px;"
            hoverStyle={{ background: "#000" }}
          >
            Make your own{" "}
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
