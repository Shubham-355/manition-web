import type { ReactNode } from "react";
import Link from "next/link";
import { parseStyle } from "../lib/css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { Hover, DocsSearch } from "../components/Interactive";

const catCard =
  "text-decoration:none; color:inherit; background:#fff; border:1px solid #e6e2da; border-radius:16px; padding:26px; display:block; transition:border-color .15s, transform .15s;";
const catHover = { borderColor: "#c9c4b8", transform: "translateY(-3px)" };
const catH3 = "margin:0 0 7px; font-family:'Space Grotesk'; font-weight:600; font-size:17px;";
const catP = "margin:0 0 14px; font-size:13.5px; line-height:1.6; color:#6b6b73;";
const catCount = "font-family:'IBM Plex Mono',monospace; font-size:11px; color:#9a9aa2;";

const iconAttrs = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

type Cat = { wrap: string; icon: ReactNode; title: string; desc: string; count: string };

const CATS: Cat[] = [
  {
    wrap: "background:#eef2fd; color:#3b62e0;",
    icon: <svg {...iconAttrs}><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"></path></svg>,
    title: "Getting started",
    desc: "Your first prompt, previewing a scene, and downloading the render.",
    count: "6 guides",
  },
  {
    wrap: "background:#f0eef8; color:#5b46d9;",
    icon: (
      <svg {...iconAttrs}>
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
      </svg>
    ),
    title: "Writing good prompts",
    desc: "Patterns that produce clear scenes - pacing, labels, emphasis and style.",
    count: "8 guides",
  },
  {
    wrap: "background:#fbf3e4; color:#c2913a;",
    icon: (
      <svg {...iconAttrs}>
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    ),
    title: "Working with code",
    desc: "Reading, editing and exporting the generated Manim source.",
    count: "5 guides",
  },
  {
    wrap: "background:#e9f5ec; color:#2f7a4a;",
    icon: (
      <svg {...iconAttrs}>
        <rect x="2" y="5" width="14" height="14" rx="2"></rect>
        <polygon points="22 7 16 12 22 17"></polygon>
      </svg>
    ),
    title: "Rendering & exports",
    desc: "Resolutions, formats, transparent backgrounds and render queues.",
    count: "7 guides",
  },
  {
    wrap: "background:#eef2fd; color:#3b62e0;",
    icon: <svg {...iconAttrs}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
    title: "Chats & library",
    desc: "Organizing scenes, starring, searching and re-rendering old work.",
    count: "4 guides",
  },
  {
    wrap: "background:#fdeeee; color:#c2504f;",
    icon: (
      <svg {...iconAttrs}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    ),
    title: "Troubleshooting",
    desc: "Failed renders, scene errors, and what to do when a prompt goes sideways.",
    count: "5 guides",
  },
];

const POPULAR = [
  { n: "01", title: "Writing your first prompt", last: false },
  { n: "02", title: "Exporting with a transparent background", last: false },
  { n: "03", title: "Asking for changes without starting over", last: false },
  { n: "04", title: "Running exported Manim code locally", last: true },
];

const arrowSmall = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9a9aa2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="M13 6l6 6-6 6"></path>
  </svg>
);

export default function Docs() {
  return (
    <div
      style={parseStyle(
        "font-family:'IBM Plex Sans',ui-sans-serif,system-ui; color:#16161a; background:#f7f6f3; overflow-x:hidden;",
      )}
    >
      <Nav active="docs" />

      {/* header + search */}
      <section style={parseStyle("max-width:820px; margin:0 auto; padding:72px 30px 26px; text-align:center;")}>
        <p style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#3b62e0; margin:0 0 16px;")}>
          Docs
        </p>
        <h1 style={parseStyle("margin:0 auto; font-family:'Space Grotesk'; font-weight:700; font-size:46px; line-height:1.06; letter-spacing:-0.035em;")}>
          How can we help?
        </h1>
        <DocsSearch />
      </section>

      {/* doc categories */}
      <section style={parseStyle("max-width:1120px; margin:0 auto; padding:30px 30px 20px;")}>
        <div className="dc-grid" style={parseStyle("display:grid; grid-template-columns:repeat(3,1fr); gap:16px;")}>
          {CATS.map((c) => (
            <Hover key={c.title} as="a" href="#" style={catCard} hoverStyle={catHover}>
              <div style={parseStyle(`width:38px; height:38px; border-radius:10px; ${c.wrap} display:flex; align-items:center; justify-content:center; margin-bottom:16px;`)}>
                {c.icon}
              </div>
              <h3 style={parseStyle(catH3)}>{c.title}</h3>
              <p style={parseStyle(catP)}>{c.desc}</p>
              <span style={parseStyle(catCount)}>{c.count}</span>
            </Hover>
          ))}
        </div>
      </section>

      {/* popular articles */}
      <section style={parseStyle("max-width:820px; margin:0 auto; padding:44px 30px 30px;")}>
        <h2 style={parseStyle("margin:0 0 20px; font-family:'Space Grotesk'; font-weight:700; font-size:22px; letter-spacing:-0.02em;")}>
          Popular right now
        </h2>
        <div style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:16px; overflow:hidden;")}>
          {POPULAR.map((p) => (
            <Hover
              key={p.n}
              as="a"
              href="#"
              style={`display:flex; align-items:center; gap:14px; padding:17px 22px; text-decoration:none; color:inherit;${p.last ? "" : " border-bottom:1px solid #f2eee6;"}`}
              hoverStyle={{ background: "#faf8f4" }}
            >
              <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#9a9aa2; width:22px;")}>{p.n}</span>
              <span style={parseStyle("flex:1; font-size:14.5px; font-weight:500; color:#2a2a30;")}>{p.title}</span>
              {arrowSmall}
            </Hover>
          ))}
        </div>
      </section>

      {/* support strip */}
      <section style={parseStyle("max-width:820px; margin:0 auto; padding:20px 30px 90px;")}>
        <div className="dc-pop" style={parseStyle("display:grid; grid-template-columns:1fr 1fr; gap:16px;")}>
          <div style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:16px; padding:26px;")}>
            <h3 style={parseStyle("margin:0 0 7px; font-family:'Space Grotesk'; font-weight:600; font-size:16px;")}>Can&apos;t find it?</h3>
            <p style={parseStyle("margin:0 0 14px; font-size:13.5px; line-height:1.6; color:#6b6b73;")}>
              More docs are on the way. Join the waitlist and we&apos;ll keep you posted as they expand.
            </p>
            <Link href="/#waitlist" style={parseStyle("font-size:14px; font-weight:600; text-decoration:none;")}>Join the waitlist →</Link>
          </div>
          <div style={parseStyle("background:#0c0c0f; border:1px solid #1f1f26; border-radius:16px; padding:26px;")}>
            <h3 style={parseStyle("margin:0 0 7px; font-family:'Space Grotesk'; font-weight:600; font-size:16px; color:#f4f4f5;")}>New to Manition?</h3>
            <p style={parseStyle("margin:0 0 14px; font-size:13.5px; line-height:1.6; color:#8a8a92;")}>
              Watch the 26-second tour on the homepage, then join the list.
            </p>
            <Link href="/#demo" style={parseStyle("font-size:14px; font-weight:600; text-decoration:none; color:#7f97e8;")}>See it in action →</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
