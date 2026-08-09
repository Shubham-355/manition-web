"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { clamp } from "./engine";

/**
 * Scenes play in authored order on one looping clock, exactly one mounted at a
 * time. The design's engine also carries the Claude Design host contract (export
 * attributes, timeline write-back, a playback bar); none of that is ported.
 */

export type SceneProps = {
  localTime: number;
  progress: number;
  dur: number;
  index: number;
  count: number;
};

export type SceneDef = {
  name: string;
  dur: number;
  /** Authored length; `dur` retimes the same choreography against it. */
  nat?: number;
};

export default function SceneStage({
  width,
  height,
  scenes,
  bg,
  components,
}: {
  width: number;
  height: number;
  scenes: SceneDef[];
  bg: string;
  components: Record<string, ComponentType<SceneProps>>;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [time, setTime] = useState(0);

  const starts: number[] = [0];
  for (const s of scenes) starts.push(starts[starts.length - 1] + s.dur);
  const total = starts[starts.length - 1];

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      setScale(Math.max(0.02, Math.min(r.width / width, r.height / height)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = 0;
    const step = (ts: number) => {
      if (!last) last = ts;
      const dt = Math.min(0.25, (ts - last) / 1000);
      last = ts;
      setTime((t) => (t + dt) % total);
      raf = requestAnimationFrame(step);
    };
    const start = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
        { threshold: 0 },
      );
      io.observe(el);
    } else {
      start();
    }

    return () => {
      stop();
      if (io) io.disconnect();
    };
  }, [total]);

  let idx = scenes.length - 1;
  for (let i = 0; i < scenes.length; i++) {
    if (time < starts[i + 1]) {
      idx = i;
      break;
    }
  }
  const scene = scenes[idx];
  const wall = clamp(time - starts[idx], 0, scene.dur);
  const nat = scene.nat && scene.nat > 0 ? scene.nat : scene.dur;
  const localTime = scene.dur > 0 ? wall * (nat / scene.dur) : 0;
  const Comp = components[scene.name];

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: bg,
      }}
    >
      <div
        style={{
          position: "relative",
          width,
          height,
          flex: "0 0 auto",
          overflow: "hidden",
          background: bg,
          transform: `scale(${scale})`,
          // Hidden until measured, so the stage never flashes at 1920px.
          visibility: scale ? "visible" : "hidden",
        }}
      >
        {Comp ? (
          <Comp
            key={idx}
            localTime={localTime}
            progress={nat > 0 ? localTime / nat : 0}
            dur={nat}
            index={idx}
            count={scenes.length}
          />
        ) : null}
      </div>
    </div>
  );
}
