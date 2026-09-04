"use client";

import {
  useActionState,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import Link from "next/link";
import { parseStyle } from "../lib/css";
import { joinWaitlist, type WaitlistState } from "../actions/waitlist";

/**
 * A single element that merges a hover style over its base style while the
 * pointer is over it — the runtime equivalent of the design's `style-hover`.
 * Internal ("/…") hrefs render through next/link for client-side navigation.
 */
// Split so React is never removing `borderColor` while a `border` shorthand stays.
function splitBorder(base: CSSProperties, hoverStyle: CSSProperties): CSSProperties {
  if (!("borderColor" in hoverStyle) || typeof base.border !== "string") return base;
  const parts = /^(\S+)\s+(\S+)\s+(.+)$/.exec(base.border.trim());
  if (!parts) return base;
  const next = { ...base, borderWidth: parts[1], borderStyle: parts[2], borderColor: parts[3] };
  delete next.border;
  return next;
}

export function Hover({
  as = "div",
  style,
  hoverStyle,
  href,
  title,
  type,
  onClick,
  className,
  ariaLabel,
  ariaExpanded,
  children,
}: {
  as?: ElementType;
  style: string;
  hoverStyle: CSSProperties;
  href?: string;
  title?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  children?: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const isInternal = typeof href === "string" && href.startsWith("/");
  const Tag: ElementType = isInternal ? Link : as;
  const base = splitBorder(parseStyle(style), hoverStyle);
  return (
    <Tag
      href={href}
      title={title}
      type={type}
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      style={hovered ? { ...base, ...hoverStyle } : base}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {children}
    </Tag>
  );
}

const arrowIcon = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14"></path>
    <path d="M13 6l6 6-6 6"></path>
  </svg>
);

/**
 * Waitlist form with the design's join → confirmed states (the `sc-if`
 * joined / notJoined branches).
 */
export function WaitlistForm({ source = "/" }: { source?: string }) {
  const [state, formAction, pending] = useActionState<WaitlistState, FormData>(
    joinWaitlist,
    { status: "idle" },
  );
  const [focused, setFocused] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  if (state.status === "joined") {
    return (
      <div
        className="hm-wl-joined"
        style={parseStyle(
          "display:inline-flex; align-items:center; gap:11px; margin-top:26px; max-width:100%; background:#eef7f1; border:1px solid #cfe6d8; color:#276b45; border-radius:100px; padding:14px 22px; font-size:15px; line-height:1.5; text-align:left;",
        )}
      >
        <span
          style={parseStyle(
            "flex:none; width:22px; height:22px; border-radius:50%; background:#2f7a4a; color:#fff; display:flex; align-items:center; justify-content:center; font-size:13px;",
          )}
        >
          ✓
        </span>
        {/* one child, or each run of text becomes its own flex item on a nowrap row */}
        <span>
          {state.alreadyOn ? (
            <>
              You are already on the list. We will email{" "}
              <strong style={parseStyle("color:#16161a; font-weight:600; overflow-wrap:anywhere;")}>{state.email}</strong>{" "}
              when it is your turn.
            </>
          ) : (
            <>
              You are on the list. We will email{" "}
              <strong style={parseStyle("color:#16161a; font-weight:600; overflow-wrap:anywhere;")}>{state.email}</strong>.
            </>
          )}
        </span>
      </div>
    );
  }

  return (
    <>
      <form
        action={formAction}
        className="hm-wl-form"
        style={parseStyle("display:flex; gap:10px; max-width:460px; margin:26px auto 0;")}
      >
        <input type="hidden" name="source" value={source} />
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={parseStyle(
            "position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0;",
          )}
        />
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="your email"
          aria-label="Email address"
          style={{
            ...parseStyle(
              "flex:1 1 auto; min-width:0; box-sizing:border-box; background:#f7f6f3; border:1px solid #e2ded4; border-radius:100px; color:#16161a; font-family:inherit; font-size:16px; padding:15px 22px; outline:none;",
            ),
            ...(focused
              ? { borderColor: "#3b62e0", boxShadow: "0 0 0 3px rgba(59,98,224,0.16)" }
              : {}),
          }}
        />
        <button
          type="submit"
          disabled={pending}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          style={{
            ...parseStyle(
              "flex:none; display:inline-flex; align-items:center; gap:8px; background:#16161a; color:#f7f6f3; border:0; border-radius:100px; font-family:inherit; font-size:16px; font-weight:600; padding:15px 26px; cursor:pointer; transition:background .15s;",
            ),
            ...(btnHover && !pending ? { background: "#000" } : {}),
            ...(pending ? { opacity: 0.6, cursor: "progress" } : {}),
          }}
        >
          {pending ? "Joining…" : "Join"}
          {pending ? null : arrowIcon}
        </button>
      </form>
      {state.status === "error" && (
        <p role="alert" style={parseStyle("margin:14px 0 0; font-size:13.5px; color:#c2564b;")}>
          {state.message}
        </p>
      )}
    </>
  );
}

export { arrowIcon };
