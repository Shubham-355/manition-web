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
}

export const SCENES: Record<string, Scene> = {
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
};
