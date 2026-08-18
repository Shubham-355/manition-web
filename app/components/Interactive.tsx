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
  ariaPressed,
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
  ariaPressed?: boolean;
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
      aria-pressed={ariaPressed}
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
        style={parseStyle(
          "display:inline-flex; align-items:center; gap:11px; background:#14211a; border:1px solid #2a4a35; color:#8fe0a6; border-radius:13px; padding:16px 24px; font-size:15px;",
        )}
      >
        <span
          style={parseStyle(
            "width:22px; height:22px; border-radius:50%; background:#2f7a4a; color:#fff; display:flex; align-items:center; justify-content:center; font-size:13px;",
          )}
        >
          ✓
        </span>
        {state.alreadyOn ? (
          <>
            You&apos;re already on the list. We&apos;ll email{" "}
            <strong style={parseStyle("color:#f7f6f3; font-weight:600;")}>
              {state.email}
            </strong>{" "}
            when it&apos;s your turn.
          </>
        ) : (
          <>
            You&apos;re on the list! We&apos;ll email{" "}
            <strong style={parseStyle("color:#f7f6f3; font-weight:600;")}>
              {state.email}
            </strong>{" "}
            soon.
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <form
        action={formAction}
        style={parseStyle(
          "display:flex; flex-wrap:wrap; gap:11px; justify-content:center; max-width:520px; margin:0 auto;",
        )}
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
          placeholder="you@example.com"
          aria-label="Email address"
          style={{
            ...parseStyle(
              "flex:1; min-width:240px; box-sizing:border-box; background:#17171c; border:1px solid #2c2c33; border-radius:12px; color:#f4f4f5; font-family:inherit; font-size:15px; padding:15px 17px; outline:none;",
            ),
            ...(focused
              ? {
                  borderColor: "#3b62e0",
                  boxShadow: "0 0 0 3px rgba(59,98,224,0.2)",
                }
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
              "flex:0 0 auto; background:#3b62e0; color:#fff; border:0; border-radius:12px; font-family:inherit; font-size:15px; font-weight:600; padding:15px 26px; cursor:pointer; transition:background .15s;",
            ),
            ...(btnHover && !pending ? { background: "#2f4fc0" } : {}),
            ...(pending ? { opacity: 0.6, cursor: "progress" } : {}),
          }}
        >
          {pending ? "Joining…" : "Join the waitlist"}
        </button>
      </form>
      {state.status === "error" && (
        <p
          role="alert"
          style={parseStyle(
            "margin:14px 0 0; font-size:13.5px; color:#e0918a;",
          )}
        >
          {state.message}
        </p>
      )}
    </>
  );
}

export { arrowIcon };
