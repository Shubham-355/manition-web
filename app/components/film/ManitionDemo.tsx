"use client";

import type { CSSProperties, ReactElement, ReactNode } from "react";
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
const R_BLUE = "#7ea6d9";
const R_GOLD = "#ffd98a";

const MOTION = {
  enter: (p: number, dy?: number): CSSProperties => ({
    opacity: clamp(p, 0, 1),
    transform:
      "translateY(" +
      (1 - Easing.easeOutCubic(clamp(p, 0, 1))) * (dy == null ? 22 : dy) +
      "px)",
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

function Wordmark({
  p,
  size,
  top,
  opacity,
}: {
  p: number;
  size: number;
  top: number;
  opacity: number;
}) {
  const s = MOTION.settle(p);
  const ls = 0.29 * size * (1 - s) - 0.03 * size * s;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        textAlign: "center",
        opacity,
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
          "translateY(" +
          ((1 - r) * 26).toFixed(2) +
          "px) scale(" +
          (0.964 + 0.036 * r).toFixed(4) +
          ")",
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
}: {
  text: string;
  a: number;
  top: number;
  size?: number;
}) {
  if (a <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        textAlign: "center",
        opacity: a,
        font: "400 " + (size || 38) + "px " + BODY,
        color: MUTE,
        letterSpacing: "-0.01em",
      }}
    >
      {text}
    </div>
  );
}

/* integrated once at load, resampled to even arc length so the head draws at a
   constant screen speed and the polyline stays smooth on the fast outer swings */
type Vec3 = [number, number, number];

const LZ_PTS: Vec3[] = (() => {
  const s = 10,
    r = 28,
    b = 8 / 3,
    dt = 0.002,
    STEPS = 10000,
    GAP = 1.15;
  const f = (p: Vec3): Vec3 => [
    s * (p[1] - p[0]),
    p[0] * (r - p[2]) - p[1],
    p[0] * p[1] - b * p[2],
  ];
  const step = (p: Vec3, k: Vec3, h: number): Vec3 => [
    p[0] + k[0] * h,
    p[1] + k[1] * h,
    p[2] + k[2] * h,
  ];
  let q: Vec3 = [-8, 7, 27];
  let last = q; /* starts on the attractor - no transient */
  const out: Vec3[] = [q];
  for (let i = 0; i < STEPS; i++) {
    const k1 = f(q),
      k2 = f(step(q, k1, dt / 2)),
      k3 = f(step(q, k2, dt / 2)),
      k4 = f(step(q, k3, dt));
    const prev = q;
    q = [0, 1, 2].map(
      (j) => prev[j] + (dt / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]),
    ) as Vec3;
    if (Math.hypot(q[0] - last[0], q[1] - last[1], q[2] - last[2]) >= GAP) {
      out.push(q);
      last = q;
    }
  }
  return out;
})();
const LZ_N = LZ_PTS.length;
const LZ_TILT = 0.3;
const LZ_COL = ["#4a6fae", "#5f8ad0", "#7ea6d9", "#9dbde0", "#dcc9a4", R_GOLD];
const LZ_OP = [0.5, 0.62, 0.74, 0.86, 0.95, 1];

const LZ_S = 18; /* one scale for both axes - the wings must stay circular */

/* the view turns the wings toward the camera; on the attractor y ≈ x, so turning
   the other way would flatten it into a line */
function lzProject(th: number) {
  const ct = Math.cos(th),
    st = Math.sin(th),
    cf = Math.cos(LZ_TILT),
    sf = Math.sin(LZ_TILT);
  return (p: Vec3): [number, number] => {
    const xr = p[0] * ct - p[1] * st;
    const yr = p[0] * st + p[1] * ct;
    return [800 + (xr + 1.12) * LZ_S, 380 - ((p[2] - 25) * cf - yr * sf - 1.5) * LZ_S];
  };
}

function lzPath(
  proj: (p: Vec3) => [number, number],
  from: number,
  to: number,
  stride?: number,
) {
  const k = stride || 1;
  let d = "";
  for (let i = from; i <= to; i += k) {
    const q = proj(LZ_PTS[i]);
    d += (d ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1);
  }
  if ((to - from) % k) {
    const q = proj(LZ_PTS[to]);
    d += "L" + q[0].toFixed(1) + " " + q[1].toFixed(1);
  }
  return d;
}

function LorenzPlate({
  pen,
  preview,
  sweep,
  style,
}: {
  pen: number;
  preview: number;
  sweep: number;
  style: CSSProperties;
}) {
  const p = clamp(pen || 0, 0, 1);
  const sw = clamp(sweep || 0, 0, 1);
  const cw = seg(sw, 0.44, 0.6);
  const proj = lzProject(-0.15 - 0.75 * p); /* slow turn that opens the wings up */
  const head = Math.max(1, Math.round(p * (LZ_N - 1)));
  const chunks: { i: number; d: string; g: string }[] = [];
  for (let i = 0; i < 6; i++) {
    const a = Math.floor((head * i) / 6);
    const b = Math.min(head, Math.floor((head * (i + 1)) / 6) + 1);
    if (b - a > 1) chunks.push({ i, d: lzPath(proj, a, b), g: lzPath(proj, a, b, 3) });
  }
  const hd = proj(LZ_PTS[head]);
  const drawn = p > 0.004;
  return (
    <svg viewBox="0 0 1600 760" style={{ position: "absolute", ...style }}>
      {preview > 0 ? (
        <path
          d={lzPath(proj, 0, LZ_N - 1, 2)}
          fill="none"
          stroke={R_BLUE}
          strokeWidth={2.4}
          strokeDasharray="2 20"
          strokeLinecap="round"
          opacity={preview * 0.2}
        />
      ) : null}
      {drawn
        ? chunks.map((c) => (
            <path
              key={"g" + c.i}
              d={c.g}
              fill="none"
              stroke={LZ_COL[c.i]}
              strokeWidth={16}
              opacity={0.09 * LZ_OP[c.i] * (1 - 0.22 * sw)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))
        : null}
      {drawn
        ? chunks.map((c) => (
            <path
              key={"t" + c.i}
              d={c.d}
              fill="none"
              stroke={LZ_COL[c.i]}
              strokeWidth={4.4}
              opacity={LZ_OP[c.i]}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))
        : null}
      {sw > 0.004
        ? [0.63, 0.82].map((s, i) => (
            <g
              key={"s" + i}
              transform={"translate(820 362) scale(" + s + ") translate(-820 -362)"}
            >
              <path
                d={lzPath(proj, 0, LZ_N - 1, 3)}
                fill="none"
                stroke={LZ_COL[i]}
                strokeWidth={2.5 / s}
                opacity={sw * (0.15 + 0.06 * i)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          ))
        : null}
      {drawn ? <circle cx={hd[0]} cy={hd[1]} r={17} fill={R_GOLD} opacity={0.15} /> : null}
      {drawn ? <circle cx={hd[0]} cy={hd[1]} r={7} fill="#fffdf6" /> : null}
      <text x={62} y={706} fill="#5d5d70" opacity={1 - cw} style={{ font: "500 25px " + MONO }}>
        σ 10 · ρ 28 · β 8/3
      </text>
      {cw > 0.004 ? (
        <text x={62} y={706} fill="#5d5d70" opacity={cw} style={{ font: "500 25px " + MONO }}>
          σ 10 · ρ 14-28 · β 8/3
        </text>
      ) : null}
      {p > 0.88 ? (
        <text
          x={1538}
          y={80}
          textAnchor="end"
          fill={R_GOLD}
          opacity={seg(p, 0.88, 0.99)}
          style={{ font: "500 28px " + MONO }}
        >
          strange attractor
        </text>
      ) : null}
    </svg>
  );
}

type Rect = { left: number; top: number; width: number; height: number };

const WIN: Rect = { left: 280, top: 168, width: 1360, height: 744 };
const SIDEW = 262;
const VIDEO: Rect = { left: 660, top: 286, width: 860, height: 409 };
const NAV: [string, string, number][] = [
  ["New chat", "M12 5v14M5 12h14", 1],
  ["Chats", "M4 6h16M4 12h16M4 18h16", 0],
  [
    "Projects",
    "M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z",
    0,
  ],
  ["Videos", "VID", 0],
];
const STARRED = ["Fourier series build-up", "Golden spiral zoom"];
const RECENTS = [
  "Riemann zeta spiral",
  "Sunflower phyllotaxis",
  "Mandelbrot zoom",
  "Hilbert curve fill",
];
const STAR_D =
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
const BUBBLE_D = "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z";
const GEAR_D =
  "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z";

function Icon({
  d,
  size,
  color,
  fill,
  w,
}: {
  d: string;
  size?: number;
  color?: string;
  fill?: string;
  w?: number;
}) {
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
  chip,
}: {
  icon?: string;
  label: string;
  active?: boolean;
  faded?: boolean;
  star?: boolean;
  size?: number;
  chip?: boolean;
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
        <Icon
          d={icon || ""}
          size={size ? 14 : 18}
          color={active ? ACCENT : "#a8a49b"}
          w={size ? 1.9 : 2}
        />
      )}
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      {chip ? (
        <span
          style={{
            font: "400 12px " + MONO,
            color: "#a5a19a",
            background: "#eeebe2",
            borderRadius: 5,
            padding: "3px 6px",
            lineHeight: 1,
          }}
        >
          Ctrl K
        </span>
      ) : null}
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

const PROMPT_1 = "trace the lorenz attractor in 3d and let it rotate";
const PROMPT_2 = "now sweep rho from 14 to 28 as it draws";

function Ring({ size, color }: { size?: number; color?: string }) {
  const s = size || 18;
  return (
    <svg width={s} height={s} viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="7" fill="none" stroke={color || INK} strokeWidth="2.4" />
    </svg>
  );
}

function Chrome({ swap, children }: { swap?: number; children?: ReactNode }) {
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
            <div
              style={{ width: 9, height: 9, borderRadius: "50%", border: "1.6px solid " + MUTE }}
            />
          </div>
          <span
            style={{
              flex: 1,
              font: "700 21px " + DISP,
              letterSpacing: "-0.01em",
              color: INK,
              whiteSpace: "nowrap",
            }}
          >
            Manition
          </span>
          <Icon d="M11 17l-5-5 5-5M18 17l-5-5 5-5" size={16} color="#b3aea4" w={2} />
        </div>
        <div style={{ padding: "8px 12px 0", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((n) => (
            <SideRow key={n[0]} icon={n[1]} label={n[0]} active={n[2] === 1} />
          ))}
          <SideRow icon="SEARCH" label="Search" chip />
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
        <div
          style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 11px", borderRadius: 9 }}
        >
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
              Lorenz attractor in 3D
            </span>
          </div>
          <Icon d="M6 9l6 6 6-6" size={14} color={MUTE} w={2.2} />
        </div>
      </div>
      {children}
    </>
  );
}

function Composer({
  rect,
  text,
  typed,
  sendOn,
  press,
}: {
  rect: Rect;
  text: string;
  typed: number;
  sendOn: number;
  press?: number;
}) {
  const n = Math.round(clamp(typed, 0, 1) * text.length);
  const lit = clamp(sendOn, 0, 1);
  return (
    <div style={{ position: "absolute", left: rect.left, top: rect.top + 30, width: rect.width }}>
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
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            font: "400 26px " + BODY,
          }}
        >
          {n > 0 ? (
            <span style={{ color: INK }}>{text.slice(0, n)}</span>
          ) : (
            <span style={{ color: "#b6b2a9" }}>Describe the animation you want to create...</span>
          )}
          {typed > 0 && typed < 1 ? (
            <span
              style={{ display: "inline-block", width: 2, height: 27, background: INK, marginLeft: 3 }}
            />
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

const CODE_SRC = [
  "from manim import *",
  "import numpy as np",
  "",
  "SIGMA, RHO, BETA = 10.0, 28.0, 8 / 3",
  "",
  "def lorenz(state):",
  "    x, y, z = state",
  "    return np.array([",
  "        SIGMA * (y - x),",
  "        x * (RHO - z) - y,",
  "        x * y - BETA * z,",
  "    ])",
  "",
  "class LorenzAttractor(ThreeDScene):",
  "    def construct(self):",
  "        self.set_camera_orientation(phi=72 * DEGREES, theta=-48 * DEGREES)",
  "        curve = ParametricFunction(",
  "            integrate(lorenz, seed=[-8, 7, 27]),",
  "            t_range=[0, 24, 0.004],",
  "        ).set_stroke([BLUE_D, BLUE_B, YELLOW_A], width=3.2)",
  "",
  "        self.add(ThreeDAxes(x_range=[-30, 30, 10]))",
  "        self.begin_ambient_camera_rotation(rate=0.14)",
  "        self.play(Create(curve), run_time=8, rate_func=linear)",
  "        self.wait(3)",
];

const PY_KW: Record<string, number> = {
  from: 1,
  import: 1,
  as: 1,
  def: 1,
  class: 1,
  return: 1,
  self: 1,
  in: 1,
  for: 1,
  if: 1,
  else: 1,
  None: 1,
  True: 1,
  False: 1,
  with: 1,
  not: 1,
  and: 1,
  or: 1,
  lambda: 1,
};
const C_NUM = "#9a6a2f";
const C_PLAIN = "#57544e";
const PY_RE = /(#.*)|([A-Za-z_][A-Za-z_0-9]*)|(\d+\.?\d*)|(\s+)|([^])/g;

type Token = [string, string, number];

function pyTok(line: string): Token[] {
  const out: Token[] = [];
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
const CODE_LEN = CODE_SRC.map((l) => l.length);
const CODE_OFF = (() => {
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
  const takes: number[] = [];
  let acc = 0;
  for (const tk of CODE[i]) {
    takes.push(Math.max(0, Math.min(n - acc, tk[0].length)));
    acc += tk[0].length;
  }
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
        {CODE[i].map((tk, k) =>
          takes[k] > 0 ? (
            <span key={k} style={{ color: tk[1], fontWeight: tk[2] ? 500 : 400 }}>
              {tk[0].slice(0, takes[k])}
            </span>
          ) : null,
        )}
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

function CodePanel({ p, a, shift }: { p: number; a: number; shift?: string }) {
  const shown = Math.round(clamp(p, 0, 1) * CODE_CHARS);
  const rows: { i: number; n: number }[] = [];
  let cur = 0;
  for (let i = 0; i < CODE.length; i++) {
    const n = shown - CODE_OFF[i];
    if (n <= 0) break;
    cur = i + (CODE_LEN[i] ? Math.min(1, n / CODE_LEN[i]) : 1);
    rows.push({ i, n: Math.min(n, CODE_LEN[i]) });
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
        <span style={{ font: "400 15px " + MONO, color: FAINT }}>lorenz_attractor.py</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Icon
            d="M9 9h13v13H9zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
            size={17}
            color={FAINT}
            w={1.8}
          />
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
            <span style={{ font: "500 16px " + MONO, color: FAINT, letterSpacing: "0.04em" }}>
              Manition
            </span>
          </div>
          <CodePanel p={code} a={m.opacity as number} shift={m.transform as string} />
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
  preview,
  swap,
  scrub,
  playing,
}: {
  rect: Rect;
  title: string;
  dur: number;
  pen: number;
  preview: number;
  swap: number;
  scrub: number;
  playing: boolean;
}) {
  const secs = Math.round(clamp(scrub, 0, 1) * dur);
  const tw = seg(swap, 0.44, 0.6);
  return (
    <div style={{ position: "absolute", left: rect.left, top: rect.top, width: rect.width }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div
          style={{ position: "relative", font: "500 19px " + MONO, color: MUTE, whiteSpace: "nowrap" }}
        >
          <span style={{ opacity: 1 - tw }}>lorenz_attractor.mp4</span>
          <span style={{ position: "absolute", left: 0, top: 0, opacity: tw }}>{title}</span>
        </div>
        <div style={{ font: "400 16px " + MONO, color: FAINT, whiteSpace: "nowrap" }}>
          {"1080p · 0:0" + dur}
        </div>
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
        <LorenzPlate
          pen={pen}
          preview={preview}
          sweep={swap}
          style={{ left: 0, top: 0, width: "100%", height: "100%" }}
        />
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
          {"0:0" + secs + " / 0:0" + dur}
        </div>
      </div>
    </div>
  );
}

function AppWindow({
  a,
  swap,
  children,
}: {
  a: number;
  swap?: number;
  children?: ReactNode;
}) {
  if (a <= 0.002) return null;
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
      }}
    >
      <Chrome swap={swap}>{children}</Chrome>
    </div>
  );
}

const inWin = (r: Rect): Rect => ({
  left: r.left - WIN.left,
  top: r.top - WIN.top,
  width: r.width,
  height: r.height,
});

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

function shotAt(s: Shot, t: number): Cam {
  const hold = Math.max(0, t - (s.t + (s.dur == null ? 0.5 : s.dur)));
  const k = Easing.easeOutSine(clamp(hold / (s.span || DRIFT), 0, 1));
  return {
    z: s.z * (1 + (s.push || 0) * k),
    cx: s.cx + (s.dx || 0) * k,
    cy: s.cy + (s.dy || 0) * k,
  };
}

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
  const to = shotAt(s, t);
  if (i === 0) return to;
  const from = shotAt(shots[i - 1], s.t);
  const e = (s.ease || Easing.easeInOutCubic)(seg(t, s.t, s.t + (s.dur == null ? 0.5 : s.dur)));
  const wa = 1920 / from.z,
    wb = 1920 / to.z;
  return {
    z: 1920 / (wa + (wb - wa) * e),
    cx: from.cx + (to.cx - from.cx) * e,
    cy: from.cy + (to.cy - from.cy) * e,
  };
}

const F_MAIN = { z: 1.75, cx: 1091, cy: 555 };

function Camera({ cam, children }: { cam: Cam; children?: ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: "0 0",
        transform:
          "translate(" +
          (960 - cam.z * cam.cx).toFixed(2) +
          "px," +
          (540 - cam.z * cam.cy).toFixed(2) +
          "px) scale(" +
          cam.z.toFixed(4) +
          ")",
      }}
    >
      {children}
    </div>
  );
}

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
  return { x, y };
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
      <path
        d={POINTER_D}
        fill={INK}
        stroke={ghost ? "none" : "#ffffff"}
        strokeWidth={ghost ? 0 : 1.3}
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
    if (rp > 0 && rp < 1)
      rings.push({ i, r: (9 + 34 * Easing.easeOutCubic(rp)) * k, o: (1 - rp) * 0.42 });
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

/* Stable element per tile so the wall's per-frame re-render never re-creates
   (and so never re-decodes) an <img>. */
const TILE_IMG: Record<string, ReactElement> = {};
for (const name of Object.keys(TILES)) {
  // next/image's wrapper would be reconciled ~50 times a frame for no gain here.
  TILE_IMG[name] = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={TILES[name]}
      alt=""
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  );
}

const VOID = "#08080c";
const SEAM = "#191922";
const CW = 383,
  CH = 215,
  PITCH = 216;
const COL_X = [0, 384, 768, 1152, 1536];
const COL_V = [38, -54, 47, -61, 42];
const COL_PH = [0, 96, 44, 138, 72];
const COL_SEQ = [
  ["mandel", "turing", "galaxy", "hilbert", "galaxy", "lorenz", "phyllo", "julia", "turing", "fourier"],
  ["galaxy", "julia", "fourier", "turing", "lorenz", "apollonian", "mandel", "apollonian", "hilbert", "fourier"],
  ["apollonian", "turing", "lorenz", "mandel", "fourier", "hilbert", "galaxy", "fourier", "turing", "phyllo"],
  ["julia", "lorenz", "phyllo", "turing", "apollonian", "hilbert", "lorenz", "fourier", "apollonian", "mandel"],
  ["mandel", "fourier", "galaxy", "apollonian", "turing", "galaxy", "mandel", "phyllo", "lorenz", "julia"],
];
const CYC = COL_SEQ[0].length * PITCH;
const wrapPos = (a: number) => (((a % CYC) + CYC) % CYC) - PITCH;

function Wall({ t, a, stagger }: { t: number; a: number; stagger?: boolean }) {
  if (a <= 0.002) return null;
  return (
    <>
      {COL_SEQ.map((sq, c) => {
        const ca = a * (stagger ? seg(t, 0.5 + c * 0.075, 1.35 + c * 0.075) : 1);
        if (ca <= 0.002) return null;
        const off = COL_V[c] * t;
        const dx = (COL_X[c] + CW / 2 - 960) / 960;
        return (
          <div
            key={c}
            style={{ position: "absolute", left: COL_X[c], top: 0, width: CW, height: 1080, opacity: ca }}
          >
            {sq.map((n, j) => {
              const y = wrapPos(j * PITCH - off - PITCH + COL_PH[c]);
              if (y > 1090 || y < -PITCH) return null;
              const dy = (y + CH / 2 - 540) / 540;
              const r = Math.hypot(dx, dy * 0.88);
              const bl = clamp((r - 0.44) * 3.6, 0, 2.4);
              const dim = 1 - clamp((r - 0.3) * 0.52, 0, 0.46);
              return (
                <div
                  key={j}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: CW,
                    height: CH,
                    transform: "translateY(" + y.toFixed(1) + "px)",
                    overflow: "hidden",
                    background: SCREEN,
                    filter: "blur(" + bl.toFixed(2) + "px) brightness(" + dim.toFixed(3) + ")",
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

function Void({ a }: { a: number }) {
  if (a <= 0.002) return null;
  return <div style={{ position: "absolute", inset: 0, background: VOID, opacity: a }} />;
}

function Veil({ a, well }: { a: number; well: number }) {
  if (a <= 0.002) return null;
  const seams = COL_X.slice(1).map((x) => (
    <div
      key={x}
      style={{ position: "absolute", left: x - 1, top: 0, width: 1, height: "100%", background: SEAM, opacity: 0.9 }}
    />
  ));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      {seams}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(128% 96% at 50% 40%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.34) 60%, rgba(0,0,0,0.82) 84%, #000000 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 68%, rgba(0,0,0,0.93) 90%, #000000 100%)",
        }}
      />
      {well > 0.002 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: well,
            background:
              "radial-gradient(62% 40% at 50% 92%, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.78) 38%, rgba(0,0,0,0) 76%)",
          }}
        />
      ) : null}
    </div>
  );
}

function Wrap({ children }: { children?: ReactNode }) {
  return <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>{children}</div>;
}

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
  const blur = clamp(vel * 1.25 + 4.2 * (1 - Easing.easeOutCubic(seg(t, 0.02, 0.95))), 0, 5.4);
  return (
    <Wrap>
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
      <div
        style={{ position: "absolute", inset: 0, filter: blur > 0.03 ? "blur(" + blur.toFixed(2) + "px)" : "none" }}
      >
        <Camera cam={cam}>
          <OpenLine t={t} a={1} />
        </Camera>
      </div>
    </Wrap>
  );
}

function Brand({ localTime: t }: SceneProps) {
  return (
    <Wrap>
      <Field />
      <Grain />
      <OpenLine t={99} a={1 - seg(t, 0.1, 0.8)} />
      <Wordmark p={seg(t, 0.7, 2.1)} size={118} top={424} opacity={seg(t, 0.7, 1.3)} />
      <Line text="Say what you want to see." a={seg(t, 2.1, 2.9)} top={604} size={40} />
    </Wrap>
  );
}

const CUR_A: CursorKey[] = [
  { t: 0, x: 1560, y: 960 },
  { t: 2.05, x: 1000, y: 530 },
  { t: 2.6, x: 1000, y: 530 },
  { t: 4.9, x: 1000, y: 530 },
  { t: 5.25, x: 1499, y: 530 },
];
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
    <Wrap>
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

const CUR_B: CursorKey[] = [
  { t: 0, x: 1499, y: 530 },
  { t: 3.0, x: 668, y: 757 },
  { t: 3.5, x: 668, y: 757 },
  { t: 5.2, x: 1310, y: 700 },
];
const CAM_B: Shot[] = [
  { t: 0, z: 1.575, cx: 1090, cy: 560 },
  { t: 0.15, z: 1.0, cx: 960, cy: 540, dur: 0.85, push: 0.05 },
  { t: 2.55, z: F_MAIN.z, cx: F_MAIN.cx, cy: F_MAIN.cy, dur: 0.55 },
  { t: 3.9, z: 1.78, cx: 1090, cy: 486, dur: 0.6, push: 0.045 },
  { t: 8.95, z: 1.22, cx: 960, cy: 540, dur: 0.6, push: 0.03 },
];

function Watch({ localTime: t }: SceneProps) {
  const out = seg(t, 0.1, 0.7);
  const shown = seg(t, 2.5, 3.3);
  const pen = MOTION.draw(seg(t, 3.6, 8.9));
  const cam = camAt(CAM_B, t);
  return (
    <Wrap>
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
            title="lorenz_attractor.mp4"
            dur={6}
            swap={0}
            pen={pen}
            preview={band(t, 3.0, 3.6, 8.3, 8.9)}
            scrub={pen}
            playing={pen > 0.002 && pen < 0.999}
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

const CUR_C: CursorKey[] = [
  { t: 0, x: 1310, y: 700 },
  { t: 3.0, x: 980, y: 773 },
  { t: 3.5, x: 980, y: 773 },
  { t: 5.2, x: 980, y: 773 },
  { t: 5.42, x: 1499, y: 773 },
];
const FOLLOW: Rect = { left: 640, top: 700, width: 900, height: 88 };
const CAM_C: Shot[] = [
  { t: 0, z: 1.23, cx: 960, cy: 540 },
  { t: 0.2, z: 1.0, cx: 960, cy: 540, dur: 0.7, push: 0.04 },
  { t: 2.5, z: 1.2, cx: 960, cy: 560, dur: 0.45 },
  { t: 3.0, z: 2.05, cx: 1080, cy: 645, dur: 0.55, push: 0.05 },
  { t: 5.3, z: 1.85, cx: 1120, cy: 612, dur: 0.5 },
  { t: 5.95, z: 1.75, cx: 1090, cy: 486, dur: 0.52, ease: EASE_SETTLE, push: 0.02, dy: 6, span: 3.0 },
];

function Refine({ localTime: t }: SceneProps) {
  const out = seg(t, 0.1, 0.7);
  const shown = seg(t, 2.4, 3.1);
  const swap = seg(t, 5.9, 6.8);
  const cam = camAt(CAM_C, t);
  return (
    <Wrap>
      <Field />
      <Camera cam={cam}>
        <AppWindow a={1 - out} swap={1}>
          <VideoCard
            rect={inWin(VIDEO)}
            title="lorenz_attractor.mp4"
            dur={6}
            swap={0}
            pen={1}
            preview={0}
            scrub={1}
            playing={false}
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
            rect={inWin({ left: VIDEO.left, top: 236, width: VIDEO.width, height: 348 })}
            title="lorenz_rho_sweep.mp4"
            dur={swap > 0.5 ? 9 : 6}
            swap={swap}
            pen={1}
            preview={0}
            scrub={1 - swap}
            playing={false}
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

const CAM_D: Shot[] = [
  { t: 0, z: 1.775, cx: 1090, cy: 490 },
  { t: 0.1, z: 1.0, cx: 960, cy: 540, dur: 0.8, push: 0.035 },
];

function Anything({ localTime: t }: SceneProps) {
  const out = seg(t, 0.1, 0.7);
  const dark = seg(t, 0.06, 0.55);
  const cam = camAt(CAM_D, t);
  return (
    <Wrap>
      <Field />
      <Void a={dark} />
      <Camera cam={cam}>
        <AppWindow a={1 - out} swap={1}>
          <VideoCard
            rect={inWin({ left: VIDEO.left, top: 236, width: VIDEO.width, height: 348 })}
            title="lorenz_rho_sweep.mp4"
            dur={9}
            swap={1}
            pen={1}
            preview={0}
            scrub={0}
            playing={false}
          />
          <Composer rect={inWin(FOLLOW)} text={PROMPT_2} typed={1} sendOn={1} press={0} />
        </AppWindow>
        <Cursor path={[{ t: 0, x: 1499, y: 773 }]} t={t} clicks={[]} a={1 - seg(t, 0.15, 0.75)} zoom={cam.z} />
        <Wall t={t} a={1} stagger />
      </Camera>
      <Veil a={dark} well={seg(t, 1.7, 2.4)} />
      <Callout
        phrases={[
          ["Anything", 2.0],
          ["you can say.", 2.45],
        ]}
        t={t}
        a={seg(t, 1.95, 2.7)}
        size={54}
        top={932}
        color="#f4f2ec"
        rise={1.95}
      />
    </Wrap>
  );
}

const CAM_E: Shot[] = [{ t: 0, z: 1.034, cx: 960, cy: 540, dur: 0, push: 0.02 }];

function Close({ localTime: t }: SceneProps) {
  const out = seg(t, 0.2, 1.05);
  const lift = Easing.easeInOutCubic(seg(t, 1.0, 1.75));
  return (
    <Wrap>
      <Field />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - lift }}>
        <Void a={1} />
        <Camera cam={camAt(CAM_E, t)}>
          <Wall t={t + 4.6} a={1 - out} />
        </Camera>
        <Veil a={1} well={1} />
        <Callout
          phrases={[
            ["Anything", 0],
            ["you can say.", 0],
          ]}
          t={99}
          a={1 - seg(t, 0.15, 0.8)}
          size={54}
          top={932}
          color="#f4f2ec"
        />
      </div>
      <Wordmark p={seg(t, 1.55, 3.15)} size={118} top={470} opacity={seg(t, 1.55, 2.15)} />
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
  return (
    <SceneStage width={1920} height={1080} scenes={SCENES} bg={PAPER} components={COMPONENTS} />
  );
}
