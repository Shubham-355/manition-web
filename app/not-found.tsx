import type { Metadata } from "next";
import Link from "next/link";
import { parseStyle as css } from "./lib/css";
import NightShell from "./components/night/NightShell";
import { EYEBROW, Ground, Stars } from "./components/night/parts";
import { nightFonts } from "./lib/night-fonts";

export const metadata: Metadata = { title: "Page not found - Manition" };

/* y = 200 -+ 2400 / (x - 360): both branches run off toward the line x = 404 never reaches */
const AX = 360;
const branch = (from: number, to: number, step: number) => {
  let d = "";
  for (let x = from; step > 0 ? x <= to : x >= to; x += step) {
    const y = 200 - 2400 / (x - AX);
    if (y < 0 || y > 480) break;
    d += (d ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
  }
  return d;
};
const LEFT = branch(0, AX - 1, 2);
const RIGHT = branch(600, AX + 1, -2);

export default function NotFound() {
  return (
    <NightShell fontClass={nightFonts} sky="#0A0A0B">
      <style>{`@media (max-width:760px){ .nf-plot{ right:-38% !important; width:110% !important; opacity:.35; } .nf-head{ padding-top:120px !important; } }`}</style>
      <section style={css("position:relative; isolation:isolate; min-height:clamp(640px,100vh,820px); overflow:hidden; background:linear-gradient(180deg,#060607 0%,#0A0A0B 46%,#140f18 68%,#1d1522 74%);")}>
        <Stars place="inset:0 0 28% 0;" opacity={0.65} mask="" />
        <Stars place="inset:0 0 28% 0;" opacity={0.3} size={520} pos="background-position:300px 80px;" mask="" />
        <div aria-hidden="true" style={css("position:absolute; left:40%; right:-10%; top:46%; height:30%; background:radial-gradient(ellipse 45% 70% at 60% 100%, rgba(255,120,50,.32), rgba(255,91,31,0) 75%); pointer-events:none;")} />
        <Ground top="74%" tint="linear-gradient(180deg, rgba(60,30,40,.4), rgba(10,10,11,0) 55%)" />

        <div data-par="0.4" aria-hidden="true" className="nf-plot" style={css("position:absolute; right:5%; bottom:26%; width:min(620px,52vw); aspect-ratio:600/420; pointer-events:none;")}>
          <svg viewBox="0 0 600 420" width="100%" height="100%" style={css("overflow:visible; display:block;")}>
            <defs>
              <filter id="nf-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            <line x1="0" y1="200" x2="600" y2="200" stroke="#EDEAE3" strokeOpacity=".14" strokeWidth="1" />
            <line x1={AX} y1="-10" x2={AX} y2="420" stroke="#EDEAE3" strokeOpacity=".5" strokeWidth="1.5" strokeDasharray="6 7" />
            <text x={AX - 14} y="14" textAnchor="end" fill="#EDEAE3" fillOpacity=".75" style={css("font-family:'Geist Mono',monospace; font-size:15px; letter-spacing:.06em;")}>x = 404</text>
            <g stroke="#FF5B1F" fill="none" strokeLinecap="round">
              <path d={LEFT} strokeWidth="9" strokeOpacity=".35" filter="url(#nf-glow)" />
              <path d={RIGHT} strokeWidth="9" strokeOpacity=".35" filter="url(#nf-glow)" />
              <path d={LEFT} strokeWidth="2.5" />
              <path d={RIGHT} strokeWidth="2.5" />
            </g>
            <circle cx="120" cy={200 - 2400 / (120 - AX)} r="6" fill="#FF5B1F" />
            <circle cx="120" cy={200 - 2400 / (120 - AX)} r="14" fill="#FF5B1F" opacity=".18" />
          </svg>
        </div>

        <div className="nf-head" style={css("position:relative; z-index:3; max-width:1360px; margin:0 auto; padding:clamp(150px,16vh,200px) clamp(16px,4vw,40px) 0;")}>
          <p style={css(`margin:0 0 18px; font-size:12.5px; ${EYEBROW}`)}>404 · PAGE NOT FOUND</p>
          <h1 className="serif" style={css("margin:0; max-width:620px; font-weight:400; font-size:clamp(48px,6.4vw,96px); line-height:.95; letter-spacing:-0.035em;")}>
            This scene <span style={css("font-style:italic; color:#FF5B1F;")}>never rendered.</span>
          </h1>
          <p style={css("margin:24px 0 0; max-width:440px; font-size:16.5px; line-height:1.6; color:#d6d2ca; text-wrap:pretty;")}>
            The page you were after runs off toward an asymptote. It may have moved, or the link has a typo.
          </p>
          <div style={css("display:flex; flex-wrap:wrap; gap:12px; margin-top:36px;")}>
            <Link href="/" className="h3-pill lift" style={css("gap:10px; font-size:16px; padding:16px 28px;")}>
              Back home <span>→</span>
            </Link>
            <Link href="/gallery" className="h3-ghost">
              Browse the gallery
            </Link>
          </div>
        </div>
      </section>
    </NightShell>
  );
}
