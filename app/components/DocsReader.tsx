"use client";

import { useEffect, useState, type ReactNode } from "react";
import { parseStyle } from "../lib/css";
import { Hover } from "./Interactive";

type Block =
  | { t: "p"; text: string }
  | { t: "s"; items: string[] }
  | { t: "tip"; text: string }
  | { t: "code"; code: string };

type Guide = { title: string; read: string; blocks: Block[] };

type IconKind = "bolt" | "pen" | "code" | "video" | "chat" | "alert";

type Category = {
  id: string;
  title: string;
  desc: string;
  icon: IconKind;
  bg: string;
  fg: string;
  guides: Guide[];
};

const p = (text: string): Block => ({ t: "p", text });
const s = (items: string[]): Block => ({ t: "s", items });
const tip = (text: string): Block => ({ t: "tip", text });
const code = (c: string): Block => ({ t: "code", code: c });
const g = (title: string, read: string, blocks: Block[]): Guide => ({ title, read, blocks });

const CATEGORIES: Category[] = [
  {
    id: "start",
    title: "Getting started",
    desc: "Your first prompt, previewing a scene, and downloading the render.",
    icon: "bolt",
    bg: "#eef2fd",
    fg: "#3b62e0",
    guides: [
      g("Writing your first prompt", "2 min read", [
        p("A prompt is just a plain-language description of the scene you want. Name the objects, say what should happen, and Manition writes the Manim code and renders it."),
        s([
          "Open a new chat and type what you want to see - e.g. “Draw a unit circle, then sweep an angle from 0 to 90°.”",
          "Send it. Manition generates the scene and starts a render.",
          "Watch the preview, then refine in follow-up messages.",
        ]),
        tip("Start simple. One clear idea per prompt renders faster and is far easier to refine."),
      ]),
      g("Previewing a scene", "1 min read", [
        p("Every render appears inline in the chat. Use the player to scrub, loop, and check timing before you download."),
        s([
          "Press space or the play button to preview.",
          "Drag the scrubber to inspect a specific moment.",
          "Toggle loop to review pacing repeatedly.",
        ]),
      ]),
      g("Downloading your render", "1 min read", [
        p("When a render finishes, export it in the format you need from the player toolbar."),
        s([
          "Click Download on the finished render.",
          "Pick a format - MP4, GIF, or PNG frames.",
          "Choose a resolution and save.",
        ]),
        tip("Need a clip for slides? MP4 at 1080p is the safe default."),
      ]),
      g("Understanding the chat view", "2 min read", [
        p("Each conversation is one scene. Your messages, the generated code, and every render version live together so you can iterate without losing history."),
        s([
          "The left rail lists your chats and starred scenes.",
          "The center holds the conversation and previews.",
          "Open the code panel any time to inspect the source.",
        ]),
      ]),
      g("Re-rendering after a change", "1 min read", [
        p("Ask for a change in a follow-up message and Manition edits the existing scene instead of starting over."),
        s([
          "Describe the change - e.g. “make the axis labels larger.”",
          "Send. Only the affected code is updated.",
          "Compare the new render against the previous version.",
        ]),
      ]),
      g("Keyboard shortcuts", "1 min read", [
        p("A few shortcuts speed up everyday work."),
        s([
          "Space - play or pause the preview.",
          "Enter - send the current prompt.",
          "⌘ / Ctrl + K - jump to search.",
        ]),
      ]),
    ],
  },
  {
    id: "prompts",
    title: "Writing good prompts",
    desc: "Patterns that produce clear scenes - pacing, labels, emphasis and style.",
    icon: "pen",
    bg: "#f0eef8",
    fg: "#5b46d9",
    guides: [
      g("Anatomy of a good prompt", "3 min read", [
        p("Clear prompts share a shape: what the objects are, what happens to them, and in what order. Everything else is style."),
        s([
          "Name the objects: “a blue square, a number line.”",
          "State the action: “slide the square along the line.”",
          "Set the order and timing: “pause, then fade out.”",
        ]),
        tip("If a prompt feels vague, read it aloud - if you can't picture it, neither can the model."),
      ]),
      g("Pacing and timing", "2 min read", [
        p("Runtime is driven by the actions you describe. Ask for explicit holds and durations to control rhythm."),
        s([
          "Give durations: “draw the curve over 2 seconds.”",
          "Add holds: “hold on the final frame for a beat.”",
          "Break long scenes into labeled steps.",
        ]),
      ]),
      g("Labeling objects clearly", "2 min read", [
        p("Consistent names help the model reference the right object when you ask for changes later."),
        s([
          "Use distinct names: “the red vector,” not “the arrow.”",
          "Reuse the same name across follow-ups.",
          "Ask for on-screen labels with Text or MathTex.",
        ]),
      ]),
      g("Emphasis and highlights", "2 min read", [
        p("Direct the viewer's eye by asking for emphasis explicitly."),
        s([
          "Request highlights: “flash the intersection point.”",
          "Use color or scale: “grow the label, then settle.”",
          "Dim the rest: “fade other elements to 40%.”",
        ]),
      ]),
      g("Choosing a visual style", "2 min read", [
        p("Set a style once and reuse it so a series feels consistent."),
        s([
          "Name a background and accent color.",
          "Specify fonts, or MathTex for equations.",
          "Save the description as project custom instructions.",
        ]),
        tip("Projects let every scene inherit the same style - set it once."),
      ]),
      g("Describing camera moves", "2 min read", [
        p("Ask for camera motion in the same plain language as everything else."),
        s([
          "Zoom: “zoom into the vertex, then back out.”",
          "Pan: “follow the point as it moves right.”",
          "Frame: “keep the whole graph in view.”",
        ]),
      ]),
      g("Sequencing multiple steps", "2 min read", [
        p("For multi-part scenes, number the beats so the order is unambiguous."),
        s([
          "List steps 1, 2, 3 in the prompt.",
          "Say what stays on screen between steps.",
          "End with the final state you want to hold.",
        ]),
      ]),
      g("Common prompt mistakes", "2 min read", [
        p("A few patterns lead to muddy scenes."),
        s([
          "Too many ideas at once - split them up.",
          "No timing - everything happens instantly.",
          "Ambiguous references - name your objects.",
        ]),
        tip("When in doubt, render a rough version first, then refine."),
      ]),
    ],
  },
  {
    id: "code",
    title: "Working with code",
    desc: "Reading, editing and exporting the generated Manim source.",
    icon: "code",
    bg: "#fbf3e4",
    fg: "#c2913a",
    guides: [
      g("Reading the generated source", "2 min read", [
        p("Every scene has real Manim code behind it. Open the code panel to see exactly what produced the render."),
        s([
          "Open the code panel from the toolbar.",
          "Scenes are standard Manim Scene subclasses.",
          "Comments map the code back to what you asked for.",
        ]),
        code("class FirstScene(Scene):\n    def construct(self):\n        circle = Circle()\n        self.play(Create(circle))\n        self.wait(1)"),
      ]),
      g("Editing scene code inline", "2 min read", [
        p("You can edit the generated code directly and re-render without leaving the chat."),
        s([
          "Click into the code panel and make your change.",
          "Press Render to run the edited scene.",
          "Revert to any previous version if needed.",
        ]),
        tip("Small manual tweaks are great for fine-tuning values the prompt got close on."),
      ]),
      g("Exporting the Manim file", "1 min read", [
        p("Download the full .py source to run or version-control it yourself."),
        s([
          "Open the code panel.",
          "Choose Export → Python file.",
          "Save the .py alongside any assets it references.",
        ]),
      ]),
      g("Running exported code locally", "3 min read", [
        p("Exported scenes are standard Manim - run them with the Manim CLI."),
        s([
          "Install Manim in a Python environment.",
          "Run the scene against its class name.",
          "The rendered file lands in the media/ folder.",
        ]),
        code("pip install manim\nmanim -pqh scene.py FirstScene"),
      ]),
      g("Managing dependencies", "2 min read", [
        p("Some scenes use LaTeX or extra fonts. Match your local setup to what the scene needs."),
        s([
          "MathTex / Tex need a LaTeX distribution installed.",
          "Custom fonts must be available on your system.",
          "Pin your Manim version to match the export.",
        ]),
      ]),
    ],
  },
  {
    id: "render",
    title: "Rendering & exports",
    desc: "Resolutions, formats, transparent backgrounds and render queues.",
    icon: "video",
    bg: "#e9f5ec",
    fg: "#2f7a4a",
    guides: [
      g("Choosing a resolution", "1 min read", [
        p("Pick a resolution based on where the clip will live."),
        s([
          "720p for quick drafts and fast renders.",
          "1080p for slides and most sharing.",
          "1440p / 4K for large screens or zoomed detail.",
        ]),
      ]),
      g("Export formats (MP4, GIF, PNG)", "2 min read", [
        p("Each format suits a different use."),
        s([
          "MP4 - best all-round for video with audio.",
          "GIF - short silent loops for chat or docs.",
          "PNG - individual frames or transparent stills.",
        ]),
      ]),
      g("Transparent backgrounds", "2 min read", [
        p("Export with an alpha channel to layer a scene over other content."),
        s([
          "Ask for a transparent background in the prompt.",
          "Export as MOV (ProRes 4444) or PNG frames.",
          "Composite the result over your slide or video.",
        ]),
        tip("GIF and MP4 don't keep true transparency - use MOV or PNG frames."),
      ]),
      g("Frame rate and quality", "1 min read", [
        p("Higher frame rates look smoother but take longer to render."),
        s([
          "30 fps is fine for most explainers.",
          "60 fps for fast motion or slow-mo detail.",
          "Draft quality speeds previews; final for export.",
        ]),
      ]),
      g("The render queue", "1 min read", [
        p("Long or batched renders run in a queue you can monitor."),
        s([
          "Submitted renders show live progress.",
          "Queue order is first-in, first-out.",
          "You're notified when each one finishes.",
        ]),
      ]),
      g("Render times explained", "2 min read", [
        p("A few factors drive how long a render takes."),
        s([
          "Resolution and frame rate - the biggest levers.",
          "Scene length and object count.",
          "LaTeX-heavy scenes compile equations first.",
        ]),
      ]),
      g("Fixing failed renders", "2 min read", [
        p("Most failures come from a code error the scene surfaces."),
        s([
          "Read the error message on the failed render.",
          "Ask Manition to fix it, or edit the code directly.",
          "Re-render once the fix is in.",
        ]),
        tip("Pasting the exact error into chat gets you the fastest fix."),
      ]),
    ],
  },
  {
    id: "library",
    title: "Chats & library",
    desc: "Organizing scenes, starring, searching and re-rendering old work.",
    icon: "chat",
    bg: "#eef2fd",
    fg: "#3b62e0",
    guides: [
      g("Organizing your scenes", "2 min read", [
        p("Group related scenes into projects so shared style and context travel with them."),
        s([
          "Create a project from the Projects page.",
          "Add scenes and set custom instructions.",
          "Every scene in the project inherits that context.",
        ]),
      ]),
      g("Starring favorites", "1 min read", [
        p("Star the scenes you return to so they stay one click away."),
        s([
          "Click the star on any chat.",
          "Starred scenes pin to the top of the rail.",
          "Unstar to move it back to Recents.",
        ]),
      ]),
      g("Searching your library", "1 min read", [
        p("Find any past scene by title or content."),
        s([
          "Press ⌘ / Ctrl + K to open search.",
          "Type a title or keyword.",
          "Open the result to jump straight to that chat.",
        ]),
      ]),
      g("Re-rendering old work", "1 min read", [
        p("Come back to any scene and render it again or branch from it."),
        s([
          "Open the chat from Recents or search.",
          "Ask for a change, or re-render as-is.",
          "Earlier versions stay in the history.",
        ]),
      ]),
    ],
  },
  {
    id: "trouble",
    title: "Troubleshooting",
    desc: "Failed renders, scene errors, and what to do when a prompt goes sideways.",
    icon: "alert",
    bg: "#fdeeee",
    fg: "#c2504f",
    guides: [
      g("When a render fails", "2 min read", [
        p("A failed render usually means the scene hit a code error. It's recoverable."),
        s([
          "Open the failed render to read the error.",
          "Ask Manition to fix the specific error.",
          "Re-render - most fixes are a single step.",
        ]),
      ]),
      g("Scene looks wrong", "2 min read", [
        p("If the render works but doesn't match your intent, refine the prompt."),
        s([
          "Name exactly what's off: position, color, timing.",
          "Reference objects by their names.",
          "Ask for one change at a time to isolate it.",
        ]),
      ]),
      g("Prompt went sideways", "2 min read", [
        p("Sometimes the model misreads an ambiguous prompt. Steer it back."),
        s([
          "Restate the goal in one clear sentence.",
          "Remove conflicting instructions.",
          "Branch from the last good version if needed.",
        ]),
      ]),
      g("Slow or stuck renders", "1 min read", [
        p("Long renders are usually heavy scenes, not stuck ones."),
        s([
          "Check the queue for live progress.",
          "Lower resolution or frame rate for a faster pass.",
          "Split very long scenes into parts.",
        ]),
      ]),
      g("Getting more help", "1 min read", [
        p("Still stuck? A few ways to get unblocked."),
        s([
          "Search these docs for your exact symptom.",
          "Join the waitlist for product updates.",
          "Paste errors into chat for a targeted fix.",
        ]),
      ]),
    ],
  },
];

const POPULAR: { n: string; title: string; cat: string; guide: number }[] = [
  { n: "01", title: "Writing your first prompt", cat: "start", guide: 0 },
  { n: "02", title: "Exporting with a transparent background", cat: "render", guide: 2 },
  { n: "03", title: "Asking for changes without starting over", cat: "start", guide: 4 },
  { n: "04", title: "Running exported Manim code locally", cat: "code", guide: 3 },
];

const iconStroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function icon(kind: IconKind, size: number): ReactNode {
  const a = { width: size, height: size, viewBox: "0 0 24 24", ...iconStroke };
  switch (kind) {
    case "bolt":
      return <svg {...a}><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"></path></svg>;
    case "pen":
      return (
        <svg {...a}>
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
        </svg>
      );
    case "code":
      return (
        <svg {...a}>
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      );
    case "video":
      return (
        <svg {...a}>
          <rect x="2" y="5" width="14" height="14" rx="2"></rect>
          <polygon points="22 7 16 12 22 17"></polygon>
        </svg>
      );
    case "chat":
      return <svg {...a}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
    case "alert":
      return (
        <svg {...a}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      );
  }
}

const arrowRow = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9a9aa2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="M13 6l6 6-6 6"></path>
  </svg>
);

const chevronRow = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c2bdb0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "0 0 auto" }}>
    <path d="M9 6l6 6-6 6"></path>
  </svg>
);

const catCard =
  "cursor:pointer; text-decoration:none; color:inherit; background:#fff; border:1px solid #e6e2da; border-radius:16px; padding:26px; display:block; transition:border-color .15s, transform .15s;";
const catHover = { borderColor: "#c9c4b8", transform: "translateY(-3px)" };
const catH3 = "margin:0 0 7px; font-family:'Space Grotesk'; font-weight:600; font-size:17px;";
const catP = "margin:0 0 14px; font-size:13.5px; line-height:1.6; color:#6b6b73;";
const catCount = "font-family:'IBM Plex Mono',monospace; font-size:11px; color:#9a9aa2;";

export default function DocsReader() {
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [openGuide, setOpenGuide] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openCat) {
        setOpenCat(null);
        setOpenGuide(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openCat]);

  const cat = CATEGORIES.find((c) => c.id === openCat) ?? null;
  const guide = cat && openGuide != null ? cat.guides[openGuide] : null;
  const drawerOpen = !!cat;
  const showArticle = drawerOpen && !!guide;
  const showList = drawerOpen && !guide;

  const openCategory = (id: string) => {
    setOpenCat(id);
    setOpenGuide(null);
  };
  const openGuideAt = (id: string, i: number) => {
    setOpenCat(id);
    setOpenGuide(i);
  };
  const close = () => {
    setOpenCat(null);
    setOpenGuide(null);
  };

  const hasPrev = !!guide && openGuide != null && openGuide > 0;
  const hasNext = !!guide && cat != null && openGuide != null && openGuide < cat.guides.length - 1;

  return (
    <>
      {/* doc categories */}
      <section style={parseStyle("max-width:1120px; margin:0 auto; padding:30px 30px 20px;")}>
        <div className="dc-grid" style={parseStyle("display:grid; grid-template-columns:repeat(3,1fr); gap:16px;")}>
          {CATEGORIES.map((c) => (
            <Hover key={c.id} as="a" onClick={() => openCategory(c.id)} style={catCard} hoverStyle={catHover}>
              <div
                style={parseStyle(
                  `width:38px; height:38px; border-radius:10px; background:${c.bg}; color:${c.fg}; display:flex; align-items:center; justify-content:center; margin-bottom:16px;`,
                )}
              >
                {icon(c.icon, 18)}
              </div>
              <h3 style={parseStyle(catH3)}>{c.title}</h3>
              <p style={parseStyle(catP)}>{c.desc}</p>
              <span style={parseStyle(catCount)}>{c.guides.length} guides</span>
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
          {POPULAR.map((pop, i) => (
            <Hover
              key={pop.n}
              as="a"
              onClick={() => openGuideAt(pop.cat, pop.guide)}
              style={`cursor:pointer; display:flex; align-items:center; gap:14px; padding:17px 22px; text-decoration:none; color:inherit;${i < POPULAR.length - 1 ? " border-bottom:1px solid #f2eee6;" : ""}`}
              hoverStyle={{ background: "#faf8f4" }}
            >
              <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#9a9aa2; width:22px;")}>{pop.n}</span>
              <span style={parseStyle("flex:1; font-size:14.5px; font-weight:500; color:#2a2a30;")}>{pop.title}</span>
              {arrowRow}
            </Hover>
          ))}
        </div>
      </section>

      {/* docs reader drawer */}
      {drawerOpen && cat && (
        <div style={parseStyle("position:fixed; inset:0; z-index:200; display:flex; justify-content:flex-end;")}>
          <div
            onClick={close}
            style={parseStyle("position:absolute; inset:0; background:rgba(24,24,27,0.42); animation:omDrawerFade .2s ease;")}
          ></div>
          <div style={parseStyle("position:relative; width:min(560px, 94vw); height:100%; background:#fdfcfa; border-left:1px solid #e6e2da; box-shadow:-24px 0 60px rgba(24,24,27,0.14); display:flex; flex-direction:column; animation:omDrawerSlide .24s cubic-bezier(.4,0,.2,1);")}>
            {/* drawer header */}
            <div style={parseStyle("flex:0 0 auto; display:flex; align-items:center; gap:12px; padding:18px 22px; border-bottom:1px solid #eee9df; background:#fdfcfa;")}>
              <span
                style={parseStyle(
                  `width:34px; height:34px; flex:0 0 auto; border-radius:9px; display:flex; align-items:center; justify-content:center; background:${cat.bg}; color:${cat.fg};`,
                )}
              >
                {icon(cat.icon, 16)}
              </span>
              <div style={parseStyle("flex:1; min-width:0; display:flex; align-items:center; gap:7px; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#9a9aa2;")}>
                <span>Docs</span>
                <span>/</span>
                <span style={parseStyle("color:#3b62e0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;")}>{cat.title}</span>
                {showArticle && guide && (
                  <>
                    <span>/</span>
                    <span style={parseStyle("color:#6b6b73; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:150px;")}>{guide.title}</span>
                  </>
                )}
              </div>
              <Hover
                as="button"
                type="button"
                onClick={close}
                title="Close"
                style="flex:0 0 auto; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border:1px solid #e6e2da; background:#fff; border-radius:8px; cursor:pointer; color:#6b6b73;"
                hoverStyle={{ background: "#f2eee6", color: "#16161a" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Hover>
            </div>

            {/* drawer body */}
            <div style={parseStyle("flex:1 1 0; min-height:0; overflow-y:auto; padding:24px 26px 40px;")}>
              {/* list view */}
              {showList && (
                <>
                  <h2 style={parseStyle("margin:0 0 8px; font-family:'Space Grotesk'; font-weight:700; font-size:26px; letter-spacing:-0.025em;")}>{cat.title}</h2>
                  <p style={parseStyle("margin:0 0 6px; font-size:14.5px; line-height:1.6; color:#6b6b73;")}>{cat.desc}</p>
                  <p style={parseStyle("margin:0 0 20px; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#9a9aa2;")}>{cat.guides.length} guides</p>
                  <div style={parseStyle("display:flex; flex-direction:column; border:1px solid #eee9df; border-radius:13px; overflow:hidden; background:#fff;")}>
                    {cat.guides.map((gu, i) => (
                      <Hover
                        key={gu.title}
                        as="a"
                        onClick={() => setOpenGuide(i)}
                        style="cursor:pointer; display:flex; align-items:center; gap:12px; padding:15px 18px; text-decoration:none; color:inherit; border-bottom:1px solid #f4f0e8;"
                        hoverStyle={{ background: "#faf8f4" }}
                      >
                        <span style={parseStyle("flex:1; min-width:0; font-size:14.5px; font-weight:500; color:#26262c;")}>{gu.title}</span>
                        <span style={parseStyle("flex:0 0 auto; font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:#a8a8b0;")}>{gu.read}</span>
                        {chevronRow}
                      </Hover>
                    ))}
                  </div>
                </>
              )}

              {/* article view */}
              {showArticle && guide && (
                <>
                  <Hover
                    as="a"
                    onClick={() => setOpenGuide(null)}
                    style="cursor:pointer; display:inline-flex; align-items:center; gap:6px; margin:0 0 18px; font-size:12.5px; font-weight:500; color:#6b6b73; text-decoration:none;"
                    hoverStyle={{ color: "#16161a" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6"></path>
                    </svg>
                    All {cat.title} guides
                  </Hover>
                  <h2 style={parseStyle("margin:0 0 8px; font-family:'Space Grotesk'; font-weight:700; font-size:27px; line-height:1.15; letter-spacing:-0.025em;")}>{guide.title}</h2>
                  <p style={parseStyle("margin:0 0 22px; font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.04em; color:#a8a8b0;")}>{guide.read}</p>

                  {guide.blocks.map((b, i) => {
                    if (b.t === "p") {
                      return (
                        <p key={i} style={parseStyle("margin:0 0 16px; font-size:15px; line-height:1.72; color:#3a3a42;")}>
                          {b.text}
                        </p>
                      );
                    }
                    if (b.t === "s") {
                      return (
                        <ol key={i} style={parseStyle("margin:0 0 18px; padding-left:22px; color:#3a3a42;")}>
                          {b.items.map((it, j) => (
                            <li key={j} style={parseStyle("margin:0 0 9px; font-size:14.5px; line-height:1.6;")}>{it}</li>
                          ))}
                        </ol>
                      );
                    }
                    if (b.t === "tip") {
                      return (
                        <div key={i} style={parseStyle("display:flex; gap:11px; margin:0 0 18px; padding:14px 16px; background:#eef2fd; border:1px solid #dbe3fb; border-radius:12px;")}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b62e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "0 0 auto", marginTop: "1px" }}>
                            <path d="M9 18h6"></path>
                            <path d="M10 22h4"></path>
                            <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"></path>
                          </svg>
                          <p style={parseStyle("margin:0; font-size:13.5px; line-height:1.6; color:#2f3d78;")}>{b.text}</p>
                        </div>
                      );
                    }
                    return (
                      <pre key={i} style={parseStyle("margin:0 0 18px; padding:15px 16px; background:#0c0c0f; color:#e6e6ea; border-radius:12px; overflow-x:auto; font-family:'IBM Plex Mono',monospace; font-size:12.5px; line-height:1.65; white-space:pre;")}>
                        {b.code}
                      </pre>
                    );
                  })}

                  {(hasPrev || hasNext) && cat && openGuide != null && (
                    <div style={parseStyle("display:flex; align-items:stretch; gap:10px; margin-top:26px; padding-top:20px; border-top:1px solid #eee9df;")}>
                      {hasPrev && (
                        <Hover
                          as="a"
                          onClick={() => setOpenGuide(openGuide - 1)}
                          style="cursor:pointer; flex:1; text-decoration:none; border:1px solid #e6e2da; border-radius:11px; padding:12px 14px; background:#fff;"
                          hoverStyle={{ borderColor: "#c9c4b8" }}
                        >
                          <span style={parseStyle("display:block; font-family:'IBM Plex Mono',monospace; font-size:10px; color:#a8a8b0; margin-bottom:3px;")}>← Previous</span>
                          <span style={parseStyle("display:block; font-size:13px; font-weight:500; color:#26262c;")}>{cat.guides[openGuide - 1].title}</span>
                        </Hover>
                      )}
                      {hasNext && (
                        <Hover
                          as="a"
                          onClick={() => setOpenGuide(openGuide + 1)}
                          style="cursor:pointer; flex:1; text-decoration:none; border:1px solid #e6e2da; border-radius:11px; padding:12px 14px; background:#fff; text-align:right;"
                          hoverStyle={{ borderColor: "#c9c4b8" }}
                        >
                          <span style={parseStyle("display:block; font-family:'IBM Plex Mono',monospace; font-size:10px; color:#a8a8b0; margin-bottom:3px;")}>Next →</span>
                          <span style={parseStyle("display:block; font-size:13px; font-weight:500; color:#26262c;")}>{cat.guides[openGuide + 1].title}</span>
                        </Hover>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
