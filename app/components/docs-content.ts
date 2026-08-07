// Guide content for the docs reader, ported from Docs.dc.html.

export type Block =
  | { t: "p"; text: string }
  | { t: "s"; items: string[] }
  | { t: "tip"; text: string }
  | { t: "code"; code: string };

export type Guide = { title: string; read: string; blocks: Block[] };

export type IconKind = "bolt" | "pen" | "code" | "video" | "chat" | "alert";

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

export const CATEGORIES: Category[] = [
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

export const POPULAR: { n: string; title: string; cat: string; guide: number }[] = [
  { n: "01", title: "Writing your first prompt", cat: "start", guide: 0 },
  { n: "02", title: "Exporting with a transparent background", cat: "render", guide: 2 },
  { n: "03", title: "Asking for changes without starting over", cat: "start", guide: 4 },
  { n: "04", title: "Running exported Manim code locally", cat: "code", guide: 3 },
];
