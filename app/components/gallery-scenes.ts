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

export interface Scene {
  T: number;
  poster: number;
  draw(this: Scene, g: Ctx, t: number): void;
  // per-scene memoised geometry (deterministic; safe to share across instances)
  _S?: { tau: number; b: number; k: number }[];
  _max?: number;
  _P?: { pos: number[][]; isP: boolean[]; pc: number[]; N: number };
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
};
