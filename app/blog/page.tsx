import type { ReactNode } from "react";
import { parseStyle } from "../lib/css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { Hover } from "../components/Interactive";

const cardBase =
  "text-decoration:none; color:inherit; background:#fff; border:1px solid #e6e2da; border-radius:16px; overflow:hidden; display:block;";
const cardHover = { borderColor: "#d3cfc4" };
const thumb =
  "aspect-ratio:16/9; background:radial-gradient(circle at 50% 40%,#15151d,#0b0b0e); display:flex; align-items:center; justify-content:center;";

type Post = { tag: string; title: string; date: string; svg: ReactNode };

const POSTS: Post[] = [
  {
    tag: "Tutorial",
    title: "Five prompts that make great trig visuals",
    date: "Apr 9, 2025 · 5 min",
    svg: (
      <svg width="120" height="66" viewBox="0 0 120 66" fill="none">
        <circle cx="30" cy="33" r="18" stroke="#33333d" strokeWidth="1.4"></circle>
        <path d="M48 33 Q 66 8 84 33 T 118 33" stroke="#7ea6d9" strokeWidth="2.2"></path>
      </svg>
    ),
  },
  {
    tag: "Behind the scenes",
    title: "Rendering at scale on ephemeral GPUs",
    date: "Mar 28, 2025 · 6 min",
    svg: (
      <svg width="120" height="66" viewBox="0 0 120 66" fill="none">
        <g stroke="#5fbf7e" strokeWidth="1.6">
          <line x1="30" y1="48" x2="44" y2="30"></line>
          <line x1="58" y1="50" x2="72" y2="26"></line>
          <line x1="86" y1="48" x2="100" y2="34"></line>
        </g>
      </svg>
    ),
  },
  {
    tag: "Education",
    title: "How a teacher built a full unit of visuals",
    date: "Mar 14, 2025 · 4 min",
    svg: (
      <svg width="120" height="66" viewBox="0 0 120 66" fill="none">
        <line x1="20" y1="52" x2="100" y2="52" stroke="#33333d" strokeWidth="1.2"></line>
        <g fill="#7ea6d9" opacity="0.4">
          <rect x="34" y="28" width="9" height="24"></rect>
          <rect x="48" y="18" width="9" height="34"></rect>
          <rect x="62" y="30" width="9" height="22"></rect>
        </g>
      </svg>
    ),
  },
  {
    tag: "Product",
    title: "Iterating on scenes with chat, done right",
    date: "Feb 27, 2025 · 5 min",
    svg: (
      <svg width="120" height="66" viewBox="0 0 120 66" fill="none">
        <line x1="60" y1="10" x2="60" y2="56" stroke="#26262c" strokeWidth="1"></line>
        <line x1="24" y1="33" x2="96" y2="33" stroke="#26262c" strokeWidth="1"></line>
        <line x1="60" y1="33" x2="92" y2="16" stroke="#c2913a" strokeWidth="2.2"></line>
      </svg>
    ),
  },
];

type Change = {
  version: string;
  badge: string;
  date: string;
  title: string;
  body: string;
  last?: boolean;
};

const CHANGES: Change[] = [
  {
    version: "v0.9",
    badge: "background:#eef2fd; color:#2f4fc0;",
    date: "Apr 20, 2025",
    title: "4K exports & transparent backgrounds",
    body: "Pro renders can now export at 4K with an alpha channel for overlays.",
  },
  {
    version: "v0.8",
    badge: "background:#eef2fd; color:#2f4fc0;",
    date: "Apr 6, 2025",
    title: "Editable code panel",
    body: "Open, edit and re-run the generated Manim without re-prompting.",
  },
  {
    version: "v0.7",
    badge: "background:#e9f5ec; color:#2f7a4a;",
    date: "Mar 22, 2025",
    title: "Searchable library",
    body: "Find any past render by title, prompt or category.",
    last: true,
  },
];

export default function Blog() {
  return (
    <div
      style={parseStyle(
        "font-family:'IBM Plex Sans',ui-sans-serif,system-ui; color:#16161a; background:#f7f6f3; overflow-x:hidden;",
      )}
    >
      <Nav active="blog" />

      <section style={parseStyle("max-width:1120px; margin:0 auto; padding:70px 30px 20px;")}>
        <p style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#3b62e0; margin:0 0 16px;")}>
          Blog
        </p>
        <h1 style={parseStyle("margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:50px; line-height:1.05; letter-spacing:-0.035em;")}>
          Notes from the studio.
        </h1>
        <p style={parseStyle("margin:18px 0 0; max-width:520px; font-size:17px; line-height:1.6; color:#54545c;")}>
          Product updates, deep dives on animating math, and the occasional look behind the render.
        </p>
      </section>

      {/* featured */}
      <section style={parseStyle("max-width:1120px; margin:0 auto; padding:30px 30px 10px;")}>
        <a href="#" style={parseStyle("text-decoration:none; color:inherit; display:block;")}>
          <Hover
            as="div"
            className="bl-feat"
            style="display:grid; grid-template-columns:1.05fr 1fr; gap:0; background:#fff; border:1px solid #e6e2da; border-radius:20px; overflow:hidden;"
            hoverStyle={cardHover}
          >
            <div style={parseStyle("min-height:280px; background:radial-gradient(circle at 40% 40%,#16161f,#0a0a0d); display:flex; align-items:center; justify-content:center;")}>
              <svg width="260" height="150" viewBox="0 0 260 150" fill="none">
                <line x1="20" y1="90" x2="240" y2="90" stroke="#26262c" strokeWidth="1"></line>
                <path d="M24 88 C 80 88 88 30 130 30 C 172 30 180 88 236 88" stroke="#7ea6d9" strokeWidth="2.6"></path>
                <g fill="#5fbf7e" opacity="0.5">
                  <rect x="104" y="54" width="12" height="34"></rect>
                  <rect x="120" y="40" width="12" height="48"></rect>
                  <rect x="136" y="58" width="12" height="30"></rect>
                </g>
              </svg>
            </div>
            <div style={parseStyle("padding:40px;")}>
              <span style={parseStyle("display:inline-block; font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#3b62e0; margin-bottom:14px;")}>
                Featured · Deep dive
              </span>
              <h2 style={parseStyle("margin:0 0 12px; font-family:'Space Grotesk'; font-weight:700; font-size:26px; letter-spacing:-0.02em; line-height:1.15;")}>
                How we turn a sentence into a Manim scene
              </h2>
              <p style={parseStyle("margin:0 0 20px; font-size:14.5px; line-height:1.65; color:#54545c;")}>
                A look at the pipeline behind Manition - from parsing your prompt, to planning the scene graph, to writing code a cloud GPU can render in seconds.
              </p>
              <div style={parseStyle("display:flex; align-items:center; gap:11px;")}>
                <p style={parseStyle("margin:0; font-size:12px; color:#8a8a92;")}>Apr 18, 2025 · 8 min read</p>
              </div>
            </div>
          </Hover>
        </a>
      </section>

      {/* list + changelog */}
      <section style={parseStyle("max-width:1120px; margin:0 auto; padding:36px 30px 80px;")}>
        <div className="bl-wrap" style={parseStyle("display:grid; grid-template-columns:1.7fr 1fr; gap:40px; align-items:start;")}>
          <div>
            <h3 style={parseStyle("margin:0 0 20px; font-family:'Space Grotesk'; font-weight:700; font-size:18px; letter-spacing:-0.01em;")}>
              Latest posts
            </h3>
            <div className="bl-list" style={parseStyle("display:grid; grid-template-columns:1fr 1fr; gap:16px;")}>
              {POSTS.map((post, i) => (
                <Hover key={i} as="a" href="#" style={cardBase} hoverStyle={cardHover}>
                  <div style={parseStyle(thumb)}>{post.svg}</div>
                  <div style={parseStyle("padding:18px;")}>
                    <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:#3b62e0;")}>{post.tag}</span>
                    <h4 style={parseStyle("margin:7px 0 8px; font-family:'Space Grotesk'; font-weight:600; font-size:16px; line-height:1.25;")}>{post.title}</h4>
                    <p style={parseStyle("margin:0; font-size:12.5px; color:#8a8a92;")}>{post.date}</p>
                  </div>
                </Hover>
              ))}
            </div>
          </div>

          {/* changelog */}
          <div>
            <h3 style={parseStyle("margin:0 0 20px; font-family:'Space Grotesk'; font-weight:700; font-size:18px; letter-spacing:-0.01em;")}>
              Changelog
            </h3>
            <div style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:16px; padding:8px 22px;")}>
              {CHANGES.map((c, i) => (
                <div key={i} style={parseStyle(`padding:18px 0;${c.last ? "" : " border-bottom:1px solid #f2eee6;"}`)}>
                  <div style={parseStyle("display:flex; align-items:center; gap:9px; margin-bottom:8px;")}>
                    <span style={parseStyle(`font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:600; ${c.badge} padding:3px 8px; border-radius:6px;`)}>{c.version}</span>
                    <span style={parseStyle("font-size:12px; color:#8a8a92;")}>{c.date}</span>
                  </div>
                  <p style={parseStyle("margin:0 0 6px; font-family:'Space Grotesk'; font-weight:600; font-size:14.5px;")}>{c.title}</p>
                  <p style={parseStyle("margin:0; font-size:13px; line-height:1.55; color:#6b6b73;")}>{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
