import { Fragment } from "react";
import Link from "next/link";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Reveal from "./components/Reveal";
import Magnetic from "./components/Magnetic";
import ManitionDemo from "./components/film/ManitionDemo";
import PicksSection from "./components/PicksSection";
import { Hover, WaitlistForm } from "./components/Interactive";

const arrow = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="M13 6l6 6-6 6"></path>
  </svg>
);

const TICKER = [
  "grow a tree from one seed and run it through four seasons",
  "bend starlight around a black hole",
  "explain entropy with a stick figure who just cleaned his room",
  "fill a square with one unbroken line",
  "put the aurora over a frozen lake and let it drift",
  "throw two galaxies through each other",
  "sweep a Lissajous figure through every ratio",
];

const STEPS = [
  {
    n: "01",
    title: "Describe it",
    body: "Type what you want to show, the way you would say it to a friend. No syntax to learn, no timeline to scrub.",
  },
  {
    n: "02",
    title: "Watch it appear",
    body: "Manition renders while you wait. Ask for changes in plain words until it says what you meant.",
  },
  {
    n: "03",
    title: "Share it",
    body: "Take the file. Drop it in a lecture, a thread, a lesson plan, or a group chat.",
  },
];

const PICKS = [
  { scene: "tree", title: "A year in one tree", prompt: "“grow a tree from one seed and run it through four seasons”" },
  { scene: "aurora", title: "Northern lights", prompt: "“put the aurora over a frozen lake and let it drift”" },
  { scene: "blackhole", title: "Lensed light", prompt: "“bend starlight around a black hole”" },
  { scene: "origin", title: "How a world gets made", prompt: "“start with a cloud of dust and end with a world someone could stand on”" },
  { scene: "phyllo", title: "Sunflower spiral", prompt: "“grow a sunflower with the golden angle”" },
  { scene: "lorenz", title: "The Lorenz butterfly", prompt: "“trace the Lorenz attractor”" },
  { scene: "fourier", title: "Square wave from circles", prompt: "“build a square wave by stacking spinning circles”" },
  { scene: "boids", title: "Flocking", prompt: "“give 130 birds three rules, then add a hawk”" },
  { scene: "kaleido", title: "Mandala, drawn once", prompt: "“mirror one wandering curve twelve ways until it blooms”" },
  { scene: "galaxy", title: "Galaxy collision", prompt: "“throw two galaxies through each other”" },
  { scene: "supernova", title: "Supernova", prompt: "“blow up a star and follow the shockwave out”" },
  { scene: "terrain", title: "Flight over a range", prompt: "“fly me over mountains that were never surveyed”" },
];

const QUOTE: { w: string; on?: boolean }[] = [
  ...["Made", "for", "teachers", "who", "want", "the", "class", "to", "see", "it,", "creators", "who", "want", "a", "better", "visual,", "and", "anyone", "who", "has", "ever", "said"].map((w) => ({ w })),
  ...["“it", "is", "hard", "to", "explain,", "but…”"].map((w) => ({ w, on: true })),
];

export default function Home() {
  return (
    <div className="hm-page">
      <div className="grain" aria-hidden="true"></div>

      <Nav active="home" />

      {/* ============ HERO — unequal split inside the content column ============ */}
      <section className="hm-hero">
        <div className="hm-hero-copy">
          <p className="hm-eyebrow">
            Manition <span aria-hidden="true">&#47;&#47;</span> text to animation
          </p>
          <h1 className="hm-h1">
            Say it.
            <br />
            Watch
            <br />
            it move.
          </h1>
          <div className="hm-actions">
            <Magnetic>
              <Hover
                as="a"
                href="#waitlist"
                className="hm-btn"
                style="display:inline-flex; align-items:center; gap:10px; text-decoration:none; background:#16161a; color:#f7f6f3; font-size:15.5px; font-weight:600; padding:16px 26px; border:1px solid #16161a;"
                hoverStyle={{ background: "#000" }}
              >
                Join the waitlist
                {arrow}
              </Hover>
            </Magnetic>
            <Link href="/gallery" className="hm-link">
              See examples
            </Link>
          </div>
        </div>

        <Reveal className="hm-film hm-film-rv">
          <div id="demo" className="hm-film-frame">
            <ManitionDemo />
          </div>
        </Reveal>
      </section>

      {/* ============ TICKER — repeating type as texture ============ */}
      <div className="hm-ticker" aria-hidden="true">
        <div className="mq">
          <div className="mq-row">
            {TICKER.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="mq-row">
            {TICKER.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ============ STEPS — editorial rows, not a card grid ============ */}
      <section className="hm-band">
        <div className="hm-wrap">
          <h2 className="hm-h2 hm-h2-wide">
            Three steps.
            <br />
            That is the whole thing.
          </h2>
          <ol className="hm-steps">
            {STEPS.map((s) => (
              <li key={s.n}>
                <Reveal className="hm-step rvm-rule">
                  <span className="hm-step-n">{s.n}</span>
                  <div className="hm-step-body">
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ PICKS — paged strip, hands off to the gallery at the end ============ */}
      <PicksSection picks={PICKS} />

      {/* ============ STATEMENT ============ */}
      <section className="hm-quote">
        <Reveal>
          <p>
            {QUOTE.map((q, i) => (
              <Fragment key={`${q.w}-${i}`}>
                <span className={q.on ? "hm-word on" : "hm-word"}>
                  <span style={{ transitionDelay: `${i * 22}ms` }}>{q.w}</span>
                </span>{" "}
              </Fragment>
            ))}
          </p>
        </Reveal>
      </section>

      {/* ============ JOIN — the page darkens into the footer ============ */}
      <section id="waitlist" className="hm-join">
        <div className="hm-join-inner">
          <div className="hm-join-copy">
            <p className="hm-eyebrow hm-eyebrow-dim">Early access</p>
            <h2 className="hm-h2 hm-h2-light">
              Be there
              <br />
              on day one.
            </h2>
          </div>
          <div className="hm-join-form">
            <p className="hm-join-lede">
              We are letting people in a few at a time. Leave your email and we will send one message when it is your
              turn.
            </p>
            <WaitlistForm tone="ink" />
            <p className="hm-join-fine">
              4,200+ already waiting <span aria-hidden="true">&middot;</span> no spam <span aria-hidden="true">&middot;</span> no card
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
