"use client";

import { useEffect, useRef, type RefObject } from "react";

/*
 * One requestAnimationFrame loop drives every moving part of the night page:
 * the hero type, the moon's angle, parallax, the swinging archive, the "How it
 * works" plate that plays with scroll, the bobbing and tilting props and the cursor dot. The nav and footer animate themselves.
 * Elements opt in with data-* attributes, so the markup stays plain.
 */

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const cl = (x: number) => Math.min(1, Math.max(0, x));
const nums = (s: string | null) => (s || "").split(",").map(Number);

export function useNightMotion(rootRef: RefObject<HTMLElement | null>, joined: boolean) {
  const joinedRef = useRef(joined);
  useEffect(() => {
    joinedRef.current = joined;
  }, [joined]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = <E extends Element = HTMLElement>(s: string) => Array.from(root.querySelectorAll<E>(s));
    const o = <E extends Element = HTMLElement>(s: string) => root.querySelector<E>(s);

    const els = {
      type: q("[data-type]"),
      float: q("[data-float]"),
      bob: q("[data-bob]"),
      dot: q("[data-dot]"),
      par: q("[data-par]"),
      tilt: q("[data-tilt]"),
      glow: q("[data-glow]"),
      bubble: q("[data-bubble]"),
      col: q("[data-col]"),
      hang: q("[data-hang]"),
      word: q<SVGElement>("[data-word]"),
      pex: q<SVGElement>("[data-pex]"),
      pborn: q<SVGElement>("[data-pborn]"),
      fs: q<SVGElement>("[data-fs]"),
      wave: q<SVGElement>("[data-wave]"),
      door: o("[data-door]"),
      strip: o("[data-strip]"),
      arch: o("[data-arch]"),
      shoot: o("[data-shoot]"),
      fglow: o<SVGElement>("[data-fglow]"),
      flame: o<SVGElement>("[data-flame]"),
      glide: o<SVGElement>("[data-fglide]"),
      grain: o("[data-grain]"),
      cur: o("[data-cursor]"),
      curL: o("[data-cursor-label]"),
      ring: o<SVGElement>("[data-ring]"),
      glass: o("[data-prop=\"I1-I3\"]"),
      qlight: o<SVGSVGElement>("[data-qlight]"),
      moon: {} as Record<string, SVGElement>,
    };
    q<SVGElement>("[data-moon]").forEach((e) => (els.moon[e.getAttribute("data-moon") || ""] = e));

    const m = { x: innerWidth / 2, y: innerHeight / 2, cx: innerWidth / 2, cy: innerHeight / 2, mode: "dot", seen: false };
    const onMove = (e: MouseEvent) => {
      m.x = e.clientX;
      m.y = e.clientY;
      m.seen = true;
      const t = e.target as Element | null;
      m.mode = t?.closest ? (t.closest("[data-play]") ? "play" : t.closest("a,button,input") ? "link" : "dot") : "dot";
    };
    window.addEventListener("mousemove", onMove);

    const near0 = new WeakMap<Element, number>();
    let rise = 0;
    let ql: Light | null = null;
    let frame = 0;
    let raf = 0;
    const t0 = performance.now();

    const tick = () => {
      frame++;
      const t = (performance.now() - t0) / 1000;
      const sy = window.scrollY;
      const vh = innerHeight;
      const mob = innerWidth < 768;
      const nx = m.x / innerWidth - 0.5;
      const ny = m.y / vh - 0.5;

      /* hero: "Say it." types in, "Watch it move." floats up, and "move." peels off on scroll */
      els.type.forEach((e) => {
        const i = +(e.getAttribute("data-type") || 0);
        e.style.opacity = reduce || t > 0.2 + i * 0.09 ? "1" : "0";
      });
      els.float.forEach((e) => {
        const i = +(e.getAttribute("data-float") || 0);
        const p = reduce ? 1 : ease((t - (0.95 + i * 0.05)) / 1.3);
        let y = (1 - p) * 46 + (reduce ? 0 : Math.sin(t * (0.5 + (i % 5) * 0.11) + i * 1.7) * 3.2);
        let r = 0;
        let op = p;
        const pl = e.getAttribute("data-peel");
        if (pl !== null && !reduce) {
          const k = Math.max(0, sy - 30) * (0.5 + +pl * 0.28);
          y -= k;
          r = -k * 0.06 * (+pl % 2 ? 1 : -1);
          op *= cl(1 - k / (vh * 0.5));
        }
        e.style.transform = "translateY(" + y + "px) rotate(" + r + "deg)";
        e.style.opacity = String(op);
      });

      const out = cl(sy / (vh * 0.75));
      els.par.forEach((e) => {
        const d = +(e.getAttribute("data-par") || 0);
        const px = reduce ? 0 : -nx * d * 26;
        const py = reduce ? 0 : -ny * d * 14;
        const lift = reduce ? 0 : -sy * d * 0.35;
        e.style.transform = "translate(" + (px + (d > 0.4 ? out * d * 40 : 0)) + "px," + (py + lift) + "px)";
        e.style.opacity = String(1 - out * 0.9);
      });

      /* the board and dice lean toward the pointer and warm up as it comes near */
      els.tilt.forEach((e) => {
        const [d, base] = nums(e.getAttribute("data-tilt"));
        const r = e.getBoundingClientRect();
        const dx = (m.x - (r.left + r.width / 2)) / r.width;
        const dy = (m.y - (r.top + r.height / 2)) / r.height;
        const near = m.seen && !mob ? cl(1 - Math.hypot(dx, dy) / 1.1) : 0;
        const n = (near0.get(e) || 0) + (near - (near0.get(e) || 0)) * 0.08;
        near0.set(e, n);
        const k = reduce ? 0 : 1;
        const ry = nx * d * 9 * k, rx = -ny * d * 5 * k, lift = -n * 8 * k;
        e.style.transform = "translateY(" + base + "%) perspective(1100px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateY(" + lift.toFixed(1) + "px)";
        const img = e.querySelector<HTMLElement>("img,[data-prop]");
        if (img) img.style.filter = "drop-shadow(0 0 " + (16 + n * 26).toFixed(0) + "px rgba(255,120,60," + (0.1 + n * 0.24).toFixed(2) + ")) brightness(" + (1 + n * 0.08).toFixed(3) + ")";
      });
      els.glow.forEach((e) => (e.style.filter = "drop-shadow(0 0 " + (14 + 6 * Math.sin(t * 1.3)).toFixed(1) + "px rgba(255,200,140,.28))"));

      els.bob.forEach((e) => {
        const [a, per, ph] = nums(e.getAttribute("data-bob"));
        const y = reduce ? 0 : Math.sin((t / per) * Math.PI * 2 + ph) * a;
        e.style.transform = "translateY(" + y + "px)";
        const sh = e.nextElementSibling as HTMLElement | null;
        if (sh?.hasAttribute("data-bobsh")) {
          sh.style.transform = "skewX(-40deg) scale(" + (1 - y / 40) + ")";
          sh.style.opacity = String(0.6 + y / 30);
        }
      });
      if (els.ring && !reduce) els.ring.style.strokeDashoffset = String(-(t * 60) % 460);

      /* the moon is a unit circle: the radius turns, its cosine drips to the ground */
      const M = els.moon;
      if (M.r) {
        const th = reduce ? 0.9 : 0.35 + t * 0.2;
        const cx = 300, cy = 270, R = 250;
        const px = cx + R * Math.cos(th);
        const py = cy - R * Math.sin(th);
        M.r.setAttribute("x2", String(px));
        M.r.setAttribute("y2", String(py));
        M.pt.setAttribute("cx", String(px));
        M.pt.setAttribute("cy", String(py));
        M.cos.setAttribute("x2", String(px));
        const top = Math.min(py, 640);
        const h = String(Math.max(0, 640 - top));
        M.drip.setAttribute("x", String(px - 1.1));
        M.drip.setAttribute("y", String(top));
        M.drip.setAttribute("height", h);
        M.dripglow.setAttribute("x", String(px - 4));
        M.dripglow.setAttribute("y", String(top));
        M.dripglow.setAttribute("height", h);
        const rp = reduce ? 0.5 : (t * 0.6) % 1;
        M.ripple.setAttribute("cx", String(px));
        M.ripple.setAttribute("rx", String(4 + rp * 26));
        M.ripple.setAttribute("ry", String(1 + rp * 5));
        M.ripple.setAttribute("stroke-opacity", String(1 - rp));
        const a = th % (Math.PI * 2);
        const ax = cx + 52 * Math.cos(a);
        const ay = cy - 52 * Math.sin(a);
        M.arc.setAttribute("d", "M" + (cx + 52) + " " + cy + " A52 52 0 " + (a > Math.PI ? 1 : 0) + " 0 " + ax + " " + ay);
      }
      /* the door widens as it comes into view */
      if (els.door) {
        const r = els.door.getBoundingClientRect();
        const p = mob || reduce ? 1 : ease((vh - r.top) / (vh * 0.9));
        els.door.style.maxWidth = (66 + 34 * p).toFixed(2) + "%";
      }

      /* How it works: scroll through the plate - words, lantern, wave, plane */
      if (els.strip) {
        const r = els.strip.getBoundingClientRect();
        const p = reduce ? 1 : cl((vh * 0.9 - r.top) / (vh * 0.95));
        els.word.forEach((e) => {
          const i = +(e.getAttribute("data-word") || 0);
          e.setAttribute("fill-opacity", p > 0.03 + i * 0.05 ? (i === 5 ? 0.75 : 1 - i * 0.05).toFixed(2) : "0");
        });
        els.pex.forEach((e, i) => {
          const f = reduce ? 0.3 : (t / 2.4 + i * 0.25) % 1;
          e.setAttribute("transform", "translate(" + f * 34 + "," + (Math.sin(f * 7 + i) * 8 - f * 6) + ")");
          e.setAttribute("opacity", p > 0.03 ? ((1 - f) * 0.8).toFixed(2) : "0");
        });
        const bp = cl((p - 0.31) / 0.08);
        els.pborn.forEach((e, i) => {
          const f = reduce ? 0.5 : (t / 1.8 + i * 0.13) % 1;
          e.setAttribute("transform", "translate(" + f * 34 + "," + (Math.sin(f * 6 + i) * 6 - f * 4) + ")");
          e.setAttribute("opacity", (bp * (1 - f) * 0.95).toFixed(2));
        });
        els.fglow?.setAttribute("opacity", (0.35 + 0.65 * cl((p - 0.33) / 0.1)).toFixed(2));
        if (els.flame && !reduce) {
          const s = 1 + 0.03 * Math.sin(t * 3.9) * Math.sin(t * 2.3 + 1);
          const a = Math.sin(t * 4.7) * Math.sin(t * 1.3);
          els.flame.setAttribute("transform", "rotate(" + a.toFixed(2) + " 1200 481) translate(1200 481) scale(" + s.toFixed(3) + ") translate(-1200 -481)");
        }
        const wp = cl((p - 0.42) / 0.24);
        els.wave.forEach((e) => e.setAttribute("stroke-dashoffset", (1 - wp).toFixed(3)));
        els.fs.forEach((e) => {
          const i = +(e.getAttribute("data-fs") || 0);
          e.setAttribute("opacity", cl((p - [0.67, 0.75, 0.83][i]) / 0.035).toFixed(2));
        });
        if (els.glide) {
          const g = cl((p - 0.9) / 0.1);
          els.glide.setAttribute("transform", "translate(" + (g * 75).toFixed(1) + "," + (-g * 75).toFixed(1) + ")");
        }
        els.col.forEach((e) => {
          const i = +(e.getAttribute("data-col") || 0);
          const on = p >= [0.03, 0.4, 0.8][i];
          e.style.opacity = on ? "1" : "0.15";
          e.style.transform = on ? "none" : "translateY(14px)";
        });
      }

      /* the archive drops in on its strings, then sways with the pointer */
      if (els.arch) {
        const ar = els.arch.getBoundingClientRect();
        const k = reduce ? 1 : cl((vh - ar.top) / (vh * 0.7));
        const c1 = 1.2, c3 = c1 + 1;
        const eb = 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
        els.hang.forEach((e) => {
          const [d, per, ph] = nums(e.getAttribute("data-hang"));
          const sw = reduce ? 0 : 1.5 * Math.sin((t / per) * 6.283 + ph);
          const px = reduce ? 0 : -nx * d * 40;
          const py = reduce ? 0 : -ny * d * 22;
          e.style.transform = "translate(" + px.toFixed(1) + "px," + (py - 32 * (1 - eb)).toFixed(1) + "px) rotate(" + sw.toFixed(2) + "deg)";
        });
        if (els.shoot) {
          const c = (t % 15) / 1.1;
          if (!reduce && c < 1 && ar.bottom > 0 && ar.top < vh) {
            const W = ar.width, H = ar.height;
            const x0 = W * 0.72, y0 = H * 0.12, x1 = W * 0.4, y1 = H * 0.3;
            const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
            els.shoot.style.transformOrigin = "0 50%";
            els.shoot.style.transform = "translate(" + (x0 + (x1 - x0) * c) + "px," + (y0 + (y1 - y0) * c) + "px) rotate(" + ang + "deg)";
            els.shoot.style.opacity = Math.sin(c * Math.PI).toFixed(2);
          } else els.shoot.style.opacity = "0";
        }
      }

      els.dot.forEach((e) => {
        if (reduce) return;
        const i = +(e.getAttribute("data-dot") || 0);
        const c = t % 5.8;
        const l = c - i * 0.3;
        let y = 0;
        let op = 1;
        if (l >= 0 && l < 1.2) {
          const k = l / 1.2;
          if (k < 0.6) {
            y = -24 * (k / 0.6);
            op = 1 - k / 0.6;
          } else op = (k - 0.6) / 0.4;
        }
        e.style.transform = "translateY(" + y.toFixed(1) + "px)";
        e.style.opacity = op.toFixed(2);
      });
      els.bubble.forEach((e) => {
        if (reduce) return;
        const i = +(e.getAttribute("data-bubble") || 0);
        const f = (t / (3 + i * 0.6) + i * 0.27) % 1;
        e.style.transform = "translate(" + Math.sin(f * 9 + i) * 3 + "px," + -f * 70 + "px)";
        e.style.opacity = String(f > 0.85 ? (1 - f) / 0.15 : 0.9);
      });
      /* the sun bobs in the glass, and rises out of the water once you join */
      if (els.glass) {
        const j = joinedRef.current;
        rise += ((j ? 1 : 0) - rise) * (reduce ? 1 : 0.03);
        const y = (-396 * rise + (reduce || j ? 0 : Math.sin((t / 6) * 6.28) * 8)).toFixed(1);
        els.glass.querySelectorAll("[data-sunmove]").forEach((g) => g.setAttribute("transform", "translate(0 " + y + ")"));
      }
      if (frame % 90 === 1) ql = layoutLight(els.qlight);
      if (ql) driftMotes(ql, reduce ? 0 : t);
      if (els.grain && !reduce && frame % 5 === 0) els.grain.style.transform = "translate(" + ((Math.random() * 40) | 0) + "px," + ((Math.random() * 40) | 0) + "px)";

      if (els.cur) {
        m.cx += (m.x - m.cx) * 0.16;
        m.cy += (m.y - m.cy) * 0.16;
        const s = m.mode === "play" ? 64 : m.mode === "link" ? 4 : 10;
        els.cur.style.opacity = m.seen ? "1" : "0";
        els.cur.style.transform = "translate(" + m.cx + "px," + m.cy + "px)";
        els.cur.style.width = els.cur.style.height = s + "px";
        els.cur.style.margin = -s / 2 + "px 0 0 " + -s / 2 + "px";
        els.cur.style.background = m.mode === "play" ? "rgba(10,10,11,.35)" : "#FF5B1F";
        if (els.curL) els.curL.style.opacity = m.mode === "play" ? "1" : "0";
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [rootRef]);
}

type P2 = [number, number];
type Light = { C: P2; U: P2; L: P2; pc: P2; rx: number; tb: [number, number, number, number]; motes: SVGElement[] };

/*
 * Lays the quiet room's lamp light out in section pixels. The shade turns (25-30deg beam) so its centre
 * line lands on the floor under "explain"; a conic cone runs from the shade opening to a pool there.
 * Re-run now and then so it follows resizes.
 */
function layoutLight(svg: SVGSVGElement | null): Light | null {
  const sec = svg?.parentElement;
  const box = sec?.querySelector<HTMLElement>("[data-qlamp]");
  const txt = sec?.querySelector<HTMLElement>(".h3-qtext");
  if (!svg || !sec || !box || !txt || !box.offsetWidth || !svg.getBoundingClientRect().width) return null;
  const sr = sec.getBoundingClientRect(), k = sec.offsetWidth / sr.width, W = sec.offsetWidth, H = sec.offsetHeight;
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  const lr = box.getBoundingClientRect(), tr = txt.getBoundingClientRect();
  const lx = (lr.left - sr.left) * k, ly = (lr.top - sr.top) * k, ls = (lr.width * k) / 600;
  const P = (x: number, y: number): P2 => [lx + x * ls, ly + y * ls];
  const tx = (tr.left - sr.left) * k, ty = (tr.top - sr.top) * k, tw = tr.width * k, th = tr.height * k;
  // target: the floor point centred under "explain"
  let px = tx + tw * 0.45;
  const tn = Array.from(txt.querySelectorAll("span")).map((e) => e.firstChild).find((n) => n?.nodeType === 3 && n.textContent?.includes("explain"));
  if (tn) {
    const r = document.createRange(), i = tn.textContent!.indexOf("explain");
    r.setStart(tn, i);
    r.setEnd(tn, i + 7);
    const rr = r.getBoundingClientRect();
    px = (rr.left + rr.width / 2 - sr.left) * k;
  }
  const rx = Math.max(120, tw * 0.28), ry = rx / 3.5, floorMax = H - ry * 0.7, minY = ty + th + ry * 0.6;
  // the shade turns about the arm joint; its beam centre line sits deg + 66 below horizontal
  const open = (deg: number) => {
    const A = (deg * Math.PI) / 180, ca = Math.cos(A), sa = Math.sin(A);
    return { ox: 272 + 102 * ca - 116 * sa, oy: 146 + 102 * sa + 116 * ca, B: ((deg + 14) * Math.PI) / 180 };
  };
  const tan = (d: number) => Math.tan((d * Math.PI) / 180);
  let beam = 28, o = open(beam - 66), C = P(o.ox, o.oy), py = C[1] + (px - C[0]) * tan(beam);
  for (let it = 0; it < 8; it++) {
    o = open(beam - 66);
    C = P(o.ox, o.oy);
    const need = (Math.atan2(Math.max(minY, Math.min(floorMax, py)) - C[1], px - C[0]) * 180) / Math.PI;
    beam = Math.max(25, Math.min(30, need));
    py = C[1] + (px - C[0]) * tan(beam);
  }
  py = Math.max(minY, Math.min(floorMax, py));
  const ex = 112 * Math.cos(o.B), ey = 112 * Math.sin(o.B);
  box.querySelector("[data-shade]")?.setAttribute("transform", "rotate(" + (beam - 66).toFixed(2) + " 272 146)");
  const gl = box.querySelector<HTMLElement>("[data-qglow]");
  if (gl) {
    gl.style.left = ((o.ox - 48) / 6).toFixed(2) + "%";
    gl.style.top = ((o.oy - 48) / 11).toFixed(2) + "%";
  }
  const U = P(o.ox + ex, o.oy + ey), L = P(o.ox - ex, o.oy - ey);
  const pc: P2 = [C[0] + (py - C[1]) / tan(beam), py];
  layoutCone(sec, U, L, rx, pc, ry);
  return { C, U, L, pc, rx, tb: [tx - 24, ty - 24, tx + tw + 24, ty + th + 24], motes: Array.from(svg.querySelectorAll<SVGElement>("[data-mote]")) };
}

/* the cone is a conic gradient from a virtual apex behind the shade, so it is as wide as the shade there and as the pool at the floor */
function layoutCone(sec: HTMLElement, U: P2, L: P2, rx: number, pc: P2, ry: number) {
  const el = sec.querySelector<HTMLElement>("[data-qcone]");
  if (!el) return;
  const C = [(U[0] + L[0]) / 2, (U[1] + L[1]) / 2], w0 = Math.hypot(U[0] - L[0], U[1] - L[1]) / 2;
  const cx = pc[0] - C[0], cy = pc[1] - C[1], k0 = w0 / Math.max(1, rx - w0);
  const O = [C[0] - cx * k0, C[1] - cy * k0];
  const ax = pc[0] - O[0], ay = pc[1] - O[1], D = Math.hypot(ax, ay), ux = ax / D, uy = ay / D;
  const h = (Math.atan(rx / D) * 180) / Math.PI;
  const dS = Math.hypot(C[0] - O[0], C[1] - O[1]);
  const f = Math.min(h * 0.6, ((36 / ((dS + D) / 2)) * 180) / Math.PI); // ~70px feather across each side mid-beam
  const R = D + ry * 2 + 40, c = "#F4E9D0", z = "rgba(244,233,208,0)";
  Object.assign(el.style, {
    left: O[0] - R + "px",
    top: O[1] + "px",
    width: 2 * R + "px",
    height: R + "px",
    transform: "rotate(" + Math.atan2(-ux, uy) + "rad)",
    background: "conic-gradient(from " + (180 - h - f) + "deg at 50% 0%, " + z + " 0deg, " + c + " " + 2 * f + "deg, " + c + " " + 2 * h + "deg, " + z + " " + (2 * h + 2 * f) + "deg, " + z + " 360deg)",
  });
  const pct = (v: number) => ((Math.max(0, Math.min(R, v)) / R) * 100).toFixed(2) + "%";
  const m = "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) " + pct(dS - 4) + ", rgba(0,0,0,.22) " + pct(dS + 14) + ", rgba(0,0,0,.14) " + pct((dS + D) / 2) + ", rgba(0,0,0,.08) " + pct(D) + ", rgba(0,0,0,0) " + pct(D + ry * 1.8) + ")";
  el.style.webkitMaskImage = m;
  el.style.maskImage = m;
  const pool = sec.querySelector<HTMLElement>("[data-qpool]");
  if (pool)
    Object.assign(pool.style, {
      left: pc[0] - rx * 1.25 + "px",
      top: pc[1] - ry * 1.25 + "px",
      width: rx * 2.5 + "px",
      height: ry * 2.5 + "px",
      background: "radial-gradient(closest-side, rgba(244,233,208,.10), rgba(244,233,208,.06) 45%, rgba(244,233,208,.02) 75%, rgba(244,233,208,0))",
    });
}

/* dust drifting slowly down the cone, brightest mid-beam */
function driftMotes(q: Light, t: number) {
  const ax = q.pc[0] - q.C[0], ay = q.pc[1] - q.C[1], len = Math.hypot(ax, ay), nx = -ay / len, ny = ax / len;
  const w0 = Math.hypot(q.U[0] - q.L[0], q.U[1] - q.L[1]) / 2;
  q.motes.forEach((m, i) => {
    const s = 0.1 + (((i * 0.618) % 1 + t * 0.006 * (1 + (i % 3))) % 1) * 0.78;
    const half = w0 + (q.rx - w0) * s, lat = (((i * 0.37) % 1) - 0.5) * 0.6 + 0.06 * Math.sin(t * 0.35 + i * 1.7);
    const x = q.C[0] + ax * s + nx * lat * half, y = q.C[1] + ay * s + ny * lat * half + 6 * Math.sin(t * 0.2 + i);
    m.setAttribute("cx", x.toFixed(1));
    m.setAttribute("cy", y.toFixed(1));
    // motes fade out over the text so they never sit on the letters
    const b = q.tb, dx = Math.max(b[0] - x, 0, x - b[2]), dy = Math.max(b[1] - y, 0, y - b[3]), away = Math.min(1, Math.hypot(dx, dy) / 30);
    m.setAttribute("opacity", ((0.2 + ((i * 3) % 5) * 0.05) * Math.sin(Math.PI * ((s - 0.1) / 0.78)) * away).toFixed(2));
  });
}
