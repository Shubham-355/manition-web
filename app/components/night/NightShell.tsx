"use client";

import { useRef, type ReactNode } from "react";
import NightNav, { type NavKey } from "./NightNav";
import NightFooter from "./NightFooter";
import { useNightFx, type Tick } from "./fx";
import "./night.css";
import "./pages.css";

/**
 * Frame for an inner night page: nav on top, the last-horizon footer below,
 * grain over everything, and the shared parallax / bob / reveal motion.
 * overflow-x is clipped rather than hidden so sticky children still stick.
 */
export default function NightShell({
  fontClass,
  active = "",
  sky,
  onTick,
  children,
}: {
  fontClass: string;
  active?: NavKey;
  /** The header sky colour, carried into the next page's crossfade. */
  sky: string;
  onTick?: Tick;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  useNightFx(root, sky, onTick);
  return (
    <div ref={root} className={"h3 " + fontClass} style={{ overflowX: "clip" }}>
      <NightNav active={active} />
      {children}
      <NightFooter />
      <div data-grain="1" className="h3-grain" aria-hidden="true" />
    </div>
  );
}
