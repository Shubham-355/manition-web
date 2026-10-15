/*
 * The still-life props drawn in code (ported from the design's site-v3/props.js): the hero easel,
 * dice and orb, the How-it-works plate and fold stages, the quiet room's lamp, chair and board, and
 * the invitation's glass. Each builder returns an SVG string; `u` prefixes every id so two
 * copies on a page never share gradients. Light: warm key from lower-left, plum fill from
 * upper-right. Cast shadows fall up-right.
 */

type Pt = [number, number];

const f = (n: number) => Math.round(n * 10) / 10;
const rng = (s: number) => () => (s = (s * 16807) % 2147483647) / 2147483647;
const pts = (a: Pt[]) => a.map((p) => f(p[0]) + "," + f(p[1])).join(" ");
const WARM = "#F4E9D0";
const SH = "#0a0610";
const SERIF = "font-family:var(--font-instrument),serif;";

// common filters (scoped by id prefix)
const FX = (u: string) => `
    <filter id="${u}woodV" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.55 0.012" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .18  0 0 0 0 .09  0 0 0 0 .04  1.3 0 0 0 -.52"/><feComposite in2="SourceGraphic" operator="in" result="g"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="g"/></feMerge></filter>
    <filter id="${u}woodH" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.5" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 .18  0 0 0 0 .09  0 0 0 0 .04  1.3 0 0 0 -.52"/><feComposite in2="SourceGraphic" operator="in" result="g"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="g"/></feMerge></filter>
    <filter id="${u}mottle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="4" seed="2"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .16  0 0 0 0 .2  .5 0 0 0 -.2"/><feComposite in2="SourceGraphic" operator="in" result="g"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="g"/></feMerge></filter>
    <filter id="${u}powder" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .32  .5 0 0 0 -.24"/><feComposite in2="SourceGraphic" operator="in" result="g"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="g"/></feMerge></filter>
    <filter id="${u}chalk" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3" result="d"/><feColorMatrix in="n" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.4 2.1" result="m"/><feComposite in="d" in2="m" operator="in"/></filter>
    <filter id="${u}slateN" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.018 0.03" numOctaves="3" seed="12"/><feColorMatrix values="0 0 0 0 .85  0 0 0 0 .95  0 0 0 0 .9  .16 0 0 0 -.05"/><feComposite in2="SourceGraphic" operator="in" result="g"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="g"/></feMerge></filter>
    <filter id="${u}b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>
    <filter id="${u}b4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="${u}b10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>`;

// a wooden member: local rect, rotated into place
const stick = (u: string, x: number, y: number, w: number, len: number, ang: number, dark?: boolean) => {
  const g = dark ? `${u}legD` : `${u}leg`;
  return `<g transform="translate(${x} ${y}) rotate(${f(ang)})">
      <rect x="${-w / 2}" y="0" width="${w}" height="${len}" rx="${w / 2.4}" fill="url(#${g})" filter="url(#${u}woodV)"/>
      <rect x="${-w / 2}" y="${len * 0.86}" width="${w}" height="${len * 0.14}" rx="${w / 2.4}" fill="url(#${u}bounce)"/>
      <line x1="${-w / 2 + 1.2}" y1="${w / 2}" x2="${-w / 2 + 1.2}" y2="${len - w / 2}" stroke="#ffe2b8" stroke-opacity="${dark ? 0.15 : 0.55}" stroke-width="1.2"/>
      <line x1="${w / 2 - 0.8}" y1="${w / 2}" x2="${w / 2 - 0.8}" y2="${len - w / 2}" stroke="#1c0f14" stroke-opacity=".6" stroke-width="1.4"/>
    </g>`;
};
const legTo = (x1: number, y1: number, x2: number, y2: number) => ({
  x: x1,
  y: y1,
  len: Math.hypot(x2 - x1, y2 - y1),
  ang: (-Math.atan2(x2 - x1, y2 - y1) * 180) / Math.PI,
});

/* ---------- H2 easel blackboard (Q3 reuses it with a sine curve) ---------- */
type EaselOpt = { kind?: "sin"; vb?: string; id?: string };
function easel(u: string, opt: EaselOpt = {}) {
  const G = 862; // ground line
  const L = legTo(250, 292, 150, G), R = legTo(432, 292, 540, G), B = legTo(342, 288, 372, G - 34);
  // y = 1/x, origin (328,508), unit 30px
  const ox = 328, oy = 508, k = 30;
  const br: Pt[] = [], bl: Pt[] = [], tail: Pt[] = [];
  for (let x = 0.27; x <= 6.55; x += 0.06) br.push([ox + k * x, oy - k / x]);
  for (let x = 6.55; x <= 10.5; x += 0.12) tail.push([ox + k * x, oy - k / x - (x - 6.55) * 3.2]);
  for (let x = -0.19; x >= -5.3; x -= 0.05) bl.push([ox + k * x, oy - k / x]);
  if (opt.kind === "sin") {
    br.length = bl.length = tail.length = 0;
    for (let x = 172; x <= 520; x += 4) br.push([x, oy - 52 * Math.sin((x - ox) / 34)]);
    for (let x = 520; x <= 640; x += 4) tail.push([x, oy - 52 * Math.sin((x - ox) / 34) - (x - 520) * 0.3]);
  }
  const P = (a: Pt[]) => "M" + a.map((p) => f(p[0]) + " " + f(p[1])).join(" L");
  const ticks: string[] = [];
  for (let i = -5; i <= 6; i++) if (i) ticks.push(`M${ox + i * k} ${oy - 4} L${ox + i * k} ${oy + 4}`);
  // cast-shadow projection onto ground plane (up-right)
  const sh = `matrix(1 0 -1.05 0.3 ${f(1.05 * G)} ${f(0.7 * G)})`;
  const sil = `<polygon points="${pts([[150, 350], [540, 350], [540, 640], [150, 640]])}"/>
      <path d="M250 292 L150 ${G} M432 292 L540 ${G} M342 288 L372 ${G - 34}" stroke="${SH}" stroke-width="22" fill="none"/>`;
  return `<svg viewBox="${opt.vb || "0 0 1300 900"}" width="100%" style="display:block; overflow:visible;" data-prop="${opt.id || "H2"}">
    <defs>${FX(u)}
      <linearGradient id="${u}leg" x1="0" x2="1"><stop offset="0" stop-color="#d9a670"/><stop offset=".45" stop-color="#a8723f"/><stop offset="1" stop-color="#5b3626"/></linearGradient>
      <linearGradient id="${u}legD" x1="0" x2="1"><stop offset="0" stop-color="#6e4a33"/><stop offset="1" stop-color="#2e1a17"/></linearGradient>
      <linearGradient id="${u}bounce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a60" stop-opacity="0"/><stop offset="1" stop-color="#ff9a60" stop-opacity=".28"/></linearGradient>
      <linearGradient id="${u}frame" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#d7a26b"/><stop offset=".5" stop-color="#9c6838"/><stop offset="1" stop-color="#5e3a2c"/></linearGradient>
      <radialGradient id="${u}slate" cx=".15" cy=".95" r="1.1"><stop offset="0" stop-color="#3f5a4c"/><stop offset=".5" stop-color="#283b33"/><stop offset="1" stop-color="#1c2526"/></radialGradient>
      <linearGradient id="${u}tail" gradientUnits="userSpaceOnUse" x1="524" y1="0" x2="650" y2="0"><stop offset="0" stop-color="#efece2" stop-opacity=".7"/><stop offset="1" stop-color="#efece2" stop-opacity="0"/></linearGradient>
      <linearGradient id="${u}shf" gradientUnits="userSpaceOnUse" x1="300" y1="${G}" x2="1050" y2="640"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <mask id="${u}shm"><rect x="0" y="0" width="1300" height="900" fill="url(#${u}shf)"/></mask>
      <clipPath id="${u}sc"><rect x="166" y="366" width="358" height="258"/></clipPath>
    </defs>
    <g mask="url(#${u}shm)" fill="${SH}">
      <g transform="${sh}" filter="url(#${u}b4)">${sil}</g>
      <path d="M560 760 C 620 700, 680 820, 740 760 S 860 700, 920 760" fill="none" stroke="${WARM}" stroke-opacity=".22" stroke-width="5" filter="url(#${u}b2)"/>
    </g>
    ${stick(u, B.x, B.y, 15, B.len, B.ang, true)}
    <g filter="url(#${u}b2)" fill="${SH}" opacity=".75"><ellipse cx="151" cy="${G + 1}" rx="19" ry="4.5"/><ellipse cx="539" cy="${G + 1}" rx="19" ry="4.5"/><ellipse cx="372" cy="${G - 33}" rx="14" ry="3.5"/></g>
    ${stick(u, L.x, L.y, 22, L.len, L.ang)}
    ${stick(u, R.x, R.y, 22, R.len, R.ang)}
    <rect x="326" y="282" width="32" height="46" rx="4" fill="url(#${u}frame)" filter="url(#${u}woodV)"/>
    <rect x="150" y="350" width="390" height="290" rx="6" fill="url(#${u}frame)" filter="url(#${u}woodH)"/>
    <rect x="150.5" y="350.5" width="389" height="289" rx="6" fill="none" stroke="#2a1614" stroke-opacity=".7"/>
    <path d="M152 640 L152 356 M152 638 L538 638" stroke="#ffd7a6" stroke-opacity=".6" stroke-width="1.5"/>
    <rect x="166" y="366" width="358" height="258" fill="url(#${u}slate)" filter="url(#${u}slateN)"/>
    <rect x="166" y="366" width="358" height="258" fill="none" stroke="#0e1413" stroke-width="3" stroke-opacity=".7"/>
    <g clip-path="url(#${u}sc)" fill="none" stroke="#e8efe8" stroke-linecap="round">
      <path d="M190 590 C 260 560, 330 600, 420 572" stroke-width="40" stroke-opacity=".06" filter="url(#${u}b4)"/>
      <path d="M210 420 C 280 392, 340 430, 400 404" stroke-width="34" stroke-opacity=".07" filter="url(#${u}b4)"/>
      <ellipse cx="460" cy="590" rx="50" ry="12" fill="#e8efe8" fill-opacity=".05" stroke="none" filter="url(#${u}b4)"/>
      <ellipse cx="250" cy="470" rx="40" ry="10" fill="#e8efe8" fill-opacity=".05" stroke="none" filter="url(#${u}b4)"/>
      <g filter="url(#${u}chalk)" stroke="#eeebe1">
        <path d="M180 ${oy} L512 ${oy} M${ox} 612 L${ox} 378" stroke-width="2.6" stroke-opacity=".75"/>
        <path d="${ticks.join(" ")}" stroke-width="2" stroke-opacity=".6"/>
        <path d="${P(br)}" stroke-width="4.2"/>
        ${bl.length ? `<path d="${P(bl)}" stroke-width="4.2"/>` : ""}
        <text x="392" y="422" style="${SERIF}" font-style="italic" font-size="36" fill="#eeebe1" stroke="none" fill-opacity=".9">${opt.kind === "sin" ? "y = sin x" : "y = 1/x"}</text>
      </g>
    </g>
    <path d="${P(tail)}" fill="none" stroke="url(#${u}tail)" stroke-width="3.6" stroke-linecap="round" stroke-dasharray="14 7" filter="url(#${u}chalk)"/>
    <rect x="138" y="640" width="414" height="6" rx="2" fill="#d6a06a" filter="url(#${u}woodH)"/>
    <rect x="138" y="646" width="414" height="10" rx="2" fill="#7a4b2e" filter="url(#${u}woodH)"/>
    <line x1="139" y1="646" x2="551" y2="646" stroke="#ffd7a6" stroke-opacity=".5"/>
    <rect x="206" y="632" width="38" height="9" rx="4" fill="#f2ede2"/><rect x="206" y="637" width="38" height="4" rx="2" fill="#b9b0a6"/>
    <rect x="452" y="626" width="58" height="15" rx="3" fill="#6a4a36"/><rect x="452" y="636" width="58" height="5" fill="#d9d2c4" opacity=".8"/>
    </svg>`;
}

/* ---------- H4 dice + fern: true 3D cubes, stage 420x310, edge 100, ground origin (90,270) ---------- */
type V3 = [number, number, number];
type Face = "front" | "left" | "top" | "right" | "back" | "bottom";
type Edge = "l" | "r" | "t" | "b";
type FaceSpec = { g: string; n?: number; tone?: string; hl?: Edge[]; dk?: Edge[]; bounce?: boolean; extra?: string };

const PIPS: Record<number, Pt[]> = {
  1: [[50, 50]],
  2: [[25, 75], [75, 25]],
  3: [[25, 75], [50, 50], [75, 25]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]],
};
// orthographic view = rotateX(-22deg) rotateY(38deg), y down, viewer at +z; ground origin at (90,270)
const VC = Math.cos((38 * Math.PI) / 180), VS = Math.sin((38 * Math.PI) / 180), XC = Math.cos((22 * Math.PI) / 180), XS = Math.sin((22 * Math.PI) / 180);
const PR = (p: V3): V3 => {
  const x1 = p[0] * VC + p[2] * VS, z1 = -p[0] * VS + p[2] * VC;
  return [90 + x1, 270 + p[1] * XC + z1 * XS, -p[1] * XS + z1 * XC];
};
// each face: origin corner, u edge, v edge, outward normal
const FACES: Record<Face, [V3, V3, V3, V3]> = {
  front: [[-50, -100, 50], [100, 0, 0], [0, 100, 0], [0, 0, 1]],
  left: [[-50, -100, -50], [0, 0, 100], [0, 100, 0], [-1, 0, 0]],
  top: [[-50, -100, -50], [100, 0, 0], [0, 0, 100], [0, -1, 0]],
  right: [[50, -100, 50], [0, 0, -100], [0, 100, 0], [1, 0, 0]],
  back: [[50, -100, -50], [-100, 0, 0], [0, 100, 0], [0, 0, -1]],
  bottom: [[-50, 0, 50], [100, 0, 0], [0, 0, -100], [0, 1, 0]],
};
const hull = (pts0: Pt[]) => {
  const P = pts0.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cr = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: Pt[] = [], up: Pt[] = [];
  P.forEach((p) => {
    while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
    lo.push(p);
  });
  P.slice().reverse().forEach((p) => {
    while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
    up.push(p);
  });
  return lo.slice(0, -1).concat(up.slice(0, -1));
};
const PIPR = 8.5;
const pipSVG = (u: string, n: number, tone: string) =>
  PIPS[n]
    .map(
      ([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="${PIPR}" fill="url(#${u}pip${tone})"/><circle cx="${x}" cy="${y}" r="${PIPR}" fill="url(#${u}pipD)"/>` +
        `<path d="M${f(x - 7.9)} ${f(y - 3)}A8 8 0 0 0 ${f(x + 3)} ${f(y + 7.9)}" fill="none" stroke="#ffd6ba" stroke-opacity=".75" stroke-width="1" vector-effect="non-scaling-stroke"/>`,
    )
    .join("");
const EDGE: Record<Edge, string> = { l: "M1 8 L1 92", r: "M99 8 L99 92", t: "M8 1 L92 1", b: "M8 99 L92 99" };
// one die: T places a cube point in the world, R turns a normal; faces facing away are skipped
function dieSVG(u: string, T: (p: V3) => V3, R: (p: V3) => V3, spec: Partial<Record<Face, FaceSpec>>, nub: string) {
  const nv = PR(T([-50, -100, 50]));
  const n0 = PR([0, 0, 0]);
  const out: string[] = [];
  (Object.keys(spec) as Face[]).forEach((k) => {
    const F = FACES[k], nz = PR(R(F[3]));
    if (nz[2] - n0[2] <= 0.02) return;
    const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    const o = PR(T(F[0])), pu = PR(T(add(F[0], F[1]))), pv = PR(T(add(F[0], F[2])));
    const m = "matrix(" + [(pu[0] - o[0]) / 100, (pu[1] - o[1]) / 100, (pv[0] - o[0]) / 100, (pv[1] - o[1]) / 100, o[0], o[1]].map((v) => v.toFixed(4)).join(" ") + ")";
    const sp = spec[k] as FaceSpec;
    out.push(
      `<g transform="${m}"><rect x="0" y="0" width="100" height="100" rx="8" fill="url(#${u}${sp.g})" filter="url(#${u}grain)"/>` +
        (sp.bounce ? `<rect x="0" y="0" width="100" height="100" rx="8" fill="url(#${u}bnc)"/>` : "") +
        (sp.n ? pipSVG(u, sp.n, sp.tone || "S") : "") +
        (sp.extra || "") +
        (sp.hl || []).map((e) => `<path d="${EDGE[e]}" stroke="#fffaf0" stroke-opacity=".7" stroke-width="1.2" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`).join("") +
        (sp.dk || []).map((e) => `<path d="${EDGE[e]}" stroke="#3a263c" stroke-opacity=".45" stroke-width="1.2" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`).join("") +
        "</g>",
    );
  });
  return `<circle cx="${f(nv[0])}" cy="${f(nv[1])}" r="5" fill="${nub}"/>` + out.join("");
}
// light direction for cast shadows (up-right), and their stretch
const LD: V3 = (() => {
  const l = Math.hypot(1, 0.35);
  return [1 / l, 0, -0.35 / l];
})();
const LK = 1.7;
const castHull = (T: (p: V3) => V3) => {
  const P: Pt[] = [];
  for (const xx of [-50, 50])
    for (const yy of [-100, 0])
      for (const zz of [-50, 50]) {
        const w = T([xx, yy, zz]), h = Math.max(0, -w[1]);
        const q = PR([w[0] + LD[0] * h * LK, 0, w[2] + LD[2] * h * LK]);
        P.push([q[0], q[1]]);
      }
  return hull(P);
};

/* a three-level fern growing out of the 1 pip, with a fiddlehead; returns the svg and three leaflet tips */
function fernSVG() {
  const r = rng(41), c0 = [63, 127, 110], c1 = [169, 201, 181], B = 6;
  const col = (t: number, k: number) => {
    t = Math.max(0, Math.min(1, t));
    return "rgb(" + c0.map((v, i) => Math.round((v + (c1[i] - v) * t) * k)).join(",") + ")";
  };
  const bk: string[][] = Array.from({ length: B * 2 }, () => []);
  const bone: string[] = [], st: string[] = [];
  const tips: [number, number, number][] = [];
  const leaf = (x: number, y: number, a: number, s: number, t: number, dark: boolean) => {
    const c = Math.cos(a), si = Math.sin(a), w = s * 0.36, tx = x + c * s, ty = y + si * s, nx = -si * w, ny = c * w, mx = x + c * s * 0.45, my = y + si * s * 0.45;
    bk[Math.min(B - 1, Math.floor(Math.max(0, t) * B)) * 2 + (dark ? 1 : 0)].push(
      "M" + f(x) + " " + f(y) + "Q" + f(mx + nx) + " " + f(my + ny) + " " + f(tx) + " " + f(ty) + "Q" + f(mx - nx) + " " + f(my - ny) + " " + f(x) + " " + f(y) + "Z",
    );
    if (!dark && r() < 0.14) {
      const sg = nx < 0 ? 1 : -1;
      bone.push("M" + f(x) + " " + f(y) + "Q" + f(mx + nx * sg * 0.8) + " " + f(my + ny * sg * 0.8) + " " + f(tx) + " " + f(ty));
    }
  };
  const pinna = (x: number, y: number, a: number, len: number, side: number, t0: number) => {
    const n = Math.max(3, Math.round(len / 4.6)), seg = len / n, curl = side < 0 ? 0.035 : -0.035;
    let px = x, py = y, pa = a, d = "M" + f(x) + " " + f(y);
    for (let j = 0; j < n; j++) {
      px += Math.cos(pa) * seg;
      py += Math.sin(pa) * seg;
      pa += curl;
      d += "L" + f(px) + " " + f(py);
      const s = seg * 1.15 * (1 - j / (n + 2)) + 1.1, tt = t0 * 0.85 + (j / n) * 0.2;
      leaf(px, py, pa - 1.05, s, tt, side > 0);
      leaf(px, py, pa + 1.05, s * 0.95, tt, side > 0);
    }
    leaf(px, py, pa, seg * 1.05, t0 + 0.35, side > 0);
    st.push(d);
    tips.push([px, py, t0]);
  };
  let x = 0, y = 0, a = -Math.PI / 2 - 0.1;
  const N = 15, spine: Pt[] = [[0, 0]];
  for (let i = 0; i < N; i++) {
    const t = i / N, seg = 13.2 * (1 - t * 0.38);
    x += Math.cos(a) * seg;
    y += Math.sin(a) * seg;
    a += 0.012 + t * t * 0.16;
    spine.push([x, y]);
    if (i >= 1 && i < N - 1) {
      const pl = 54 * Math.pow(1 - t, 0.85) * Math.min(1, 0.45 + t * 2.8) + 4;
      pinna(x, y, a - 1.2, pl, -1, t);
      pinna(x, y, a + 1.2, pl * 0.92, 1, t);
    }
  }
  leaf(x, y, a, 6, 1, false);
  leaf(x, y, a - 0.6, 4, 1, false);
  leaf(x, y, a + 0.6, 4, 1, true);
  const P = (arr: Pt[]) => "M" + arr.map((p) => f(p[0]) + " " + f(p[1])).join("L");
  const third = Math.round(spine.length / 3);
  const fid: Pt[] = [];
  for (let k = 0; k <= 40; k++) {
    const th = Math.PI + (k * (2.6 * Math.PI)) / 40, rr = 3.6 * (1 - k / 46);
    fid.push([12 + rr * Math.cos(th), -13.5 + rr * Math.sin(th)]);
  }
  let body = "";
  for (let i = 0; i < B; i++) {
    if (bk[i * 2].length) body += `<path d="${bk[i * 2].join("")}" fill="${col(i / (B - 1), 1)}"/>`;
    if (bk[i * 2 + 1].length) body += `<path d="${bk[i * 2 + 1].join("")}" fill="${col((i / (B - 1)) * 0.8, 0.9)}"/>`;
  }
  const grains: [number, number, number, string][] = [[-6.5, 0.4, 0.8, "#EDE6D8"], [-4, -0.3, 0.55, "#8a6a52"], [5.5, 0.5, 0.7, "#cfc5b3"], [7.4, -0.2, 0.5, "#EDE6D8"], [-8.2, 0.1, 0.45, "#6e5440"], [3, 0.7, 0.5, "#8a6a52"]];
  const svg =
    "<g>" +
    '<g data-sway="1">' +
    `<path d="M4 0 C5 -5 6 -9 8.4 -13.5 ${P(fid).replace("M", "L")}" fill="none" stroke="#3F7F6E" stroke-width="1.5" stroke-linecap="round"/>` +
    `<path d="${P(fid.slice(0, 22))}" fill="none" stroke="#A9C9B5" stroke-width=".45" stroke-linecap="round" opacity=".8" transform="translate(-.4 .3)"/>` +
    `<path d="${st.join("")}" fill="none" stroke="${col(0.35, 0.95)}" stroke-width=".5" stroke-linecap="round"/>` +
    `<path d="${P(spine.slice(0, third + 1))}" fill="none" stroke="#3F7F6E" stroke-width="1.8" stroke-linecap="round"/>` +
    `<path d="${P(spine.slice(third, 2 * third + 1))}" fill="none" stroke="${col(0.3, 1)}" stroke-width="1.15" stroke-linecap="round"/>` +
    `<path d="${P(spine.slice(2 * third))}" fill="none" stroke="${col(0.6, 1)}" stroke-width=".65" stroke-linecap="round"/>` +
    `<path d="${P(spine.slice(0, 2 * third))}" fill="none" stroke="#EDE6D8" stroke-width=".35" opacity=".45" transform="translate(-.6 0)"/>` +
    body +
    `<path d="${bone.join("")}" fill="none" stroke="#EDE6D8" stroke-width=".3" opacity=".45"/>` +
    "</g>" +
    [0, 1, 2].map((i) => `<path data-dr="${i}" d="M0 0 Q2.5 1.3 5 0 Q2.5 -1.3 0 0Z" fill="${col(0.55 + i * 0.15, 1)}" opacity="0"/>`).join("") +
    grains.map((g) => `<circle cx="${g[0]}" cy="${g[1]}" r="${g[2]}" fill="${g[3]}"/>`).join("") +
    "</g>";
  const pick = [Math.floor(tips.length * 0.35), Math.floor(tips.length * 0.55), Math.floor(tips.length * 0.75)].map((k) => tips[k + (k % 2 ? 0 : 1)] || tips[k]);
  return { svg, tips: pick };
}

function dice(u: string) {
  const F = fernSVG();
  const I = (p: V3) => p, cz = Math.cos((35 * Math.PI) / 180), sz = Math.sin((35 * Math.PI) / 180);
  const RT = (p: V3): V3 => [p[0] * cz + p[1] * sz, -p[0] * sz + p[1] * cz, p[2]];
  // the second die tumbles 35 degrees onto one edge, to the right of the first
  const TT = (p: V3): V3 => {
    const q = RT([p[0] + 50, p[1], p[2]]);
    return [q[0] + 167, q[1], q[2] + 95];
  };
  const grains = ([[41, 45, 1.3, "#F4EEE0"], [58, 44, 1, "#8a6a52"], [43, 57, 0.9, "#cfc5b3"], [59, 56, 1.2, "#F4EEE0"], [52, 60, 0.7, "#6e5440"]] as [number, number, number, string][])
    .map((g) => `<circle cx="${g[0]}" cy="${g[1]}" r="${g[2]}" fill="${g[3]}"/>`)
    .join("");
  const up = dieSVG(
    u, I, I,
    {
      top: { g: "top", n: 1, tone: "T", hl: ["l", "b"], extra: grains },
      left: { g: "lit", n: 2, tone: "L", hl: ["l", "r", "t"], bounce: true },
      front: { g: "shd", n: 3, tone: "S", dk: ["r"], hl: ["t"] },
    },
    "#E2DACB",
  );
  const tm = dieSVG(
    u, TT, RT,
    {
      top: { g: "lit2", n: 5, tone: "L", hl: ["l", "b"] },
      left: { g: "under", n: 4, tone: "S", hl: ["r"], bounce: true },
      front: { g: "shd", n: 6, tone: "S", dk: ["r"], hl: ["l"] },
      bottom: { g: "bot", n: 2, tone: "S" },
      right: { g: "bot", n: 3, tone: "S" },
      back: { g: "bot", n: 1, tone: "S" },
    },
    "#E8E1D3",
  );
  const P = (arr: Pt[]) => arr.map((p) => f(p[0]) + "," + f(p[1])).join(" ");
  const h1 = castHull(I), h2 = castHull(TT);
  const s0 = PR([0, 0, 0]), s1 = PR([LD[0] * 240, 0, LD[2] * 240]), t0 = PR([180, 0, 95]), t1 = PR([180 + LD[0] * 280, 0, 95 + LD[2] * 280]);
  const foot = ([[-53, -53], [53, -53], [53, 53], [-53, 53]] as Pt[]).map(([x, z]): Pt => {
    const q = PR([x, 0, z]);
    return [q[0], q[1]];
  });
  const pa = PR([167, 0, 43]), pb = PR([167, 0, 147]), top = PR([0, -100, 0]);
  const pip = (id: string, c: string[]) =>
    `<radialGradient id="${u}pip${id}" cx=".36" cy=".66" r=".7"><stop offset="0" stop-color="${c[0]}"/><stop offset=".45" stop-color="${c[1]}"/><stop offset=".85" stop-color="${c[2]}"/><stop offset="1" stop-color="${c[3]}"/></radialGradient>`;
  const lg = (id: string, a: string, b: string) => `<linearGradient id="${u}${id}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  return (
    `<div data-prop="H4" style="position:relative;"><svg viewBox="0 0 420 310" width="100%" style="display:block; overflow:visible;"><defs>${FX(u)}` +
    `<filter id="${u}grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".95" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .26  0 0 0 0 .3  .1 0 0 0 0"/><feComposite in2="SourceGraphic" operator="in" result="g"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="g"/></feMerge></filter>` +
    `<filter id="${u}b1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1"/></filter><filter id="${u}b6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>` +
    lg("lit", "#F0E9DB", "#E9E1D3") + lg("top", "#E6DECF", "#DDD4C5") + lg("shd", "#BDB4B6", "#B2A8B0") + lg("lit2", "#F3EDE0", "#EAE3D6") + lg("under", "#B3A7A2", "#A0969A") + lg("bot", "#A99C98", "#958C92") +
    `<linearGradient id="${u}bnc" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffa06e" stop-opacity=".2"/><stop offset=".1" stop-color="#ffa06e" stop-opacity="0"/></linearGradient>` +
    pip("L", ["#F26A35", "#E0481A", "#B8380F", "#842609"]) + pip("T", ["#E85F2C", "#D44317", "#AA330E", "#7A2208"]) + pip("S", ["#C4532A", "#B13A14", "#8A2A0C", "#5E1A06"]) +
    `<radialGradient id="${u}pipD" cx=".7" cy=".3" r=".6"><stop offset="0" stop-color="#3a0c00" stop-opacity=".45"/><stop offset="1" stop-color="#3a0c00" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="${u}sh1" gradientUnits="userSpaceOnUse" x1="${f(s0[0])}" y1="${f(s0[1])}" x2="${f(s1[0])}" y2="${f(s1[1])}"><stop offset=".25" stop-color="${SH}" stop-opacity=".78"/><stop offset="1" stop-color="${SH}" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="${u}sh2" gradientUnits="userSpaceOnUse" x1="${f(t0[0])}" y1="${f(t0[1])}" x2="${f(t1[0])}" y2="${f(t1[1])}"><stop offset=".25" stop-color="${SH}" stop-opacity=".78"/><stop offset="1" stop-color="${SH}" stop-opacity="0"/></linearGradient>` +
    "</defs>" +
    `<polygon points="${P(h1)}" fill="url(#${u}sh1)" filter="url(#${u}b6)"/>` +
    `<polygon points="${P(h2)}" fill="url(#${u}sh2)" filter="url(#${u}b6)"/>` +
    `<polygon points="${P(foot)}" fill="${SH}" opacity=".7" filter="url(#${u}b2)"/>` +
    `<line x1="${f(pa[0])}" y1="${f(pa[1])}" x2="${f(pb[0])}" y2="${f(pb[1])}" stroke="${SH}" stroke-width="7" stroke-opacity=".55" stroke-linecap="round" filter="url(#${u}b2)"/>` +
    `<line x1="${f(pa[0])}" y1="${f(pa[1])}" x2="${f(pb[0])}" y2="${f(pb[1])}" stroke="#040206" stroke-width="2.2" stroke-linecap="round" filter="url(#${u}b1)"/>` +
    tm + up +
    `</svg><svg viewBox="0 0 420 310" style="position:absolute; left:0; top:0; width:100%; height:100%; overflow:visible; pointer-events:none;"><g transform="translate(${f(top[0])} ${f(top[1])})">${F.svg}</g></svg></div>`
  );
}

/**
 * The fern sways +-1.5 degrees on a 10s loop and drops three leaflets that drift off its tips.
 * Still under reduced motion. Returns a cleanup.
 */
export function diceMount(host: HTMLElement) {
  const sw = host.querySelector("[data-sway]");
  const dr = Array.from(host.querySelectorAll("[data-dr]"));
  if (!sw) return () => {};
  const tips = fernSVG().tips;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = performance.now();
  let raf = 0, timer = 0;
  const frame = (now: number) => {
    const t = (now - t0) / 1000;
    sw.setAttribute("transform", "rotate(" + (reduce ? 0 : 1.5 * Math.cos((t / 10) * Math.PI * 2)).toFixed(3) + ")");
    dr.forEach((e, i) => {
      if (reduce) return e.setAttribute("opacity", "0");
      const p = tips[i], k = (t / 6.5 + i / 3) % 1, x = p[0] + k * 34, y = p[1] + k * 26 + Math.sin(k * 7 + i) * 3;
      e.setAttribute("transform", "translate(" + f(x) + " " + f(y) + ") rotate(" + f(k * 260 - 30) + ")");
      e.setAttribute("opacity", (k < 0.08 ? k / 0.08 : 1 - (k - 0.08) / 0.92).toFixed(2));
    });
    if (!reduce) timer = window.setTimeout(() => (raf = requestAnimationFrame(frame)), 28);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(timer);
  };
}

/* ---------- H5 glass sphere + ring ---------- */
function orb(u: string) {
  const R = 46, cx = 50, cy = 50, el = (16 * Math.PI) / 180;
  const proj = (lat: number, lon: number): [number, number, number] => {
    const x = Math.cos(lat) * Math.sin(lon), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(lon);
    const y2 = y * Math.cos(el) - z * Math.sin(el), z2 = y * Math.sin(el) + z * Math.cos(el);
    return [cx + R * x, cy - R * y2, z2];
  };
  let lines = "";
  const run = (fn: (t: number) => [number, number, number], n: number) => {
    let d = "", on = false;
    for (let i = 0; i <= n; i++) {
      const p = fn(i / n);
      if (p[2] > 0.02) {
        d += (on ? " L" : " M") + f(p[0]) + " " + f(p[1]);
        on = true;
      } else on = false;
    }
    return d;
  };
  for (let la = -60; la <= 60; la += 30) lines += run((t) => proj((la * Math.PI) / 180, t * Math.PI * 2), 90);
  for (let lo = 0; lo < 180; lo += 30)
    lines += run((t) => proj(-Math.PI / 2 + t * Math.PI, (lo * Math.PI) / 180), 60) + run((t) => proj(-Math.PI / 2 + t * Math.PI, ((lo + 180) * Math.PI) / 180), 60);
  const rx = 70, ry = 19;
  const back = `M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`, front = `M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 0 ${cx + rx} ${cy}`;
  return `<svg viewBox="0 0 100 100" width="100%" style="display:block; overflow:visible;" data-prop="H5" data-glow="1">
    <defs>
      <radialGradient id="${u}g" cx=".62" cy=".32" r=".8"><stop offset="0" stop-color="#2e2236"/><stop offset=".55" stop-color="#1a1220"/><stop offset=".86" stop-color="#2c1d2a"/><stop offset="1" stop-color="#6b4a52"/></radialGradient>
      <radialGradient id="${u}in" cx=".3" cy=".78" r=".55"><stop offset="0" stop-color="#ffc79a" stop-opacity=".75"/><stop offset=".5" stop-color="#d9775a" stop-opacity=".3"/><stop offset="1" stop-color="#d9775a" stop-opacity="0"/></radialGradient>
      <linearGradient id="${u}inv" x1="0" y1="0" x2="0" y2="1"><stop offset=".22" stop-color="#ffb07a" stop-opacity="0"/><stop offset=".32" stop-color="#ffb07a" stop-opacity=".35"/><stop offset=".4" stop-color="#ffb07a" stop-opacity="0"/></linearGradient>
      <linearGradient id="${u}cr" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#fff6e6" stop-opacity=".95"/><stop offset=".5" stop-color="#fff6e6" stop-opacity=".25"/><stop offset="1" stop-color="#fff6e6" stop-opacity="0"/></linearGradient>
      <filter id="${u}fr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 .95  0 0 0 0 1  .22 0 0 0 -.09"/><feComposite in2="SourceGraphic" operator="in"/></filter>
      <filter id="${u}bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.1"/></filter>
      <clipPath id="${u}c"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath>
    </defs>
    <g transform="rotate(-20 ${cx} ${cy})"><path d="${back}" fill="none" stroke="#8a2c10" stroke-width="1.2"/><path d="${back}" fill="none" stroke="#ff8a55" stroke-width=".6" stroke-opacity=".5" transform="translate(0 -.8)"/></g>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#${u}g)"/>
    <g clip-path="url(#${u}c)">
      <rect x="0" y="0" width="100" height="100" fill="url(#${u}inv)"/>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#${u}in)"/>
      <path d="${lines}" fill="none" stroke="#1a1018" stroke-opacity=".55" stroke-width=".55" transform="translate(.35 .35)"/>
      <path d="${lines}" fill="none" stroke="#f6e7d8" stroke-opacity=".28" stroke-width=".4"/>
      <rect x="0" y="0" width="100" height="100" fill="#fff" filter="url(#${u}fr)"/>
      <g transform="rotate(-20 ${cx} ${cy})"><path d="${front}" fill="none" stroke="#0a0610" stroke-opacity=".5" stroke-width="3" transform="translate(1 4)" filter="url(#${u}bl)"/></g>
      <path d="M 9 52 C 10 76 28 93 52 96 C 34 90 17 76 9 52 Z" fill="url(#${u}cr)" filter="url(#${u}bl)"/>
    </g>
    <circle cx="${cx}" cy="${cy}" r="${R - 0.3}" fill="none" stroke="#ffd9b8" stroke-opacity=".55" stroke-width=".7" stroke-dasharray="0 150 75 300"/>
    <circle cx="${cx}" cy="${cy}" r="${R - 0.2}" fill="none" stroke="#120a14" stroke-opacity=".8" stroke-width=".8" stroke-dasharray="0 20 70 300"/>
    <ellipse cx="25" cy="76" rx="3.4" ry="1.7" transform="rotate(-40 25 76)" fill="#fffdf6"/>
    <ellipse cx="71" cy="22" rx="2.2" ry="1" transform="rotate(-35 71 22)" fill="#e9ddf2" opacity=".8"/>
    <g transform="rotate(-20 ${cx} ${cy})">
      <path d="${front}" fill="none" stroke="#e0501c" stroke-width="1.3"/>
      <path d="${front}" fill="none" stroke="#ffb084" stroke-width=".4" stroke-opacity=".8" transform="translate(0 .5)"/>
      <path data-ring="1" d="${front}" fill="none" stroke="#fff0dc" stroke-width=".6" stroke-dasharray="18 132" stroke-linecap="round" opacity=".85"/>
    </g>
    </svg>`;
}

/* ---------- W5 fold stages (overlay on the How-it-works strip, 2400x760) ---------- */
function fold(u: string) {
  return `<svg viewBox="0 0 2400 760" style="position:absolute; inset:0; width:100%; height:100%; overflow:visible; pointer-events:none;" data-prop="W5">
    <defs>
      <linearGradient id="${u}s1" gradientUnits="userSpaceOnUse" x1="1690" y1="0" x2="1800" y2="0"><stop offset="0" stop-color="#FF5B1F"/><stop offset=".55" stop-color="#f3b48c"/><stop offset="1" stop-color="#f7efe0"/></linearGradient>
      <linearGradient id="${u}s1b" gradientUnits="userSpaceOnUse" x1="1690" y1="0" x2="1800" y2="0"><stop offset="0" stop-color="#b8401a"/><stop offset="1" stop-color="#b5a796"/></linearGradient>
      <linearGradient id="${u}lit" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#fffaf0"/><stop offset=".6" stop-color="#f1e7d4"/><stop offset="1" stop-color="#d9ccb8"/></linearGradient>
      <linearGradient id="${u}mid" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#ddd1bd"/><stop offset="1" stop-color="#b6a99c"/></linearGradient>
      <linearGradient id="${u}shd" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#9d8f93"/><stop offset="1" stop-color="#6e6274"/></linearGradient>
      <filter id="${u}fib" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.04 0.6" numOctaves="2" seed="8"/><feColorMatrix values="0 0 0 0 .4  0 0 0 0 .32  0 0 0 0 .28  1 0 0 0 -.45"/><feComposite in2="SourceGraphic" operator="in" result="g"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="g"/></feMerge></filter>
      <filter id="${u}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    </defs>
    <g data-fs="0" opacity="0">
      <ellipse cx="1760" cy="606" rx="70" ry="6" fill="#050307" opacity=".5" filter="url(#${u}b)"/>
      <path d="M1690 394 C 1730 384, 1770 376, 1806 366 L 1810 384 C 1772 394, 1732 402, 1694 410 Z" fill="url(#${u}s1)" filter="url(#${u}fib)"/>
      <path d="M1806 366 C 1822 362, 1830 370, 1826 380 C 1822 388, 1812 388, 1810 384 Z" fill="url(#${u}s1b)"/>
      <path d="M1810 384 C 1816 382, 1820 376, 1816 372" fill="none" stroke="#fffaf0" stroke-opacity=".8" stroke-width="1.4"/>
      <path d="M1694 410 C 1732 402, 1772 394, 1810 384" fill="none" stroke="#fffaf0" stroke-opacity=".7" stroke-width="1.4"/>
      <path d="M1690 394 C 1730 384, 1770 376, 1806 366" fill="none" stroke="#5a3a3a" stroke-opacity=".45" stroke-width="1.2"/>
    </g>
    <g data-fs="1" opacity="0">
      <ellipse cx="1915" cy="606" rx="80" ry="6" fill="#050307" opacity=".5" filter="url(#${u}b)"/>
      <polygon points="1846,350 1984,312 1958,298 1858,322" fill="url(#${u}shd)" filter="url(#${u}fib)"/>
      <polygon points="1846,350 1984,312 1952,340 1854,380" fill="url(#${u}lit)" filter="url(#${u}fib)"/>
      <line x1="1846" y1="350.6" x2="1984" y2="312.6" stroke="#fffaf0" stroke-width="1.4"/>
      <line x1="1846" y1="349" x2="1984" y2="311" stroke="#4a3a44" stroke-opacity=".8" stroke-width="1.4"/>
      <path d="M1854 380 L1952 340" stroke="#fffaf0" stroke-opacity=".6" stroke-width="1.2"/>
    </g>
    <ellipse data-fs="2" cx="2110" cy="608" rx="92" ry="8" fill="#050307" opacity="0" filter="url(#${u}b)"/>
    <g data-fglide="1"><g data-fs="2" opacity="0">
      <polygon points="2204,226 2066,262 2068,298" fill="url(#${u}shd)" filter="url(#${u}fib)"/>
      <polygon points="2204,226 2068,298 2088,334" fill="url(#${u}mid)" filter="url(#${u}fib)"/>
      <polygon points="2204,226 1996,310 2068,298" fill="url(#${u}lit)" filter="url(#${u}fib)"/>
      <line x1="2204" y1="226" x2="2068" y2="298" stroke="#fffaf0" stroke-width="1.6"/>
      <line x1="2204" y1="226" x2="2068" y2="299.6" stroke="#5a4650" stroke-opacity=".7" stroke-width="1.2"/>
      <line x1="2204" y1="226" x2="1996" y2="310" stroke="#fffaf0" stroke-opacity=".85" stroke-width="1.2"/>
      <line x1="2204" y1="226" x2="2066" y2="262" stroke="#4a3a44" stroke-opacity=".6" stroke-width="1"/>
      <path d="M2068 298 L2088 334" stroke="#4a3a44" stroke-opacity=".5" stroke-width="1"/>
      <path d="M2216 220 Q 2300 170 2392 76" fill="none" stroke="#F4E9D0" stroke-opacity=".5" stroke-width="3" stroke-dasharray="2 14" stroke-linecap="round"/>
    </g></g>
    </svg>`;
}

/* ---------- Q3 angled blackboard (same family as H2) ---------- */
const qboard = (u: string) => easel(u, { kind: "sin", vb: "110 270 760 620", id: "Q3" });

const BRASS = (u: string) => `
      <linearGradient id="${u}br" x1="0" x2="1"><stop offset="0" stop-color="#8a6428"/><stop offset=".14" stop-color="#e6c37a"/><stop offset=".26" stop-color="#fbe9b4"/><stop offset=".45" stop-color="#c0924a"/><stop offset=".72" stop-color="#7c5626"/><stop offset="1" stop-color="#3a2614"/></linearGradient>
      <linearGradient id="${u}brV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3c18"/><stop offset=".5" stop-color="#b48640"/><stop offset="1" stop-color="#ecd08c"/></linearGradient>
      <filter id="${u}brush" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.015" numOctaves="2" seed="6"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 .92  0 0 0 0 .7  .55 0 0 0 -.22"/><feComposite in2="SourceGraphic" operator="in" result="g"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="g"/></feMerge></filter>
      <filter id="${u}brushH" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.015 0.9" numOctaves="2" seed="6"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 .92  0 0 0 0 .7  .55 0 0 0 -.22"/><feComposite in2="SourceGraphic" operator="in" result="g"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="g"/></feMerge></filter>`;

/* ---------- W1 bubble + W2 ribbon + W3 lantern (overlay on the How-it-works strip, 2400x760) ---------- */
const BUB =
  "M 252 300 C 246 205 330 152 432 152 C 545 152 618 212 616 292 C 614 372 540 420 432 420 C 400 420 372 417 348 410 C 326 428 296 442 262 448 C 284 432 296 414 300 398 C 268 372 254 340 252 300 Z";
function howto(u: string) {
  const words = ["show", " how", " a", " wave", " is", " born"], sizes = [76, 73, 70, 67, 64, 49];
  const pborn = [[1146, 430, 2.6], [1152, 446, 2], [1142, 440, 1.6], [1158, 424, 2.2], [1150, 452, 1.8], [1160, 438, 1.4], [1144, 422, 1.8], [1156, 456, 1.5]];
  return `<svg viewBox="0 0 2400 760" style="position:absolute; inset:0; width:100%; height:100%; overflow:visible; pointer-events:none;" data-prop="W1-W3">
    <defs>${FX(u)}${BRASS(u)}
      <filter id="${u}plaster" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="3" seed="15"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .28  .32 0 0 0 -.12"/><feComposite in2="SourceGraphic" operator="in" result="g"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="g"/></feMerge></filter>
      <radialGradient id="${u}bf" gradientUnits="userSpaceOnUse" cx="300" cy="400" r="380"><stop offset="0" stop-color="#fffcf4"/><stop offset=".45" stop-color="#eee6d6"/><stop offset=".8" stop-color="#c9bda8"/><stop offset="1" stop-color="#a99a8c"/></radialGradient>
      <linearGradient id="${u}bs" gradientUnits="userSpaceOnUse" x1="300" y1="420" x2="620" y2="160"><stop offset="0" stop-color="#a08f78"/><stop offset=".6" stop-color="#7d6e66"/><stop offset="1" stop-color="#5c5060"/></linearGradient>
      <radialGradient id="${u}bsh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#030105" stop-opacity=".8"/><stop offset="1" stop-color="#030105" stop-opacity="0"/></radialGradient>
      <radialGradient id="${u}pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffc58a" stop-opacity=".42"/><stop offset=".5" stop-color="#ff8a4a" stop-opacity=".14"/><stop offset="1" stop-color="#ff8a4a" stop-opacity="0"/></radialGradient>
      <radialGradient id="${u}halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb27a" stop-opacity=".3"/><stop offset="1" stop-color="#ff7a3a" stop-opacity="0"/></radialGradient>
      <linearGradient id="${u}in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf98" stop-opacity=".35"/><stop offset=".6" stop-color="#ffb070" stop-opacity=".55"/><stop offset="1" stop-color="#ff8a4a" stop-opacity=".4"/></linearGradient>
      <radialGradient id="${u}flame" gradientUnits="userSpaceOnUse" cx="1200" cy="462" r="44"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#fff2c2"/><stop offset=".65" stop-color="#ffc24a"/><stop offset="1" stop-color="#FF5B1F"/></radialGradient>
      <radialGradient id="${u}fglow" gradientUnits="userSpaceOnUse" cx="1200" cy="452" r="90"><stop offset="0" stop-color="#ffd38a" stop-opacity=".9"/><stop offset="1" stop-color="#FF5B1F" stop-opacity="0"/></radialGradient>
      <path id="${u}rib" d="M 568 300 C 770 150, 990 330, 1200 446"/>
      <clipPath id="${u}ribc"><rect x="0" y="0" width="1134" height="760"/><rect x="1136" y="332" width="128" height="206"/></clipPath>
    </defs>
    <ellipse data-bubsh="1" cx="446" cy="592" rx="176" ry="18" fill="url(#${u}bsh)"/>
    <g data-bob="12,7,0.4">
      <path d="${BUB}" transform="translate(14 -10)" fill="url(#${u}bs)" filter="url(#${u}plaster)"/>
      <path d="${BUB}" transform="translate(7 -5)" fill="url(#${u}bs)"/>
      <path d="${BUB}" fill="url(#${u}bf)" filter="url(#${u}plaster)"/>
      <path d="M 262 448 C 284 432 296 414 300 398 C 268 372 254 340 252 300" fill="none" stroke="#fffaf0" stroke-width="2.5" stroke-linecap="round" opacity=".9"/>
      <path d="M 300 398 C 330 414 380 422 432 420 C 500 420 560 396 592 352" fill="none" stroke="#fffaf0" stroke-width="2" stroke-linecap="round" opacity=".55"/>
      <path d="M 452 154 C 545 154 618 212 616 292" fill="none" stroke="#3d3040" stroke-width="2" opacity=".45"/>
      <g><circle cx="400" cy="290" r="9.5" fill="#7a6c5c"/><circle cx="401.5" cy="291.5" r="7" fill="#b3a590"/><circle cx="440" cy="290" r="9.5" fill="#7a6c5c"/><circle cx="441.5" cy="291.5" r="7" fill="#b3a590"/><circle cx="480" cy="290" r="9.5" fill="#7a6c5c"/><circle cx="481.5" cy="291.5" r="7" fill="#b3a590"/></g>
    </g>
    <ellipse cx="1200" cy="608" rx="300" ry="36" fill="url(#${u}pool)"/>
    <circle cx="1200" cy="440" r="270" fill="url(#${u}halo)"/>
    <ellipse cx="1200" cy="601" rx="100" ry="5" fill="${SH}" opacity=".85" filter="url(#${u}b2)"/>
    <rect x="1108" y="562" width="184" height="38" rx="4" fill="url(#${u}br)" filter="url(#${u}brushH)"/>
    <rect x="1108" y="562" width="184" height="5" rx="2" fill="#fbe7b0" opacity=".55"/>
    <rect x="1122" y="540" width="156" height="22" fill="url(#${u}br)" filter="url(#${u}brushH)"/>
    <rect x="1134" y="330" width="132" height="210" fill="url(#${u}in)"/>
    <circle data-fglow="1" cx="1200" cy="452" r="90" fill="url(#${u}fglow)" opacity=".35"/>
    <g data-flame="1"><path d="M1200 402 C1224 436 1224 470 1200 481 C1176 470 1176 436 1200 402 Z" fill="url(#${u}flame)"/><ellipse cx="1200" cy="465" rx="7" ry="12" fill="#ffffff"/></g>
    <text clip-path="url(#${u}ribc)" style="${SERIF}" font-style="italic" fill="#F4EEE0" word-spacing="10"><textPath href="#${u}rib" startOffset="22" textLength="663" lengthAdjust="spacing">${words.map((w, i) => `<tspan data-word="${i}" font-size="${sizes[i]}" fill-opacity="0">${w}</tspan>`).join("")}</textPath></text>
    ${pborn.map((p, i) => `<circle data-pborn="${i}" cx="${p[0]}" cy="${p[1]}" r="${p[2]}" fill="#ffe2b0" opacity="0"/>`).join("")}
    <rect x="1136" y="332" width="14" height="206" fill="#fff4e0" opacity=".14"/>
    <rect x="1250" y="332" width="14" height="206" fill="#3a2030" opacity=".28"/>
    <rect x="1158" y="340" width="4" height="190" fill="#fffaf0" opacity=".5"/>
    <rect x="1166" y="340" width="1.5" height="190" fill="#fffaf0" opacity=".35"/>
    <rect x="1240" y="340" width="2" height="190" fill="#fffaf0" opacity=".3"/>
    <path d="M1152 520 L1186 480" stroke="#fffaf0" stroke-opacity=".35" stroke-width="2"/>
    <rect x="1122" y="326" width="14" height="216" fill="url(#${u}br)" filter="url(#${u}brush)"/>
    <rect x="1264" y="326" width="14" height="216" fill="url(#${u}br)" filter="url(#${u}brush)"/>
    <rect x="1147" y="326" width="5" height="216" fill="url(#${u}br)"/><rect x="1248" y="326" width="5" height="216" fill="url(#${u}br)"/>
    <line x1="1122.6" y1="328" x2="1122.6" y2="540" stroke="#fff0c4" stroke-width="1.2" opacity=".8"/>
    <rect x="1110" y="304" width="180" height="22" rx="2" fill="url(#${u}br)" filter="url(#${u}brushH)"/>
    <line x1="1110" y1="325" x2="1290" y2="325" stroke="#2a1a0a" stroke-opacity=".6"/>
    <path d="M1124 304 Q1200 236 1276 304 Z" fill="url(#${u}br)" filter="url(#${u}brushH)"/>
    <ellipse cx="1166" cy="286" rx="14" ry="5" transform="rotate(-22 1166 286)" fill="#fffbe8" opacity=".75"/>
    <circle cx="1162" cy="288" r="2.2" fill="#ffffff"/>
    <rect x="1188" y="256" width="24" height="16" rx="2" fill="url(#${u}br)"/>
    <path d="M1174 272 C1168 200 1232 200 1226 272" fill="none" stroke="#5a3c18" stroke-width="8" stroke-linecap="round"/>
    <path d="M1174 272 C1168 200 1232 200 1226 272" fill="none" stroke="#d9b46a" stroke-width="5" stroke-linecap="round"/>
    <path d="M1176 262 C1172 210 1196 206 1206 207" fill="none" stroke="#fff3c8" stroke-width="1.4" stroke-linecap="round" opacity=".9"/>
    <circle cx="1174" cy="272" r="6.5" fill="url(#${u}br)" stroke="#3a2614" stroke-width="1"/><circle cx="1226" cy="272" r="6.5" fill="url(#${u}br)" stroke="#3a2614" stroke-width="1"/>
    <circle data-pex="0" cx="604" cy="300" r="2.4" fill="#F4EEE0"/><circle data-pex="1" cx="600" cy="310" r="1.8" fill="#F4EEE0"/><circle data-pex="2" cx="606" cy="292" r="1.5" fill="#F4EEE0"/><circle data-pex="3" cx="598" cy="304" r="2" fill="#F4EEE0"/>
    </svg>`;
}

/* ---------- Q1 floor lamp (600x1100) ---------- */
function lamp(u: string) {
  return `<svg viewBox="0 0 600 1100" width="100%" height="100%" style="display:block; overflow:visible;" data-prop="Q1">
    <defs>${FX(u)}${BRASS(u)}
      <linearGradient id="${u}sh" gradientUnits="userSpaceOnUse" x1="280" y1="300" x2="440" y2="110"><stop offset="0" stop-color="#f3e6c8"/><stop offset=".45" stop-color="#cdb486"/><stop offset="1" stop-color="#7a6150"/></linearGradient>
      <linearGradient id="${u}rim" gradientUnits="userSpaceOnUse" x1="0" y1="180" x2="0" y2="300"><stop offset="0" stop-color="#ffe9b8" stop-opacity="0"/><stop offset="1" stop-color="#fff2d0" stop-opacity=".75"/></linearGradient>
      <radialGradient id="${u}open" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#fff2cf"/><stop offset="1" stop-color="#ffd896"/></radialGradient>
      <filter id="${u}linen" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.6 0.9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .24  0 0 0 0 .2  .5 0 0 0 -.22"/><feComposite in2="SourceGraphic" operator="in" result="g"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="g"/></feMerge></filter>
    </defs>
    <ellipse cx="166" cy="1066" rx="112" ry="10" fill="${SH}" opacity=".8" filter="url(#${u}b4)"/>
    <path d="M56 1050 L56 1060 A104 20 0 0 0 264 1060 L264 1050 Z" fill="#6a4a22"/>
    <ellipse cx="160" cy="1050" rx="104" ry="20" fill="url(#${u}br)" filter="url(#${u}brushH)"/>
    <ellipse cx="140" cy="1046" rx="50" ry="6" fill="#fff0c4" opacity=".35"/>
    <rect x="152" y="252" width="16" height="800" fill="url(#${u}br)" filter="url(#${u}brush)"/>
    <line x1="153" y1="260" x2="153" y2="1046" stroke="#fff0c4" stroke-width="1.2" opacity=".85"/>
    <rect x="152" y="960" width="16" height="90" fill="#ff9a60" opacity=".18"/>
    <path d="M160 258 C 160 190, 210 152, 278 150" fill="none" stroke="#5a3c18" stroke-width="15" stroke-linecap="round"/>
    <path d="M160 258 C 160 190, 210 152, 278 150" fill="none" stroke="url(#${u}brV)" stroke-width="11" stroke-linecap="round"/>
    <path d="M155 250 C 156 196, 200 160, 260 154" fill="none" stroke="#fff0c4" stroke-width="1.6" opacity=".8"/>
    <g data-shade="1" transform="rotate(-38 272 146)">
    <path d="M266 140 L356 104 L478 212 C 450 252 330 314 270 310 Z" fill="url(#${u}sh)" filter="url(#${u}linen)"/>
    <path d="M266 140 L356 104 L478 212 C 450 252 330 314 270 310 Z" fill="url(#${u}rim)"/>
    <path d="M266 140 L270 310" stroke="#fff6dc" stroke-width="1.6" opacity=".7"/>
    <path d="M356 104 L478 212" stroke="#3d2c2a" stroke-width="1.6" opacity=".5"/>
    <ellipse cx="374" cy="262" rx="112" ry="30" transform="rotate(-24 374 262)" fill="url(#${u}open)"/>
    <ellipse cx="374" cy="262" rx="112" ry="30" transform="rotate(-24 374 262)" fill="none" stroke="#c9a270" stroke-width="3"/>
    <ellipse cx="380" cy="258" rx="40" ry="12" transform="rotate(-24 380 258)" fill="#ffffff"/>
    </g>
    </svg>`;
}

/* ---------- Q2 wooden school chair (400x560) ---------- */
function chair(u: string) {
  const leg = (x1: number, y1: number, x2: number, y2: number, w: number, d?: boolean) => {
    const L = legTo(x1, y1, x2, y2);
    return stick(u, L.x, L.y, w, L.len, L.ang, d);
  };
  return `<svg viewBox="0 0 400 560" width="100%" style="display:block; overflow:visible;" data-prop="Q2">
    <defs>${FX(u)}
      <linearGradient id="${u}leg" x1="0" x2="1"><stop offset="0" stop-color="#d9a670"/><stop offset=".45" stop-color="#a8723f"/><stop offset="1" stop-color="#5b3626"/></linearGradient>
      <linearGradient id="${u}legD" x1="0" x2="1"><stop offset="0" stop-color="#7a5236"/><stop offset="1" stop-color="#3a2219"/></linearGradient>
      <linearGradient id="${u}bounce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a60" stop-opacity="0"/><stop offset="1" stop-color="#ff9a60" stop-opacity=".25"/></linearGradient>
      <linearGradient id="${u}seat" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#d8a874"/><stop offset=".55" stop-color="#a87444"/><stop offset="1" stop-color="#6e4630"/></linearGradient>
      <linearGradient id="${u}back" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#c9955f"/><stop offset=".6" stop-color="#93603a"/><stop offset="1" stop-color="#5a3826"/></linearGradient>
    </defs>
    ${leg(171, 262, 176, 492, 12, true)}${leg(316, 286, 312, 500, 12, true)}
    ${leg(167, 64, 171, 262, 13, true)}${leg(322, 86, 316, 286, 13, true)}
    <path d="M166 66 Q 245 50 324 88 L 324 150 Q 245 116 166 128 Z" fill="url(#${u}back)" filter="url(#${u}woodH)"/>
    <path d="M166 128 Q 245 116 324 150" fill="none" stroke="#ffd7a6" stroke-width="1.6" opacity=".6"/>
    <path d="M166 66 Q 245 50 324 88" fill="none" stroke="#2a1614" stroke-width="1.4" opacity=".6"/>
    <path d="M170 196 Q 245 190 318 214 L 318 226 Q 245 202 170 208 Z" fill="url(#${u}back)" filter="url(#${u}woodH)"/>
    <polygon points="110,300 268,330 320,282 166,256" fill="url(#${u}seat)" filter="url(#${u}woodH)"/>
    <polygon points="110,300 268,330 268,346 110,316" fill="#b07a48" filter="url(#${u}woodH)"/>
    <polygon points="268,330 320,282 320,298 268,346" fill="#5e3a28"/>
    <line x1="110" y1="301" x2="268" y2="331" stroke="#ffe0b4" stroke-width="1.4" opacity=".8"/>
    <line x1="110" y1="316" x2="268" y2="346" stroke="#2a1614" stroke-width="1.2" opacity=".6"/>
    ${leg(117, 314, 112, 540, 14)}${leg(262, 344, 266, 548, 14)}
    <line x1="118" y1="470" x2="262" y2="496" stroke="#8a5a36" stroke-width="7" stroke-linecap="round"/><line x1="118" y1="468" x2="262" y2="494" stroke="#e2b07a" stroke-width="1.2" opacity=".6"/>
    </svg>`;
}

/* ---------- I1-I3 tumbler, sun, plinth (640x860); the sun moves through [data-sunmove] ---------- */
function glass(u: string) {
  const W = 470;
  const sun = (id: string) => `<g data-sunmove="${id}"><circle cx="320" cy="470" r="150" fill="url(#${u}sh)"/><circle cx="320" cy="470" r="62" fill="url(#${u}sun)"/></g>`;
  return `<svg viewBox="0 0 640 860" width="100%" height="100%" style="display:block; overflow:visible;" data-prop="I1-I3">
    <defs>${FX(u)}
      <radialGradient id="${u}sun" cx=".38" cy=".64" r=".7"><stop offset="0" stop-color="#fff6dc"/><stop offset=".25" stop-color="#ffb66a"/><stop offset=".7" stop-color="#f0602a"/><stop offset="1" stop-color="#b8361a"/></radialGradient>
      <radialGradient id="${u}sh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff8a4a" stop-opacity=".55"/><stop offset=".5" stop-color="#ff6a2a" stop-opacity=".16"/><stop offset="1" stop-color="#ff6a2a" stop-opacity="0"/></radialGradient>
      <linearGradient id="${u}water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98a7e" stop-opacity=".55"/><stop offset=".6" stop-color="#7a4a5a" stop-opacity=".6"/><stop offset="1" stop-color="#4a2a3e" stop-opacity=".75"/></linearGradient>
      <linearGradient id="${u}wall" x1="0" x2="1"><stop offset="0" stop-color="#fff6e8" stop-opacity=".38"/><stop offset=".12" stop-color="#fff6e8" stop-opacity=".06"/><stop offset=".85" stop-color="#e8dcf0" stop-opacity=".04"/><stop offset="1" stop-color="#d9c8e6" stop-opacity=".3"/></linearGradient>
      <linearGradient id="${u}stoneF" x1="0" x2="1"><stop offset="0" stop-color="#d4c6aa"/><stop offset=".6" stop-color="#a99a86"/><stop offset="1" stop-color="#7d7078"/></linearGradient>
      <linearGradient id="${u}stoneT" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#f2b58a"/><stop offset="1" stop-color="#c9967e"/></linearGradient>
      <linearGradient id="${u}cast" gradientUnits="userSpaceOnUse" x1="490" y1="820" x2="640" y2="760"><stop offset="0" stop-color="${SH}" stop-opacity=".6"/><stop offset="1" stop-color="${SH}" stop-opacity="0"/></linearGradient>
      <clipPath id="${u}glass"><path d="M184 330 L456 330 L436 690 L204 690 Z"/></clipPath>
      <clipPath id="${u}above"><rect x="0" y="0" width="640" height="${W}"/></clipPath>
      <clipPath id="${u}below"><path d="M194 ${W} L446 ${W} L437 650 L203 650 Z"/></clipPath>
      <filter id="${u}wob" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="10"/></filter>
    </defs>
    <polygon points="490,820 500,700 650,660 650,800" fill="url(#${u}cast)" filter="url(#${u}b10)"/>
    <ellipse cx="324" cy="822" rx="176" ry="8" fill="${SH}" opacity=".8" filter="url(#${u}b4)"/>
    <polygon points="160,712 485,712 500,697 175,697" fill="url(#${u}stoneT)" filter="url(#${u}mottle)"/>
    <rect x="160" y="712" width="325" height="108" fill="url(#${u}stoneF)" filter="url(#${u}mottle)"/>
    <polygon points="485,712 500,697 500,806 485,820" fill="#6a5e6c" filter="url(#${u}mottle)"/>
    <line x1="160" y1="712.5" x2="485" y2="712.5" stroke="#fff0dc" stroke-opacity=".7" stroke-width="1.4"/>
    <line x1="160.6" y1="712" x2="160.6" y2="820" stroke="#fff0dc" stroke-opacity=".5"/>
    <rect x="160" y="800" width="325" height="20" fill="#ff9a60" opacity=".12"/>
    <ellipse cx="320" cy="698" rx="128" ry="6" fill="${SH}" opacity=".7" filter="url(#${u}b2)"/>
    <ellipse cx="320" cy="698" rx="150" ry="12" fill="#ff9a50" opacity=".25" filter="url(#${u}b4)"/>
    <ellipse cx="320" cy="330" rx="136" ry="11" fill="none" stroke="#fff4e6" stroke-opacity=".25" stroke-width="2"/>
    <g clip-path="url(#${u}above)">${sun("a")}</g>
    <g clip-path="url(#${u}glass)">
      <path d="M194 ${W} L446 ${W} L437 650 L203 650 Z" fill="url(#${u}water)"/>
      <g clip-path="url(#${u}below)" opacity=".92"><g filter="url(#${u}wob)"><g transform="translate(330 0) scale(1.08 1) translate(-320 0) translate(4 6)">${sun("b")}</g></g></g>
      <path d="M210 ${W + 10} L232 640 M236 ${W + 10} L246 640 M404 ${W + 10} L392 640" stroke="#ffd2a0" stroke-opacity=".12" stroke-width="10"/>
      <rect x="180" y="650" width="280" height="42" fill="#efe2ee" opacity=".22"/>
      <path d="M204 652 Q320 664 436 652" fill="none" stroke="#fff6ea" stroke-opacity=".45" stroke-width="2"/>
      <path d="M204 688 Q320 698 436 688" fill="none" stroke="#fff6ea" stroke-opacity=".5" stroke-width="2"/>
      <rect x="184" y="330" width="272" height="360" fill="url(#${u}wall)"/>
    </g>
    <ellipse cx="320" cy="${W}" rx="126" ry="9" fill="none" stroke="#fff0dc" stroke-opacity=".3" stroke-width="1.4" stroke-dasharray="0 198 400"/>
    <path d="M194 ${W} Q 320 ${W + 18} 446 ${W}" fill="none" stroke="#ffe8d0" stroke-opacity=".8" stroke-width="2"/>
    <path d="M184 330 L204 690" stroke="#fff6e8" stroke-opacity=".75" stroke-width="2"/>
    <path d="M192 332 L210 688" stroke="#fff6e8" stroke-opacity=".25" stroke-width="5"/>
    <path d="M456 330 L436 690" stroke="#cbb8dc" stroke-opacity=".55" stroke-width="2"/>
    <path d="M212 352 L222 560" stroke="#ffffff" stroke-opacity=".6" stroke-width="5" stroke-linecap="round"/>
    <path d="M226 360 L230 430" stroke="#ffffff" stroke-opacity=".8" stroke-width="2" stroke-linecap="round"/>
    <path d="M424 360 L414 600" stroke="#ffffff" stroke-opacity=".22" stroke-width="3" stroke-linecap="round"/>
    <path d="M184 330 Q 320 352 456 330" fill="none" stroke="#fff6e8" stroke-opacity=".9" stroke-width="2"/>
    <path d="M200 334 Q 260 342 300 343" fill="none" stroke="#ffffff" stroke-opacity=".9" stroke-width="1.4"/>
    <path d="M204 690 Q 320 704 436 690" fill="none" stroke="#fff6e8" stroke-opacity=".6" stroke-width="2"/>
    </svg>`;
}

export const PROPS = { easel, dice, orb, fold, howto, lamp, chair, qboard, glass };
export type PropKind = keyof typeof PROPS;
