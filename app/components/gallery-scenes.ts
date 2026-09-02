// Canvas scene library for the gallery video player, ported verbatim from the
// design's gallery-player.js. Each scene draws one math clip on a 320x200
// virtual canvas at time t (seconds); `poster` is the frame shown before play.

export type Ctx = CanvasRenderingContext2D;

const TAU = Math.PI * 2;
const MONO = '"IBM Plex Mono",monospace';

const cl = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ss = (p: number) => p * p * (3 - 2 * p);
const sg = (t: number, a: number, b: number) => ss(cl((t - a) / (b - a)));
const ln = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const lp = (a: number, b: number, p: number) => a + (b - a) * p;

const K = {
  grid: "#26262c",
  grid2: "#33333d",
  blue: "#7ea6d9",
  gold: "#c2913a",
  green: "#5fbf7e",
  txt: "#c8c8cc",
  dim: "#8a8a92",
  wht: "#f4f4f5",
};

function rng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let z = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

function L(g: Ctx, x1: number, y1: number, x2: number, y2: number, c: string, w: number) {
  g.strokeStyle = c;
  g.lineWidth = w;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
}

function D(g: Ctx, x: number, y: number, r: number, c: string) {
  g.fillStyle = c;
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fill();
}

function TX(g: Ctx, s: string, x: number, y: number, sz: number, c: string, al?: CanvasTextAlign) {
  g.font = "500 " + sz + "px " + MONO;
  g.fillStyle = c;
  g.textAlign = al || "left";
  g.textBaseline = "middle";
  g.fillText(s, x, y);
}

function AR(g: Ctx, x1: number, y1: number, x2: number, y2: number, c: string, w: number) {
  const dx = x2 - x1,
    dy = y2 - y1,
    l = Math.hypot(dx, dy);
  if (l < 1) return;
  const ux = dx / l,
    uy = dy / l,
    h = Math.min(8, 3.4 + w * 1.5),
    bx = x2 - ux * h,
    by = y2 - uy * h;
  L(g, x1, y1, bx, by, c, w);
  g.fillStyle = c;
  g.beginPath();
  g.moveTo(x2, y2);
  g.lineTo(bx - uy * h * 0.5, by + ux * h * 0.5);
  g.lineTo(bx + uy * h * 0.5, by - ux * h * 0.5);
  g.closePath();
  g.fill();
}

function PLOT(g: Ctx, x0: number, x1: number, f: (x: number) => number, p: number, c: string, w: number) {
  if (p <= 0) return;
  g.strokeStyle = c;
  g.lineWidth = w;
  g.lineJoin = "round";
  g.lineCap = "round";
  g.beginPath();
  const M = 110;
  let i: number, x: number;
  for (i = 0; i <= M; i++) {
    x = lp(x0, lp(x0, x1, p), i / M);
    if (i) g.lineTo(x, f(x));
    else g.moveTo(x, f(x));
  }
  g.stroke();
}

// Interpolate between two [r,g,b] colours → "rgb(…)".
function MX(a: number[], b: number[], p: number) {
  return "rgb(" + Math.round(lp(a[0], b[0], p)) + "," + Math.round(lp(a[1], b[1], p)) + "," + Math.round(lp(a[2], b[2], p)) + ")";
}

function MN(a: number[], b: number[], p: number): number[] {
  return [lp(a[0], b[0], p) | 0, lp(a[1], b[1], p) | 0, lp(a[2], b[2], p) | 0];
}

function HSV(h: number, s: number, v: number): number[] {
  h = ((h % 1) + 1) % 1;
  const i = Math.floor(h * 6),
    f = h * 6 - i,
    p = v * (1 - s),
    q = v * (1 - f * s),
    w = v * (1 - (1 - f) * s);
  let r: number, g2: number, b: number;
  switch (i % 6) {
    case 0: r = v; g2 = w; b = p; break;
    case 1: r = q; g2 = v; b = p; break;
    case 2: r = p; g2 = v; b = w; break;
    case 3: r = p; g2 = q; b = v; break;
    case 4: r = w; g2 = p; b = v; break;
    default: r = v; g2 = p; b = q;
  }
  return [(r * 255) | 0, (g2 * 255) | 0, (b * 255) | 0];
}

type Img = { c: HTMLCanvasElement; g: Ctx; d: ImageData };
type Acc = { c: HTMLCanvasElement; g: Ctx };

// Offscreen pixel buffer for scenes that write an ImageData per frame.
function IMG(o: Scene, w: number, h: number): Img {
  if (!o._im) {
    const oc = document.createElement("canvas");
    oc.width = w;
    oc.height = h;
    const og = oc.getContext("2d") as Ctx;
    o._im = { c: oc, g: og, d: og.createImageData(w, h) };
  }
  return o._im;
}

// Offscreen buffer that accumulates across frames instead of being cleared.
function ACC(o: Scene, w: number, h: number): Acc {
  if (!o._ac) {
    const oc = document.createElement("canvas");
    oc.width = w;
    oc.height = h;
    o._ac = { c: oc, g: oc.getContext("2d") as Ctx };
    o._an = 0;
  }
  return o._ac;
}

/* value noise + fBm - shared by the nebula, curl and origin scenes */
const NH = new Float32Array(4096);
(function () {
  const r = rng(1337);
  for (let i = 0; i < 4096; i++) NH[i] = r();
})();
function NHV(a: number, b: number) {
  return NH[((Math.imul(a, 73856093) ^ Math.imul(b, 19349663)) >>> 0) & 4095];
}
function VN(x: number, y: number) {
  const xi = Math.floor(x),
    yi = Math.floor(y),
    xf = x - xi,
    yf = y - yi;
  const u = xf * xf * (3 - 2 * xf),
    v = yf * yf * (3 - 2 * yf);
  const a = NHV(xi, yi),
    b = NHV(xi + 1, yi),
    c = NHV(xi, yi + 1),
    d = NHV(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function FBM(x: number, y: number, o: number) {
  let s = 0,
    am = 0.5,
    f = 1,
    n = 0;
  for (let i = 0; i < o; i++) {
    s += am * VN(x * f, y * f);
    n += am;
    am *= 0.5;
    f *= 2.03;
  }
  return s / n;
}

type TreeNode = {
  a: number;
  l: number;
  w: number;
  d: number;
  t0: number;
  t1: number;
  ph: number;
  sw: number;
  ch: TreeNode[];
  lv: Leaf[];
};
type Leaf = { ox: number; oy: number; s: number; b: number; h: number; ph: number; dt: number; fx: number };
type EmPt = { lx: number; ly: number; tx: number; ty: number; q: number };
type NetNode = { x: number; y: number; b: number; l: number };
type NetEdge = { a: NetNode; b: NetNode; w: number; l: number };

export interface Scene {
  T: number;
  poster: number;
  draw(this: Scene, g: Ctx, t: number): void;
  // per-scene memoised geometry (deterministic; safe to share across instances)
  _S?: { tau: number; b: number; k: number }[];
  _max?: number;
  _P?: { pos: number[][]; isP: boolean[]; pc: number[]; N: number };
  _L?: number[][];
  _A?: number[][];
  _B?: number[][];
  _TB?: number[][][];
  _cv?: HTMLCanvasElement;
  _W?: number[][][];
  _Q?: [number, number, boolean, number][];
  _C?: number[][];
  _seeds?: number[];
  _K?: number[][][];
  _V?: { mark: number[]; ev: number[][] };
  _R?: {
    rs: { x: number; y: number; w: number; h: number }[];
    arcs: { cx: number; cy: number; r: number; a0: number; a1: number }[];
  };
  _G?: { grid: Uint8Array; gen: number; hist: Uint8Array[] };
  _emP?: EmPt[];
  _im?: Img;
  _ac?: Acc;
  _an?: number;
  _hil?: number[][][];
  _fern?: number[][];
  _gasket?: { x: number; y: number; r: number; d: number }[];
  _tessV?: number[][];
  _tessE?: number[][];
  _tessP?: number[][];
  _flock?: { b: { x: number; y: number; vx: number; vy: number }[]; tt: number; warm?: boolean };
  _rd?: { U: Float32Array; V: Float32Array; A: Float32Array; B: Float32Array; n: number };
  _gal?: {
    P: { x: number; y: number; vx: number; vy: number; g: number }[];
    C: { x: number; y: number; vx: number; vy: number }[];
    tt: number;
    M: number;
    s2: number;
    warm?: boolean;
  };
  _bh?: {
    D: { r: number; th: number; b: number; w: number }[];
    S: { x: number; y: number; m: number }[];
    P: string[][];
  };
  _neb?: { x: number; y: number; m: number; p: number; c: number }[];
  _dj?: Float32Array;
  _curl?: { p: number[][]; h: number }[];
  _orig?: {
    P: { r0: number; a0: number; z: number; rt: number; s: number; keep: boolean; sw: number }[];
    A: number[];
    ST: { x: number; y: number; m: number; p: number }[];
    SPK: { r: number; a: number; t: number; s: number }[];
  };
  _planet?: Img;
  _tree?: TreeNode;
  _snow?: { x: number; y: number; s: number; v: number; p: number }[];
  _aur?: {
    S: { x: number; y: number; m: number; p: number }[];
    C: { y: number; amp: number; fr: number; sp: number; t0: number; w: number; ph: number; vi: number; ns: number }[];
    RG: number[];
  };
  _E?: { a: number; s: number; l: number; w: number; j: number; lob: number }[];
  _terS?: { x: number; y: number; m: number; p: number }[];
  _N?: { n: NetNode[][]; e: NetEdge[]; L: number };
}

/* ---------- chalkboard explainer kit (stick-figure scenes) ---------- */

const CH = { ink: "#efebe3", ink2: "#a5a29b", blue: "#8fb3e6", gold: "#e0a94a", red: "#e0705c" };

function AL(g: Ctx, A: number, v?: number) {
  g.globalAlpha = cl(A * (v === undefined ? 1 : v));
}

function CQ(g: Ctx, x1: number, y1: number, cx: number, cy: number, x2: number, y2: number, c: string, w: number) {
  g.strokeStyle = c;
  g.lineWidth = w;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(x1, y1);
  g.quadraticCurveTo(cx, cy, x2, y2);
  g.stroke();
}

function SFH(s: number, st?: number) {
  return (6.5 + 27 * (st === undefined ? 1 : st)) * (s || 1);
}

function OSH(p: number) {
  p = cl(p);
  return 1 - Math.exp(-6.2 * p) * Math.cos(6.6 * p);
}

/* keyframe track: rows of [t, v1, v2, ...], smoothstep between rows */
function KFR(t: number, ks: number[][]): number[] {
  if (t <= ks[0][0]) return ks[0].slice();
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i],
      b = ks[i + 1];
    if (t <= b[0]) {
      const p = ss(cl((t - a[0]) / (b[0] - a[0]))),
        o = [t];
      for (let j = 1; j < a.length; j++) o.push(lp(a[j], b[j], p));
      return o;
    }
  }
  return ks[ks.length - 1].slice();
}

/* camera: world point (fx,fy) sits at frame centre, scaled z x zy */
type CamV = { fx: number; fy: number; z: number; zy: number };
let CV: CamV = { fx: 160, fy: 100, z: 1, zy: 1 };
function CPUSH(g: Ctx, c: CamV) {
  CV = c;
  g.save();
  g.translate(160, 100);
  g.scale(c.z, c.zy);
  g.translate(-c.fx, -c.fy);
}
function PJ(x: number, y: number) {
  return [160 + (x - CV.fx) * CV.z, 100 + (y - CV.fy) * CV.zy];
}

/* kinetic type: whole words rise + fade with a stagger, never clipped mid-glyph */
type KTOpt = {
  txt?: string;
  x: number;
  y: number;
  sz: number;
  c: string;
  wt?: number;
  al?: CanvasTextAlign;
  u?: number;
  stag?: number;
  dur?: number;
  A?: number;
  op?: number;
  d?: number;
};

function KT(g: Ctx, o: KTOpt) {
  const w = (o.txt || "").split(" "),
    n = w.length,
    adv: number[] = [];
  let tot = 0;
  g.font = o.wt ? o.wt + ' ' + o.sz + 'px "Space Grotesk",system-ui,sans-serif' : "500 " + o.sz + "px " + MONO;
  g.textAlign = "left";
  g.textBaseline = "middle";
  const sp = g.measureText(" ").width;
  for (let i = 0; i < n; i++) {
    adv[i] = g.measureText(w[i]).width;
    tot += adv[i] + (i < n - 1 ? sp : 0);
  }
  let x = o.al === "center" ? o.x - tot / 2 : o.al === "right" ? o.x - tot : o.x;
  const st = o.stag === undefined ? 0.042 : o.stag,
    dur = o.dur || 0.44;
  for (let i = 0; i < n; i++) {
    const p = ss(cl(((o.u || 0) - i * st) / dur));
    if (p > 0) {
      g.globalAlpha = cl((o.A === undefined ? 1 : o.A) * p * (o.op === undefined ? 1 : o.op));
      g.fillStyle = o.c;
      g.fillText(w[i], x, o.y + (1 - p) * 5.5);
    }
    x += adv[i] + sp;
  }
  g.globalAlpha = 1;
  return tot;
}

/* stick figure, built downward from the head centre (hx,hy) */
type SFOpt = {
  hx: number;
  hy: number;
  s?: number;
  c?: string;
  st?: number;
  lw?: number;
  nd?: number;
  ph?: number;
  lean?: number;
  legs?: number[];
  arms?: number[];
  fist?: boolean;
  eye?: string;
  mouth?: number | "o" | "O";
  beard?: number;
};

function SF(g: Ctx, o: SFOpt) {
  const s = o.s || 1,
    c = o.c || CH.ink,
    st = o.st === undefined ? 1 : o.st,
    lw = (o.lw || 2.2) * Math.max(0.5, s);
  const nd = o.nd || 0,
    ph = o.ph || 0,
    hx = o.hx,
    hy = o.hy,
    hr = 4.9 * s;
  const shY = hy + hr + 1.6 * s,
    hipY = shY + 11 * s * st,
    ftY = hipY + 16 * s * st,
    bx = hx + (o.lean || 0) * 6 * s;
  let i: number;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.strokeStyle = c;
  g.lineWidth = lw;
  g.beginPath();
  g.moveTo(hx, shY);
  g.quadraticCurveTo(hx + (bx - hx) * 0.55 + Math.sin(ph * 1.3) * nd * 5 * s, (shY + hipY) / 2, bx, hipY);
  g.stroke();
  const lg = o.legs || [-1, 1];
  for (i = 0; i < 2; i++) {
    g.beginPath();
    g.moveTo(bx, hipY);
    g.quadraticCurveTo(
      bx + lg[i] * 3.4 * s + Math.sin(ph * 1.9 + i * 2.3) * nd * 9 * s,
      (hipY + ftY) / 2,
      bx + lg[i] * 5.8 * s,
      ftY,
    );
    g.stroke();
  }
  const ar = o.arms || [212, -32],
    AR0 = 12.5 * s;
  for (i = 0; i < 2; i++) {
    const a = (ar[i] * Math.PI) / 180,
      ex = hx + Math.cos(a) * AR0,
      ey = shY - Math.sin(a) * AR0;
    g.lineWidth = lw;
    g.beginPath();
    g.moveTo(hx, shY + 1.2 * s);
    g.quadraticCurveTo(
      hx + Math.cos(a) * AR0 * 0.55 + Math.sin(ph * 2.1 + i) * nd * 5 * s,
      shY - Math.sin(a) * AR0 * 0.5,
      ex,
      ey,
    );
    g.stroke();
    if (o.fist && i === 1) {
      g.lineWidth = lw * 0.85;
      g.beginPath();
      g.arc(ex, ey, 1.9 * s, 0, TAU);
      g.stroke();
    }
  }
  g.lineWidth = lw;
  g.beginPath();
  g.arc(hx, hy, hr, 0, TAU);
  g.stroke();
  const e1 = hx - 2.05 * s,
    e2 = hx + 2.05 * s,
    ey0 = hy - 0.75 * s,
    eye = o.eye || "dot";
  if (eye === "back") {
    for (i = 0; i < 3; i++) L(g, hx - 2.4 * s + i * 2.4 * s, hy - hr * 0.55, hx - 2.4 * s + i * 2.4 * s, hy + hr * 0.15, c, lw * 0.65);
  } else if (eye === "wide") {
    g.lineWidth = lw * 0.7;
    g.beginPath();
    g.arc(e1, ey0, 1.9 * s, 0, TAU);
    g.stroke();
    g.beginPath();
    g.arc(e2, ey0, 1.9 * s, 0, TAU);
    g.stroke();
    D(g, e1, ey0 + 0.45 * s, 0.8 * s, c);
    D(g, e2, ey0 + 0.45 * s, 0.8 * s, c);
  } else if (eye === "x") {
    const q = 1.6 * s;
    L(g, e1 - q, ey0 - q, e1 + q, ey0 + q, c, lw * 0.8);
    L(g, e1 - q, ey0 + q, e1 + q, ey0 - q, c, lw * 0.8);
    L(g, e2 - q, ey0 - q, e2 + q, ey0 + q, c, lw * 0.8);
    L(g, e2 - q, ey0 + q, e2 + q, ey0 - q, c, lw * 0.8);
  } else if (eye === "shut") {
    L(g, e1 - 1.7 * s, ey0, e1 + 1.7 * s, ey0, c, lw * 0.85);
    L(g, e2 - 1.7 * s, ey0, e2 + 1.7 * s, ey0, c, lw * 0.85);
  } else {
    D(g, e1, ey0, 1.05 * s, c);
    D(g, e2, ey0, 1.05 * s, c);
  }
  if (eye !== "back") {
    const m = o.mouth === undefined ? 0.5 : o.mouth,
      my = hy + 1.95 * s;
    g.lineWidth = lw * 0.85;
    g.strokeStyle = c;
    if (m === "o") {
      g.beginPath();
      g.arc(hx, my + 0.3 * s, 1.7 * s, 0, TAU);
      g.stroke();
    } else if (m === "O") {
      g.beginPath();
      g.ellipse(hx, my + 0.5 * s, 1.9 * s, 2.6 * s, 0, 0, TAU);
      g.stroke();
    } else if (Math.abs(m) < 0.08) {
      L(g, hx - 1.8 * s, my, hx + 1.8 * s, my, c, lw * 0.85);
    } else if (m > 0) {
      g.beginPath();
      g.arc(hx, my - 1.6 * s, 2.4 * s, 0.26 * Math.PI, 0.74 * Math.PI);
      g.stroke();
    } else {
      g.beginPath();
      g.arc(hx, my + 2.2 * s, 2.4 * s, 1.26 * Math.PI, 1.74 * Math.PI);
      g.stroke();
    }
  }
  if (o.beard && o.beard > 0) {
    const bd = o.beard;
    g.lineWidth = lw * 0.66;
    for (let k = 0; k < 7; k++) {
      const t0 = -1 + (2 * k) / 6,
        bxx = hx + t0 * hr * 0.8;
      const by = hy + Math.sqrt(Math.max(0, hr * hr - Math.pow(t0 * hr * 0.8, 2))) * 0.86;
      CQ(
        g,
        bxx,
        by,
        bxx + Math.sin(k * 2.1) * 3 * s,
        by + bd * (11 + (k % 3) * 4) * s,
        bxx + Math.sin(k * 1.3) * 3.6 * s,
        by + bd * (20 + (k % 3) * 7) * s,
        c,
        lw * 0.66,
      );
    }
  }
}

function BH(g: Ctx, x: number, y: number, r: number, t: number, glow: number, A?: number) {
  if (r <= 0.2) return;
  A = A === undefined ? 1 : A;
  if (glow) {
    const gr = g.createRadialGradient(x, y, r * 0.8, x, y, r * 3.6);
    gr.addColorStop(0, "rgba(224,169,74," + (0.3 * glow).toFixed(3) + ")");
    gr.addColorStop(0.5, "rgba(184,124,58," + (0.1 * glow).toFixed(3) + ")");
    gr.addColorStop(1, "rgba(224,169,74,0)");
    g.globalAlpha = A;
    g.fillStyle = gr;
    g.beginPath();
    g.arc(x, y, r * 3.6, 0, TAU);
    g.fill();
  }
  g.globalAlpha = A;
  g.fillStyle = "#04040a";
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fill();
  g.strokeStyle = "rgba(224,169,74,.9)";
  g.lineWidth = 1.15;
  g.beginPath();
  g.arc(x, y, r + 0.9 + 0.5 * Math.sin(t * 1.5), 0, TAU);
  g.stroke();
  for (let i = 0; i < 3; i++) {
    g.globalAlpha = A * (0.44 - i * 0.11) * (1 + 0.14 * Math.sin(t * 1.3 - i));
    g.strokeStyle = i % 2 ? "#e8bb63" : "#c2913a";
    g.lineWidth = 1;
    const a0 = -t * (1.25 + i * 0.5) + i * 2.1;
    g.beginPath();
    g.arc(x, y, r + 3.4 + i * 2.9, a0, a0 + 1.4 + i * 0.35);
    g.stroke();
  }
  g.globalAlpha = 1;
}

/* ---- the explainer -------------------------------------------------------
   ONE focal point per moment. Every element declares three times: when it
   ARRIVES (it becomes the only hot thing on the board), when it HANDS FOCUS
   ON (it drops to context ink - settled, quiet, still readable) and when it
   LEAVES. FS() returns that state, so each beat is authored as a chain of
   handoffs instead of a pile of simultaneous labels. Three objects - the
   hole, its horizon, the figure - are keyframed across the whole take and
   never rebuilt, so it reads as one continuous shot.                     */
const SHT = 127,
  HX = 146,
  HY = 118;
function CLP(v: number, a: number, b: number) {
  return v < a ? a : v > b ? b : v;
}
const INK = [239, 235, 227],
  INK2 = [124, 122, 117],
  BLU = [143, 179, 230],
  BLU2 = [92, 113, 143],
  GLD = [224, 169, 74],
  GLD2 = [131, 102, 50],
  RED = [224, 112, 92],
  RED2 = [133, 72, 60];

/* focus state: a = the ink it may claim (settled elements keep .32) */
type Focus = { A: number; f: number; a: number; u: number; on: boolean };
function FS(t: number, tin: number, toff?: number, tout?: number, lo?: number): Focus {
  let A = sg(t, tin, tin + 0.5);
  if (tout !== undefined) A *= 1 - sg(t, tout, tout + 0.42);
  const f = toff === undefined ? 1 : 1 - sg(t, toff, toff + 0.55);
  return { A: A, f: f, a: A * lp(lo === undefined ? 0.32 : lo, 1, f), u: t - tin, on: A > 0.004 };
}
function FC(fs: Focus, hot: number[], cold: number[]) {
  return MX(hot, cold, 1 - fs.f);
}
function FT(g: Ctx, fs: Focus, o: KTOpt) {
  if (!fs.on) return;
  KT(g, { ...o, A: fs.a, u: fs.u - (o.d || 0) });
}
function SCR(g: Ctx, A: number, cx: number, cy: number, w: number, h: number) {
  if (A <= 0.004) return;
  g.save();
  for (let i = 0; i < 5; i++) {
    g.globalAlpha = A * 0.2;
    g.fillStyle = "#08080c";
    g.beginPath();
    g.roundRect(cx - w / 2 - i * 1.7, cy - h / 2 - i * 1.2, w + i * 3.4, h + i * 2.4, 9 + i);
    g.fill();
  }
  g.restore();
  g.globalAlpha = 1;
}
function VIG(g: Ctx, a: number) {
  if (a <= 0.004) return;
  const gr = g.createRadialGradient(160, 100, 58, 160, 100, 206);
  gr.addColorStop(0, "rgba(0,0,0,0)");
  gr.addColorStop(1, "rgba(0,0,0," + cl(a).toFixed(3) + ")");
  g.globalAlpha = 1;
  g.fillStyle = gr;
  g.fillRect(0, 0, 320, 200);
}
/* chapter header: writes, then settles to context for the rest of its beat */
function HDR(g: Ctx, t: number, n: string, ti: string, tin: number, toff?: number, tout?: number) {
  const fs = FS(t, tin, toff, tout);
  if (!fs.on) return;
  const gr = g.createRadialGradient(8, 20, 8, 8, 20, 224);
  gr.addColorStop(0, "rgba(6,6,10,.88)");
  gr.addColorStop(0.58, "rgba(6,6,10,.42)");
  gr.addColorStop(1, "rgba(6,6,10,0)");
  g.globalAlpha = fs.A * 0.94 * ss(cl(fs.u / 0.5));
  g.fillStyle = gr;
  g.fillRect(0, 0, 320, 118);
  g.globalAlpha = 1;
  AL(g, fs.a, 0.9);
  TX(g, n, 18, 40, 8, FC(fs, BLU, BLU2));
  g.globalAlpha = 1;
  FT(g, fs, { txt: ti, x: 18, y: 55, sz: 13.5, c: FC(fs, INK, INK2), wt: 600, stag: 0.05, d: 0.12 });
  AL(g, fs.a, 0.5);
  L(g, 18, 66, 18 + 112 * ss(cl((fs.u - 0.32) / 0.9)), 66, FC(fs, BLU, BLU2), 1);
  g.globalAlpha = 1;
}
/* the one bottom slot - only ever one line hot at a time */
function BOT(g: Ctx, fs: Focus, txt: string, y: number, sz: number, c: string, w: number) {
  if (!fs.on) return;
  SCR(g, fs.A * ss(cl(fs.u / 0.5)) * 0.92, 160, y, w, 20);
  FT(g, fs, { txt: txt, x: 160, y: y, sz: sz, c: c, al: "center", stag: 0.03 });
}

function FORK(g: Ctx, cx: number, cy: number, A: number) {
  g.globalAlpha = A;
  L(g, cx, cy - 1, cx, cy + 7, CH.gold, 1.35);
  for (let i = 0; i < 3; i++) L(g, cx - 3.2 + i * 3.2, cy - 7, cx - 3.2 + i * 3.2, cy - 1, CH.gold, 1.1);
  L(g, cx - 3.2, cy - 1, cx + 3.2, cy - 1, CH.gold, 1.1);
  g.globalAlpha = 1;
}
function BST(g: Ctx, cx: number, cy: number, A: number) {
  g.globalAlpha = A;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU + 0.32;
    L(g, cx + Math.cos(a) * 2.6, cy + Math.sin(a) * 2.6, cx + Math.cos(a) * 7.4, cy + Math.sin(a) * 7.4, CH.gold, 1.25);
  }
  g.globalAlpha = 1;
}
function CLK(g: Ctx, x: number, y: number, r: number, ang: number, c: string, c2: string, A: number, lw?: number) {
  g.globalAlpha = A * 0.85;
  g.strokeStyle = c;
  g.lineWidth = 1.2;
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.stroke();
  for (let a = 0; a < 12; a++) {
    const th = (a / 12) * TAU;
    g.globalAlpha = A * 0.34;
    L(g, x + Math.cos(th) * (r - 2.6), y + Math.sin(th) * (r - 2.6), x + Math.cos(th) * (r - 1), y + Math.sin(th) * (r - 1), c2, 0.8);
  }
  g.globalAlpha = A;
  L(g, x, y, x + Math.cos(ang) * (r * 0.7), y + Math.sin(ang) * (r * 0.7), c, lw || 1.5);
  D(g, x, y, 1.4, c);
  g.globalAlpha = 1;
}

/* camera - the move always follows whatever currently owns focus --------- */
const SHCK = [
  [0, 150, 92, 1.22, 1.22], [2.6, 156, 96, 1.1, 1.1], [4.8, 158, 100, 1.0, 1.0],
  [6.8, 156, 102, 1.01, 1.01], [8.0, 152, 106, 1.04, 1.04], [9.2, 150, 110, 1.1, 1.1],
  [11.4, 148, 116, 1.26, 1.26], [14.0, 147, 116, 1.32, 1.32], [16.2, 150, 114, 1.2, 1.2],
  [19.6, 150, 113, 1.16, 1.16], [22.4, 152, 114, 1.12, 1.12], [25.2, 147, 116, 1.32, 1.32],
  [27.0, 146, 118, 1.9, 1.9], [29.6, 148, 118, 1.44, 1.44], [32.0, 150, 120, 1.4, 1.4],
  [38.0, 166, 120, 1.14, 1.14], [40.4, 176, 120, 1.03, 1.03], [42.0, 180, 120, 1.01, 1.01],
  [44.0, 186, 118, 1.02, 1.02], [53.4, 196, 118, 1.06, 1.06], [55.6, 198, 118, 1.04, 1.18],
  [58.6, 198, 118, 1.04, 1.16], [60.6, 194, 122, 1.05, 1.05], [62.4, 194, 124, 1.04, 1.04],
  [64.2, 192, 124, 1.04, 1.04],
  [71.2, 184, 116, 1.1, 1.1], [72.8, 182, 114, 1.12, 1.12], [85.6, 182.2, 113.8, 1.121, 1.121],
  [86.4, 180, 112, 1.1, 1.1], [88.6, 172, 112, 1.04, 1.04], [94.2, 150, 108, 1.0, 1.0],
  [102.0, 150, 108, 1.0, 1.0], [102.8, 148, 116, 1.36, 1.36], [104.6, 146, 118, 2.16, 2.16],
  [116.4, 146, 118, 2.3, 2.3], [117.4, 146, 118, 2.06, 2.06], [118.6, 152, 110, 1.3, 1.3],
  [120.0, 160, 100, 1.0, 1.0], [127.0, 160, 100, 1.0, 1.0],
];
/* the looping photon of beat 05 - the camera borrows this same path */
function SHPP(p: number) {
  const A0 = Math.atan2(108 - HY, 200 - HX),
    th = A0 - TAU * 2 * p,
    rr = lp(53, 42, Math.sin(Math.PI * p));
  return [HX + Math.cos(th) * rr, HY + Math.sin(th) * rr];
}
function SHQ(t: number) {
  return ss(cl((t - 89.4) / 4.6));
}
function SHCAM(t: number): CamV {
  const k = KFR(t, SHCK);
  let fx = k[1],
    fy = k[2];
  let z = k[3],
    zy = k[4];
  const w = (sg(t, 90.0, 90.8) - sg(t, 93.2, 94.0)) * 0.55;
  if (w > 0) {
    const pt = SHPP(SHQ(t));
    fx = lp(fx, pt[0], w);
    fy = lp(fy, pt[1], w);
  }
  /* hand-held drift, stilled where a static frame is the point */
  const dr = 1 - Math.max(sg(t, 73.0, 74.0) - sg(t, 85.4, 86.2), sg(t, 119.4, 120.4));
  fx += Math.sin(t * 0.13) * 1.5 * dr;
  fy += Math.sin(t * 0.097 + 1.4) * 1.1 * dr;
  z *= 1 + 0.005 * Math.sin(t * 0.21) * dr;
  zy *= 1 + 0.005 * Math.sin(t * 0.21) * dr;
  return { fx: fx, fy: fy, z: z, zy: zy };
}

/* ---- the three objects that live for the whole film ------------------- */
const SHHK = [
  [7.0, 0.7, 0], [7.8, 0.9, 1], [10.6, 1.1, 1], [12.0, 4.6, 1], [14.4, 6, 1], [25.4, 7, 1],
  [26.8, 13, 1], [28.2, 15, 1], [116.2, 15, 1], [116.8, 8, 1], [117.4, 2, 1], [117.9, 0.5, 0],
];
const SHRK = [
  [27.0, 15, 0], [27.8, 26, 0.9], [29.0, 34, 1], [29.8, 36, 1], [116.0, 36, 1],
  [116.8, 18, 0.9], [117.4, 4, 0],
];
const SHFK = [
  [37.6, 302, 118, 1, 1], [39.6, 216, 118, 1, 1], [42.0, 214, 118, 1, 1], [53.0, 212, 118, 1, 1],
  [56.2, 210, 88, 1, 2.1], [58.6, 210, 88, 1, 2.1], [60.2, 210, 106, 1, 1.45],
  [61.6, 208, 114, 1, 1.12], [63.0, 206, 116, 1, 1.05], [71.0, 194, 118.7, 0.98, 1], [72.6, 186, 119.7, 0.95, 1],
  [89.0, 186, 119.7, 0.95, 1], [101.0, 188, 119.7, 0.95, 1], [103.4, 256, 119.7, 0.95, 1],
  [118.0, 256, 119.7, 0.95, 1],
];

function SHHOLE(g: Ctx, t: number) {
  const k = KFR(t, SHHK),
    r = k[1],
    a = k[2];
  if (t < SHHK[0][0] || a <= 0.004) return;
  if (r < 2.2) {
    g.globalAlpha = a;
    D(g, HX, HY, Math.max(0.9, r * 1.6), CH.gold);
    g.globalAlpha = a * 0.26;
    D(g, HX, HY, r * 5 + 2.6 + Math.sin(t * 2.4) * 0.7, CH.gold);
    g.globalAlpha = 1;
    return;
  }
  BH(g, HX, HY, r, t, a * 0.9, a);
}
/* the horizon: created once, then quietly alive for as long as it is up */
function SHRING(g: Ctx, t: number) {
  if (t < SHRK[0][0]) return;
  const k = KFR(t, SHRK),
    r = k[1],
    a = k[2],
    sw = ss(cl((t - 27.1) / 1.8)),
    pu = 0.5 + 0.5 * Math.sin(t * 2.05);
  if (a <= 0.004 || r <= 0.4) return;
  g.save();
  g.globalAlpha = a * 0.72;
  g.setLineDash([4, 4.6]);
  g.lineDashOffset = -t * 7;
  g.strokeStyle = CH.blue;
  g.lineWidth = 1.2;
  g.beginPath();
  g.arc(HX, HY, r, -Math.PI / 2, -Math.PI / 2 + TAU * sw);
  g.stroke();
  g.globalAlpha = a * (0.11 + 0.12 * pu);
  g.setLineDash([1.6, 5]);
  g.lineDashOffset = t * 4;
  g.lineWidth = 0.85;
  g.beginPath();
  g.arc(HX, HY, Math.max(1, r - 3.6), 0, TAU);
  g.stroke();
  g.setLineDash([]);
  g.globalAlpha = a * (0.05 + 0.06 * pu);
  g.lineWidth = 3.6;
  g.beginPath();
  g.arc(HX, HY, r + 1.8, 0, TAU);
  g.stroke();
  g.restore();
  g.globalAlpha = 1;
}
function SHGROUND(g: Ctx, t: number) {
  const a = cl(sg(t, 37.6, 38.6) - sg(t, 52.6, 53.6) + sg(t, 59.0, 60.0) - sg(t, 101.0, 102.0));
  if (a <= 0.004) return;
  AL(g, a, 0.26);
  L(g, 110, 151.5, 332, 151.5, CH.blue, 1);
  g.globalAlpha = 1;
}

/* the figure - one body, keyframed, posed by absolute time -------------- */
type Pose = {
  a0: number;
  a1: number;
  lean: number;
  mouth: number | "o" | "O";
  eye: string;
  nd: number;
  lw: number;
  red: number;
  beard: number;
};
function SHPOSE(t: number): Pose {
  const look = sg(t, 38.2, 39.6),
    np = sg(t, 39.8, 40.6) - sg(t, 42.6, 43.6),
    set = sg(t, 42.6, 43.8),
    str = sg(t, 53.0, 56.2),
    rel = sg(t, 58.8, 60.2),
    wv = sg(t, 71.0, 72.4),
    bd = sg(t, 103.0, 109.0);
  let a0 = 212,
    a1 = -32,
    lean = 0,
    nd = 0,
    lw = 2.2;
  let mouth: number | "o" | "O" = 0.45,
    eye = "dot";
  a1 = lp(a1, 152, look);
  a0 = lp(a0, 138, np);
  a1 = lp(a1, 118, np);
  lean -= np * 0.5;
  a0 = lp(a0, 206, set);
  a1 = lp(a1, 18, set);
  a0 = lp(a0, 252, str);
  a1 = lp(a1, -58, str);
  nd = str * 0.5;
  lw = lp(2.2, 1.5, str);
  a1 = lp(a1, -58 + Math.sin((t - 58.8) * 8.4) * 46 * Math.exp(-cl(t - 58.8) * 1.2), rel);
  a1 = lp(a1, 58 + Math.sin(20 * (1 - Math.exp(-cl(t - 71.0) / 2.6))) * 36, wv);
  const red = sg(t, 71.6, 76.0) * 0.9;
  if (t > 103.4) eye = "shut";
  else if (str > 0.3 && t < 59.8) eye = "wide";
  else if (np > 0.4) eye = "wide";
  if (str > 0.5 && t < 59.6) mouth = "O";
  else if (rel > 0.4 && t < 61.4) mouth = "o";
  else if (np > 0.4) mouth = -0.5;
  else if (t > 72.6) mouth = 0.3;
  return { a0: a0, a1: a1, lean: lean, mouth: mouth, eye: eye, nd: nd, lw: lw, red: red, beard: bd * 0.85 };
}
function SHFIG(g: Ctx, t: number) {
  const al = sg(t, 37.6, 38.3) - sg(t, 117.6, 118.3);
  if (al <= 0.004) return;
  const k = KFR(t, SHFK),
    a = KFR(t - 0.07, SHFK),
    b = KFR(t + 0.07, SHFK);
  const vx = (b[1] - a[1]) / 0.14,
    vy = (b[2] - a[2]) / 0.14,
    sp = Math.hypot(vx, vy);
  const wk = cl((sp - 3) / 12) * (1 - cl((sp - 30) / 22)),
    sm = cl((sp - 34) / 34);
  const P = SHPOSE(t),
    ph = t * 8.4,
    sw = Math.sin(ph) * 1.05 * wk,
    bob = Math.abs(Math.sin(ph)) * 1.4 * wk;
  const o: SFOpt = {
    hx: k[1],
    hy: k[2],
    s: k[3],
    st: k[4],
    lw: P.lw,
    nd: P.nd,
    lean: P.lean,
    beard: P.beard,
    eye: P.eye,
    mouth: P.mouth,
    ph: ph,
    arms: [P.a0 + sw * 30, P.a1 + sw * 30],
    legs: [-1 + sw * 0.9, 1 + sw * 0.9],
    c: P.red > 0 ? MX(INK, RED, P.red * 0.55) : CH.ink,
  };
  if (sm > 0.02)
    for (let i = 2; i >= 1; i--) {
      o.hx = k[1] - vx * i * 0.032;
      o.hy = k[2] - vy * i * 0.032 - bob;
      g.globalAlpha = al * (1 - sm * 0.45) * 0.2 * sm;
      SF(g, o);
    }
  o.hx = k[1];
  o.hy = k[2] - bob;
  g.globalAlpha = al * (1 - sm * 0.45);
  SF(g, o);
  g.globalAlpha = 1;
}

/* 01 - the sheet, and the dent everything rolls into ------------------- */
function SHGRID(g: Ctx, t: number) {
  const gA = cl(sg(t, 8.6, 10.2) - sg(t, 22.6, 24.0)),
    u = t - 10.6,
    cx = HX,
    cy = HY - 14,
    rip = sg(t, 13.4, 15.0);
  if (gA <= 0.004) return;
  let i: number, j: number, xx: number, yy: number, oy: number, sp: number, pj: number;
  const DZ = function (x: number, y: number) {
    const dd = Math.hypot((x - cx) * 0.66, (y - cy) * 1.5),
      dp = 27 * OSH(cl((u - dd * 0.006) / 2.4));
    return dp / (1 + Math.pow(dd / 24, 2.5)) + Math.sin(u * 1.7 - dd * 0.13) * 1.05 * rip * cl(dp / 27);
  };
  g.strokeStyle = CH.blue;
  g.lineWidth = 0.9;
  g.lineJoin = "round";
  for (j = 0; j < 9; j++) {
    pj = j / 8;
    yy = 84 + 62 * Math.pow(pj, 1.25);
    sp = lp(0.52, 1, pj);
    g.globalAlpha = gA * 0.32;
    g.beginPath();
    for (i = 0; i <= 46; i++) {
      xx = lp(cx - 136 * sp, cx + 136 * sp, i / 46);
      oy = yy + DZ(xx, yy);
      if (i) g.lineTo(xx, oy);
      else g.moveTo(xx, oy);
    }
    g.stroke();
  }
  for (i = 0; i <= 12; i++) {
    g.globalAlpha = gA * 0.24;
    g.beginPath();
    for (j = 0; j <= 28; j++) {
      pj = j / 28;
      yy = 84 + 62 * Math.pow(pj, 1.25);
      sp = lp(0.52, 1, pj);
      xx = lp(cx - 136 * sp, cx + 136 * sp, i / 12);
      oy = yy + DZ(xx, yy);
      if (j) g.lineTo(xx, oy);
      else g.moveTo(xx, oy);
    }
    g.stroke();
  }
  g.globalAlpha = 1;
}
function SHORB(g: Ctx, t: number) {
  const ob = cl(sg(t, 19.2, 20.1) - sg(t, 22.4, 23.2)),
    oa = -t * 2.1;
  if (ob <= 0.004) return;
  g.globalAlpha = ob * 0.36;
  g.strokeStyle = CH.blue;
  g.lineWidth = 0.9;
  g.setLineDash([2.6, 3.4]);
  g.beginPath();
  g.ellipse(HX, HY - 2, 44, 14, 0, 0, TAU);
  g.stroke();
  g.setLineDash([]);
  g.globalAlpha = ob;
  D(g, HX + Math.cos(oa) * 44, HY - 2 + Math.sin(oa) * 14, 2.3, CH.blue);
  g.globalAlpha = 1;
}

/* 05 - the loop, and the trail it leaves behind ------------------------ */
function SHTRAIL(g: Ctx, t: number) {
  const a = cl(sg(t, 89.6, 90.4) - sg(t, 101.2, 102.4)),
    q = SHQ(t);
  if (a <= 0.004) return;
  g.strokeStyle = CH.gold;
  g.lineWidth = 1.1;
  g.lineJoin = "round";
  g.lineCap = "round";
  g.globalAlpha = a * 0.3;
  g.beginPath();
  for (let i = 0; i <= 110; i++) {
    const pt = SHPP((q * i) / 110);
    if (i) g.lineTo(pt[0], pt[1]);
    else g.moveTo(pt[0], pt[1]);
  }
  g.stroke();
  g.globalAlpha = a * 0.2;
  g.setLineDash([2, 7]);
  g.lineDashOffset = -t * 26;
  g.stroke();
  g.setLineDash([]);
  g.globalAlpha = 1;
}
function SHPHOT(g: Ctx, t: number) {
  const a = cl(sg(t, 89.4, 89.9) - sg(t, 94.4, 95.0));
  if (a <= 0.004) return;
  const pt = SHPP(SHQ(t));
  g.globalAlpha = a;
  D(g, pt[0], pt[1], 2.2, "#ffe4a6");
  g.globalAlpha = a * 0.3;
  D(g, pt[0], pt[1], 4.8 + Math.sin(t * 5) * 0.7, CH.gold);
  g.globalAlpha = 1;
}
function SHGHOST(g: Ctx, t: number) {
  const a = cl(sg(t, 94.4, 95.2) - sg(t, 101.4, 102.2));
  if (a <= 0.004) return;
  g.globalAlpha = a * 0.4;
  SF(g, { hx: 86, hy: 96, s: 0.9, arms: [212, 60 + Math.sin((t - 72) * 0.4) * 24], legs: [-1, 1], eye: "back" });
  g.globalAlpha = 1;
}

/* 06 - the leak ------------------------------------------------------- */
function SHLEAK(g: Ctx, t: number) {
  const a = cl(sg(t, 104.6, 105.8)),
    R = rng(913),
    k = KFR(t, SHHK),
    r = k[1],
    pop = sg(t, 116.2, 116.8),
    cool = 1 - 0.55 * sg(t, 108.6, 109.4);
  if (a <= 0.004 || t > 119) return;
  let i: number, ang: number;
  for (i = 0; i < 34; i++) {
    ang = R() * TAU;
    const spd = 14 + R() * 26,
      phz = (t * spd * 0.6 + R() * 40) % 40,
      rr = r + 2 + phz * 1.35;
    if (rr > 42) continue;
    g.globalAlpha = a * cl(1 - phz / 24) * 0.7 * cool * (1 - pop);
    g.fillStyle = i % 3 ? CH.gold : "#ffe6ad";
    g.fillRect(HX + Math.cos(ang) * rr, HY + Math.sin(ang) * rr, 1.3, 1.3);
  }
  g.globalAlpha = 1;
  if (pop > 0 && pop < 1)
    for (i = 0; i < 11; i++) {
      ang = (i / 11) * TAU;
      AL(g, cl(pop * (1 - pop) * 4) * 0.75);
      L(
        g,
        HX + Math.cos(ang) * (5 + pop * 14),
        HY + Math.sin(ang) * (5 + pop * 14),
        HX + Math.cos(ang) * (11 + pop * 26),
        HY + Math.sin(ang) * (11 + pop * 26),
        CH.gold,
        1.2,
      );
    }
  g.globalAlpha = 1;
}
/* his watch lives in the world, beside him */
function SHDIAL(g: Ctx, t: number) {
  const fs = FS(t, 78.6, 81.6, 86.0);
  if (!fs.on) return;
  const ang = -Math.PI / 2 + 3.1 * (1 - Math.exp(-cl(t - 78.6) / 3.6));
  CLK(g, 224, 104, 12.5, ang, FC(fs, RED, RED2), FC(fs, RED, RED2), fs.a, 1.6);
  AL(g, fs.a, 0.28);
  g.setLineDash([1.8, 3.4]);
  L(g, 200, 110, 211, 106, CH.red, 0.9);
  g.setLineDash([]);
  g.globalAlpha = 1;
}

/* ---- screen-space type: fixed slots, one hot at a time --------------- */
function SHTEXT(g: Ctx, t: number) {
  let fs: Focus, f2: Focus, p: number[];
  /* 00 title */
  fs = FS(t, 0.25, 3.4, 6.8, 0.66);
  if (fs.on) {
    AL(g, fs.a, 0.45);
    L(g, 28, 66, 28 + 150 * ss(cl(fs.u / 1.4)), 66, FC(fs, BLU, BLU2), 1.1);
    g.globalAlpha = 1;
    FT(g, fs, { txt: "BLACK HOLES", x: 28, y: 84, sz: 27, c: FC(fs, INK, [182, 178, 170]), wt: 700, stag: 0.13, dur: 0.6 });
  }
  fs = FS(t, 3.6, 7.2, 8.0);
  FT(g, fs, { txt: "a field guide for people who will ignore it", x: 28, y: 106, sz: 8.4, c: FC(fs, BLU, BLU2), stag: 0.035 });
  /* 01 the dent */
  HDR(g, t, "01", "Gravity is just a dent.", 8.4, 10.2, 21.8);
  BOT(g, FS(t, 14.0, 18.2, 19.4), "not a rope pulling you. a dent that everything rolls into.", 157, 8.5, CH.ink2, 282);
  fs = FS(t, 19.6, undefined, 23.0);
  if (fs.on) {
    FT(g, fs, { txt: "this one is fine.", x: 302, y: 48, sz: 7.6, c: FC(fs, INK, INK2), al: "right", stag: 0.03 });
    FT(g, fs, { txt: "it is in orbit.", x: 302, y: 60, sz: 7.6, c: FC(fs, BLU, BLU2), al: "right", stag: 0.03, d: 0.4 });
  }
  /* 02 the horizon */
  HDR(g, t, "02", "The line you do not cross.", 23.6, 25.4, 42.0);
  fs = FS(t, 30.4, 32.8, 37.4);
  if (fs.on) {
    p = PJ(HX + 25.5, HY - 25.5);
    AL(g, fs.A, 0.4);
    L(g, p[0] + 2, p[1] - 2, 228, 52, CH.blue, 0.9);
    g.globalAlpha = 1;
    SCR(g, fs.A * 0.8, 268, 55, 80, 30);
    FT(g, fs, { txt: "EVENT HORIZON", x: 302, y: 48, sz: 8.4, c: FC(fs, BLU, BLU2), al: "right", stag: 0.028 });
  }
  f2 = FS(t, 33.0, 35.6, 37.6);
  FT(g, f2, { txt: "one way. no exits.", x: 302, y: 61, sz: 7.6, c: FC(f2, INK, INK2), al: "right", stag: 0.028 });
  BOT(g, FS(t, 35.8, 40.0, 41.4), "past this line, every road out points back in.", 157, 8.5, CH.ink2, 244);
  fs = FS(t, 40.4, 42.2, 43.0);
  if (fs.on) {
    p = PJ(210, 100);
    FT(g, fs, { txt: "nope", x: CLP(p[0], 60, 296), y: CLP(p[1], 30, 150), sz: 13, c: CH.red, wt: 700, al: "right", stag: 0.04 });
  }
  /* 03 tides, then the word */
  HDR(g, t, "03", "The pull is not the problem.", 43.6, 45.4, 67.6);
  BOT(g, FS(t, 45.6, 48.4, 49.0), "the pull is fine.", 157, 8.5, CH.ink2, 116);
  BOT(g, FS(t, 49.2, 52.4, 53.0), "the difference across you is not.", 157, 8.5, CH.ink2, 196);
  fs = FS(t, 54.4, 56.8, 59.6);
  if (fs.on) {
    const kk = KFR(t, SHFK);
    p = PJ(kk[1], kk[2] - 15);
    AL(g, fs.a, 0.85);
    AR(g, p[0], p[1] - 3, p[0], p[1] - 15, CH.blue, 1.3);
    g.globalAlpha = 1;
    FT(g, fs, { txt: "head: less", x: CLP(p[0], 52, 288), y: CLP(p[1] - 24, 26, 160), sz: 7.6, c: FC(fs, BLU, BLU2), al: "center", stag: 0.028 });
  }
  fs = FS(t, 57.0, 59.0, 59.8);
  if (fs.on) {
    const k2 = KFR(t, SHFK);
    p = PJ(k2[1], k2[2] + SFH(k2[3], k2[4]));
    AL(g, fs.a, 0.85);
    AR(g, p[0], p[1] + 3, p[0], p[1] + 15, CH.gold, 1.4);
    g.globalAlpha = 1;
    FT(g, fs, { txt: "feet: more", x: CLP(p[0], 52, 288), y: CLP(p[1] + 25, 30, 168), sz: 7.6, c: FC(fs, GLD, GLD2), al: "center", stag: 0.028 });
  }
  fs = FS(t, 60.6, 63.4, 66.6);
  if (fs.on) {
    SCR(g, fs.A * 0.9, 160, 140, 238, 24);
    FT(g, fs, { txt: "SPAGHETTIFICATION", x: 160, y: 140, sz: 13, c: FC(fs, GLD, GLD2), wt: 700, al: "center", stag: 0.055 });
  }
  fs = FS(t, 63.6, 66.0, 66.8);
  FT(g, fs, { txt: "(the actual term)", x: 160, y: 156, sz: 7.6, c: FC(fs, INK, INK2), al: "center", stag: 0.03 });
  fs = FS(t, 66.2, undefined, 68.6);
  if (fs.on) {
    FORK(g, 142, 173, fs.a);
    FT(g, fs, { txt: "al dente", x: 152, y: 173, sz: 7.6, c: FC(fs, GLD, GLD2), stag: 0.03, d: 0.16 });
  }
  /* 04 frozen time */
  HDR(g, t, "04", "Out here, he never lands.", 69.4, 71.2, 84.6);
  BOT(g, FS(t, 73.0, 77.0, 78.2), "he waves goodbye. from out here the wave never finishes.", 157, 8.5, CH.ink2, 272);
  fs = FS(t, 78.8, 81.6, 86.0);
  if (fs.on) {
    p = PJ(224, 120);
    FT(g, fs, { txt: "his watch", x: CLP(p[0], 48, 290), y: CLP(p[1], 28, 150), sz: 7.6, c: FC(fs, RED, RED2), al: "center", stag: 0.03 });
    FT(g, fs, { txt: "barely moves", x: CLP(p[0], 48, 290), y: CLP(p[1] + 11, 38, 162), sz: 6.8, c: FC(fs, INK, INK2), al: "center", stag: 0.026, d: 0.3 });
  }
  fs = FS(t, 82.0, undefined, 86.2);
  if (fs.on) {
    SCR(g, fs.A * 0.8, 258, 54, 124, 34);
    CLK(g, 296, 54, 12.5, -Math.PI / 2 + t * 3.6, FC(fs, INK, INK2), FC(fs, INK, INK2), fs.a, 1.5);
    FT(g, fs, { txt: "your watch", x: 274, y: 48, sz: 7.6, c: FC(fs, INK, INK2), al: "right", stag: 0.03 });
    FT(g, fs, { txt: "runs normally", x: 274, y: 60, sz: 6.8, c: FC(fs, INK, INK2), al: "right", stag: 0.026, d: 0.3 });
  }
  /* 05 the loop */
  HDR(g, t, "05", "Wave at your own back.", 87.0, 88.8, 99.6);
  fs = FS(t, 95.4, 97.8, 100.6);
  if (fs.on) {
    p = PJ(74, 143);
    FT(g, fs, { txt: "you, from behind", x: CLP(p[0], 56, 270), y: CLP(p[1], 30, 150), sz: 7.4, c: FC(fs, BLU, BLU2), al: "center", stag: 0.03 });
  }
  BOT(g, FS(t, 98.0, undefined, 101.6), "light can loop around and bring the back of your head home.", 157, 8.5, CH.ink2, 286);
  /* 06 the leak */
  HDR(g, t, "06", "They leak.", 102.6, 104.4, 112.6);
  BOT(g, FS(t, 108.4, 111.8, 113.0), "black holes do leak. this one is gone in 10^67 years.", 157, 8.5, CH.ink2, 258);
  BOT(g, FS(t, 113.2, 115.2, 116.0), "bring a book.", 172, 7.6, CH.ink2, 96);
  fs = FS(t, 116.6, undefined, 119.4);
  if (fs.on) {
    BST(g, 160, 132, fs.a * 0.9);
    FT(g, fs, { txt: "poof.", x: 160, y: 150, sz: 14, c: FC(fs, GLD, GLD2), wt: 700, al: "center", stag: 0.04, d: 0.2 });
  }
  /* 07 verdict - the frame is finally still */
  fs = FS(t, 120.0, undefined, 126.4);
  if (fs.on) {
    FT(g, fs, { txt: "Verdict:", x: 24, y: 72, sz: 17, c: CH.ink, wt: 700, stag: 0.055, dur: 0.5 });
    FT(g, fs, { txt: "admire from a distance.", x: 24, y: 94, sz: 17, c: CH.ink, wt: 700, stag: 0.055, dur: 0.5, d: 0.34 });
    AL(g, fs.A, 0.4);
    L(g, 24, 110, 24 + 228 * ss(cl((fs.u - 1.4) / 1.1)), 110, CH.blue, 0.9);
    g.globalAlpha = 1;
    f2 = FS(t, 122.2, undefined, 126.4);
    FT(g, f2, { txt: 'prompt: "explain black holes with a stick', x: 24, y: 128, sz: 8, c: CH.blue, stag: 0.026, op: 0.9 });
    FT(g, f2, { txt: 'figure, and make it funny."', x: 24, y: 140, sz: 8, c: CH.blue, stag: 0.026, op: 0.9, d: 0.24 });
  }
}

/* ---------- more chalkboard explainers -----------------------------------
   Same kit as the black-hole film: one focal point per beat, a chapter
   header that settles to context ink, a single bottom caption slot, and a
   verdict card that names the prompt it came from.                       */
function EXDUST(g: Ctx, t: number, T: number, seed: number, A0?: number) {
  const A = cl(sg(t, 0.1, 1.8) - sg(t, T - 2.2, T - 0.6)) * (A0 === undefined ? 0.8 : A0),
    R = rng(seed);
  if (A <= 0.004) return;
  for (let i = 0; i < 74; i++) {
    const x = -40 + R() * 400,
      y = -30 + R() * 260,
      r = 0.2 + R() * 0.46,
      q = R(),
      tw = 0.45 + 0.55 * Math.sin(t * (0.4 + q * 1.1) + q * 15);
    g.globalAlpha = A * (0.1 + R() * 0.26) * tw;
    g.fillStyle = i % 9 === 0 ? "#b9cdf0" : "#e9e6de";
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    g.fill();
  }
  g.globalAlpha = 1;
}
/* the card every explainer lands on */
function EXEND(g: Ctx, t: number, tin: number, tout: number, l1: string, l2: string, p1: string, p2: string) {
  const fs = FS(t, tin, undefined, tout);
  if (!fs.on) return;
  FT(g, fs, { txt: l1, x: 24, y: 72, sz: 17, c: CH.ink, wt: 700, stag: 0.055, dur: 0.5 });
  FT(g, fs, { txt: l2, x: 24, y: 94, sz: 17, c: CH.ink, wt: 700, stag: 0.055, dur: 0.5, d: 0.34 });
  AL(g, fs.A, 0.4);
  L(g, 24, 110, 24 + 228 * ss(cl((fs.u - 1.4) / 1.1)), 110, CH.blue, 0.9);
  g.globalAlpha = 1;
  const f2 = FS(t, tin + 2.2, undefined, tout);
  FT(g, f2, { txt: p1, x: 24, y: 128, sz: 8, c: CH.blue, stag: 0.026, op: 0.9 });
  FT(g, f2, { txt: p2, x: 24, y: 140, sz: 8, c: CH.blue, stag: 0.026, op: 0.9, d: 0.24 });
}
function EXCAM(t: number, ks: number[][], tout: number): CamV {
  const k = KFR(t, ks),
    dr = 1 - sg(t, tout, tout + 1);
  return {
    fx: k[1] + Math.sin(t * 0.13) * 1.4 * dr,
    fy: k[2] + Math.sin(t * 0.097 + 1.3) * 1 * dr,
    z: k[3] * (1 + 0.005 * Math.sin(t * 0.21) * dr),
    zy: k[4] * (1 + 0.005 * Math.sin(t * 0.21) * dr),
  };
}

/* ==== entropy: one tidy room, and every other room ====================== */
const EMT = 54;
const EMCK = [
  [0, 160, 92, 1.16, 1.16], [3.2, 160, 96, 1.06, 1.06], [6.4, 160, 100, 1, 1],
  [8.2, 156, 104, 1.1, 1.1], [13.4, 156, 104, 1.12, 1.12], [15.2, 150, 102, 1.2, 1.2],
  [19.6, 150, 102, 1.18, 1.18], [21.2, 160, 104, 1.04, 1.04], [27.2, 160, 104, 1.02, 1.02],
  [33.8, 160, 104, 1.02, 1.02], [35.2, 158, 102, 1.1, 1.1], [42.2, 158, 102, 1.08, 1.08],
  [44.2, 160, 100, 1, 1], [54, 160, 100, 1, 1],
];
const EMFK = [
  [7.4, 332, 118, 1, 1], [9.9, 266, 118, 1, 1], [21.6, 266, 118, 1, 1], [23.2, 274, 118, 1, 1],
  [44.8, 274, 118, 1, 1], [47.0, 306, 118, 1, 1],
];
/* how far the room has wandered from its one tidy arrangement */
function EMM(t: number) {
  const a = sg(t, 20.8, 27.2),
    b = sg(t, 35.2, 38.6),
    c = sg(t, 39.8, 42.2);
  return Math.max(a * (1 - b), c);
}
function EMPT(o: Scene, i: number) {
  if (!o._emP) {
    const R = rng(2207),
      P: EmPt[] = [];
    for (let k = 0; k < 14; k++) {
      const c = k % 4,
        r = (k / 4) | 0;
      P.push({ lx: 104 + c * 36, ly: 84 + r * 17, tx: 94 + R() * 128, ty: 78 + R() * 54, q: R() });
    }
    o._emP = P;
  }
  return o._emP[i];
}
function EMGND(g: Ctx, t: number) {
  const a = cl(sg(t, 7.4, 8.6) - sg(t, 46.8, 47.8));
  if (a <= 0.004) return;
  AL(g, a, 0.24);
  L(g, 66, 151.5, 326, 151.5, CH.blue, 1);
  g.globalAlpha = 1;
}
function EMROOM(g: Ctx, t: number) {
  const a = cl(sg(t, 7.0, 8.4) - sg(t, 45.6, 46.8)),
    p = ss(cl((t - 7.0) / 1.7)),
    x = 86,
    y = 72,
    w = 150,
    h = 68;
  if (a <= 0.004) return;
  AL(g, a, 0.34);
  g.strokeStyle = CH.blue;
  g.lineWidth = 1;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x + w * p, y);
  g.moveTo(x + w, y);
  g.lineTo(x + w, y + h * p);
  g.moveTo(x + w, y + h);
  g.lineTo(x + w - w * p, y + h);
  g.moveTo(x, y + h);
  g.lineTo(x, y + h - h * p);
  g.stroke();
  g.globalAlpha = 1;
}
function EMDOTS(g: Ctx, t: number, o: Scene) {
  const a = cl(sg(t, 8.2, 9.4) - sg(t, 45.6, 46.6)),
    m = EMM(t);
  if (a <= 0.004) return;
  for (let i = 0; i < 14; i++) {
    const P = EMPT(o, i),
      ap = a * ss(cl((t - 8.2 - i * 0.16) / 0.7)),
      pp = ss(cl(m * 1.42 - i * 0.026));
    const x = lp(P.lx, P.tx, pp) + Math.sin(t * (0.7 + P.q * 1.05) + P.q * 19) * 4.2 * pp,
      y = lp(P.ly, P.ty, pp) + Math.cos(t * (0.62 + P.q * 0.9) + P.q * 11) * 2.8 * pp;
    g.globalAlpha = ap;
    D(g, CLP(x, 90, 232), CLP(y, 76, 136), 2.15, MX(INK, GLD, pp * 0.72));
  }
  g.globalAlpha = 1;
}
function EMFIG(g: Ctx, t: number) {
  const al = sg(t, 7.4, 8.2) - sg(t, 47.0, 47.8);
  if (al <= 0.004) return;
  const k = KFR(t, EMFK),
    a = KFR(t - 0.07, EMFK),
    b = KFR(t + 0.07, EMFK);
  const vx = (b[1] - a[1]) / 0.14,
    wk = cl((Math.abs(vx) - 3) / 12),
    ph = t * 8.2,
    sw = Math.sin(ph) * 1.05 * wk,
    bob = Math.abs(Math.sin(ph)) * 1.4 * wk;
  const proud = sg(t, 10.0, 11.4) - sg(t, 21.4, 22.6),
    shock = sg(t, 22.6, 23.8) - sg(t, 42.8, 44.0),
    shrug = sg(t, 43.2, 44.6);
  let a0 = lp(196, 152, proud),
    a1 = lp(-24, 196, proud);
  a0 = lp(a0, 238, shock);
  a1 = lp(a1, -56, shock);
  a0 = lp(a0, 214, shrug);
  a1 = lp(a1, -34, shrug);
  g.globalAlpha = al;
  SF(g, {
    hx: k[1],
    hy: k[2] - bob,
    s: 1,
    c: CH.ink,
    lw: 2.2,
    ph: ph,
    nd: wk * 0.12,
    arms: [a0 + sw * 26, a1 + sw * 26],
    legs: [-1 + sw * 0.9, 1 + sw * 0.9],
    eye: shock > 0.4 ? "wide" : "dot",
    mouth: shock > 0.4 ? -0.5 : proud > 0.4 ? 0.55 : 0.35,
  });
  g.globalAlpha = 1;
}
/* the rewind badge for beat 04 */
function EMREW(g: Ctx, t: number) {
  const fs = FS(t, 35.0, 38.8, 39.6);
  if (!fs.on) return;
  const c = FC(fs, BLU, BLU2);
  AL(g, fs.a, 0.9);
  g.strokeStyle = c;
  g.lineWidth = 1.1;
  g.beginPath();
  g.arc(252, 60, 7.5, -2.5, 1.9);
  g.stroke();
  g.globalAlpha = 1;
  AL(g, fs.a, 0.9);
  AR(g, 252 + Math.cos(1.9) * 7.5, 60 + Math.sin(1.9) * 7.5, 252 + Math.cos(2.6) * 8.8, 60 + Math.sin(2.6) * 8.8, c, 1.1);
  g.globalAlpha = 1;
  FT(g, fs, { txt: "rewind", x: 252, y: 76, sz: 7, c: c, al: "center", stag: 0.03 });
}
function EMTEXT(g: Ctx, t: number) {
  let fs: Focus;
  fs = FS(t, 0.25, 3.2, 6.4, 0.66);
  if (fs.on) {
    AL(g, fs.a, 0.45);
    L(g, 28, 66, 28 + 150 * ss(cl(fs.u / 1.4)), 66, FC(fs, BLU, BLU2), 1.1);
    g.globalAlpha = 1;
    FT(g, fs, { txt: "ENTROPY", x: 28, y: 84, sz: 27, c: FC(fs, INK, [182, 178, 170]), wt: 700, stag: 0.13, dur: 0.6 });
  }
  fs = FS(t, 3.4, 6.6, 7.4);
  FT(g, fs, { txt: "why tidy never stays tidy", x: 28, y: 106, sz: 8.4, c: FC(fs, BLU, BLU2), stag: 0.035 });
  HDR(g, t, "01", "One tidy room.", 7.6, 9.4, 13.8);
  BOT(g, FS(t, 10.8, 12.8, 13.8), "fourteen things, each exactly where it goes.", 168, 8.5, CH.ink2, 250);
  HDR(g, t, "02", "There is one way to be tidy.", 14.2, 16.0, 20.4);
  fs = FS(t, 15.6, 18.4, 20.2);
  if (fs.on) {
    FT(g, fs, { txt: "1 arrangement", x: 298, y: 82, sz: 8.4, c: FC(fs, BLU, BLU2), al: "right", stag: 0.03 });
    FT(g, fs, { txt: "this one", x: 298, y: 94, sz: 7.2, c: FC(fs, INK, INK2), al: "right", stag: 0.028, d: 0.3 });
  }
  BOT(g, FS(t, 17.6, 19.6, 20.6), "exactly one arrangement counts as tidy.", 168, 8.5, CH.ink2, 232);
  HDR(g, t, "03", "And a great many that are not.", 20.8, 22.6, 33.8);
  fs = FS(t, 24.2, 28.4, 33.4);
  if (fs.on) {
    FT(g, fs, { txt: "10^13 arrangements", x: 298, y: 82, sz: 8.4, c: FC(fs, GLD, GLD2), al: "right", stag: 0.03 });
    FT(g, fs, { txt: "also this one", x: 298, y: 94, sz: 7.2, c: FC(fs, INK, INK2), al: "right", stag: 0.028, d: 0.3 });
  }
  BOT(g, FS(t, 27.6, 30.2, 31.0), "nobody knocked anything over. it just wandered.", 168, 8.5, CH.ink2, 262);
  BOT(g, FS(t, 31.2, 33.4, 34.2), "mess is not a force. it is a headcount.", 168, 8.5, CH.ink2, 226);
  HDR(g, t, "04", "Time is not the villain.", 34.4, 36.2, 45.4);
  BOT(g, FS(t, 36.4, 38.6, 39.4), "run it backwards and the tidy room is perfectly legal.", 168, 8.5, CH.ink2, 286);
  BOT(g, FS(t, 40.2, 42.4, 43.2), "legal, yes. also one ticket in ten trillion.", 168, 8.5, CH.ink2, 254);
  BOT(g, FS(t, 43.4, 45.2, 46.0), "you are not fighting physics. you are fighting arithmetic.", 168, 8.5, CH.ink2, 296);
  EXEND(g, t, 47.4, 53.4, "Verdict:", "tidy is a rental.", 'prompt: "explain entropy with a stick figure', 'who just cleaned his room."');
}

/* ==== Hilbert's hotel: full, and still taking guests ==================== */
const HTT = 52,
  HTB = 118;
const HTCK = [
  [0, 160, 94, 1.14, 1.14], [3.4, 160, 98, 1.05, 1.05], [6.8, 160, 100, 1, 1],
  [8.4, 150, 112, 1.08, 1.08], [13.6, 150, 112, 1.1, 1.1], [15.2, 78, 124, 1.22, 1.22],
  [20.8, 78, 124, 1.2, 1.2], [22.6, 140, 112, 1.06, 1.06], [28.0, 118, 112, 1.1, 1.1],
  [32.8, 118, 112, 1.1, 1.1], [34.6, 168, 110, 1.02, 1.02], [44.6, 168, 110, 1.02, 1.02],
  [46.2, 160, 100, 1, 1], [52, 160, 100, 1, 1],
];
const HNK = [
  [14.2, 8, 118, 1, 1], [16.8, 44, 118, 1, 1], [27.6, 44, 118, 1, 1], [29.6, 74, 118, 1, 1],
  [52, 74, 118, 1, 1],
];
/* the corridor runs off in perspective: room u shrinks and crowds the vanishing point */
function HDS(u: number) {
  return 1 / (1 + 0.34 * u);
}
function HDX(u: number) {
  return 62 + 88.2 * Math.log(1 + 0.34 * u);
}
/* which room guest i is standing in: n → n+1, then n → 2n */
function HTIDX(i: number, t: number) {
  const p1 = sg(t, 23.6 + i * 0.14, 24.9 + i * 0.14),
    p2 = sg(t, 37.0 + i * 0.12, 38.5 + i * 0.12);
  return lp(lp(i, i + 1, p1), 2 * i + 3, p2);
}
function HTGND(g: Ctx, t: number) {
  const a = cl(sg(t, 7.2, 8.4) - sg(t, 45.6, 46.6));
  if (a <= 0.004) return;
  AL(g, a, 0.26);
  L(g, -4, 151.5, 330, 151.5, CH.blue, 1);
  AL(g, a, 0.2);
  L(g, 40, HTB + 0.6, 292, HTB + 0.6, CH.blue, 1);
  AL(g, a, 0.11);
  L(g, -6, 152, 54, HTB + 1, CH.blue, 0.8);
  L(g, 318, 152, 272, HTB + 1, CH.blue, 0.8);
  g.globalAlpha = 1;
}
function HTDOORS(g: Ctx, t: number) {
  const a = cl(sg(t, 7.4, 8.6) - sg(t, 45.4, 46.6)),
    free = cl(sg(t, 38.6, 39.8) - sg(t, 44.6, 45.6)),
    one = cl(sg(t, 28.4, 29.4) - sg(t, 31.8, 32.8));
  if (a <= 0.004) return;
  for (let i = 0; i < 24; i++) {
    const s = HDS(i),
      x = HDX(i),
      w = 24 * s,
      h = 34 * s,
      ap = a * ss(cl((t - 7.4 - i * 0.13) / 0.8)) * cl(s * 3.4 + 0.18);
    g.globalAlpha = ap * 0.5;
    g.strokeStyle = CH.blue;
    g.lineWidth = Math.max(0.55, s);
    g.beginPath();
    g.rect(x, HTB - h, w, h);
    g.stroke();
    if ((i % 2 === 0 && free > 0.01) || (i === 0 && one > 0.01)) {
      g.globalAlpha = ap * Math.max(i === 0 ? one : 0, i % 2 === 0 ? free : 0) * 0.8;
      g.setLineDash([2.4, 2.6]);
      g.lineDashOffset = -t * 4;
      g.strokeStyle = CH.blue;
      g.beginPath();
      g.rect(x - 1.4, HTB - h - 1.4, w + 2.8, h + 2.8);
      g.stroke();
      g.setLineDash([]);
    }
    if (i < 6) {
      g.globalAlpha = ap * 0.55;
      TX(g, String(i + 1), x + w / 2, HTB - h - 5, Math.max(5, 7 * s), CH.ink2, "center");
    }
  }
  g.globalAlpha = a * 0.45;
  TX(g, "...", HDX(25) + 3, HTB - 7, 9, CH.ink2, "left");
  g.globalAlpha = 1;
}
function HTGUESTS(g: Ctx, t: number) {
  const a = cl(sg(t, 9.2, 10.4) - sg(t, 44.8, 46.0));
  if (a <= 0.004) return;
  for (let i = 0; i < 8; i++) {
    const u = HTIDX(i, t),
      s = HDS(u),
      ap = a * ss(cl((t - 9.2 - i * 0.17) / 0.7)) * cl(s * 3.6),
      hop = Math.abs(Math.sin(t * 7.4 + i)) * 2.4 * cl(Math.abs(HTIDX(i, t + 0.06) - HTIDX(i, t - 0.06)) * 26);
    g.globalAlpha = ap;
    SF(g, { hx: HDX(u) + 12 * s, hy: HTB - 24.2 * s - hop, s: 0.72 * s, c: CH.ink, lw: 2, arms: [206, -26], legs: [-1, 1], eye: "dot", mouth: 0.3 });
  }
  g.globalAlpha = 1;
}
/* the guest at the door - walks in, asks, then takes room 1 */
function HTNEW(g: Ctx, t: number) {
  const al = sg(t, 14.2, 15.2) - sg(t, 45.0, 46.0);
  if (al <= 0.004) return;
  const k = KFR(t, HNK),
    ent = sg(t, 30.0, 31.6),
    u = lp(0, 1, sg(t, 37.4, 38.9)),
    s0 = HDS(u);
  const vx = (KFR(t + 0.07, HNK)[1] - KFR(t - 0.07, HNK)[1]) / 0.14,
    wk = cl((Math.abs(vx) - 3) / 12),
    ph = t * 8.2,
    sw = Math.sin(ph) * 1.05 * wk,
    bob = Math.abs(Math.sin(ph)) * 1.4 * wk;
  const x = lp(k[1], HDX(u) + 12 * s0, ent),
    s = lp(1, 0.72 * s0, ent),
    hy = lp(k[2], HTB - 24.2 * s0, ent);
  const ask = sg(t, 17.2, 18.6) - sg(t, 23.0, 24.0),
    a0 = lp(206, 150, ask),
    a1 = lp(-26, 22, ask);
  g.globalAlpha = al;
  SF(g, {
    hx: x,
    hy: hy - bob * (1 - ent),
    s: s,
    c: CH.gold,
    lw: 2.2,
    ph: ph,
    arms: [a0 + sw * 26, a1 + sw * 26],
    legs: [-1 + sw * 0.9, 1 + sw * 0.9],
    eye: "dot",
    mouth: ask > 0.4 ? 0.5 : 0.35,
  });
  const sa = al * (1 - ent) * 0.9;
  if (sa > 0.01) {
    g.globalAlpha = sa;
    g.strokeStyle = CH.gold;
    g.lineWidth = 1.2;
    g.beginPath();
    g.rect(x + 9.5, hy + 13 - bob, 9, 7);
    g.stroke();
    L(g, x + 12, hy + 13 - bob, x + 13.6, hy + 10.8 - bob, CH.gold, 1);
    g.globalAlpha = 1;
  }
  g.globalAlpha = 1;
}
function HTARR(g: Ctx, t: number) {
  const a = cl(sg(t, 23.2, 24.2) - sg(t, 27.4, 28.4));
  if (a <= 0.004) return;
  for (let i = 0; i < 7; i++) {
    const s = HDS(i),
      y = HTB - 34 * s - 8 * Math.max(0.42, s);
    g.globalAlpha = a * 0.72 * cl(s * 3.4);
    AR(g, HDX(i) + 12 * s + 2, y, HDX(i + 1) + 12 * HDS(i + 1) - 2, y, CH.blue, Math.max(0.7, 1.1 * s));
  }
  g.globalAlpha = 1;
}
function HTSIGN(g: Ctx, t: number) {
  const fs = FS(t, 10.4, 12.8, 20.4);
  if (!fs.on) return;
  const c = FC(fs, RED, RED2);
  AL(g, fs.a, 0.85);
  g.strokeStyle = c;
  g.lineWidth = 1;
  g.beginPath();
  g.rect(226, 40, 78, 20);
  g.stroke();
  g.globalAlpha = 1;
  FT(g, fs, { txt: "NO VACANCY", x: 265, y: 50, sz: 7.6, c: c, al: "center", stag: 0.03 });
}
function HTTEXT(g: Ctx, t: number) {
  let fs: Focus;
  fs = FS(t, 0.25, 3.2, 6.4, 0.66);
  if (fs.on) {
    AL(g, fs.a, 0.45);
    L(g, 28, 66, 28 + 150 * ss(cl(fs.u / 1.4)), 66, FC(fs, BLU, BLU2), 1.1);
    g.globalAlpha = 1;
    FT(g, fs, { txt: "INFINITY", x: 28, y: 84, sz: 27, c: FC(fs, INK, [182, 178, 170]), wt: 700, stag: 0.13, dur: 0.6 });
  }
  fs = FS(t, 3.4, 6.6, 7.4);
  FT(g, fs, { txt: "a hotel with no vacancy and room for you", x: 28, y: 106, sz: 8.4, c: FC(fs, BLU, BLU2), stag: 0.035 });
  HDR(g, t, "01", "Full means full.", 7.6, 9.4, 13.6);
  BOT(g, FS(t, 11.0, 13.0, 13.8), "every room taken. and there is no last room.", 170, 8.5, CH.ink2, 254);
  HDR(g, t, "02", "Someone knocks.", 14.0, 15.8, 20.8);
  fs = FS(t, 17.4, 19.4, 20.6);
  FT(g, fs, { txt: "one room, please", x: 62, y: 88, sz: 7.6, c: FC(fs, GLD, GLD2), stag: 0.03 });
  BOT(g, FS(t, 18.9, 20.4, 21.2), "the desk says: certainly.", 170, 8.5, CH.ink2, 150);
  HDR(g, t, "03", "Everybody, one door down.", 21.4, 23.2, 32.8);
  BOT(g, FS(t, 25.4, 27.4, 28.2), "the guest in room n moves to room n+1.", 170, 8.5, CH.ink2, 232);
  fs = FS(t, 28.6, 30.6, 31.8);
  FT(g, fs, { txt: "room 1: free", x: 100, y: 126, sz: 7.6, c: FC(fs, BLU, BLU2), al: "center", stag: 0.03 });
  BOT(g, FS(t, 28.8, 31.0, 31.8), "nobody shares. nobody is turned out. there is always an n+1.", 170, 8.5, CH.ink2, 296);
  HDR(g, t, "04", "Now a whole bus.", 33.2, 35.0, 44.4);
  BOT(g, FS(t, 35.2, 37.0, 37.8), "infinitely many friends show up at once.", 170, 8.5, CH.ink2, 238);
  BOT(g, FS(t, 38.0, 40.0, 40.8), "everyone doubles their room number.", 170, 8.5, CH.ink2, 218);
  fs = FS(t, 40.4, 42.8, 44.2);
  FT(g, fs, { txt: "every odd room: free", x: 298, y: 52, sz: 8, c: FC(fs, BLU, BLU2), al: "right", stag: 0.03 });
  BOT(g, FS(t, 41.2, 43.6, 44.4), "that empties infinitely many rooms. the desk is unbothered.", 170, 8.5, CH.ink2, 296);
  EXEND(g, t, 45.4, 51.4, "Verdict:", '"full" is not a number.', "prompt: \"explain hilbert's hotel with a stick", 'figure who just wants one room."');
}

export const SCENES: Record<string, Scene> = {
  /* stick-figure black hole explainer: one take, one focal point at a time */
  stickhole: {
    T: SHT,
    poster: 30.8,
    draw(g, t) {
      CPUSH(g, SHCAM(t));
      SHGRID(g, t);
      SHORB(g, t);
      SHGROUND(g, t);
      SHTRAIL(g, t);
      SHRING(g, t);
      SHHOLE(g, t);
      SHLEAK(g, t);
      SHPHOT(g, t);
      SHGHOST(g, t);
      SHFIG(g, t);
      SHDIAL(g, t);
      g.restore();
      VIG(
        g,
        0.15 +
          0.3 * (sg(t, 60.6, 61.4) - sg(t, 66.6, 67.4)) +
          0.3 * (sg(t, 116.6, 117.2) - sg(t, 119.4, 120.0)) +
          0.22 * sg(t, 120.0, 120.9) +
          0.16 * (1 - sg(t, 6.6, 7.8)),
      );
      SHTEXT(g, t);
      g.globalAlpha = 1;
    },
  },

  /* entropy: one tidy room, and every other room */
  stickmess: {
    T: EMT,
    poster: 26.4,
    draw(g, t) {
      CPUSH(g, EXCAM(t, EMCK, 46.6));
      EXDUST(g, t, EMT, 3301, 0.7);
      EMGND(g, t);
      EMROOM(g, t);
      EMDOTS(g, t, this);
      EMFIG(g, t);
      g.restore();
      VIG(
        g,
        0.16 +
          0.2 * (sg(t, 24.2, 25.2) - sg(t, 33.4, 34.4)) +
          0.22 * sg(t, 47.4, 48.4) +
          0.14 * (1 - sg(t, 6.4, 7.6)),
      );
      EMREW(g, t);
      EMTEXT(g, t);
      g.globalAlpha = 1;
    },
  },

  /* Hilbert's hotel: full, and still taking guests */
  stickhotel: {
    T: HTT,
    poster: 25.6,
    draw(g, t) {
      CPUSH(g, EXCAM(t, HTCK, 46.4));
      EXDUST(g, t, HTT, 5507, 0.62);
      HTGND(g, t);
      HTDOORS(g, t);
      HTARR(g, t);
      HTGUESTS(g, t);
      HTNEW(g, t);
      g.restore();
      VIG(
        g,
        0.16 +
          0.2 * (sg(t, 15.2, 16.2) - sg(t, 20.8, 21.8)) +
          0.22 * sg(t, 45.4, 46.4) +
          0.14 * (1 - sg(t, 6.8, 8.0)),
      );
      HTSIGN(g, t);
      HTTEXT(g, t);
      g.globalAlpha = 1;
    },
  },

  /* an emission nebula condensing out of the dark */
  nebula: {
    T: 16,
    poster: 11,
    draw(g, t) {
      const W = 80,
        H = 50,
        im = IMG(this, W, H),
        d = im.d.data;
      let x: number, y: number, i: number;
      if (!this._neb) {
        const R = rng(91),
          S: { x: number; y: number; m: number; p: number; c: number }[] = [];
        for (i = 0; i < 150; i++)
          S.push({ x: R() * 320, y: R() * 200, m: Math.pow(R(), 3.2), p: R() * TAU, c: R() });
        this._neb = S;
      }
      const dr = t * 0.03,
        em = ss(ln(t, 0.3, 8.5)),
        gl = sg(t, 0.2, 3);
      for (y = 0; y < H; y++)
        for (x = 0; x < W; x++) {
          const u = (x / W) * 5.2 + dr,
            v = (y / H) * 3.3;
          const wx = FBM(u + 1.7, v + 9.2, 4),
            wy = FBM(u + 5.3, v + 2.8, 4);
          let de = FBM(u + 3.2 * wx, v + 3.2 * wy, 5);
          const nx = x / W,
            ny = y / H;
          const r1 = Math.hypot((nx - 0.44) * 1.05, (ny - 0.46) * 1.4),
            r2 = Math.hypot((nx - 0.72) * 1.25, (ny - 0.62) * 1.5);
          de *= Math.min(1.2, Math.max(0, 1 - r1 * 1.02) * 0.9 + Math.max(0, 1 - r2 * 1.6) * 0.55);
          de = Math.max(0, de - 0.06) * 2 * em;
          const co = Math.max(0, 1 - r1 * 2.55) + Math.max(0, 1 - r2 * 3.6) * 0.7,
            e = Math.pow(de, 1.45),
            ht = Math.pow(co, 1.5);
          const rr = e * (0.3 + 0.34 * ht) + Math.pow(de, 2.3) * 1.5 * ht + Math.pow(de, 3) * 0.5;
          let gg = e * (0.19 + 0.2 * ht) + Math.pow(de, 2.5) * 1.0 * ht + Math.pow(de, 3.4) * 0.34;
          let bb = e * (0.58 + 0.1 * ht) + Math.pow(de, 1.9) * 0.42;
          const tl = Math.pow(Math.max(0, de - 0.03), 2) * Math.max(0, 1 - co * 1.9);
          gg += tl * 0.34;
          bb += tl * 0.2;
          const o = (y * W + x) * 4;
          d[o] = Math.min(255, (0.02 + rr) * 255);
          d[o + 1] = Math.min(255, (0.022 + gg) * 255);
          d[o + 2] = Math.min(255, (0.04 + bb) * 255);
          d[o + 3] = 255;
        }
      im.g.putImageData(im.d, 0, 0);
      g.imageSmoothingEnabled = true;
      g.drawImage(im.c, 0, 0, 320, 200);
      const S = this._neb;
      g.globalCompositeOperation = "lighter";
      for (i = 0; i < S.length; i++) {
        const s = S[i],
          tw = 0.55 + 0.45 * Math.sin(t * 1.5 + s.p),
          a = gl * (0.22 + s.m * 0.78) * tw;
        if (a <= 0.01) continue;
        const rad = 0.5 + s.m * 1.7;
        g.globalAlpha = a;
        D(g, s.x, s.y, rad, s.c > 0.85 ? "#ffd6a0" : s.c < 0.22 ? "#accaff" : "#eef2ff");
        if (s.m > 0.72) {
          g.globalAlpha = a * 0.5;
          L(g, s.x - rad * 4, s.y, s.x + rad * 4, s.y, "#fff", 0.6);
          L(g, s.x, s.y - rad * 4, s.x, s.y + rad * 4, "#fff", 0.6);
        }
      }
      g.globalCompositeOperation = "source-over";
      g.globalAlpha = 1;
      const la = sg(t, 1.2, 2.2);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "H II region · 4.2 ly", 16, 50, 10, "rgba(255,217,138,.82)");
        g.globalAlpha = 1;
      }
      const lb = sg(t, 13.2, 14.4);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "a nursery for stars", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },

  /* de Jong attractor, parameters morphing */
  dejong: {
    T: 18,
    poster: 8,
    draw(g, t) {
      const W = 160,
        H = 100,
        im = IMG(this, W, H),
        d = im.d.data;
      let i: number, n: number;
      if (!this._dj) this._dj = new Float32Array(W * H);
      const C = this._dj;
      for (i = 0; i < C.length; i++) C[i] = 0;
      /* a slow orbit around one known-good parameter set, so it never goes sparse */
      const w = ln(t, 0.3, 17.5) * TAU * 0.62;
      const a = 1.641 + 0.17 * Math.sin(w),
        b = 1.902 + 0.15 * Math.cos(w * 0.8);
      const c = 0.316 + 0.19 * Math.sin(w * 1.3),
        dj = 1.525 + 0.13 * Math.cos(w);
      let x = 0.1,
        y = 0.1;
      const sc = Math.min(W, H) / 4.35,
        ox = W / 2,
        oy = H / 2;
      const NP = Math.floor(lp(2500, 26000, ss(ln(t, 0.2, 6))));
      for (i = 0; i < NP; i++) {
        const nx = Math.sin(a * y) - Math.cos(b * x),
          ny = Math.sin(c * x) - Math.cos(dj * y);
        x = nx;
        y = ny;
        if (i < 20) continue;
        const px = (x * sc + ox) | 0,
          py = (y * sc + oy) | 0;
        if (px < 0 || py < 0 || px >= W || py >= H) continue;
        C[py * W + px] += 1;
      }
      let mx = 0;
      for (i = 0; i < C.length; i++) if (C[i] > mx) mx = C[i];
      const lm = Math.log(mx + 1) || 1;
      for (i = 0, n = 0; i < C.length; i++, n += 4) {
        if (C[i] <= 0) {
          d[n] = 5;
          d[n + 1] = 7;
          d[n + 2] = 17;
          d[n + 3] = 255;
          continue;
        }
        const u = Math.pow(Math.log(C[i] + 1) / lm, 0.72);
        const cc =
          u < 0.5 ? MN([13, 26, 80], [54, 140, 235], u * 2) : MN([54, 140, 235], [255, 232, 190], (u - 0.5) * 2);
        d[n] = cc[0];
        d[n + 1] = cc[1];
        d[n + 2] = cc[2];
        d[n + 3] = 255;
      }
      im.g.putImageData(im.d, 0, 0);
      g.imageSmoothingEnabled = true;
      g.drawImage(im.c, 0, 0, 320, 200);
      const la = sg(t, 1, 2);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "x ← sin(ay) − cos(bx)", 16, 50, 10, "rgba(255,255,255,.85)");
        g.globalAlpha = 1;
      }
      const lb = sg(t, 15.2, 16.4);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "four numbers, one shape", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },

  /* dye tracers through a curl-noise field */
  curl: {
    T: 16,
    poster: 11,
    draw(g, t) {
      let i: number, j: number;
      if (!this._curl) {
        const R = rng(7),
          P: { p: number[][]; h: number }[] = [],
          e = 1.4;
        for (let k = 0; k < 150; k++) {
          let x = -20 + R() * 360,
            y = -20 + R() * 240;
          const hu = cl((FBM(x * 0.021 + 41.3, y * 0.021 + 18.9, 3) - 0.4) * 4.2),
            pts = [[x, y]];
          for (j = 0; j < 70; j++) {
            const px =
              (FBM((x + e) * 0.012 + 3.1, y * 0.012 + 7.7, 4) - FBM((x - e) * 0.012 + 3.1, y * 0.012 + 7.7, 4)) /
              (2 * e);
            const py =
              (FBM(x * 0.012 + 3.1, (y + e) * 0.012 + 7.7, 4) - FBM(x * 0.012 + 3.1, (y - e) * 0.012 + 7.7, 4)) /
              (2 * e);
            const vx = py * 9000,
              vy = -px * 9000,
              m = Math.hypot(vx, vy) || 1;
            x += (vx / m) * 3.2;
            y += (vy / m) * 3.2;
            if (x < -40 || x > 360 || y < -40 || y > 240) break;
            pts.push([x, y]);
          }
          if (pts.length > 6) P.push({ p: pts, h: hu });
        }
        this._curl = P;
      }
      const P = this._curl,
        rv = ss(ln(t, 0.2, 7.5));
      g.globalCompositeOperation = "lighter";
      g.lineCap = "round";
      for (i = 0; i < P.length; i++) {
        const tr = P[i],
          pts = tr.p,
          np = Math.max(2, Math.floor(pts.length * rv));
        const c =
          tr.h < 0.5 ? MN([26, 199, 230], [46, 112, 250], tr.h * 2) : MN([46, 112, 250], [255, 199, 92], (tr.h - 0.5) * 2);
        g.strokeStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",.5)";
        g.lineWidth = 0.85;
        g.beginPath();
        g.moveTo(pts[0][0], pts[0][1]);
        for (j = 1; j < np; j++) g.lineTo(pts[j][0], pts[j][1]);
        g.stroke();
        const hp = ((t * 0.16 + i * 0.037) % 1) * (np - 1),
          hi = hp | 0;
        if (hi > 0 && hi < np - 1) {
          g.globalAlpha = 0.9;
          D(g, pts[hi][0], pts[hi][1], 1.15, "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")");
          g.globalAlpha = 1;
        }
      }
      g.globalCompositeOperation = "source-over";
      const la = sg(t, 1, 2);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "curl field · 150 tracers", 16, 50, 10, "rgba(255,217,138,.8)");
        g.globalAlpha = 1;
      }
      const lb = sg(t, 13.4, 14.6);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "divergence-free, so nothing piles up", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },

  /* long-form: a cloud of dust becomes a world someone could stand on */
  origin: {
    T: 46,
    poster: 26,
    draw(g, t) {
      let i: number;
      const cx = 160,
        cy = 100,
        RING = [36, 60, 86, 116, 150],
        PS = [1.5, 2.1, 2.8, 2.3, 1.8];
      const PC = [
        [216, 170, 124],
        [198, 144, 106],
        [122, 166, 198],
        [178, 122, 98],
        [152, 168, 192],
      ];
      if (!this._orig) {
        const R = rng(23),
          P: { r0: number; a0: number; z: number; rt: number; s: number; keep: boolean; sw: number }[] = [];
        for (i = 0; i < 1400; i++) {
          const ri = (R() * 5) | 0;
          P.push({
            r0: 46 + 208 * Math.pow(R(), 0.55),
            a0: R() * TAU,
            z: (R() - 0.5) * Math.pow(R(), 0.55),
            rt: RING[ri] + (R() - 0.5) * 15,
            s: 0.35 + 0.8 * Math.pow(R(), 1.8),
            keep: R() < 0.34,
            sw: R(),
          });
        }
        const A: number[] = [],
          ST: { x: number; y: number; m: number; p: number }[] = [],
          SPK: { r: number; a: number; t: number; s: number }[] = [];
        for (i = 0; i < 5; i++) A.push(R() * TAU);
        for (i = 0; i < 90; i++) ST.push({ x: R() * 320, y: R() * 200, m: Math.pow(R(), 2.4), p: R() * TAU });
        for (i = 0; i < 32; i++)
          SPK.push({ r: RING[(R() * 5) | 0] + (R() - 0.5) * 11, a: R() * TAU, t: 17.5 + R() * 12.5, s: 0.55 + R() * 0.9 });
        this._orig = { P, A, ST, SPK };
      }
      const O = this._orig,
        P = O.P,
        ST = O.ST,
        SPK = O.SPK;
      const WV = (r: number) => 118 / Math.pow(r, 1.35);
      const col = ss(ln(t, 0.8, 15)),
        fl = ss(ln(t, 2.5, 14)),
        ig = sg(t, 10.5, 15.5);
      const tilt = lp(0.95, 0.3, fl),
        zs = lp(46, 3, fl);
      const pz = ss(ln(t, 34, 44.5)),
        Z = Math.pow(31, pz),
        dust = 1 - sg(t, 35.5, 40.5);
      const ta = O.A[2] + WV(RING[2]) * t;
      const tx = cx + Math.cos(ta) * RING[2],
        ty = cy + Math.sin(ta) * RING[2] * tilt;
      g.fillStyle = "#04050a";
      g.fillRect(0, 0, 320, 200);
      for (i = 0; i < ST.length; i++) {
        const s0 = ST[i];
        g.globalAlpha = (0.1 + s0.m * 0.5) * (0.6 + 0.4 * Math.sin(t * 1.1 + s0.p)) * (1 - pz * 0.8);
        D(g, s0.x, s0.y, 0.4 + s0.m * 0.7, "#dfe6ff");
      }
      g.globalAlpha = 1;
      if (col < 0.98) {
        const hz = g.createRadialGradient(148, 92, 10, 160, 100, 190);
        hz.addColorStop(0, "rgba(96,86,132," + (0.34 * (1 - col)).toFixed(3) + ")");
        hz.addColorStop(0.55, "rgba(58,52,88," + (0.19 * (1 - col)).toFixed(3) + ")");
        hz.addColorStop(1, "rgba(20,18,34,0)");
        g.fillStyle = hz;
        g.fillRect(0, 0, 320, 200);
      }
      g.save();
      g.translate(cx - 22 * ss(pz), cy + 6 * ss(pz));
      g.scale(Z, Z);
      g.translate(-lp(cx, tx, pz), -lp(cy, ty, pz));
      const ro = sg(t, 19, 26) * (1 - sg(t, 34, 37));
      if (ro > 0.01) {
        g.strokeStyle = "rgba(150,168,214," + (0.14 * ro).toFixed(3) + ")";
        g.lineWidth = 0.35 / Math.sqrt(Z);
        for (i = 0; i < 5; i++) {
          g.beginPath();
          g.ellipse(cx, cy, RING[i], RING[i] * tilt, 0, 0, TAU);
          g.stroke();
        }
      }
      const haze = sg(t, 13, 21) * cl(1 - pz * 1.6);
      if (haze > 0.01) {
        g.globalCompositeOperation = "lighter";
        g.save();
        g.translate(cx, cy);
        g.scale(1, tilt);
        const dg = g.createRadialGradient(0, 0, 6, 0, 0, 168);
        dg.addColorStop(0, "rgba(255,216,162," + (0.17 * haze).toFixed(3) + ")");
        dg.addColorStop(0.42, "rgba(198,160,126," + (0.1 * haze).toFixed(3) + ")");
        dg.addColorStop(1, "rgba(120,100,90,0)");
        g.fillStyle = dg;
        g.beginPath();
        g.arc(0, 0, 168, 0, TAU);
        g.fill();
        g.restore();
      }
      g.globalCompositeOperation = "lighter";
      if (dust > 0.012) {
        for (i = 0; i < P.length; i++) {
          const p = P[i];
          const vis = (p.keep ? 1 - 0.45 * sg(t, 24, 33) : 1 - sg(t, 17 + p.sw * 7, 22 + p.sw * 8)) * dust;
          if (vis <= 0.012) continue;
          const r = lp(p.r0, p.rt, col),
            a = p.a0 + WV(r) * t;
          const x = cx + Math.cos(a) * r,
            y = cy + Math.sin(a) * r * tilt + p.z * zs;
          const lit = ig * Math.pow(1 - cl(r / 205), 1.6);
          const c = MN(MN([108, 114, 142], [176, 150, 124], col * 0.85), [255, 230, 186], lit);
          const al = (0.17 + 0.48 * p.s) * vis * (0.72 + 0.28 * Math.sin(t * 0.7 + p.sw * 9));
          g.fillStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + al.toFixed(3) + ")";
          g.beginPath();
          g.arc(x, y, p.s * (0.55 + lit * 0.5), 0, TAU);
          g.fill();
        }
      }
      const core = (1 - ig) * col * 0.55,
        sr = lp(2.4, 15, ss(ln(t, 9, 21)));
      if (core > 0.01) {
        const kg = g.createRadialGradient(cx, cy, 0, cx, cy, 26);
        kg.addColorStop(0, "rgba(198,138,96," + (0.5 * core).toFixed(3) + ")");
        kg.addColorStop(1, "rgba(120,80,60,0)");
        g.fillStyle = kg;
        g.beginPath();
        g.arc(cx, cy, 26, 0, TAU);
        g.fill();
      }
      if (ig > 0.01 && dust > 0.01) {
        const sgl = g.createRadialGradient(cx, cy, 0, cx, cy, sr * 6.5);
        sgl.addColorStop(0, "rgba(255,252,238," + (0.95 * ig * dust).toFixed(3) + ")");
        sgl.addColorStop(0.11, "rgba(255,232,178," + (0.62 * ig * dust).toFixed(3) + ")");
        sgl.addColorStop(0.34, "rgba(255,178,104," + (0.2 * ig * dust).toFixed(3) + ")");
        sgl.addColorStop(1, "rgba(255,150,80,0)");
        g.fillStyle = sgl;
        g.beginPath();
        g.arc(cx, cy, sr * 6.5, 0, TAU);
        g.fill();
      }
      g.globalCompositeOperation = "source-over";
      for (i = 0; i < SPK.length; i++) {
        const sk = SPK[i],
          dk = t - sk.t;
        if (dk < 0 || dk > 1.2 || dust < 0.05) continue;
        const ka = (1 - dk / 1.2) * dust,
          sa2 = sk.a + WV(sk.r) * t;
        const ax = cx + Math.cos(sa2) * sk.r,
          ay = cy + Math.sin(sa2) * sk.r * tilt;
        g.globalCompositeOperation = "lighter";
        D(g, ax, ay, sk.s * (1 + dk * 0.7), "rgba(255,238,200," + (0.9 * ka).toFixed(3) + ")");
        g.strokeStyle = "rgba(255,192,116," + (0.45 * ka * (1 - dk)).toFixed(3) + ")";
        g.lineWidth = 0.4;
        g.beginPath();
        g.arc(ax, ay, 1.4 + dk * 7, 0, TAU);
        g.stroke();
        g.globalCompositeOperation = "source-over";
      }
      const fla = Math.exp(-Math.pow(t - 13.3, 2) / 0.55),
        fp = cl((t - 12.95) / 2.9);
      if (fp > 0 && fp < 1) {
        g.globalCompositeOperation = "lighter";
        g.save();
        g.translate(cx, cy);
        g.scale(1, tilt);
        g.strokeStyle = "rgba(255,240,208," + (0.5 * (1 - fp) * (1 - fp)).toFixed(3) + ")";
        g.lineWidth = 1.8;
        g.beginPath();
        g.arc(0, 0, 6 + fp * 196, 0, TAU);
        g.stroke();
        g.restore();
        g.globalCompositeOperation = "source-over";
      }
      for (i = 0; i < 5; i++) {
        const gp = ss(ln(t, 16 + i * 1.3, 29 + i * 0.9));
        if (gp <= 0.002) continue;
        const pr = PS[i] * gp,
          pa = O.A[i] + WV(RING[i]) * t;
        const px = cx + Math.cos(pa) * RING[i],
          py = cy + Math.sin(pa) * RING[i] * tilt;
        if (i === 2 && Z * pr > 4) {
          const S = 144;
          if (!this._planet) {
            const oc = document.createElement("canvas");
            oc.width = S;
            oc.height = S;
            const og = oc.getContext("2d") as Ctx;
            this._planet = { c: oc, g: og, d: og.createImageData(S, S) };
          }
          const SP = this._planet,
            d = SP.d.data,
            cool = ss(ln(t, 35.5, 43.5)),
            lite = ss(ln(t, 41.5, 45.6)),
            rot = t * 0.085;
          for (let yy = 0; yy < S; yy++) {
            const ny = ((yy + 0.5) / S) * 2 - 1;
            for (let xx = 0; xx < S; xx++) {
              const nx = ((xx + 0.5) / S) * 2 - 1,
                q = nx * nx + ny * ny,
                o = (yy * S + xx) * 4;
              if (q > 1) {
                d[o + 3] = 0;
                continue;
              }
              const nz = Math.sqrt(1 - q),
                ca = Math.cos(rot),
                sa = Math.sin(rot);
              const wx = nx * ca + nz * sa,
                wz = nz * ca - nx * sa;
              const aw = Math.abs(wx),
                az = Math.abs(wz),
                bw = aw / (aw + az + 1e-4);
              const h = lp(FBM(wz * 3.1 + 31.2, ny * 3.1 + 19.4, 3), FBM(wx * 3.1 + 11.3, ny * 3.1 + 5.2, 3), bw),
                lam = Math.max(0, nx * -0.52 + ny * -0.42 + nz * 0.745);
              const ice = cl((Math.abs(ny) - 0.7) / 0.3),
                shd = 0.09 + lam;
              let lc =
                h < 0.505
                  ? MN([10, 34, 74], [36, 98, 152], cl((h - 0.33) / 0.175))
                  : MN([58, 94, 58], [158, 140, 100], cl((h - 0.505) / 0.28));
              if (ice > 0) lc = MN(lc, [226, 234, 242], Math.min(1, ice * 1.5));
              const mo = cl((h - 0.44) / 0.36),
                base = MN(MN([32, 17, 14], [92, 48, 34], mo), lc, cool);
              const em = (1 - cool) * Math.pow(mo, 1.7);
              let rr = base[0] * shd + em * 255,
                gg = base[1] * shd + em * 104,
                bb = base[2] * shd + em * 26;
              const cw = lp(
                  FBM(wz * 4.6 + 7.1 + t * 0.03, ny * 4.6 + 3.3, 2),
                  FBM(wx * 4.6 + 41.7 + t * 0.03, ny * 4.6 + 27.9, 2),
                  bw,
                ),
                cm = cl((cw - 0.53) / 0.19) * cool * 0.85 * (0.18 + lam);
              rr = lp(rr, 236, cm);
              gg = lp(gg, 240, cm);
              bb = lp(bb, 246, cm);
              const rim = Math.pow(q, 3.4) * Math.pow(lam, 0.6) * cool;
              rr += rim * 40;
              gg += rim * 92;
              bb += rim * 152;
              if (lite > 0 && lam < 0.13 && h > 0.505) {
                const nl = cl((0.13 - lam) / 0.13) * lite;
                const lv = VN(wx * 23 + 13, ny * 23 + 7) * VN(wz * 19 + 3.4, ny * 19 + 29);
                if (lv > 0.33) {
                  const lb2 = (lv - 0.33) * 3.2 * nl;
                  rr += lb2 * 230;
                  gg += lb2 * 152;
                  bb += lb2 * 66;
                }
              }
              d[o] = rr > 255 ? 255 : rr | 0;
              d[o + 1] = gg > 255 ? 255 : gg | 0;
              d[o + 2] = bb > 255 ? 255 : bb | 0;
              d[o + 3] = q > 0.986 ? (1 - (q - 0.986) / 0.014) * 255 : 255;
            }
          }
          SP.g.putImageData(SP.d, 0, 0);
          g.imageSmoothingEnabled = true;
          g.drawImage(SP.c, px - pr, py - pr, pr * 2, pr * 2);
          const ag = g.createRadialGradient(px, py, pr * 0.95, px, py, pr * 1.17);
          ag.addColorStop(0, "rgba(122,182,255," + (0.34 * cool).toFixed(3) + ")");
          ag.addColorStop(1, "rgba(122,182,255,0)");
          g.fillStyle = ag;
          g.beginPath();
          g.arc(px, py, pr * 1.17, 0, TAU);
          g.fill();
          const mp = sg(t, 37.5, 41.5);
          if (mp > 0) {
            const ma = t * 0.34 + 1.1,
              mr = pr * 0.118 * mp;
            const mx2 = px + Math.cos(ma) * pr * 2.5,
              my2 = py + Math.sin(ma) * pr * 0.72;
            D(g, mx2, my2, mr, "#33333a");
            g.save();
            g.beginPath();
            g.arc(mx2, my2, mr, 0, TAU);
            g.clip();
            D(g, mx2 - mr * 0.4, my2 - mr * 0.32, mr * 0.94, "#b4b0a8");
            g.restore();
          }
          continue;
        }
        const pc = PC[i];
        D(g, px, py, pr, "rgb(" + ((pc[0] * 0.3) | 0) + "," + ((pc[1] * 0.3) | 0) + "," + ((pc[2] * 0.3) | 0) + ")");
        const ux = cx - px,
          uy = cy - py,
          ul = Math.hypot(ux, uy) || 1;
        g.save();
        g.beginPath();
        g.arc(px, py, pr, 0, TAU);
        g.clip();
        D(g, px + (ux / ul) * pr * 0.5, py + (uy / ul) * pr * 0.5, pr * 0.9, "rgb(" + pc.join(",") + ")");
        g.restore();
      }
      g.restore();
      if (fla > 0.004) {
        g.fillStyle = "rgba(255,244,224," + (0.4 * fla).toFixed(3) + ")";
        g.fillRect(0, 0, 320, 200);
      }
      const CH: [number, number, string][] = [
        [1.2, 5.4, "one cold cloud, 1400 grains"],
        [11.4, 15.6, "the core lights"],
        [20, 24.4, "gaps open where planets sweep"],
        [30, 33.6, "five orbits, settled"],
      ];
      for (i = 0; i < CH.length; i++) {
        const ch = CH[i],
          cal = sg(t, ch[0], ch[0] + 1) * (1 - sg(t, ch[1], ch[1] + 1));
        if (cal > 0.01) {
          g.globalAlpha = cal;
          TX(g, ch[2], 16, 50, 10, "rgba(255,224,176,.85)");
          g.globalAlpha = 1;
        }
      }
      const ob = sg(t, 42.4, 44) * (1 - sg(t, 45.4, 46));
      if (ob > 0.01) {
        g.globalAlpha = ob;
        TX(g, "and one of them stays warm", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },

  /* long-form: one seed, one year */
  tree: {
    T: 34,
    poster: 17,
    draw(g, t) {
      let i: number;
      if (!this._tree) {
        const R = rng(41);
        const mk = (len: number, w: number, dep: number, t0: number, rel: number): TreeNode => {
          const n: TreeNode = {
            a: rel,
            l: len,
            w,
            d: dep,
            t0,
            t1: t0 + len * 0.04 + 0.16,
            ph: R() * TAU,
            sw: 0.006 + dep * 0.0055,
            ch: [],
            lv: [],
          };
          if (dep >= 11 || len < 3) {
            const m = 1 + ((R() * 3) | 0);
            for (let k = 0; k < m; k++) {
              n.lv.push({
                ox: (R() - 0.5) * 8,
                oy: (R() - 0.5) * 8,
                s: 1.5 + R() * 1.5,
                b: n.t1 + 0.3 + R() * 2.4,
                h: R(),
                ph: R() * TAU,
                dt: 21.5 + R() * 5,
                fx: (R() - 0.5) * 1.7,
              });
            }
            return n;
          }
          const br = dep < 2 ? 2 : R() < 0.58 ? 2 : 1;
          for (let j = 0; j < br; j++)
            n.ch.push(mk(len * (0.74 + R() * 0.1), w * 0.72, dep + 1, n.t1, ((j - (br - 1) / 2) * (0.48 + R() * 0.28)) + (R() - 0.5) * 0.18));
          return n;
        };
        this._tree = mk(30, 5.2, 0, 1.1, 0);
      }
      const s1 = sg(t, 11, 15),
        s2 = sg(t, 18, 23),
        s3 = sg(t, 25.5, 29.5),
        snow = sg(t, 27.5, 32);
      const top = MN(MN(MN([13, 26, 32], [16, 32, 28], s1), [32, 23, 14], s2), [11, 18, 32], s3);
      const bot = MN(MN(MN([19, 35, 28], [26, 42, 24], s1), [42, 28, 16], s2), [20, 26, 38], s3);
      const sky = g.createLinearGradient(0, 0, 0, 184);
      sky.addColorStop(0, "rgb(" + top.join(",") + ")");
      sky.addColorStop(1, "rgb(" + bot.join(",") + ")");
      g.fillStyle = sky;
      g.fillRect(0, 0, 320, 200);
      g.fillStyle = "#12100c";
      g.fillRect(0, 178, 320, 22);
      if (snow > 0) {
        g.fillStyle = "rgba(226,234,244," + (0.85 * snow).toFixed(3) + ")";
        g.fillRect(0, 177.5, 320, 2.4 + snow * 2.6);
      }
      const wind = 0.55 + 0.45 * Math.sin(t * 0.37) + 0.3 * Math.sin(t * 0.13 + 1.7);
      const gust = 1 + 0.9 * sg(t, 26, 29) * (1 - sg(t, 31.5, 33.6));
      const bark = MN([58, 46, 38], [52, 48, 52], s3);
      const barkC = "rgb(" + bark.join(",") + ")";
      const leaf = (lf: Leaf, lx: number, ly: number) => {
        if (t < lf.b) return;
        const gr = cl((t - lf.b) / 0.9),
          fal = t - lf.dt;
        let land = 0,
          fx = lx + lf.ox,
          fy = ly + lf.oy,
          rt = Math.sin(t * 0.9 + lf.ph) * 0.35;
        if (fal > 0) {
          const dd = Math.max(4, 178 - fy),
            tl = (-9 + Math.sqrt(81 + 12.8 * dd)) / 6.4,
            ft = Math.min(fal, tl);
          fy += 9 * ft + 3.2 * ft * ft;
          fx += Math.sin(ft * 1.9 + lf.ph) * 7.5 + lf.fx * ft * 5;
          land = cl((fal - tl) / 2.2);
          rt = ft * 1.7 + lf.ph;
        }
        let c = MN(
          MN([120, 174, 90], [64, 132, 70], sg(t, 11, 17)),
          lf.h < 0.42 ? [210, 146, 50] : lf.h < 0.78 ? [188, 84, 42] : [216, 180, 68],
          sg(t, 18.5, 25),
        );
        c = MN(c, [86, 60, 38], land);
        const al = gr * (1 - 0.4 * land) * (1 - 0.8 * snow * land);
        if (al < 0.02) return;
        g.fillStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + al.toFixed(3) + ")";
        g.beginPath();
        g.ellipse(fx, fy, lf.s * 1.45 * gr, lf.s * 0.8 * gr, rt, 0, TAU);
        g.fill();
      };
      const walk = (n: TreeNode, x: number, y: number, base: number) => {
        const p = cl((t - n.t0) / (n.t1 - n.t0));
        if (p <= 0) return;
        const ang = base + n.a + Math.sin(t * 1.05 + n.ph) * n.sw * wind * gust;
        const x2 = x + Math.cos(ang) * n.l * p,
          y2 = y + Math.sin(ang) * n.l * p;
        g.strokeStyle = barkC;
        g.lineCap = "round";
        g.lineWidth = Math.max(0.5, n.w * (0.4 + 0.6 * p));
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x2, y2);
        g.stroke();
        if (snow > 0.02 && n.d < 7) {
          g.strokeStyle = "rgba(230,238,248," + (0.5 * snow).toFixed(3) + ")";
          g.lineWidth = Math.max(0.4, n.w * 0.42);
          g.beginPath();
          g.moveTo(x, y - n.w * 0.34);
          g.lineTo(x2, y2 - n.w * 0.34);
          g.stroke();
        }
        if (p < 1) return;
        for (let k = 0; k < n.ch.length; k++) walk(n.ch[k], x2, y2, ang);
        for (let k = 0; k < n.lv.length; k++) leaf(n.lv[k], x2, y2);
      };
      walk(this._tree, 160, 178, -Math.PI / 2);
      if (snow > 0) {
        if (!this._snow) {
          const R2 = rng(5),
            SN: { x: number; y: number; s: number; v: number; p: number }[] = [];
          for (i = 0; i < 120; i++)
            SN.push({ x: R2() * 330, y: R2() * 206, s: 0.4 + R2() * 1.1, v: 7 + R2() * 15, p: R2() * TAU });
          this._snow = SN;
        }
        const SNa = this._snow,
          dt2 = t - 27.5;
        for (i = 0; i < SNa.length; i++) {
          const f = SNa[i];
          const fy2 = ((f.y + dt2 * f.v) % 206) - 6,
            fx2 = ((f.x + Math.sin(t * 0.7 + f.p) * 9 + dt2 * 5) % 330) - 5;
          D(g, fx2, fy2, f.s, "rgba(234,242,252," + ((0.3 + f.s * 0.32) * snow).toFixed(3) + ")");
        }
      }
      const day = Math.max(1, Math.min(365, Math.round(ln(t, 1, 33.2) * 365)));
      const seas = t < 11 ? "spring" : t < 18.5 ? "summer" : t < 26 ? "autumn" : "winter";
      const la = sg(t, 0.8, 1.8);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "day " + day + " · " + seas, 16, 50, 10, "rgba(228,224,210,.72)");
        g.globalAlpha = 1;
      }
      const lb2 = sg(t, 30.6, 32) * (1 - sg(t, 33.4, 34));
      if (lb2 > 0.01) {
        g.globalAlpha = lb2;
        TX(g, "one rule, run all the way down", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },

  /* long-form: aurora over a frozen lake */
  aurora: {
    T: 30,
    poster: 16,
    draw(g, t) {
      let i: number, x: number;
      const HZ = 150;
      const sky = g.createLinearGradient(0, 0, 0, HZ);
      sky.addColorStop(0, "#04060e");
      sky.addColorStop(0.55, "#061019");
      sky.addColorStop(1, "#0a1a22");
      g.fillStyle = sky;
      g.fillRect(0, 0, 320, 200);
      if (!this._aur) {
        const R = rng(83),
          S: { x: number; y: number; m: number; p: number }[] = [],
          C: { y: number; amp: number; fr: number; sp: number; t0: number; w: number; ph: number; vi: number; ns: number }[] = [],
          RG: number[] = [];
        for (i = 0; i < 140; i++) S.push({ x: R() * 320, y: R() * 142, m: Math.pow(R(), 2.3), p: R() * TAU });
        for (i = 0; i < 6; i++)
          C.push({
            y: 86 + R() * 24 - i * 2.5,
            amp: 9 + R() * 15,
            fr: 0.006 + R() * 0.013,
            sp: 0.09 + R() * 0.15,
            t0: 2.2 + i * 1.9,
            w: 44 + R() * 36,
            ph: R() * TAU,
            vi: 0.55 + R() * 0.45,
            ns: R() * 40,
          });
        for (x = -4; x <= 324; x += 3) {
          let hh = 0,
            am = 0.5,
            ff = 1,
            nn = 0;
          for (let o2 = 0; o2 < 4; o2++) {
            let wv = 1 - Math.abs(VN(x * 0.011 * ff + 3.3, 7.7) * 2 - 1);
            wv *= wv;
            hh += am * wv;
            nn += am;
            am *= 0.5;
            ff *= 2.07;
          }
          RG.push(x, HZ - 3 - Math.pow(hh / nn, 1.7) * 30);
        }
        this._aur = { S, C, RG };
      }
      const AU = this._aur,
        S = AU.S,
        C = AU.C,
        RG = AU.RG;
      const env = sg(t, 1.5, 6) * (1 - sg(t, 24, 29.2)),
        surge = Math.exp(-Math.pow(t - 17, 2) / 26) * 0.85;
      for (i = 0; i < S.length; i++) {
        const s0 = S[i];
        g.globalAlpha = (0.14 + s0.m * 0.66) * (0.62 + 0.38 * Math.sin(t * 1.5 + s0.p)) * (1 - env * 0.22);
        D(g, s0.x, s0.y, 0.45 + s0.m * 0.85, "#e6eeff");
      }
      g.globalAlpha = 1;
      const band = (mir: number) => {
        g.globalCompositeOperation = "lighter";
        for (let k = 0; k < C.length; k++) {
          const cc = C[k];
          const on = sg(t, cc.t0, cc.t0 + 2.6);
          if (on <= 0) continue;
          const amp2 = cc.amp * (1 + surge * 0.4),
            vio = 0.35 + surge * 0.55;
          const grd = g.createLinearGradient(0, cc.y - cc.w - 6, 0, cc.y + 18);
          grd.addColorStop(0, "rgba(152,92,222,0)");
          grd.addColorStop(0.18, "rgba(148,98,226," + (0.36 * vio).toFixed(3) + ")");
          grd.addColorStop(0.46, "rgba(74,196,192,.32)");
          grd.addColorStop(0.78, "rgba(88,232,154,.44)");
          grd.addColorStop(1, "rgba(126,255,196,0)");
          g.fillStyle = grd;
          for (x = -4; x < 324; x += 2.4) {
            const by = cc.y + Math.sin(x * cc.fr + t * cc.sp + cc.ph) * amp2 + (VN(x * 0.035 + t * 0.13, cc.ns) * 2 - 1) * 9;
            const ray = VN(x * 0.1 - t * 0.34, cc.ns + 11) * 0.72 + VN(x * 0.26 + t * 0.11, cc.ns + 29) * 0.28;
            const ed = Math.pow(Math.sin(cl((x + 4) / 328) * Math.PI), 0.65);
            const al = Math.pow(cl(ray * 1.28), 1.7) * on * env * cc.vi * (0.5 + surge) * ed;
            if (al < 0.012) continue;
            g.globalAlpha = Math.min(1, al) * (mir ? 0.32 : 1);
            g.fillRect(x, by - cc.w, 2.6, cc.w + 16);
          }
        }
        g.globalAlpha = 1;
        g.globalCompositeOperation = "source-over";
      };
      band(0);
      const sh = t - 20.4;
      if (sh > 0 && sh < 0.75) {
        const sp2 = sh / 0.75;
        g.globalCompositeOperation = "lighter";
        g.strokeStyle = "rgba(255,246,224," + (0.85 * (1 - sp2)).toFixed(3) + ")";
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(226 + sp2 * 44, 14 + sp2 * 30);
        g.lineTo(226 + sp2 * 44 + 13, 14 + sp2 * 30 + 9);
        g.stroke();
        g.globalCompositeOperation = "source-over";
      }
      g.fillStyle = "#050910";
      g.fillRect(0, HZ, 320, 50);
      g.save();
      g.beginPath();
      g.rect(0, HZ, 320, 50);
      g.clip();
      g.translate(0, HZ * 1.52);
      g.scale(1, -0.52);
      band(1);
      g.restore();
      g.fillStyle = "rgba(6,12,20,.55)";
      g.fillRect(0, HZ, 320, 50);
      for (i = 0; i < 7; i++) {
        const iy = HZ + 5 + i * 6.5;
        g.globalAlpha = 0.1 + 0.05 * Math.sin(t * 0.5 + i);
        L(g, 20 + i * 13, iy, 300 - i * 9, iy + 1.2, "#8fb6c6", 0.5);
      }
      g.globalAlpha = 1;
      g.fillStyle = "#04060b";
      g.beginPath();
      g.moveTo(-4, HZ + 3);
      for (i = 0; i < RG.length; i += 2) g.lineTo(RG[i], RG[i + 1]);
      g.lineTo(324, HZ + 3);
      g.closePath();
      g.fill();
      g.fillStyle = "#05070d";
      g.beginPath();
      g.moveTo(228, HZ);
      g.lineTo(228, HZ - 7);
      g.lineTo(234, HZ - 12);
      g.lineTo(240, HZ - 7);
      g.lineTo(240, HZ);
      g.closePath();
      g.fill();
      const wg = 0.7 + 0.3 * Math.sin(t * 1.7);
      g.fillStyle = "rgba(255,186,104," + (0.92 * wg).toFixed(3) + ")";
      g.fillRect(232.4, HZ - 6, 3, 3);
      g.globalCompositeOperation = "lighter";
      const lg = g.createRadialGradient(233.9, HZ - 4.5, 0, 233.9, HZ - 4.5, 9);
      lg.addColorStop(0, "rgba(255,176,88," + (0.36 * wg).toFixed(3) + ")");
      lg.addColorStop(1, "rgba(255,176,88,0)");
      g.fillStyle = lg;
      g.beginPath();
      g.arc(233.9, HZ - 4.5, 9, 0, TAU);
      g.fill();
      g.globalAlpha = 0.3 * wg;
      g.fillStyle = "rgba(255,176,88,.5)";
      g.fillRect(233, HZ + 1, 1.6, 26);
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";
      const la = sg(t, 1.4, 2.4) * (1 - sg(t, 7, 8.4));
      if (la > 0.01) {
        g.globalAlpha = la;
        TX(g, "six curtains · noise driven", 16, 50, 10, "rgba(160,226,192,.82)");
        g.globalAlpha = 1;
      }
      const lb3 = sg(t, 25.6, 27) * (1 - sg(t, 29.4, 30));
      if (lb3 > 0.01) {
        g.globalAlpha = lb3;
        TX(g, "charged particles, meeting air", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },

  /* 0 · starlight lensed around a black hole, seen edge on */
  blackhole: {
    T: 20,
    poster: 12,
    draw(g, t) {
      const cx = 160,
        cy = 100;
      let i: number;
      if (!this._bh) {
        const R0 = rng(77),
          DP: { r: number; th: number; b: number; w: number }[] = [],
          S: { x: number; y: number; m: number }[] = [],
          P: string[][] = [];
        for (i = 0; i < 1700; i++)
          DP.push({ r: 1.33 + 2.95 * Math.pow(R0(), 0.62), th: R0() * TAU, b: 0.4 + 0.6 * R0(), w: 0.62 + 0.7 * R0() });
        for (i = 0; i < 230; i++) S.push({ x: -60 + R0() * 440, y: -50 + R0() * 300, m: 0.18 + 0.82 * R0() * R0() });
        for (let ri = 0; ri < 8; ri++) {
          P.push([]);
          for (let bi = 0; bi < 16; bi++) {
            const rad = ri / 7,
              be = bi / 15;
            const c = HSV(
              lp(0.088, 0.021, rad) + be * 0.016,
              cl(lp(0.99, 0.13, be * be)),
              cl(lp(0.4, 1, be) * lp(1, 0.64, rad) + 0.17),
            );
            P[ri].push("rgb(" + c[0] + "," + c[1] + "," + c[2] + ")");
          }
        }
        this._bh = { D: DP, S, P };
      }
      const B = this._bh,
        zm = lp(0.84, 1.12, ss(ln(t, 0, 20))),
        R = 20.5 * zm;
      const inc = lp(0.6, 1.37, sg(t, 5.4, 11.6)),
        sI = Math.sin(inc),
        cI = Math.cos(inc);
      const lens = sg(t, 0.5, 3.2),
        dA = sg(t, 1.4, 4.8),
        hA = dA * (0.32 + 0.46 * sI),
        Re = R * 1.6 * lens;
      const hotW = sg(t, 11.3, 12.7) - sg(t, 15.2, 16.8),
        hth = -t * 2.05,
        pal = B.P;

      /* lensed starfield: primary image pushed out, secondary ghost inside */
      const fade = sg(t, 0, 1.3);
      for (i = 0; i < B.S.length; i++) {
        const s = B.S[i],
          dx = s.x - cx,
          dy = s.y - cy,
          rr = Math.hypot(dx, dy);
        if (rr < 0.8) continue;
        const q = Math.sqrt(rr * rr + 4 * Re * Re),
          rp = (rr + q) / 2,
          k = rp / rr,
          sz = s.m > 0.72 ? 1.35 : 0.95;
        g.globalAlpha = cl(s.m * fade * cl(0.42 + (0.95 * Re) / Math.max(rp, 1)));
        g.fillStyle = "#e9edf7";
        g.fillRect(cx + dx * k, cy + dy * k, sz, sz);
        const rm = (rr - q) / 2,
          r2 = -rm;
        if (r2 > R * 1.03) {
          g.globalAlpha = cl(((s.m * fade * 2.6 * Re * Re) / (rr * rr + Re * Re)) * 0.45);
          g.fillRect(cx + dx * (rm / rr), cy + dy * (rm / rr), 0.95, 0.95);
        }
      }

      /* warm bloom */
      const gr = g.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 5.4);
      gr.addColorStop(0, "rgba(255,171,92," + (0.21 * dA).toFixed(3) + ")");
      gr.addColorStop(0.34, "rgba(228,120,44," + (0.1 * dA).toFixed(3) + ")");
      gr.addColorStop(1, "rgba(150,54,8,0)");
      g.globalAlpha = 1;
      g.fillStyle = gr;
      g.fillRect(-30, -30, 380, 260);
      g.globalCompositeOperation = "lighter";

      /* mode 0 = far half behind the hole · 1 = near half in front · 2 = light bent into a halo */
      const pass = (mode: number) => {
        for (let j = 0; j < B.D.length; j++) {
          const p = B.D[j];
          const th = p.th + (2.2 * t) / Math.pow(p.r, 1.5),
            ct = Math.cos(th),
            st = Math.sin(th);
          if (mode === 0 && st <= 0) continue;
          if (mode === 1 && st > 0) continue;
          const be = cl(0.5 - (0.36 + 0.36 * sI) * ct * 1.5);
          let bo = 0;
          if (hotW > 0) {
            const da = (((th - hth) % TAU) + TAU + Math.PI) % TAU - Math.PI;
            bo = hotW * Math.exp(-da * da * 7) * 0.95;
          }
          const rad = cl((p.r - 1.33) / 2.95),
            rr2 = p.r * R;
          let x: number, y: number, al: number, sz: number;
          if (mode === 2) {
            const rg = R * (1.02 + (p.r - 1.33) * 0.3);
            x = cx + rg * ct;
            y = cy - rg * st * 0.78;
            al = cl(p.b * (0.45 + 0.75 * be) * (1 + bo) * hA) * 0.72;
            sz = p.w * 0.85;
          } else {
            x = cx + rr2 * ct;
            y = cy - rr2 * st * cI;
            al = cl(p.b * (0.46 + 0.74 * be) * (1 + bo * 1.7) * dA) * 0.66;
            sz = p.w * (0.85 + 0.55 * (1 - rad));
          }
          if (al <= 0.004) continue;
          g.globalAlpha = al;
          g.fillStyle = pal[Math.min(7, (rad * 7.99) | 0)][Math.min(15, (be * 15.99) | 0)];
          g.fillRect(x, y, sz, sz);
        }
      };

      pass(0);
      g.globalCompositeOperation = "source-over";
      g.globalAlpha = 1;
      D(g, cx, cy, R, "#000000");
      g.globalCompositeOperation = "lighter";
      pass(2);

      /* photon ring, brightest where the plasma runs toward us */
      g.globalAlpha = dA * 0.45;
      g.strokeStyle = "rgba(255,188,116,.5)";
      g.lineWidth = 4.4;
      g.beginPath();
      g.arc(cx, cy, R * 1.06, 0, TAU);
      g.stroke();
      g.globalAlpha = dA * 0.8;
      g.strokeStyle = "rgba(255,234,198,.62)";
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(cx, cy, R * 1.042, 0, TAU);
      g.stroke();
      g.globalAlpha = dA;
      g.strokeStyle = "rgba(255,250,236,.95)";
      g.lineWidth = 2.1;
      g.beginPath();
      g.arc(cx, cy, R * 1.042, Math.PI * 0.56, Math.PI * 1.44);
      g.stroke();
      pass(1);
      g.globalCompositeOperation = "source-over";

      const lab = (txt: string, a: number, lx: number, ly: number, tx: number, ty: number, al2: CanvasTextAlign) => {
        if (a <= 0.01) return;
        g.globalAlpha = a * 0.55;
        L(g, lx, ly, cx + (lx - cx) * 0.3, cy + (ly - cy) * 0.3, K.grid2, 0.7);
        g.globalAlpha = a;
        TX(g, txt, tx, ty, 7, K.dim, al2);
      };
      const a1 = sg(t, 3.4, 4.2) - sg(t, 8.2, 8.9),
        a2 = sg(t, 4.6, 5.4) - sg(t, 9.1, 9.8);
      lab("event horizon", a1, cx + R * 1.16, cy + R * 1.16, cx + R * 1.3, cy + R * 1.5, "left");
      lab("photon ring", a2, cx - R * 1.2, cy - R * 1.2, cx - R * 1.34, cy - R * 1.52, "right");
      const a3 = sg(t, 10.2, 11) - sg(t, 14.4, 15.2);
      if (a3 > 0.01) {
        g.globalAlpha = a3;
        TX(g, "light from the far side bends over the top", cx, 188, 7, K.dim, "center");
      }
      const a4 = sg(t, 15.6, 16.4) - sg(t, 19.2, 19.9);
      if (a4 > 0.01) {
        g.globalAlpha = a4;
        TX(g, "approaching → beamed brighter", 26, cy - R * 2.75, 7, "#e7d7bd", "left");
      }
      g.globalAlpha = 1;
    },
  },

  /* 1 · sine traced from a rotating circle */
  sine: {
    T: 12,
    poster: 6.5,
    draw(g, t) {
      const cx = 62,
        cy = 102,
        r = 33,
        x0 = 116,
        x1 = 304;
      g.globalAlpha = sg(t, 0.3, 1.2);
      L(g, x0 - 4, cy, x1, cy, K.grid, 1);
      g.globalAlpha = 1;
      g.strokeStyle = K.grid2;
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU * sg(t, 0, 1.3));
      g.stroke();
      if (t <= 1.5) {
        TX(g, "θ = 0", cx, cy + r + 13, 9, "#4b4b52", "center");
        return;
      }
      const u = t - 1.5,
        om = TAU / 3.5,
        th = om * u,
        sp = (x1 - x0) / 10.5,
        fx = Math.min(x1, x0 + sp * u);
      const px = cx + r * Math.cos(th),
        py = cy - r * Math.sin(th);
      g.strokeStyle = K.blue;
      g.lineWidth = 2.4;
      g.lineJoin = "round";
      g.beginPath();
      const N = 130;
      let i: number, x: number;
      for (i = 0; i <= N; i++) {
        x = lp(x0, fx, i / N);
        const y = cy - r * Math.sin((om * (x - x0)) / sp);
        if (i) g.lineTo(x, y);
        else g.moveTo(x, y);
      }
      g.stroke();
      g.setLineDash([3, 4]);
      L(g, px, py, fx, py, "rgba(255,255,255,.26)", 1);
      g.setLineDash([]);
      g.strokeStyle = "rgba(194,145,58,.6)";
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(cx, cy, 9, 0, -(th % TAU), true);
      g.stroke();
      L(g, cx, cy, px, py, K.gold, 2);
      D(g, px, py, 3.2, K.gold);
      D(g, fx, py, 3.2, K.blue);
      const la = sg(t, 3, 3.8);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "sin(θ)", x1 - 6, cy - r - 11, 10, K.blue, "right");
        TX(g, "θ", cx + 15, cy - 9, 9, K.gold);
        g.globalAlpha = 1;
      }
    },
  },
  /* 2 · Riemann sums refining under a parabola */
  riemann: {
    T: 18,
    poster: 11,
    draw(g, t) {
      const ox = 34,
        oy = 170,
        W = 254,
        H = 124,
        f = (u: number) => 4 * u * (1 - u);
      let i: number;
      const X = (u: number) => ox + u * W;
      g.globalAlpha = sg(t, 0, 0.8);
      L(g, ox, oy, ox + W + 8, oy, K.grid2, 1.2);
      L(g, ox, oy, ox, oy - H - 14, K.grid2, 1.2);
      g.globalAlpha = 1;
      const stages = [
        [2.4, 4],
        [6, 8],
        [9.6, 16],
        [13.2, 32],
      ];
      let n = 0,
        st = 0;
      for (i = 0; i < stages.length; i++)
        if (t >= stages[i][0]) {
          st = stages[i][0];
          n = stages[i][1];
        }
      const fade = sg(t, 15.2, 16.6);
      if (n && fade < 1) {
        g.globalAlpha = 1 - fade;
        for (i = 0; i < n; i++) {
          const gr = sg(t, st + (i / n) * 0.7, st + (i / n) * 0.7 + 0.5);
          if (gr <= 0) continue;
          const hh = f((i + 0.5) / n) * H * gr,
            xx = X(i / n) + 0.8,
            wd = W / n - 1.6;
          g.fillStyle = "rgba(126,166,217,.20)";
          g.fillRect(xx, oy - hh, wd, hh);
          g.strokeStyle = "rgba(126,166,217,.75)";
          g.lineWidth = 1;
          g.strokeRect(xx, oy - hh, wd, hh);
        }
        TX(g, "n = " + n, ox + W, oy - H - 6, 10, K.dim, "right");
        g.globalAlpha = 1;
      }
      if (fade > 0) {
        g.globalAlpha = fade * 0.35;
        g.fillStyle = K.blue;
        g.beginPath();
        g.moveTo(X(0), oy);
        for (i = 0; i <= 80; i++) g.lineTo(X(i / 80), oy - f(i / 80) * H);
        g.lineTo(X(1), oy);
        g.closePath();
        g.fill();
        g.globalAlpha = 1;
      }
      PLOT(g, X(0), X(1), (x) => oy - f((x - ox) / W) * H, sg(t, 0.4, 2.2), K.blue, 2.4);
      const eq = sg(t, 16, 16.9);
      if (eq > 0) {
        g.globalAlpha = eq;
        TX(g, "∫ f(x) dx = 2/3", ox + W, oy - H - 6, 10, K.blue, "right");
        g.globalAlpha = 1;
      }
    },
  },
  /* 3 · rotational vector field with flowing particles */
  vfield: {
    T: 15,
    poster: 8,
    draw(g, t) {
      const cx = 160,
        cy = 100;
      let x: number, y: number, k: number;
      for (x = 26; x <= 294; x += 28)
        for (y = 18; y <= 182; y += 28) {
          const dx = x - cx,
            dy = y - cy,
            d = Math.hypot(dx, dy);
          if (d < 10) continue;
          const ap = sg(t, 0.2 + d * 0.006, 0.9 + d * 0.006);
          if (ap <= 0) continue;
          let vx = -dy,
            vy = dx;
          const m = Math.hypot(vx, vy);
          vx /= m;
          vy /= m;
          const len = (7 + Math.min(9, d * 0.055)) * ap;
          g.globalAlpha = 0.85;
          AR(g, x - (vx * len) / 2, y - (vy * len) / 2, x + (vx * len) / 2, y + (vy * len) / 2, "rgba(95,191,126,.6)", 1.4);
          g.globalAlpha = 1;
        }
      const R = rng(7),
        P = 26;
      let ii: number;
      for (ii = 0; ii < P; ii++) {
        const r0 = 20 + R() * 74,
          a0 = R() * TAU,
          col = R() < 0.5 ? K.gold : K.blue,
          om = 1.15 - r0 * 0.0058;
        const pa = sg(t, 1.6 + ii * 0.06, 2.4 + ii * 0.06);
        if (pa <= 0) continue;
        const a = a0 + om * Math.max(0, t - 1.6);
        for (k = 9; k >= 1; k--) {
          const aa = a - k * 0.06;
          g.globalAlpha = pa * 0.5 * (1 - k / 10);
          D(g, cx + r0 * Math.cos(aa), cy + r0 * Math.sin(aa), 2.3 * (1 - k / 14), col);
        }
        g.globalAlpha = pa;
        D(g, cx + r0 * Math.cos(a), cy + r0 * Math.sin(a), 2.3, col);
        g.globalAlpha = 1;
      }
      D(g, cx, cy, 2.4, "#4b4b52");
      const la = sg(t, 3.2, 4);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "v = (−y, x)", 298, 184, 10, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },
  /* 4 · eigenvectors staying on their span */
  eigen: {
    T: 20,
    poster: 7,
    draw(g, t) {
      const cx = 160,
        cy = 100,
        s = 26;
      let i: number;
      const p = sg(t, 2.6, 7.4) - sg(t, 10.2, 12.2) + sg(t, 13.2, 17.4);
      const a = 1 + p,
        b = p,
        c = p,
        d = 1 + p;
      const M = (x: number, y: number): [number, number] => [cx + (a * x + b * y) * s, cy - (c * x + d * y) * s];
      const ga = sg(t, 0, 1.6);
      g.lineWidth = 1;
      for (i = -7; i <= 7; i++) {
        g.globalAlpha = ga * (i === 0 ? 0.4 : 0.13);
        g.strokeStyle = K.blue;
        let p1 = M(i, -7),
          p2 = M(i, 7);
        g.beginPath();
        g.moveTo(p1[0], p1[1]);
        g.lineTo(p2[0], p2[1]);
        g.stroke();
        p1 = M(-7, i);
        p2 = M(7, i);
        g.beginPath();
        g.moveTo(p1[0], p1[1]);
        g.lineTo(p2[0], p2[1]);
        g.stroke();
      }
      g.globalAlpha = 1;
      const sp = sg(t, 7.6, 8.4) * 0.35;
      if (sp > 0) {
        g.setLineDash([4, 5]);
        g.globalAlpha = sp;
        L(g, cx - 84, cy + 84, cx + 84, cy - 84, K.gold, 1.2);
        L(g, cx - 84, cy - 84, cx + 84, cy + 84, K.green, 1.2);
        g.globalAlpha = 1;
        g.setLineDash([]);
      }
      const gv = sg(t, 1, 2),
        angs = [15, 75, 105, 165, 195, 255, 285, 345];
      for (i = 0; i < angs.length; i++) {
        const th = (angs[i] * Math.PI) / 180,
          ux = Math.cos(th),
          uy = Math.sin(th);
        const tp = M(ux * gv, uy * gv);
        g.globalAlpha = 0.35;
        AR(g, cx, cy, tp[0], tp[1], K.dim, 1.3);
        g.globalAlpha = 1;
      }
      const e = 0.7071 * gv,
        t1 = M(e, e),
        t2 = M(e, -e);
      AR(g, cx, cy, t1[0], t1[1], K.gold, 2.4);
      AR(g, cx, cy, t2[0], t2[1], K.green, 2.4);
      const l1 = sg(t, 7.8, 8.6) * Math.max(0.25, p);
      if (l1 > 0) {
        g.globalAlpha = l1;
        TX(g, "Av = 3v", t1[0] + 9, t1[1] - 8, 10, K.gold);
        g.globalAlpha = 1;
      }
      const l2 = sg(t, 13.8, 14.6);
      if (l2 > 0) {
        g.globalAlpha = l2;
        TX(g, "Av = v", t2[0] + 9, t2[1] + 10, 10, K.green);
        g.globalAlpha = 1;
      }
    },
  },
  /* 5 · Pythagorean rearrangement, 3-4-5 */
  pyth: {
    T: 16,
    poster: 10.5,
    draw(g, t) {
      const f1 = sg(t, 8.2, 10.6),
        f2 = sg(t, 10.8, 13.2),
        fg = 2704 / 4225;
      const dtri = sg(t, 0, 1.6),
        per = 52 + 39 + 65;
      g.strokeStyle = K.wht;
      g.lineWidth = 1.8;
      g.setLineDash([per * dtri, per]);
      g.beginPath();
      g.moveTo(150, 118);
      g.lineTo(202, 118);
      g.lineTo(150, 79);
      g.closePath();
      g.stroke();
      g.setLineDash([]);
      if (t > 1.4) {
        g.strokeStyle = K.dim;
        g.lineWidth = 1;
        g.strokeRect(150, 111, 7, 7);
      }
      const lab = sg(t, 1.5, 2.2);
      if (lab > 0) {
        g.globalAlpha = lab;
        TX(g, "a", 176, 127, 10, K.gold, "center");
        TX(g, "b", 141, 98, 10, K.green, "center");
        TX(g, "c", 170, 106, 10, K.blue, "center");
        g.globalAlpha = 1;
      }
      const gs = sg(t, 2.2, 3.6);
      if (gs > 0) {
        g.globalAlpha = 1 - 0.6 * f1;
        g.fillStyle = "rgba(194,145,58,.22)";
        g.fillRect(150, 118, 52, 52 * gs);
        g.strokeStyle = K.gold;
        g.lineWidth = 1.3;
        g.strokeRect(150, 118, 52, 52 * gs);
        if (gs > 0.9) {
          g.globalAlpha = (1 - 0.6 * f1) * sg(t, 3.4, 3.9);
          TX(g, "a²", 176, 144, 11, K.gold, "center");
        }
        g.globalAlpha = 1;
      }
      const gq = sg(t, 3.2, 4.6);
      if (gq > 0) {
        g.globalAlpha = 1 - 0.6 * f2;
        g.fillStyle = "rgba(95,191,126,.22)";
        g.fillRect(150 - 39 * gq, 79, 39 * gq, 39);
        g.strokeStyle = K.green;
        g.lineWidth = 1.3;
        g.strokeRect(150 - 39 * gq, 79, 39 * gq, 39);
        if (gq > 0.9) {
          g.globalAlpha = (1 - 0.6 * f2) * sg(t, 4.4, 4.9);
          TX(g, "b²", 130, 98, 11, K.green, "center");
        }
        g.globalAlpha = 1;
      }
      const hp = sg(t, 5.2, 6.8),
        hper = 260;
      if (hp > 0) {
        g.strokeStyle = K.blue;
        g.lineWidth = 1.5;
        g.setLineDash([hper * hp, hper]);
        g.beginPath();
        g.moveTo(150, 79);
        g.lineTo(202, 118);
        g.lineTo(241, 66);
        g.lineTo(189, 27);
        g.closePath();
        g.stroke();
        g.setLineDash([]);
        const hl = sg(t, 6.6, 7.2);
        if (hl > 0) {
          g.globalAlpha = hl * (1 - 0.8 * f1);
          TX(g, "c²", 196, 72, 11, K.blue, "center");
          g.globalAlpha = 1;
        }
      }
      if (f1 > 0) {
        g.save();
        g.transform(0.8, 0.6, 0.6, -0.8, 150, 79);
        g.fillStyle = "rgba(194,145,58,.32)";
        g.fillRect(0, 0, 65, 65 * fg * f1);
        if (f2 > 0) {
          g.fillStyle = "rgba(95,191,126,.32)";
          g.fillRect(0, 65 * fg, 65, 65 * (1 - fg) * f2);
        }
        g.restore();
        if (f2 > 0.2) {
          g.globalAlpha = f2 * 0.35;
          L(g, 174.96, 45.72, 226.96, 84.72, "#fff", 1);
          g.globalAlpha = 1;
        }
      }
      const eq = sg(t, 13.6, 14.4);
      if (eq > 0) {
        g.globalAlpha = eq;
        TX(g, "a²", 26, 180, 13, K.gold);
        TX(g, "+", 46, 180, 13, K.dim);
        TX(g, "b²", 58, 180, 13, K.green);
        TX(g, "=", 79, 180, 13, K.dim);
        TX(g, "c²", 92, 180, 13, K.blue);
        g.globalAlpha = 1;
      }
    },
  },
  /* 6 · normal distribution built from falling samples */
  bell: {
    T: 14,
    poster: 9,
    draw(g, t) {
      const bins = 13,
        x0 = 44,
        x1 = 276,
        bw = (x1 - x0) / bins,
        oy = 168;
      let i: number;
      if (!this._S) {
        const R = rng(42),
          S: { tau: number; b: number; k: number }[] = [],
          perBin = new Array(bins).fill(0);
        for (i = 0; i < 150; i++) {
          const b = Math.max(0, Math.min(12, Math.round((R() + R() + R() + R()) * 3)));
          S.push({ tau: 0.3 + i * (9.6 / 150) + R() * 0.05, b: b, k: perBin[b]++ });
        }
        this._S = S;
        this._max = Math.max.apply(null, perBin);
      }
      const unit = 112 / this._max!;
      L(g, x0 - 8, oy, x1 + 8, oy, K.grid2, 1.2);
      const cnt = new Array(bins).fill(0),
        falling: [number, number][] = [];
      let landed = 0;
      for (i = 0; i < this._S.length; i++) {
        const sm = this._S[i];
        if (t < sm.tau) continue;
        const pp = ln(t, sm.tau, sm.tau + 0.5);
        if (pp < 1) falling.push([x0 + (sm.b + 0.5) * bw, lp(10, oy - (sm.k + 1) * unit, pp * pp)]);
        else {
          if (sm.k + 1 > cnt[sm.b]) cnt[sm.b] = sm.k + 1;
          landed++;
        }
      }
      for (i = 0; i < bins; i++)
        if (cnt[i] > 0) {
          const h = cnt[i] * unit,
            bx = x0 + i * bw + 1.5,
            bwd = bw - 3;
          g.fillStyle = "rgba(95,191,126,.35)";
          g.fillRect(bx, oy - h, bwd, h);
          g.globalAlpha = 0.8;
          L(g, bx, oy - h, bx + bwd, oy - h, K.green, 1);
          g.globalAlpha = 1;
        }
      for (i = 0; i < falling.length; i++) D(g, falling[i][0], falling[i][1], 2.3, K.gold);
      const maxH = this._max! * unit;
      PLOT(
        g,
        x0,
        x1,
        (x) => {
          const u = ((x - x0) / (x1 - x0)) * 13 - 0.5;
          return oy - maxH * Math.exp(-((u - 6) * (u - 6)) / (2 * 2.2 * 2.2));
        },
        sg(t, 10.6, 12.6),
        K.blue,
        2.4,
      );
      const mu = sg(t, 12.7, 13.3);
      if (mu > 0) {
        g.globalAlpha = mu;
        g.setLineDash([3, 4]);
        L(g, 160, oy, 160, oy - 118, "rgba(255,255,255,.35)", 1);
        g.setLineDash([]);
        TX(g, "μ", 160, 42, 10, K.txt, "center");
        g.globalAlpha = 1;
      }
      TX(g, "n = " + landed, x1 + 8, 26, 10, K.dim, "right");
    },
  },
  /* 7 · tangent sweeping along a cubic */
  tangent: {
    T: 13,
    poster: 6,
    draw(g, t) {
      const X = (u: number) => 160 + u * 76,
        Y = (u: number) => 104 - (u * u * u - 1.8 * u) * 26;
      g.globalAlpha = sg(t, 0, 0.7);
      L(g, 24, 104, 300, 104, K.grid, 1);
      L(g, 160, 16, 160, 190, K.grid, 1);
      g.globalAlpha = 1;
      PLOT(
        g,
        X(-1.62),
        X(1.62),
        (x) => {
          const u = (x - 160) / 76;
          return 104 - (u * u * u - 1.8 * u) * 26;
        },
        sg(t, 0.3, 1.9),
        K.blue,
        2.4,
      );
      if (t <= 2.3) return;
      const u = lp(-1.45, 1.45, ss(ln(t, 2.3, 11))),
        m = 3 * u * u - 1.8;
      const E = [-0.7746, 0.7746];
      let i: number;
      for (i = 0; i < 2; i++) {
        const al = sg(u, E[i], E[i] + 0.15);
        if (al <= 0) continue;
        g.globalAlpha = al * 0.9;
        g.strokeStyle = K.green;
        g.lineWidth = 1.4;
        g.beginPath();
        g.arc(X(E[i]), Y(E[i]), 5, 0, TAU);
        g.stroke();
        TX(g, "f′= 0", X(E[i]), Y(E[i]) + (E[i] < 0 ? -15 : 17), 8.5, K.green, "center");
        g.globalAlpha = 1;
      }
      const x = X(u),
        y = Y(u),
        dxs = 76,
        dys = -26 * m,
        Lm = Math.hypot(dxs, dys),
        ux = dxs / Lm,
        uy = dys / Lm;
      g.globalAlpha = 0.25;
      g.setLineDash([3, 4]);
      L(g, x, y, x, 104, "#fff", 1);
      g.setLineDash([]);
      g.globalAlpha = 1;
      const hot = Math.abs(m) < 0.18,
        col = hot ? K.green : K.gold;
      L(g, x - ux * 36, y - uy * 36, x + ux * 36, y + uy * 36, col, 2);
      D(g, x, y, 3.4, col);
      const bo = sg(t, 2.3, 3);
      if (bo > 0) {
        g.globalAlpha = bo;
        g.fillStyle = "rgba(18,18,24,.75)";
        g.fillRect(208, 19, 94, 21);
        g.strokeStyle = K.grid2;
        g.lineWidth = 1;
        g.strokeRect(208, 19, 94, 21);
        TX(g, "f′(x) = " + (m < 0 ? "−" : "+") + Math.abs(m).toFixed(2), 216, 30, 9, K.txt);
        g.globalAlpha = 1;
      }
      const end = sg(t, 11.4, 12.1);
      if (end > 0) {
        g.globalAlpha = end;
        TX(g, "extrema where f′(x) = 0", 160, 186, 9.5, K.dim, "center");
        g.globalAlpha = 1;
      }
    },
  },
  /* 8 · shear grid under a 2×2 matrix */
  matrix: {
    T: 17,
    poster: 5.5,
    draw(g, t) {
      const cx = 160,
        cy = 104,
        s = 30;
      let i: number;
      const p = sg(t, 2.4, 6) - sg(t, 9, 10.8) + sg(t, 11.8, 15);
      const M = (x: number, y: number): [number, number] => [cx + (x + p * y) * s, cy - y * s];
      const ga = sg(t, 0, 1.4);
      for (i = -6; i <= 6; i++) {
        g.globalAlpha = ga * (i === 0 ? 0.4 : 0.13);
        g.strokeStyle = K.blue;
        g.lineWidth = 1;
        let p1 = M(i, -3.2),
          p2 = M(i, 3.2);
        g.beginPath();
        g.moveTo(p1[0], p1[1]);
        g.lineTo(p2[0], p2[1]);
        g.stroke();
        if (i >= -3 && i <= 3) {
          p1 = M(-6, i);
          p2 = M(6, i);
          g.beginPath();
          g.moveTo(p1[0], p1[1]);
          g.lineTo(p2[0], p2[1]);
          g.stroke();
        }
      }
      g.globalAlpha = 1;
      const pf = sg(t, 12, 13.4);
      if (pf > 0) {
        const c0 = M(0, 0),
          c1 = M(1, 0),
          c2 = M(1, 1),
          c3 = M(0, 1);
        g.globalAlpha = pf;
        g.fillStyle = "rgba(126,166,217,.16)";
        g.beginPath();
        g.moveTo(c0[0], c0[1]);
        g.lineTo(c1[0], c1[1]);
        g.lineTo(c2[0], c2[1]);
        g.lineTo(c3[0], c3[1]);
        g.closePath();
        g.fill();
        g.strokeStyle = "rgba(126,166,217,.7)";
        g.lineWidth = 1.2;
        g.stroke();
        g.globalAlpha = pf * sg(t, 13.2, 13.9);
        TX(g, "det = 1", cx + (0.5 + p * 0.5) * s, cy + 15, 9, K.blue, "center");
        g.globalAlpha = 1;
      }
      const gv = sg(t, 1, 1.8),
        ti = M(gv, 0),
        tj = M(0, gv);
      AR(g, cx, cy, ti[0], ti[1], K.gold, 2.2);
      AR(g, cx, cy, tj[0], tj[1], K.green, 2.2);
      if (gv > 0.9) {
        g.globalAlpha = sg(t, 1.7, 2.2);
        TX(g, "î", ti[0] + 2, ti[1] + 12, 10, K.gold, "center");
        TX(g, "ĵ", tj[0] + 10, tj[1] - 6, 10, K.green, "center");
        g.globalAlpha = 1;
      }
      const br = sg(t, 6.4, 7.2);
      if (br > 0) {
        g.globalAlpha = br;
        g.strokeStyle = K.txt;
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(254, 20);
        g.lineTo(250, 20);
        g.lineTo(250, 46);
        g.lineTo(254, 46);
        g.stroke();
        g.beginPath();
        g.moveTo(294, 20);
        g.lineTo(298, 20);
        g.lineTo(298, 46);
        g.lineTo(294, 46);
        g.stroke();
        TX(g, "1", 262, 28, 10, K.wht, "center");
        TX(g, "1", 286, 28, 10, K.gold, "center");
        TX(g, "0", 262, 40, 10, K.dim, "center");
        TX(g, "1", 286, 40, 10, K.wht, "center");
        g.globalAlpha = 1;
      }
    },
  },
  /* 9 · Ulam spiral of primes */
  primes: {
    T: 22,
    poster: 14,
    draw(g, t) {
      let i: number;
      if (!this._P) {
        const N = 529,
          pos: number[][] = [[0, 0]];
        let x = 0,
          y = 0,
          dx = 1,
          dy = 0,
          sl = 1,
          sd = 0,
          tn = 0,
          n: number;
        for (n = 2; n <= N; n++) {
          x += dx;
          y += dy;
          pos.push([x, y]);
          sd++;
          if (sd === sl) {
            sd = 0;
            const nd = -dy;
            dy = dx;
            dx = nd;
            tn++;
            if (tn % 2 === 0) sl++;
          }
        }
        const isP = new Array(N + 1).fill(true);
        isP[0] = isP[1] = false;
        for (i = 2; i * i <= N; i++) if (isP[i]) for (let j = i * i; j <= N; j += i) isP[j] = false;
        const pc = new Array(N + 1).fill(0);
        for (i = 1; i <= N; i++) pc[i] = pc[i - 1] + (isP[i] ? 1 : 0);
        this._P = { pos: pos, isP: isP, pc: pc, N: N };
      }
      const PD = this._P,
        nn = 1 + Math.pow(ln(t, 0, 20), 1.6) * 528,
        nv = Math.min(PD.N, Math.floor(nn));
      const cs = Math.max(3.4, Math.min(16, 86 / (Math.sqrt(nn) / 2 + 1.5)));
      const numA = cl((cs - 8.5) / 3),
        compA = (1 - numA * 0.4) * (1 - 0.85 * sg(t, 19, 21.5));
      g.strokeStyle = "rgba(255,255,255,.09)";
      g.lineWidth = 1;
      g.beginPath();
      for (i = Math.max(0, nv - 14); i < nv; i++) {
        const q = PD.pos[i];
        const sx = 160 + q[0] * cs,
          sy = 100 - q[1] * cs;
        if (i === Math.max(0, nv - 14)) g.moveTo(sx, sy);
        else g.lineTo(sx, sy);
      }
      g.stroke();
      for (let n2 = 1; n2 <= nv; n2++) {
        const pq = PD.pos[n2 - 1],
          X2 = 160 + pq[0] * cs,
          Y2 = 100 - pq[1] * cs;
        if (X2 < -8 || X2 > 328 || Y2 < -8 || Y2 > 208) continue;
        const prime = PD.isP[n2],
          newest = n2 === nv;
        if (numA < 1) {
          if (prime) {
            g.globalAlpha = 1 - numA;
            D(g, X2, Y2, Math.max(1.5, cs * 0.3) * (newest ? 1.55 : 1), K.gold);
          } else {
            g.globalAlpha = (1 - numA) * compA * 0.8;
            D(g, X2, Y2, Math.max(0.8, cs * 0.14), "#3a3a44");
          }
          g.globalAlpha = 1;
        }
        if (numA > 0) {
          g.globalAlpha = numA * (prime ? 1 : 0.55);
          TX(g, String(n2), X2, Y2, cs * 0.42, prime ? K.gold : "#55555d", "center");
          if (prime) {
            g.strokeStyle = K.gold;
            g.lineWidth = 1;
            g.globalAlpha = numA * 0.7;
            g.beginPath();
            g.arc(X2, Y2, cs * 0.42, 0, TAU);
            g.stroke();
          }
          g.globalAlpha = 1;
        }
      }
      TX(g, "n = " + nv + " · " + PD.pc[nv] + " primes", 16, 188, 9.5, K.dim);
    },
  },
  /* 10 · Fourier epicycles building a square wave */
  fourier: {
    T: 16,
    poster: 9.5,
    draw(g, t) {
      const cx = 64,
        cy = 100,
        x0 = 136,
        x1 = 306,
        sc = 30;
      let i: number, k: number;
      const th = (TAU / 4) * Math.max(0, t - 0.8);
      const aps = [sg(t, 0.2, 1)];
      for (i = 1; i < 5; i++) aps.push(sg(t, 1.6 + i * 1.7, 2.4 + i * 1.7));
      let px = cx,
        py = cy,
        nAct = 0;
      for (i = 0; i < 5; i++) {
        const ap = aps[i];
        if (ap <= 0) break;
        nAct++;
        k = 2 * i + 1;
        const r = (4 / (k * Math.PI)) * sc * ap,
          ph = k * th;
        g.strokeStyle = "rgba(126,166,217,.38)";
        g.lineWidth = 1;
        g.beginPath();
        g.arc(px, py, r, 0, TAU);
        g.stroke();
        const nx = px + r * Math.cos(ph),
          ny = py - r * Math.sin(ph);
        L(g, px, py, nx, ny, "rgba(244,244,245,.7)", 1.2);
        px = nx;
        py = ny;
      }
      let st = false;
      g.strokeStyle = K.blue;
      g.lineWidth = 2.2;
      g.lineJoin = "round";
      g.beginPath();
      for (let xx = x0; xx <= x1; xx += 2) {
        const phw = th - (xx - x0) * 0.052;
        if (phw < 0) break;
        let y = cy;
        for (i = 0; i < nAct; i++) {
          k = 2 * i + 1;
          y -= (4 / (k * Math.PI)) * sc * aps[i] * Math.sin(k * phw);
        }
        if (st) g.lineTo(xx, y);
        else {
          g.moveTo(xx, y);
          st = true;
        }
      }
      g.stroke();
      g.setLineDash([3, 4]);
      L(g, px, py, x0, py, "rgba(255,255,255,.25)", 1);
      g.setLineDash([]);
      D(g, px, py, 3, K.gold);
      D(g, x0, py, 2.6, K.blue);
      const la = sg(t, 1.2, 1.9);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "n = " + nAct + (nAct === 5 ? " terms" : ""), 304, 22, 10, K.gold, "right");
        g.globalAlpha = 1;
      }
      const lb = sg(t, 12.5, 13.5);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "f(θ) = Σ 4/kπ · sin(kθ)", 160, 188, 9.5, K.dim, "center");
        g.globalAlpha = 1;
      }
    },
  },
  /* 11 · Lorenz attractor */
  lorenz: {
    T: 18,
    poster: 12,
    draw(g, t) {
      let i: number;
      if (!this._L) {
        const P: number[][] = [];
        let x = 0.6,
          y = 0.6,
          z = 12;
        const dt = 0.0042;
        for (i = 0; i < 10000; i++) {
          const dx = 10 * (y - x),
            dy = x * (28 - z) - y,
            dz = x * y - 2.6667 * z;
          x += dx * dt;
          y += dy * dt;
          z += dz * dt;
          P.push([160 + x * 5.3, 196 - z * 3.45]);
        }
        this._L = P;
      }
      const P = this._L,
        n = Math.max(2, Math.floor(ss(ln(t, 0.2, 17.4)) * (P.length - 1)));
      g.strokeStyle = "rgba(126,166,217,.15)";
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(P[0][0], P[0][1]);
      for (i = 1; i <= n; i += 3) g.lineTo(P[i][0], P[i][1]);
      g.stroke();
      const tail = Math.min(n, 900),
        s0 = n - tail;
      for (i = s0; i < n; i += 2) {
        const p = (i - s0) / tail;
        g.strokeStyle = MX([126, 166, 217], [194, 145, 58], p);
        g.globalAlpha = 0.15 + 0.85 * p;
        g.lineWidth = 0.8 + 1.6 * p;
        g.beginPath();
        g.moveTo(P[i][0], P[i][1]);
        g.lineTo(P[Math.min(n, i + 2)][0], P[Math.min(n, i + 2)][1]);
        g.stroke();
      }
      g.globalAlpha = 1;
      const hd = P[n];
      g.globalAlpha = 0.25;
      D(g, hd[0], hd[1], 6, K.gold);
      g.globalAlpha = 1;
      D(g, hd[0], hd[1], 2.6, "#ffd98a");
      const la = sg(t, 2, 3);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "σ=10  ρ=28  β=8/3", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
      const lb = sg(t, 15, 16);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "never crosses itself", 16, 186, 9.5, K.dim);
        g.globalAlpha = 1;
      }
    },
  },
  /* 12 · double pendulum chaos, two runs 0.001 rad apart */
  pendulum: {
    T: 16,
    poster: 12,
    draw(g, t) {
      if (!this._A) {
        const mk = (off: number) => {
          let t1 = 1.85,
            w1 = 0,
            t2 = 2.05 + off,
            w2 = 0;
          const out: number[][] = [],
            dt = 1 / 240;
          for (let i = 0; i < 16 * 240; i++) {
            const d = t1 - t2,
              G = 9.81,
              den = 3 - Math.cos(2 * d);
            const a1 = (-3 * G * Math.sin(t1) - G * Math.sin(t1 - 2 * t2) - 2 * Math.sin(d) * (w2 * w2 + w1 * w1 * Math.cos(d))) / den;
            const a2 = (2 * Math.sin(d) * (2 * w1 * w1 + 2 * G * Math.cos(t1) + w2 * w2 * Math.cos(d))) / den;
            w1 += a1 * dt;
            w2 += a2 * dt;
            t1 += w1 * dt;
            t2 += w2 * dt;
            out.push([t1, t2]);
          }
          return out;
        };
        this._A = mk(0);
        this._B = mk(0.001);
      }
      const A = this._A,
        B = this._B!;
      const ox = 160,
        oy = 84,
        AL = 38;
      const idx = Math.min(A.length - 1, Math.max(0, Math.floor(t * 240)));
      const one = (run: number[][], armC: string, bobC: string, trailC: string, alpha: number) => {
        const tl = Math.min(idx, 520);
        let i: number;
        g.lineWidth = 1.2;
        for (i = idx - tl; i < idx; i += 3) {
          if (i < 0) continue;
          const p = (i - (idx - tl)) / tl;
          const q1 = run[i],
            q2 = run[Math.min(idx, i + 3)];
          const X1 = ox + AL * Math.sin(q1[0]) + AL * Math.sin(q1[1]),
            Y1 = oy + AL * Math.cos(q1[0]) + AL * Math.cos(q1[1]);
          const X2 = ox + AL * Math.sin(q2[0]) + AL * Math.sin(q2[1]),
            Y2 = oy + AL * Math.cos(q2[0]) + AL * Math.cos(q2[1]);
          g.globalAlpha = alpha * p * 0.5;
          g.strokeStyle = trailC;
          g.beginPath();
          g.moveTo(X1, Y1);
          g.lineTo(X2, Y2);
          g.stroke();
        }
        g.globalAlpha = alpha;
        const q = run[idx];
        const x1 = ox + AL * Math.sin(q[0]),
          y1 = oy + AL * Math.cos(q[0]),
          x2 = x1 + AL * Math.sin(q[1]),
          y2 = y1 + AL * Math.cos(q[1]);
        L(g, ox, oy, x1, y1, armC, 2);
        L(g, x1, y1, x2, y2, armC, 2);
        D(g, x1, y1, 3, bobC);
        D(g, x2, y2, 3.6, bobC);
        g.globalAlpha = 1;
      };
      D(g, ox, oy, 2.2, "#4b4b52");
      const vis = sg(t, 0.2, 0.9);
      one(B, "rgba(95,191,126,.8)", K.green, "rgba(95,191,126,.5)", vis);
      one(A, "rgba(244,244,245,.9)", K.gold, "rgba(194,145,58,.55)", vis);
      const la = sg(t, 1.2, 2);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "Δθ₀ = 0.001 rad", 16, 50, 10, K.txt);
        g.globalAlpha = 1;
      }
      const lb = sg(t, 9.5, 10.5);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "same laws, different worlds", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },
  /* 13 · phyllotaxis, golden-angle bloom */
  phyllo: {
    T: 14,
    poster: 11,
    draw(g, t) {
      const cx = 160,
        cy = 100,
        GA = Math.PI * (3 - Math.sqrt(5));
      let i: number;
      const N = Math.floor(ss(ln(t, 0.2, 12.6)) * 430),
        rot = t * 0.05;
      for (i = 0; i < N; i++) {
        const r = 4.55 * Math.sqrt(i);
        if (r > 126) continue;
        const a = i * GA + rot,
          p = r / 126,
          last = i >= N - 3;
        g.globalAlpha = last ? 1 : 0.4 + 0.5 * p;
        D(g, cx + r * Math.cos(a), cy + r * Math.sin(a), (1.4 + 2.4 * p) * (last ? 1.6 : 1), last ? "#ffd98a" : MX([194, 145, 58], [126, 166, 217], p));
      }
      g.globalAlpha = 1;
      const la = sg(t, 3, 4);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "θ = 137.507°", 16, 50, 10, K.gold);
        TX(g, "r = c√n", 16, 66, 9.5, K.dim);
        g.globalAlpha = 1;
      }
      TX(g, "n = " + N, 304, 186, 9.5, K.dim, "right");
    },
  },
  /* 14 · Taylor polynomials converging to sin */
  taylor: {
    T: 15,
    poster: 9,
    draw(g, t) {
      const Yv = (v: number) => 100 - v * 34;
      g.globalAlpha = sg(t, 0, 0.7);
      L(g, 18, 100, 302, 100, K.grid, 1);
      L(g, 160, 14, 160, 190, K.grid, 1);
      g.globalAlpha = 1;
      PLOT(g, 160 - 3.55 * 40, 160 + 3.55 * 40, (x) => Yv(Math.sin((x - 160) / 40)), sg(t, 0.3, 1.6), "rgba(126,166,217,.5)", 1.6);
      const fact = [1, 6, 120, 5040, 362880, 39916800];
      const stage = Math.min(5, Math.floor(Math.max(0, t - 1.6) / 1.9));
      const tay = (u: number, nS: number) => {
        let s = 0;
        for (let k = 0; k <= nS; k++) s += (Math.pow(-1, k) * Math.pow(u, 2 * k + 1)) / fact[k];
        return s;
      };
      const F = (nS: number) => (x: number) => {
        const u = (x - 160) / 40;
        return Yv(Math.max(-2.6, Math.min(2.6, tay(u, nS))));
      };
      if (stage > 0) {
        g.globalAlpha = 0.3;
        PLOT(g, 160 - 3.55 * 40, 160 + 3.55 * 40, F(stage - 1), 1, K.dim, 1.3);
        g.globalAlpha = 1;
      }
      const prog = t < 1.6 ? 0 : Math.min(1, (t - 1.6 - stage * 1.9) / 1.4);
      PLOT(g, 160 - 3.55 * 40, 160 + 3.55 * 40, F(stage), prog, K.gold, 2.3);
      const la = sg(t, 1.6, 2.2);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "x - x³/3! + x⁵/5! - …", 82, 182, 10, K.txt, "center");
        TX(g, "n = " + (2 * stage + 1), 296, 24, 11, K.gold, "right");
        g.globalAlpha = 1;
      }
      const lb = sg(t, 13, 14);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "→ sin(x)", 296, 40, 10, K.blue, "right");
        g.globalAlpha = 1;
      }
    },
  },
  /* 15 · two-source wave interference */
  waves: {
    T: 14,
    poster: 8,
    draw(g, t) {
      const s1x = 112,
        s2x = 208,
        sy = 100,
        kk = 0.25,
        om = 3.1;
      const on1 = sg(t, 0.3, 0.9),
        on2 = sg(t, 3.2, 3.8);
      let gx: number, gy: number;
      for (gx = 18; gx <= 302; gx += 7.5)
        for (gy = 14; gy <= 186; gy += 7.5) {
          const r1 = Math.hypot(gx - s1x, gy - sy),
            r2 = Math.hypot(gx - s2x, gy - sy);
          const v =
            (on1 * Math.cos(kk * r1 - om * t)) / (1 + r1 * 0.012) +
            (on2 * Math.cos(kk * r2 - om * t)) / (1 + r2 * 0.012);
          const mag = Math.min(1, Math.abs(v));
          if (mag < 0.06) continue;
          g.globalAlpha = mag * 0.9;
          D(g, gx, gy, 0.8 + 2.1 * mag, v > 0 ? K.blue : K.gold);
        }
      g.globalAlpha = 1;
      D(g, s1x, sy, 3, "#fff");
      if (on2 > 0) {
        g.globalAlpha = on2;
        D(g, s2x, sy, 3, "#fff");
        g.globalAlpha = 1;
      }
      const la = sg(t, 4.2, 5);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "cos(kr₁ - ωt) + cos(kr₂ - ωt)", 160, 188, 9.5, K.dim, "center");
        g.globalAlpha = 1;
      }
    },
  },
  /* 17 · three-body figure-8 choreography */
  threebody: {
    T: 18,
    poster: 12,
    draw(g, t) {
      let k: number, i: number;
      if (!this._TB) {
        const b = [
          [-0.97000436, 0.24308753],
          [0.97000436, -0.24308753],
          [0, 0],
        ];
        const v = [
          [0.466203685, 0.43236573],
          [0.466203685, 0.43236573],
          [-0.93240737, -0.86473146],
        ];
        const P: number[][][] = [[], [], []];
        const dt = 0.001;
        let l: number;
        for (i = 0; i < 20000; i++) {
          const acc = [
            [0, 0],
            [0, 0],
            [0, 0],
          ];
          for (k = 0; k < 3; k++)
            for (l = 0; l < 3; l++) {
              if (k === l) continue;
              const dx = b[l][0] - b[k][0],
                dy = b[l][1] - b[k][1],
                d = Math.hypot(dx, dy),
                f = 1 / (d * d * d);
              acc[k][0] += dx * f;
              acc[k][1] += dy * f;
            }
          for (k = 0; k < 3; k++) {
            v[k][0] += acc[k][0] * dt;
            v[k][1] += acc[k][1] * dt;
            b[k][0] += v[k][0] * dt;
            b[k][1] += v[k][1] * dt;
            if (i % 10 === 0) P[k].push([160 + b[k][0] * 118, 100 - b[k][1] * 118]);
          }
        }
        this._TB = P;
      }
      const P = this._TB,
        n = Math.max(2, Math.floor(ln(t, 0.3, 17.5) * (P[0].length - 1))),
        cols = [K.gold, K.blue, K.green];
      for (k = 0; k < 3; k++) {
        g.strokeStyle = cols[k];
        g.globalAlpha = 0.3;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(P[k][0][0], P[k][0][1]);
        for (i = 1; i <= n; i++) g.lineTo(P[k][i][0], P[k][i][1]);
        g.stroke();
        g.globalAlpha = 1;
        const h = P[k][n];
        g.globalAlpha = 0.25;
        D(g, h[0], h[1], 7, cols[k]);
        g.globalAlpha = 1;
        D(g, h[0], h[1], 3.4, cols[k]);
      }
      const la = sg(t, 1, 1.8);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "three equal masses", 16, 52, 9.5, K.dim);
        g.globalAlpha = 1;
      }
      const lb = sg(t, 8, 9);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "a stable figure-8", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },
  /* 18 · times-table chords morphing cardioid → epicycloids */
  modular: {
    T: 16,
    poster: 8,
    draw(g, t) {
      const cx = 160,
        cy = 100,
        R = 82,
        N = 180;
      let i: number;
      const k = 2 + 3 * ss(ln(t, 1.2, 14.5));
      g.strokeStyle = K.grid2;
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(cx, cy, R, 0, TAU);
      g.stroke();
      const ap = sg(t, 0.2, 1.1);
      g.globalAlpha = ap * 0.5;
      for (i = 0; i < N; i++) {
        const a = (i / N) * TAU;
        D(g, cx + R * Math.cos(a), cy + R * Math.sin(a), 1, K.dim);
      }
      g.globalAlpha = 1;
      const ch = sg(t, 0.8, 1.8);
      if (ch > 0) {
        g.globalAlpha = ch * 0.32;
        g.strokeStyle = K.blue;
        g.lineWidth = 0.7;
        g.beginPath();
        for (i = 0; i < N; i++) {
          const a1 = (i / N) * TAU,
            a2 = (((k * i) % N) / N) * TAU;
          g.moveTo(cx + R * Math.cos(a1), cy + R * Math.sin(a1));
          g.lineTo(cx + R * Math.cos(a2), cy + R * Math.sin(a2));
        }
        g.stroke();
        g.globalAlpha = 1;
      }
      const names: Record<number, string> = { 2: "cardioid", 3: "nephroid", 4: "epicycloid", 5: "epicycloid" },
        kr = Math.round(k);
      if (Math.abs(k - kr) < 0.08 && names[kr] && t > 1) {
        g.globalAlpha = (1 - Math.abs(k - kr) / 0.08) * 0.9;
        TX(g, names[kr], cx, cy, 11, K.gold, "center");
        g.globalAlpha = 1;
      }
      const la = sg(t, 1.6, 2.4);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "n → " + k.toFixed(2) + " · n  (mod 180)", 160, 188, 9.5, K.txt, "center");
        g.globalAlpha = 1;
      }
    },
  },
  /* 19 · logistic-map bifurcation sweep */
  logistic: {
    T: 16,
    poster: 12,
    draw(g, t) {
      let i: number, c: number;
      if (!this._cv) {
        const oc = document.createElement("canvas");
        oc.width = 640;
        oc.height = 400;
        const og = oc.getContext("2d")!;
        og.scale(2, 2);
        og.fillStyle = "rgba(126,166,217,.16)";
        for (c = 0; c < 272; c++) {
          const r = 2.8 + (c / 271) * 1.2;
          let x = 0.4;
          for (i = 0; i < 90; i++) x = r * x * (1 - x);
          for (i = 0; i < 110; i++) {
            x = r * x * (1 - x);
            og.fillRect(24 + c, 26 + (1 - x) * 148, 1, 1);
          }
        }
        this._cv = oc;
      }
      const cv = this._cv;
      const pr = ss(ln(t, 0.4, 13.5)),
        wpx = Math.floor(pr * 320);
      if (wpx > 0) g.drawImage(cv, 0, 0, wpx * 2, 400, 0, 0, wpx, 200);
      L(g, 24, 178, 298, 178, K.grid2, 1.2);
      const ticks: [number, string][] = [
        [3, "3.0"],
        [3.45, "3.45"],
        [3.57, "3.57"],
        [4, "4.0"],
      ];
      for (i = 0; i < ticks.length; i++) {
        const tx = 24 + ((ticks[i][0] - 2.8) / 1.2) * 271;
        if (tx > wpx) continue;
        L(g, tx, 178, tx, 182, K.dim, 1);
        TX(g, ticks[i][1], tx, 190, 8.5, K.dim, "center");
      }
      if (pr > 0 && pr < 1) L(g, wpx, 22, wpx, 176, "rgba(255,217,138,.5)", 1);
      const la = sg(t, 1, 1.8);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "x → rx(1-x)", 304, 24, 10, K.txt, "right");
        g.globalAlpha = 1;
      }
      const lb = sg(t, 13.6, 14.4);
      if (lb > 0) {
        const cx3 = 24 + ((3.57 - 2.8) / 1.2) * 271;
        g.globalAlpha = lb;
        g.setLineDash([3, 4]);
        L(g, cx3, 22, cx3, 176, "rgba(194,145,58,.5)", 1);
        g.setLineDash([]);
        TX(g, "chaos", cx3 + 6, 30, 9, K.gold);
        g.globalAlpha = 1;
      }
    },
  },
  /* 20 · random walk vs √n envelope */
  walk: {
    T: 15,
    poster: 10,
    draw(g, t) {
      let i: number, w: number;
      if (!this._W) {
        const R = rng(11),
          W2: number[][][] = [];
        for (w = 0; w < 5; w++) {
          const p: number[][] = [[24, 100]];
          let y = 0;
          for (i = 1; i <= 260; i++) {
            y += (R() < 0.5 ? -1 : 1) * 3.1;
            y = Math.max(-88, Math.min(88, y));
            p.push([24 + i * (276 / 260), 100 - y * 0.82]);
          }
          W2.push(p);
        }
        this._W = W2;
      }
      const paths = this._W;
      L(g, 24, 100, 300, 100, K.grid2, 1);
      const env = sg(t, 10.5, 12);
      if (env > 0) {
        g.globalAlpha = env;
        g.setLineDash([3, 4]);
        g.strokeStyle = K.gold;
        g.lineWidth = 1.3;
        g.beginPath();
        for (i = 0; i <= 100; i++) {
          const xx = 24 + (i / 100) * 276,
            e = Math.sqrt((i / 100) * 260) * 3.1 * 0.82;
          if (i) g.lineTo(xx, 100 - e);
          else g.moveTo(xx, 100);
        }
        g.stroke();
        g.beginPath();
        for (i = 0; i <= 100; i++) {
          const x2 = 24 + (i / 100) * 276,
            e2 = Math.sqrt((i / 100) * 260) * 3.1 * 0.82;
          if (i) g.lineTo(x2, 100 + e2);
          else g.moveTo(x2, 100);
        }
        g.stroke();
        g.setLineDash([]);
        TX(g, "±√n", 302, 52, 10, K.gold, "right");
        g.globalAlpha = 1;
      }
      const cols = ["#7ea6d9", "#5fbf7e", "#c2913a", "#b07ed9", "#d97e7e"];
      for (w = 0; w < 5; w++) {
        const pts = paths[w],
          n = Math.floor(sg(t, w * 0.5, w * 0.5 + 9.5) * 260);
        if (n < 2) continue;
        g.strokeStyle = cols[w];
        g.globalAlpha = 0.75;
        g.lineWidth = 1.3;
        g.beginPath();
        g.moveTo(pts[0][0], pts[0][1]);
        for (i = 1; i <= n; i++) g.lineTo(pts[i][0], pts[i][1]);
        g.stroke();
        g.globalAlpha = 1;
        D(g, pts[n][0], pts[n][1], 2.2, cols[w]);
      }
      const la = sg(t, 0.8, 1.6);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "coin flips, +1 / −1", 16, 52, 9.5, K.dim);
        g.globalAlpha = 1;
      }
    },
  },
  /* 21 · Monte Carlo estimate of π */
  montecarlo: {
    T: 16,
    poster: 11,
    draw(g, t) {
      const cx = 104,
        cy = 104,
        R = 78;
      let i: number;
      if (!this._Q) {
        const Rr = rng(19),
          Q: [number, number, boolean, number][] = [];
        for (i = 0; i < 560; i++) {
          const x = Rr() * 2 - 1,
            y = Rr() * 2 - 1;
          Q.push([x, y, x * x + y * y <= 1, 0.6 + i * (13 / 560)]);
        }
        this._Q = Q;
      }
      const Q = this._Q;
      g.strokeStyle = K.grid2;
      g.lineWidth = 1.2;
      g.strokeRect(cx - R, cy - R, 2 * R, 2 * R);
      g.strokeStyle = "rgba(126,166,217,.8)";
      g.beginPath();
      g.arc(cx, cy, R, 0, TAU);
      g.stroke();
      let inC = 0,
        tot = 0;
      for (i = 0; i < Q.length; i++) {
        const q = Q[i];
        if (t < q[3]) break;
        const ag = Math.min(1, (t - q[3]) / 0.25);
        tot++;
        if (q[2]) inC++;
        g.globalAlpha = ag * (q[2] ? 0.9 : 0.55);
        D(g, cx + q[0] * R, cy + q[1] * R, 1.7, q[2] ? K.green : "#d97e7e");
      }
      g.globalAlpha = 1;
      const est = tot > 0 ? (4 * inC) / tot : 0;
      TX(g, "in circle", 212, 60, 9.5, K.green);
      TX(g, String(inC), 282, 60, 9.5, K.wht, "right");
      TX(g, "total", 212, 78, 9.5, K.dim);
      TX(g, String(tot), 282, 78, 9.5, K.wht, "right");
      L(g, 212, 90, 282, 90, K.grid2, 1);
      TX(g, "4·in/total", 212, 104, 9.5, K.txt);
      if (tot > 0) TX(g, est.toFixed(3), 282, 122, 12, K.gold, "right");
      const la = sg(t, 14, 15);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "π ≈ 3.14159…", 212, 144, 9.5, K.blue);
        g.globalAlpha = 1;
      }
    },
  },
  /* 22 · e^iθ walking the unit circle to −1 */
  euler: {
    T: 14,
    poster: 9,
    draw(g, t) {
      const cx = 118,
        cy = 100,
        R = 64;
      g.globalAlpha = sg(t, 0, 0.8);
      L(g, cx - R - 18, cy, cx + R + 18, cy, K.grid, 1);
      L(g, cx, cy - R - 16, cx, cy + R + 16, K.grid, 1);
      g.globalAlpha = 1;
      g.strokeStyle = K.grid2;
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(cx, cy, R, 0, TAU);
      g.stroke();
      TX(g, "1", cx + R + 9, cy + 11, 9, K.dim);
      TX(g, "i", cx - 9, cy - R - 8, 9, K.dim);
      const th = Math.PI * ss(ln(t, 1.2, 9.5));
      g.strokeStyle = K.blue;
      g.lineWidth = 2.4;
      g.beginPath();
      g.arc(cx, cy, R, 0, -th, true);
      g.stroke();
      const px = cx + R * Math.cos(th),
        py = cy - R * Math.sin(th);
      L(g, cx, cy, px, py, K.gold, 1.8);
      D(g, px, py, 3.6, K.gold);
      g.strokeStyle = "rgba(194,145,58,.5)";
      g.lineWidth = 1;
      g.beginPath();
      g.arc(cx, cy, 13, 0, -th, true);
      g.stroke();
      const tl = sg(t, 1.2, 2);
      if (tl > 0) {
        g.globalAlpha = tl;
        TX(g, "θ = " + th.toFixed(2), cx + 18, cy - 12, 9, K.gold);
        g.globalAlpha = 1;
      }
      TX(g, "e", 226, 84, 15, K.wht);
      TX(g, "iθ", 237, 77, 9.5, K.blue);
      const done = th > Math.PI - 0.02;
      if (done) {
        const fin = sg(t, 9.6, 10.4);
        TX(g, "= −1", 252, 84, 15, K.wht);
        if (fin > 0) {
          g.globalAlpha = fin;
          TX(g, "e", 226, 116, 15, K.wht);
          TX(g, "iπ", 237, 109, 9.5, K.gold);
          TX(g, "+ 1 = 0", 252, 116, 15, K.wht);
          D(g, cx - R, cy, 4.4, "#ffd98a");
          g.globalAlpha = 1;
        }
      } else TX(g, "= cos θ + i sin θ", 226, 104, 9, K.dim);
    },
  },
  /* 23 · Collatz hailstone trajectories */
  collatz: {
    T: 15,
    poster: 10,
    draw(g, t) {
      let i: number, s: number;
      if (!this._C) {
        const seeds = [27, 97, 871, 231, 703],
          C: number[][] = [];
        for (s = 0; s < seeds.length; s++) {
          let n = seeds[s];
          const seq = [n];
          while (n !== 1 && seq.length < 120) {
            n = n % 2 ? 3 * n + 1 : n / 2;
            seq.push(n);
          }
          C.push(seq);
        }
        this._C = C;
        this._seeds = seeds;
      }
      const C = this._C,
        seeds = this._seeds!,
        cols = ["#c2913a", "#7ea6d9", "#5fbf7e", "#b07ed9", "#d97e7e"];
      const Y = (v: number) => 176 - (Math.log(v) / Math.log(10000)) * 150;
      L(g, 22, 176, 302, 176, K.grid2, 1);
      TX(g, "1", 14, 176, 9, K.dim);
      for (s = 0; s < C.length; s++) {
        const seq = C[s],
          col = cols[s];
        const n2 = Math.floor(sg(t, s * 1.1 + 0.3, s * 1.1 + 7.5) * (seq.length - 1));
        if (n2 < 1) continue;
        g.strokeStyle = col;
        g.globalAlpha = 0.8;
        g.lineWidth = 1.3;
        g.lineJoin = "round";
        g.beginPath();
        for (i = 0; i <= n2; i++) {
          const xx = 24 + i * (276 / 119);
          if (i) g.lineTo(xx, Y(seq[i]));
          else g.moveTo(xx, Y(seq[i]));
        }
        g.stroke();
        g.globalAlpha = 1;
        const hx = 24 + n2 * (276 / 119);
        D(g, hx, Y(seq[n2]), 2.4, col);
        if (n2 === seq.length - 1) {
          g.globalAlpha = 0.9;
          TX(g, String(seeds[s]), hx + 7, Y(seq[n2]), 8.5, col);
          g.globalAlpha = 1;
        }
      }
      const la = sg(t, 0.6, 1.4);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "n → n/2  or  3n+1", 16, 52, 10, K.txt);
        g.globalAlpha = 1;
      }
      const lb = sg(t, 12.6, 13.6);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "every start falls to 1 — no one knows why", 160, 190, 9, K.dim, "center");
        g.globalAlpha = 1;
      }
    },
  },
  /* 24 · Koch snowflake iterations */
  koch: {
    T: 15,
    poster: 11,
    draw(g, t) {
      let i: number;
      if (!this._K) {
        const base: number[][] = [
          [160, 26],
          [233, 152],
          [87, 152],
          [160, 26],
        ];
        const lvls: number[][][] = [base];
        let cur = base,
          l: number;
        for (l = 0; l < 4; l++) {
          const nx: number[][] = [];
          for (i = 0; i < cur.length - 1; i++) {
            const a = cur[i],
              b = cur[i + 1];
            const dx = (b[0] - a[0]) / 3,
              dy = (b[1] - a[1]) / 3;
            const p1 = [a[0] + dx, a[1] + dy],
              p3 = [a[0] + 2 * dx, a[1] + 2 * dy];
            const mx = (p1[0] + p3[0]) / 2,
              my = (p1[1] + p3[1]) / 2;
            const px = -(p3[1] - p1[1]) * 0.8660254,
              py = (p3[0] - p1[0]) * 0.8660254;
            nx.push(a, p1, [mx - px, my - py], p3);
          }
          nx.push(cur[cur.length - 1]);
          lvls.push(nx);
          cur = nx;
        }
        this._K = lvls;
      }
      const lv = this._K;
      const stage = Math.min(4, Math.floor(Math.max(0, t - 0.5) / 2.6));
      const pr = t < 0.5 ? 0 : Math.min(1, (t - 0.5 - stage * 2.6) / 1.6);
      const pts = lv[stage];
      if (stage > 0) {
        g.globalAlpha = 0.22;
        g.strokeStyle = K.blue;
        g.lineWidth = 1;
        g.beginPath();
        const pv = lv[stage - 1];
        g.moveTo(pv[0][0], pv[0][1]);
        for (i = 1; i < pv.length; i++) g.lineTo(pv[i][0], pv[i][1]);
        g.stroke();
        g.globalAlpha = 1;
      }
      const n = Math.max(1, Math.floor(pr * (pts.length - 1)));
      g.strokeStyle = K.gold;
      g.lineWidth = stage > 2 ? 1 : 1.6;
      g.lineJoin = "round";
      g.beginPath();
      g.moveTo(pts[0][0], pts[0][1]);
      for (i = 1; i <= n; i++) g.lineTo(pts[i][0], pts[i][1]);
      g.stroke();
      TX(g, "iteration " + stage, 16, 52, 10, K.txt);
      const per = (3 * Math.pow(4 / 3, stage)).toFixed(2);
      TX(g, "perimeter = " + per, 16, 68, 9, K.dim);
      const lb = sg(t, 13, 14);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "finite area, infinite edge", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },
  /* 25 · sieve of Eratosthenes on a 10×10 grid */
  sieve: {
    T: 17,
    poster: 12,
    draw(g, t) {
      const x0 = 88,
        y0 = 22,
        cs = 16.4;
      let i: number, r: number, c: number;
      if (!this._V) {
        const mark = new Array(101).fill(0),
          ev: number[][] = [];
        let p: number, m: number;
        for (p = 2; p <= 10; p++) {
          if (mark[p]) continue;
          for (m = p * p; m <= 100; m += p)
            if (!mark[m]) {
              mark[m] = p;
              ev.push([m, p]);
            }
        }
        this._V = { mark: mark, ev: ev };
      }
      const V = this._V,
        pcol: Record<number, string> = { 2: "#7ea6d9", 3: "#5fbf7e", 5: "#c2913a", 7: "#b07ed9" };
      const phase: Record<number, number> = { 2: 1.2, 3: 5, 5: 8.4, 7: 10.8 },
        dur: Record<number, number> = { 2: 3.2, 3: 2.8, 5: 1.8, 7: 1.4 };
      const kill: Record<number, number> = {};
      for (i = 0; i < V.ev.length; i++) {
        const e = V.ev[i],
          p2 = e[1];
        let idx = 0,
          cnt = 0,
          j: number;
        for (j = 0; j < V.ev.length; j++)
          if (V.ev[j][1] === p2) {
            if (V.ev[j][0] === e[0]) idx = cnt;
            cnt++;
          }
        const tt = phase[p2] + (idx / cnt) * dur[p2];
        if (t >= tt) kill[e[0]] = ln(t, tt, tt + 0.4);
      }
      const fin = sg(t, 13.2, 14.6);
      for (i = 1; i <= 100; i++) {
        r = Math.floor((i - 1) / 10);
        c = (i - 1) % 10;
        const X = x0 + c * cs,
          Y = y0 + r * cs;
        let dead = kill[i] !== undefined ? kill[i] : 0;
        const isPrime = !V.mark[i] && i > 1;
        if (i === 1) dead = t > 1 ? 1 : 0;
        if (isPrime && fin > 0) {
          g.globalAlpha = fin * 0.28;
          g.fillStyle = K.gold;
          g.fillRect(X - cs / 2 + 1.4, Y - cs / 2 + 1.4, cs - 2.8, cs - 2.8);
          g.globalAlpha = 1;
        }
        if (dead > 0 && dead < 1) {
          g.globalAlpha = 0.5 * (1 - dead);
          g.fillStyle = pcol[V.mark[i]] || "#555";
          g.fillRect(X - cs / 2 + 1.4, Y - cs / 2 + 1.4, cs - 2.8, cs - 2.8);
          g.globalAlpha = 1;
        }
        const a = 1 - dead * 0.82;
        g.globalAlpha = a;
        TX(g, String(i), X, Y, 8.2, dead > 0 ? "#3f3f47" : isPrime && fin > 0 ? "#ffd98a" : K.txt, "center");
        g.globalAlpha = 1;
      }
      const order = [2, 3, 5, 7];
      for (i = 0; i < 4; i++) {
        const pp = order[i],
          on = sg(t, phase[pp] - 0.5, phase[pp]);
        if (on <= 0) continue;
        g.globalAlpha = on;
        D(g, 26, 52 + i * 22, 3.4, pcol[pp]);
        TX(g, "× " + pp, 36, 52 + i * 22, 10, K.txt);
        g.globalAlpha = 1;
      }
      const lb = sg(t, 14.6, 15.6);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "25 primes survive", 26, 160, 9.5, K.gold);
        g.globalAlpha = 1;
      }
    },
  },
  /* 26 · derivative as limit: secant → tangent */
  limit: {
    T: 13,
    poster: 8,
    draw(g, t) {
      const F = (u: number) => 0.3 * u * u,
        X = (u: number) => 62 + u * 30,
        Y = (v: number) => 168 - v * 30;
      g.globalAlpha = sg(t, 0, 0.7);
      L(g, 40, 168, 300, 168, K.grid, 1);
      L(g, 62, 16, 62, 186, K.grid, 1);
      g.globalAlpha = 1;
      PLOT(
        g,
        X(0),
        X(7.6),
        (x) => {
          const u = (x - 62) / 30;
          return Y(F(u));
        },
        sg(t, 0.2, 1.4),
        K.blue,
        2.2,
      );
      if (t < 1.6) return;
      const a = 2.6,
        h = lp(3.6, 0.06, ss(ln(t, 2, 10.5)));
      const x1 = X(a),
        y1 = Y(F(a)),
        x2 = X(a + h),
        y2 = Y(F(a + h));
      const m = (F(a + h) - F(a)) / h;
      const sl = (y2 - y1) / (x2 - x1);
      const ex1 = x1 - 40,
        ey1 = y1 - 40 * sl,
        ex2 = x2 + 52,
        ey2 = y2 + 52 * sl;
      L(g, ex1, ey1, ex2, ey2, K.gold, 1.7);
      g.setLineDash([3, 4]);
      L(g, x2, y2, x2, 168, "rgba(255,255,255,.22)", 1);
      L(g, x1, y1, x1, 168, "rgba(255,255,255,.22)", 1);
      g.setLineDash([]);
      D(g, x1, y1, 3.4, "#fff");
      D(g, x2, y2, 3.2, K.gold);
      TX(g, "a", x1, 178, 9, K.txt, "center");
      if (h > 0.5) TX(g, "a+h", x2, 178, 9, K.gold, "center");
      const bo = sg(t, 1.8, 2.5);
      if (bo > 0) {
        g.globalAlpha = bo;
        TX(g, "h = " + h.toFixed(2), 230, 34, 10, K.gold, "left");
        TX(g, "slope = " + m.toFixed(3), 230, 52, 10, K.txt, "left");
        g.globalAlpha = 1;
      }
      const lb = sg(t, 10.8, 11.8);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "h → 0:  secant becomes tangent", 160, 190, 9.5, K.dim, "center");
        g.globalAlpha = 1;
      }
    },
  },
  /* 27 · Fibonacci golden spiral */
  fib: {
    T: 15,
    poster: 11,
    draw(g, t) {
      const seq = [1, 1, 2, 3, 5, 8];
      let i: number;
      if (!this._R) {
        const rs = [
          { x: 161, y: 90, w: 13, h: 13 },
          { x: 148, y: 90, w: 13, h: 13 },
          { x: 148, y: 64, w: 26, h: 26 },
          { x: 174, y: 64, w: 39, h: 39 },
          { x: 109, y: 38, w: 65, h: 65 },
          { x: 109, y: 103, w: 104, h: 104 },
        ];
        const arcs = [
          { cx: 161, cy: 90, r: 13, a0: Math.PI / 2, a1: Math.PI },
          { cx: 161, cy: 90, r: 13, a0: Math.PI, a1: Math.PI * 1.5 },
          { cx: 174, cy: 90, r: 26, a0: Math.PI * 1.5, a1: TAU },
          { cx: 174, cy: 103, r: 39, a0: 0, a1: Math.PI / 2 },
          { cx: 174, cy: 103, r: 65, a0: Math.PI / 2, a1: Math.PI },
          { cx: 213, cy: 103, r: 104, a0: Math.PI, a1: Math.PI * 1.5 },
        ];
        this._R = { rs: rs, arcs: arcs };
      }
      const R = this._R;
      for (i = 0; i < 6; i++) {
        const ap = sg(t, 0.4 + i * 1.5, 1.4 + i * 1.5);
        if (ap <= 0) continue;
        const rc = R.rs[i];
        g.globalAlpha = ap;
        g.strokeStyle = K.grid2;
        g.lineWidth = 1.1;
        g.strokeRect(rc.x, rc.y, rc.w, rc.h);
        if (rc.w > 18) TX(g, String(seq[i]), rc.x + rc.w / 2, rc.y + rc.h / 2, Math.min(13, rc.w * 0.3), "#4b4b52", "center");
        g.globalAlpha = 1;
      }
      for (i = 0; i < 6; i++) {
        const st = 1 + i * 1.5,
          pr2 = sg(t, st, st + 1.5);
        if (pr2 <= 0) continue;
        const ar = R.arcs[i];
        g.strokeStyle = K.gold;
        g.lineWidth = 2.2;
        g.beginPath();
        g.arc(ar.cx, ar.cy, ar.r, ar.a0, ar.a0 + (ar.a1 - ar.a0) * pr2);
        g.stroke();
      }
      const la = sg(t, 1, 1.8);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "1  1  2  3  5  8 …", 26, 52, 10.5, K.txt);
        g.globalAlpha = 1;
      }
      const lb = sg(t, 11.5, 12.5);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "ratio → φ = 1.618…", 26, 70, 9.5, K.gold);
        g.globalAlpha = 1;
      }
    },
  },
  /* 28 · Conway's Game of Life */
  gameoflife: {
    T: 18,
    poster: 12,
    draw(g, t) {
      const cs = 6.2,
        gw = 34,
        gh = 22,
        x0 = (320 - gw * cs) / 2,
        y0 = (200 - gh * cs) / 2 + 6;
      let i: number, r: number, c: number;
      if (!this._G) {
        const grid = new Uint8Array(gw * gh);
        const glider = [
          [1, 0],
          [2, 1],
          [0, 2],
          [1, 2],
          [2, 2],
        ];
        for (i = 0; i < glider.length; i++) grid[(glider[i][1] + 2) * gw + glider[i][0] + 2] = 1;
        for (i = 0; i < glider.length; i++) grid[(glider[i][1] + 3) * gw + (gw - 6 - glider[i][0])] = 1;
        const blk = [
          [14, 9],
          [15, 9],
          [14, 10],
          [15, 10],
        ];
        for (i = 0; i < blk.length; i++) grid[blk[i][1] * gw + blk[i][0]] = 1;
        const blinker = [
          [24, 16],
          [25, 16],
          [26, 16],
        ];
        for (i = 0; i < blinker.length; i++) grid[blinker[i][1] * gw + blinker[i][0]] = 1;
        const rp = [
          [6, 15],
          [7, 15],
          [6, 16],
          [7, 17],
          [8, 15],
        ];
        for (i = 0; i < rp.length; i++) grid[rp[i][1] * gw + rp[i][0]] = 1;
        this._G = { grid: grid, gen: 0, hist: [grid.slice()] };
      }
      const G = this._G,
        step = (gr: Uint8Array) => {
          const nx = new Uint8Array(gw * gh);
          let rr: number, cc: number;
          for (rr = 0; rr < gh; rr++)
            for (cc = 0; cc < gw; cc++) {
              let nb = 0,
                dr: number,
                dc2: number;
              for (dr = -1; dr <= 1; dr++)
                for (dc2 = -1; dc2 <= 1; dc2++) {
                  if (!dr && !dc2) continue;
                  nb += gr[((rr + dr + gh) % gh) * gw + ((cc + dc2 + gw) % gw)];
                }
              const al = gr[rr * gw + cc];
              nx[rr * gw + cc] = (al && (nb === 2 || nb === 3)) || (!al && nb === 3) ? 1 : 0;
            }
          return nx;
        };
      const want = Math.floor(Math.max(0, t - 1) / 0.42);
      while (G.gen < want && G.gen < 40) {
        G.grid = step(G.grid);
        G.gen++;
        G.hist.push(G.grid.slice());
      }
      const show = Math.min(want, 40),
        cur = G.hist[show] || G.grid,
        prev = G.hist[Math.max(0, show - 1)];
      const frac = t < 1 ? 0 : Math.min(1, ((Math.max(0, t - 1) - show * 0.42) / 0.42) * 2);
      g.strokeStyle = "rgba(255,255,255,.04)";
      g.lineWidth = 1;
      for (r = 0; r <= gh; r++) L(g, x0, y0 + r * cs, x0 + gw * cs, y0 + r * cs, "rgba(255,255,255,.045)", 1);
      for (c = 0; c <= gw; c++) L(g, x0 + c * cs, y0, x0 + c * cs, y0 + gh * cs, "rgba(255,255,255,.045)", 1);
      for (r = 0; r < gh; r++)
        for (c = 0; c < gw; c++) {
          const v = cur[r * gw + c],
            pv = prev[r * gw + c];
          if (!v && !pv) continue;
          const a2 = v ? (pv ? 1 : frac) : 1 - frac;
          if (a2 <= 0) continue;
          g.globalAlpha = a2;
          g.fillStyle = v && !pv ? "#ffd98a" : K.green;
          g.fillRect(x0 + c * cs + 0.8, y0 + r * cs + 0.8, cs - 1.6, cs - 1.6);
          g.globalAlpha = 1;
        }
      TX(g, "gen " + show, 304, 24, 10, K.dim, "right");
      const la = sg(t, 0.4, 1);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "B3/S23", 16, 52, 10, K.txt);
        g.globalAlpha = 1;
      }
      const lb = sg(t, 15, 16);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "four rules, endless life", 160, 196, 9.5, K.dim, "center");
        g.globalAlpha = 1;
      }
    },
  },
  /* 30 · Hilbert curve filling a square */
  hilbert: {
    T: 16,
    poster: 10,
    draw(g, t) {
      let i: number, j: number;
      if (!this._hil) {
        const mk = (n: number) => {
          const pts: number[][] = [];
          const rec = (x0: number, y0: number, xi: number, xj: number, yi: number, yj: number, d: number) => {
            if (d <= 0) {
              pts.push([x0 + (xi + yi) / 2, y0 + (xj + yj) / 2]);
              return;
            }
            rec(x0, y0, yi / 2, yj / 2, xi / 2, xj / 2, d - 1);
            rec(x0 + xi / 2, y0 + xj / 2, xi / 2, xj / 2, yi / 2, yj / 2, d - 1);
            rec(x0 + xi / 2 + yi / 2, y0 + xj / 2 + yj / 2, xi / 2, xj / 2, yi / 2, yj / 2, d - 1);
            rec(x0 + xi / 2 + yi, y0 + xj / 2 + yj, -yi / 2, -yj / 2, -xi / 2, -xj / 2, d - 1);
          };
          rec(80, 18, 164, 0, 0, 164, n);
          return pts;
        };
        const L2: number[][][] = [];
        for (let n2 = 1; n2 <= 6; n2++) L2.push(mk(n2));
        this._hil = L2;
      }
      const HL = this._hil;
      const stage = Math.min(5, Math.floor(Math.max(0, t - 0.3) / 2.5));
      const pr = t < 0.3 ? 0 : Math.min(1, (t - 0.3 - stage * 2.5) / 1.9);
      if (stage > 0) {
        const pv = HL[stage - 1];
        g.globalAlpha = 0.15;
        g.strokeStyle = K.blue;
        g.lineWidth = 1;
        g.lineJoin = "round";
        g.beginPath();
        g.moveTo(pv[0][0], pv[0][1]);
        for (i = 1; i < pv.length; i++) g.lineTo(pv[i][0], pv[i][1]);
        g.stroke();
        g.globalAlpha = 1;
      }
      const P = HL[stage],
        n = Math.max(1, Math.floor(pr * (P.length - 1))),
        seg = Math.max(1, Math.ceil(n / 48));
      g.lineJoin = "round";
      g.lineCap = "round";
      g.lineWidth = Math.max(0.9, 3.4 - stage * 0.5);
      for (i = 0; i < n; i += seg) {
        g.strokeStyle = MX([126, 166, 217], [255, 217, 138], i / (P.length - 1));
        g.beginPath();
        g.moveTo(P[i][0], P[i][1]);
        for (j = i + 1; j <= Math.min(n, i + seg); j++) g.lineTo(P[j][0], P[j][1]);
        g.stroke();
      }
      TX(g, "order " + (stage + 1), 16, 52, 10, K.txt);
      TX(g, Math.pow(4, stage + 1) + " cells", 16, 68, 9, K.dim);
      const lb = sg(t, 14, 15);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "one line, every square", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },

  /* 31 · chaos game growing a Barnsley fern */
  chaosgame: {
    T: 17,
    poster: 11,
    draw(g, t) {
      let i: number;
      if (!this._fern) {
        const R = rng(23),
          P: number[][] = [];
        let x = 0,
          y = 0;
        for (i = 0; i < 42000; i++) {
          const r = R();
          let nx: number, ny: number, m: number;
          if (r < 0.01) {
            nx = 0;
            ny = 0.16 * y;
            m = 0;
          } else if (r < 0.86) {
            nx = 0.85 * x + 0.04 * y;
            ny = -0.04 * x + 0.85 * y + 1.6;
            m = 1;
          } else if (r < 0.93) {
            nx = 0.2 * x - 0.26 * y;
            ny = 0.23 * x + 0.22 * y + 1.6;
            m = 2;
          } else {
            nx = -0.15 * x + 0.28 * y;
            ny = 0.26 * x + 0.24 * y + 0.44;
            m = 3;
          }
          x = nx;
          y = ny;
          P.push([160 + x * 17.5, 196 - y * 17.5, m]);
        }
        this._fern = P;
      }
      const ac = ACC(this, 640, 400),
        n = Math.floor(ss(ln(t, 0.3, 15.5)) * this._fern.length);
      if (n < (this._an ?? 0)) {
        ac.g.clearRect(0, 0, 640, 400);
        this._an = 0;
      }
      const ag = ac.g;
      let last = "";
      for (i = this._an ?? 0; i < n; i++) {
        const q = this._fern[i];
        const col = q[2] === 1 ? "rgba(95,191,126,.5)" : q[2] === 0 ? "rgba(126,166,217,.6)" : "rgba(194,145,58,.55)";
        if (col !== last) {
          ag.fillStyle = col;
          last = col;
        }
        ag.fillRect(q[0] * 2, q[1] * 2, 1.5, 1.5);
      }
      this._an = n;
      g.drawImage(ac.c, 0, 0, 320, 200);
      TX(g, "points: " + n, 16, 52, 10, K.txt);
      const la = sg(t, 1, 1.8);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "four matrices, rolled at random", 16, 68, 9, K.dim);
        g.globalAlpha = 1;
      }
      const lb = sg(t, 14.6, 15.6);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "no one drew the leaves", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },

  /* 32 · Apollonian gasket */
  apollonian: {
    T: 18,
    poster: 12,
    draw(g, t) {
      let i: number;
      if (!this._gasket) {
        type Cur = { k: number; kx: number; ky: number };
        const C: { x: number; y: number; r: number; d: number }[] = [];
        const O: Cur = { k: -1, kx: 0, ky: 0 },
          A: Cur = { k: 2, kx: -1, ky: 0 },
          B: Cur = { k: 2, kx: 1, ky: 0 },
          D1: Cur = { k: 3, kx: 0, ky: 2 },
          D2: Cur = { k: 3, kx: 0, ky: -2 };
        const add = (c: Cur, d: number) => {
          C.push({ x: c.kx / c.k, y: c.ky / c.k, r: Math.abs(1 / c.k), d });
        };
        add(O, 0);
        add(A, 0);
        add(B, 0);
        add(D1, 0);
        add(D2, 0);
        const rec = (a: Cur, b: Cur, c: Cur, d: Cur, dep: number) => {
          if (C.length > 2200 || dep > 13) return;
          const k = 2 * (a.k + b.k + c.k) - d.k,
            r = Math.abs(1 / k);
          if (r < 0.0055) return;
          const e: Cur = { k, kx: 2 * (a.kx + b.kx + c.kx) - d.kx, ky: 2 * (a.ky + b.ky + c.ky) - d.ky };
          add(e, dep);
          rec(a, b, e, c, dep + 1);
          rec(a, c, e, b, dep + 1);
          rec(b, c, e, a, dep + 1);
        };
        rec(O, A, D1, B, 1);
        rec(O, B, D1, A, 1);
        rec(A, B, D1, O, 1);
        rec(O, A, D2, B, 1);
        rec(O, B, D2, A, 1);
        rec(A, B, D2, O, 1);
        C.sort((p, q) => p.d - q.d);
        this._gasket = C;
      }
      const C = this._gasket,
        S = 88,
        show = Math.floor(ss(ln(t, 0.3, 15.6)) * C.length);
      for (i = 0; i < show; i++) {
        const c = C[i],
          rr = c.r * S;
        if (rr < 0.35) continue;
        g.strokeStyle = i === 0 ? K.grid2 : MX([126, 166, 217], [255, 217, 138], Math.min(1, c.d / 7));
        g.lineWidth = i === 0 ? 1.4 : Math.max(0.5, Math.min(1.5, rr * 0.09));
        g.beginPath();
        g.arc(160 + c.x * S, 100 - c.y * S, rr, 0, TAU);
        g.stroke();
      }
      TX(g, show + " circles", 16, 52, 10, K.txt);
      const la = sg(t, 1.4, 2.2);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "every gap holds another circle", 160, 192, 9.5, K.dim, "center");
        g.globalAlpha = 1;
      }
    },
  },

  /* 36 · square → cube → tesseract */
  tesseract: {
    T: 18,
    poster: 13,
    draw(g, t) {
      let i: number, j: number;
      if (!this._tessV) {
        const V: number[][] = [],
          E: number[][] = [];
        for (let n = 0; n < 16; n++) V.push([n & 1 ? 1 : -1, n & 2 ? 1 : -1, n & 4 ? 1 : -1, n & 8 ? 1 : -1]);
        for (i = 0; i < 16; i++)
          for (j = i + 1; j < 16; j++) {
            const q = i ^ j;
            if (q && !(q & (q - 1))) E.push([i, j]);
          }
        this._tessV = V;
        this._tessE = E;
        this._tessP = [];
      }
      const V = this._tessV,
        E = this._tessE!,
        PR = this._tessP!;
      const sz = sg(t, 3, 6),
        sw = sg(t, 7, 10.5),
        az = t * 0.18,
        a = t * 0.34 * sz,
        b = t * 0.23 * sz,
        c = t * 0.41 * sw;
      const cz = Math.cos(az),
        szn = Math.sin(az),
        ca = Math.cos(a),
        sa = Math.sin(a);
      const cb = Math.cos(b),
        sb = Math.sin(b),
        cc = Math.cos(c),
        sc2 = Math.sin(c);
      for (i = 0; i < 16; i++) {
        const v = V[i];
        const x = v[0] * cz - v[1] * szn,
          y = v[0] * szn + v[1] * cz,
          z = v[2] * sz,
          w = v[3] * sw;
        const x2 = x * cc - w * sc2,
          w2 = x * sc2 + w * cc;
        const y2 = y * cb - z * sb,
          z2 = y * sb + z * cb;
        const x3 = x2 * ca - z2 * sa,
          z3 = x2 * sa + z2 * ca;
        const k4 = 2.6 / (2.6 - w2 * 0.55),
          X3 = x3 * k4,
          Y3 = y2 * k4,
          Z3 = z3 * k4;
        const k3 = 3.4 / (3.4 - Z3 * 0.6);
        PR[i] = [160 + X3 * k3 * 36, 100 - Y3 * k3 * 36, (w2 + 2) / 4];
      }
      const order: number[][] = [];
      for (i = 0; i < E.length; i++) order.push([(PR[E[i][0]][2] + PR[E[i][1]][2]) / 2, i]);
      order.sort((p, q) => p[0] - q[0]);
      for (i = 0; i < order.length; i++) {
        const e = E[order[i][1]],
          dp = order[i][0],
          p1 = PR[e[0]],
          p2 = PR[e[1]];
        g.globalAlpha = 0.22 + 0.78 * dp;
        L(g, p1[0], p1[1], p2[0], p2[1], MX([88, 118, 168], [255, 217, 138], dp), 0.7 + 1.7 * dp);
      }
      for (i = 0; i < 16; i++) {
        g.globalAlpha = 0.3 + 0.7 * PR[i][2];
        D(g, PR[i][0], PR[i][1], 1.3 + 1.5 * PR[i][2], "#f4f4f5");
      }
      g.globalAlpha = 1;
      const dim = sw > 0.04 ? 4 : sz > 0.04 ? 3 : 2;
      TX(g, dim + "D", 16, 50, 13, K.gold);
      TX(g, dim === 2 ? "4 corners · 4 edges" : dim === 3 ? "8 corners · 12 edges" : "16 corners · 32 edges", 16, 68, 9, K.dim);
      const lb = sg(t, 12, 13);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "a shadow of a shadow", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },

  /* 37 · flocking, then a hawk */
  boids: {
    T: 20,
    poster: 9,
    draw(g, t) {
      let i: number, j: number;
      if (!this._flock || t < this._flock.tt - 0.05) {
        const R = rng(5),
          B: { x: number; y: number; vx: number; vy: number }[] = [];
        for (i = 0; i < 130; i++) B.push({ x: R() * 320, y: R() * 200, vx: (R() - 0.5) * 90, vy: (R() - 0.5) * 90 });
        this._flock = { b: B, tt: 0 };
      }
      const S = this._flock,
        B = S.b,
        dt = 1 / 60,
        gcap = S.warm ? 150 : 600;
      let guard = 0;
      while (S.tt < t && guard++ < gcap) {
        const hOn = S.tt > 7.5,
          hx = 160 + 96 * Math.cos(S.tt * 0.9),
          hy = 100 + 62 * Math.sin(S.tt * 1.25);
        for (i = 0; i < B.length; i++) {
          const o = B[i];
          let cx = 0,
            cy = 0,
            ax = 0,
            ay = 0,
            sx = 0,
            sy = 0,
            cnt = 0;
          for (j = 0; j < B.length; j++) {
            if (i === j) continue;
            const p = B[j],
              dx = p.x - o.x,
              dy = p.y - o.y,
              d2 = dx * dx + dy * dy;
            if (d2 > 2600) continue;
            cnt++;
            cx += p.x;
            cy += p.y;
            ax += p.vx;
            ay += p.vy;
            if (d2 < 300 && d2 > 0.01) {
              const dd = Math.sqrt(d2);
              sx -= (dx / dd) * (18 - dd * 0.6);
              sy -= (dy / dd) * (18 - dd * 0.6);
            }
          }
          let fx = sx * 2.2,
            fy = sy * 2.2;
          if (cnt) {
            fx += (cx / cnt - o.x) * 0.9 + (ax / cnt - o.vx) * 1.4;
            fy += (cy / cnt - o.y) * 0.9 + (ay / cnt - o.vy) * 1.4;
          }
          if (o.x < 26) fx += (26 - o.x) * 7;
          if (o.x > 294) fx -= (o.x - 294) * 7;
          if (o.y < 20) fy += (20 - o.y) * 7;
          if (o.y > 180) fy -= (o.y - 180) * 7;
          if (hOn) {
            const ex = o.x - hx,
              ey = o.y - hy,
              ed = Math.hypot(ex, ey);
            if (ed < 58 && ed > 0.01) {
              fx += (ex / ed) * (58 - ed) * 11;
              fy += (ey / ed) * (58 - ed) * 11;
            }
          }
          o.vx += fx * dt;
          o.vy += fy * dt;
          const sp = Math.hypot(o.vx, o.vy);
          if (sp > 86) {
            o.vx = (o.vx / sp) * 86;
            o.vy = (o.vy / sp) * 86;
          } else if (sp < 34 && sp > 0.01) {
            o.vx = (o.vx / sp) * 34;
            o.vy = (o.vy / sp) * 34;
          }
          o.x += o.vx * dt;
          o.y += o.vy * dt;
        }
        S.tt += dt;
      }
      S.warm = true;
      for (i = 0; i < B.length; i++) {
        const o2 = B[i],
          s2 = Math.hypot(o2.vx, o2.vy) || 1,
          ux = o2.vx / s2,
          uy = o2.vy / s2;
        g.fillStyle = MX([126, 166, 217], [95, 191, 126], Math.min(1, (s2 - 34) / 52));
        g.beginPath();
        g.moveTo(o2.x + ux * 5, o2.y + uy * 5);
        g.lineTo(o2.x - ux * 3 - uy * 2.4, o2.y - uy * 3 + ux * 2.4);
        g.lineTo(o2.x - ux * 3 + uy * 2.4, o2.y - uy * 3 - ux * 2.4);
        g.closePath();
        g.fill();
      }
      if (t > 7.5) {
        const px = 160 + 96 * Math.cos(t * 0.9),
          py = 100 + 62 * Math.sin(t * 1.25);
        g.globalAlpha = 0.2;
        D(g, px, py, 17, K.gold);
        g.globalAlpha = 1;
        D(g, px, py, 4.4, "#ffd98a");
      }
      TX(g, "130 birds, 3 rules", 16, 50, 10, K.txt);
      const la = sg(t, 7.6, 8.4);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "+ 1 hawk", 16, 66, 10, K.gold);
        g.globalAlpha = 1;
      }
      const lb = sg(t, 17, 18);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "no leader, no plan", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },

  /* 38 · Gray-Scott reaction-diffusion */
  turing: {
    T: 18,
    poster: 10,
    draw(g, t) {
      const W = 80,
        H = 50;
      let i: number, x: number, y: number;
      let S = this._rd;
      const target = Math.floor(Math.max(0, t - 0.3) * 95);
      if (!S || target < S.n) {
        const R = rng(13),
          U = new Float32Array(W * H),
          Vv = new Float32Array(W * H);
        let k2: number, j2: number, i2: number;
        for (i = 0; i < W * H; i++) U[i] = 1;
        for (k2 = 0; k2 < 12; k2++) {
          const bx = 4 + Math.floor(R() * (W - 8)),
            by = 4 + Math.floor(R() * (H - 8));
          for (j2 = -3; j2 <= 3; j2++)
            for (i2 = -3; i2 <= 3; i2++) {
              const id = ((by + j2 + H) % H) * W + ((bx + i2 + W) % W);
              U[id] = 0.42;
              Vv[id] = 0.28;
            }
        }
        S = this._rd = { U, V: Vv, A: new Float32Array(W * H), B: new Float32Array(W * H), n: 0 };
      }
      const U = S.U,
        Vv = S.V,
        A = S.A,
        B = S.B,
        cap = S.n === 0 ? 420 : 26;
      let steps = 0;
      while (S.n < target && steps < cap) {
        steps++;
        for (y = 0; y < H; y++) {
          const ym = ((y - 1 + H) % H) * W,
            yp = ((y + 1) % H) * W,
            yc = y * W;
          for (x = 0; x < W; x++) {
            const xm = (x - 1 + W) % W,
              xp = (x + 1) % W,
              c = yc + x;
            const lu = U[yc + xm] + U[yc + xp] + U[ym + x] + U[yp + x] - 4 * U[c];
            const lv = Vv[yc + xm] + Vv[yc + xp] + Vv[ym + x] + Vv[yp + x] - 4 * Vv[c];
            const uv = U[c] * Vv[c] * Vv[c];
            A[c] = U[c] + 0.16 * lu - uv + 0.037 * (1 - U[c]);
            B[c] = Vv[c] + 0.08 * lv + uv - 0.098 * Vv[c];
          }
        }
        U.set(A);
        Vv.set(B);
        S.n++;
      }
      const im = IMG(this, W, H),
        d = im.d.data;
      for (i = 0; i < W * H; i++) {
        const v = Math.min(1, Vv[i] * 3.2),
          o = i * 4;
        const cc = v < 0.5 ? MN([9, 10, 16], [126, 166, 217], v / 0.5) : MN([126, 166, 217], [255, 217, 138], (v - 0.5) / 0.5);
        d[o] = cc[0];
        d[o + 1] = cc[1];
        d[o + 2] = cc[2];
        d[o + 3] = 255;
      }
      im.g.putImageData(im.d, 0, 0);
      g.imageSmoothingEnabled = true;
      g.drawImage(im.c, 0, 0, 320, 200);
      TX(g, "step " + S.n, 308, 20, 9.5, "rgba(255,255,255,.6)", "right");
      const la = sg(t, 1, 1.8);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "f = 0.037   k = 0.061", 12, 190, 9.5, "rgba(255,255,255,.65)");
        g.globalAlpha = 1;
      }
      const lb = sg(t, 15, 16);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "two chemicals, one skin", 308, 190, 9.5, "rgba(255,255,255,.65)", "right");
        g.globalAlpha = 1;
      }
    },
  },

  /* 39 · two galaxies passing through each other */
  galaxy: {
    T: 20,
    poster: 13,
    draw(g, t) {
      let i: number;
      let S = this._gal;
      if (!S || t < S.tt - 0.05) {
        const R = rng(29),
          M = 62000,
          P: { x: number; y: number; vx: number; vy: number; g: number }[] = [],
          cores = [
            { x: 70, y: 140, vx: 2.5, vy: 6 },
            { x: 240, y: 70, vx: -2.5, vy: -6 },
          ];
        let k: number, j: number;
        for (k = 0; k < 2; k++) {
          const C0 = cores[k],
            dir = k ? -1 : 1;
          for (j = 0; j < 260; j++) {
            const rr = 11 + Math.pow(R(), 0.55) * 33,
              a = R() * TAU,
              v = Math.sqrt(M / rr) * dir;
            P.push({ x: C0.x + rr * Math.cos(a), y: C0.y + rr * Math.sin(a), vx: C0.vx - Math.sin(a) * v, vy: C0.vy + Math.cos(a) * v, g: k });
          }
        }
        S = this._gal = { P, C: cores, tt: 0, M, s2: 169 };
      }
      const P = S.P,
        C = S.C,
        dt = 1 / 120,
        gcap = S.warm ? 60 : 2600;
      let guard = 0,
        k2: number;
      while (S.tt < t && guard++ < gcap) {
        const dx = C[1].x - C[0].x,
          dy = C[1].y - C[0].y,
          dd = dx * dx + dy * dy + S.s2,
          f = S.M / (dd * Math.sqrt(dd));
        C[0].vx += dx * f * dt;
        C[0].vy += dy * f * dt;
        C[1].vx -= dx * f * dt;
        C[1].vy -= dy * f * dt;
        C[0].x += C[0].vx * dt;
        C[0].y += C[0].vy * dt;
        C[1].x += C[1].vx * dt;
        C[1].y += C[1].vy * dt;
        for (i = 0; i < P.length; i++) {
          const p = P[i];
          for (k2 = 0; k2 < 2; k2++) {
            const ex = C[k2].x - p.x,
              ey = C[k2].y - p.y,
              e2 = ex * ex + ey * ey + S.s2,
              ff = S.M / (e2 * Math.sqrt(e2));
            p.vx += ex * ff * dt;
            p.vy += ey * ff * dt;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }
        S.tt += dt;
      }
      S.warm = true;
      for (i = 0; i < P.length; i++) {
        const q = P[i];
        if (q.x < -16 || q.x > 336 || q.y < -16 || q.y > 216) continue;
        g.globalAlpha = 0.46 + 0.5 * Math.min(1, Math.hypot(q.vx, q.vy) / 150);
        D(g, q.x, q.y, 1.4, q.g ? "#ffd98a" : "#9ec2ea");
      }
      g.globalAlpha = 1;
      D(g, C[0].x, C[0].y, 2.6, "#fff");
      D(g, C[1].x, C[1].y, 2.6, "#fff");
      TX(g, "520 stars · 2 cores", 16, 50, 10, K.txt);
      const lb = sg(t, 15, 16.4);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "tidal tails, then one galaxy", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },

  /* supernova: shockwave and ejecta */
  supernova: {
    T: 15,
    poster: 9,
    draw(g, t) {
      let i: number;
      const cx = 160,
        cy = 100;
      if (!this._E) {
        const R = rng(53),
          E: { a: number; s: number; l: number; w: number; j: number; lob: number }[] = [];
        for (i = 0; i < 1400; i++) {
          const th = R() * TAU;
          E.push({
            a: th,
            s: Math.pow(R(), 1.9),
            l: 0.5 + R() * 0.9,
            w: R(),
            j: (R() - 0.5) * 0.06,
            lob: 0.72 + 0.46 * Math.pow(Math.abs(Math.sin(th * 1.5 + 0.6)), 0.7),
          });
        }
        this._E = E;
      }
      const E = this._E,
        ig = sg(t, 0, 0.5),
        ex = ss(ln(t, 0.28, 12)),
        fd = 1 - sg(t, 11, 14.6);
      g.globalCompositeOperation = "lighter";
      g.lineCap = "round";
      for (i = 0; i < E.length; i++) {
        const p = E[i];
        const r1 = (14 + p.s * 112) * p.lob * ex * (0.75 + p.w * 0.5);
        const len = (4 + p.s * 30) * p.l * Math.min(1, ex * 2.2),
          r0 = Math.max(3, r1 - len);
        const c = p.s < 0.5 ? MN([255, 62, 30], [255, 184, 76], p.s * 2) : MN([255, 184, 76], [196, 224, 255], (p.s - 0.5) * 2);
        const fade = Math.pow(1 - Math.min(1, r1 / 150), 0.85) * fd;
        if (fade <= 0.01) continue;
        g.strokeStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (0.1 + fade * 0.5).toFixed(3) + ")";
        g.lineWidth = 0.45 + p.w * 1.3 * fade;
        g.beginPath();
        g.moveTo(cx + Math.cos(p.a) * r0, cy + Math.sin(p.a) * r0 * 0.94);
        g.lineTo(cx + Math.cos(p.a + p.j) * r1, cy + Math.sin(p.a + p.j) * r1 * 0.94);
        g.stroke();
      }
      const sr = ex * 126;
      if (sr > 4 && fd > 0) {
        const rg = g.createRadialGradient(cx, cy, sr * 0.78, cx, cy, sr * 1.2);
        rg.addColorStop(0, "rgba(120,170,255,0)");
        rg.addColorStop(0.56, "rgba(150,196,255," + (0.2 * fd).toFixed(3) + ")");
        rg.addColorStop(0.8, "rgba(226,240,255," + (0.3 * fd).toFixed(3) + ")");
        rg.addColorStop(1, "rgba(120,170,255,0)");
        g.fillStyle = rg;
        g.beginPath();
        g.arc(cx, cy, sr * 1.2, 0, TAU);
        g.fill();
      }
      const cr = (1 - ss(ln(t, 0.3, 9))) * 0.75 + 0.25,
        rad = 60 * cr + 8;
      const cg = g.createRadialGradient(cx, cy, 0, cx, cy, rad);
      cg.addColorStop(0, "rgba(255,252,244," + (0.95 * ig * fd).toFixed(3) + ")");
      cg.addColorStop(0.12, "rgba(255,232,186," + (0.6 * ig * fd).toFixed(3) + ")");
      cg.addColorStop(0.34, "rgba(255,166,96," + (0.22 * ig * fd).toFixed(3) + ")");
      cg.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = cg;
      g.beginPath();
      g.arc(cx, cy, rad, 0, TAU);
      g.fill();
      g.globalCompositeOperation = "source-over";
      g.globalAlpha = 1;
      const la = sg(t, 1.4, 2.4);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "1400 ejecta · t+0.8s", 16, 50, 10, "rgba(255,217,138,.82)");
        g.globalAlpha = 1;
      }
      const lb = sg(t, 12.4, 13.6);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "everything heavier than iron", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },

  /* parallax flight over ridged-fBm mountains */
  terrain: {
    T: 20,
    poster: 8,
    draw(g, t) {
      let i: number, k: number, x: number, o: number;
      const sky = g.createLinearGradient(0, 0, 0, 156);
      sky.addColorStop(0, "#05060f");
      sky.addColorStop(0.42, "#101832");
      sky.addColorStop(0.78, "#2b2a44");
      sky.addColorStop(1, "#5c4552");
      g.fillStyle = sky;
      g.fillRect(0, 0, 320, 200);
      if (!this._terS) {
        const R = rng(64),
          S: { x: number; y: number; m: number; p: number }[] = [];
        for (i = 0; i < 70; i++) S.push({ x: R() * 320, y: R() * 88, m: Math.pow(R(), 2.6), p: R() * TAU });
        this._terS = S;
      }
      const S = this._terS,
        sf = sg(t, 0.2, 2.4);
      for (i = 0; i < S.length; i++) {
        const s = S[i];
        g.globalAlpha = sf * (0.12 + s.m * 0.62) * (0.6 + 0.4 * Math.sin(t * 1.4 + s.p));
        D(g, s.x, s.y, 0.5 + s.m * 0.9, "#e8eeff");
      }
      g.globalAlpha = 1;
      const sun = g.createRadialGradient(232, 76, 0, 232, 76, 78);
      sun.addColorStop(0, "rgba(255,224,172,.95)");
      sun.addColorStop(0.1, "rgba(255,190,122,.58)");
      sun.addColorStop(0.42, "rgba(255,152,98,.15)");
      sun.addColorStop(1, "rgba(255,140,90,0)");
      g.fillStyle = sun;
      g.fillRect(130, 0, 190, 158);
      D(g, 232, 76, 7, "rgba(255,242,218,.95)");
      const LN = 7;
      for (k = 0; k < LN; k++) {
        const u = k / (LN - 1);
        const base = lp(100, 252, Math.pow(u, 1.25));
        const amp = lp(20, 96, Math.pow(u, 1.5));
        const frq = lp(0.03, 0.009, u);
        const off = (k * 57.3 + t * lp(3.5, 42, Math.pow(u, 1.7))) * frq;
        const pts: number[] = [];
        for (x = -4; x <= 324; x += 2) {
          const v = x * frq + off;
          let h = 0,
            am = 0.5,
            f = 1,
            nn = 0;
          for (o = 0; o < 4; o++) {
            let w = 1 - Math.abs(VN(v * f, k * 13.7) * 2 - 1);
            w *= w;
            h += am * w;
            nn += am;
            am *= 0.5;
            f *= 2.11;
          }
          pts.push(x, base - Math.pow(h / nn, 1.85) * amp);
        }
        const col = MN([46, 56, 90], [7, 8, 15], Math.pow(u, 0.78));
        g.fillStyle = "rgb(" + col[0] + "," + col[1] + "," + col[2] + ")";
        g.beginPath();
        g.moveTo(-4, 222);
        for (i = 0; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
        g.lineTo(324, 222);
        g.closePath();
        g.fill();
        g.strokeStyle = "rgba(196,214,255," + lp(0.34, 0.05, u).toFixed(3) + ")";
        g.lineWidth = 0.7;
        g.beginPath();
        g.moveTo(pts[0], pts[1]);
        for (i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
        g.stroke();
      }
      const la = sg(t, 1.2, 2.2);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "ridged fBm · 7 ranges", 16, 50, 10, "rgba(214,226,255,.8)");
        g.globalAlpha = 1;
      }
      const lb = sg(t, 16.8, 18);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "no heightmap, just noise", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },

  /* continuous Mandelbrot zoom into a seahorse valley */
  deepzoom: {
    T: 18,
    poster: 12,
    draw(g, t) {
      const W = 112,
        H = 70,
        im = IMG(this, W, H),
        d = im.d.data;
      let x: number, y: number;
      const cx0 = -0.743643887037151,
        cy0 = 0.13182590420533,
        L2 = Math.log(2);
      const zp = ss(ln(t, 0.3, 16.5)),
        span = 3.2 * Math.pow(1e-5 / 3.2, zp);
      const IT = Math.floor(lp(90, 320, zp));
      for (y = 0; y < H; y++) {
        const y0 = cy0 + (y / H - 0.5) * span * (H / W);
        for (x = 0; x < W; x++) {
          const x0 = cx0 + (x / W - 0.5) * span;
          let zr = 0,
            zi = 0,
            r2 = 0,
            i2 = 0,
            k = 0;
          while (r2 + i2 <= 256 && k < IT) {
            zi = 2 * zr * zi + y0;
            zr = r2 - i2 + x0;
            r2 = zr * zr;
            i2 = zi * zi;
            k++;
          }
          const o = (y * W + x) * 4;
          if (k >= IT) {
            d[o] = 4;
            d[o + 1] = 5;
            d[o + 2] = 12;
            d[o + 3] = 255;
            continue;
          }
          const nu = k + 1 - Math.log(Math.log(Math.sqrt(r2 + i2))) / L2;
          const u = (Math.pow(Math.max(0, nu) * 0.021, 0.92)) % 1;
          const c =
            u < 0.34
              ? MN([8, 12, 36], [34, 102, 204], u / 0.34)
              : u < 0.62
                ? MN([34, 102, 204], [108, 200, 244], (u - 0.34) / 0.28)
                : u < 0.84
                  ? MN([108, 200, 244], [245, 222, 133], (u - 0.62) / 0.22)
                  : MN([245, 222, 133], [8, 12, 36], (u - 0.84) / 0.16);
          d[o] = c[0];
          d[o + 1] = c[1];
          d[o + 2] = c[2];
          d[o + 3] = 255;
        }
      }
      im.g.putImageData(im.d, 0, 0);
      g.imageSmoothingEnabled = true;
      g.drawImage(im.c, 0, 0, 320, 200);
      const la = sg(t, 1, 2);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "×" + (3.2 / span).toExponential(1).replace("e+", "e"), 16, 50, 10, "rgba(255,217,138,.85)");
        TX(g, IT + " iterations", 16, 64, 9.5, K.dim);
        g.globalAlpha = 1;
      }
      const lb = sg(t, 15.4, 16.6);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "the detail never runs out", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },

  /* a signal crossing a small network */
  neural: {
    T: 16,
    poster: 10,
    draw(g, t) {
      let i: number, j: number, li: number;
      if (!this._N) {
        const R = rng(17),
          LAY = [4, 8, 11, 8, 3],
          nodes: NetNode[][] = [],
          E: NetEdge[] = [],
          x0 = 44,
          x1 = 276;
        for (li = 0; li < LAY.length; li++) {
          const n = LAY[li],
            xx = x0 + ((x1 - x0) * li) / (LAY.length - 1);
          const gap = Math.min(15.5, 148 / Math.max(1, n - 1)),
            yy = 100 - (gap * (n - 1)) / 2,
            row: NetNode[] = [];
          for (i = 0; i < n; i++) row.push({ x: xx, y: yy + gap * i, b: R(), l: li });
          nodes.push(row);
        }
        for (li = 0; li < nodes.length - 1; li++) {
          const A = nodes[li],
            B = nodes[li + 1];
          for (i = 0; i < A.length; i++)
            for (j = 0; j < B.length; j++) {
              const w = R() * 2 - 1;
              if (Math.abs(w) < 0.24) continue;
              E.push({ a: A[i], b: B[j], w, l: li });
            }
        }
        this._N = { n: nodes, e: E, L: LAY.length };
      }
      const N = this._N,
        E = N.e,
        nodes = N.n,
        LN = N.L;
      const bd = sg(t, 0.2, 2.6),
        front = ((t * 0.5) % 1.28) * (LN + 0.4) - 0.5;
      g.globalCompositeOperation = "lighter";
      for (i = 0; i < E.length; i++) {
        const e = E[i],
          mag = Math.abs(e.w);
        const pulse = Math.exp(-Math.pow(front - (e.l + 0.5), 2) / 0.09);
        const al = bd * mag * (0.1 + pulse * 0.75);
        if (al <= 0.012) continue;
        const c = e.w > 0 ? "92,150,255" : "255,196,104";
        g.strokeStyle = "rgba(" + c + "," + al.toFixed(3) + ")";
        g.lineWidth = 0.3 + mag * (0.5 + pulse * 1.1);
        g.beginPath();
        g.moveTo(e.a.x, e.a.y);
        const mx = (e.a.x + e.b.x) / 2;
        g.bezierCurveTo(mx, e.a.y, mx, e.b.y, e.b.x, e.b.y);
        g.stroke();
      }
      for (li = 0; li < nodes.length; li++)
        for (i = 0; i < nodes[li].length; i++) {
          const nd = nodes[li][i],
            act = bd * (0.32 + 0.68 * Math.exp(-Math.pow(front - li, 2) / 0.1)) * (0.55 + 0.45 * nd.b);
          const rad = 1.7 + act * 1.5,
            col = li === nodes.length - 1 ? "255,214,138" : "130,182,255";
          const rg = g.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, rad * 4.6);
          rg.addColorStop(0, "rgba(255,255,255," + (0.5 * act + 0.12).toFixed(3) + ")");
          rg.addColorStop(0.2, "rgba(" + col + "," + (0.42 * act + 0.1).toFixed(3) + ")");
          rg.addColorStop(1, "rgba(" + col + ",0)");
          g.fillStyle = rg;
          g.beginPath();
          g.arc(nd.x, nd.y, rad * 4.6, 0, TAU);
          g.fill();
        }
      g.globalCompositeOperation = "source-over";
      g.globalAlpha = 1;
      const la = sg(t, 1.2, 2.2);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "5 layers · 214 weights", 16, 50, 10, "rgba(126,166,217,.85)");
        g.globalAlpha = 1;
      }
      const lb = sg(t, 13.4, 14.6);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "blue excites, gold inhibits", 304, 186, 9.5, K.dim, "right");
        g.globalAlpha = 1;
      }
    },
  },
};
