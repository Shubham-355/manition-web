"use client";

import { useCallback } from "react";
import { parseStyle as css } from "../lib/css";
import NightShell from "../components/night/NightShell";
import { CARD, EYEBROW, GridBg, Ground, JoinCta, Stars } from "../components/night/parts";

const H2 = "margin:18px 0 10px; font-family:'Instrument Serif',serif; font-weight:400; font-size:30px; letter-spacing:-0.02em;";
const BODY = "margin:0; font-size:15.5px; line-height:1.6; color:#a9a59d;";
const P = "font-size:18px; line-height:1.75; color:#d6d2ca; text-wrap:pretty;";

export default function AboutView({ fontClass }: { fontClass: string }) {
  /* the doorway glows with a sine wave sliding along and a unit vector turning */
  const onTick = useCallback((t: number, reduce: boolean) => {
    const tt = reduce ? 1 : t;
    const sp = document.querySelector("[data-sinep]");
    if (sp) {
      let d = "";
      for (let x = -10; x <= 140; x += 4) d += (x < -9 ? "M" : "L") + x + " " + (80 + 22 * Math.sin(x / 14 - tt * 1.6)).toFixed(1);
      sp.setAttribute("d", d);
    }
    const a = tt * 0.9;
    const v = document.querySelector("[data-vec]");
    const p = document.querySelector("[data-vecp]");
    if (v && p) {
      const x = String(65 + 34 * Math.cos(a));
      const y = String(175 - 34 * Math.sin(a));
      v.setAttribute("x2", x);
      v.setAttribute("y2", y);
      p.setAttribute("cx", x);
      p.setAttribute("cy", y);
    }
  }, []);

  return (
    <NightShell fontClass={fontClass} sky="#2A1A2E" onTick={onTick}>
      {/* ============ HEADER: doorway at dawn ============ */}
      <section className="ab-sky" style={css("position:relative; isolation:isolate; height:clamp(600px,46vw,640px); overflow:hidden; background:linear-gradient(180deg,#0A0A0B 0%,#1a1020 22%,#2A1A2E 44%,#5a2f3e 62%,#B5655A 76%,#e08454 79%);")}>
        <Stars place="left:0; right:0; top:0; height:40%;" opacity={0.3} />
        <div data-par="0.2" aria-hidden="true" style={css("position:absolute; inset:0; pointer-events:none;")}>
          <div style={css("position:absolute; left:-10%; right:-10%; top:60%; height:20%; background:radial-gradient(ellipse 40% 100% at 60% 100%, rgba(255,160,90,.5), rgba(255,91,31,0) 70%);")} />
          <div style={css("position:absolute; left:0; right:0; top:calc(79% - 3px); height:3px; background:linear-gradient(90deg, rgba(255,91,31,0) 20%, #FF5B1F 55%, #ffb27a 62%, #FF5B1F 70%, rgba(255,91,31,0) 95%); box-shadow:0 0 18px 4px rgba(255,91,31,.55);")} />
        </div>
        <Ground top="79%" tint="linear-gradient(180deg, rgba(224,132,84,.3), rgba(10,10,11,0) 45%)" />
        <div data-par="0.5" aria-hidden="true" style={css("position:absolute; inset:0; pointer-events:none;")}>
          <div className="ab-wall" style={css("position:absolute; left:calc(70% - 600px); top:calc(79% - 430px); width:1200px; height:450px;")}>
            <div style={css("position:absolute; left:44.6%; top:37.8%; width:10.8%; height:57.7%; overflow:hidden; background:linear-gradient(180deg,#ffe9c8,#ffb27a 55%,#FF5B1F);")}>
              <svg viewBox="0 0 130 260" preserveAspectRatio="xMidYMid slice" style={css("position:absolute; inset:0; width:100%; height:100%;")}>
                <path data-sinep="1" d="" fill="none" stroke="#7a2a12" strokeWidth="3" strokeLinecap="round" />
                <circle cx="65" cy="175" r="34" fill="none" stroke="#7a2a12" strokeWidth="2.4" opacity=".85" />
                <line data-vec="1" x1="65" y1="175" x2="99" y2="175" stroke="#fff6e6" strokeWidth="3" strokeLinecap="round" />
                <circle data-vecp="1" cx="99" cy="175" r="4" fill="#fff6e6" />
              </svg>
              <div style={css("position:absolute; inset:0; box-shadow:inset 0 0 30px rgba(255,255,255,.4);")} />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v3/a-wall.webp" alt="" style={css("position:absolute; inset:0; width:100%; height:100%; filter:brightness(.3) saturate(.8) sepia(.25); -webkit-mask-image:linear-gradient(90deg, transparent 0%, transparent 18%, #000 40%, #000 92%, transparent 100%); mask-image:linear-gradient(90deg, transparent 0%, transparent 18%, #000 40%, #000 92%, transparent 100%);")} />
            <div style={css("position:absolute; left:44.6%; top:95.5%; width:30%; height:30%; background:linear-gradient(100deg, rgba(255,150,80,.45), rgba(255,91,31,0) 80%); transform:skewX(-50deg); transform-origin:0 0; filter:blur(6px);")} />
          </div>
        </div>
        <div className="ab-head" style={css("position:relative; z-index:3; max-width:1360px; margin:0 auto; padding:clamp(120px,11vw,140px) clamp(16px,4vw,40px) 0;")}>
          <p style={css(`margin:0 0 18px; font-size:12.5px; ${EYEBROW}`)}>ABOUT</p>
          <h1 className="serif" style={css("margin:0; max-width:560px; font-size:clamp(42px,5.4vw,76px); line-height:1; letter-spacing:-0.03em;")}>
            Math is beautiful <span style={css("font-style:italic; color:#FF5B1F;")}>when it moves.</span>
          </h1>
          <p style={css("margin:22px 0 0; max-width:470px; font-size:16.5px; line-height:1.6; color:#d6d2ca; text-wrap:pretty;")}>
            The best math explainers on the internet share one secret: motion. But the tools to make it move have always demanded code, patience and rendering hardware. We&apos;re building Manition so the only requirement is a sentence.
          </p>
        </div>
      </section>

      <GridBg>
        {/* ============ WHY ============ */}
        <section style={css("position:relative; max-width:680px; margin:0 auto; padding:clamp(56px,6vw,90px) clamp(16px,4vw,24px) clamp(30px,4vw,48px);")}>
          <div style={css("background:rgba(10,10,11,.92); border-radius:6px;")}>
            <p style={css(`margin:0 0 18px; font-size:12px; ${EYEBROW}`)}>WHY WE&apos;RE BUILDING THIS</p>
            <p style={css(`margin:0; ${P}`)}>
              Manim - the animation engine created by 3Blue1Brown - showed the world what a math explanation could look like. But behind every gorgeous clip is Python code, a local render pipeline, and hours of iteration. For most teachers, students and creators, that&apos;s a wall, not a doorway.
            </p>
            <blockquote data-reveal="1" className="serif" style={css("margin:44px 0; padding:0; font-size:clamp(40px,5.4vw,64px); line-height:1.02; letter-spacing:-0.025em; color:#EDEAE3;")}>
              “that&apos;s a wall, not <span style={css("font-style:italic; color:#FF5B1F;")}>a doorway.</span>”
            </blockquote>
            <p style={css(`margin:0 0 24px; ${P}`)}>
              We kept meeting people with a perfect animation in their head and no way to get it out. A teacher who wanted fifteen seconds of motion for one confusing moment in a lesson. A student who needed to <em>see</em> an eigenvector once to finally get it. A creator with ideas outpacing their editing skills.
            </p>
            <p style={css(`margin:0; ${P}`)}>
              Manition is the doorway: describe the concept, and real Manim code is written, rendered on cloud GPUs, and handed back as a video - with the source included, because we believe tools should teach, not hide.
            </p>
          </div>
        </section>

        {/* ============ PRINCIPLES ============ */}
        <section style={css("position:relative; max-width:1160px; margin:0 auto; padding:clamp(40px,5vw,64px) clamp(16px,4vw,40px);")}>
          <div className="ab-pr" style={css("display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:clamp(14px,2vw,24px);")}>
            <div data-reveal="1" style={css(`${CARD} border-radius:22px; padding:28px;`)}>
              <svg aria-hidden="true" width="64" height="64" viewBox="0 0 64 64">
                <defs>
                  <radialGradient id="ablens" cx="40%" cy="60%" r="60%">
                    <stop offset="0" stopColor="#fff6e6" stopOpacity=".9" />
                    <stop offset=".6" stopColor="#cfd6ff" stopOpacity=".25" />
                    <stop offset="1" stopColor="#6d4f7c" stopOpacity=".4" />
                  </radialGradient>
                </defs>
                <ellipse cx="38" cy="58" rx="20" ry="3" fill="#000" opacity=".5" />
                <path d="M40 40 L54 56" stroke="#8a6a3e" strokeWidth="7" strokeLinecap="round" />
                <circle cx="28" cy="27" r="18" fill="url(#ablens)" stroke="#d9b06a" strokeWidth="4" />
                <path d="M20 22 a10 10 0 0 1 8 -6" stroke="#fff" strokeWidth="2" fill="none" opacity=".8" />
              </svg>
              <h2 style={css(H2)}>Clarity first</h2>
              <p style={css(BODY)}>An animation earns its runtime. We optimize for the moment a concept clicks, not for flashiness.</p>
            </div>
            <div data-reveal="1" style={css(`${CARD} border-radius:22px; padding:28px;`)}>
              <svg aria-hidden="true" width="64" height="64" viewBox="0 0 64 64">
                <ellipse cx="36" cy="58" rx="24" ry="3" fill="#000" opacity=".5" />
                <path d="M10 26 L30 18 L54 26 L54 52 L30 58 L10 52 Z" fill="rgba(207,214,255,.08)" stroke="rgba(237,234,227,.55)" strokeWidth="1.5" />
                <path d="M10 26 L34 32 L54 26 M34 32 L34 58" stroke="rgba(237,234,227,.4)" strokeWidth="1.2" fill="none" />
                <path d="M10 26 L2 12 L24 6 L30 18" fill="rgba(207,214,255,.12)" stroke="rgba(237,234,227,.55)" strokeWidth="1.5" />
                <circle cx="24" cy="42" r="7" fill="none" stroke="#d9b06a" strokeWidth="3" strokeDasharray="3 2" />
                <circle cx="38" cy="46" r="5" fill="none" stroke="#FF5B1F" strokeWidth="3" strokeDasharray="2.4 1.8" />
              </svg>
              <h2 style={css(H2)}>No black boxes</h2>
              <p style={css(BODY)}>Every scene ships with its source. If you&apos;re curious how it works, the answer is one click away.</p>
            </div>
            <div data-reveal="1" style={css(`${CARD} border-radius:22px; padding:28px;`)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v3/q-chair.webp" alt="" aria-hidden="true" style={css("height:64px; display:block;")} />
              <h2 style={css(H2)}>Education is the point</h2>
              <p style={css(BODY)}>Classrooms shape our roadmap. If a feature doesn&apos;t help someone teach or learn, it waits.</p>
            </div>
          </div>
        </section>

        {/* ============ GET IN TOUCH ============ */}
        <section style={css("position:relative; max-width:1160px; margin:0 auto; padding:clamp(30px,4vw,56px) clamp(16px,4vw,40px) clamp(40px,5vw,64px);")}>
          <div data-reveal="1" style={css(`${CARD} border-radius:24px; padding:clamp(34px,5vw,56px) clamp(22px,4.4vw,56px); box-shadow:inset 0 1px 0 rgba(237,234,227,.07), 0 60px 70px -50px rgba(0,0,0,.95);`)}>
            <h2 className="serif" style={css("margin:0 0 14px; font-size:clamp(34px,4vw,50px); letter-spacing:-0.03em; line-height:1;")}>Get in touch</h2>
            <p style={css("margin:0 0 26px; max-width:620px; font-size:16.5px; color:#a9a59d; line-height:1.6;")}>
              We&apos;re not hiring right now, but we love hearing from people who care about math, motion and craft. Join the waitlist to follow along as we build - and be first to know when access opens.
            </p>
            <JoinCta />
          </div>
        </section>

        {/* ============ PRE-FOOTER ============ */}
        <section style={css("position:relative; max-width:1160px; margin:0 auto; padding:clamp(40px,5vw,70px) clamp(16px,4vw,40px) clamp(110px,12vw,160px); text-align:center;")}>
          <p className="serif" style={css("margin:0; font-size:clamp(38px,5vw,64px); line-height:1; letter-spacing:-0.03em;")}>
            Describe it. <span style={css("font-style:italic; color:#FF5B1F;")}>We animate it.</span>
          </p>
          <p style={css("margin:16px 0 0; font-size:16.5px; color:#a9a59d;")}>Join the waitlist and see your first idea move.</p>
        </section>
      </GridBg>
    </NightShell>
  );
}
