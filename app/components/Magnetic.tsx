"use client";

import { useRef, type ReactNode } from "react";

/** Pulls its child toward the cursor. Checked per event so a device that gains a mouse still works. */
export default function Magnetic({
  children,
  strength = 0.3,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const allowed = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <span
      ref={ref}
      className={className ? `mag ${className}` : "mag"}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || !allowed()) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
      }}
      onPointerLeave={() => {
        const el = ref.current;
        if (el) el.style.transform = "";
      }}
    >
      {children}
    </span>
  );
}
