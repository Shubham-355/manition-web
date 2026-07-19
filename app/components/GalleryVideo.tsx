"use client";

import { useEffect, useRef } from "react";
import { SCENES } from "./gallery-scenes";

const ICON = {
  play: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 21 12 7 20 7 4"/></svg>',
  pause:
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1.2"/><rect x="14" y="4" width="5" height="16" rx="1.2"/></svg>',
  replay:
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/></svg>',
};

/**
 * Canvas video player for a single gallery clip — the React port of the
 * design's <gallery-video> web component. Playback (play / pause / scrub /
 * keyboard / autopause-when-offscreen) is driven imperatively against refs so
 * the animation loop never re-renders React.
 */
export default function GalleryVideo({
  scene: sceneName,
  label,
}: {
  scene: string;
  label?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bigRef = useRef<HTMLButtonElement>(null);
  const ppRef = useRef<HTMLButtonElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const cv = canvasRef.current;
    const big = bigRef.current;
    const pp = ppRef.current;
    const track = trackRef.current;
    const fill = fillRef.current;
    const knob = knobRef.current;
    const time = timeRef.current;
    if (!wrap || !cv || !big || !pp || !track || !fill || !knob || !time) return;
    const g = cv.getContext("2d");
    if (!g) return;

    const sc = SCENES[sceneName] || SCENES.sine;
    const T = sc.T;

    let t = 0,
      playing = false,
      started = false,
      ended = false,
      raf = 0,
      last = 0,
      W = 0,
      H = 0,
      dpr = 1;

    const fmt = (s: number) => {
      s = Math.max(0, Math.floor(s + 0.001));
      return ((s / 60) | 0) + ":" + String(s % 60).padStart(2, "0");
    };

    const ui = () => {
      wrap.classList.toggle("paused", !playing);
      wrap.classList.toggle("playing", playing);
      big.innerHTML = ended ? ICON.replay : ICON.play;
      pp.innerHTML = playing ? ICON.pause : ICON.play;
      const pr = ((started ? t : 0) / T) * 100;
      fill.style.width = pr + "%";
      knob.style.left = pr + "%";
      time.textContent = fmt(started ? t : 0) + " / " + fmt(T);
    };

    const draw = () => {
      if (!W || !H) return;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = "#0a0a0d";
      g.fillRect(0, 0, cv.width, cv.height);
      const s = Math.min(W / 320, H / 200);
      g.setTransform(dpr * s, 0, 0, dpr * s, (dpr * (W - 320 * s)) / 2, (dpr * (H - 200 * s)) / 2);
      const bg = g.createRadialGradient(160, 84, 10, 160, 100, 235);
      bg.addColorStop(0, "#16161f");
      bg.addColorStop(1, "#0a0a0d");
      g.fillStyle = bg;
      g.fillRect(-30, -30, 380, 260);
      g.globalAlpha = 1;
      g.setLineDash([]);
      g.textAlign = "left";
      sc.draw.call(sc, g, started ? t : sc.poster);
      ui();
    };

    const size = () => {
      const r = wrap.getBoundingClientRect();
      W = r.width;
      H = r.height;
      if (!W || !H) return;
      dpr = Math.min(2.5, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      draw();
    };

    const step = (ts: number) => {
      if (!playing) return;
      const dt = Math.min(0.1, (ts - last) / 1000);
      last = ts;
      t = Math.min(T, t + dt);
      if (t >= T) {
        playing = false;
        ended = true;
      }
      draw();
      if (playing) raf = requestAnimationFrame(step);
    };

    const play = () => {
      if (playing) return;
      if (!started) t = 0;
      if (ended) {
        t = 0;
        ended = false;
      }
      started = true;
      playing = true;
      last = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(step);
      ui();
    };

    const pause = () => {
      playing = false;
      cancelAnimationFrame(raf);
      ui();
    };

    const toggle = () => (playing ? pause() : play());

    const onCanvasClick = () => toggle();
    const onBig = (e: Event) => {
      e.stopPropagation();
      toggle();
    };
    const onPp = (e: Event) => {
      e.stopPropagation();
      toggle();
    };

    const seekEv = (e: PointerEvent) => {
      const r = track.getBoundingClientRect();
      t = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * T;
      started = true;
      if (t < T) ended = false;
      draw();
    };
    const onTrackDown = (e: PointerEvent) => {
      e.stopPropagation();
      track.setPointerCapture(e.pointerId);
      wrap.classList.add("scrub");
      seekEv(e);
      const mv = (ev: PointerEvent) => seekEv(ev);
      const up = () => {
        wrap.classList.remove("scrub");
        track.removeEventListener("pointermove", mv);
        track.removeEventListener("pointerup", up);
        if (t >= T && !playing) {
          ended = true;
          ui();
        }
      };
      track.addEventListener("pointermove", mv);
      track.addEventListener("pointerup", up);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle();
      } else if (e.key === "ArrowRight") {
        t = Math.min(T, t + 2);
        started = true;
        draw();
      } else if (e.key === "ArrowLeft") {
        t = Math.max(0, t - 2);
        started = true;
        ended = false;
        draw();
      }
    };

    cv.addEventListener("click", onCanvasClick);
    big.addEventListener("click", onBig);
    pp.addEventListener("click", onPp);
    track.addEventListener("pointerdown", onTrackDown);
    wrap.addEventListener("keydown", onKey);

    const ro = new ResizeObserver(size);
    ro.observe(wrap);

    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (en) =>
          en.forEach((x) => {
            if (!x.isIntersecting && playing) pause();
          }),
        { threshold: 0.08 },
      );
      io.observe(wrap);
    }

    size();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw());

    return () => {
      cancelAnimationFrame(raf);
      cv.removeEventListener("click", onCanvasClick);
      big.removeEventListener("click", onBig);
      pp.removeEventListener("click", onPp);
      track.removeEventListener("pointerdown", onTrackDown);
      wrap.removeEventListener("keydown", onKey);
      ro.disconnect();
      if (io) io.disconnect();
    };
  }, [sceneName]);

  return (
    <div ref={wrapRef} className="gv-wrap paused" tabIndex={0}>
      <canvas ref={canvasRef} className="gv-canvas"></canvas>
      {label ? <span className="gv-tag">{label}</span> : null}
      <button ref={bigRef} className="gv-big" aria-label="Play"></button>
      <div className="gv-bar">
        <button ref={ppRef} className="gv-pp" aria-label="Play / pause"></button>
        <div ref={trackRef} className="gv-track">
          <div ref={fillRef} className="gv-fill"></div>
          <div ref={knobRef} className="gv-knob"></div>
        </div>
        <span ref={timeRef} className="gv-time"></span>
      </div>
    </div>
  );
}
