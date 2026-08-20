"use client";

import { memo, type CSSProperties, type ReactElement, type ReactNode } from "react";
import SceneStage, { type SceneDef, type SceneProps } from "./SceneStage";
import { Easing, clamp, seg, band, type Ease } from "./engine";
import { TILES } from "./tiles";

const DISP = "var(--font-space-grotesk), system-ui, sans-serif";
const BODY = "var(--font-ibm-plex-sans), system-ui, sans-serif";
const MONO = "var(--font-ibm-plex-mono), ui-monospace, monospace";

const PAPER = "#f7f6f3";
const INK = "#16161a";
const MUTE = "#6f6c66";
const FAINT = "#a5a19a";
const RULE = "#e4e0d6";
const PANEL = "#ffffff";
const EDGE = "#e7e3d9";
const SIDE = "#faf8f3";
const ACCENT = "#3b62e0";
const SCREEN = "#0a0a0d";

type Enter = { opacity: number; transform: string };

const MOTION = {
  enter: (p: number, dy?: number): Enter => ({
    opacity: clamp(p, 0, 1),
    transform:
      "translateY(" + (1 - Easing.easeOutCubic(clamp(p, 0, 1))) * (dy == null ? 22 : dy) + "px)",
  }),
  draw: (p: number) => Easing.easeInOutCubic(clamp(p, 0, 1)),
  settle: (p: number) => Easing.easeOutQuart(clamp(p, 0, 1)),
};

function Field() {
  return <div style={{ position: "absolute", inset: 0, background: PAPER }} />;
}

function Grain({ o }: { o?: number }) {
  if (o != null && o <= 0.004) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: -560,
        top: -560,
        right: -560,
        bottom: -560,
        opacity: o == null ? 1 : o,
        backgroundImage:
          "radial-gradient(circle, rgba(22,22,26,0.062) 1.5px, rgba(22,22,26,0) 1.6px)",
        backgroundSize: "68px 68px",
      }}
    />
  );
}

function Wordmark({ p, size, top, opacity }: { p: number; size: number; top: number; opacity: number }) {
  const s = MOTION.settle(p);
  const ls = 0.29 * size * (1 - s) - 0.03 * size * s;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: top,
        textAlign: "center",
        opacity: opacity,
        font: "600 " + size + "px " + DISP,
        color: INK,
        lineHeight: 1,
        letterSpacing: ls + "px",
        marginRight: -ls,
        whiteSpace: "nowrap",
      }}
    >
      Manition
    </div>
  );
}

type Phrase = [string, number, boolean?];

function Callout({
  phrases,
  t,
  a,
  size,
  top,
  color,
  rise,
}: {
  phrases: Phrase[];
  t: number;
  a: number;
  size?: number;
  top?: number;
  color?: string;
  rise?: number;
}) {
  if (a <= 0.001) return null;
  const base = color || INK;
  const r = rise == null ? 1 : MOTION.settle(seg(t, rise, rise + 0.95));
  return (
    <div
      style={{
        position: "absolute",
        left: 200,
        right: 200,
        top: top == null ? 452 : top,
        textAlign: "center",
        opacity: a,
        font: "500 " + (size || 64) + "px " + DISP,
        color: base,
        letterSpacing: "-0.03em",
        lineHeight: 1.18,
        textWrap: "pretty",
        transform:
          "translateY(" + ((1 - r) * 26).toFixed(2) + "px) scale(" + (0.964 + 0.036 * r).toFixed(4) + ")",
        transformOrigin: "50% 100%",
      }}
    >
      {phrases.map((ph, i) => {
        const m = MOTION.enter(seg(t, ph[1], ph[1] + 0.62), 18);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: m.opacity,
              transform: m.transform,
              color: ph[2] ? ACCENT : base,
              marginRight: i === phrases.length - 1 ? 0 : "0.28em",
            }}
          >
            {ph[0]}
          </span>
        );
      })}
    </div>
  );
}

function Line({
  text,
  a,
  top,
  size,
  color,
  font,
}: {
  text: string;
  a: number;
  top: number;
  size?: number;
  color?: string;
  font?: string;
}) {
  if (a <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: top,
        textAlign: "center",
        opacity: a,
        font: "400 " + (size || 38) + "px " + (font || BODY),
        color: color || MUTE,
        letterSpacing: font === MONO ? "0.06em" : "-0.01em",
      }}
    >
      {text}
    </div>
  );
}

/* ── the render inside the product: a lensed black hole ─────────── */
/* For every circular orbit the near half stays a flat ellipse crossing in front
   of the shadow, while the far half is lifted into an arch that clears it — the
   light from behind the hole, bent up over the top. Run in `under` mode the same
   map mirrors that arch downward. Flat sheet across the middle, arch over the
   top, arch under the bottom: gravity, rather than a ring with a hole in it. */

const BH_CX = 800,
  BH_CY = 374;
const RS = 71;
const RIN = 98,
  ROUT = 338;
const N_RING = 21;
const TOP_B = RS * 1.26,
  TOP_S = 0.26;
const BOT_B = RS * 1.22,
  BOT_S = 0.155;
const PLATE_FILL: CSSProperties = { left: 0, top: 0, width: "100%", height: "100%" };

const GRAIN_URL = 'url("/film/grain.png")';

const BH_STOPS = [
  [0, 255, 253, 247],
  [0.09, 255, 241, 210],
  [0.26, 255, 205, 128],
  [0.48, 252, 152, 60],
  [0.7, 214, 92, 27],
  [0.86, 146, 48, 14],
  [1, 74, 22, 8],
];

function bhTemp(u: number) {
  const x = clamp(u, 0, 1);
  let i = 1;
  while (i < BH_STOPS.length - 1 && x > BH_STOPS[i][0]) i++;
  const a = BH_STOPS[i - 1],
    b = BH_STOPS[i];
  const k = (x - a[0]) / (b[0] - a[0]);
  return (
    "rgb(" +
    Math.round(a[1] + (b[1] - a[1]) * k) +
    "," +
    Math.round(a[2] + (b[2] - a[2]) * k) +
    "," +
    Math.round(a[3] + (b[3] - a[3]) * k) +
    ")"
  );
}

function bhRnd(seed: number) {
  let v = seed;
  return function () {
    v = (v * 1103515245 + 12345) & 0x7fffffff;
    return v / 0x7fffffff;
  };
}

const BH_STARS = (function () {
  const q = bhRnd(90210),
    out: { x: number; y: number; r: number; b: number }[] = [];
  for (let i = 0; i < 108; i++) {
    out.push({ x: q() * 2000, y: q() * 1000 - 120, r: 0.5 + Math.pow(q(), 3) * 2.0, b: 0.2 + q() * 0.8 });
  }
  return out;
})();

/* Keplerian filaments, crowded inward and loosely gathered into three density
   waves, each weaving in and out radially as it flows — the curl is what
   separates plasma in motion from an airbrushed gradient. */
const BH_STREAKS = (function () {
  const q = bhRnd(4242),
    out: {
      r: number;
      u: number;
      om: number;
      ph: number;
      len: number;
      w: number;
      b: number;
      ca: number;
      cf: number;
      cp: number;
      fl: number;
    }[] = [];
  for (let i = 0; i < 196; i++) {
    const u = Math.pow(q(), 1.55);
    const rad = RIN + (ROUT - RIN) * u;
    const arm = Math.floor(q() * 3) * 2.0944;
    const fine = q() < 0.42;
    out.push({
      r: rad,
      u: u,
      om: Math.pow(RIN / rad, 1.5),
      ph: arm + (q() - 0.5) * 1.7 + 2.1 * Math.log(rad / RIN),
      len: (fine ? 0.5 : 0.26) + q() * (fine ? 1.5 : 0.9) * (1 - 0.45 * u),
      w: fine ? 0.5 + q() * 0.9 : 1.2 + q() * 2.7 * (1 - 0.4 * u),
      b: (fine ? 0.3 : 0.42) + q() * 0.58,
      ca: 0.008 + q() * 0.042,
      cf: 2.4 + q() * 7.0,
      cp: q() * 6.283,
      fl: q() * 6.283,
    });
  }
  return out;
})();

function bhPt(si: number, r: number, ph: number, mode: number) {
  const sn = Math.sin(ph);
  if (sn >= 0 && !mode) return [BH_CX + r * Math.cos(ph), BH_CY + sn * r * si];
  const a = Math.abs(sn);
  const k = Math.pow(a, 0.28);
  const R = mode === 2 ? BOT_B + BOT_S * (r - RIN) : TOP_B + TOP_S * (r - RIN);
  const rho = r + (R - r) * k;
  return [BH_CX + rho * Math.cos(ph), BH_CY + (mode === 2 ? a : -a) * rho];
}

function bhArc(si: number, r: number, from: number, to: number, mode: number) {
  const n = 20 + Math.round((22 * (r - RIN)) / (ROUT - RIN));
  let d = "";
  for (let i = 0; i <= n; i++) {
    const q = bhPt(si, r, from + ((to - from) * i) / n, mode);
    d += (d ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1);
  }
  return d;
}

type BHRing = {
  i: number;
  u: number;
  r: number;
  w: number;
  wt: number;
  wb: number;
  col: string;
  colT: string;
  colB: string;
  op: number;
  near: string;
  top: string;
  bot: string;
};
type Half = "near" | "top" | "bot";
type WKey = ["w" | "wt" | "wb", "col" | "colT" | "colB"];

function BHPlate({
  pen,
  sweep,
  phase,
  style,
}: {
  pen?: number;
  sweep?: number;
  phase?: number;
  style?: CSSProperties;
}) {
  const p = clamp(pen || 0, 0, 1);
  const sw = clamp(sweep || 0, 0, 1);
  /* the disk is whole from the first frame — growing it ring by ring reads as
     scattered particles coalescing, which is not what an accretion disk does */
  const gv = Easing.easeOutCubic(seg(p, 0.004, 0.19));
  const rMax = ROUT + 40;
  const mo = p + (phase || 0);
  const orbit = mo * (1 + 0.5 * sw);
  const si = 0.163 + 0.026 * Math.sin(orbit * 0.9) - 0.014 * sw;
  const spin = 20.5 * mo * (1 + 1.15 * sw);
  const push = (1 + 0.078 * Math.log(1 + 1.35 * mo)) * (1 + 0.055 * sw);
  const pan = -orbit * 210 - 40 * sw;
  const gt =
    "translate(" + BH_CX + " " + BH_CY + ") scale(" + push.toFixed(6) + ") translate(" + -BH_CX + " " + -BH_CY + ")";
  const swing = Math.max(0, Math.sin(orbit * 1.35 + 0.4));
  const bloomP = Math.pow(swing, 3) * gv;
  const gl = Math.pow(swing, 12) * gv;

  /* every orbit is drawn three times — the flat band that crosses in front, the
     arc lensed over the top pole, and the arc lensed under the bottom one */
  const rings: BHRing[] = [];
  for (let i = 0; i < N_RING; i++) {
    const u = i / (N_RING - 1);
    const r = RIN + (ROUT - RIN) * Math.pow(u, 1.1);
    if (r > rMax + 3) break;
    const w = 13 + 15 * u;
    rings.push({
      i: i,
      u: u,
      r: r,
      w: w,
      wt: w * 0.34,
      wb: w * 0.31,
      col: bhTemp(u * 0.96),
      colT: bhTemp(clamp(u * 0.9 + 0.08, 0, 1)),
      colB: bhTemp(clamp(u * 0.82 + 0.06, 0, 1)),
      op: (0.52 - 0.2 * u) * clamp((rMax - r) / 24, 0, 1) * gv,
      near: bhArc(si, r, 0, Math.PI, 0),
      top: bhArc(si, r, Math.PI, Math.PI * 2, 1),
      bot: bhArc(si, r, Math.PI, Math.PI * 2, 2),
    });
  }
  const inOut = rings.slice().reverse();

  const streaks: { k: number; d: string; du: string; col: string; w: number; wu: number; op: number }[] = [];
  for (let i = 0; i < BH_STREAKS.length; i++) {
    const st = BH_STREAKS[i];
    if (st.r > rMax) continue;
    const a0 = st.ph + spin * st.om;
    const mid = a0 + st.len / 2;
    const dop = clamp(1 - 1.12 * Math.cos(mid), 0.06, 2.12);
    const ms = Math.sin(mid);
    const far = ms < 0;
    const wob = spin * 0.55 * st.om;
    const rAt = (fr: number) => st.r * (1 + st.ca * Math.sin(st.cp + fr * st.cf + wob));
    let d = "",
      du = "";
    for (let k = 0; k <= 8; k++) {
      const fr = k / 8;
      const q = bhPt(si, rAt(fr), a0 + st.len * fr, 0);
      d += (d ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1);
    }
    if (ms < -0.28) {
      for (let k = 0; k <= 8; k++) {
        const fr = k / 8;
        const q = bhPt(si, rAt(fr), a0 + st.len * fr, 2);
        du += (du ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1);
      }
    }
    const fk = 0.74 + 0.26 * Math.sin(spin * 0.85 * st.om + st.fl);
    streaks.push({
      k: i,
      d: d,
      du: du,
      col: bhTemp(clamp(st.u * 0.8 - 0.42 * (dop - 1), 0, 1)),
      w: st.w * (far ? 0.36 : 1),
      wu: st.w * 0.26,
      op: clamp(st.b * dop * fk * 0.66, 0, 0.95) * gv * clamp((rMax - st.r) / 24, 0, 1),
    });
  }

  /* the starfield is lensed too: pushed outward from the hole and smeared along
     the tangent, hardest just outside the photon ring */
  const stars: ReactElement[] = [];
  for (let i = 0; i < BH_STARS.length; i++) {
    const st = BH_STARS[i];
    const x = ((((st.x + pan) % 2000) + 2000) % 2000) - 200;
    const dx = x - BH_CX,
      dy = st.y - BH_CY;
    const d = Math.max(7, Math.hypot(dx, dy));
    const f = 1 + 4200 / (d * d);
    const dd = d * f;
    if (dd < RS * 1.06) continue;
    const nr = clamp((248 - dd) / 186, 0, 1);
    const cx = BH_CX + dx * f,
      cy = BH_CY + dy * f;
    const rr = st.r * (1 - 0.25 * nr);
    const op = ((0.3 + 0.7 * gv) * st.b * (0.5 + 0.32 * nr) * (1 - 0.4 * nr)).toFixed(3);
    if (nr < 0.16) {
      stars.push(<circle key={i} cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={rr.toFixed(2)} fill="#dfe6f5" opacity={op} />);
    } else {
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      stars.push(
        <ellipse
          key={i}
          cx={cx.toFixed(1)}
          cy={cy.toFixed(1)}
          rx={(rr * (1 + 3.4 * Math.pow(nr, 2.4))).toFixed(2)}
          ry={(rr * 0.9).toFixed(2)}
          transform={"rotate(" + ang.toFixed(1) + " " + cx.toFixed(1) + " " + cy.toFixed(1) + ")"}
          fill="#dfe6f5"
          opacity={op}
        />,
      );
    }
  }

  const bandLayer = (list: BHRing[], half: Half, key: string, wk: WKey) =>
    list.map((rg) => (
      <g key={key + rg.i}>
        {rg.i % 3 === 0 ? (
          <path
            d={rg[half]}
            fill="none"
            stroke={rg[wk[1]]}
            strokeWidth={rg[wk[0]] * 3.2}
            opacity={rg.op * 0.22}
            strokeLinecap="round"
          />
        ) : null}
        <path d={rg[half]} fill="none" stroke={rg[wk[1]]} strokeWidth={rg[wk[0]]} opacity={rg.op} strokeLinecap="round" />
        <path
          d={rg[half]}
          fill="none"
          stroke="url(#bhBeamG)"
          strokeWidth={rg[wk[0]]}
          opacity={clamp(rg.op * 2.1, 0, 0.92)}
          strokeLinecap="round"
        />
      </g>
    ));

  const lip = bhArc(si, RIN, 0, Math.PI, 0);
  const lipT = bhArc(si, RIN, Math.PI, Math.PI * 2, 1);
  const lipB = bhArc(si, RIN, Math.PI, Math.PI * 2, 2);
  const RP = RS * 1.028;
  const halfL = "M " + BH_CX + " " + (BH_CY - RP) + " A " + RP + " " + RP + " 0 0 0 " + BH_CX + " " + (BH_CY + RP);
  const halfR = "M " + BH_CX + " " + (BH_CY - RP) + " A " + RP + " " + RP + " 0 0 1 " + BH_CX + " " + (BH_CY + RP);

  return (
    <>
      <svg viewBox="0 0 1600 760" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", ...style }}>
        <defs>
          <radialGradient id="bhHalo" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ff9c3c" stopOpacity="0.34" />
            <stop offset="0.34" stopColor="#c9541a" stopOpacity="0.16" />
            <stop offset="0.72" stopColor="#4e1806" stopOpacity="0.05" />
            <stop offset="1" stopColor="#4e1806" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bhAmb" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ff8a2e" stopOpacity="0.13" />
            <stop offset="0.45" stopColor="#b8460f" stopOpacity="0.06" />
            <stop offset="1" stopColor="#3a1104" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bhCore" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffeac4" stopOpacity="0.5" />
            <stop offset="0.5" stopColor="#ff9e42" stopOpacity="0.17" />
            <stop offset="1" stopColor="#ff9e42" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bhBeam" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff6e6" stopOpacity="0.3" />
            <stop offset="0.45" stopColor="#ffcf8c" stopOpacity="0.1" />
            <stop offset="1" stopColor="#ffdfa8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bhFlare" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff2d8" stopOpacity="0" />
            <stop offset="0.4" stopColor="#fff2d8" stopOpacity="0.22" />
            <stop offset="0.5" stopColor="#fffaf0" stopOpacity="0.85" />
            <stop offset="0.6" stopColor="#fff2d8" stopOpacity="0.22" />
            <stop offset="1" stopColor="#fff2d8" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="bhBeamG"
            gradientUnits="userSpaceOnUse"
            x1={BH_CX - ROUT - 30}
            y1="0"
            x2={BH_CX + ROUT + 30}
            y2="0"
          >
            <stop offset="0" stopColor="#fffdf7" stopOpacity="0.58" />
            <stop offset="0.18" stopColor="#fff4dd" stopOpacity="0.34" />
            <stop offset="0.4" stopColor="#ffeac6" stopOpacity="0.06" />
            <stop offset="0.5" stopColor="#1a0602" stopOpacity="0.06" />
            <stop offset="0.66" stopColor="#150501" stopOpacity="0.52" />
            <stop offset="0.84" stopColor="#0d0300" stopOpacity="0.8" />
            <stop offset="1" stopColor="#080200" stopOpacity="0.94" />
          </linearGradient>
          <radialGradient id="bhVig" cx="0.5" cy="0.5" r="0.62">
            <stop offset="0.42" stopColor="#000000" stopOpacity="0" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.66" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="1600" height="760" fill="#030307" />
        <g transform={gt}>
          {stars}
          <ellipse cx={BH_CX} cy={BH_CY} rx={ROUT * 1.9} ry={ROUT * 0.66} fill="url(#bhHalo)" opacity={0.85 * gv} />
          <ellipse cx={BH_CX} cy={BH_CY} rx={ROUT * 1.3} ry={ROUT * 1.02} fill="url(#bhAmb)" opacity={0.9 * gv} />

          {bandLayer(inOut, "top", "T", ["wt", "colT"])}
          <path d={lipT} fill="none" stroke="#ff9d45" strokeWidth={30} opacity={0.1 * gv} strokeLinecap="round" />
          <path d={lipT} fill="none" stroke="#fff6e4" strokeWidth={9} opacity={0.24 * gv} strokeLinecap="round" />
          <path d={lipT} fill="none" stroke="#fffaf0" strokeWidth={3} opacity={0.86 * gv} strokeLinecap="round" />

          {bandLayer(inOut, "bot", "B", ["wb", "colB"])}
          <path d={lipB} fill="none" stroke="#ffb055" strokeWidth={26} opacity={0.13 * gv} strokeLinecap="round" />
          <path d={lipB} fill="none" stroke="#fff4e2" strokeWidth={7} opacity={0.22 * gv} strokeLinecap="round" />
          <path d={lipB} fill="none" stroke="#fffaf0" strokeWidth={2.8} opacity={0.82 * gv} strokeLinecap="round" />

          <ellipse cx={BH_CX} cy={BH_CY} rx={RS * 3.1} ry={RS * 2.1} fill="url(#bhCore)" opacity={gv} />
          <circle cx={BH_CX} cy={BH_CY} r={RS} fill="#000000" />

          <circle cx={BH_CX} cy={BH_CY} r={RP * 1.34} fill="none" stroke="#ff9c3c" strokeWidth={30} opacity={0.09 * gv} />
          <circle cx={BH_CX} cy={BH_CY} r={RP * 1.07} fill="none" stroke="#ffd7a0" strokeWidth={9} opacity={0.2 * gv} />
          <circle cx={BH_CX} cy={BH_CY} r={RP} fill="none" stroke="#ffe9c4" strokeWidth={4.6} opacity={0.4 * gv} />
          <path d={halfL} fill="none" stroke="#ffffff" strokeWidth={2.5} opacity={0.98 * gv} />
          <path d={halfR} fill="none" stroke="#ffcf92" strokeWidth={1.9} opacity={0.58 * gv} />

          {bandLayer(inOut, "near", "N", ["w", "col"])}
          <path
            d={lip}
            fill="none"
            stroke="#ff9d45"
            strokeWidth={58 + 26 * bloomP}
            opacity={0.08 * gv + 0.055 * bloomP}
            strokeLinecap="round"
          />
          <path d={lip} fill="none" stroke="#fff6e4" strokeWidth={20} opacity={0.18 * gv} strokeLinecap="round" />
          <path d={lip} fill="none" stroke="#fffdf7" strokeWidth={4.8} opacity={0.88 * gv} strokeLinecap="round" />

          {streaks.map((st) =>
            st.du ? (
              <path
                key={"u" + st.k}
                d={st.du}
                fill="none"
                stroke={st.col}
                strokeWidth={st.wu}
                opacity={st.op * 0.55}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null,
          )}
          {streaks.map((st) => (
            <path
              key={"s" + st.k}
              d={st.d}
              fill="none"
              stroke={st.col}
              strokeWidth={st.w}
              opacity={st.op}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          <ellipse
            cx={BH_CX - 168}
            cy={BH_CY - 2}
            rx={252 + 40 * bloomP}
            ry={116 + 18 * bloomP}
            fill="url(#bhBeam)"
            opacity={gv * (1 + 0.55 * bloomP)}
          />
          {bloomP > 0.01 ? (
            <ellipse cx={BH_CX - RIN * 1.05} cy={BH_CY + 2} rx={190} ry={62} fill="url(#bhCore)" opacity={0.3 * bloomP} />
          ) : null}
          {gl > 0.004 ? (
            <g opacity={clamp(gl, 0, 1) * 0.72}>
              <rect x={BH_CX - RIN - 660} y={BH_CY - 5} width={1320} height={10} fill="url(#bhFlare)" />
              <rect x={BH_CX - RIN - 3} y={BH_CY - 96} width={6} height={192} fill="url(#bhCore)" opacity={0.5} />
              <ellipse cx={BH_CX - RIN} cy={BH_CY} rx={124} ry={30} fill="url(#bhCore)" />
            </g>
          ) : null}
        </g>
        <rect x="0" y="0" width="1600" height="760" fill="url(#bhVig)" />
      </svg>
      {gv > 0.02 ? (
        <div
          style={{
            position: "absolute",
            backgroundImage: GRAIN_URL,
            backgroundSize: "128px 128px",
            backgroundPosition: ((mo * 9) % 128).toFixed(2) + "px " + ((mo * 6) % 128).toFixed(2) + "px",
            opacity: 0.062 * gv,
            pointerEvents: "none",
            ...style,
          }}
        />
      ) : null}
    </>
  );
}

const BlackHolePlate = memo(BHPlate);

/* ── the product, in the app's own (light) language ───────────────── */

const WIN = { left: 280, top: 168, width: 1360, height: 744 };
const SIDEW = 262;
const VIDEO = { left: 660, top: 286, width: 860, height: 409 };
const NAV: [string, string, number][] = [
  ["New chat", "M12 5v14M5 12h14", 1],
  ["Chats", "M4 6h16M4 12h16M4 18h16", 0],
  ["Projects", "M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z", 0],
  ["Videos", "VID", 0],
];
const STARRED = ["Fourier series build-up", "Golden spiral zoom"];
const RECENTS = ["Riemann zeta spiral", "Sunflower phyllotaxis", "Mandelbrot zoom", "Hilbert curve fill"];
const STAR_D = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
const BUBBLE_D = "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z";
const GEAR_D =
  "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z";

function Icon({ d, size, color, fill, w }: { d: string; size?: number; color?: string; fill?: string; w?: number }) {
  const s = size || 18;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill={fill || "none"}
      stroke={fill ? "none" : color}
      strokeWidth={w || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: "0 0 auto" }}
    >
      {d === "VID" ? (
        <>
          <rect x="2" y="5" width="14" height="14" rx="2" />
          <polygon points="22 7 16 12 22 17" />
        </>
      ) : d === "SEARCH" ? (
        <>
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.2" y2="16.2" />
        </>
      ) : (
        <path d={d} />
      )}
    </svg>
  );
}

function SideRow({
  icon,
  label,
  active,
  faded,
  star,
  size,
}: {
  icon?: string;
  label: string;
  active?: boolean;
  faded?: boolean;
  star?: boolean;
  size?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: size || 40,
        padding: "0 13px",
        borderRadius: 10,
        background: active ? "rgba(59,98,224,0.08)" : "transparent",
        font: "500 " + (size ? 15 : 16) + "px " + BODY,
        color: active ? ACCENT : MUTE,
        minWidth: 0,
        opacity: faded ? 0.82 : 1,
      }}
    >
      {star ? (
        <Icon d={STAR_D} size={14} fill="#cfa440" />
      ) : (
        <Icon d={icon || ""} size={size ? 14 : 18} color={active ? ACCENT : "#a8a49b"} w={size ? 1.9 : 2} />
      )}
      <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
    </div>
  );
}

function SideLabel({ text }: { text: string }) {
  return (
    <div
      style={{
        font: "600 12px " + BODY,
        letterSpacing: "0.15em",
        color: "#b3aea4",
        textTransform: "uppercase",
        padding: "0 13px",
        margin: "18px 0 6px",
      }}
    >
      {text}
    </div>
  );
}

const PROMPT_1 = "black hole, gravitational lensing, slow camera orbit";
const PROMPT_2 = "now speed up the disk and tighten the camera orbit";

function Ring({ size, color }: { size?: number; color?: string }) {
  const s = size || 18;
  return (
    <svg width={s} height={s} viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="7" fill="none" stroke={color || INK} strokeWidth="2.4" />
    </svg>
  );
}

function Chrome({ title, swap, children }: { title?: string; swap?: number; children?: ReactNode }) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: SIDEW,
          borderRight: "1px solid " + EDGE,
          background: SIDE,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 16px 8px" }}>
          <div
            style={{
              width: 27,
              height: 27,
              flex: "0 0 auto",
              borderRadius: 8,
              border: "1px solid #d9d4c8",
              background: PANEL,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 9, height: 9, borderRadius: "50%", border: "1.6px solid " + MUTE }} />
          </div>
          <span
            style={{ flex: 1, font: "700 21px " + DISP, letterSpacing: "-0.01em", color: INK, whiteSpace: "nowrap" }}
          >
            Manition
          </span>
          <Icon d="M11 17l-5-5 5-5M18 17l-5-5 5-5" size={16} color="#b3aea4" w={2} />
        </div>
        <div style={{ padding: "8px 12px 0", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((n) => (
            <SideRow key={n[0]} icon={n[1]} label={n[0]} active={n[2] === 1} />
          ))}
          <SideRow icon="SEARCH" label="Search" />
        </div>
        <div style={{ padding: "0 12px", flex: 1, minHeight: 0 }}>
          <SideLabel text="Starred" />
          {STARRED.map((n) => (
            <SideRow key={n} label={n} star size={34} />
          ))}
          <SideLabel text="Recents" />
          {RECENTS.map((n) => (
            <SideRow key={n} icon={BUBBLE_D} label={n} size={34} faded />
          ))}
        </div>
        <div
          style={{
            borderTop: "1px solid " + EDGE,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 11,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              flex: "0 0 auto",
              background: "#e8e4da",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon d="M12 12a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0" size={15} color="#8e8a81" w={1.8} />
          </div>
          <span style={{ flex: 1 }}></span>
          <Icon d={GEAR_D} size={17} color="#b3aea4" w={1.8} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: SIDEW,
          right: 0,
          top: 0,
          height: 54,
          borderBottom: "1px solid " + EDGE,
          background: PANEL,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 11px", borderRadius: 9 }}>
          <div
            style={{
              position: "relative",
              font: "600 20px " + DISP,
              letterSpacing: "-0.01em",
              color: INK,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ opacity: 1 - (swap || 0) }}>New chat</span>
            <span style={{ position: "absolute", left: 0, top: 0, opacity: swap || 0 }}>
              {title || "Black hole with lensing"}
            </span>
          </div>
          <Icon d="M6 9l6 6 6-6" size={14} color={MUTE} w={2.2} />
        </div>
      </div>
      {children}
    </>
  );
}

type Rect = { left: number; top: number; width: number; height: number };

function Composer({
  rect,
  label,
  text,
  typed,
  sendOn,
  press,
}: {
  rect: Rect;
  label?: string;
  text: string;
  typed: number;
  sendOn: number;
  press?: number;
}) {
  const n = Math.round(clamp(typed, 0, 1) * text.length);
  const lit = clamp(sendOn, 0, 1);
  return (
    <div style={{ position: "absolute", left: rect.left, top: rect.top + (label ? 0 : 30), width: rect.width }}>
      {label ? (
        <div
          style={{
            font: "400 22px " + BODY,
            color: MUTE,
            marginBottom: 16,
            textAlign: "center",
            letterSpacing: "-0.01em",
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          background: PANEL,
          height: rect.height,
          border: "1px solid " + (lit > 0.3 ? "#cfd8f2" : RULE),
          borderRadius: 14,
          padding: "0 18px 0 26px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", font: "400 26px " + BODY }}>
          {n > 0 ? (
            <span style={{ color: INK }}>{text.slice(0, n)}</span>
          ) : (
            <span style={{ color: "#b6b2a9" }}>Describe the animation you want to create...</span>
          )}
          {typed > 0 && typed < 1 ? (
            <span style={{ display: "inline-block", width: 2, height: 27, background: INK, marginLeft: 3 }} />
          ) : null}
        </div>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            flex: "0 0 auto",
            background: lit > 0 ? "rgba(59,98,224," + lit + ")" : "#f1efe8",
            border: "1px solid " + (lit > 0.4 ? "transparent" : RULE),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "scale(" + (1 - 0.12 * (press || 0)) + ")",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={lit > 0.4 ? "#ffffff" : "#a8a49b"}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

const clk = (n: number) => "0:" + (n < 10 ? "0" : "") + n;

/* ── the generated file, streamed in like an editor ───────────────── */

const CODE_SRC = [
  "from manim import *",
  "import numpy as np",
  "",
  "M, SPIN, INCL = 4.3, 0.90, 9.5 * DEGREES",
  "R_ISCO, R_OUT = 2.6 * M, 9.4 * M",
  "",
  "def deflect(b):",
  "    # impact parameter -> photon turn angle, weak-field fit",
  "    return 4 * M / np.maximum(b, 1.02 * R_PHOTON)",
  "",
  "class BlackHole(ThreeDScene):",
  "    def construct(self):",
  "        disk = ParametricSurface(",
  "            lambda u, v: kerr_disk(u, v, spin=SPIN),",
  "            u_range=[R_ISCO, R_OUT], v_range=[0, TAU],",
  "            resolution=(120, 360),",
  "        ).set_shader(",
  "            raymarch(deflect, steps=192),",
  "            doppler=True, beaming=3.0, redshift=True,",
  "        )",
  "",
  "        horizon = Sphere(radius=M).set_fill(BLACK, 1.0)",
  "        ring = PhotonRing(M, spin=SPIN, width=0.06)",
  "",
  "        self.set_camera_orientation(phi=90 * DEGREES - INCL)",
  "        self.add(starfield(lensed=True), disk, horizon, ring)",
  "        self.begin_ambient_camera_rotation(rate=0.11)",
  "        self.play(Rotate(disk, TAU, run_time=6, rate_func=linear))",
];

const PY_KW: Record<string, number> = {
  from: 1, import: 1, as: 1, def: 1, class: 1, return: 1, self: 1, in: 1, for: 1,
  if: 1, else: 1, None: 1, True: 1, False: 1, with: 1, not: 1, and: 1, or: 1, lambda: 1,
};
const C_NUM = "#9a6a2f";
const C_PLAIN = "#57544e";
const PY_RE = /(#.*)|([A-Za-z_][A-Za-z_0-9]*)|(\d+\.?\d*)|(\s+)|([^])/g;

type Tok = [string, string, number];

function pyTok(line: string): Tok[] {
  const out: Tok[] = [];
  let m: RegExpExecArray | null;
  PY_RE.lastIndex = 0;
  while ((m = PY_RE.exec(line)) !== null) {
    if (m[1] != null) out.push([m[0], FAINT, 0]);
    else if (m[2] != null) {
      if (PY_KW[m[0]]) out.push([m[0], ACCENT, 1]);
      else if (line[PY_RE.lastIndex] === "(" || /^[A-Z]/.test(m[0])) out.push([m[0], INK, 1]);
      else out.push([m[0], C_PLAIN, 0]);
    } else if (m[3] != null) out.push([m[0], C_NUM, 0]);
    else out.push([m[0], C_PLAIN, 0]);
  }
  return out;
}

const CODE = CODE_SRC.map(pyTok);
// Character offset of each token within its line, so a row can be revealed
// without accumulating state across the render pass.
const CODE_TOK_OFF = CODE.map((toks) => {
  const o: number[] = [];
  let k = 0;
  for (const tk of toks) {
    o.push(k);
    k += tk[0].length;
  }
  return o;
});
const CODE_LEN = CODE_SRC.map((l) => l.length);
const CODE_OFF = (function () {
  const o: number[] = [];
  let k = 0;
  for (let i = 0; i < CODE_LEN.length; i++) {
    o.push(k);
    k += CODE_LEN[i] + 1;
  }
  return o;
})();
const CODE_CHARS = CODE_OFF[CODE_OFF.length - 1] + CODE_LEN[CODE_LEN.length - 1] + 1;

const PANE_L = 360;
const PANE_W = 900;
const CODE_TOP = 182;
const CODE_VIS = 360;
const CODE_LH = 30;

function CodeRow({ i, n }: { i: number; n: number }) {
  return (
    <div
      style={{
        height: CODE_LH,
        display: "flex",
        alignItems: "center",
        whiteSpace: "pre",
        font: "400 19px " + MONO,
        letterSpacing: "-0.01em",
      }}
    >
      <span
        style={{
          width: 62,
          flex: "0 0 auto",
          textAlign: "right",
          paddingRight: 20,
          boxSizing: "border-box",
          color: "#cdc8bc",
        }}
      >
        {i + 1}
      </span>
      <span>
        {CODE[i].map((tk, k) => {
          const take = Math.max(0, Math.min(n - CODE_TOK_OFF[i][k], tk[0].length));
          return take > 0 ? (
            <span key={k} style={{ color: tk[1], fontWeight: tk[2] ? 500 : 400 }}>
              {tk[0].slice(0, take)}
            </span>
          ) : null;
        })}
        {n < CODE_LEN[i] ? (
          <span
            style={{
              display: "inline-block",
              width: 9,
              height: 21,
              background: "rgba(59,98,224,0.5)",
              verticalAlign: -4,
            }}
          />
        ) : null}
      </span>
    </div>
  );
}

/* progressive reveal + auto-scroll: the caret line is kept near the bottom edge */
function CodePanel({ p, a, shift }: { p: number; a: number; shift: string }) {
  const shown = Math.round(clamp(p, 0, 1) * CODE_CHARS);
  const rows: { i: number; n: number }[] = [];
  let cur = 0;
  for (let i = 0; i < CODE.length; i++) {
    const n = shown - CODE_OFF[i];
    if (n <= 0) break;
    cur = i + (CODE_LEN[i] ? Math.min(1, n / CODE_LEN[i]) : 1);
    rows.push({ i: i, n: Math.min(n, CODE_LEN[i]) });
  }
  const vis = CODE_VIS / CODE_LH;
  const scroll = clamp(cur - (vis - 2.4), 0, Math.max(0, CODE.length - vis)) * CODE_LH;
  return (
    <div
      style={{
        position: "absolute",
        left: PANE_L,
        top: CODE_TOP,
        width: PANE_W,
        opacity: a,
        transform: shift,
        border: "1px solid " + RULE,
        borderRadius: 12,
        overflow: "hidden",
        background: "#fbfaf6",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 16px",
          background: "#f3f1ea",
          borderBottom: "1px solid " + RULE,
        }}
      >
        <span style={{ font: "400 15px " + MONO, color: FAINT }}>black_hole.py</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Icon d="M9 9h13v13H9zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" size={17} color={FAINT} w={1.8} />
          <Icon
            d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"
            size={17}
            color={FAINT}
            w={1.8}
          />
          <svg width="17" height="17" viewBox="0 0 24 24" fill={FAINT}>
            <polygon points="6 3 20 12 6 21" />
          </svg>
        </div>
      </div>
      <div style={{ height: CODE_VIS, overflow: "hidden", padding: "16px 0" }}>
        <div style={{ transform: "translateY(" + (-scroll).toFixed(1) + "px)" }}>
          {rows.map((r) => (
            <CodeRow key={r.i} i={r.i} n={r.n} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* composer centred → sent, with the prompt above and the file below */
function ChatPane({
  sent,
  code,
  typed,
  sendOn,
  press,
}: {
  sent: number;
  code: number;
  typed: number;
  sendOn: number;
  press: number;
}) {
  const s = Easing.easeInOutCubic(clamp(sent, 0, 1));
  const m = MOTION.enter(s, 18);
  return (
    <>
      {s > 0.002 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: PANE_L,
              top: 74,
              width: PANE_W,
              display: "flex",
              justifyContent: "flex-end",
              opacity: m.opacity,
              transform: m.transform,
            }}
          >
            <div
              style={{
                background: "rgba(59,98,224,0.07)",
                border: "1px solid #dfe4f7",
                borderRadius: 14,
                padding: "13px 20px",
                font: "400 23px " + BODY,
                color: INK,
                letterSpacing: "-0.01em",
              }}
            >
              {PROMPT_1}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: PANE_L,
              top: 150,
              display: "flex",
              alignItems: "center",
              gap: 11,
              opacity: m.opacity,
              transform: m.transform,
            }}
          >
            <Ring size={15} color={MUTE} />
            <span style={{ font: "500 16px " + MONO, color: FAINT, letterSpacing: "0.04em" }}>Manition</span>
          </div>
          <CodePanel p={code} a={m.opacity} shift={m.transform} />
        </>
      ) : null}
      <Composer
        rect={{ left: PANE_L, top: 284 + 326 * s, width: PANE_W, height: 96 - 12 * s }}
        text={PROMPT_1}
        typed={s > 0.45 ? 0 : typed}
        sendOn={sendOn * (1 - s)}
        press={press}
      />
    </>
  );
}

function VideoCard({
  rect,
  title,
  dur,
  pen,
  swap,
  scrub,
  playing,
  phase,
  wipe,
}: {
  rect: Rect;
  title: string;
  dur: number;
  pen: number;
  swap: number;
  scrub: number;
  playing: boolean;
  phase: number;
  wipe?: number;
}) {
  const secs = Math.round(clamp(scrub, 0, 1) * dur);
  const tw = seg(swap, 0.44, 0.6);
  const wp = wipe == null ? -1 : clamp(wipe, 0, 1);
  const chips = wp >= 0 ? band(wp, 0.02, 0.13, 0.88, 0.99) : 0;
  const chipS: CSSProperties = {
    position: "absolute",
    top: 16,
    padding: "6px 12px",
    borderRadius: 7,
    background: "rgba(8,8,12,0.62)",
    border: "1px solid rgba(255,236,206,0.22)",
    font: "500 15px " + MONO,
    letterSpacing: "0.14em",
    color: "#ffe6bd",
    textTransform: "uppercase",
  };
  return (
    <div style={{ position: "absolute", left: rect.left, top: rect.top, width: rect.width }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ position: "relative", font: "500 19px " + MONO, color: MUTE, whiteSpace: "nowrap" }}>
          <span style={{ opacity: 1 - tw }}>blackhole_lensing.mp4</span>
          <span style={{ position: "absolute", left: 0, top: 0, opacity: tw }}>{title}</span>
        </div>
        <div style={{ font: "400 16px " + MONO, color: FAINT, whiteSpace: "nowrap" }}>{"1080p · " + clk(dur)}</div>
      </div>
      <div
        style={{
          position: "relative",
          width: rect.width,
          height: rect.height,
          borderRadius: 12,
          overflow: "hidden",
          background: SCREEN,
          border: "1px solid #1c2030",
        }}
      >
        <BlackHolePlate pen={pen} sweep={wp >= 0 ? 0 : swap} phase={phase} style={PLATE_FILL} />
        {wp > 0 ? (
          <div style={{ position: "absolute", inset: 0, clipPath: "inset(0 " + ((1 - wp) * 100).toFixed(2) + "% 0 0)" }}>
            <BlackHolePlate pen={pen} sweep={1} phase={phase} style={PLATE_FILL} />
          </div>
        ) : null}
        {chips > 0.004 ? (
          <>
            <div style={{ ...chipS, left: 18, opacity: chips * seg(wp, 0.05, 0.16) }}>after</div>
            <div style={{ ...chipS, right: 18, opacity: chips * (1 - seg(wp, 0.85, 0.95)) }}>before</div>
          </>
        ) : null}
        {wp > 0.002 && wp < 0.998 ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: (wp * 100).toFixed(2) + "%",
              width: 2,
              marginLeft: -1,
              background: "rgba(255,247,232,0.92)",
              boxShadow: "0 0 26px 7px rgba(255,190,104,0.4)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: -18,
                width: 36,
                height: 36,
                marginTop: -18,
                borderRadius: 18,
                background: "rgba(10,9,13,0.74)",
                border: "1px solid rgba(255,240,214,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff3dd"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.5 6l-4 6 4 6M14.5 6l4 6-4 6" />
              </svg>
            </div>
          </div>
        ) : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 16 }}>
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill={INK}>
            <rect x="5" y="4" width="4.5" height="16" rx="1.2" />
            <rect x="14.5" y="4" width="4.5" height="16" rx="1.2" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill={INK}>
            <polygon points="6 4 20 12 6 20" />
          </svg>
        )}
        <div style={{ flex: 1, height: 4, borderRadius: 3, background: "#e6e2d8", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: clamp(scrub, 0, 1) * 100 + "%",
              borderRadius: 3,
              background: ACCENT,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: clamp(scrub, 0, 1) * 100 + "%",
              top: -4,
              width: 12,
              height: 12,
              borderRadius: 6,
              background: PANEL,
              border: "1px solid " + RULE,
              transform: "translateX(-6px)",
            }}
          />
        </div>
        <div style={{ font: "400 16px " + MONO, color: FAINT, whiteSpace: "nowrap" }}>
          {clk(secs) + " / " + clk(dur)}
        </div>
      </div>
    </div>
  );
}

/* one window, three states — every scene can render the outgoing and incoming state */
function AppWindow({
  a,
  breath,
  title,
  swap,
  children,
}: {
  a: number;
  breath?: number;
  title?: string;
  swap?: number;
  children?: ReactNode;
}) {
  if (a <= 0.002) return null;
  const s = 1 + 0.016 * (breath || 0);
  return (
    <div
      style={{
        position: "absolute",
        left: WIN.left,
        top: WIN.top,
        width: WIN.width,
        height: WIN.height,
        background: PANEL,
        border: "1px solid " + EDGE,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 44px 90px -44px rgba(34,31,26,0.30)",
        opacity: a,
        transform: "scale(" + s + ")",
        transformOrigin: "50% 46%",
      }}
    >
      <Chrome title={title} swap={swap}>
        {children}
      </Chrome>
    </div>
  );
}

const inWin = (r: Rect): Rect => ({ left: r.left - WIN.left, top: r.top - WIN.top, width: r.width, height: r.height });

/* ── virtual camera ───────────────────────────────────────────────── */
/* A shot is a framing of the 1920×1080 stage: z = zoom (1 = whole frame),
   cx/cy = the stage point held at frame centre, dur = length of the move INTO
   this shot, push/dx/dy = the slow drift applied while the shot is held. */
const DRIFT = 4.5;

type Shot = {
  t: number;
  z: number;
  cx: number;
  cy: number;
  dur?: number;
  ease?: Ease;
  push?: number;
  dx?: number;
  dy?: number;
  span?: number;
};
type Cam = { z: number; cx: number; cy: number };

/* The drift ramps in and then holds a CONSTANT rate — an ease that decays to
   zero parks the camera, and a parked camera that then re-accelerates is what
   reads as jitter frame by frame. Its span is stretched past the shot's own
   length too, so the outgoing shot is still moving when the next move takes
   over: position and velocity both stay continuous across every handoff. */
const DRIFT_K = (x: number) => (x < 0.12 ? (x * x) / 0.24 : x - 0.06);

function shotAt(s: Shot, t: number, nextT: number | null): Cam {
  const span = Math.max(s.span || DRIFT, nextT == null ? 0 : (nextT - s.t) * 1.35);
  const k = DRIFT_K(clamp((t - s.t) / span, 0, 1));
  return {
    z: s.z * (1 + (s.push || 0) * k),
    cx: s.cx + (s.dx || 0) * k,
    cy: s.cy + (s.dy || 0) * k,
  };
}

/* a physical settle: ease-out that overshoots ~1.4% and damps back in */
const EASE_SETTLE: Ease = (p) => (1 - Math.exp(-4 * p) * Math.cos(3.6 * p)) / 1.016424;
const paraCam = (cam: Cam, k: number): Cam => ({
  z: 1 + (cam.z - 1) * k,
  cx: 960 + (cam.cx - 960) * k,
  cy: 540 + (cam.cy - 540) * k,
});

function camAt(shots: Shot[], t: number): Cam {
  let i = 0;
  while (i + 1 < shots.length && t >= shots[i + 1].t) i++;
  const s = shots[i];
  const nx = shots[i + 1] ? shots[i + 1].t : null;
  const to = shotAt(s, t, nx);
  if (i === 0) return to;
  const from = shotAt(shots[i - 1], t, s.t);
  const e = (s.ease || Easing.easeInOutCubic)(seg(t, s.t, s.t + (s.dur == null ? 0.5 : s.dur)));
  const wa = 1920 / from.z,
    wb = 1920 / to.z;
  return {
    z: 1920 / (wa + (wb - wa) * e),
    cx: from.cx + (to.cx - from.cx) * e,
    cy: from.cy + (to.cy - from.cy) * e,
  };
}

/* the chat pane with the sidebar cropped out — the workhorse medium shot */
const F_MAIN = { z: 1.75, cx: 1091, cy: 555 };

function Camera({ cam, children }: { cam: Cam; children?: ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: "0 0",
        // sub-pixel precision: at these zooms a 1e-4 scale step is a tenth of a
        // pixel at the frame edge — the same size as one frame of a slow drift
        transform:
          "translate(" +
          (960 - cam.z * cam.cx).toFixed(4) +
          "px," +
          (540 - cam.z * cam.cy).toFixed(4) +
          "px) scale(" +
          cam.z.toFixed(6) +
          ")",
      }}
    >
      {children}
    </div>
  );
}

/* ── the cursor ───────────────────────────────────────────────────── */

type CursorKey = { t: number; x: number; y: number };

function posAt(path: CursorKey[], t: number) {
  let x = path[0].x,
    y = path[0].y;
  for (let i = 0; i < path.length - 1; i++) {
    const A = path[i],
      B = path[i + 1];
    if (t >= B.t) {
      x = B.x;
      y = B.y;
      continue;
    }
    if (t > A.t) {
      const e = Easing.easeInOutCubic(seg(t, A.t, B.t));
      x = A.x + (B.x - A.x) * e;
      y = A.y + (B.y - A.y) * e;
      break;
    }
  }
  return { x: x, y: y };
}

const POINTER_D = "M1 1 L1 16.4 L5.1 12.7 L7.9 19.6 L10.9 18.3 L8.1 11.5 L13.6 11.2 Z";
const TRAIL = [
  [0.035, 0.2, 0.88],
  [0.075, 0.1, 0.76],
];

function Pointer({ k, o, ghost }: { k: number; o: number; ghost?: boolean }) {
  return (
    <svg
      width="42"
      height="52"
      viewBox="0 0 17 21"
      style={{
        position: "absolute",
        left: -4,
        top: -3,
        opacity: o,
        transform: "scale(" + k.toFixed(3) + ")",
        transformOrigin: "15% 12%",
        filter: ghost ? "none" : "drop-shadow(0 3px 8px rgba(30,28,24,0.34))",
      }}
    >
      <path d={POINTER_D} fill={INK} stroke={ghost ? "none" : "#ffffff"} strokeWidth={ghost ? 0 : 1.3} strokeLinejoin="round" />
    </svg>
  );
}

/* zoom-aware: the pointer grows with a push-in, but far less than the frame does */
function Cursor({
  path,
  t,
  clicks,
  a,
  zoom,
}: {
  path: CursorKey[];
  t: number;
  clicks?: number[];
  a: number;
  zoom?: number;
}) {
  if (a <= 0.002 || !path.length) return null;
  const p = posAt(path, t);
  const k = Math.pow(clamp(zoom || 1, 0.6, 4), -0.55);
  const back = posAt(path, t - 0.05);
  const moving = clamp(Math.hypot(p.x - back.x, p.y - back.y) / 0.05 / 380, 0, 1);
  let press = 0,
    pulse = 0;
  const rings: { i: number; r: number; o: number }[] = [];
  (clicks || []).forEach((ct, i) => {
    press = Math.max(press, band(t, ct, ct + 0.05, ct + 0.09, ct + 0.19));
    pulse = Math.max(pulse, band(t, ct + 0.14, ct + 0.24, ct + 0.3, ct + 0.5));
    const rp = seg(t, ct, ct + 0.46);
    if (rp > 0 && rp < 1) rings.push({ i: i, r: (9 + 34 * Easing.easeOutCubic(rp)) * k, o: (1 - rp) * 0.42 });
  });
  const kk = k * (1 - 0.17 * press + 0.09 * pulse);
  return (
    <>
      {moving > 0.05
        ? TRAIL.map((g, i) => {
            const q = posAt(path, t - g[0]);
            return (
              <div key={i} style={{ position: "absolute", left: q.x, top: q.y }}>
                <Pointer k={k * g[2]} o={a * moving * g[1]} ghost />
              </div>
            );
          })
        : null}
      <div style={{ position: "absolute", left: p.x, top: p.y }}>
        {rings.map((r) => (
          <div
            key={r.i}
            style={{
              position: "absolute",
              left: -r.r,
              top: -r.r,
              width: r.r * 2,
              height: r.r * 2,
              borderRadius: "50%",
              border: (2 * k).toFixed(2) + "px solid " + ACCENT,
              opacity: r.o,
            }}
          />
        ))}
        <Pointer k={kk} o={a} />
      </div>
    </>
  );
}

/* ── the wall of real renders ─────────────────────────────────────── */

/* five columns of renders drifting at different speeds — a library, not a grid.
   Cards with gutters on the film's own paper, so the gallery is a section of
   this video rather than a dark reel spliced into it. */
const MARGIN = 40,
  GAP = 28,
  NCOL = 5;
const CW = (1920 - MARGIN * 2 - GAP * (NCOL - 1)) / NCOL;
const CH = CW * 0.625;
const PITCH = CH + GAP;
const COL_X = [0, 1, 2, 3, 4].map((i) => MARGIN + i * (CW + GAP));
const COL_V = [38, -54, 47, -61, 42];
const COL_PH = [0, 96, 44, 138, 72];
/* twelve renders, each column a different rotation so no row ever twins */
const DECK = [
  "nebula", "attractor", "fluid", "burst", "terrain", "mandel",
  "neural", "lorenz", "julia", "turing", "apollonian", "fern",
];
const COL_SEQ = [0, 1, 2, 3, 4].map((c) => DECK.map((_, i) => DECK[(i + c * 5) % DECK.length]));
const CYC = DECK.length * PITCH;
const wrapPos = (a: number) => (((a % CYC) + CYC) % CYC) - PITCH;

/* Stable element per tile so the wall's per-frame re-render never re-creates
   (and so never re-decodes) an <img>. */
const TILE_IMG: Record<string, ReactElement> = {};
for (const name of Object.keys(TILES)) {
  TILE_IMG[name] = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={TILES[name]}
      alt=""
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}

/* camera-locked, so the grid pushes with the shot. Each tile softens and settles
   toward the paper by its distance from centre. `build` (a clock) populates them
   in on a diagonal instead of cutting in. */
function Wall({ t, a, build }: { t: number; a: number; build?: number }) {
  if (a <= 0.002) return null;
  return (
    <>
      {COL_SEQ.map((sq, c) => {
        const off = COL_V[c] * t;
        const dx = (COL_X[c] + CW / 2 - 960) / 960;
        return (
          <div key={c} style={{ position: "absolute", left: COL_X[c], top: 0, width: CW, height: 1080 }}>
            {sq.map((n, j) => {
              const y = wrapPos(j * PITCH - off - PITCH + COL_PH[c]);
              if (y > 1090 || y < -PITCH) return null;
              const dy = (y + CH / 2 - 540) / 540;
              const r = Math.hypot(dx, dy * 0.9);
              const bl = clamp((r - 0.5) * 2.8, 0, 1.8);
              const fade = 1 - clamp((r - 0.46) * 0.42, 0, 0.24);
              const d0 = 0.08 + c * 0.06 + clamp((y + PITCH) / (1080 + PITCH * 2), 0, 1) * 0.36;
              const p = build == null ? 1 : seg(build, d0, d0 + 0.22);
              if (p <= 0.002) return null;
              const s = MOTION.settle(p);
              return (
                <div
                  key={j}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: CW,
                    height: CH,
                    transform:
                      "translateY(" + (y + (1 - s) * 15).toFixed(1) + "px) scale(" + (0.9 + 0.1 * s).toFixed(4) + ")",
                    opacity: a * fade * p,
                    borderRadius: 12,
                    overflow: "hidden",
                    background: SCREEN,
                    border: "1px solid rgba(22,22,26,0.10)",
                    boxShadow: "0 16px 34px -22px rgba(34,31,26,0.42)",
                    filter: bl > 0.01 ? "blur(" + bl.toFixed(2) + "px)" : "none",
                  }}
                >
                  {TILE_IMG[n]}
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

/* frame-locked finish: the paper closing back over the top and bottom of the
   scroll, plus a soft well under the closing line so it never fights a tile */
function Veil({ a, well }: { a: number; well?: number }) {
  if (a <= 0.002) return null;
  const fadeTo = (dir: string, px: number, mid: number): CSSProperties => ({
    position: "absolute",
    left: 0,
    right: 0,
    height: px,
    background:
      "linear-gradient(to " + dir + ", " + PAPER + " 0%, rgba(247,246,243," + mid + ") 38%, rgba(247,246,243,0) 100%)",
  });
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      <div style={{ top: 0, ...fadeTo("bottom", 112, 0.5) }} />
      <div style={{ bottom: 0, ...fadeTo("top", 196, 0.58) }} />
      {well != null && well > 0.002 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: well,
            background:
              "radial-gradient(56% 33% at 50% 97%, rgba(247,246,243,0.95) 0%, rgba(247,246,243,0.74) 44%, rgba(247,246,243,0) 78%)",
          }}
        />
      ) : null}
    </div>
  );
}

/* ══ SCENES ══════════════════════════════════════════════════════════ */

function Wrap({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div data-screen-label={label} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {children}
    </div>
  );
}

/* laid out at fixed x so the camera can frame one phrase at a time */
const OPEN = [
  { text: "Some things", x: 194, at: 0.05 },
  { text: "only make sense", x: 722, at: 1.35 },
  { text: "moving.", x: 1410, at: 2.55, accent: true },
];

function OpenLine({ t, a }: { t: number; a: number }) {
  if (a <= 0.001) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      {OPEN.map((w, i) => {
        const m = MOTION.enter(seg(t, w.at, w.at + 0.7), 16);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: w.x,
              top: 486,
              whiteSpace: "pre",
              font: "500 88px " + DISP,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: w.accent ? ACCENT : INK,
              opacity: m.opacity,
              transform: m.transform,
            }}
          >
            {w.text}
          </div>
        );
      })}
    </div>
  );
}

/* 01 — cold open: one continuous pull-back, drifting from frame one */
const CAM_H: Shot[] = [
  { t: 0, z: 2.72, cx: 438, cy: 506, dur: 0, push: 0.055, dx: -32, dy: 22, span: 1.5 },
  { t: 1.15, z: 1.39, cx: 790, cy: 528, dur: 1.05, ease: EASE_SETTLE, push: 0.032, dx: 26, dy: -12, span: 1.2 },
  { t: 2.45, z: 1.0, cx: 960, cy: 540, dur: 1.1, ease: EASE_SETTLE, push: 0.018, dx: 12, dy: 6, span: 2.4 },
];

function Hook({ localTime: t }: SceneProps) {
  const cam = camAt(CAM_H, t);
  const a = camAt(CAM_H, t - 0.05),
    b = camAt(CAM_H, t + 0.05);
  const vel = Math.abs(b.z - a.z) * 11.5 + Math.hypot(b.cx - a.cx, b.cy - a.cy) * 0.032;
  /* rack focus: opens soft, resolves as the move settles, smears while travelling */
  const blur = clamp(vel * 1.25 + 4.2 * (1 - Easing.easeOutCubic(seg(t, 0.02, 0.95))), 0, 5.4);
  return (
    <Wrap label={"01 Hook · " + Math.floor(t) + "s"}>
      <Field />
      <div style={{ position: "absolute", inset: 0, filter: "blur(" + (blur * 1.7 + 0.9).toFixed(2) + "px)" }}>
        <Camera cam={paraCam(cam, 0.16)}>
          <Grain o={0.5} />
        </Camera>
      </div>
      <div style={{ position: "absolute", inset: 0, filter: "blur(" + (blur * 1.15 + 0.35).toFixed(2) + "px)" }}>
        <Camera cam={paraCam(cam, 0.52)}>
          <Grain o={0.62} />
        </Camera>
      </div>
      <div style={{ position: "absolute", inset: 0, filter: blur > 0.03 ? "blur(" + blur.toFixed(2) + "px)" : "none" }}>
        <Camera cam={cam}>
          <OpenLine t={t} a={1} />
        </Camera>
      </div>
    </Wrap>
  );
}

/* 02 — the name, and what it is for */
function Brand({ localTime: t }: SceneProps) {
  return (
    <Wrap label={"02 Brand · " + Math.floor(t) + "s"}>
      <Field />
      <Grain />
      <OpenLine t={99} a={1 - seg(t, 0.1, 0.8)} />
      <Wordmark p={seg(t, 0.7, 2.1)} size={118} top={424} opacity={seg(t, 0.7, 1.3)} />
      <Line text="Say what you want to see." a={seg(t, 2.1, 2.9)} top={604} size={40} />
    </Wrap>
  );
}

/* 03 — describe it */
const CUR_A: CursorKey[] = [
  { t: 0, x: 1560, y: 960 },
  { t: 2.05, x: 1000, y: 530 },
  { t: 2.6, x: 1000, y: 530 },
  { t: 4.9, x: 1000, y: 530 },
  { t: 5.25, x: 1499, y: 530 },
];
/* establish → tight on the input → onto send → into the file, panning as it writes */
const CAM_A: Shot[] = [
  { t: 0, z: 1.0, cx: 960, cy: 540, push: 0.05, span: 1.7 },
  { t: 1.6, z: 2.06, cx: 1050, cy: 545, dur: 0.8, push: 0.05, dx: 16, span: 3.0 },
  { t: 4.8, z: 1.95, cx: 1145, cy: 545, dur: 0.5 },
  { t: 5.9, z: 1.5, cx: 1090, cy: 430, dur: 0.62, push: 0.05, dy: 130, span: 2.8 },
];

function Describe({ localTime: t }: SceneProps) {
  const out = seg(t, 0.05, 0.5);
  const shown = seg(t, 0.4, 1.2);
  const sent = seg(t, 5.85, 6.5);
  const cam = camAt(CAM_A, t);
  return (
    <Wrap label={"03 Describe · " + Math.floor(t) + "s"}>
      <Field />
      <Grain o={1 - out} />
      <Wordmark p={1} size={118} top={424} opacity={1 - out} />
      <Line text="Say what you want to see." a={1 - out} top={604} size={40} />

      <Camera cam={cam}>
        <AppWindow a={shown} swap={sent}>
          <ChatPane
            sent={sent}
            code={seg(t, 6.05, 8.8)}
            typed={seg(t, 2.5, 4.7)}
            sendOn={seg(t, 5.45, 5.7)}
            press={band(t, 5.4, 5.48, 5.54, 5.66)}
          />
        </AppWindow>
        <Cursor path={CUR_A} t={t} clicks={[2.35, 5.4]} a={shown} zoom={cam.z} />
      </Camera>
    </Wrap>
  );
}

/* 04 — watch it draw itself */
const CUR_B: CursorKey[] = [
  { t: 0, x: 1499, y: 530 },
  { t: 3.0, x: 668, y: 757 },
  { t: 3.5, x: 668, y: 757 },
  { t: 5.2, x: 1310, y: 700 },
];
/* pull out of scene 03's framing → onto the player + play button → then locked
   off for the whole render: the only thing moving in frame is the black hole's
   own camera. Nothing pans, pushes or drifts until the shot releases. */
const CAM_B: Shot[] = [
  { t: 0, z: 1.575, cx: 1090, cy: 560 },
  { t: 0.15, z: 1.0, cx: 960, cy: 540, dur: 0.85, push: 0.05 },
  { t: 2.55, z: F_MAIN.z, cx: F_MAIN.cx, cy: F_MAIN.cy, dur: 0.55 },
  { t: 3.5, z: 1.76, cx: 1090, cy: 486, dur: 0.62 },
  { t: 15.9, z: 1.22, cx: 960, cy: 540, dur: 0.95, push: 0.03 },
];

function Watch({ localTime: t }: SceneProps) {
  const out = seg(t, 0.1, 0.7);
  const shown = seg(t, 2.5, 3.3);
  const pen = MOTION.draw(seg(t, 3.6, 8.4)); /* matter streams out, light comes up */
  const phase = Math.max(0, t - 3.6) * 0.16; /* and then it just keeps turning */
  const cam = camAt(CAM_B, t);
  return (
    <Wrap label={"04 Watch · " + Math.floor(t) + "s"}>
      <Field />
      <Camera cam={cam}>
        <AppWindow a={1 - out} swap={1}>
          <ChatPane sent={1} code={1} typed={0} sendOn={0} press={0} />
        </AppWindow>
      </Camera>
      <Callout
        phrases={[
          ["Watch it", 0.75],
          ["draw itself.", 1.2],
        ]}
        t={t}
        a={band(t, 0.7, 1.4, 2.4, 3.1)}
        size={64}
      />
      <Camera cam={cam}>
        <AppWindow a={shown} swap={1}>
          <VideoCard
            rect={inWin(VIDEO)}
            title="blackhole_lensing.mp4"
            dur={12}
            swap={0}
            pen={pen}
            scrub={seg(t, 3.6, 15.4)}
            playing={t > 3.6 && t < 15.4}
            phase={phase}
          />
        </AppWindow>
        <Cursor
          path={CUR_B}
          t={t}
          clicks={[3.5]}
          a={Math.max(1 - seg(t, 0.15, 0.75), Math.min(shown, 1 - seg(t, 5.6, 6.2)))}
          zoom={cam.z}
        />
      </Camera>
    </Wrap>
  );
}

/* 05 — ask for a change */
const CUR_C: CursorKey[] = [
  { t: 0, x: 1310, y: 700 },
  { t: 3.0, x: 980, y: 773 },
  { t: 3.5, x: 980, y: 773 },
  { t: 5.2, x: 980, y: 773 },
  { t: 5.42, x: 1499, y: 773 },
];
const FOLLOW = { left: 640, top: 700, width: 900, height: 88 };
const PLAYER = { left: VIDEO.left, top: 244, width: VIDEO.width, height: 336 };
/* pull out → re-establish → tight on the follow-up field → onto send → and then
   a long push into the player as the new render wipes across it */
const CAM_C: Shot[] = [
  { t: 0, z: 1.22, cx: 960, cy: 540 },
  { t: 0.2, z: 1.0, cx: 960, cy: 540, dur: 0.7, push: 0.04 },
  { t: 2.5, z: 1.18, cx: 960, cy: 556, dur: 0.45, push: 0.02, span: 2.2 },
  { t: 3.0, z: 2.05, cx: 1080, cy: 645, dur: 0.55, push: 0.05, span: 3.0 },
  { t: 5.35, z: 1.7, cx: 1100, cy: 600, dur: 0.55, push: 0.025, dy: -10, span: 2.4 },
  { t: 6.4, z: 1.58, cx: 1090, cy: 492, dur: 0.75, ease: EASE_SETTLE, push: 0.085, dy: -12, span: 4.4 },
  { t: 11.0, z: 1.86, cx: 1074, cy: 446, dur: 1.25, push: 0.026, dx: 16, span: 3.4 },
  { t: 13.7, z: 1.72, cx: 1085, cy: 470, dur: 1.0 },
];

function Refine({ localTime: t }: SceneProps) {
  const out = seg(t, 0.1, 0.7);
  const shown = seg(t, 2.4, 3.1);
  const wipe = Easing.easeInOutCubic(seg(t, 6.6, 8.9)); /* the new render sweeps across the old */
  const done = seg(t, 8.6, 9.2);
  const phase = 2.14 + t * 0.115; /* the disk never stops turning */
  const cam = camAt(CAM_C, t);
  return (
    <Wrap label={"05 Refine · " + Math.floor(t) + "s"}>
      <Field />
      <Camera cam={cam}>
        <AppWindow a={1 - out} swap={1}>
          <VideoCard
            rect={inWin(VIDEO)}
            title="blackhole_lensing.mp4"
            dur={12}
            swap={0}
            pen={1}
            scrub={1}
            playing={false}
            phase={phase}
          />
        </AppWindow>
      </Camera>
      <Callout
        phrases={[
          ["Ask for", 0.7],
          ["a change.", 1.15],
        ]}
        t={t}
        a={band(t, 0.65, 1.35, 2.3, 3.0)}
        size={64}
      />
      <Camera cam={cam}>
        <AppWindow a={shown} swap={1}>
          <VideoCard
            rect={inWin(PLAYER)}
            title="blackhole_fast_orbit.mp4"
            dur={done > 0.5 ? 9 : 12}
            swap={done}
            pen={1}
            scrub={clamp(0.1 + (t - 3) * 0.052, 0, 1)}
            playing
            phase={phase}
            wipe={wipe}
          />
          <Composer
            rect={inWin(FOLLOW)}
            text={PROMPT_2}
            typed={seg(t, 3.65, 5.15)}
            sendOn={seg(t, 5.75, 5.95)}
            press={band(t, 5.7, 5.78, 5.84, 5.96)}
          />
        </AppWindow>
        <Cursor path={CUR_C} t={t} clicks={[3.5, 5.7]} a={shown} zoom={cam.z} />
      </Camera>
    </Wrap>
  );
}

/* 06 — the payoff: anything you can say */
const CAM_D: Shot[] = [
  { t: 0, z: 1.72, cx: 1085, cy: 470 },
  { t: 0.1, z: 1.0, cx: 960, cy: 540, dur: 0.8, push: 0.035 },
];

/* the window dissolves under tiles that populate in on a diagonal while the
   camera pulls back — the grid settles into view instead of snapping on */
function Anything({ localTime: t }: SceneProps) {
  const out = Easing.easeInOutCubic(seg(t, 0.42, 0.95));
  const cam = camAt(CAM_D, t);
  return (
    <Wrap label={"06 Anything · " + Math.floor(t) + "s"}>
      <Field />
      <Camera cam={cam}>
        <AppWindow a={1 - out} swap={1}>
          <VideoCard
            rect={inWin(PLAYER)}
            title="blackhole_fast_orbit.mp4"
            dur={9}
            swap={1}
            pen={1}
            scrub={0.72}
            playing
            phase={3.82 + t * 0.115}
          />
          <Composer rect={inWin(FOLLOW)} text={PROMPT_2} typed={1} sendOn={1} press={0} />
        </AppWindow>
        <Cursor path={[{ t: 0, x: 1499, y: 773 }]} t={t} clicks={[]} a={1 - seg(t, 0.1, 0.6)} zoom={cam.z} />
        <Wall t={t} a={1} build={t} />
      </Camera>
      <Veil a={1} well={seg(t, 1.7, 2.4)} />
      <Callout
        phrases={[
          ["Anything", 2.0],
          ["you can say.", 2.45],
        ]}
        t={t}
        a={seg(t, 1.95, 2.7)}
        size={54}
        top={932}
        rise={1.95}
      />
    </Wrap>
  );
}

/* 07 — end card */
const CAM_E: Shot[] = [{ t: 0, z: 1.034, cx: 960, cy: 540, dur: 0, push: 0.02 }];

/* the paper never changes — the grid breathes out and dissolves as the name
   fades up through it, so the close has no background swap and no bare frame */
function Close({ localTime: t }: SceneProps) {
  const out = Easing.easeInOutCubic(seg(t, 1.15, 2.15));
  return (
    <Wrap label={"07 Close · " + Math.floor(t) + "s"}>
      <Field />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 1 - out,
          transform: "scale(" + (1 + 0.035 * out).toFixed(4) + ")",
          transformOrigin: "50% 46%",
        }}
      >
        <Camera cam={camAt(CAM_E, t)}>
          <Wall t={t + 4.6} a={1} />
        </Camera>
        <Veil a={1} well={1} />
        <Callout
          phrases={[
            ["Anything", 0],
            ["you can say.", 0],
          ]}
          t={99}
          a={1 - seg(t, 0.1, 0.75)}
          size={54}
          top={932}
        />
      </div>
      <Wordmark p={seg(t, 1.55, 3.15)} size={118} top={470} opacity={seg(t, 1.5, 2.1)} />
    </Wrap>
  );
}

const SCENES: SceneDef[] = [
  { name: "Hook", dur: 4, nat: 3.8 },
  { name: "Brand", dur: 4.2 },
  { name: "Describe", dur: 9.2 },
  { name: "Watch", dur: 10 },
  { name: "Refine", dur: 8 },
  { name: "Anything", dur: 4.6 },
  { name: "Close", dur: 4 },
];

const COMPONENTS = { Hook, Brand, Describe, Watch, Refine, Anything, Close };

export default function ManitionDemo() {
  return <SceneStage width={1920} height={1080} scenes={SCENES} bg={PAPER} components={COMPONENTS} />;
}
