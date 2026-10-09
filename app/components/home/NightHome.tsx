"use client";

import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { parseStyle as css } from "../../lib/css";
import ManitionDemo from "../film/ManitionDemo";
import GalleryVideo from "../GalleryVideo";
import { WaitlistForm } from "../Interactive";
import { RENDERED } from "../scene-videos";
import { WAVE_D } from "./wave-path";
import { useNightMotion } from "./motion";
import NightNav from "../night/NightNav";
import NightFooter from "../night/NightFooter";
import "../night/night.css";

/* ============ the floating archive ============ */

type Frame = "gold" | "plaster" | "paper";
type Mount =
  | { kind: "hang"; hang: string; string: number; rot: number }
  | { kind: "float"; bob: string; rot: number }
  | { kind: "easel" }
  | { kind: "lean" }
  | { kind: "flat" };

type Tile = {
  key: string;
  scene: string;
  poster: string;
  prompt: string;
  frame: Frame;
  mount: Mount;
  place: string;
  hideM?: boolean;
  shadow?: string;
};

const T = (n: string) => `/scenes/${n}.jpg`;

const TILES: Tile[] = [
  {
    key: "lorenz", scene: "lorenz", poster: T("lorenz"), frame: "gold",
    prompt: "\"follow the Lorenz butterfly from one point\"",
    mount: { kind: "hang", hang: "1,12,0", string: 140, rot: -3 },
    place: "left:4%; top:calc(120px + 5%); width:clamp(170px,21vw,320px); z-index:20;",
    shadow: "left:calc(4% + 50px); top:77%; width:clamp(170px,21vw,320px);",
  },
  {
    key: "mandel", scene: "mandel", poster: "/film/mandel.jpg", frame: "plaster", hideM: true,
    prompt: "\"zoom into the edge of the Mandelbrot set\"",
    mount: { kind: "hang", hang: "0.5,13,1.3", string: 96, rot: 2 },
    place: "left:29%; top:calc(120px + 1%); width:clamp(130px,15vw,230px); z-index:10;",
    shadow: "left:calc(29% + 50px); top:75%; width:clamp(130px,15vw,230px);",
  },
  {
    key: "nebula", scene: "nebula", poster: T("nebula"), frame: "paper", hideM: true,
    prompt: "\"let a gas cloud collapse until a star lights up\"",
    mount: { kind: "hang", hang: "0.2,10,2.1", string: 86, rot: -4 },
    place: "left:46%; top:calc(120px + 1%); width:clamp(80px,8.5vw,130px); z-index:4; filter:blur(1.2px) brightness(.8);",
    shadow: "left:calc(46% + 50px); top:74%; width:clamp(80px,8.5vw,130px);",
  },
  {
    key: "julia", scene: "julia", poster: "/film/julia.jpg", frame: "gold",
    prompt: "\"draw the Julia set for c = -0.8 + 0.156i\"",
    mount: { kind: "hang", hang: "0.5,11,0.6", string: 200, rot: -2 },
    place: "left:51%; top:calc(120px + 13%); width:clamp(120px,13vw,210px); z-index:10;",
    shadow: "left:calc(51% + 50px); top:76%; width:clamp(120px,13vw,210px);",
  },
  {
    key: "galaxy", scene: "galaxy", poster: T("galaxy"), frame: "plaster",
    prompt: "\"spin a galaxy out of a cloud of stars\"",
    mount: { kind: "hang", hang: "1,14,2.6", string: 104, rot: 3 },
    place: "left:68%; top:120px; width:clamp(170px,21vw,330px); z-index:20;",
    shadow: "left:calc(68% + 50px); top:78%; width:clamp(170px,21vw,330px);",
  },
  {
    key: "aurora", scene: "aurora", poster: T("aurora"), frame: "plaster", hideM: true,
    prompt: "\"paint an aurora over a frozen lake\"",
    mount: { kind: "hang", hang: "0.5,12.5,1.8", string: 360, rot: 4 },
    place: "left:85.5%; top:calc(120px + 31%); width:clamp(110px,13vw,210px); z-index:10;",
    shadow: "left:calc(85.5% + 50px); top:77%; width:clamp(110px,13vw,210px);",
  },
  {
    key: "hilbert", scene: "hilbert", poster: T("hilbert"), frame: "paper", hideM: true,
    prompt: "\"fill a square with one line that never crosses itself\"",
    mount: { kind: "hang", hang: "0.2,10.5,0.9", string: 250, rot: 5 },
    place: "left:2.5%; top:calc(120px + 40%); width:clamp(80px,8vw,125px); z-index:4; filter:blur(1.2px) brightness(.8);",
    shadow: "left:calc(2.5% + 50px); top:75%; width:clamp(80px,8vw,125px);",
  },
  {
    key: "rossler", scene: "rossler", poster: T("rossler"), frame: "plaster", hideM: true,
    prompt: "\"trace the Rössler band for a minute\"",
    mount: { kind: "float", bob: "7,9,1.2", rot: -7 },
    place: "left:36.5%; top:calc(120px + 25%); width:clamp(80px,7.4vw,112px); z-index:14;",
    shadow: "left:calc(36.5% + 60px); top:79%; width:clamp(80px,7.4vw,112px); height:9px; background:rgba(4,2,8,.55); filter:blur(6px);",
  },
  {
    key: "fern", scene: "chaosgame", poster: T("chaosgame"), frame: "plaster",
    prompt: "\"roll four matrices at random until a fern grows\"",
    mount: { kind: "easel" },
    place: "left:-3.5%; bottom:3%; width:clamp(190px,20vw,300px); z-index:26;",
  },
  {
    key: "turing", scene: "turing", poster: T("turing"), frame: "plaster",
    prompt: "\"let two chemicals react until spots appear\"",
    mount: { kind: "lean" },
    place: "left:29%; bottom:11%; width:clamp(130px,14vw,210px); z-index:22;",
  },
  {
    key: "apollonian", scene: "apollonian", poster: T("apollonian"), frame: "gold", hideM: true,
    prompt: "\"fill a circle with circles that touch\"",
    mount: { kind: "easel" },
    place: "left:58.5%; bottom:23.5%; width:clamp(70px,7vw,108px); z-index:4; filter:blur(.8px) brightness(.85);",
  },
  {
    key: "waves", scene: "waves", poster: T("waves"), frame: "paper", hideM: true,
    prompt: "\"drop two stones in a pond and watch them interfere\"",
    mount: { kind: "flat" },
    place: "left:69%; bottom:2%; width:clamp(150px,16vw,240px); z-index:24;",
  },
];

const CAP =
  "position:absolute; left:0; top:calc(100% + 12px); width:max(100%,220px); margin:0; font-family:'Geist Mono',monospace; font-style:italic; font-size:12px; line-height:1.45; color:#F4E9D0; transform:rotate(-3deg); transform-origin:left top; pointer-events:none; text-shadow:0 2px 10px #0A0A0B;";
const STRING =
  "position:absolute; left:50%; bottom:calc(100% - 2px); width:1px; margin-left:-.5px; background:linear-gradient(0deg, rgba(237,234,227,.35), rgba(237,234,227,0));";
const PIN =
  "position:absolute; left:50%; top:-5px; z-index:2; width:9px; height:9px; margin-left:-4.5px; border-radius:50%; background:radial-gradient(circle at 35% 65%, #f6dc9e, #8a6a34 70%); box-shadow:0 1px 2px rgba(0,0,0,.6);";
const FLOOR_SHADOW =
  "position:absolute; height:10px; border-radius:50%; background:rgba(4,2,8,.45); filter:blur(8px); transform:skewX(-40deg); pointer-events:none;";
const SKID = "position:absolute; bottom:-3px; height:7px; border-radius:50%; background:rgba(3,1,5,.9); filter:blur(3px);";
const REFLECT = "position:relative; -webkit-box-reflect:below 0px linear-gradient(transparent 42%, rgba(255,255,255,.18));";
const CAST =
  "position:absolute; left:6%; bottom:0; width:110%; background:linear-gradient(0deg, rgba(4,2,8,.55), rgba(4,2,8,0)); transform:skewX(-58deg); transform-origin:bottom left; filter:blur(5px); pointer-events:none;";

function Pic({ tile, live }: { tile: Tile; live: boolean }) {
  return (
    <div style={css("position:relative; aspect-ratio:4/3; overflow:hidden; background:#24182c;")}>
      <div className="h3-shim" style={css("position:absolute; inset:0; background:linear-gradient(115deg,#1f1528 0%,#2f1f36 45%,#3a2742 50%,#2f1f36 55%,#1f1528 100%); background-size:300% 100%;")} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={tile.poster} alt="" loading="lazy" style={css("position:absolute; inset:0; width:100%; height:100%; object-fit:cover;")} />
      {live && RENDERED.has(tile.scene) ? <video src={`/scenes/${tile.scene}.mp4`} autoPlay muted loop playsInline /> : null}
      <div style={css("position:absolute; inset:0; box-shadow:inset 0 0 14px rgba(0,0,0,.75), inset 0 0 0 1px rgba(0,0,0,.5); pointer-events:none;")} />
    </div>
  );
}

const CORNER = (
  <div
    aria-hidden="true"
    style={css("position:absolute; right:-1px; bottom:-1px; width:22px; height:22px; background:linear-gradient(315deg, rgba(10,10,11,0) 0 47%, #bcb19c 49%, #f5efe2 72%); border-top-left-radius:4px; box-shadow:-2px -2px 5px rgba(0,0,0,.35);")}
  />
);

function Framed({ tile, live }: { tile: Tile; live: boolean }) {
  const pic = <Pic tile={tile} live={live} />;
  if (tile.frame === "gold")
    return (
      <div style={css("position:relative; padding:9px; background:linear-gradient(35deg,#f3d696 0%,#b8904a 26%,#6e5020 48%,#d9b46a 70%,#4e3618 100%); border:1px solid #241608; box-shadow:inset 0 0 0 2px rgba(255,232,180,.22), inset 0 0 0 5px rgba(60,38,12,.45), 0 30px 50px -24px rgba(0,0,0,.9);")}>
        <div style={css("padding:2px; background:#3a2810;")}>{pic}</div>
      </div>
    );
  if (tile.frame === "plaster")
    return (
      <div style={css("position:relative; padding:7px; background:linear-gradient(35deg,#f6eedd 0%,#d8cdb8 55%,#9d917b 100%); border:1px solid rgba(40,28,20,.85); box-shadow:inset 1px -1px 0 rgba(255,255,255,.45), inset -1px 1px 0 rgba(60,40,25,.35), 0 30px 50px -24px rgba(0,0,0,.9);")}>
        <div style={css("padding:6px; background:#ebe3d1 url(/v3/plaster.webp) center/160px; background-blend-mode:multiply; box-shadow:inset 1px 1px 0 rgba(80,60,40,.4), inset -1px -1px 0 rgba(255,255,255,.5);")}>{pic}</div>
      </div>
    );
  return (
    <div style={css("position:relative; padding:4px; background:#efe8d8; border:1px solid rgba(40,28,20,.6); border-radius:3px; box-shadow:0 26px 44px -22px rgba(0,0,0,.9);")}>
      {pic}
      {CORNER}
    </div>
  );
}

function Easel({ children }: { children: ReactNode }) {
  const id = "easel" + useId().replace(/:/g, "");
  return (
    <>
      <div aria-hidden="true" style={css(CAST + " height:34%;")} />
      <div style={css(REFLECT)}>
        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={css("position:absolute; left:0; right:0; top:-16%; bottom:0; width:100%; height:116%; z-index:0; overflow:visible;")}>
          <defs>
            <linearGradient id={`${id}L`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#d4a674" /><stop offset=".55" stopColor="#8a6440" /><stop offset="1" stopColor="#4a3022" /></linearGradient>
            <linearGradient id={`${id}R`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#b48a5e" /><stop offset=".55" stopColor="#6e4c30" /><stop offset="1" stopColor="#3e2a1c" /></linearGradient>
          </defs>
          <polygon points="49,2 51.5,2 64,97 61,97" fill="#2a1a12" />
          <polygon points="47,0 50,0 16,100 10.5,100" fill={`url(#${id}L)`} />
          <polygon points="50,0 53,0 89.5,100 84,100" fill={`url(#${id}R)`} />
          <polygon points="44,-2 56,-2 54,4 46,4" fill="#6e4c30" />
          <polygon points="20,80 80,80 81,83.5 19,83.5" fill="#5a3c26" />
        </svg>
        <div style={css("position:relative; z-index:1; margin:0 4%;")}>{children}</div>
        <div aria-hidden="true" style={css("position:relative; z-index:3; height:8px; margin:0 -2%; background:linear-gradient(180deg,#c99b6a,#6e4c30); box-shadow:0 3px 4px rgba(0,0,0,.5);")} />
        <div style={css("padding-top:34%;")} />
      </div>
      <div aria-hidden="true" style={css(SKID + " left:4%; width:16%;")} />
      <div aria-hidden="true" style={css(SKID + " left:80%; width:16%;")} />
    </>
  );
}

function ArchiveTile({ tile }: { tile: Tile }) {
  const [live, setLive] = useState(false);
  const m = tile.mount;
  const framed = <Framed tile={tile} live={live} />;
  const hide = tile.hideM ? "h3-hide-m " : "";
  const hover = { onMouseEnter: () => setLive(true), onMouseLeave: () => setLive(false) };

  let body: ReactNode;
  let rootStyle = "position:absolute; " + tile.place;
  let capTop = "";
  const extra: Record<string, string> = {};

  if (m.kind === "hang") {
    extra["data-hang"] = m.hang;
    rootStyle += " transform-origin:50% 0;";
    body = (
      <>
        <div aria-hidden="true" style={css(STRING + ` height:${m.string}px;`)} />
        <div style={css(`transform:rotate(${m.rot}deg); transform-origin:50% 0;`)}>
          <div aria-hidden="true" style={css(PIN)} />
          {framed}
        </div>
      </>
    );
  } else if (m.kind === "float") {
    body = (
      <div data-bob={m.bob}>
        <div style={css(`transform:rotate(${m.rot}deg);`)}>{framed}</div>
      </div>
    );
  } else if (m.kind === "easel") {
    capTop = "top:calc(100% + 22px);";
    body = <Easel>{framed}</Easel>;
  } else if (m.kind === "lean") {
    capTop = "top:calc(100% + 18px);";
    body = (
      <>
        <div aria-hidden="true" style={css(CAST + " height:40%;")} />
        <div aria-hidden="true" style={css("position:absolute; left:calc(100% - 8px); bottom:0; width:36%; aspect-ratio:1/.86; background:url(/v3/plaster.webp) center/90px, linear-gradient(35deg,#d9cdb4 0%,#a89a82 50%,#5e554a 100%); background-blend-mode:multiply; clip-path:polygon(0 8%, 74% 0, 100% 14%, 100% 100%, 0 100%); box-shadow:inset 0 3px 0 rgba(255,250,235,.35);")} />
        <div style={css(REFLECT)}>
          <div style={css("transform:rotate(6deg); transform-origin:0 100%;")}>{framed}</div>
        </div>
        <div aria-hidden="true" style={css(SKID + " left:0%; width:70%;")} />
        <div aria-hidden="true" style={css(SKID + " left:100%; width:34%;")} />
      </>
    );
  } else {
    capTop = "top:auto; bottom:100%;";
    body = (
      <>
        <div aria-hidden="true" style={css("position:absolute; left:-4%; right:-6%; bottom:6%; height:30%; border-radius:50%; background:rgba(3,1,5,.75); filter:blur(8px);")} />
        <div style={css("transform:perspective(700px) rotateX(62deg) rotate(-9deg); transform-origin:50% 100%;")}>{framed}</div>
      </>
    );
  }

  return (
    <>
      <div {...extra} {...hover} className={hide + "h3-tile"} style={css(rootStyle)}>
        {body}
        <p className="h3-cap" style={css(CAP + " " + capTop)}>{tile.prompt}</p>
      </div>
      {tile.shadow ? <div aria-hidden="true" className={tile.hideM ? "h3-hide-m" : undefined} style={css(FLOOR_SHADOW + " " + tile.shadow)} /> : null}
    </>
  );
}

/* ============ footer wordmark ============ */

/* ============ shared bits ============ */

const STARS = (top: string, height: string, opacity: number, size = 900, pos = "") => (
  <div
    aria-hidden="true"
    style={css(`position:absolute; left:0; right:0; top:${top}; height:${height}; background-image:url(/v3/stars.webp); background-size:${size}px auto; ${pos} opacity:${opacity}; -webkit-mask-image:linear-gradient(180deg, transparent 0, #000 25%, transparent 100%); mask-image:linear-gradient(180deg, transparent 0, #000 25%, transparent 100%); pointer-events:none;`)}
  />
);

/* the ground plane every section stands on: a horizon line, then the floor image */
function Ground({ at, glow, line, tint, fade = 180 }: { at: string; glow: string; line: string; tint: ReactNode; fade?: number }) {
  return (
    <>
      <div aria-hidden="true" style={css(`position:absolute; left:0; right:0; top:calc(${at} - 90px); height:90px; background:linear-gradient(180deg, rgba(0,0,0,0), ${glow}); pointer-events:none;`)} />
      <div aria-hidden="true" style={css(`position:absolute; left:0; right:0; top:calc(${at} - 1px); height:2px; background:${line}; pointer-events:none;`)} />
      <div aria-hidden="true" style={css(`position:absolute; left:0; right:0; top:${at}; bottom:0; overflow:hidden; pointer-events:none;`)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v3/ground.webp" alt="" style={css("position:absolute; left:50%; top:0; width:max(100%,1800px); transform:translateX(-50%); display:block;")} />
        {tint}
        <div style={css(`position:absolute; left:0; right:0; bottom:0; height:${fade}px; background:linear-gradient(180deg, rgba(10,10,11,0), #0A0A0B);`)} />
      </div>
    </>
  );
}

const arrow = <span>→</span>;

/* ============ the page ============ */

export default function NightHome({ fontClass }: { fontClass: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [joined, setJoined] = useState(false);
  const onJoined = useCallback(() => setJoined(true), []);
  useNightMotion(root, joined);

  return (
    <div ref={root} className={"h3 " + fontClass}>
      <NightNav waitlistHref="#waitlist" />

      {/* ============ HERO ============ */}
      <section style={css("position:relative; isolation:isolate; height:100vh; min-height:740px; max-height:1100px; overflow:hidden; background:linear-gradient(180deg,#0A0A0B 0%,#160f1a 26%,#2A1A2E 46%,#43243a 56%,#6b3a3e 64%);")}>
        {STARS("0", "60%", 0.45)}
        <div data-par="0.2" aria-hidden="true" style={css("position:absolute; inset:0; pointer-events:none;")}>
          <div className="h3-moon" style={css("position:absolute; right:3%; top:6%; height:58%; aspect-ratio:600/640;")}>
            <svg viewBox="0 0 600 640" style={css("width:100%; height:100%; overflow:visible;")}>
              <defs>
                <radialGradient id="h3halo" cx="50%" cy="50%" r="50%">
                  <stop offset=".55" stopColor="#F4E9D0" stopOpacity=".14" />
                  <stop offset="1" stopColor="#F4E9D0" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="h3drip" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FF7a40" stopOpacity="1" />
                  <stop offset="1" stopColor="#FF5B1F" stopOpacity=".55" />
                </linearGradient>
                <clipPath id="h3moonclip">
                  <circle cx="300" cy="270" r="250" />
                </clipPath>
                <filter id="h3glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
              </defs>
              <circle cx="300" cy="270" r="330" fill="url(#h3halo)" />
              <image href="/v3/moon.webp" x="50" y="20" width="500" height="500" opacity=".35" clipPath="url(#h3moonclip)" preserveAspectRatio="xMidYMid slice" />
              <line x1="40" y1="270" x2="560" y2="270" stroke="#EDEAE3" strokeOpacity=".2" strokeWidth="1" />
              <line x1="300" y1="10" x2="300" y2="530" stroke="#EDEAE3" strokeOpacity=".2" strokeWidth="1" />
              <circle cx="300" cy="270" r="250" fill="none" stroke="#EDEAE3" strokeWidth="1.8" />
              <path data-moon="arc" d="" fill="none" stroke="#FF5B1F" strokeWidth="2" />
              <line data-moon="cos" x1="300" y1="270" x2="300" y2="270" stroke="#EDEAE3" strokeOpacity=".55" strokeWidth="2" />
              <rect data-moon="dripglow" x="296" y="270" width="8" height="370" fill="#FF5B1F" opacity=".5" filter="url(#h3glow)" />
              <rect data-moon="drip" x="299" y="270" width="2.2" height="370" fill="url(#h3drip)" />
              <ellipse data-moon="ripple" cx="300" cy="640" rx="10" ry="2.5" fill="none" stroke="#FF5B1F" strokeWidth="1.5" />
              <line data-moon="r" x1="300" y1="270" x2="550" y2="270" stroke="#F4E9D0" strokeWidth="2" />
              <circle data-moon="pt" cx="550" cy="270" r="6" fill="#FF5B1F" />
              <text x="352" y="256" fill="#F4E9D0" fontFamily="var(--font-instrument), serif" fontStyle="italic" fontSize="24">
                θ
              </text>
            </svg>
          </div>
        </div>
        <div aria-hidden="true" style={css("position:absolute; left:0; right:0; top:calc(64% - 90px); height:90px; background:linear-gradient(180deg, rgba(0,0,0,0), rgba(181,101,90,.42)); pointer-events:none;")} />
        <div aria-hidden="true" style={css("position:absolute; left:0; right:0; top:calc(64% - 1px); height:2px; background:rgba(244,190,160,.55); pointer-events:none;")} />
        <div aria-hidden="true" style={css("position:absolute; left:0; right:0; top:64%; bottom:0; overflow:hidden; pointer-events:none;")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v3/ground.webp" alt="" style={css("position:absolute; left:50%; top:0; width:max(100%,1800px); transform:translateX(-50%); display:block;")} />
          <div style={css("position:absolute; inset:0; background:radial-gradient(ellipse at 0% 100%, rgba(255,91,31,.16), rgba(255,91,31,0) 55%);")} />
          <div style={css("position:absolute; left:0; right:0; bottom:0; height:180px; background:linear-gradient(180deg, rgba(10,10,11,0), #0A0A0B);")} />
        </div>
        <div aria-hidden="true" className="h3-hide-m" style={css("position:absolute; right:calc(3% + 14%); top:64%; width:8%; height:22%; background:linear-gradient(180deg, rgba(244,233,208,.12), rgba(244,233,208,0)); filter:blur(8px); pointer-events:none;")} />
        <div data-par="0.5" aria-hidden="true" style={css("position:absolute; inset:0; pointer-events:none;")}>
          {/* eslint-disable @next/next/no-img-element */}
          <div className="h3-board" style={css("position:absolute; left:63%; bottom:33%; width:clamp(380px,42vw,620px); transform:translateY(4.4%);")}>
            <img data-bob="0,1,0" src="/v3/p-board.webp" alt="" fetchPriority="high" style={css("display:block; width:100%;")} />
          </div>
          <div className="h3-dice" style={css("position:absolute; left:46%; bottom:30%; width:clamp(170px,17vw,260px); transform:translateY(6.7%);")}>
            <img src="/v3/p-dice.webp" alt="" fetchPriority="high" style={css("display:block; width:100%;")} />
            <span data-leaf="0" style={css("position:absolute; left:38%; top:16%; width:9px; height:4px; border-radius:50%; background:#6fae7c;")} />
            <span data-leaf="1" style={css("position:absolute; left:44%; top:24%; width:8px; height:3px; border-radius:50%; background:#8cc08a;")} />
            <span data-leaf="2" style={css("position:absolute; left:40%; top:30%; width:7px; height:3px; border-radius:50%; background:#5f9e86;")} />
          </div>
          <div className="h3-hide-m" style={css("position:absolute; right:5%; bottom:calc(25% + 40px); width:clamp(84px,7.8vw,120px);")}>
            <div data-bob="5,10,1" style={css("position:relative;")}>
              <svg viewBox="0 0 100 100" aria-hidden="true" style={css("position:absolute; inset:0; width:100%; height:100%; overflow:visible;")}>
                <g transform="rotate(-12 50 54)">
                  <path d="M -22 54 A 72 17 0 0 1 122 54" fill="none" stroke="#3e2a14" strokeWidth="7" />
                  <path d="M -22 54 A 72 17 0 0 1 122 54" fill="none" stroke="#a8803f" strokeWidth="2" opacity=".55" transform="translate(0 -2)" />
                </g>
              </svg>
              <img src="/v3/p-orb2.webp" alt="" style={css("position:relative; display:block; width:100%;")} />
              <svg viewBox="0 0 100 100" aria-hidden="true" style={css("position:absolute; inset:0; width:100%; height:100%; overflow:visible;")}>
                <defs>
                  <linearGradient id="h3ringG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffe6ae" /><stop offset=".35" stopColor="#d9ac5e" /><stop offset=".75" stopColor="#8a6630" /><stop offset="1" stopColor="#4a3216" /></linearGradient>
                </defs>
                <g transform="rotate(-12 50 54)">
                  <path d="M -22 54 A 72 17 0 0 0 122 54" fill="none" stroke="#2a1a0c" strokeWidth="7.5" transform="translate(0 1.2)" opacity=".7" />
                  <path d="M -22 54 A 72 17 0 0 0 122 54" fill="none" stroke="url(#h3ringG)" strokeWidth="6.5" />
                  <path d="M -22 54 A 72 17 0 0 0 122 54" fill="none" stroke="#fff3d6" strokeWidth="1" opacity=".75" transform="translate(0 -2.4)" />
                  <path data-ring="1" d="M -22 54 A 72 17 0 0 0 122 54" fill="none" stroke="#FF5B1F" strokeWidth="3" strokeDasharray="26 124" strokeLinecap="round" />
                </g>
              </svg>
            </div>
            <div data-bobsh="1" style={css("position:absolute; left:18%; top:calc(100% + 46px); width:96%; height:12px; border-radius:50%; background:rgba(4,2,6,.75); filter:blur(5px); transform:skewX(-40deg);")} />
            <div aria-hidden="true" style={css("position:absolute; left:-22%; top:calc(100% + 38px); width:52%; height:14px; border-radius:50%; background:radial-gradient(ellipse, rgba(255,190,130,.5), rgba(255,140,80,0) 70%); filter:blur(3px);")} />
          </div>
        </div>
        <div data-par="1" aria-hidden="true" className="h3-hide-m" style={css("position:absolute; inset:0; pointer-events:none;")}>
          <img src="/v3/p-chalk.webp" alt="" style={css("position:absolute; right:-16%; bottom:-3%; width:clamp(520px,58vw,900px);")} />
          {/* eslint-enable @next/next/no-img-element */}
        </div>
        <div aria-hidden="true" style={css("position:absolute; left:0; top:0; bottom:0; width:70%; background:radial-gradient(ellipse at 18% 48%, rgba(10,10,11,.62), rgba(10,10,11,0) 62%); pointer-events:none;")} />
        <div style={css("position:relative; z-index:5; max-width:1360px; height:100%; margin:0 auto; padding:clamp(100px,15vh,170px) clamp(16px,4vw,40px) 0; box-sizing:border-box;")}>
          <h1 aria-label="Say it. Watch it move." className="serif" style={css("margin:0; font-size:clamp(64px,10.5vw,172px); line-height:0.86; letter-spacing:-0.035em;")}>
            <span aria-hidden="true" style={css("display:block;")}>
              {"Say it.".split("").map((ch, i) => (
                <span key={i} data-type={i} style={{ opacity: 0 }}>
                  {ch}
                </span>
              ))}
            </span>
            <span aria-hidden="true" style={css("display:block; font-style:italic; color:#FF5B1F; white-space:nowrap;")}>
              {[["W", "a", "t", "c", "h"], ["i", "t"], ["m", "o", "v", "e", "."]].map((word, w, all) => {
                const start = all.slice(0, w).reduce((n, x) => n + x.length, 0);
                return (
                  <span key={w}>
                    {w ? " " : null}
                    {word.map((ch, j) => (
                      <span key={j} data-float={start + j} data-peel={w === 2 ? j : undefined} style={{ display: "inline-block", opacity: 0 }}>
                        {ch}
                      </span>
                    ))}
                  </span>
                );
              })}
            </span>
          </h1>
          <div style={css("display:flex; flex-wrap:wrap; gap:12px; margin-top:clamp(32px,3.6vw,48px);")}>
            <a href="#waitlist" className="h3-pill lift" style={css("gap:10px; font-size:16px; padding:16px 28px;")}>
              Join the waitlist {arrow}
            </a>
            <Link href="/gallery" className="h3-ghost">
              ▶ See examples
            </Link>
          </div>
        </div>
      </section>

      {/* ============ THE DOOR ============ */}
      <section id="demo" style={css("position:relative; padding:clamp(80px,10vw,140px) clamp(16px,4vw,40px) clamp(48px,6vw,80px); background:linear-gradient(180deg,#0A0A0B 0%,#150e16 55%,#0A0A0B 100%);")}>
        <div style={css("max-width:1160px; margin:0 auto;")}>
          <p className="mono" style={css("margin:0; font-size:12.5px; letter-spacing:.14em; color:#FF5B1F;")}>THE DEMO</p>
          <h2 className="serif" style={css("margin:14px 0 0; font-size:clamp(44px,6.4vw,92px); line-height:.92; letter-spacing:-0.03em;")}>
            Step through <span style={css("font-style:italic; color:#FF5B1F;")}>one sentence.</span>
          </h2>
          <div data-door="1" style={css("position:relative; margin:clamp(36px,5vw,64px) auto 0; max-width:66%;")}>
            <div style={css("position:absolute; left:8%; right:-4%; bottom:-34px; height:44px; border-radius:50%; background:rgba(0,0,0,.85); filter:blur(18px); transform:skewX(-35deg);")} />
            <div style={css("position:absolute; inset:-18% -10% -10%; background:radial-gradient(ellipse at 50% 70%, rgba(255,91,31,.22), rgba(194,65,12,0) 60%); pointer-events:none;")} />
            <div style={css("position:relative; padding:clamp(10px,1.2vw,16px); border-radius:clamp(120px,22vw,280px) clamp(120px,22vw,280px) 22px 22px / 46% 46% 22px 22px; background:linear-gradient(35deg,#F4E9D0 0%,#d8cfbd 45%,#8f8676 100%); box-shadow:inset 0 2px 0 rgba(255,255,255,.6), inset 0 -6px 14px rgba(60,40,30,.35), 0 40px 100px -40px rgba(255,91,31,.4);")}>
              <div style={css("padding:4px; border-radius:inherit; background:linear-gradient(215deg,#b8ae9c,#efe6d2); box-shadow:inset 0 0 0 1px rgba(80,60,40,.25);")}>
                <div data-play="1" style={css("position:relative; width:100%; aspect-ratio:16/9; overflow:hidden; border-radius:clamp(110px,21vw,270px) clamp(110px,21vw,270px) 16px 16px / 44% 44% 16px 16px; background:#f7f6f3;")}>
                  <div style={css("position:absolute; left:-6.5%; top:-5.6%; width:113%; height:113%;")}>
                    <ManitionDemo />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FLOATING ARCHIVE ============ */}
      <section data-arch="1" style={css("position:relative; isolation:isolate; height:clamp(760px,68vw,980px); margin:-40px 0 0; overflow:hidden; background:linear-gradient(180deg, rgba(10,10,11,0) 0px, rgba(12,10,18,.6) 110px, #0c0a12 240px, #120d1c 34%, #1d1530 58%, #2c2040 72%);")}>
        {STARS("120px", "66%", 0.7)}
        {STARS("120px", "66%", 0.3, 520, "background-position:200px 90px;")}
        <div aria-hidden="true" style={css("position:absolute; left:50%; top:0; width:min(1400px,120vw); height:240px; transform:translateX(-50%); background:radial-gradient(ellipse 46% 100% at 50% 0%, rgba(150,52,20,.55), rgba(110,38,18,.22) 40%, rgba(110,38,18,0) 85%); pointer-events:none;")} />
        <div data-shoot="1" aria-hidden="true" style={css("position:absolute; left:0; top:0; width:150px; height:1.5px; border-radius:2px; background:linear-gradient(90deg, rgba(255,250,235,.95), rgba(255,250,235,0)); opacity:0; pointer-events:none;")} />
        <div aria-hidden="true" style={css("position:absolute; left:0; right:0; top:57%; height:15%; background:linear-gradient(180deg, rgba(70,48,96,0), rgba(70,48,96,.38)); pointer-events:none;")} />
        <div aria-hidden="true" style={css("position:absolute; left:0; right:0; top:calc(72% - 40px); height:40px; background:linear-gradient(0deg, rgba(91,74,122,.35), rgba(91,74,122,0)); pointer-events:none;")} />
        <div aria-hidden="true" style={css("position:absolute; left:0; right:0; top:72%; bottom:0; overflow:hidden; pointer-events:none;")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v3/ground.webp" alt="" style={css("position:absolute; left:50%; top:0; width:max(100%,1800px); transform:translateX(-50%); display:block;")} />
          <div style={css("position:absolute; inset:0; background:linear-gradient(180deg, rgba(60,70,110,.12), rgba(60,70,110,0) 40%);")} />
          <div style={css("position:absolute; left:0; right:0; top:0; height:50px; background:linear-gradient(180deg, rgba(70,48,96,.45), rgba(70,48,96,0));")} />
          <div style={css("position:absolute; left:0; right:0; bottom:0; height:120px; background:linear-gradient(180deg, rgba(10,10,11,0), #0A0A0B);")} />
        </div>
        <div aria-hidden="true" style={css("position:absolute; left:0; right:0; top:72%; height:1px; background:rgba(91,74,122,.2); pointer-events:none;")} />
        {TILES.map((t) => (
          <ArchiveTile key={t.key} tile={t} />
        ))}
        <h2 className="serif" style={css("position:absolute; left:50%; top:calc(40px + 50%); z-index:40; transform:translate(-50%,-50%); margin:0; width:max-content; max-width:88vw; text-align:center; pointer-events:none; font-size:clamp(44px,6.4vw,104px); line-height:.9; letter-spacing:-0.03em; color:#EDEAE3; text-shadow:0 8px 50px #0A0A0B;")}>
          Anything you can say.
        </h2>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section data-rooms="1" style={css("position:relative; isolation:isolate; overflow:hidden; padding:clamp(60px,7vw,100px) clamp(16px,4vw,40px) clamp(100px,11vw,150px); background:linear-gradient(180deg,#0A0A0B 0%,#0d0a11 30%,#1a1222 48%,#0A0A0B 100%);")}>
        {STARS("0", "45%", 0.35)}
        <div style={css("position:relative; max-width:1360px; margin:0 auto;")}>
          <h2 className="serif" style={css("margin:0; font-size:clamp(40px,6vw,84px); letter-spacing:-0.03em; line-height:.95;")}>How it works</h2>
          <div data-strip="1" style={css("position:relative; margin-top:clamp(10px,1.5vw,24px); aspect-ratio:2400/760;")}>
            <div aria-hidden="true" style={css("position:absolute; left:50%; top:56.6%; width:max(100vw,1800px); height:900px; transform:translateX(-50%); overflow:hidden; pointer-events:none;")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v3/ground.webp" alt="" style={css("display:block; width:100%;")} />
              <div style={css("position:absolute; inset:0; background:linear-gradient(180deg, rgba(10,10,11,0) 22%, #0A0A0B 62%);")} />
            </div>
            <div aria-hidden="true" style={css("position:absolute; left:50%; top:calc(56.6% - 70px); width:max(100vw,1800px); height:70px; transform:translateX(-50%); background:linear-gradient(180deg, rgba(0,0,0,0), rgba(90,55,100,.3)); pointer-events:none;")} />
            <div aria-hidden="true" style={css("position:absolute; left:50%; top:56.6%; width:max(100vw,1800px); height:1px; transform:translateX(-50%); background:rgba(200,170,210,.32); pointer-events:none;")} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/v3/rooms-plate.webp"
              alt="A plaster speech bubble lets out the words 'show how a wave is born'; they enter a glowing lantern and leave as one orange sine wave that folds into a paper plane"
              style={css("position:absolute; inset:0; width:100%; height:100%;")}
            />
            <svg viewBox="0 0 2400 760" aria-hidden="true" style={css("position:absolute; inset:0; width:100%; height:100%; overflow:visible; pointer-events:none;")}>
              <defs>
                <radialGradient id="h3flame" gradientUnits="userSpaceOnUse" cx="1200" cy="462" r="44">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset=".35" stopColor="#fff2c2" />
                  <stop offset=".65" stopColor="#ffc24a" />
                  <stop offset="1" stopColor="#FF5B1F" />
                </radialGradient>
                <radialGradient id="h3fglow" gradientUnits="userSpaceOnUse" cx="1200" cy="452" r="90">
                  <stop offset="0" stopColor="#ffd38a" stopOpacity=".9" />
                  <stop offset="1" stopColor="#FF5B1F" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="h3strip" gradientUnits="userSpaceOnUse" x1="1692" y1="0" x2="1790" y2="0">
                  <stop offset="0" stopColor="#FF5B1F" />
                  <stop offset="1" stopColor="#f6efe2" />
                </linearGradient>
                <filter id="h3blur" x="-20%" y="-50%" width="140%" height="200%">
                  <feGaussianBlur stdDeviation="7" />
                </filter>
                <path id="h3ribbon" d="M 568 300 C 770 150, 990 330, 1168 446" />
              </defs>
              <text fontFamily="var(--font-instrument), serif" fontStyle="italic" fill="#F4EEE0" wordSpacing="10">
                <textPath href="#h3ribbon">
                  {["show", " how", " a", " wave", " is", " born"].map((w, i) => (
                    <tspan key={i} data-word={i} fontSize={76 - i * 3} fillOpacity="0">
                      {w}
                    </tspan>
                  ))}
                </textPath>
              </text>
              {[[590, 300, 2.4], [586, 310, 1.8], [592, 292, 1.5], [584, 304, 2]].map(([cx, cy, r], i) => (
                <circle key={i} data-pex={i} cx={cx} cy={cy} r={r} fill="#F4EEE0" />
              ))}
              {[[1160, 440, 3], [1164, 448, 2.2], [1156, 452, 2.6], [1168, 436, 1.8], [1162, 444, 2]].map(([cx, cy, r], i) => (
                <circle key={i} data-pborn={i} cx={cx} cy={cy} r={r} fill="#ffd9a0" opacity="0" />
              ))}
              <circle data-fglow="1" cx="1200" cy="452" r="90" fill="url(#h3fglow)" opacity=".35" />
              <g data-flame="1">
                <path d="M1200 402 C1224 436 1224 470 1200 481 C1176 470 1176 436 1200 402 Z" fill="url(#h3flame)" />
                <ellipse cx="1200" cy="465" rx="7" ry="12" fill="#ffffff" />
              </g>
              <path data-wave="1" d={WAVE_D} fill="none" stroke="#FF5B1F" strokeWidth="16" strokeOpacity=".4" strokeLinecap="round" filter="url(#h3blur)" pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
              <path data-wave="1" d={WAVE_D} fill="none" stroke="#FF6a2e" strokeWidth="5.5" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
              <g data-st="0" opacity="0">
                <polygon points="1689,394 1812,364 1816,380 1694,409" fill="url(#h3strip)" />
                <polygon points="1812,364 1816,380 1820,374" fill="#c9bfae" />
              </g>
              <g data-st="1" opacity="0">
                <polygon points="1846,350 1980,312 1932,344" fill="#f8f2e6" />
                <polygon points="1846,350 1932,344 1904,372" fill="#a99d89" />
                <line x1="1846" y1="350" x2="1980" y2="312" stroke="#8d806c" strokeWidth="1.5" />
              </g>
              <ellipse data-st="2" cx="2120" cy="608" rx="66" ry="7" fill="#050307" opacity="0" filter="url(#h3blur)" />
              <g data-glide="1">
                <g data-st="2" opacity="0">
                  <polygon points="2200,226 2014,284 2096,292" fill="#fbf6ea" />
                  <polygon points="2200,226 2096,292 2078,304" fill="#e3d9c7" />
                  <polygon points="2200,226 2096,292 2104,334" fill="#9c9080" />
                  <line x1="2200" y1="226" x2="2096" y2="292" stroke="#7d715f" strokeWidth="1.4" />
                  <path d="M2212 220 Q 2300 170 2392 76" fill="none" stroke="#F4E9D0" strokeOpacity=".5" strokeWidth="3" strokeDasharray="2 14" strokeLinecap="round" />
                </g>
              </g>
            </svg>
          </div>
          <div className="h3-steps" style={css("position:relative; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:clamp(24px,3vw,48px); margin-top:clamp(8px,1vw,16px);")}>
            {[
              ["Describe it", "Type what you want to show in plain words."],
              ["Watch it appear", "Manition makes the video while you wait. Type a change and it redraws the video."],
              ["Share it", "Download the video and use it in a class, a post, or a group chat."],
            ].map(([h, p], i) => (
              <div key={i} data-col={i} style={css("display:flex; flex-direction:column; align-items:center; text-align:center; transition:opacity .8s, transform .8s cubic-bezier(.2,.7,.1,1);")}>
                <span className="serif" style={css("display:block; font-style:italic; font-size:clamp(76px,7.4vw,112px); line-height:1; color:#FF5B1F; text-shadow:0 0 24px rgba(255,91,31,.25);")}>{i + 1}</span>
                <h3 style={css("margin:24px 0 0; font-weight:500; font-size:clamp(20px,2vw,24px); letter-spacing:-0.01em;")}>{h}</h3>
                <p style={css("margin:10px 0 0; max-width:32ch; font-size:16.5px; line-height:1.6; color:#b3b0a9; text-wrap:pretty;")}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WINDOWS IN THE WALL ============ */}
      <section style={css("position:relative; isolation:isolate; overflow:hidden; padding:clamp(70px,8vw,120px) clamp(16px,4vw,40px) clamp(90px,10vw,140px); background:linear-gradient(180deg,#0A0A0B 0%,#0b0a10 40%,#151424 56%);")}>
        {STARS("0", "56%", 0.9)}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v3/moon.webp" alt="" aria-hidden="true" style={css("position:absolute; left:6%; top:calc(56% - clamp(90px,10vw,150px)); width:clamp(180px,20vw,300px); opacity:.85; filter:drop-shadow(0 0 40px rgba(244,233,208,.35));")} />
        <Ground
          at="56%"
          glow="rgba(140,150,190,.25)"
          line="rgba(200,205,225,.35)"
          tint={<div style={css("position:absolute; inset:0; background:linear-gradient(180deg, rgba(190,200,225,.14), rgba(190,200,225,.02) 50%);")} />}
        />
        <div style={css("position:relative; max-width:1240px; margin:0 auto;")}>
          <div className="h3-head" style={css("display:flex; align-items:flex-end; justify-content:space-between; gap:20px 40px; margin-bottom:clamp(36px,4vw,56px);")}>
            <h2 className="serif" style={css("margin:0; font-size:clamp(40px,6vw,84px); letter-spacing:-0.03em; line-height:.95;")}>People asked for these.</h2>
            <p style={css("margin:0; max-width:300px; font-size:16.5px; line-height:1.6; color:#c9c6bf;")}>One sentence each. This is what came back.</p>
          </div>
          <div className="h3-wall" style={css("position:relative; width:78%; margin:0 auto;")}>
            <div aria-hidden="true" style={css("position:absolute; left:100%; bottom:0; width:40%; height:22%; background:linear-gradient(90deg, rgba(4,2,8,.65), rgba(4,2,8,0)); transform:skewX(-55deg); transform-origin:bottom left; filter:blur(3px);")} />
            <div aria-hidden="true" style={css("position:absolute; left:30%; right:30%; bottom:-70px; height:90px; background:radial-gradient(ellipse at 50% 0%, rgba(120,220,170,.28), rgba(120,220,170,0) 70%); filter:blur(6px);")} />
            <div aria-hidden="true" style={css("position:absolute; left:-2%; right:-2%; bottom:-14px; height:24px; border-radius:50%; background:rgba(4,2,8,.85); filter:blur(8px);")} />
            <div className="h3-win" style={css("position:relative; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:clamp(18px,2.4vw,34px); padding:clamp(36px,4vw,56px) clamp(22px,3vw,44px) clamp(26px,3vw,40px); background:url(/v3/plaster.webp) center/360px, linear-gradient(35deg,#f2e8d4 0%,#cfc5b2 50%,#8e8478 100%); background-blend-mode:multiply; clip-path:polygon(0 3%, 6% 1.5%, 14% 2.6%, 22% 0, 37% 1.8%, 48% .6%, 63% 2.2%, 74% .4%, 86% 2%, 100% 0, 100% 100%, 0 100%); box-shadow:inset 0 -14px 30px rgba(40,28,24,.35);")}>
              {[
                ["tree", "A year in one tree", "One seed, four seasons"],
                ["aurora", "Aurora over a frozen lake", "Why the sky glows green"],
                ["phyllo", "Phyllotaxis bloom", "How a sunflower packs its seeds"],
              ].map(([scene, label, cap]) => (
                <div key={scene} style={css("display:flex; flex-direction:column;")}>
                  <div data-play="1" style={css("position:relative; border-style:solid; border-width:16px 16px 18px 14px; border-color:#7d7366 #a2978a #d2c8b4 #655c51; box-shadow:inset 8px 10px 22px rgba(20,12,10,.65), 0 1px 0 rgba(255,255,255,.4);")}>
                    <div className="h3-win-frame" style={css("position:relative; aspect-ratio:4/3; overflow:hidden; background:#0a0a0d;")}>
                      <GalleryVideo scene={scene} label={label} />
                    </div>
                  </div>
                  <div style={css("height:12px; margin:0 -10px; background:linear-gradient(180deg,#efe6d2,#b9ae9a); box-shadow:0 6px 10px rgba(30,20,20,.35);")} />
                  <p className="mono" style={css("margin:14px 0 0; font-size:13px; color:#3a302a; text-shadow:0 1px 0 rgba(255,255,255,.45);")}>{cap}</p>
                </div>
              ))}
            </div>
            <div style={css("margin-top:clamp(28px,3vw,40px);")}>
              <Link href="/gallery" className="h3-more">
                See more videos →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ QUIET ROOM ============ */}
      <section style={css("position:relative; isolation:isolate; overflow:hidden; min-height:clamp(680px,60vw,880px); display:flex; align-items:center; padding:clamp(90px,10vw,140px) clamp(16px,4vw,40px); box-sizing:border-box; background:linear-gradient(180deg,#0A0A0B 0%,#0d0a10 22%,#151019 35%);")}>
        {STARS("0", "35%", 0.22)}
        <div aria-hidden="true" style={css("position:absolute; left:0; right:0; top:35%; bottom:0; overflow:hidden; pointer-events:none;")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v3/ground.webp" alt="" style={css("position:absolute; left:50%; top:0; width:max(100%,1800px); transform:translateX(-50%); display:block; opacity:.6;")} />
          <div style={css("position:absolute; inset:0; background:linear-gradient(180deg, rgba(10,10,11,.2), rgba(10,10,11,0) 30%, rgba(10,10,11,.4) 80%, #0A0A0B);")} />
        </div>
        <div aria-hidden="true" style={css("position:absolute; left:0; right:0; top:35%; height:1px; background:rgba(200,170,210,.16); pointer-events:none;")} />
        <div aria-hidden="true" style={css("position:absolute; left:26%; top:80%; width:56%; height:90px; background:radial-gradient(ellipse at 50% 50%, rgba(255,200,140,.16), rgba(255,200,140,0) 70%); filter:blur(8px); pointer-events:none;")} />
        {/* eslint-disable @next/next/no-img-element */}
        <img src="/v3/q-board.webp" alt="" aria-hidden="true" className="h3-hide-t" style={css("position:absolute; right:1.5%; top:44%; width:20vw; max-width:360px; opacity:.24; pointer-events:none; -webkit-mask-image:linear-gradient(90deg, #000 0%, rgba(0,0,0,.75) 100%);")} />
        <img src="/v3/q-chair.webp" alt="" aria-hidden="true" className="h3-hide-t" style={css("position:absolute; right:14%; top:6%; width:140px; opacity:.3; transform:rotate(15deg); pointer-events:none;")} />
        <div aria-hidden="true" className="h3-hide-t" style={css("position:absolute; right:calc(14% - 20px); top:40%; width:140px; height:12px; border-radius:50%; background:rgba(4,2,8,.55); filter:blur(7px); transform:skewX(-40deg); pointer-events:none;")} />
        <div className="h3-hide-t" aria-hidden="true" style={css("position:absolute; left:clamp(-40px,-1vw,0px); bottom:3%; height:min(64%,520px); aspect-ratio:600/1100; pointer-events:none;")}>
          <div style={css("position:absolute; left:62.3%; top:23.8%; width:92vw; height:52vh; transform-origin:0 50%; transform:translateY(-50%) rotate(27deg); background:radial-gradient(ellipse 100% 50% at 0% 50%, rgba(244,233,208,.22), rgba(244,233,208,.07) 45%, rgba(244,233,208,0) 72%); filter:blur(40px);")} />
          <img src="/v3/q-lamp2.webp" alt="" style={css("position:relative; display:block; height:100%; width:100%; opacity:.4;")} />
        </div>
        {/* eslint-enable @next/next/no-img-element */}
        <div style={css("position:relative; width:100%; max-width:1360px; margin:0 auto;")}>
          <p className="h3-qtext serif" style={css("margin:0 0 0 clamp(0px,21vw,320px); max-width:56%; font-size:clamp(34px,5vw,68px); line-height:1.06; letter-spacing:-0.025em; color:#EDEAE3; text-wrap:balance;")}>
            Made for teachers who want the class to see it, creators who want a better visual, and anyone who has ever said{" "}
            <span style={css("display:block; font-style:italic; color:#FF5B1F;")}>
              <span style={css("white-space:nowrap;")}>&quot;it is hard to explain,</span>{" "}
              <span style={css("white-space:nowrap;")}>
                but
                {[0, 1, 2].map((i) => (
                  <span key={i} data-dot={i} style={css("display:inline-block;")}>
                    .
                  </span>
                ))}
                &quot;
              </span>
            </span>
          </p>
        </div>
      </section>

      {/* ============ INVITATION ============ */}
      <section id="waitlist" style={css("position:relative; isolation:isolate; overflow:hidden; padding:clamp(70px,8vw,110px) clamp(16px,4vw,40px) clamp(120px,13vw,180px); background:linear-gradient(180deg,#0A0A0B 0%,#0e0a0c 45%,#26120e 68%); scroll-margin-top:40px;")}>
        <div aria-hidden="true" style={css("position:absolute; left:-10%; right:-10%; top:40%; height:60%; background:radial-gradient(ellipse at 50% 50%, rgba(255,91,31,.3), rgba(194,65,12,.08) 40%, rgba(194,65,12,0) 65%); pointer-events:none;")} />
        <Ground
          at="68%"
          glow="rgba(194,65,12,.35)"
          line="rgba(255,150,100,.5)"
          tint={<div style={css("position:absolute; inset:0; background:radial-gradient(ellipse at 50% 0%, rgba(255,91,31,.14), rgba(255,91,31,0) 60%);")} />}
        />
        <div style={css("position:relative; max-width:1240px; margin:0 auto;")}>
          <div aria-hidden="true" style={css("position:absolute; left:10%; right:-4%; bottom:-70px; height:46px; border-radius:50%; background:rgba(4,2,6,.85); filter:blur(20px); transform:skewX(-40deg);")} />
          <div data-bob="4,12,3" style={css("position:relative;")}>
            <div className="h3-wl" style={css("position:relative; display:grid; grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr); align-items:center; gap:24px; background:rgba(18,18,20,.74); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border:1px solid rgba(237,234,227,.14); border-radius:24px; box-shadow:inset 0 1px 0 rgba(237,234,227,.12), 0 50px 120px -40px rgba(255,91,31,.35); padding:clamp(36px,6vw,80px) clamp(22px,5vw,72px); overflow:hidden;")}>
              <div aria-hidden="true" style={css("position:absolute; right:-10%; top:-20%; width:60%; height:140%; background:radial-gradient(ellipse at 60% 55%, rgba(255,91,31,.28), rgba(255,91,31,0) 60%); pointer-events:none;")} />
              <div style={css("position:relative;")}>
                <h2 className="serif" style={css("margin:0; font-size:clamp(48px,7vw,100px); letter-spacing:-0.035em; line-height:.9;")}>
                  Be there on <span style={css("font-style:italic; color:#FF5B1F;")}>day one.</span>
                </h2>
                <p style={css("margin:24px 0 0; max-width:440px; font-size:16.5px; line-height:1.6; color:#b3b0a9; text-wrap:pretty;")}>
                  We are letting people in a few at a time. Leave your email and we will send one message when it is your turn.
                </p>
                <WaitlistForm tone="night" source="/" onJoined={onJoined} />
                <div style={css("display:flex; align-items:center; gap:12px; margin-top:26px;")}>
                  <div style={css("display:flex;")}>
                    {[
                      ["Ed", "#3a2f1f", "#e0a94a"],
                      ["YT", "#1f2a3d", "#8fb3e6"],
                      ["Ph", "#1d3326", "#7fd39a"],
                    ].map(([t, bg, fg], i) => (
                      <div key={t} style={css(`width:28px; height:28px; border-radius:50%; background:${bg}; border:2px solid #121214; ${i ? "margin-left:-8px;" : ""} display:flex; align-items:center; justify-content:center; font-size:10.5px; font-weight:600; color:${fg};`)}>
                        {t}
                      </div>
                    ))}
                  </div>
                  <p className="mono" style={css("margin:0; font-size:12.5px; line-height:1.4; color:#9a978f;")}>4,200+ people are already waiting. No spam, no card.</p>
                </div>
              </div>
              <div style={css("position:relative; display:flex; justify-content:center;")}>
                <div style={css("position:relative; width:min(100%,300px); aspect-ratio:640/860;")}>
                  {/* eslint-disable @next/next/no-img-element */}
                  <img src="/v3/g-back.webp" alt="" aria-hidden="true" style={css("position:absolute; inset:0; width:100%; height:100%;")} />
                  <img
                    data-sun="1"
                    src="/v3/g-sun.webp"
                    alt="A small orange sun setting into a glass of water"
                    style={{ ...css("position:absolute; inset:0; width:100%; height:100%; transition:transform 2.4s cubic-bezier(.2,.7,.1,1);"), transform: joined ? "translateY(-46%)" : "translateY(0)" }}
                  />
                  <img src="/v3/g-front.webp" alt="" aria-hidden="true" style={css("position:absolute; inset:0; width:100%; height:100%;")} />
                  {/* eslint-enable @next/next/no-img-element */}
                  {[[44, 70, 6], [54, 74, 4], [49, 78, 5], [58, 68, 3]].map(([l, t, s], i) => (
                    <span key={i} data-bubble={i} style={css(`position:absolute; left:${l}%; top:${t}%; width:${s}px; height:${s}px; border-radius:50%; border:1px solid rgba(255,220,190,.7);`)} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <NightFooter waitlistHref="#waitlist" />

      <div data-grain="1" className="h3-grain" aria-hidden="true" />
      <div data-cursor="1" className="h3-cursor" aria-hidden="true">
        <span data-cursor-label="1">PLAY</span>
      </div>
    </div>
  );
}
