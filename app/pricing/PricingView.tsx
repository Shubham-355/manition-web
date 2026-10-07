"use client";

import { useState } from "react";
import Link from "next/link";
import { parseStyle as css } from "../lib/css";
import NightShell from "../components/night/NightShell";
import { CARD, EYEBROW, GridBg, Ground, JoinCta, Stars } from "../components/night/parts";

type Plan = { name: string; sub: string; price: string; note: string; cta: string; feats: string[] };

const PLANS: Plan[] = [
  { name: "Free", sub: "For trying it out", price: "$0", note: "forever", cta: "Start free", feats: ["A handful of renders each month", "Up to 720p exports", "View generated Manim code", "Community gallery access"] },
  { name: "Pro", sub: "For regular explainers", price: "TBD", note: "monthly · founder rate on the list", cta: "Join for Pro", feats: ["Unlimited renders", "4K & transparent exports", "Priority GPU queue", "Editable + exportable source", "Full personal library"] },
  { name: "Team", sub: "For departments & studios", price: "Let's talk", note: "custom per seat", cta: "Join the waitlist", feats: ["Everything in Pro", "Shared team workspaces", "Brand kits & templates", "SSO & admin controls"] },
];

const ROWS = [
  ["Monthly renders", "Limited", "Unlimited", "Unlimited"],
  ["Max resolution", "720p", "4K", "4K"],
  ["Transparent backgrounds", "–", "✓", "✓"],
  ["Priority GPU queue", "–", "✓", "✓"],
  ["Team workspaces & SSO", "–", "–", "✓"],
];

const FAQ = [
  ["Why isn't pricing final?", "Rendering costs depend on how people actually use Manition. We'd rather set fair prices with real usage data from early members than guess - so waitlist folks help shape the final tiers."],
  ["What are founder rates?", "Everyone who joins before launch gets a permanently discounted Pro price, locked in for as long as the subscription stays active. It's our thank-you for helping us get it right."],
];

const tick = (v: string) => (v === "✓" ? "#FF5B1F" : v === "–" ? "#8C8A85" : "#d6d2ca");
const H2 = "margin:0 0 22px; font-family:'Instrument Serif',serif; font-weight:400; font-size:clamp(30px,3.4vw,42px); letter-spacing:-0.025em;";

export default function PricingView({ fontClass }: { fontClass: string }) {
  const [hov, setHov] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(0);
  const glow = [hov === 0 ? 1 : 0.25, hov === 1 ? 1 : 0.45, hov === 2 ? 1 : 0.2];

  return (
    <NightShell fontClass={fontClass} active="pricing" sky="#1c1116">
      {/* ============ HEADER: three doors ============ */}
      <section style={css("position:relative; isolation:isolate; height:clamp(680px,52vw,720px); overflow:hidden; background:linear-gradient(180deg,#0A0A0B 0%,#0d0a0e 40%,#1c1116 58%,#3a1c18 68%,#7a3518 73%,#a8471a 75%);")}>
        <Stars place="left:0; right:0; top:0; height:62%;" opacity={0.55} mask="-webkit-mask-image:linear-gradient(180deg,#000 30%,transparent); mask-image:linear-gradient(180deg,#000 30%,transparent);" />
        <div data-par="0.2" aria-hidden="true" style={css("position:absolute; left:-10%; right:-10%; top:52%; height:30%; background:radial-gradient(ellipse 50% 70% at 50% 100%, rgba(255,120,50,.45), rgba(255,91,31,.12) 45%, rgba(255,91,31,0) 75%); pointer-events:none;")} />
        <Ground top="75%" tint="linear-gradient(180deg, rgba(168,71,26,.3), rgba(10,10,11,0) 50%)" />
        <div className="pr-head" style={css("position:relative; z-index:3; max-width:760px; margin:0 auto; padding:clamp(112px,10vw,132px) clamp(16px,4vw,40px) 0; text-align:center; display:flex; flex-direction:column; align-items:center;")}>
          <p style={css(`margin:0 0 16px; font-size:12.5px; ${EYEBROW}`)}>PRICING</p>
          <h1 className="serif" style={css("margin:0; font-size:clamp(42px,5.4vw,74px); line-height:1; letter-spacing:-0.03em;")}>
            Pricing you help <span style={css("font-style:italic; color:#FF5B1F;")}>decide.</span>
          </h1>
          <p style={css("margin:18px 0 0; max-width:580px; font-size:16.5px; line-height:1.6; color:#d6d2ca; text-wrap:pretty;")}>
            We&apos;re still shaping plans with our early community, so the numbers below aren&apos;t final. Join the waitlist to weigh in - and lock in founder rates when we launch.
          </p>
          <span style={css("margin-top:18px; display:inline-flex; align-items:center; gap:9px; padding:7px 14px; border-radius:100px; background:rgba(18,18,20,.7); border:1px solid rgba(237,234,227,.12); font-size:13px; color:#d6d2ca;")}>
            <span style={css("width:7px; height:7px; border-radius:50%; background:#F5A524; box-shadow:0 0 8px rgba(245,165,36,.7);")} />
            Prices shown are placeholders while we finalize
          </span>
        </div>
        <svg className="pr-hidem" aria-hidden="true" viewBox="0 0 1200 200" preserveAspectRatio="none" style={css("position:absolute; left:50%; bottom:0; width:min(1200px,100%); height:26%; transform:translateX(-50%); pointer-events:none;")}>
          <path d="M600 200 C 560 140, 260 120, 200 50" fill="none" stroke="#EDEAE3" strokeOpacity=".35" strokeWidth="2" strokeDasharray="7 6" />
          <path d="M600 200 C 600 140, 600 100, 600 50" fill="none" stroke="#FF8A4A" strokeOpacity=".55" strokeWidth="2" strokeDasharray="7 6" />
          <path d="M600 200 C 640 140, 940 120, 1000 50" fill="none" stroke="#EDEAE3" strokeOpacity=".35" strokeWidth="2" strokeDasharray="7 6" />
        </svg>
        <div data-par="0.6" aria-hidden="true" style={css("position:absolute; z-index:2; left:0; right:0; bottom:calc(25% - 36px); pointer-events:none;")}>
          <div className="pr-doors" style={css("margin:0 auto; width:min(1160px,100% - 32px); display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); align-items:end; pointer-events:none;")}>
            <div style={css("position:relative; display:flex; justify-content:center;")}>
              <div style={css(`position:absolute; left:50%; bottom:20px; width:280px; height:280px; transform:translateX(-50%); border-radius:50%; background:radial-gradient(circle, rgba(200,214,255,.32), rgba(200,214,255,0) 65%); opacity:${glow[0]}; transition:opacity .5s;`)} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v3/pr-door1.webp" alt="" style={css("position:relative; width:160px; margin-right:-60px; display:block;")} />
            </div>
            <div style={css("position:relative; display:flex; justify-content:center;")}>
              <div style={css(`position:absolute; left:50%; bottom:-20px; width:520px; height:200px; transform:translateX(-36%); background:radial-gradient(ellipse 50% 40% at 40% 70%, rgba(255,140,70,.6), rgba(255,91,31,.15) 55%, rgba(255,91,31,0) 80%); opacity:${glow[1]}; transition:opacity .5s;`)} />
              <div style={css("position:absolute; left:50%; bottom:20px; width:360px; height:420px; transform:translateX(-50%); background:radial-gradient(ellipse 45% 50% at 42% 60%, rgba(255,120,50,.35), rgba(255,91,31,0) 70%);")} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v3/pr-door2.webp" alt="" style={css("position:relative; width:192px; margin-right:-72px; display:block;")} />
            </div>
            <div style={css("position:relative; display:flex; justify-content:center;")}>
              <div style={css(`position:absolute; left:calc(50% - 6px); bottom:150px; width:120px; height:120px; transform:translateX(-50%); border-radius:50%; background:radial-gradient(circle, rgba(255,170,90,.6), rgba(255,120,50,0) 65%); opacity:${glow[2]}; transition:opacity .5s;`)} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v3/pr-door3.webp" alt="" style={css("position:relative; width:210px; margin-right:-80px; display:block;")} />
            </div>
          </div>
        </div>
      </section>

      <GridBg>
        {/* ============ PLANS ============ */}
        <section style={css("position:relative; max-width:1160px; margin:0 auto; padding:clamp(48px,5vw,72px) clamp(16px,4vw,40px) clamp(30px,4vw,56px);")}>
          <div className="pr-grid" style={css("display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:clamp(14px,2vw,24px); align-items:start;")}>
            {PLANS.map((p, i) => {
              const pro = i === 1;
              return (
                <div key={p.name} className={pro ? "pr-pro" : ""} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={css(`position:relative; transform:${pro ? "translateY(-12px)" : "none"}; transition:transform .3s;`)}>
                  {pro && <div aria-hidden="true" style={css("position:absolute; inset:-30px; border-radius:40px; background:radial-gradient(ellipse at 50% 40%, rgba(255,91,31,.22), rgba(255,91,31,0) 70%); pointer-events:none;")} />}
                  <div style={css(`position:relative; ${CARD} border-color:${pro ? "#FF5B1F" : "rgba(237,234,227,.08)"}; border-radius:22px; padding:28px 26px 30px;`)}>
                    <div style={css("display:flex; align-items:center; justify-content:space-between; gap:10px;")}>
                      <h2 style={css("margin:0; font-weight:500; font-size:19px;")}>{p.name}</h2>
                      {pro && <span className="mono" style={css("font-size:10.5px; letter-spacing:.12em; color:#0A0A0B; background:#FF5B1F; padding:4px 9px; border-radius:100px; white-space:nowrap;")}>MOST POPULAR</span>}
                    </div>
                    <p style={css("margin:6px 0 0; font-size:14px; color:#a9a59d;")}>{p.sub}</p>
                    <p className="serif" style={css("margin:22px 0 0; font-size:44px; line-height:1; letter-spacing:-0.02em;")}>{p.price}</p>
                    <p className="mono" style={css("margin:8px 0 0; font-size:12px; color:#a9a59d;")}>{p.note}</p>
                    <Link href="/#waitlist" className={pro ? "h3-cta" : "h3-outline"} style={css("margin-top:22px; display:flex; justify-content:center; font-size:14.5px; font-weight:500; padding:12px 18px; white-space:nowrap;" + (pro ? " border:1px solid #FF5B1F;" : ""))}>
                      {p.cta}
                    </Link>
                    <div style={css("margin-top:24px; padding-top:20px; border-top:1px solid rgba(237,234,227,.08); display:flex; flex-direction:column; gap:11px;")}>
                      {p.feats.map((f) => (
                        <div key={f} style={css("display:flex; gap:10px; align-items:flex-start; font-size:14.5px; line-height:1.45; color:#d6d2ca;")}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF5B1F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={css("flex:none; margin-top:2px;")}>
                            <path d="M5 12l5 5L20 7" />
                          </svg>
                          <span style={css("flex:1; min-width:0;")}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============ COMPARE ============ */}
        <section style={css("position:relative; max-width:1160px; margin:0 auto; padding:clamp(30px,4vw,56px) clamp(16px,4vw,40px);")}>
          <h2 data-reveal="1" style={css(H2)}>Compare plans</h2>
          <div className="pr-tablewrap" style={css(`${CARD} border-radius:22px;`)}>
            <div className="pr-table" role="table" style={css("position:relative;")}>
              <div role="row" style={css("position:sticky; top:68px; z-index:3; display:grid; grid-template-columns:1.6fr repeat(3,minmax(0,1fr)); background:rgba(18,18,20,.94); backdrop-filter:blur(10px); border-bottom:1px solid rgba(237,234,227,.1); border-radius:22px 22px 0 0;")}>
                <span role="columnheader" className="pr-sticky mono" style={css("padding:18px 22px; font-size:11.5px; letter-spacing:.12em; color:#a9a59d;")}>FEATURE</span>
                <span role="columnheader" style={css("padding:18px 16px; font-weight:500; font-size:15px;")}>Free</span>
                <span role="columnheader" style={css("padding:18px 16px; font-weight:500; font-size:15px; color:#FF5B1F; background:rgba(255,91,31,.03);")}>Pro</span>
                <span role="columnheader" style={css("padding:18px 16px; font-weight:500; font-size:15px;")}>Team</span>
              </div>
              {ROWS.map((r, i) => (
                <div key={r[0]} role="row" style={css(`display:grid; grid-template-columns:1.6fr repeat(3,minmax(0,1fr)); border-bottom:${i < ROWS.length - 1 ? "1px solid rgba(237,234,227,.07)" : "0"};`)}>
                  <span role="cell" className="pr-sticky" style={css("padding:16px 22px; font-size:14.5px; color:#d6d2ca;")}>{r[0]}</span>
                  <span role="cell" style={css(`padding:16px; font-size:14.5px; color:${tick(r[1])};`)}>{r[1]}</span>
                  <span role="cell" style={css(`padding:16px; font-size:14.5px; color:${tick(r[2])}; background:rgba(255,91,31,.03);`)}>{r[2]}</span>
                  <span role="cell" style={css(`padding:16px; font-size:14.5px; color:${tick(r[3])};`)}>{r[3]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ QUESTIONS ============ */}
        <section style={css("position:relative; max-width:860px; margin:0 auto; padding:clamp(30px,4vw,56px) clamp(16px,4vw,40px);")}>
          <h2 data-reveal="1" style={css(H2.replace("0 0 22px", "0 0 18px"))}>Pricing questions</h2>
          <div style={css("border-top:1px solid rgba(237,234,227,.12);")}>
            {FAQ.map(([q, a], i) => {
              const on = open === i;
              return (
                <div key={q} style={css("border-bottom:1px solid rgba(237,234,227,.12);")}>
                  <button aria-expanded={on} onClick={() => setOpen(on ? null : i)} style={css("appearance:none; width:100%; background:none; border:0; padding:22px 4px; display:flex; align-items:center; justify-content:space-between; gap:20px; cursor:pointer; font-family:inherit; text-align:left; color:#EDEAE3; font-size:17px; font-weight:500;")}>
                    <span>{q}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5B1F" strokeWidth="2.2" strokeLinecap="round" style={css(`flex:none; transition:transform .3s; transform:${on ? "rotate(180deg)" : "none"};`)}>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  <div style={css(`display:grid; grid-template-rows:${on ? "1fr" : "0fr"}; transition:grid-template-rows .3s ease;`)}>
                    <div style={css("overflow:hidden;")}>
                      <p style={css("margin:0; padding:0 4px 24px; max-width:680px; font-size:15.5px; line-height:1.65; color:#a9a59d;")}>{a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section style={css("position:relative; max-width:1160px; margin:0 auto; padding:clamp(40px,5vw,72px) clamp(16px,4vw,40px) clamp(110px,12vw,170px);")}>
          <div data-reveal="1" className="pr-cta" style={css(`position:relative; display:grid; grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr); align-items:center; gap:24px; ${CARD} border-radius:24px; padding:clamp(36px,5vw,56px) clamp(22px,4.4vw,56px); box-shadow:inset 0 1px 0 rgba(237,234,227,.07), 0 60px 70px -50px rgba(0,0,0,.95);`)}>
            <div>
              <h2 className="serif" style={css("margin:0 0 14px; font-size:clamp(36px,4.6vw,58px); letter-spacing:-0.03em; line-height:1;")}>
                Help set <span style={css("font-style:italic; color:#FF5B1F;")}>the price.</span>
              </h2>
              <p style={css("margin:0 0 28px; max-width:420px; font-size:16.5px; color:#a9a59d; line-height:1.6;")}>Join the waitlist to shape the plans and grab founder rates before launch.</p>
              <JoinCta />
            </div>
            <div className="pr-hidem" aria-hidden="true" style={css("position:relative; height:240px;")}>
              <div style={css("position:absolute; right:0; bottom:-30px; width:340px;")}>
                <div data-bob="2,9,0,1.6" style={css("transform-origin:40% 30%;")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/v3/pr-scale.webp" alt="" style={css("width:100%; display:block;")} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </GridBg>
    </NightShell>
  );
}
