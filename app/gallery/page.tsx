import { parseStyle } from "../lib/css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import GalleryVideo from "../components/GalleryVideo";
import { Hover } from "../components/Interactive";

type Card = { scene: string; label: string; title: string; dur?: string; prompt: string; big?: boolean };
type Section = { id: string; num: string; set: string; heading: string; desc?: string; cards: Card[] };

const SECTIONS: Section[] = [
  {
    id: "showcase",
    num: "01",
    set: "Showcase",
    heading: "Showcase",
    desc: "The long ones. Full explainers and heavy renders, each still a single sentence away.",
    cards: [
      { scene: "stickhole", label: "Explainer", title: "How not to fall into a black hole", dur: "2:07", prompt: "“explain black holes with a stick figure, and make it funny”", big: true },
      { scene: "stickmess", label: "Explainer", title: "Why your room gets messy", dur: "0:54", prompt: "“explain entropy with a stick figure who just cleaned his room”" },
      { scene: "stickhotel", label: "Explainer", title: "The hotel that is always full", dur: "0:52", prompt: "“explain Hilbert's hotel with a stick figure who just wants one room”" },
      { scene: "origin", label: "Astrophysics", title: "How a world gets made", dur: "0:46", prompt: "“start with a cloud of dust and end with a world someone could stand on”" },
      { scene: "tree", label: "L-systems", title: "A year in one tree", dur: "0:34", prompt: "“grow a tree from one seed and run it through four seasons”" },
      { scene: "aurora", label: "Fields", title: "Northern lights", dur: "0:30", prompt: "“put the aurora over a frozen lake and let it drift”" },
      { scene: "terrain", label: "Procedural", title: "Flight over a range", dur: "0:20", prompt: "“fly me over mountains that were never surveyed”" },
      { scene: "deepzoom", label: "Fractals", title: "Endless zoom", dur: "0:18", prompt: "“fall into the Mandelbrot set and never hit the bottom”" },
      { scene: "supernova", label: "Astrophysics", title: "Supernova", dur: "0:15", prompt: "“blow up a star and follow the shockwave out”" },
      { scene: "nebula", label: "Astrophysics", title: "Nebula, condensing", dur: "0:16", prompt: "“grow an emission nebula out of the dark and light it up”" },
      { scene: "curl", label: "Fluids", title: "Dye in a curl field", dur: "0:16", prompt: "“pour dye into a swirling field and let it draw”" },
      { scene: "dejong", label: "Chaos", title: "Attractor, morphing", dur: "0:18", prompt: "“morph a de Jong attractor through its parameters”" },
      { scene: "neural", label: "Neural nets", title: "A signal, crossing", dur: "0:16", prompt: "“send one signal through a small neural network”" },
    ],
  },
  {
    id: "fractals",
    num: "02",
    set: "Fractals",
    heading: "Fractals & self-similarity",
    cards: [
      { scene: "koch", label: "Fractals", title: "Koch snowflake", prompt: "“bend every edge into four, forever”" },
      { scene: "chaosgame", label: "Fractals", title: "A fern from dice", prompt: "“roll four matrices at random until a fern grows”" },
      { scene: "apollonian", label: "Geometry", title: "Apollonian gasket", prompt: "“pack a circle with circles until the gaps run out”" },
      { scene: "hilbert", label: "Geometry", title: "Hilbert curve", prompt: "“fill a square with one unbroken line”" },
    ],
  },
  {
    id: "chaos",
    num: "03",
    set: "Chaos",
    heading: "Chaos & dynamics",
    cards: [
      { scene: "lorenz", label: "Chaos", title: "The Lorenz butterfly", prompt: "“trace the Lorenz attractor”" },
      { scene: "pendulum", label: "Chaos", title: "Butterfly effect", prompt: "“nudge a double pendulum by 0.001 radians”" },
      { scene: "logistic", label: "Chaos", title: "Route to chaos", prompt: "“sweep r through the logistic map”" },
      { scene: "threebody", label: "Physics", title: "Three-body ballet", prompt: "“make three planets orbit in a figure-8”" },
      { scene: "boids", label: "Emergence", title: "Flocking", prompt: "“give 130 birds three rules, then add a hawk”" },
      { scene: "gameoflife", label: "Chaos", title: "Game of Life", prompt: "“run Conway's rules on gliders and blinkers”" },
      { scene: "turing", label: "Emergence", title: "Turing patterns", prompt: "“let two chemicals fight until stripes appear”" },
    ],
  },
  {
    id: "geometry",
    num: "04",
    set: "Geometry",
    heading: "Algebra & geometry",
    cards: [
      { scene: "eigen", label: "Linear algebra", title: "Eigenvectors", prompt: "“show which vectors keep their direction”" },
      { scene: "matrix", label: "Linear algebra", title: "Matrix transform", prompt: "“shear a grid with a 2×2 matrix”" },
      { scene: "vfield", label: "Linear algebra", title: "Vector field flow", prompt: "“animate a rotational vector field”" },
      { scene: "pyth", label: "Geometry", title: "Pythagorean proof", prompt: "“prove a²+b² = c² by rearranging squares”" },
      { scene: "tesseract", label: "Topology", title: "Square to hypercube", prompt: "“unfold a square into 3D, then into 4D”" },
      { scene: "fib", label: "Geometry", title: "Golden spiral", prompt: "“tile Fibonacci squares and sweep the spiral”" },
      { scene: "phyllo", label: "Geometry", title: "Sunflower spiral", prompt: "“grow a sunflower with the golden angle”" },
    ],
  },
  {
    id: "numbers",
    num: "05",
    set: "Numbers",
    heading: "Numbers & chance",
    cards: [
      { scene: "primes", label: "Geometry", title: "Spiral of primes", prompt: "“plot primes on an Ulam spiral”" },
      { scene: "modular", label: "Number theory", title: "Times-table cardioid", prompt: "“connect n to 2n around a circle, then sweep”" },
      { scene: "collatz", label: "Number theory", title: "Hailstone numbers", prompt: "“race five Collatz sequences down to 1”" },
      { scene: "sieve", label: "Number theory", title: "Sieve of Eratosthenes", prompt: "“cross out the multiples, keep the primes”" },
      { scene: "bell", label: "Probability", title: "Bell curve", prompt: "“build a normal distribution from samples”" },
      { scene: "walk", label: "Probability", title: "Random walks", prompt: "“flip coins and show the √n envelope”" },
      { scene: "montecarlo", label: "Probability", title: "Estimating π with darts", prompt: "“throw random darts at a square, count the circle”" },
    ],
  },
  {
    id: "calculus",
    num: "06",
    set: "Calculus",
    heading: "Calculus & analysis",
    cards: [
      { scene: "riemann", label: "Calculus", title: "Area under a curve", prompt: "“shade the Riemann sum under a parabola”" },
      { scene: "tangent", label: "Calculus", title: "Tangent line", prompt: "“sweep the tangent along a cubic”" },
      { scene: "taylor", label: "Calculus", title: "Taylor series", prompt: "“approximate sin(x) with polynomials”" },
      { scene: "limit", label: "Calculus", title: "The limit definition", prompt: "“slide h to zero until the secant kisses the curve”" },
    ],
  },
  {
    id: "waves",
    num: "07",
    set: "Waves",
    heading: "Circles & waves",
    cards: [
      { scene: "sine", label: "Trigonometry", title: "Sine from a circle", prompt: "“trace a sine wave from a rotating circle”" },
      { scene: "fourier", label: "Trigonometry", title: "Square wave from circles", prompt: "“build a square wave by stacking spinning circles”" },
      { scene: "euler", label: "Trigonometry", title: "Euler's identity", prompt: "“walk e^iθ around the unit circle to −1”" },
    ],
  },
  {
    id: "space",
    num: "08",
    set: "Space",
    heading: "Space & physics",
    cards: [
      { scene: "galaxy", label: "Physics", title: "Galaxy collision", prompt: "“throw two galaxies through each other”" },
      { scene: "waves", label: "Physics", title: "Interference", prompt: "“ripple two waves through each other”" },
    ],
  },
];

const arrow = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="M13 6l6 6-6 6"></path>
  </svg>
);

const durBadge =
  "flex:none; font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:#8a8a92; border:1px solid #2a2a32; padding:2px 6px; border-radius:5px;";
const promptLine = "margin:0; line-height:1.5; color:#8a8a92; font-style:italic;";

function SceneCard({ card, lead }: { card: Card; lead?: boolean }) {
  return (
    <div className="gl-card">
      <div style={parseStyle("position:relative; aspect-ratio:16/10; background:#0a0a0d;")}>
        <GalleryVideo scene={card.scene} label={card.label} />
      </div>
      <div style={parseStyle(lead ? "padding:16px 19px 18px;" : "padding:15px 17px 16px;")}>
        {card.dur ? (
          <div style={parseStyle(`display:flex; align-items:baseline; justify-content:space-between; gap:${lead ? "14px" : "12px"}; margin:0 0 ${lead ? "6px" : "7px"};`)}>
            <p style={parseStyle(`margin:0; font-family:'Space Grotesk'; font-weight:600; font-size:${card.big ? "19px" : "15.5px"}; color:#f4f4f5; letter-spacing:${card.big ? "-0.015em" : "-0.01em"};`)}>
              {card.title}
            </p>
            <span style={parseStyle(durBadge)}>{card.dur}</span>
          </div>
        ) : (
          <p style={parseStyle("margin:0 0 7px; font-family:'Space Grotesk'; font-weight:600; font-size:15.5px; color:#f4f4f5; letter-spacing:-0.01em;")}>
            {card.title}
          </p>
        )}
        <p style={parseStyle(`${promptLine} font-size:${lead ? "13px" : "12.5px"};`)}>{card.prompt}</p>
      </div>
    </div>
  );
}

function SectionHead({ section, first }: { section: Section; first?: boolean }) {
  return (
    <div
      id={section.id}
      style={parseStyle(
        `scroll-margin-top:96px; margin:${first ? "0" : "clamp(46px,5.6vw,70px)"} 0 clamp(15px,2vw,22px); padding-top:15px; border-top:1px solid #ddd8cc; display:grid; grid-template-columns:auto minmax(0,1fr); align-items:baseline; gap:clamp(11px,1.5vw,20px);`,
      )}
    >
      <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:0.14em; color:#3b62e0;")}>{section.num}</span>
      <h2
        style={parseStyle(
          `margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:${first ? "clamp(24px,3.2vw,34px)" : "clamp(22px,2.9vw,31px)"}; letter-spacing:${first ? "-0.032em" : "-0.03em"}; line-height:1.05; color:#16161a;`,
        )}
      >
        {section.heading}
      </h2>
    </div>
  );
}

export default function Gallery() {
  const [showcase, ...rest] = SECTIONS;

  return (
    <div style={parseStyle("font-family:'IBM Plex Sans',ui-sans-serif,system-ui; color:#16161a; background:#f7f6f3; overflow-x:hidden;")}>
      <Nav active="gallery" />

      <section className="gl-wrap" style={parseStyle("max-width:1200px; margin:0 auto; padding:clamp(43px,5.8vw,70px) clamp(18px,4vw,30px) clamp(17px,2.3vw,28px);")}>
        <div className="gl-hero" style={parseStyle("display:grid; grid-template-columns:minmax(0,1.08fr) minmax(0,0.92fr); gap:clamp(26px,4vw,64px); align-items:end;")}>
          <div style={parseStyle("min-width:0;")}>
            <p style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#3b62e0; margin:0 0 16px;")}>Gallery</p>
            <h1 style={parseStyle("margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(34px,7vw,54px); line-height:1.02; letter-spacing:-0.038em;")}>
              Scenes made from
              <br />a single sentence.
            </h1>
          </div>
          <div style={parseStyle("min-width:0; padding-bottom:clamp(2px,0.6vw,7px);")}>
            <p style={parseStyle("margin:0; max-width:460px; font-size:17px; line-height:1.6; color:#54545c; text-wrap:pretty;")}>
              Every clip below started as one plain-language prompt - press play and watch it render. The prompt is printed on each card; try to guess it before it plays.
            </p>
            <p style={parseStyle("margin:16px 0 0; font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:0.06em; color:#8b8779;")}>
              1080p &nbsp;·&nbsp; 60fps &nbsp;·&nbsp; rendered, not stitched
            </p>
          </div>
        </div>

        <div style={parseStyle("display:flex; align-items:baseline; justify-content:space-between; gap:14px; margin:clamp(32px,4.4vw,52px) 0 13px;")}>
          <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:0.18em; text-transform:uppercase; color:#8b8779;")}>Sets</span>
        </div>

        <div className="gl-sets" style={parseStyle("display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:1px; background:#e2ddd2; border:1px solid #e2ddd2; border-radius:14px; overflow:hidden;")}>
          {SECTIONS.map((s, i) => (
            <a
              key={s.id}
              href={"#" + s.id}
              className={i === 0 ? "gl-cell gl-cell-dark" : "gl-cell"}
              style={parseStyle("display:flex; flex-direction:column; gap:18px; text-decoration:none; padding:14px 15px 15px;")}
            >
              <span style={parseStyle(`display:flex; align-items:center; justify-content:space-between; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.16em; color:${i === 0 ? "#6f6f7a" : "#b3ad9e"};`)}>
                {s.num}
              </span>
              <span style={parseStyle("display:flex; align-items:center; gap:7px; font-family:'Space Grotesk'; font-weight:600; font-size:16.5px; letter-spacing:-0.018em; line-height:1.15;")}>
                {s.set}
                <span className="gl-arrow">{arrow}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="gl-wrap" style={parseStyle("max-width:1200px; margin:0 auto; padding:clamp(30px,3.8vw,46px) clamp(18px,4vw,30px) 0;")}>
        <SectionHead section={showcase} first />
        <p style={parseStyle("margin:-6px 0 clamp(20px,2.6vw,30px); max-width:560px; font-size:15px; line-height:1.65; color:#6b6b73; text-wrap:pretty;")}>{showcase.desc}</p>
        <div className="gl-sheet gl-sheet-lead">
          {showcase.cards.map((c, i) => (
            <SceneCard key={c.scene} card={c} lead={i < 2} />
          ))}
        </div>
      </section>

      <section className="gl-wrap" style={parseStyle("max-width:1200px; margin:0 auto; padding:0 clamp(18px,4vw,30px) clamp(46px,6vw,74px);")}>
        {rest.map((s) => (
          <div key={s.id}>
            <SectionHead section={s} />
            <div className="gl-sheet">
              {s.cards.map((c) => (
                <SceneCard key={c.scene} card={c} />
              ))}
            </div>
          </div>
        ))}

        <div
          className="gl-cta"
          style={parseStyle(
            "margin-top:clamp(48px,6.2vw,76px); background:#f7f6f3; border:1px solid #e6e2da; border-radius:20px; padding:clamp(26px,3.6vw,44px); display:grid; grid-template-columns:minmax(0,1fr) auto; gap:clamp(20px,3vw,40px); align-items:center;",
          )}
        >
          <div style={parseStyle("min-width:0;")}>
            <p style={parseStyle("margin:0 0 13px; font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:0.18em; text-transform:uppercase; color:#3b62e0;")}>Your turn</p>
            <h2 style={parseStyle("margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(24px,3.4vw,34px); line-height:1.08; letter-spacing:-0.032em; color:#16161a;")}>
              Every scene here was one sentence.
            </h2>
            <p style={parseStyle("margin:15px 0 0; max-width:520px; font-size:15px; line-height:1.65; color:#54545c; text-wrap:pretty;")}>
              Write yours and Manition renders it in 1080p. Nothing to install, no timeline to learn.
            </p>
          </div>
          <Hover
            as="a"
            href="/#waitlist"
            style="justify-self:end; display:inline-flex; align-items:center; gap:9px; white-space:nowrap; text-decoration:none; background:#16161a; color:#f7f6f3; font-size:15px; font-weight:600; padding:15px 25px; border-radius:12px; transition:background .16s;"
            hoverStyle={{ background: "#000" }}
          >
            Join the waitlist
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
