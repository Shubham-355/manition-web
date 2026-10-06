"use client";

import { useEffect, useRef, type RefObject } from "react";

/*
 * One requestAnimationFrame loop drives every moving part of the night page:
 * the hero type, the moon's angle, parallax, the swinging archive, the "How it
 * works" plate that plays with scroll, the bobbing props and the cursor dot. The nav and footer animate themselves.
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
      leaf: q("[data-leaf]"),
      bubble: q("[data-bubble]"),
      col: q("[data-col]"),
      hang: q("[data-hang]"),
      word: q<SVGElement>("[data-word]"),
      pex: q<SVGElement>("[data-pex]"),
      pborn: q<SVGElement>("[data-pborn]"),
      st: q<SVGElement>("[data-st]"),
      wave: q<SVGElement>("[data-wave]"),
      door: o("[data-door]"),
      strip: o("[data-strip]"),
      arch: o("[data-arch]"),
      shoot: o("[data-shoot]"),
      fglow: o<SVGElement>("[data-fglow]"),
      flame: o<SVGElement>("[data-flame]"),
      glide: o<SVGElement>("[data-glide]"),
      grain: o("[data-grain]"),
      cur: o("[data-cursor]"),
      curL: o("[data-cursor-label]"),
      ring: o<SVGElement>("[data-ring]"),
      sun: o("[data-sun]"),
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
      els.leaf.forEach((e) => {
        if (reduce) return;
        const i = +(e.getAttribute("data-leaf") || 0);
        const f = (t / 7 + i * 0.33) % 1;
        e.style.transform = "translate(" + f * 120 + "px," + (-f * 60 + Math.sin(f * 12 + i) * 8) + "px) rotate(" + f * 300 + "deg)";
        e.style.opacity = String(f < 0.1 ? f * 10 : 1 - f);
      });

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
        const p = reduce ? 1 : cl((vh * 0.9 - r.top) / (vh * 1.5));
        els.word.forEach((e) => {
          const i = +(e.getAttribute("data-word") || 0);
          e.setAttribute("fill-opacity", p > 0.03 + i * 0.05 ? (1 - i * 0.05).toFixed(2) : "0");
        });
        els.pex.forEach((e, i) => {
          const f = reduce ? 0.3 : (t / 2.4 + i * 0.25) % 1;
          e.setAttribute("transform", "translate(" + f * 34 + "," + (Math.sin(f * 7 + i) * 8 - f * 6) + ")");
          e.setAttribute("opacity", p > 0.03 ? ((1 - f) * 0.8).toFixed(2) : "0");
        });
        const bp = cl((p - 0.31) / 0.08);
        els.pborn.forEach((e, i) => {
          const f = reduce ? 1 : (t / 1.8 + i * 0.2) % 1;
          e.setAttribute("transform", "translate(" + f * 26 + "," + (-f * 14 + Math.sin(f * 6 + i) * 5) + ")");
          e.setAttribute("opacity", (bp * (1 - f) * 0.9).toFixed(2));
        });
        els.fglow?.setAttribute("opacity", (0.35 + 0.65 * cl((p - 0.33) / 0.1)).toFixed(2));
        if (els.flame && !reduce) {
          const s = 1 + 0.03 * Math.sin(t * 3.9) * Math.sin(t * 2.3 + 1);
          const a = Math.sin(t * 4.7) * Math.sin(t * 1.3);
          els.flame.setAttribute("transform", "rotate(" + a.toFixed(2) + " 1200 481) translate(1200 481) scale(" + s.toFixed(3) + ") translate(-1200 -481)");
        }
        const wp = cl((p - 0.42) / 0.24);
        els.wave.forEach((e) => e.setAttribute("stroke-dashoffset", (1 - wp).toFixed(3)));
        els.st.forEach((e) => {
          const i = +(e.getAttribute("data-st") || 0);
          e.setAttribute("opacity", cl((p - [0.67, 0.75, 0.83][i]) / 0.06).toFixed(2));
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
        if (c > 5.4) op = (c - 5.4) / 0.4;
        else if (l >= 0 && l < 1.2) {
          const k = l / 1.2;
          y = -24 * k;
          op = 1 - k;
        } else if (l >= 1.2) op = 0;
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
      if (els.sun && !reduce && !joinedRef.current) els.sun.style.translate = "0 " + (Math.sin((t / 6) * 6.28) * 3).toFixed(2) + "px";
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
