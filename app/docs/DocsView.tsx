"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { parseStyle as css } from "../lib/css";
import NightShell from "../components/night/NightShell";
import { CARD, EYEBROW, GridBg, Stars } from "../components/night/parts";
import { CATEGORIES, POPULAR, type Block } from "../components/docs-content";

/* one hand-drawn tile per category, in CATEGORIES order */
const ICONS: ReactNode[] = [
  <svg key="0" width="40" height="40" viewBox="0 0 40 40"><path d="M14 34 L26 12" stroke="#c99a6a" strokeWidth="3" strokeLinecap="round" /><circle cx="27" cy="10" r="4" fill="#7a2a1a" /><path d="M27 2 C 33 6, 31 12, 27 13 C 22 12, 22 6, 27 2Z" fill="#FF8A4A" /><path d="M27 6 C 29 8, 28 11, 27 11 C 25 10, 25 8, 27 6Z" fill="#FFE2B0" /></svg>,
  <svg key="1" width="40" height="40" viewBox="0 0 40 40"><path d="M10 34 C 12 20, 20 8, 34 4 C 30 16, 22 26, 10 34Z" fill="#EDEAE3" /><path d="M10 34 L 26 14" stroke="#8C8A85" strokeWidth="1.2" /><path d="M6 36 h12" stroke="#c99a52" strokeWidth="2" /></svg>,
  <svg key="2" width="40" height="40" viewBox="0 0 40 40"><path d="M15 9 L5 20 L15 31" stroke="#d9b06a" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M25 9 L35 20 L25 31" stroke="#a8803f" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  <svg key="3" width="40" height="40" viewBox="0 0 40 40"><ellipse cx="20" cy="12" rx="13" ry="5" fill="#d9b06a" /><rect x="7" y="12" width="26" height="18" fill="#8a6a3e" /><ellipse cx="20" cy="30" rx="13" ry="5" fill="#6b4f2c" /><ellipse cx="20" cy="12" rx="4" ry="1.6" fill="#2a2030" /><path d="M33 18 h5 v8 h-5" fill="#2a2030" /></svg>,
  <svg key="4" width="40" height="40" viewBox="0 0 40 40"><rect x="6" y="20" width="28" height="14" fill="#b8ae9c" /><rect x="5" y="14" width="28" height="14" fill="#d8cfbe" transform="rotate(-6 19 21)" /><rect x="7" y="7" width="28" height="15" fill="#EDEAE3" transform="rotate(4 21 14)" /><path d="M8 8 L21 17 L34 9" stroke="#8C8A85" fill="none" transform="rotate(4 21 14)" /><circle cx="21" cy="17" r="2.4" fill="#FF5B1F" /></svg>,
  <svg key="5" width="40" height="40" viewBox="0 0 40 40"><path d="M6 14 h24 c0 10 -5 16 -12 16 c-7 0 -12 -6 -12 -16Z" fill="#EDEAE3" /><path d="M30 17 c6 0 6 8 0 8" stroke="#d8cfbe" strokeWidth="2.6" fill="none" /><path d="M14 14 L17 20 L13 24 L16 29" stroke="#e8b94a" strokeWidth="1.8" fill="none" /><ellipse cx="18" cy="33" rx="13" ry="2.5" fill="#b8ae9c" /></svg>,
];

const ROT = ["-1deg", "1deg", "-0.6deg", "0.8deg"];

function blockText(b: Block): string[] {
  if (b.t === "p" || b.t === "tip") return [b.text];
  if (b.t === "s") return b.items;
  return [b.code];
}

type Hit = { cat: number; guide: number; title: string; where: string };

export default function DocsView({ fontClass }: { fontClass: string }) {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [hov, setHov] = useState<number | null>(null);
  /* the reader drawer: a category's guide list, or one guide */
  const [cat, setCat] = useState<number | null>(null);
  const [guide, setGuide] = useState<number | null>(null);

  const words = useMemo(() => q.trim().toLowerCase().split(/\s+/).filter(Boolean), [q]);
  const hits = useMemo<Hit[]>(() => {
    if (!words.length) return [];
    const out: Hit[] = [];
    CATEGORIES.forEach((c, ci) =>
      c.guides.forEach((g, gi) => {
        const hay = [g.title, c.title, ...g.blocks.flatMap(blockText)].join(" ").toLowerCase();
        if (words.every((w) => hay.includes(w))) out.push({ cat: ci, guide: gi, title: g.title, where: c.title });
      }),
    );
    return out.slice(0, 6);
  }, [words]);

  const open = (c: number, g: number | null) => {
    setCat(c);
    setGuide(g);
  };
  const close = () => {
    setCat(null);
    setGuide(null);
  };

  useEffect(() => {
    if (cat === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [cat]);

  const C = cat !== null ? CATEGORIES[cat] : null;
  const G = C && guide !== null ? C.guides[guide] : null;
  const showRes = words.length > 0 && focus;

  return (
    <NightShell fontClass={fontClass} active="docs" sky="#0A0A0B">
      {/* ============ HEADER: lamp at midnight ============ */}
      <section style={css("position:relative; isolation:isolate; height:clamp(600px,48vw,660px); overflow:hidden; background:linear-gradient(180deg,#060607 0%,#0A0A0B 50%,#120e12 74%);")}>
        <Stars place="inset:0 0 30% 0;" opacity={0.65} mask="" />
        <Stars place="inset:0 0 30% 0;" opacity={0.3} size={520} pos="background-position:300px 80px;" mask="" />
        <div aria-hidden="true" style={css("position:absolute; left:0; right:0; top:74%; bottom:0; overflow:hidden; pointer-events:none;")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v3/ground.webp" alt="" style={css("position:absolute; left:50%; top:0; width:max(100%,1800px); transform:translateX(-50%); display:block; opacity:.75;")} />
        </div>
        <div aria-hidden="true" style={css(`position:absolute; left:50%; top:30%; width:min(1000px,130vw); height:80%; transform:translateX(-50%); background:radial-gradient(ellipse 48% 44% at 50% 62%, rgba(255,200,130,.42), rgba(255,140,60,.14) 45%, rgba(255,91,31,0) 72%); opacity:${words.length ? 1 : focus ? 0.85 : 0.65}; transition:opacity .5s; pointer-events:none;`)} />
        <div data-par="0.5" aria-hidden="true" style={css("position:absolute; left:0; right:0; bottom:2%; display:flex; justify-content:center; pointer-events:none;")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="dc-desk" src="/v3/d-desk.webp" alt="" style={css("width:min(620px,84%); display:block; margin-left:8%; margin-bottom:-2%; filter:brightness(.82) saturate(.9);")} />
        </div>
        <div className="dc-head" style={css("position:relative; z-index:3; max-width:760px; margin:0 auto; padding:clamp(108px,10vw,128px) clamp(16px,4vw,40px) 0; text-align:center;")}>
          <p style={css(`margin:0 0 16px; font-size:12.5px; ${EYEBROW}`)}>DOCS</p>
          <h1 className="serif" style={css("margin:0; font-size:clamp(44px,5.6vw,76px); line-height:1; letter-spacing:-0.03em;")}>
            How can <span style={css("font-style:italic; color:#FF5B1F;")}>we help?</span>
          </h1>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              if (hits[0]) open(hits[0].cat, hits[0].guide);
            }}
            style={css("position:relative; margin:30px auto 0; width:min(560px,100%);")}
          >
            <div className="dc-form" style={css(`display:flex; align-items:center; gap:8px; padding:7px 7px 7px 18px; border-radius:100px; background:rgba(18,18,20,.72); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border:1px solid ${focus ? "#FF5B1F" : "rgba(237,234,227,.16)"}; box-shadow:0 0 0 ${focus ? "2px" : "0px"} rgba(255,91,31,.35), 0 24px 40px -24px rgba(0,0,0,.9); transition:border-color .2s, box-shadow .2s;`)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#a9a59d" strokeWidth="2" strokeLinecap="round" style={css("flex:none;")}>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setFocus(true)}
                onBlur={() => setTimeout(() => setFocus(false), 150)}
                aria-label="Search guides"
                placeholder={"Search guides… e.g. “transparent export”"}
                style={css("flex:1; min-width:0; background:none; border:0; outline:none; color:#EDEAE3; font-family:inherit; font-size:15px; padding:9px 0;")}
              />
              <button type="submit" className="h3-pill" style={css("appearance:none; border:0; font-family:inherit; font-size:14px; padding:10px 18px; cursor:pointer; justify-content:center;")}>
                Search
              </button>
            </div>
            {showRes && (
              <div style={css(`position:absolute; z-index:10; left:0; right:0; top:calc(100% + 10px); text-align:left; ${CARD} border-color:rgba(237,234,227,.1); border-radius:18px; padding:8px; box-shadow:inset 0 1px 0 rgba(237,234,227,.07), 0 40px 60px -30px rgba(0,0,0,.95);`)}>
                {hits.map((h) => (
                  <button key={h.cat + "-" + h.guide} type="button" className="dc-row" onMouseDown={(e) => e.preventDefault()} onClick={() => open(h.cat, h.guide)} style={css("appearance:none; width:100%; border:0; background:none; cursor:pointer; font-family:inherit; display:flex; justify-content:space-between; align-items:baseline; gap:14px; padding:11px 12px; border-radius:10px; color:#EDEAE3; font-size:14.5px; text-align:left;")}>
                    <span>{h.title}</span>
                    <span className="mono" style={css("font-size:11.5px; color:#a9a59d; white-space:nowrap;")}>{h.where}</span>
                  </button>
                ))}
                {!hits.length && <p style={css("margin:0; padding:12px; font-size:14px; color:#a9a59d;")}>No guides match that yet.</p>}
              </div>
            )}
          </form>
        </div>
      </section>

      <GridBg>
        {/* ============ CATEGORIES ============ */}
        <section style={css("position:relative; max-width:1160px; margin:0 auto; padding:clamp(40px,5vw,64px) clamp(16px,4vw,40px) clamp(30px,4vw,48px);")}>
          <div className="dc-cats" style={css("display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:clamp(12px,1.6vw,20px);")}>
            {CATEGORIES.map((c, i) => {
              const h = hov === i;
              return (
                <button
                  key={c.id}
                  type="button"
                  className="dc-cat"
                  onClick={() => open(i, null)}
                  onMouseEnter={() => setHov(i)}
                  onMouseLeave={() => setHov(null)}
                  style={css(`appearance:none; font-family:inherit; text-align:left; cursor:pointer; position:relative; display:flex; flex-direction:column; gap:10px; color:#EDEAE3; ${CARD} border-radius:20px; padding:24px; box-shadow:inset 0 1px 0 rgba(237,234,227,.07), 0 40px 50px -40px rgba(0,0,0,.95); transition:transform .25s, border-color .25s; transform:${h ? "translateY(-3px)" : "none"};`)}
                >
                  <span aria-hidden="true" style={css(`width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; background:${h ? "radial-gradient(circle at 35% 70%, rgba(255,190,120,.45), rgba(255,91,31,.12) 70%)" : "rgba(237,234,227,.04)"}; box-shadow:${h ? "0 0 26px rgba(255,150,80,.35)" : "none"}; transition:background .35s, box-shadow .35s;`)}>
                    {ICONS[i]}
                  </span>
                  <h2 style={css("margin:6px 0 0; font-weight:500; font-size:18px; letter-spacing:-0.01em;")}>{c.title}</h2>
                  <p style={css("margin:0; font-size:14.5px; line-height:1.55; color:#a9a59d;")}>{c.desc}</p>
                  <span className="mono" style={css("margin-top:auto; padding-top:8px; font-size:12px; color:#a9a59d;")}>{c.guides.length} guides</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ============ POPULAR: pinned notes ============ */}
        <section style={css("position:relative; max-width:1160px; margin:0 auto; padding:clamp(30px,4vw,48px) clamp(16px,4vw,40px);")}>
          <h2 data-reveal="1" className="serif" style={css("margin:0 0 22px; font-size:clamp(30px,3.4vw,42px); letter-spacing:-0.025em;")}>Popular right now</h2>
          <div style={css(`${CARD} border-radius:22px; padding:clamp(22px,3vw,34px);`)}>
            <ol className="dc-pop" style={css("list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:18px;")}>
              {POPULAR.map((p, i) => (
                <li key={p.n} style={css(`position:relative; transform:rotate(${ROT[i]}); transition:transform .25s;`)}>
                  <span aria-hidden="true" style={css("position:absolute; left:50%; top:-6px; z-index:2; width:12px; height:12px; margin-left:-6px; border-radius:50%; background:radial-gradient(circle at 35% 35%, #ffb27a, #c2410c); box-shadow:2px 3px 3px rgba(0,0,0,.5);")} />
                  <button
                    type="button"
                    className="dc-note"
                    onClick={() => open(CATEGORIES.findIndex((c) => c.id === p.cat), p.guide)}
                    style={css("appearance:none; border:0; width:100%; text-align:left; cursor:pointer; font-family:inherit; display:block; min-height:118px; background-color:#ECE7DC; background-image:linear-gradient(transparent 31px, rgba(181,101,90,.35) 31px, rgba(181,101,90,.35) 32px, transparent 32px), repeating-linear-gradient(transparent 0 23px, rgba(90,110,150,.16) 23px 24px); background-position:0 0, 0 32px; border-radius:4px; padding:12px 16px 18px; color:#1a1612; box-shadow:0 18px 22px -16px rgba(0,0,0,.9);")}
                  >
                    <span className="mono" style={css("display:block; font-size:12px; color:#9b3a12;")}>{p.n}.</span>
                    <span style={css("display:block; margin-top:10px; font-size:15.5px; line-height:1.5; font-weight:500; text-wrap:pretty;")}>{p.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ HELP CARDS ============ */}
        <section style={css("position:relative; max-width:1160px; margin:0 auto; padding:clamp(30px,4vw,48px) clamp(16px,4vw,40px) clamp(110px,12vw,170px);")}>
          <div className="dc-help" style={css("display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:clamp(14px,2vw,24px);")}>
            <div data-reveal="1" style={css(`position:relative; ${CARD} border-radius:22px; padding:clamp(26px,3.4vw,40px);`)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v3/obj-plane.png" alt="" aria-hidden="true" style={css("position:absolute; right:18px; top:-30px; width:110px; transform:rotate(-8deg); filter:drop-shadow(10px 14px 6px rgba(0,0,0,.55));")} />
              <h2 className="serif" style={css("margin:0 0 10px; font-size:32px; letter-spacing:-0.02em;")}>Can&apos;t find it?</h2>
              <p style={css("margin:0 0 24px; max-width:380px; font-size:15.5px; line-height:1.6; color:#a9a59d;")}>More docs are on the way. Join the waitlist and we&apos;ll keep you posted as they expand.</p>
              <Link href="/#waitlist" className="h3-cta" style={css("font-size:14.5px; padding:12px 20px;")}>
                Join the waitlist <span>→</span>
              </Link>
            </div>
            <div data-reveal="1" style={css(`position:relative; overflow:hidden; ${CARD} border-radius:22px; padding:clamp(26px,3.4vw,40px);`)}>
              <svg aria-hidden="true" viewBox="0 0 80 110" style={css("position:absolute; right:28px; bottom:0; width:64px;")}>
                <defs>
                  <linearGradient id="dcdoor" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#fff1d8" />
                    <stop offset="1" stopColor="#FF5B1F" />
                  </linearGradient>
                </defs>
                <ellipse cx="60" cy="108" rx="40" ry="5" fill="#FF5B1F" opacity=".25" />
                <path d="M6 110 V30 A34 34 0 0 1 74 30 V110 Z" fill="#d8cfbe" />
                <path d="M16 110 V34 A24 24 0 0 1 64 34 V110 Z" fill="url(#dcdoor)" />
              </svg>
              <h2 className="serif" style={css("margin:0 0 10px; font-size:32px; letter-spacing:-0.02em;")}>New to Manition?</h2>
              <p style={css("margin:0 0 24px; max-width:360px; font-size:15.5px; line-height:1.6; color:#a9a59d;")}>Watch the 26-second tour on the homepage, then join the list.</p>
              <Link href="/#demo" className="h3-outline" style={css("font-size:14.5px; padding:12px 20px;")}>
                See it in action <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      </GridBg>

      {/* ============ READER DRAWER ============ */}
      {C && cat !== null && (
        <div style={css("position:fixed; inset:0; z-index:200; display:flex; justify-content:flex-end;")}>
          <div onClick={close} className="dc-fade" style={css("position:absolute; inset:0; background:rgba(5,5,6,.66);")} />
          <div role="dialog" aria-modal="true" aria-label={G ? G.title : C.title} className="dc-slide" style={css("position:relative; width:min(560px, 94vw); height:100%; background:#101012; border-left:1px solid rgba(237,234,227,.1); box-shadow:-24px 0 60px rgba(0,0,0,.6); display:flex; flex-direction:column;")}>
            <div style={css("flex:0 0 auto; display:flex; align-items:center; gap:12px; padding:16px 22px; border-bottom:1px solid rgba(237,234,227,.08);")}>
              <span aria-hidden="true" style={css("width:36px; height:36px; flex:none; border-radius:10px; display:flex; align-items:center; justify-content:center; background:rgba(237,234,227,.04); transform:scale(.8);")}>
                {ICONS[cat]}
              </span>
              <div className="mono" style={css("flex:1; min-width:0; display:flex; align-items:center; gap:7px; font-size:11.5px; color:#8C8A85;")}>
                <span>Docs</span>
                <span>/</span>
                <span style={css("color:#FF5B1F; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;")}>{C.title}</span>
              </div>
              <button type="button" onClick={close} aria-label="Close" className="dc-x" style={css("flex:none; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border:1px solid rgba(237,234,227,.14); background:transparent; border-radius:100px; cursor:pointer; color:#bdbab3;")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div style={css("flex:1 1 0; min-height:0; overflow-y:auto; padding:24px 26px 44px;")}>
              {!G && (
                <>
                  <h2 className="serif" style={css("margin:0 0 8px; font-size:34px; letter-spacing:-0.02em; line-height:1.05;")}>{C.title}</h2>
                  <p style={css("margin:0 0 6px; font-size:15px; line-height:1.6; color:#a9a59d;")}>{C.desc}</p>
                  <p className="mono" style={css("margin:0 0 20px; font-size:11.5px; color:#8C8A85;")}>{C.guides.length} guides</p>
                  <div style={css("border:1px solid rgba(237,234,227,.08); border-radius:14px; overflow:hidden;")}>
                    {C.guides.map((g, i) => (
                      <button key={g.title} type="button" className="dc-row" onClick={() => setGuide(i)} style={css(`appearance:none; width:100%; border:0; background:none; cursor:pointer; font-family:inherit; text-align:left; display:flex; align-items:center; gap:12px; padding:15px 18px; color:#EDEAE3;${i < C.guides.length - 1 ? " border-bottom:1px solid rgba(237,234,227,.06);" : ""}`)}>
                        <span style={css("flex:1; min-width:0; font-size:15px; font-weight:500;")}>{g.title}</span>
                        <span className="mono" style={css("flex:none; font-size:11px; color:#8C8A85;")}>{g.read}</span>
                        <span aria-hidden="true" style={css("color:#FF5B1F;")}>→</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {G && guide !== null && (
                <>
                  <button type="button" onClick={() => setGuide(null)} className="dc-back" style={css("appearance:none; border:0; background:none; padding:0; cursor:pointer; font-family:inherit; display:inline-flex; align-items:center; gap:6px; margin:0 0 18px; font-size:13px; font-weight:500; color:#a9a59d;")}>
                    ← All {C.title} guides
                  </button>
                  <h2 className="serif" style={css("margin:0 0 8px; font-size:34px; line-height:1.08; letter-spacing:-0.02em;")}>{G.title}</h2>
                  <p className="mono" style={css("margin:0 0 22px; font-size:11.5px; letter-spacing:.04em; color:#8C8A85;")}>{G.read}</p>
                  {G.blocks.map((b, i) =>
                    b.t === "p" ? (
                      <p key={i} style={css("margin:0 0 16px; font-size:15.5px; line-height:1.72; color:#d6d2ca;")}>{b.text}</p>
                    ) : b.t === "s" ? (
                      <ol key={i} style={css("margin:0 0 18px; padding-left:22px; color:#d6d2ca;")}>
                        {b.items.map((it, j) => (
                          <li key={j} style={css("margin:0 0 9px; font-size:15px; line-height:1.6;")}>{it}</li>
                        ))}
                      </ol>
                    ) : b.t === "tip" ? (
                      <div key={i} style={css("display:flex; gap:11px; margin:0 0 18px; padding:14px 16px; background:rgba(255,91,31,.07); border:1px solid rgba(255,91,31,.28); border-radius:12px;")}>
                        <span aria-hidden="true" style={css("flex:none; margin-top:6px; width:7px; height:7px; border-radius:50%; background:#FF5B1F; box-shadow:0 0 8px rgba(255,91,31,.8);")} />
                        <p style={css("margin:0; font-size:14px; line-height:1.6; color:#EDEAE3;")}>{b.text}</p>
                      </div>
                    ) : (
                      <pre key={i} className="mono" style={css("margin:0 0 18px; padding:15px 16px; background:#0A0A0B; border:1px solid rgba(237,234,227,.08); color:#d1cdc5; border-radius:12px; overflow-x:auto; font-size:12.5px; line-height:1.65; white-space:pre;")}>
                        {b.code}
                      </pre>
                    ),
                  )}
                  {C.guides.length > 1 && (
                    <div style={css("display:flex; gap:10px; margin-top:26px; padding-top:20px; border-top:1px solid rgba(237,234,227,.08);")}>
                      {guide > 0 && (
                        <button type="button" className="dc-step" onClick={() => setGuide(guide - 1)} style={css("appearance:none; flex:1; cursor:pointer; font-family:inherit; text-align:left; border:1px solid rgba(237,234,227,.12); border-radius:12px; padding:12px 14px; background:transparent; color:#EDEAE3;")}>
                          <span className="mono" style={css("display:block; font-size:10.5px; color:#8C8A85; margin-bottom:3px;")}>← Previous</span>
                          <span style={css("display:block; font-size:13.5px; font-weight:500;")}>{C.guides[guide - 1].title}</span>
                        </button>
                      )}
                      {guide < C.guides.length - 1 && (
                        <button type="button" className="dc-step" onClick={() => setGuide(guide + 1)} style={css("appearance:none; flex:1; cursor:pointer; font-family:inherit; text-align:right; border:1px solid rgba(237,234,227,.12); border-radius:12px; padding:12px 14px; background:transparent; color:#EDEAE3;")}>
                          <span className="mono" style={css("display:block; font-size:10.5px; color:#8C8A85; margin-bottom:3px;")}>Next →</span>
                          <span style={css("display:block; font-size:13.5px; font-weight:500;")}>{C.guides[guide + 1].title}</span>
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </NightShell>
  );
}
