"use client";

import {
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import Link from "next/link";
import { parseStyle } from "../lib/css";

/**
 * A single element that merges a hover style over its base style while the
 * pointer is over it — the runtime equivalent of the design's `style-hover`.
 * Internal ("/…") hrefs render through next/link for client-side navigation.
 */
export function Hover({
  as = "div",
  style,
  hoverStyle,
  href,
  title,
  className,
  children,
}: {
  as?: ElementType;
  style: string;
  hoverStyle: CSSProperties;
  href?: string;
  title?: string;
  className?: string;
  children?: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const isInternal = typeof href === "string" && href.startsWith("/");
  const Tag: ElementType = isInternal ? Link : as;
  const base = parseStyle(style);
  return (
    <Tag
      href={href}
      title={title}
      className={className}
      style={hovered ? { ...base, ...hoverStyle } : base}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [joinedEmail, setJoinedEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  if (joined) {
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
        You&apos;re on the list! We&apos;ll email{" "}
        <strong style={parseStyle("color:#f7f6f3; font-weight:600;")}>
          {joinedEmail}
        </strong>{" "}
        soon.
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const em = email.trim();
        if (!em) return;
        setJoined(true);
        setJoinedEmail(em);
      }}
      style={parseStyle(
        "display:flex; flex-wrap:wrap; gap:11px; justify-content:center; max-width:520px; margin:0 auto;",
      )}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="you@example.com"
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
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        style={{
          ...parseStyle(
            "flex:0 0 auto; background:#3b62e0; color:#fff; border:0; border-radius:12px; font-family:inherit; font-size:15px; font-weight:600; padding:15px 26px; cursor:pointer; transition:background .15s;",
          ),
          ...(btnHover ? { background: "#2f4fc0" } : {}),
        }}
      >
        Join the waitlist
      </button>
    </form>
  );
}

export { arrowIcon };
