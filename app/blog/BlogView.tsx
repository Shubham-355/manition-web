"use client";

import { useState } from "react";
import { parseStyle as css } from "../lib/css";
import NightShell from "../components/night/NightShell";
import { CARD, EYEBROW, GridBg, Ground, JoinCta, Stars } from "../components/night/parts";

const POSTS = [
  { cat: "Tutorial", t: "Five prompts that make great trig visuals", rt: "5 min read", img: "/v3/bc-trig.webp" },
  { cat: "Behind the scenes", t: "Rendering at scale on ephemeral GPUs", rt: "6 min read", img: "/v3/bc-cubes.webp" },
  { cat: "Education", t: "How a teacher built a full unit of visuals", rt: "4 min read", img: "/v3/bc-easel.webp" },
  { cat: "Product", t: "Iterating on scenes with chat, done right", rt: "5 min read", img: "/v3/bc-bubbles.webp" },
];

const LOG = [
  { v: "v0.9", t: "4K exports & transparent backgrounds", d: "Pro renders can now export at 4K with an alpha channel for overlays.", newest: true },
  { v: "v0.8", t: "Editable code panel", d: "Open, edit and re-run the generated Manim without re-prompting.", newest: false },
  { v: "v0.7", t: "Searchable library", d: "Find any past render by title, prompt or category.", newest: false },
];

/* birds lifting off the open book: [left, top, width, bob, image, transform, opacity] */
const BIRDS: [string, string, string, string, string, string, number][] = [
  ["52%", "22%", "18%", "3,9,0,2", "b-birdhalf", "rotate(-14deg)", 1],
  ["32%", "-8%", "16%", "4,11,1.2,3", "b-birdhalf", "rotate(-24deg) scaleX(-1)", 1],
  ["14%", "-34%", "14%", "5,10,2,4", "b-bird", "rotate(-18deg) scaleX(-1)", 1],
  ["-8%", "-52%", "12%", "5,12,3,5", "b-bird", "rotate(-8deg) scaleX(-1)", 0.92],
  ["-30%", "-46%", "10%", "4,13,4,4", "b-bird", "rotate(4deg) scaleX(-1)", 0.8],
  ["-50%", "-28%", "8%", "3,14,5,3", "b-bird", "rotate(12deg) scaleX(-1)", 0.65],
];

const H2 = "margin:0 0 20px; font-family:'Instrument Serif',serif; font-weight:400; font-size:clamp(30px,3.2vw,40px); letter-spacing:-0.025em;";

export default function BlogView({ fontClass }: { fontClass: string }) {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <NightShell fontClass={fontClass} active="blog" sky="#1f1c36">
      {/* ============ HEADER: pages becoming birds ============ */}
      <section style={css("position:relative; isolation:isolate; height:clamp(580px,46vw,620px); overflow:hidden; background:linear-gradient(180deg,#0A0A0B 0%,#121426 30%,#1f1c36 54%,#352a48 70%,#4a3656 76%);")}>
        <Stars place="left:0; right:0; top:0; height:70%;" opacity={0.5} mask="-webkit-mask-image:linear-gradient(180deg,#000 30%,transparent); mask-image:linear-gradient(180deg,#000 30%,transparent);" />
        <div data-par="0.2" aria-hidden="true" style={css("position:absolute; inset:0; pointer-events:none;")}>
          <div style={css("position:absolute; right:14%; top:12%; width:clamp(200px,22vw,320px); aspect-ratio:1; border-radius:50%; background:radial-gradient(circle, rgba(244,233,208,.18), rgba(244,233,208,0) 70%); transform:scale(1.7);")} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v3/moon.webp" alt="" style={css("position:absolute; right:14%; top:12%; width:clamp(200px,22vw,320px); opacity:.9; filter:drop-shadow(0 0 30px rgba(244,233,208,.35));")} />
        </div>
        <Ground top="76%" tint="radial-gradient(ellipse 30% 60% at 72% 0%, rgba(207,214,255,.14), rgba(207,214,255,0) 70%)" />
        <div data-par="0.6" aria-hidden="true" style={css("position:absolute; inset:0; pointer-events:none;")}>
          <div className="bl-book" style={css("position:absolute; right:6%; bottom:14%; width:min(620px,48%); aspect-ratio:1400/700;")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v3/b-book.webp" alt="" style={css("position:absolute; inset:0; width:100%; height:100%;")} />
            {BIRDS.map(([l, t, w, bob, img, tf, op]) => (
              <div key={l + t} data-bob={bob} style={css(`position:absolute; left:${l}; top:${t}; width:${w};`)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/v3/${img}.webp`} alt="" style={css(`width:100%; display:block; transform:${tf}; opacity:${op};`)} />
              </div>
            ))}
          </div>
        </div>
        <div className="bl-head" style={css("position:relative; z-index:3; max-width:1360px; margin:0 auto; padding:clamp(120px,11vw,140px) clamp(16px,4vw,40px) 0;")}>
          <p style={css(`margin:0 0 18px; font-size:12.5px; ${EYEBROW}`)}>BLOG</p>
          <h1 className="serif" style={css("margin:0; font-size:clamp(46px,6vw,84px); line-height:1; letter-spacing:-0.03em;")}>
            Notes from <span style={css("font-style:italic; color:#FF5B1F;")}>the studio.</span>
          </h1>
          <p style={css("margin:22px 0 0; max-width:420px; font-size:16.5px; line-height:1.6; color:#d6d2ca; text-wrap:pretty;")}>
            Product updates, deep dives on animating math, and the occasional look behind the render.
          </p>
        </div>
      </section>

      <GridBg>
        {/* ============ FEATURED ============ */}
        <section style={css("position:relative; max-width:1240px; margin:0 auto; padding:clamp(40px,5vw,64px) clamp(16px,4vw,40px) clamp(30px,4vw,48px);")}>
          <article className="bl-feat bl-lift" style={css(`display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); color:#EDEAE3; ${CARD} border-radius:24px; overflow:hidden; box-shadow:inset 0 1px 0 rgba(237,234,227,.07), 0 60px 70px -50px rgba(0,0,0,.95); transition:transform .3s;`)}>
            <div aria-hidden="true" style={css("position:relative; min-height:320px; overflow:hidden; background:linear-gradient(180deg,#141426 0%,#2a2340 55%,#3a2c4a 62%,#16121a 63%,#0e0d10 100%);")}>
              <div style={css("position:absolute; left:0; right:0; top:62%; bottom:0; background-image:linear-gradient(rgba(237,234,227,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(237,234,227,.07) 1px, transparent 1px); background-size:34px 18px; -webkit-mask-image:linear-gradient(180deg,#000,transparent); mask-image:linear-gradient(180deg,#000,transparent);")} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v3/b-bell.webp" alt="" style={css("position:absolute; left:6%; bottom:16%; width:82%;")} />
            </div>
            <div style={css("padding:clamp(28px,4vw,52px); display:flex; flex-direction:column; justify-content:center;")}>
              <p style={css(`margin:0 0 16px; font-size:11.5px; ${EYEBROW}`)}>FEATURED · DEEP DIVE</p>
              <h2 className="serif" style={css("margin:0 0 16px; font-size:32px; line-height:1.1; letter-spacing:-0.02em; text-wrap:pretty;")}>How we turn a sentence into a Manim scene</h2>
              <p style={css("margin:0 0 22px; font-size:15.5px; line-height:1.65; color:#a9a59d; text-wrap:pretty;")}>
                A look at the pipeline behind Manition - from parsing your prompt, to planning the scene graph, to writing code a cloud GPU can render in seconds.
              </p>
              <div style={css("display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;")}>
                <span className="mono" style={css("font-size:12px; color:#a9a59d;")}>8 min read</span>
                <span style={css("font-size:14.5px; font-weight:500; color:#FF5B1F;")}>Coming soon</span>
              </div>
            </div>
          </article>
        </section>

        {/* ============ LATEST + CHANGELOG ============ */}
        <section style={css("position:relative; max-width:1240px; margin:0 auto; padding:clamp(30px,4vw,48px) clamp(16px,4vw,40px);")}>
          <div className="bl-cols" style={css("display:grid; grid-template-columns:minmax(0,8fr) minmax(0,4fr); gap:clamp(20px,3vw,36px); align-items:start;")}>
            <div>
              <h2 data-reveal="1" style={css(H2)}>Latest posts</h2>
              <div className="bl-posts" style={css("display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:clamp(12px,1.6vw,20px);")}>
                {POSTS.map((p, i) => {
                  const h = hov === i;
                  return (
                    <article
                      key={p.t}
                      onMouseEnter={() => setHov(i)}
                      onMouseLeave={() => setHov(null)}
                      style={css(`display:block; color:#EDEAE3; ${CARD} border-radius:20px; overflow:hidden; box-shadow:inset 0 1px 0 rgba(237,234,227,.07), 0 40px 50px -40px rgba(0,0,0,.95); transition:transform .3s; transform:${h ? "translateY(-4px)" : "none"};`)}
                    >
                      <div aria-hidden="true" style={css("position:relative; aspect-ratio:16/9; overflow:hidden; background:radial-gradient(ellipse 70% 60% at 30% 80%, rgba(255,140,80,.1), rgba(255,140,80,0)), linear-gradient(180deg,#17151d,#0e0d10);")}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.img} alt="" style={css(`position:absolute; left:8%; top:8%; width:84%; transition:transform .5s cubic-bezier(.2,.7,.1,1); transform:${h ? "translateY(-8px) rotate(-1.5deg)" : "none"};`)} />
                      </div>
                      <div style={css("padding:18px 20px 22px;")}>
                        <p className="mono" style={css("margin:0 0 8px; font-size:11.5px; letter-spacing:.1em; color:#FF5B1F;")}>{p.cat}</p>
                        <h3 style={css("margin:0 0 10px; font-weight:500; font-size:17px; line-height:1.4; letter-spacing:-0.01em; text-wrap:pretty;")}>{p.t}</h3>
                        <p className="mono" style={css("margin:0; font-size:12px; color:#a9a59d;")}>{p.rt}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
            <div>
              <h2 data-reveal="1" style={css(H2)}>Changelog</h2>
              <div style={css(`position:relative; ${CARD} border-radius:20px; padding:26px 24px 10px; box-shadow:inset 0 1px 0 rgba(237,234,227,.07), 0 40px 50px -40px rgba(0,0,0,.95);`)}>
                <svg aria-hidden="true" viewBox="0 0 6 400" preserveAspectRatio="none" style={css("position:absolute; left:47px; top:40px; bottom:40px; width:6px; height:calc(100% - 80px);")}>
                  <path d="M3 0 C 1 60, 5 120, 3 200 S 1 330, 3 400" stroke="#EDEAE3" strokeOpacity=".35" strokeWidth="2" fill="none" strokeDasharray="5 3 1 3" />
                </svg>
                {LOG.map((l) => (
                  <div key={l.v} style={css("position:relative; display:grid; grid-template-columns:52px minmax(0,1fr); gap:14px; padding-bottom:24px;")}>
                    <span className="mono" style={css("position:relative; z-index:1; justify-self:start; display:inline-flex; align-items:center; gap:6px; height:24px; padding:0 9px; border-radius:100px; background:#FF5B1F; color:#0A0A0B; font-size:11.5px; font-weight:500;")}>{l.v}</span>
                    <div>
                      <h3 style={css("margin:2px 0 6px; font-weight:500; font-size:15.5px; line-height:1.35; display:flex; align-items:center; gap:8px;")}>
                        <span>{l.t}</span>
                        {l.newest && <span aria-label="Newest" className="bl-pulse" style={css("flex:none; width:7px; height:7px; border-radius:50%; background:#FF5B1F;")} />}
                      </h3>
                      <p style={css("margin:0; font-size:14px; line-height:1.55; color:#a9a59d;")}>{l.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section style={css("position:relative; max-width:1240px; margin:0 auto; padding:clamp(50px,6vw,84px) clamp(16px,4vw,40px) clamp(110px,12vw,170px);")}>
          <div data-reveal="1" style={css(`position:relative; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:24px; ${CARD} border-radius:24px; padding:clamp(34px,5vw,56px) clamp(22px,4.4vw,56px); box-shadow:inset 0 1px 0 rgba(237,234,227,.07), 0 60px 70px -50px rgba(0,0,0,.95);`)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bl-hidem" src="/v3/b-bird.webp" alt="" aria-hidden="true" style={css("position:absolute; right:12%; top:-46px; width:90px; transform:rotate(-6deg); filter:drop-shadow(14px 8px 4px rgba(0,0,0,.5));")} />
            <p className="serif" style={css("margin:0; font-size:clamp(34px,4.4vw,56px); line-height:1; letter-spacing:-0.03em;")}>
              Say what you want. <span style={css("font-style:italic; color:#FF5B1F;")}>Get a video back.</span>
            </p>
            <JoinCta />
          </div>
        </section>
      </GridBg>
    </NightShell>
  );
}
