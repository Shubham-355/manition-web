"use client";

import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { parseStyle as css } from "../lib/css";
import NightShell from "../components/night/NightShell";
import GalleryVideo from "../components/GalleryVideo";
import { WaitlistForm } from "../components/Interactive";
import { CARD, EYEBROW, GridBg, Stars } from "../components/night/parts";
import { SETS, type Card } from "./gallery-sets";

const poster = (s: string) => `/scenes/${s}.jpg`;
const MONO = "font-family:'Geist Mono',monospace;";

const SET_ICONS: ReactNode[] = [
  <svg key="0" width="30" height="30" viewBox="0 0 30 30"><path d="M8 27 V6 h12 v21" fill="#3a2a1c" /><path d="M10 27 V8 h8 v19 Z" fill="#FFB27A" /><path d="M10 8 L5 10 V27 L10 27Z" fill="#7a5638" /><path d="M10 27 L28 29 L18 27Z" fill="#FF5B1F" opacity=".6" /></svg>,
  <svg key="1" width="30" height="30" viewBox="0 0 30 30"><path d="M6 26 V13 a9 9 0 0 1 18 0 V26 Z" fill="rgba(207,214,255,.18)" stroke="#d8dcff" strokeWidth="1.2" /><path d="M15 25 C 15 18, 12 14, 10 10 M15 21 l3 -3 M15 18 l-3 -2 M15 15 l3 -3" stroke="#5fae6e" strokeWidth="1.6" fill="none" /><rect x="4" y="25" width="22" height="3" fill="#8a6a3e" /></svg>,
  <svg key="2" width="30" height="30" viewBox="0 0 30 30" fill="none"><path d="M15 15 C 8 4, 1 9, 6 15 C 1 21, 8 26, 15 15 C 22 4, 29 9, 24 15 C 29 21, 22 26, 15 15Z" stroke="#FF8A4A" strokeWidth="1.4" /><path d="M15 15 C 10 8, 5 11, 8 15 C 5 19, 10 22, 15 15 C 20 8, 25 11, 22 15 C 25 19, 20 22, 15 15Z" stroke="#EDEAE3" strokeWidth="1" /></svg>,
  <svg key="3" width="30" height="30" viewBox="0 0 30 30"><ellipse cx="17" cy="28" rx="8" ry="1.5" fill="#000" opacity=".5" /><path d="M15 2 L26 9 L26 20 L15 26 L4 20 L4 9 Z" fill="#c9bfae" /><path d="M15 2 L9 14 L21 14 Z" fill="#EDEAE3" /><path d="M4 9 L9 14 L4 20 M26 9 L21 14 L26 20 M9 14 L15 26 L21 14" stroke="#8a7d6c" strokeWidth=".8" fill="none" /></svg>,
  <svg key="4" width="30" height="30" viewBox="0 0 30 30"><rect x="3" y="11" width="12" height="12" rx="2" fill="#EDEAE3" /><circle cx="9" cy="17" r="1.6" fill="#FF5B1F" /><g transform="rotate(18 21 13)"><rect x="15" y="7" width="12" height="12" rx="2" fill="#d8cfbe" /><circle cx="18" cy="10" r="1.4" fill="#FF5B1F" /><circle cx="24" cy="16" r="1.4" fill="#FF5B1F" /></g></svg>,
  <svg key="5" width="30" height="30" viewBox="0 0 30 30"><path d="M3 27 h5 v-5 h5 v-5 h5 v-5 h5 v-5" stroke="#d8cfbe" strokeWidth="2.4" fill="none" /><ellipse cx="23" cy="6" rx="7" ry="4" fill="#EDEAE3" opacity=".75" /></svg>,
  <svg key="6" width="30" height="30" viewBox="0 0 30 30" fill="none"><path d="M2 12 C 8 4, 12 20, 18 12 S 26 8, 28 12" stroke="#FF5B1F" strokeWidth="2.6" strokeLinecap="round" /><path d="M3 22 h24 M6 25 h18" stroke="#8fa0c8" strokeWidth="1.2" opacity=".7" /><path d="M2 21 C 8 25, 12 18, 18 22 S 26 24, 28 21" stroke="#FF5B1F" strokeWidth="1" opacity=".3" /></svg>,
  <svg key="7" width="30" height="30" viewBox="0 0 30 30"><path d="M15 0 V9" stroke="#EDEAE3" strokeWidth="1" /><circle cx="15" cy="18" r="9" fill="#F4E9D0" /><circle cx="12" cy="16" r="2" fill="#d8cdb2" /><circle cx="18" cy="21" r="1.4" fill="#d8cdb2" /></svg>,
];

/* frames hanging down the moonlit corridor in the header, nearest first */
const CORRIDOR = [
  { x: "3%", y: "42%", w: "clamp(150px,17vw,250px)", src: "g-frame-gilt", ar: "480/380", sc: "chaosgame", po: 0.75, br: 1, bob: "3,11,0,0.6" },
  { x: "80%", y: "40%", w: "clamp(140px,16vw,230px)", src: "g-frame-bone", ar: "440/350", sc: "lorenz", po: 0.75, br: 0.95, bob: "3,12,1.4,0.6" },
  { x: "23%", y: "50%", w: "clamp(90px,10vw,150px)", src: "g-frame-card", ar: "400/320", sc: "dejong", po: 0.55, br: 0.8, bob: "2,10,2,0.5" },
  { x: "70%", y: "52%", w: "clamp(80px,9vw,130px)", src: "g-frame-gilt", ar: "480/380", sc: "", po: 0, br: 0.7, bob: "2,13,3,0.5" },
  { x: "39%", y: "60%", w: "clamp(50px,5vw,80px)", src: "g-frame-bone", ar: "440/350", sc: "", po: 0, br: 0.55, bob: "1.5,9,4,0.4" },
  { x: "64%", y: "62%", w: "clamp(40px,4.4vw,66px)", src: "g-frame-card", ar: "400/320", sc: "", po: 0, br: 0.5, bob: "1.5,14,5,0.4" },
  { x: "50%", y: "66%", w: "clamp(24px,2.6vw,40px)", src: "g-frame-gilt", ar: "480/380", sc: "", po: 0, br: 0.45, bob: "1,10,6,0.3" },
];

const STRING = "position:absolute; bottom:96%; width:1px; height:900px; background:linear-gradient(0deg, rgba(237,234,227,.32), rgba(237,234,227,0) 60%);";

/**
 * One framed clip. The poster covers the player until the pointer arrives, the
 * mini player starts on that same hover, and the prompt un-blurs: guess it first.
 */
const GalleryCard = memo(function GalleryCard({ c, big, onOpen }: { c: Card; big: boolean; onOpen: (c: Card) => void }) {
  const [h, setH] = useState(false);
  const [cat, title, dur, prompt, sc] = c;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(c)}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(c);
        }
      }}
      style={css(`cursor:pointer; transition:transform .3s cubic-bezier(.2,.7,.1,1); transform:${h ? "translateY(-4px)" : "none"};`)}
    >
      <div style={css(`padding:${big ? 7 : 6}px; background:#E7E2D7; border-radius:${big ? 6 : 5}px; box-shadow:0 2px 0 rgba(255,255,255,.3) inset, ${h ? "0 34px 40px -22px rgba(0,0,0,.95)" : "0 18px 24px -18px rgba(0,0,0,.9)"}; transition:box-shadow .3s;`)}>
        <div className="gl-frame" style={css(`position:relative; aspect-ratio:${big ? "16/9" : "16/10"}; overflow:hidden; border-radius:2px; background:linear-gradient(135deg,#17151d,#0e0d10);`)}>
          <GalleryVideo scene={sc} mini />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster(sc)} alt="" loading="lazy" style={css(`position:absolute; inset:0; width:100%; height:100%; object-fit:cover; pointer-events:none; opacity:${h ? 0 : 1}; transition:opacity .35s;`)} />
          <span style={css(`position:absolute; left:${big ? 10 : 9}px; top:${big ? 10 : 9}px; padding:${big ? "4px 8px" : "3px 7px"}; border-radius:6px; background:rgba(10,10,11,.75); ${MONO} font-size:${big ? 11 : 10.5}px; color:#EDEAE3; pointer-events:none;`)}>{cat}</span>
        </div>
      </div>
      <div style={css(`padding:${big ? 14 : 13}px 4px 0;`)}>
        <div style={css("display:flex; align-items:baseline; justify-content:space-between; gap:14px;")}>
          <p style={css(`margin:0; font-weight:500; font-size:${big ? 16.5 : 15}px;`)}>{title}</p>
          {dur && <span style={css(`flex:none; ${MONO} font-size:${big ? 12 : 11.5}px; color:#a9a59d;`)}>{dur}</span>}
        </div>
        <p style={css(`margin:${big ? 6 : 5}px 0 0; font-size:${big ? 14 : 13.5}px; line-height:1.5; font-style:italic; color:#a9a59d; filter:${h ? "none" : "blur(5px)"}; transition:filter .35s;`)}>“{prompt}”</p>
      </div>
    </div>
  );
});

export default function GalleryView({ fontClass }: { fontClass: string }) {
  const [active, setActive] = useState(0);
  const [stuck, setStuck] = useState(false);
  const [lb, setLb] = useState<Card | null>(null);
  const setsRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  /* which set is on screen, and whether the selector has scrolled away under the nav */
  useEffect(() => {
    const onScroll = () => {
      const sel = setsRef.current;
      setStuck(sel ? sel.getBoundingClientRect().bottom < 70 : false);
      let a = 0;
      document.querySelectorAll<HTMLElement>("[data-set]").forEach((e) => {
        if (e.getBoundingClientRect().top < 200) a = +(e.getAttribute("data-set") || 0);
      });
      setActive(a);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!lb) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLb(null);
    addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lb]);

  const openCard = useCallback((c: Card) => setLb(c), []);
  const go = (i: number) => {
    const el = document.getElementById(SETS[i].id);
    if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY - 130, behavior: "smooth" });
  };
  const tone = (i: number) => ({
    bg: active === i ? "#EDEAE3" : "#121214",
    fg: active === i ? "#0A0A0B" : "#EDEAE3",
    bd: active === i ? "#EDEAE3" : "rgba(237,234,227,.08)",
    pbg: active === i ? "#EDEAE3" : "transparent",
    nc: active === i ? "#9b3a12" : "#FF5B1F",
    ibg: active === i ? "rgba(10,10,11,.85)" : "rgba(237,234,227,.04)",
  });

  return (
    <NightShell fontClass={fontClass} active="gallery" sky="#0A0A0B">
      {/* ============ HEADER: museum under the stars ============ */}
      <section className="gl-hdr" style={css("position:relative; isolation:isolate; height:clamp(620px,50vw,680px); overflow:hidden; background:linear-gradient(180deg,#050506 0%,#0A0A0B 50%,#121018 72%,#1a1520 76%);")}>
        <Stars place="inset:0 0 24% 0;" opacity={0.85} mask="" />
        <Stars place="inset:0 0 24% 0;" opacity={0.45} size={480} pos="background-position:210px 120px;" mask="" />
        <div data-par="0.15" aria-hidden="true" style={css("position:absolute; inset:0; pointer-events:none;")}>
          <div style={css("position:absolute; left:calc(58% - 110px); top:calc(76% - 110px); width:220px; height:220px; border-radius:50%; background:radial-gradient(circle, rgba(244,233,208,.22), rgba(244,233,208,0) 65%);")} />
          <div style={css("position:absolute; left:calc(58% - 50px); top:calc(76% - 50px); width:100px; height:50px; overflow:hidden;")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v3/moon.webp" alt="" style={css("width:100px; display:block; opacity:.9;")} />
          </div>
        </div>
        <div aria-hidden="true" style={css("position:absolute; left:0; right:0; top:76%; bottom:0; overflow:hidden; pointer-events:none;")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v3/ground.webp" alt="" style={css("position:absolute; left:50%; top:0; width:max(100%,1800px); transform:translateX(-50%); display:block;")} />
          <div style={css("position:absolute; inset:0; background:linear-gradient(180deg, rgba(40,40,60,.35), rgba(10,10,11,0) 60%);")} />
          <div style={css("position:absolute; left:calc(58% - 3px); top:0; width:6px; height:100%; background:linear-gradient(180deg, rgba(244,233,208,.45), rgba(244,233,208,0)); filter:blur(2px);")} />
        </div>
        <div data-par="0.5" className="gl-corr" aria-hidden="true" style={css("position:absolute; inset:0; pointer-events:none;")}>
          {CORRIDOR.map((f, i) => (
            <div key={i} style={css(`position:absolute; left:${f.x}; top:${f.y}; width:${f.w};`)}>
              <span style={css(`${STRING} left:30%;`)} />
              <span style={css(`${STRING} right:30%;`)} />
              <div data-bob={f.bob} style={css(`position:relative; aspect-ratio:${f.ar};`)}>
                {f.sc && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={poster(f.sc)} alt="" style={css(`position:absolute; left:14%; top:18%; width:72%; height:64%; object-fit:cover; opacity:${f.po}; filter:saturate(1.1) brightness(1.15); box-shadow:0 0 30px rgba(255,200,140,.25);`)} />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/v3/${f.src}.webp`} alt="" style={css(`position:absolute; inset:0; width:100%; height:100%; filter:brightness(${f.br});`)} />
              </div>
            </div>
          ))}
        </div>
        <div className="gl-head" style={css("position:relative; z-index:3; max-width:1360px; margin:0 auto; padding:clamp(112px,10vw,132px) clamp(16px,4vw,40px) 0;")}>
          <div className="gl-hcols" style={css("display:grid; grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr); gap:20px 48px; align-items:end;")}>
            <div>
              <p style={css(`margin:0 0 18px; font-size:12.5px; ${EYEBROW}`)}>GALLERY</p>
              <h1 className="serif" style={css("margin:0; font-size:clamp(44px,5.6vw,80px); line-height:1; letter-spacing:-0.03em;")}>
                Scenes made from <span style={css("font-style:italic; color:#FF5B1F;")}>a single sentence.</span>
              </h1>
            </div>
            <div style={css("max-width:400px;")}>
              <p style={css("margin:0; font-size:16px; line-height:1.6; color:#d6d2ca; text-wrap:pretty;")}>Every clip below started as one plain-language prompt - press play and watch it render.</p>
              <p className="mono" style={css("margin:12px 0 0; font-size:12px; color:#bdb7ad;")}>1080p · 60fps · rendered, not stitched</p>
              <p style={css("margin:12px 0 0; font-size:14px; line-height:1.55; color:#a9a59d;")}>The prompt is printed on each card; try to guess it before it plays.</p>
            </div>
          </div>
        </div>
      </section>

      <GridBg>
        {/* ============ SET SELECTOR ============ */}
        <section ref={setsRef} style={css("position:relative; max-width:1240px; margin:0 auto; padding:clamp(36px,4vw,56px) clamp(16px,4vw,40px) 10px;")}>
          <div className="gl-sets" style={css("display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px;")}>
            {SETS.map((x, i) => {
              const t = tone(i);
              return (
                <button key={x.id} type="button" onClick={() => go(i)} style={css(`appearance:none; text-align:left; display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:16px; cursor:pointer; font-family:inherit; background:${t.bg}; color:${t.fg}; border:1px solid ${t.bd}; box-shadow:inset 0 1px 0 rgba(237,234,227,.06); transition:background .25s, color .25s;`)}>
                  <span style={css(`flex:none; width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:${t.ibg};`)}>{SET_ICONS[i]}</span>
                  <span style={css("min-width:0;")}>
                    <span style={css(`display:block; ${MONO} font-size:11px; color:${t.nc};`)}>0{i + 1}</span>
                    <span style={css("display:block; margin-top:2px; font-size:14.5px; font-weight:500; line-height:1.3;")}>{x.name}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="gl-pills gl-pillsm" style={css("display:none; gap:8px; overflow-x:auto; scrollbar-width:none; padding-bottom:4px;")}>
            {SETS.map((x, i) => {
              const t = tone(i);
              return (
                <button key={x.id} type="button" onClick={() => go(i)} style={css(`appearance:none; flex:none; padding:9px 14px; border-radius:100px; font-family:inherit; font-size:13px; cursor:pointer; white-space:nowrap; background:${t.bg}; color:${t.fg}; border:1px solid ${t.bd};`)}>
                  0{i + 1} {x.name}
                </button>
              );
            })}
          </div>
        </section>

        {stuck && (
          <div style={css("position:fixed; z-index:90; left:0; right:0; top:68px; display:flex; justify-content:center; padding:0 clamp(16px,4vw,40px); pointer-events:none;")}>
            <div className="gl-pills" style={css("pointer-events:auto; max-width:100%; display:flex; gap:6px; overflow-x:auto; scrollbar-width:none; padding:6px; border-radius:100px; background:rgba(18,18,20,.82); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border:1px solid rgba(237,234,227,.1); box-shadow:0 20px 40px -20px rgba(0,0,0,.9);")}>
              {SETS.map((x, i) => {
                const t = tone(i);
                return (
                  <button key={x.id} type="button" onClick={() => go(i)} style={css(`appearance:none; flex:none; padding:8px 13px; border-radius:100px; font-family:inherit; font-size:13px; cursor:pointer; white-space:nowrap; border:0; background:${t.pbg}; color:${t.fg};`)}>
                    <span style={css(`${MONO} font-size:11px; color:${t.nc};`)}>0{i + 1}</span> {x.short}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ============ THE SETS ============ */}
        {SETS.map((x, i) => {
          const feat = i === 0 ? x.cards.slice(0, 6) : [];
          const rest = i === 0 ? x.cards.slice(6) : x.cards;
          return (
            <section key={x.id} id={x.id} data-set={i} style={css("position:relative; max-width:1240px; margin:0 auto; padding:clamp(36px,4vw,56px) clamp(16px,4vw,40px) 0; scroll-margin-top:130px;")}>
              <div style={css("display:flex; align-items:baseline; gap:14px; margin-bottom:8px;")}>
                <span style={css(`${MONO} font-size:12px; letter-spacing:.12em; color:#FF5B1F;`)}>0{i + 1}</span>
                <h2 className="serif" style={css("margin:0; font-size:clamp(28px,3vw,38px); letter-spacing:-0.025em; line-height:1.05;")}>{x.name}</h2>
              </div>
              {x.intro && <p style={css("margin:0 0 22px; max-width:560px; font-size:15.5px; line-height:1.6; color:#a9a59d;")}>{x.intro}</p>}
              <div style={css("height:14px;")} />
              {feat.length > 0 && (
                <div className="gl-feat">
                  {feat.map((c) => (
                    <GalleryCard key={c[4]} c={c} big onOpen={openCard} />
                  ))}
                </div>
              )}
              <div className="gl-grid">
                {rest.map((c) => (
                  <GalleryCard key={c[4]} c={c} big={false} onOpen={openCard} />
                ))}
              </div>
              {i < SETS.length - 1 && (
                <svg aria-hidden="true" viewBox="0 0 40 120" style={css("display:block; width:40px; height:110px; margin:28px auto 0;")}>
                  <path d="M20 0 C 8 30, 32 60, 18 90 S 22 115, 20 120" fill="none" stroke="#EDEAE3" strokeOpacity=".3" strokeWidth="2" strokeDasharray="5 4 1 4" />
                </svg>
              )}
            </section>
          );
        })}

        {/* ============ CTA: your turn ============ */}
        <section style={css("position:relative; max-width:1240px; margin:0 auto; padding:clamp(60px,7vw,100px) clamp(16px,4vw,40px) clamp(110px,12vw,170px);")}>
          <div data-reveal="1" className="gl-cta" style={css(`display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); align-items:center; gap:clamp(24px,4vw,56px); ${CARD} border-radius:24px; padding:clamp(30px,4.6vw,56px); box-shadow:inset 0 1px 0 rgba(237,234,227,.07), 0 60px 70px -50px rgba(0,0,0,.95);`)}>
            <div>
              <p style={css(`margin:0 0 16px; font-size:12px; ${EYEBROW}`)}>YOUR TURN</p>
              <h2 className="serif" style={css("margin:0 0 14px; font-size:clamp(34px,4.2vw,54px); line-height:1.02; letter-spacing:-0.03em;")}>Every scene here was one sentence.</h2>
              <p style={css("margin:0 0 8px; font-size:16.5px; line-height:1.6; color:#a9a59d;")}>Write yours and Manition renders it in 1080p.</p>
              <p className="serif" style={css("margin:0 0 24px; font-size:24px; color:#EDEAE3;")}>
                Say what you want. <span style={css("font-style:italic; color:#FF5B1F;")}>Get a video back.</span>
              </p>
              <div ref={formRef}>
                <WaitlistForm tone="nightCard" source="/gallery" />
              </div>
            </div>
            <div onClick={() => formRef.current?.querySelector<HTMLInputElement>("input[type=email]")?.focus()} style={css("position:relative; cursor:text; display:flex; justify-content:center;")}>
              <div style={css("position:relative; width:min(360px,100%);")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/v3/g-easel.webp" alt="" aria-hidden="true" style={css("width:100%; display:block;")} />
                <div aria-hidden="true" style={css("position:absolute; left:25.5%; top:25%; width:44%; height:32.4%; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle, rgba(255,140,80,.18), rgba(255,140,80,0) 70%);")}>
                  <span className="gl-blink" style={css("width:3px; height:34px; background:#FF5B1F; box-shadow:0 0 14px rgba(255,91,31,.9);")} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </GridBg>

      {/* ============ LIGHTBOX ============ */}
      {lb && (
        <div role="dialog" aria-modal="true" aria-label={lb[1]} onClick={() => setLb(null)} style={css("position:fixed; inset:0; z-index:120; background:rgba(10,10,11,.94); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:22px; padding:4vw;")}>
          <div onClick={(e) => e.stopPropagation()} style={css("position:relative; width:min(1100px, 100%, (100vh - 200px) * 16 / 9); padding:8px; background:#E7E2D7; border-radius:6px; box-sizing:border-box;")}>
            <div className="gl-frame" style={css("position:relative; aspect-ratio:16/9; background:#0a0a0d;")}>
              <GalleryVideo key={lb[4]} scene={lb[4]} label={lb[0]} autoplay />
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()} style={css("width:min(1100px,100%); display:flex; align-items:flex-end; justify-content:space-between; gap:20px; flex-wrap:wrap;")}>
            <div style={css("min-width:0;")}>
              <p style={css("margin:0 0 6px; font-size:15px; font-weight:500;")}>{lb[1]}</p>
              <p className="serif" style={css("margin:0; font-style:italic; font-size:clamp(24px,3vw,36px); line-height:1.15; color:#EDEAE3;")}>“{lb[3]}”</p>
            </div>
            <Link href="/#waitlist" style={css("text-decoration:none; color:#FF5B1F; font-size:15px; font-weight:500; white-space:nowrap;")}>
              Make one like this →
            </Link>
          </div>
          <button type="button" onClick={() => setLb(null)} className="h3-pill" style={css("position:absolute; top:22px; right:22px; border:0; padding:10px 18px; font-family:inherit; font-size:14px; cursor:pointer;")}>
            Close
          </button>
        </div>
      )}
    </NightShell>
  );
}
