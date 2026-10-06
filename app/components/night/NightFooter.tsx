"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { parseStyle as css } from "../../lib/css";

const FOOT = [
  { href: "/gallery", label: "Gallery" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/editor", label: "Open the app" },
];

const WORD = "Manition".split("");
const SKEW = [-18, -13.5, -9, -4.5, 0, 4.5, 9, 13.5];
const RIM = [0.57, 0.69, 0.82, 0.94, 0.94, 0.82, 0.69, 0.57];
const RIM2 = [0.08, 0.16, 0.23, 0.31, 0.31, 0.23, 0.16, 0.08];

/* Lay each wordmark letter's reflection on the horizon, then sit the word on the sky's bottom edge. */
function fit(root: HTMLElement) {
  const a = root.querySelector<HTMLElement>("[data-wm]");
  const sky = root.querySelector<HTMLElement>("[data-sky]");
  if (!a || !sky) return;
  a.style.translate = "0 0";
  const sp = a.querySelector<HTMLElement>("[data-sphere]");
  if (sp) sp.style.translate = "0 0";
  let base: number | null = null;
  a.querySelectorAll<HTMLElement>("[data-letter]").forEach((L) => {
    const m = L.querySelector("[data-base]");
    if (!m) return;
    const lb = m.getBoundingClientRect().top;
    const r = L.getBoundingClientRect();
    base = lb;
    const oy = lb - r.top;
    const ox = r.width / 2;
    L.querySelectorAll<HTMLElement>("[data-fsh]").forEach((s) => {
      s.style.transformOrigin = ox.toFixed(2) + "px " + oy.toFixed(2) + "px";
      s.style.clipPath = "inset(-50px -50px " + Math.max(0, r.height - oy).toFixed(2) + "px -50px)";
    });
  });
  if (base === null) return;
  if (sp) sp.style.translate = "0 " + (base - sp.getBoundingClientRect().bottom).toFixed(2) + "px";
  a.style.translate = "0 " + (sky.getBoundingClientRect().bottom - base).toFixed(2) + "px";
}

function Wordmark() {
  return (
    <Link
      data-wm="1"
      href="/"
      aria-label="Manition"
      className="h3-wm"
      style={css("position:relative; display:flex; align-items:flex-end; text-decoration:none; font-family:'Instrument Serif',serif; font-size:clamp(84px,20vw,300px); line-height:.74; letter-spacing:-0.05em; font-kerning:normal;")}
    >
      {WORD.map((ch, i) => {
        const sk = `transform-origin:50% 95%; transform:perspective(4.5em) rotateX(42deg) skewX(${SKEW[i].toFixed(1)}deg) scaleY(-5);`;
        return (
          <span key={i} data-letter="1" aria-hidden="true" style={css("position:relative; display:inline-block;")}>
            <span data-fsh="1" style={css(`position:absolute; left:0; top:0; z-index:0; color:#0E0A12; text-shadow:none; opacity:0.72; filter:blur(1px); ${sk} -webkit-mask-image:linear-gradient(0deg,#000 0%,rgba(0,0,0,0) 45%); mask-image:linear-gradient(0deg,#000 0%,rgba(0,0,0,0) 45%);`)}>{ch}</span>
            <span data-fsh="1" style={css(`position:absolute; left:0; top:0; z-index:0; color:#0E0A12; text-shadow:none; opacity:0.5; filter:blur(7px); ${sk} -webkit-mask-image:linear-gradient(0deg,rgba(0,0,0,0) 12%,#000 38%,rgba(0,0,0,0) 100%); mask-image:linear-gradient(0deg,rgba(0,0,0,0) 12%,#000 38%,rgba(0,0,0,0) 100%);`)}>{ch}</span>
            <span style={css(`position:relative; z-index:1; text-shadow:0 -1px 0 rgba(255,178,122,${RIM[i]}), 0 -2px 5px rgba(255,178,122,${RIM2[i]});`)}>
              {ch}
              <span data-base="1" style={css("display:inline-block; width:0; height:0;")} />
            </span>
          </span>
        );
      })}
      <span data-sphere="1" className="h3-sphere" style={css("position:relative; display:inline-block; width:.16em; height:.16em; margin:0 0 0 .03em;")}>
        <span aria-hidden="true" style={css("position:absolute; left:0; top:0; width:100%; height:100%; border-radius:50%; background:#0E0A12; opacity:.7; filter:blur(2px); transform-origin:50% 100%; transform:perspective(4.5em) rotateX(42deg) skewX(18deg) scaleY(-5); -webkit-mask-image:linear-gradient(0deg,#000,rgba(0,0,0,0)); mask-image:linear-gradient(0deg,#000,rgba(0,0,0,0));")} />
        <span aria-hidden="true" style={css("position:absolute; left:20%; width:60%; bottom:-2px; height:4px; border-radius:50%; background:rgba(3,1,5,.95); filter:blur(1px);")} />
        <span style={css("position:absolute; inset:0; border-radius:50%; background:radial-gradient(circle at 62% 64%, #ff8a50, #FF5B1F 42%, #a8340a 100%); box-shadow:inset -.01em -.014em .02em rgba(255,210,170,.85);")} />
      </span>
    </Link>
  );
}

/** The last horizon: a sunset sky, the big wordmark standing on it with long shadows, the ground below. */
export default function NightFooter({ waitlistHref = "/#waitlist" }: { waitlistHref?: string }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const go = () => fit(el);
    window.addEventListener("resize", go);
    document.fonts?.ready.then(go);
    const t = setTimeout(go, 60);
    const iv = setInterval(go, 1500);
    return () => {
      window.removeEventListener("resize", go);
      clearTimeout(t);
      clearInterval(iv);
    };
  }, []);

  return (
    <footer ref={root} style={css("position:relative; isolation:isolate; overflow:hidden;")}>
      <div data-sky="1" style={css("position:relative; background:linear-gradient(180deg,#0A0A0B 0%,#150e1a 30%,#2A1A2E 55%,#5c3040 80%,#B5655A 100%);")}>
        <div aria-hidden="true" style={css("position:absolute; left:0; right:0; top:0; height:70%; background-image:url(/v3/stars.webp); background-size:900px auto; opacity:.55; -webkit-mask-image:linear-gradient(180deg, transparent 0, #000 25%, transparent 100%); mask-image:linear-gradient(180deg, transparent 0, #000 25%, transparent 100%); pointer-events:none;")} />
        <div aria-hidden="true" style={css("position:absolute; inset:0; overflow:hidden; pointer-events:none;")}>
          <div style={css("position:absolute; left:50%; bottom:0; width:min(1100px,110vw); height:min(420px,40vw); transform:translateX(-50%); background:radial-gradient(ellipse 50% 100% at 50% 100%, rgba(255,150,90,.75) 0%, rgba(255,91,31,.4) 14%, rgba(255,91,31,.12) 42%, rgba(255,91,31,0) 75%);")} />
          <div style={css("position:absolute; left:50%; bottom:0; width:100%; height:60px; transform:translateX(-50%); background:linear-gradient(180deg, rgba(255,140,80,0), rgba(255,140,80,.35));")} />
          <div style={css("position:absolute; left:50%; bottom:calc(clamp(110px,12vw,190px) * -0.78); width:clamp(110px,12vw,190px); aspect-ratio:1; transform:translateX(-50%); border-radius:50%; background:radial-gradient(circle, #fff6e6 0%, #ffd1a6 45%, #ff8a4a 100%); box-shadow:0 0 40px 14px rgba(255,140,80,.65);")} />
        </div>
        <div className="h3-fhead" style={css("position:relative; z-index:2; max-width:1360px; margin:0 auto; padding:clamp(56px,7vw,96px) clamp(16px,4vw,40px) 0; display:flex; justify-content:space-between; gap:28px 40px;")}>
          <p className="serif" style={css("margin:0; max-width:380px; font-size:clamp(28px,3vw,36px); line-height:1.12; color:#EDEAE3;")}>
            Say what you want to explain. <span style={css("font-style:italic; color:#FF5B1F;")}>Get a video back.</span>
          </p>
          <div className="h3-flinks" style={css("display:flex; flex-wrap:nowrap; align-items:flex-start; gap:10px 20px; font-size:14px; white-space:nowrap;")}>
            {FOOT.map((f) => (
              <Link key={f.href} href={f.href} className="h3-fl">
                {f.label}
              </Link>
            ))}
            <Link href={waitlistHref} style={css("text-decoration:none; font-weight:500;")}>
              Join the waitlist
            </Link>
          </div>
        </div>
        <div style={css("position:relative; z-index:3; display:flex; justify-content:center; padding-top:clamp(70px,9vw,140px);")}>
          <Wordmark />
        </div>
      </div>
      <div style={css("position:relative; z-index:1; height:clamp(230px,26vw,380px); overflow:hidden;")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v3/ground.webp" alt="" aria-hidden="true" style={css("position:absolute; left:50%; top:0; width:max(100%,1800px); transform:translateX(-50%); display:block;")} />
        <div aria-hidden="true" style={css("position:absolute; inset:0; background:radial-gradient(ellipse 60% 70% at 50% 0%, rgba(255,91,31,.18), rgba(255,91,31,0) 70%);")} />
        <div aria-hidden="true" style={css("position:absolute; left:50%; top:0; width:220%; height:100%; transform:translateX(-50%); background:repeating-conic-gradient(from 90deg at 50% 0%, rgba(255,130,70,.13) 0deg 2.2deg, rgba(255,130,70,0) 2.2deg 6.5deg); -webkit-mask-image:linear-gradient(180deg,#000 0%,rgba(0,0,0,0) 80%); mask-image:linear-gradient(180deg,#000 0%,rgba(0,0,0,0) 80%);")} />
        <div style={css("position:absolute; left:0; right:0; bottom:0;")}>
          <div style={css("max-width:1360px; margin:0 auto; padding:16px clamp(16px,4vw,40px) 22px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px 28px; border-top:1px solid rgba(237,234,227,.1);")}>
            <p className="mono" style={css("margin:0; font-size:12px; color:#9a978f;")}>© 2026 Manition</p>
            <p className="mono" style={css("margin:0; font-size:12px; color:#9a978f;")}>Made for people who explain things.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
