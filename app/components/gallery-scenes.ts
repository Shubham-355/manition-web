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
  _M?: number[];
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
  _im?: Img;
  _ac?: Acc;
  _an?: number;
  _hil?: number[][][];
  _fern?: number[][];
  _gasket?: { x: number; y: number; r: number; d: number }[];
  _newton?: boolean;
  _dom?: boolean;
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
}

export const SCENES: Record<string, Scene> = {
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
  /* 16 · Mandelbrot scanline render */
  mandel: {
    T: 16,
    poster: 12,
    draw(g, t) {
      let ix: number, iy: number;
      if (!this._M) {
        const M: number[] = [];
        for (iy = 0; iy < 50; iy++)
          for (ix = 0; ix < 80; ix++) {
            const cr = -2.3 + (ix / 79) * 3,
              ci = -1.22 + (iy / 49) * 2.44;
            let zr = 0,
              zi = 0,
              it = 0;
            while (it < 70 && zr * zr + zi * zi < 4) {
              const nr = zr * zr - zi * zi + cr;
              zi = 2 * zr * zi + ci;
              zr = nr;
              it++;
            }
            M.push(it);
          }
        this._M = M;
      }
      const data = this._M;
      const rows = Math.floor(ss(ln(t, 0.3, 12.5)) * 50);
      for (iy = 0; iy < rows; iy++)
        for (ix = 0; ix < 80; ix++) {
          const it2 = data[iy * 80 + ix];
          if (it2 >= 70) g.fillStyle = "#060609";
          else {
            const p = Math.min(1, it2 / 26);
            g.fillStyle = p < 0.55 ? MX([13, 16, 30], [126, 166, 217], p / 0.55) : MX([126, 166, 217], [255, 217, 138], (p - 0.55) / 0.45);
          }
          g.fillRect(ix * 4, iy * 4, 4.15, 4.15);
        }
      if (rows > 0 && rows < 50) L(g, 0, rows * 4, 320, rows * 4, "rgba(255,217,138,.4)", 1);
      const la = sg(t, 12.8, 13.6);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "z → z² + c", 304, 186, 10, K.wht, "right");
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

  /* 33 · Julia set morphing around a circle of c */
  julia: {
    T: 18,
    poster: 9,
    draw(g, t) {
      const W = 88,
        H = 55,
        im = IMG(this, W, H),
        d = im.d.data;
      let x: number, y: number;
      const th = TAU * ss(ln(t, 0.4, 16.4)),
        cr = 0.7885 * Math.cos(th),
        ci = 0.7885 * Math.sin(th),
        IT = 46;
      for (y = 0; y < H; y++)
        for (x = 0; x < W; x++) {
          let zr = -1.7 + (x / (W - 1)) * 3.4,
            zi = -1.06 + (y / (H - 1)) * 2.12,
            k = 0;
          while (k < IT && zr * zr + zi * zi < 4) {
            const nr = zr * zr - zi * zi + cr;
            zi = 2 * zr * zi + ci;
            zr = nr;
            k++;
          }
          const o = (y * W + x) * 4;
          if (k >= IT) {
            d[o] = 6;
            d[o + 1] = 6;
            d[o + 2] = 11;
          } else {
            const p = k / IT,
              c = HSV(0.58 - p * 0.46, 0.68, 0.24 + 0.76 * Math.pow(p, 0.55));
            d[o] = c[0];
            d[o + 1] = c[1];
            d[o + 2] = c[2];
          }
          d[o + 3] = 255;
        }
      im.g.putImageData(im.d, 0, 0);
      g.imageSmoothingEnabled = true;
      g.drawImage(im.c, 0, 0, 320, 200);
      const ix = 284,
        iy = 32,
        ir = 15;
      g.strokeStyle = "rgba(255,255,255,.35)";
      g.lineWidth = 1;
      g.beginPath();
      g.arc(ix, iy, ir, 0, TAU);
      g.stroke();
      D(g, ix + ir * Math.cos(th), iy - ir * Math.sin(th), 2.6, "#ffd98a");
      const la = sg(t, 1, 1.8);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "z → z² + c", 16, 50, 10, "rgba(255,255,255,.85)");
        g.globalAlpha = 1;
      }
      const lb = sg(t, 14.8, 15.8);
      if (lb > 0) {
        g.globalAlpha = lb;
        TX(g, "one number, endless shapes", 308, 190, 9.5, "rgba(255,255,255,.7)", "right");
        g.globalAlpha = 1;
      }
    },
  },

  /* 34 · Newton's method basins for z³ = 1 */
  newton: {
    T: 16,
    poster: 11,
    draw(g, t) {
      const W = 104,
        H = 65;
      let x: number, y: number, k: number, j: number;
      if (!this._newton) {
        const im = IMG(this, W, H),
          d = im.d.data;
        const roots = [
            [1, 0],
            [-0.5, 0.8660254],
            [-0.5, -0.8660254],
          ],
          cols = [
            [126, 166, 217],
            [220, 168, 72],
            [95, 191, 126],
          ];
        for (y = 0; y < H; y++)
          for (x = 0; x < W; x++) {
            let zr = -2 + (x / (W - 1)) * 4,
              zi = -1.25 + (y / (H - 1)) * 2.5,
              ri = 0;
            for (k = 0; k < 26; k++) {
              const r2 = zr * zr,
                i2 = zi * zi;
              const dr = 3 * (r2 - i2),
                di = 6 * zr * zi;
              const nr = r2 * zr - 3 * zr * i2 - 1,
                ni = 3 * r2 * zi - i2 * zi;
              const dn = dr * dr + di * di;
              if (dn < 1e-12) break;
              zr -= (nr * dr + ni * di) / dn;
              zi -= (ni * dr - nr * di) / dn;
              let done = false;
              for (j = 0; j < 3; j++)
                if (Math.abs(zr - roots[j][0]) < 0.004 && Math.abs(zi - roots[j][1]) < 0.004) {
                  ri = j;
                  done = true;
                  break;
                }
              if (done) break;
            }
            const sh = 1 - Math.min(1, k / 15) * 0.74,
              o = (y * W + x) * 4,
              cc = cols[ri];
            d[o] = (cc[0] * sh) | 0;
            d[o + 1] = (cc[1] * sh) | 0;
            d[o + 2] = (cc[2] * sh) | 0;
            d[o + 3] = 255;
          }
        im.g.putImageData(im.d, 0, 0);
        this._newton = true;
      }
      const rows = Math.floor(ss(ln(t, 0.3, 10.5)) * H);
      if (rows > 0 && this._im) {
        g.imageSmoothingEnabled = true;
        g.drawImage(this._im.c, 0, 0, W, rows, 0, 0, 320, (rows / H) * 200);
        if (rows < H) L(g, 0, (rows / H) * 200, 320, (rows / H) * 200, "rgba(255,217,138,.45)", 1);
      }
      const pth = sg(t, 11, 11.6);
      if (pth > 0) {
        let zr2 = -0.28,
          zi2 = 0.62;
        const steps = Math.min(7, Math.floor((t - 11) / 0.55) + 1);
        const X = (u: number) => ((u + 2) / 4) * 320,
          Y = (v: number) => ((v + 1.25) / 2.5) * 200;
        g.globalAlpha = pth;
        let lx = X(zr2),
          ly = Y(zi2);
        D(g, lx, ly, 3, "#fff");
        for (k = 0; k < steps; k++) {
          const a2 = zr2 * zr2,
            b2 = zi2 * zi2,
            drb = 3 * (a2 - b2),
            dib = 6 * zr2 * zi2;
          const nrb = a2 * zr2 - 3 * zr2 * b2 - 1,
            nib = 3 * a2 * zi2 - b2 * zi2,
            dnb = drb * drb + dib * dib;
          if (dnb < 1e-12) break;
          zr2 -= (nrb * drb + nib * dib) / dnb;
          zi2 -= (nib * drb - nrb * dib) / dnb;
          const nx2 = X(zr2),
            ny2 = Y(zi2);
          AR(g, lx, ly, nx2, ny2, "rgba(255,255,255,.85)", 1.4);
          lx = nx2;
          ly = ny2;
        }
        D(g, lx, ly, 3.2, "#ffd98a");
        TX(g, "z ← z − f/f′", 12, 190, 9.5, "rgba(255,255,255,.85)");
        g.globalAlpha = 1;
      }
      TX(g, "z³ = 1", 308, 20, 10, "rgba(255,255,255,.85)", "right");
    },
  },

  /* 35 · domain coloring of a rational function */
  complexmap: {
    T: 16,
    poster: 10,
    draw(g, t) {
      const W = 112,
        H = 70;
      let x: number, y: number, i: number;
      if (!this._dom) {
        const im = IMG(this, W, H),
          d = im.d.data;
        for (y = 0; y < H; y++)
          for (x = 0; x < W; x++) {
            const zr = -3.2 + (x / (W - 1)) * 6.4,
              zi = 2 - (y / (H - 1)) * 4;
            const ar = zr * zr - zi * zi - 1,
              ai = 2 * zr * zi;
            const br = zr - 2,
              bi = zi - 1,
              b2r = br * br - bi * bi,
              b2i = 2 * br * bi;
            const nr = ar * b2r - ai * b2i,
              ni = ar * b2i + ai * b2r;
            const dr = zr * zr - zi * zi + 2,
              di = 2 * zr * zi + 2,
              dn = dr * dr + di * di;
            let fr: number, fi: number;
            if (dn < 1e-9) {
              fr = 1e9;
              fi = 0;
            } else {
              fr = (nr * dr + ni * di) / dn;
              fi = (ni * dr - nr * di) / dn;
            }
            const m = Math.hypot(fr, fi),
              lg = Math.log(m + 1e-9) / Math.LN2,
              band = lg - Math.floor(lg);
            const c = HSV(Math.atan2(fi, fr) / TAU, 0.74 - 0.2 * band, 0.3 + 0.6 * band),
              o = (y * W + x) * 4;
            d[o] = c[0];
            d[o + 1] = c[1];
            d[o + 2] = c[2];
            d[o + 3] = 255;
          }
        im.g.putImageData(im.d, 0, 0);
        this._dom = true;
      }
      const r = ss(ln(t, 0.3, 9)) * 232;
      if (r > 1 && this._im) {
        g.save();
        g.beginPath();
        g.arc(160, 100, r, 0, TAU);
        g.clip();
        g.imageSmoothingEnabled = true;
        g.drawImage(this._im.c, 0, 0, 320, 200);
        g.restore();
      }
      const X = (u: number) => ((u + 3.2) / 6.4) * 320,
        Y = (v: number) => ((2 - v) / 4) * 200;
      const an = sg(t, 9.4, 10.4);
      if (an > 0) {
        g.globalAlpha = an;
        g.strokeStyle = "#fff";
        g.lineWidth = 1.3;
        const zs = [
          [1, 0],
          [-1, 0],
          [2, 1],
        ];
        for (i = 0; i < 3; i++) {
          g.beginPath();
          g.arc(X(zs[i][0]), Y(zs[i][1]), 5.5, 0, TAU);
          g.stroke();
        }
        const ps = [
          [0.6436, -1.5538],
          [-0.6436, 1.5538],
        ];
        for (i = 0; i < 2; i++) {
          const px = X(ps[i][0]),
            py = Y(ps[i][1]);
          L(g, px - 4.5, py - 4.5, px + 4.5, py + 4.5, "#fff", 1.4);
          L(g, px - 4.5, py + 4.5, px + 4.5, py - 4.5, "#fff", 1.4);
        }
        TX(g, "circles = zeros    crosses = poles", 160, 190, 9, "rgba(255,255,255,.9)", "center");
        g.globalAlpha = 1;
      }
      const la = sg(t, 1.2, 2);
      if (la > 0) {
        g.globalAlpha = la;
        TX(g, "hue = angle of f(z)", 16, 50, 9.5, "rgba(255,255,255,.85)");
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
};
