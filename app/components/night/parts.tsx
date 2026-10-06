import type { ReactNode } from "react";
import Link from "next/link";
import { parseStyle as css } from "../../lib/css";

/* Small pieces every inner night page repeats. */

export const CARD =
  "background:#121214; border:1px solid rgba(237,234,227,.08); box-shadow:inset 0 1px 0 rgba(237,234,227,.07), 0 50px 60px -44px rgba(0,0,0,.95);";

export const EYEBROW = "font-family:'Geist Mono',monospace; letter-spacing:.14em; color:#FF5B1F;";

/** The faint drafting grid the page body sits on, fading in under the header. */
export function GridBg({ children }: { children: ReactNode }) {
  return (
    <div style={css("position:relative; background-color:#0A0A0B; background-image:linear-gradient(rgba(237,234,227,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(237,234,227,.04) 1px, transparent 1px); background-size:56px 56px; background-position:center top;")}>
      <div aria-hidden="true" style={css("position:absolute; left:0; right:0; top:0; height:200px; background:linear-gradient(180deg,#0A0A0B,rgba(10,10,11,0)); pointer-events:none;")} />
      {children}
    </div>
  );
}

/** A star field: the texture tiled across the top of a header sky. */
export function Stars({ place, opacity, size = 900, pos = "", mask = "-webkit-mask-image:linear-gradient(180deg,#000,transparent); mask-image:linear-gradient(180deg,#000,transparent);" }: { place: string; opacity: number; size?: number; pos?: string; mask?: string }) {
  return (
    <div
      aria-hidden="true"
      style={css(`position:absolute; ${place} background-image:url(/v3/stars.webp); background-size:${size}px auto; ${pos} opacity:${opacity}; ${mask} pointer-events:none;`)}
    />
  );
}

/** The ground plane below a header's horizon, with a tint laid over it. */
export function Ground({ top, tint, imgStyle = "" }: { top: string; tint?: string; imgStyle?: string }) {
  return (
    <div aria-hidden="true" style={css(`position:absolute; left:0; right:0; top:${top}; bottom:0; overflow:hidden; pointer-events:none;`)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/v3/ground.webp" alt="" style={css(`position:absolute; left:50%; top:0; width:max(100%,1800px); transform:translateX(-50%); display:block; ${imgStyle}`)} />
      {tint && <div style={css(`position:absolute; inset:0; background:${tint};`)} />}
    </div>
  );
}

/** The orange "Join the waitlist" pill. */
export function JoinCta({ label = "Join the waitlist", size = "15px", pad = "14px 24px", style = "" }: { label?: string; size?: string; pad?: string; style?: string }) {
  return (
    <Link href="/#waitlist" className="h3-cta" style={css(`font-size:${size}; padding:${pad}; ${style}`)}>
      {label} <span>→</span>
    </Link>
  );
}
