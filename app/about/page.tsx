import type { ReactNode } from "react";
import { parseStyle } from "../lib/css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { Hover } from "../components/Interactive";

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

type Value = { wrap: string; icon: ReactNode; title: string; body: ReactNode };

const VALUES: Value[] = [
  {
    wrap: "background:#eef2fd; color:#3b62e0;",
    icon: (
      <svg {...iconAttrs}>
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 12l3 3 5-6"></path>
      </svg>
    ),
    title: "Clarity first",
    body: "An animation earns its runtime. We optimize for the moment a concept clicks, not for flashiness.",
  },
  {
    wrap: "background:#fbf3e4; color:#c2913a;",
    icon: (
      <svg {...iconAttrs}>
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    ),
    title: "No black boxes",
    body: (
      <>
        Every scene ships with its source. If you&apos;re curious how it works, the answer is one click away.
      </>
    ),
  },
  {
    wrap: "background:#e9f5ec; color:#2f7a4a;",
    icon: (
      <svg {...iconAttrs}>
        <path d="M22 10 12 5 2 10l10 5 10-5Z"></path>
        <path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5"></path>
      </svg>
    ),
    title: "Education is the point",
    body: (
      <>
        Classrooms shape our roadmap. If a feature doesn&apos;t help someone teach or learn, it waits.
      </>
    ),
  },
];

export default function About() {
  return (
    <div
      style={parseStyle(
        "font-family:'IBM Plex Sans',ui-sans-serif,system-ui; color:#16161a; background:#f7f6f3; overflow-x:hidden;",
      )}
    >
      <Nav active="about" />

      {/* hero */}
      <section style={parseStyle("max-width:880px; margin:0 auto; padding:78px 30px 30px; text-align:center;")}>
        <p style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#3b62e0; margin:0 0 16px;")}>
          About
        </p>
        <h1 style={parseStyle("margin:0 auto; max-width:700px; font-family:'Space Grotesk'; font-weight:700; font-size:50px; line-height:1.06; letter-spacing:-0.035em;")}>
          Math is beautiful when it moves.
        </h1>
        <p style={parseStyle("margin:22px auto 0; max-width:560px; font-size:17px; line-height:1.65; color:#54545c;")}>
          The best math explainers on the internet share one secret: motion. But the tools to make it move have always demanded code, patience and rendering hardware. We&apos;re building Manition so the only requirement is a sentence.
        </p>
      </section>

      {/* story */}
      <section style={parseStyle("max-width:820px; margin:0 auto; padding:36px 30px 20px;")}>
        <div style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:20px; padding:44px;")}>
          <h2 style={parseStyle("margin:0 0 16px; font-family:'Space Grotesk'; font-weight:700; font-size:26px; letter-spacing:-0.02em;")}>
            Why we&apos;re building this
          </h2>
          <p style={parseStyle("margin:0 0 16px; font-size:15.5px; line-height:1.75; color:#3f3f46;")}>
            Manim - the animation engine created by 3Blue1Brown - showed the world what a math explanation could look like. But behind every gorgeous clip is Python code, a local render pipeline, and hours of iteration. For most teachers, students and creators, that&apos;s a wall, not a doorway.
          </p>
          <p style={parseStyle("margin:0 0 16px; font-size:15.5px; line-height:1.75; color:#3f3f46;")}>
            We kept meeting people with a perfect animation in their head and no way to get it out. A teacher who wanted fifteen seconds of motion for one confusing moment in a lesson. A student who needed to <em>see</em> an eigenvector once to finally get it. A creator with ideas outpacing their editing skills.
          </p>
          <p style={parseStyle("margin:0; font-size:15.5px; line-height:1.75; color:#3f3f46;")}>
            Manition is the doorway: describe the concept, and real Manim code is written, rendered on cloud GPUs, and handed back as a video - with the source included, because we believe tools should teach, not hide.
          </p>
        </div>
      </section>

      {/* values */}
      <section style={parseStyle("max-width:1080px; margin:0 auto; padding:44px 30px 20px;")}>
        <div className="ab-3" style={parseStyle("display:grid; grid-template-columns:repeat(3,1fr); gap:16px;")}>
          {VALUES.map((v) => (
            <div key={v.title} style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:16px; padding:26px;")}>
              <div style={parseStyle(`width:38px; height:38px; border-radius:10px; ${v.wrap} display:flex; align-items:center; justify-content:center; margin-bottom:16px;`)}>
                {v.icon}
              </div>
              <h3 style={parseStyle("margin:0 0 8px; font-family:'Space Grotesk'; font-weight:600; font-size:17px;")}>{v.title}</h3>
              <p style={parseStyle("margin:0; font-size:14px; line-height:1.6; color:#6b6b73;")}>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* get in touch */}
      <section id="careers" style={parseStyle("max-width:820px; margin:0 auto; padding:44px 30px 20px;")}>
        <div style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:20px; padding:40px;")}>
          <h2 style={parseStyle("margin:0 0 10px; font-family:'Space Grotesk'; font-weight:700; font-size:26px; letter-spacing:-0.02em;")}>Get in touch</h2>
          <p style={parseStyle("margin:0 0 20px; font-size:15px; line-height:1.65; color:#54545c;")}>
            We&apos;re not hiring right now, but we love hearing from people who care about math, motion and craft. Join the waitlist to follow along as we build - and be first to know when access opens.
          </p>
          <Hover
            as="a"
            href="/#waitlist"
            style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; background:#eef2fd; color:#2f4fc0; font-size:14px; font-weight:600; padding:12px 18px; border-radius:11px;"
            hoverStyle={{ background: "#e3ebfb" }}
          >
            Join the waitlist{" "}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M13 6l6 6-6 6"></path>
            </svg>
          </Hover>
        </div>
      </section>

      {/* CTA */}
      <section style={parseStyle("max-width:1080px; margin:0 auto; padding:44px 30px 90px;")}>
        <div style={parseStyle("background:#0c0c0f; border-radius:22px; padding:56px 40px; text-align:center;")}>
          <div style={parseStyle("display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:18px;")}>
            <div style={parseStyle("width:34px; height:34px; border-radius:10px; border:1px solid #3f3f46; display:flex; align-items:center; justify-content:center; background:#0e0e11;")}>
              <div style={parseStyle("width:12px; height:12px; border-radius:50%; border:1.8px solid #d4d4d8;")}></div>
            </div>
            <span style={parseStyle("font-family:'Space Grotesk'; font-weight:700; font-size:22px; letter-spacing:-0.01em; color:#fafafa;")}>Manition</span>
          </div>
          <p style={parseStyle("margin:0 auto 28px; max-width:420px; font-size:15.5px; color:#a1a1aa; line-height:1.6;")}>
            Describe it. We animate it. Join the waitlist and see your first idea move.
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
