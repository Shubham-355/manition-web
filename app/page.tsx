import Link from "next/link";
import { parseStyle } from "./lib/css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ManitionDemo from "./components/film/ManitionDemo";
import GalleryVideo from "./components/GalleryVideo";
import { Hover, WaitlistForm } from "./components/Interactive";

const arrow = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="M13 6l6 6-6 6"></path>
  </svg>
);

const STEPS = [
  {
    n: "1",
    title: "Describe it",
    body: "Type what you want to show, the way you would say it to a friend.",
  },
  {
    n: "2",
    title: "Watch it appear",
    body: "Manition makes the video while you wait. Ask for changes in plain words until you like it.",
  },
  {
    n: "3",
    title: "Share it",
    body: "Download the video and use it in a class, a post, a video, or a group chat.",
  },
];

const PICKS = [
  { scene: "tree", label: "A year in one tree", caption: "One seed, four seasons" },
  { scene: "aurora", label: "Aurora over a frozen lake", caption: "Why the sky glows green" },
  { scene: "phyllo", label: "Phyllotaxis bloom", caption: "How a sunflower packs its seeds" },
];

const AVATARS = [
  { text: "Ed", bg: "#e7ddc9", fg: "#8a6d2f" },
  { text: "YT", bg: "#d9e2f7", fg: "#3358c0" },
  { text: "Ph", bg: "#dcefe0", fg: "#2f7a4a" },
];

export default function Home() {
  return (
    <div style={parseStyle("font-family:'IBM Plex Sans',ui-sans-serif,system-ui; color:#16161a; background:#f7f6f3; overflow-x:hidden;")}>
      <Nav active="home" />

      {/* ============ FILM ============ */}
      <section id="demo" className="hm-film" style={parseStyle("max-width:1120px; margin:0 auto; padding:clamp(28px,4vw,44px) clamp(20px,5vw,32px) 0;")}>
        {/* the stage is exactly 16/9, so it fits the frame with nothing cropped */}
        <div style={parseStyle("position:relative; width:100%; aspect-ratio:16/9; border-radius:clamp(14px,1.8vw,22px); overflow:hidden; background:#f7f6f3;")}>
          <div style={parseStyle("position:absolute; inset:0;")}>
            <ManitionDemo />
          </div>
        </div>
      </section>

      {/* ============ HERO ============ */}
      <section style={parseStyle("max-width:940px; margin:0 auto; padding:clamp(22px,2.8vw,32px) clamp(20px,5vw,32px) clamp(48px,6.4vw,76px); text-align:center;")}>
        {/* one compact line under a wide film, not a second hero block */}
        <h1 style={parseStyle("margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(27px,3.4vw,40px); line-height:1.1; letter-spacing:-0.03em; text-wrap:balance;")}>
          Say it. Watch it move.
        </h1>
        <div style={parseStyle("display:flex; flex-wrap:wrap; gap:12px; justify-content:center; margin-top:clamp(18px,2.2vw,24px);")}>
          <Hover
            as="a"
            href="#waitlist"
            className="hm-cta"
            style="display:inline-flex; align-items:center; gap:9px; text-decoration:none; background:#16161a; color:#f7f6f3; font-size:16px; font-weight:600; padding:15px 26px; border-radius:100px; border:1px solid #16161a; transition:transform .15s, background .15s;"
            hoverStyle={{ background: "#000", transform: "translateY(-1px)" }}
          >
            Join the waitlist
            {arrow}
          </Hover>
          <Hover
            as="a"
            href="/gallery"
            className="hm-cta"
            style="display:inline-flex; align-items:center; gap:9px; text-decoration:none; background:#fff; color:#16161a; font-size:16px; font-weight:600; padding:15px 24px; border-radius:100px; border:1px solid #e2ded4; transition:border-color .15s;"
            hoverStyle={{ borderColor: "#c9c4b8" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 4 20 12 6 20 6 4"></polygon>
            </svg>
            See examples
          </Hover>
        </div>
      </section>

      {/* ============ THREE STEPS ============ */}
      <section style={parseStyle("background:#efece7; border-top:1px solid #e6e2da; border-bottom:1px solid #e6e2da;")}>
        <div style={parseStyle("max-width:1080px; margin:0 auto; padding:clamp(50px,7vw,88px) clamp(20px,5vw,32px);")}>
          <h2 style={parseStyle("margin:0 0 clamp(34px,4.4vw,52px); font-family:'Space Grotesk'; font-weight:700; font-size:clamp(26px,3.8vw,38px); letter-spacing:-0.03em; line-height:1.1; max-width:520px; text-wrap:pretty;")}>
            Three steps. That is the whole thing.
          </h2>
          <div className="hm-steps" style={parseStyle("display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:clamp(22px,3.2vw,44px);")}>
            {STEPS.map((s) => (
              <div key={s.n} style={parseStyle("display:flex; flex-direction:column; gap:10px;")}>
                <span style={parseStyle("font-family:'Space Grotesk'; font-weight:700; font-size:15px; color:#3b62e0;")}>{s.n}</span>
                <h3 style={parseStyle("margin:0; font-family:'Space Grotesk'; font-weight:600; font-size:clamp(19px,2.2vw,22px); letter-spacing:-0.02em;")}>{s.title}</h3>
                <p style={parseStyle("margin:0; font-size:15.5px; line-height:1.65; color:#63636a; text-wrap:pretty;")}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PEOPLE ASKED FOR THESE ============ */}
      <section style={parseStyle("max-width:1080px; margin:0 auto; padding:clamp(52px,7vw,88px) clamp(20px,5vw,32px) clamp(16px,2vw,24px);")}>
        <div style={parseStyle("max-width:560px; margin-bottom:clamp(26px,3.4vw,36px);")}>
          <h2 style={parseStyle("margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(26px,3.8vw,38px); letter-spacing:-0.03em; line-height:1.1; text-wrap:pretty;")}>
            People asked for these.
          </h2>
          <p style={parseStyle("margin:14px 0 0; font-size:16px; line-height:1.6; color:#63636a; text-wrap:pretty;")}>
            One sentence each. This is what came back.
          </p>
        </div>

        <div className="hm-strip" style={parseStyle("display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:clamp(12px,1.6vw,18px);")}>
          {PICKS.map((p) => (
            <div key={p.scene} style={parseStyle("display:flex; flex-direction:column; gap:9px;")}>
              <div style={parseStyle("position:relative; width:100%; aspect-ratio:16/9; border-radius:12px; overflow:hidden; background:#0a0a0d; border:1px solid #e2ded4;")}>
                <GalleryVideo scene={p.scene} label={p.label} />
              </div>
              <p style={parseStyle("margin:0; font-size:14px; line-height:1.5; color:#63636a;")}>{p.caption}</p>
            </div>
          ))}
        </div>

        <div style={parseStyle("margin-top:clamp(22px,2.6vw,28px);")}>
          <Link href="/gallery" style={parseStyle("display:inline-flex; align-items:center; gap:8px; text-decoration:none; font-size:15px; font-weight:600; color:#16161a;")}>
            See more videos {arrow}
          </Link>
        </div>
      </section>

      {/* ============ WHO IT IS FOR ============ */}
      <section style={parseStyle("max-width:1080px; margin:0 auto; padding:clamp(52px,7vw,86px) clamp(20px,5vw,32px) clamp(20px,2.6vw,30px);")}>
        <p style={parseStyle("margin:0; max-width:820px; font-family:'Space Grotesk'; font-weight:500; font-size:clamp(22px,3.2vw,32px); line-height:1.35; letter-spacing:-0.024em; color:#16161a; text-wrap:pretty;")}>
          Made for teachers who want the class to see it, creators who want a better visual, and anyone who has ever said{" "}
          <span style={parseStyle("color:#3b62e0;")}>&ldquo;it is hard to explain, but...&rdquo;</span>
        </p>
      </section>

      {/* ============ WAITLIST ============ */}
      <section id="waitlist" style={parseStyle("max-width:1080px; margin:0 auto; padding:clamp(30px,4vw,48px) clamp(20px,5vw,32px) clamp(60px,8vw,100px);")}>
        <div style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:clamp(18px,2.4vw,26px); padding:clamp(34px,5.4vw,62px) clamp(22px,4.4vw,54px); box-shadow:0 24px 60px -44px rgba(22,22,26,0.4);")}>
          <div style={parseStyle("max-width:600px; margin:0 auto; text-align:center;")}>
            <h2 style={parseStyle("margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(27px,4.4vw,40px); letter-spacing:-0.032em; line-height:1.06; text-wrap:pretty;")}>
              Be there on day one.
            </h2>
            <p style={parseStyle("margin:16px auto 0; max-width:420px; font-size:16px; line-height:1.6; color:#63636a; text-wrap:pretty;")}>
              We are letting people in a few at a time. Leave your email and we will send one message when it is your turn.
            </p>

            <WaitlistForm />

            <div style={parseStyle("display:flex; align-items:center; justify-content:center; gap:12px; margin-top:24px; flex-wrap:wrap;")}>
              <div style={parseStyle("display:flex;")}>
                {AVATARS.map((a, i) => (
                  <div
                    key={a.text}
                    style={parseStyle(
                      `width:28px; height:28px; border-radius:50%; background:${a.bg}; border:2px solid #fff; ${i ? "margin-left:-8px; " : ""}display:flex; align-items:center; justify-content:center; font-size:10.5px; font-weight:700; color:${a.fg};`,
                    )}
                  >
                    {a.text}
                  </div>
                ))}
              </div>
              <p style={parseStyle("margin:0; font-size:14px; color:#77767d; line-height:1.4;")}>
                4,200+ people are already waiting. No spam, no card.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
