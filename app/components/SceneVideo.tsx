"use client";

import { useEffect, useRef } from "react";

const ICON = {
  play: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 21 12 7 20 7 4"/></svg>',
  pause:
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1.2"/><rect x="14" y="4" width="5" height="16" rx="1.2"/></svg>',
  replay:
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/></svg>',
};

const fmt = (s: number) => {
  if (!isFinite(s)) return "0:00";
  s = Math.max(0, Math.floor(s + 0.001));
  return ((s / 60) | 0) + ":" + String(s % 60).padStart(2, "0");
};

/**
 * Player for the Manim-rendered clips. Same markup as CanvasVideo so one set of
 * .gv-* rules dresses both, but the frames come off a real <video>.
 */
export default function SceneVideo({
  scene,
  label,
  autoplay,
  mini,
}: {
  scene: string;
  label?: string;
  /** Start playing on mount and on scrolling into view. */
  autoplay?: boolean;
  /** Chrome-less thumbnail: plays while the pointer is over it. */
  mini?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const vidRef = useRef<HTMLVideoElement>(null);
  const bigRef = useRef<HTMLButtonElement>(null);
  const ppRef = useRef<HTMLButtonElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const v = vidRef.current;
    const big = bigRef.current;
    const pp = ppRef.current;
    const track = trackRef.current;
    const fill = fillRef.current;
    const knob = knobRef.current;
    const time = timeRef.current;
    if (!wrap || !v) return;

    const ui = () => {
      const playing = !v.paused && !v.ended;
      wrap.classList.toggle("paused", !playing);
      wrap.classList.toggle("playing", playing);
      if (big) big.innerHTML = v.ended ? ICON.replay : ICON.play;
      if (pp) pp.innerHTML = playing ? ICON.pause : ICON.play;
      const d = v.duration || 0;
      const pr = d ? (v.currentTime / d) * 100 : 0;
      if (fill) fill.style.width = pr + "%";
      if (knob) knob.style.left = pr + "%";
      if (time) time.textContent = fmt(v.currentTime) + " / " + fmt(d);
    };

    /* a refused autoplay rejects; swallow it so the clip stays on its poster */
    const play = () => void v.play().catch(() => {});
    const toggle = () => {
      if (v.paused || v.ended) play();
      else v.pause();
    };

    const onWrapClick = () => toggle();
    const onBtn = (e: Event) => {
      e.stopPropagation();
      toggle();
    };
    const onEnter = () => play();
    const onLeave = () => {
      v.pause();
      v.currentTime = 0;
      ui();
    };

    const seekEv = (e: PointerEvent) => {
      if (!track || !v.duration) return;
      const r = track.getBoundingClientRect();
      v.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * v.duration;
      ui();
    };
    const onTrackDown = (e: PointerEvent) => {
      if (!track) return;
      e.stopPropagation();
      track.setPointerCapture(e.pointerId);
      wrap.classList.add("scrub");
      seekEv(e);
      const mv = (ev: PointerEvent) => seekEv(ev);
      const up = () => {
        wrap.classList.remove("scrub");
        track.removeEventListener("pointermove", mv);
        track.removeEventListener("pointerup", up);
      };
      track.addEventListener("pointermove", mv);
      track.addEventListener("pointerup", up);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle();
      } else if (e.key === "ArrowRight") {
        v.currentTime = Math.min(v.duration || 0, v.currentTime + 2);
      } else if (e.key === "ArrowLeft") {
        v.currentTime = Math.max(0, v.currentTime - 2);
      }
    };

    if (mini) {
      wrap.addEventListener("pointerenter", onEnter);
      wrap.addEventListener("pointerleave", onLeave);
    } else {
      v.addEventListener("click", onWrapClick);
    }
    big?.addEventListener("click", onBtn);
    pp?.addEventListener("click", onBtn);
    track?.addEventListener("pointerdown", onTrackDown);
    wrap.addEventListener("keydown", onKey);
    for (const ev of ["play", "pause", "ended", "timeupdate", "loadedmetadata"]) {
      v.addEventListener(ev, ui);
    }

    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (en) =>
          en.forEach((x) => {
            if (!x.isIntersecting) {
              if (!v.paused) v.pause();
            } else if (!mini && autoplay && v.currentTime === 0) {
              play();
            }
          }),
        { threshold: 0.08 },
      );
      io.observe(wrap);
    }

    ui();

    return () => {
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointerleave", onLeave);
      v.removeEventListener("click", onWrapClick);
      big?.removeEventListener("click", onBtn);
      pp?.removeEventListener("click", onBtn);
      track?.removeEventListener("pointerdown", onTrackDown);
      wrap.removeEventListener("keydown", onKey);
      for (const ev of ["play", "pause", "ended", "timeupdate", "loadedmetadata"]) {
        v.removeEventListener(ev, ui);
      }
      if (io) io.disconnect();
    };
  }, [scene, autoplay, mini]);

  return (
    <div ref={wrapRef} className={"gv-wrap paused" + (mini ? " mini" : "")} tabIndex={mini ? -1 : 0}>
      <video
        ref={vidRef}
        className="gv-canvas"
        src={`/scenes/${scene}.mp4`}
        poster={`/scenes/${scene}.jpg`}
        preload="metadata"
        playsInline
        muted
        loop={mini}
      >
        Your browser cannot play this clip.
      </video>
      {label ? <span className="gv-tag">{label}</span> : null}
      {mini ? null : (
        <>
          <button ref={bigRef} className="gv-big" aria-label="Play"></button>
          <div className="gv-bar">
            <button ref={ppRef} className="gv-pp" aria-label="Play / pause"></button>
            <div ref={trackRef} className="gv-track">
              <div ref={fillRef} className="gv-fill"></div>
              <div ref={knobRef} className="gv-knob"></div>
            </div>
            <span ref={timeRef} className="gv-time"></span>
          </div>
        </>
      )}
    </div>
  );
}
