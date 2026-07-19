import { parseStyle } from "../lib/css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { Hover } from "../components/Interactive";
import GalleryVideo from "../components/GalleryVideo";

const pillActive =
  "font-size:13px; font-weight:600; color:#f7f6f3; background:#16161a; padding:8px 15px; border-radius:100px;";
const pill =
  "font-size:13px; font-weight:500; color:#4b4b52; background:#fff; border:1px solid #e6e2da; padding:8px 15px; border-radius:100px;";

type Card = {
  scene: string;
  label: string;
  title: string;
  prompt: string;
};

const CARDS: Card[] = [
  {
    scene: "sine",
    label: "Trigonometry",
    title: "Sine from a circle",
    prompt: "“trace a sine wave from a rotating circle”",
  },
  {
    scene: "riemann",
    label: "Calculus",
    title: "Area under a curve",
    prompt: "“shade the Riemann sum under a parabola”",
  },
  {
    scene: "vfield",
    label: "Linear algebra",
    title: "Vector field flow",
    prompt: "“animate a rotational vector field”",
  },
  {
    scene: "eigen",
    label: "Linear algebra",
    title: "Eigenvectors",
    prompt: "“show which vectors keep their direction”",
  },
  {
    scene: "pyth",
    label: "Geometry",
    title: "Pythagorean proof",
    prompt: "“prove a²+b² = c² by rearranging squares”",
  },
  {
    scene: "bell",
    label: "Probability",
    title: "Bell curve",
    prompt: "“build a normal distribution from samples”",
  },
  {
    scene: "tangent",
    label: "Calculus",
    title: "Tangent line",
    prompt: "“sweep the tangent along a cubic”",
  },
  {
    scene: "matrix",
    label: "Linear algebra",
    title: "Matrix transform",
    prompt: "“shear a grid with a 2×2 matrix”",
  },
  {
    scene: "primes",
    label: "Geometry",
    title: "Spiral of primes",
    prompt: "“plot primes on an Ulam spiral”",
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
        <p style={parseStyle("margin:20px 0 0; max-width:560px; font-size:17px; line-height:1.6; color:#54545c;")}>
          Every clip below started as one plain-language prompt - press play and watch it render. The prompt is printed on each card; try to guess it before it plays.
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
            <div key={i} className="gl-card">
              <div style={parseStyle("position:relative; aspect-ratio:16/10; background:#0a0a0d;")}>
                <GalleryVideo scene={card.scene} label={card.label} />
              </div>
              <div style={parseStyle("padding:15px 17px 16px;")}>
                <p style={parseStyle("margin:0 0 7px; font-family:'Space Grotesk'; font-weight:600; font-size:15.5px; color:#f4f4f5; letter-spacing:-0.01em;")}>
                  {card.title}
                </p>
                <p style={parseStyle("margin:0; font-size:12.5px; line-height:1.5; color:#8a8a92; font-style:italic;")}>
                  {card.prompt}
                </p>
              </div>
            </div>
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
