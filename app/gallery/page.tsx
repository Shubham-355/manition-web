import { parseStyle } from "../lib/css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import GalleryFilter, { type GalleryCard } from "../components/GalleryFilter";

const CARDS: GalleryCard[] = [
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
  {
    scene: "fourier",
    label: "Trigonometry",
    title: "Square wave from circles",
    prompt: "“build a square wave by stacking spinning circles”",
  },
  {
    scene: "lorenz",
    label: "Chaos",
    title: "The Lorenz butterfly",
    prompt: "“trace the Lorenz attractor”",
  },
  {
    scene: "pendulum",
    label: "Chaos",
    title: "Butterfly effect",
    prompt: "“nudge a double pendulum by 0.001 radians”",
  },
  {
    scene: "phyllo",
    label: "Geometry",
    title: "Sunflower spiral",
    prompt: "“grow a sunflower with the golden angle”",
  },
  {
    scene: "taylor",
    label: "Calculus",
    title: "Taylor series",
    prompt: "“approximate sin(x) with polynomials”",
  },
  {
    scene: "waves",
    label: "Physics",
    title: "Interference",
    prompt: "“ripple two waves through each other”",
  },
  {
    scene: "mandel",
    label: "Fractals",
    title: "The Mandelbrot set",
    prompt: "“render the Mandelbrot set line by line”",
  },
  {
    scene: "threebody",
    label: "Physics",
    title: "Three-body ballet",
    prompt: "“make three planets orbit in a figure-8”",
  },
  {
    scene: "modular",
    label: "Number theory",
    title: "Times-table cardioid",
    prompt: "“connect n to 2n around a circle, then sweep”",
  },
  {
    scene: "logistic",
    label: "Chaos",
    title: "Route to chaos",
    prompt: "“sweep r through the logistic map”",
  },
  {
    scene: "walk",
    label: "Probability",
    title: "Random walks",
    prompt: "“flip coins and show the √n envelope”",
  },
  {
    scene: "montecarlo",
    label: "Probability",
    title: "Estimating π with darts",
    prompt: "“throw random darts at a square, count the circle”",
  },
  {
    scene: "euler",
    label: "Trigonometry",
    title: "Euler's identity",
    prompt: "“walk e^iθ around the unit circle to −1”",
  },
  {
    scene: "collatz",
    label: "Number theory",
    title: "Hailstone numbers",
    prompt: "“race five Collatz sequences down to 1”",
  },
  {
    scene: "koch",
    label: "Fractals",
    title: "Koch snowflake",
    prompt: "“bend every edge into four, forever”",
  },
  {
    scene: "sieve",
    label: "Number theory",
    title: "Sieve of Eratosthenes",
    prompt: "“cross out the multiples, keep the primes”",
  },
  {
    scene: "limit",
    label: "Calculus",
    title: "The limit definition",
    prompt: "“slide h to zero until the secant kisses the curve”",
  },
  {
    scene: "fib",
    label: "Geometry",
    title: "Golden spiral",
    prompt: "“tile Fibonacci squares and sweep the spiral”",
  },
  {
    scene: "gameoflife",
    label: "Chaos",
    title: "Game of Life",
    prompt: "“run Conway's rules on gliders and blinkers”",
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

      <section style={parseStyle("max-width:1200px; margin:0 auto; padding:70px 30px 70px;")}>
        <p style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#3b62e0; margin:0 0 16px;")}>
          Gallery
        </p>
        <h1 style={parseStyle("margin:0; max-width:760px; font-family:'Space Grotesk'; font-weight:700; font-size:50px; line-height:1.05; letter-spacing:-0.035em;")}>
          Scenes made from a single sentence.
        </h1>
        <p style={parseStyle("margin:20px 0 0; max-width:560px; font-size:17px; line-height:1.6; color:#54545c;")}>
          Every clip below started as one plain-language prompt - press play and watch it render. The prompt is printed on each card; try to guess it before it plays.
        </p>

        <GalleryFilter cards={CARDS} />
      </section>

      <Footer />
    </div>
  );
}
