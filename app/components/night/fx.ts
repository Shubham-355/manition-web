"use client";

import { useEffect, useRef, type RefObject } from "react";

/*
 * Shared atmosphere for the inner night pages (design: site-v3/fx.js): mouse and
 * scroll parallax on [data-par], bobbing on [data-bob], fade-up on [data-reveal],
 * jittering grain, and a quick crossfade from the last page's sky colour.
 * A page can hook extra per-frame work in with onTick.
 */

export type Tick = (t: number, reduce: boolean) => void;

export function useNightFx(rootRef: RefObject<HTMLElement | null>, sky: string, onTick?: Tick) {
  const hook = useRef(onTick);
  useEffect(() => {
    hook.current = onTick;
  }, [onTick]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = (s: string) => Array.from(root.querySelectorAll<HTMLElement>(s));
    const m = { x: innerWidth / 2, y: innerHeight / 2 };
    const onMove = (e: MouseEvent) => {
      m.x = e.clientX;
      m.y = e.clientY;
    };
    addEventListener("mousemove", onMove);

    let els = { par: q("[data-par]"), bob: q("[data-bob]"), grain: root.querySelector<HTMLElement>("[data-grain]") };
    let frame = 0;
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      if (frame++ % 60 === 0) els = { par: q("[data-par]"), bob: q("[data-bob]"), grain: root.querySelector<HTMLElement>("[data-grain]") };
      const t = (performance.now() - t0) / 1000;
      const sy = scrollY;
      const nx = m.x / innerWidth - 0.5;
      const ny = m.y / innerHeight - 0.5;
      els.par.forEach((e) => {
        const d = +(e.getAttribute("data-par") || 0);
        e.style.transform = reduce
          ? "none"
          : "translate(" + (-nx * d * 24).toFixed(1) + "px," + (-ny * d * 12 - Math.min(sy, 900) * d * 0.25).toFixed(1) + "px)";
      });
      if (!reduce)
        els.bob.forEach((e) => {
          const [a, per, ph = 0, rot = 0] = (e.getAttribute("data-bob") || "").split(",").map(Number);
          const w = (t / per) * 6.283 + ph;
          e.style.transform = "translateY(" + (Math.sin(w) * a).toFixed(2) + "px)" + (rot ? " rotate(" + (Math.sin(w + 1) * rot).toFixed(2) + "deg)" : "");
        });
      if (els.grain && !reduce && frame % 5 === 0) els.grain.style.transform = "translate(" + ((Math.random() * 40) | 0) + "px," + ((Math.random() * 40) | 0) + "px)";
      try {
        hook.current?.(t, reduce);
      } catch {}
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    /* fade sections up as they arrive */
    let io: IntersectionObserver | null = null;
    if (!reduce && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (en) =>
          en.forEach((x) => {
            if (!x.isIntersecting) return;
            const e = x.target as HTMLElement;
            e.style.opacity = "1";
            e.style.transform = "none";
            io?.unobserve(e);
          }),
        { threshold: 0.12 },
      );
      q("[data-reveal]").forEach((e) => {
        e.style.opacity = "0";
        e.style.transform = "translateY(18px)";
        e.style.transition = "opacity .8s ease, transform .8s cubic-bezier(.2,.7,.1,1)";
        io?.observe(e);
      });
    }

    /* arriving from another page: wash its sky colour out over this one */
    let veil: HTMLDivElement | null = null;
    let veilTimer = 0;
    try {
      const prev = sessionStorage.getItem("mn-sky");
      if (prev && prev !== sky && !reduce) {
        veil = document.createElement("div");
        veil.style.cssText = "position:fixed;inset:0;z-index:99;pointer-events:none;background:" + prev + ";opacity:1;transition:opacity .4s ease;";
        document.body.appendChild(veil);
        requestAnimationFrame(() => requestAnimationFrame(() => veil && (veil.style.opacity = "0")));
        veilTimer = window.setTimeout(() => veil?.remove(), 600);
      }
      sessionStorage.setItem("mn-sky", sky);
    } catch {}

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("mousemove", onMove);
      io?.disconnect();
      clearTimeout(veilTimer);
      veil?.remove();
    };
  }, [rootRef, sky]);
}
