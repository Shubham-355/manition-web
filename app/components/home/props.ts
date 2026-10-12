/*
 * The hero still-life props and the How-it-works fold stages, drawn in code (ported from the
 * design's site-v3/props.js). Each builder returns an SVG string; `u` prefixes every id so two
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

/* ---------- H2 easel blackboard ---------- */
function easel(u: string) {
  const G = 862; // ground line
  const L = legTo(250, 292, 150, G), R = legTo(432, 292, 540, G), B = legTo(342, 288, 372, G - 34);
  // y = 1/x, origin (328,508), unit 30px
  const ox = 328, oy = 508, k = 30;
  const br: Pt[] = [], bl: Pt[] = [], tail: Pt[] = [];
  for (let x = 0.27; x <= 6.55; x += 0.06) br.push([ox + k * x, oy - k / x]);
  for (let x = 6.55; x <= 10.5; x += 0.12) tail.push([ox + k * x, oy - k / x - (x - 6.55) * 3.2]);
  for (let x = -0.19; x >= -5.3; x -= 0.05) bl.push([ox + k * x, oy - k / x]);
  const P = (a: Pt[]) => "M" + a.map((p) => f(p[0]) + " " + f(p[1])).join(" L");
  const ticks: string[] = [];
  for (let i = -5; i <= 6; i++) if (i) ticks.push(`M${ox + i * k} ${oy - 4} L${ox + i * k} ${oy + 4}`);
  // cast-shadow projection onto ground plane (up-right)
  const sh = `matrix(1 0 -1.05 0.3 ${f(1.05 * G)} ${f(0.7 * G)})`;
  const sil = `<polygon points="${pts([[150, 350], [540, 350], [540, 640], [150, 640]])}"/>
      <path d="M250 292 L150 ${G} M432 292 L540 ${G} M342 288 L372 ${G - 34}" stroke="${SH}" stroke-width="22" fill="none"/>`;
  return `<svg viewBox="0 0 1300 900" width="100%" style="display:block; overflow:visible;" data-prop="H2">
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
        <path d="${P(bl)}" stroke-width="4.2"/>
        <text x="392" y="422" style="${SERIF}" font-style="italic" font-size="36" fill="#eeebe1" stroke="none" fill-opacity=".9">y = 1/x</text>
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

/* ---------- H3 chalk stick ---------- */
function chalk(u: string) {
  const r = rng(11), cy = 112, R = 34, x0 = 60, x1 = 440, G = cy + R;
  let chip = `M${x1} ${cy - R}`;
  const prof: Pt[] = [[6, -24], [4, -12], [9, -2], [6, 10], [10, 20], [4, 30], [0, 34]];
  prof.forEach((p) => (chip += ` L${x1 + p[0]} ${cy + p[1]}`));
  let dust = "";
  for (let i = 0; i < 220; i++) {
    const a = r(), d = Math.pow(r(), 0.7);
    const x = x1 + 6 + (r() - 0.35) * 80 * d, h = (1 - Math.abs(x - (x1 + 18)) / 50) * 14;
    const y = G - Math.max(0, h) * r() + 1;
    dust += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.6 + r() * 1.6)}" fill="${a > 0.7 ? "#fffaf0" : a > 0.3 ? "#ddd6cb" : "#a59ca6"}"/>`;
  }
  return `<svg viewBox="0 0 760 200" width="100%" style="display:block; overflow:visible;" data-prop="H3">
    <defs>${FX(u)}
      <linearGradient id="${u}cyl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c7186"/><stop offset=".22" stop-color="#b9b0b8"/><stop offset=".55" stop-color="#e9e2d6"/><stop offset=".78" stop-color="#fbf5e8"/><stop offset=".93" stop-color="#e8d2b8"/><stop offset="1" stop-color="#b98f74"/></linearGradient>
      <radialGradient id="${u}cap" cx=".35" cy=".7" r=".8"><stop offset="0" stop-color="#fffaf0"/><stop offset=".7" stop-color="#e9e1d2"/><stop offset="1" stop-color="#c6bcb0"/></radialGradient>
      <linearGradient id="${u}chip" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#cfc5bb"/><stop offset="1" stop-color="#857a8c"/></linearGradient>
      <linearGradient id="${u}csh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${SH}" stop-opacity=".5"/><stop offset="1" stop-color="${SH}" stop-opacity="0"/></linearGradient>
    </defs>
    <polygon points="${pts([[x0, G], [x1 + 8, G], [x1 + 290, G - 46], [x0 + 260, G - 46]])}" fill="url(#${u}csh)" filter="url(#${u}b4)"/>
    <ellipse cx="${(x0 + x1) / 2}" cy="${G}" rx="${(x1 - x0) / 2 + 4}" ry="4" fill="${SH}" opacity=".72" filter="url(#${u}b2)"/>
    <path d="M${x0} ${cy - R} L${x1} ${cy - R} ${chip.slice(chip.indexOf("L"))} L${x0} ${G} Z" fill="url(#${u}cyl)" filter="url(#${u}powder)"/>
    <path d="${chip} L${x1 - 6} ${G} Q ${x1 - 18} ${cy} ${x1 - 4} ${cy - R} Z" fill="url(#${u}chip)" filter="url(#${u}powder)"/>
    <path d="M${x1 + 3} ${cy - 14} L${x1 + 12} ${cy - 4} L${x1 + 6} ${cy + 8}" fill="none" stroke="#fffaf0" stroke-opacity=".5" stroke-width="1.2"/>
    <ellipse cx="${x0}" cy="${cy}" rx="12" ry="${R}" fill="url(#${u}cap)"/>
    <ellipse cx="${x0}" cy="${cy}" rx="12" ry="${R}" fill="none" stroke="#fffaf0" stroke-opacity=".8" stroke-width="1.2" stroke-dasharray="0 52 60 200"/>
    <line x1="${x0}" y1="${G - 1}" x2="${x1}" y2="${G - 1}" stroke="#ff9a60" stroke-opacity=".25" stroke-width="3"/>
    <line x1="${x0}" y1="${cy - R + 0.6}" x2="${x1}" y2="${cy - R + 0.6}" stroke="#3b2f45" stroke-opacity=".6"/>
    <g>${dust}</g>
    </svg>`;
}

/* ---------- H4 dice + fern ---------- */
type Pips = { l: Pt[]; r: Pt[]; t: Pt[] };
function cube(u: string, B: Pt, Lv: Pt, Rv: Pt, Uv: Pt, pips: Pips, tone: number) {
  const A = (p: Pt, v: Pt, k: number): Pt => [p[0] + v[0] * k, p[1] + v[1] * k];
  const BL = A(B, Lv, 1), BR = A(B, Rv, 1), BU = A(B, Uv, 1), LU = A(BL, Uv, 1), RU = A(BR, Uv, 1);
  const face = (o: Pt, a: Pt, b: Pt, fill: string) =>
    `<polygon points="${pts([o, A(o, a, 1), A(A(o, a, 1), b, 1), A(o, b, 1)])}" fill="${fill}" stroke="${fill}" stroke-width="16" stroke-linejoin="round" filter="url(#${u}mottle)"/>`;
  const pip = (o: Pt, a: Pt, b: Pt, list: Pt[], dark?: boolean) =>
    list
      .map(([s, t]) => {
        const m = `matrix(${f(a[0])} ${f(a[1])} ${f(b[0])} ${f(b[1])} ${f(o[0])} ${f(o[1])})`;
        return `<g transform="${m}"><circle cx="${s}" cy="${t}" r=".1" fill="${dark ? "#7a2414" : "#9c2e16"}"/><circle cx="${s + 0.012}" cy="${t - 0.012}" r=".082" fill="${dark ? "#b8401e" : "#e0532a"}"/><circle cx="${s - 0.02}" cy="${t + 0.02}" r=".05" fill="#7a2414" opacity=".5"/></g>`;
      })
      .join("");
  return `<g>
      ${face(B, Rv, Uv, `url(#${u}dR${tone})`)}
      ${face(BU, Lv, Rv, `url(#${u}dT${tone})`)}
      ${face(B, Lv, Uv, `url(#${u}dL${tone})`)}
      ${pip(B, Lv, Uv, pips.l)}${pip(B, Rv, Uv, pips.r, true)}${pip(BU, Lv, Rv, pips.t, true)}
      <path d="M${f(B[0])} ${f(B[1] - 6)} L${f(BU[0])} ${f(BU[1] + 6)}" stroke="#fff8ea" stroke-opacity=".75" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M${f(BL[0] + 4)} ${f(BL[1] - 6)} L${f(B[0] - 4)} ${f(B[1])}" stroke="#ffd0a6" stroke-opacity=".7" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M${f(LU[0] + 6)} ${f(LU[1])} L${f(BU[0] - 4)} ${f(BU[1])}" stroke="#fffaf0" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>
      <path d="M${f(RU[0])} ${f(RU[1] + 8)} L${f(BR[0])} ${f(BR[1] - 8)}" stroke="#2b1c30" stroke-opacity=".5" stroke-width="2.4" stroke-linecap="round"/>
    </g>`;
}
function dice(u: string) {
  const G = 1112;
  const d1 = cube(u, [400, 1108], [-170, -50], [160, -60], [0, -290], { l: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]], r: [[0.3, 0.3], [0.7, 0.7]], t: [] }, 1);
  const d2 = cube(
    u,
    [0, 0],
    [-128, -38],
    [120, -45],
    [0, -218],
    { l: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]], r: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]], t: [[0.3, 0.3], [0.7, 0.7]] },
    2,
  );
  const shM = `matrix(1 0 -0.95 0.26 ${f(0.95 * G)} ${f(0.74 * G)})`;
  return `<div style="position:relative;"><svg viewBox="0 0 1100 1200" width="100%" style="display:block; overflow:visible;" data-prop="H4">
    <defs>${FX(u)}
      <linearGradient id="${u}dL1" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#fbf2e2"/><stop offset=".6" stop-color="#eee2cc"/><stop offset="1" stop-color="#d8c9b2"/></linearGradient>
      <linearGradient id="${u}dT1" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#e0d5c6"/><stop offset=".6" stop-color="#c7bbb2"/><stop offset="1" stop-color="#a99eaa"/></linearGradient>
      <linearGradient id="${u}dR1" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#b8a69c"/><stop offset=".5" stop-color="#8e8291"/><stop offset="1" stop-color="#6c6176"/></linearGradient>
      <linearGradient id="${u}dL2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#fdf4e4"/><stop offset=".6" stop-color="#ecdfca"/><stop offset="1" stop-color="#d2c3ad"/></linearGradient>
      <linearGradient id="${u}dT2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#cfc4b9"/><stop offset="1" stop-color="#968b9b"/></linearGradient>
      <linearGradient id="${u}dR2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#a39299"/><stop offset="1" stop-color="#5d5368"/></linearGradient>
      <linearGradient id="${u}shf" gradientUnits="userSpaceOnUse" x1="400" y1="${G}" x2="1100" y2="900"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <mask id="${u}shm"><rect x="0" y="0" width="1100" height="1200" fill="url(#${u}shf)"/></mask>
    </defs>
    <g mask="url(#${u}shm)" fill="${SH}">
      <g transform="${shM}" filter="url(#${u}b4)">
        <polygon points="230,1058 400,1108 560,1048 560,758 390,708 230,768"/>
        <g transform="translate(790 1110) rotate(35)"><polygon points="-128,-38 0,0 120,-45 120,-263 -8,-301 -128,-256"/></g>
      </g>
    </g>
    <ellipse cx="398" cy="1106" rx="168" ry="13" fill="${SH}" opacity=".72" filter="url(#${u}b4)"/>
    <ellipse cx="790" cy="1111" rx="26" ry="5" fill="${SH}" opacity=".75" filter="url(#${u}b2)"/>
    ${d1}
    <g transform="translate(790 1110) rotate(35)">${d2}</g>
    <ellipse cx="392" cy="764" rx="20" ry="7" fill="#3c2418"/><ellipse cx="392" cy="766" rx="14" ry="4" fill="#1d120c"/>
    </svg></div>`;
}

/**
 * The fern growing out of the top die's pip hole: a Barnsley IFS painted on a canvas above the
 * dice, with its cast shadow on a canvas behind them. Returns a cleanup that removes both.
 */
export function fernPaint(host: HTMLElement) {
  const wrap = host.firstElementChild as HTMLElement | null;
  const svg = host.querySelector("svg");
  if (!wrap || !svg) return () => {};
  const W = 550, H = 600, k = W / 1100;
  const mk = (z: number) => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    c.style.cssText = "position:absolute; left:0; top:0; width:100%; height:100%; pointer-events:none; z-index:" + z;
    return c;
  };
  const fg = mk(2), bg = mk(0);
  svg.style.position = "relative";
  svg.style.zIndex = "1";
  wrap.appendChild(fg);
  wrap.insertBefore(bg, svg);
  const a = fg.getContext("2d"), b = bg.getContext("2d"), r = rng(31);
  if (a && b) {
    const bx = 392, by = 764, sc = 66, rot = 0.2, cr = Math.cos(rot), sr = Math.sin(rot), G = 1112;
    let x = 0, y = 0;
    const col = ["#3f7a5c", "#4f9a72", "#8cc592", "#2f6650"];
    for (let i = 0; i < 70000; i++) {
      const p = r();
      let m: number;
      if (p < 0.01) { m = 0; x = 0; y = 0.16 * y; }
      else if (p < 0.86) { m = 1; const nx = 0.85 * x + 0.04 * y, ny = -0.04 * x + 0.85 * y + 1.6; x = nx; y = ny; }
      else if (p < 0.93) { m = 2; const nx = 0.2 * x - 0.26 * y, ny = 0.23 * x + 0.22 * y + 1.6; x = nx; y = ny; }
      else { m = 3; const nx = -0.15 * x + 0.28 * y, ny = 0.26 * x + 0.24 * y + 0.44; x = nx; y = ny; }
      if (i < 20) continue;
      const X = bx + sc * (x * cr + y * sr), Y = by - sc * (y * cr - x * sr);
      a.fillStyle = r() < 0.025 ? "#efe6cc" : col[m];
      a.globalAlpha = 0.9;
      a.fillRect(X * k, Y * k, 1.2, 1.2);
      if (i % 4 === 0) {
        const h = by - Y + (G - by);
        b.globalAlpha = 0.18;
        b.fillStyle = "#0a0610";
        b.fillRect((X + h * 0.95) * k, (G - h * 0.26) * k, 1.6, 1.6);
      }
    }
  }
  return () => {
    fg.remove();
    bg.remove();
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

export const PROPS = { easel, chalk, dice, orb, fold };
export type PropKind = keyof typeof PROPS;
