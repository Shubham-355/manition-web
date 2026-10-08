"use client";

import { useActionState, useEffect, useState } from "react";
import { parseStyle } from "../lib/css";
import { joinWaitlist, type WaitlistState } from "../actions/waitlist";

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

/* The input uses border longhands, not the `border` shorthand: React warns when a
   focus style removes `borderColor` while a shorthand still sets it. */
const TONES = {
  night: {
    chip: "margin-top:32px; background:rgba(255,91,31,.08); border:1px solid rgba(255,91,31,.4); color:#EDEAE3; border-radius:100px;",
    strong: "color:#EDEAE3;",
    input: "background:#0A0A0B; border-width:1px; border-style:solid; border-color:rgba(237,234,227,.16); border-radius:100px; color:#EDEAE3;",
    focus: { borderColor: "#FF5B1F", boxShadow: "0 0 0 3px rgba(255,91,31,.2)" },
    button: "background:#FF5B1F; color:#0A0A0B; border-radius:100px; font-weight:500;",
    buttonHover: "#EDEAE3",
    error: "#ff9a7a",
    align: "margin:32px 0 0; max-width:500px;",
  },
  /* the night form sitting inside a card, flush with the copy above it */
  nightCard: {
    chip: "background:rgba(255,91,31,.08); border:1px solid rgba(255,91,31,.4); color:#EDEAE3; border-radius:100px;",
    strong: "color:#EDEAE3;",
    input: "background:#0A0A0B; border-width:1px; border-style:solid; border-color:rgba(237,234,227,.16); border-radius:100px; color:#EDEAE3;",
    focus: { borderColor: "#FF5B1F", boxShadow: "0 0 0 2px rgba(255,91,31,.35)" },
    button: "background:#FF5B1F; color:#0A0A0B; border-radius:100px;",
    buttonHover: "#ff7d4a",
    error: "#ff9a7a",
    align: "margin:0; max-width:460px;",
  },
} as const;

const CHECK: Record<keyof typeof TONES, string> = {
  night: "background:#FF5B1F; color:#0A0A0B;",
  nightCard: "background:#FF5B1F; color:#0A0A0B;",
};

/**
 * Waitlist form with the design's join → confirmed states (the `sc-if`
 * joined / notJoined branches).
 */
export function WaitlistForm({
  source = "/",
  tone = "night",
  onJoined,
}: {
  source?: string;
  tone?: keyof typeof TONES;
  /** Called once the server confirms the email is on the list. */
  onJoined?: () => void;
}) {
  const t = TONES[tone];
  const [state, formAction, pending] = useActionState<WaitlistState, FormData>(
    joinWaitlist,
    { status: "idle" },
  );
  const [focused, setFocused] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const joined = state.status === "joined";

  useEffect(() => {
    if (joined) onJoined?.();
  }, [joined, onJoined]);

  if (state.status === "joined") {
    return (
      <div
        className="hm-wl-joined"
        style={parseStyle(
          `display:inline-flex; align-items:center; gap:11px; max-width:100%; padding:14px 22px; font-size:15px; line-height:1.5; text-align:left; ${t.chip}`,
        )}
      >
        <span
          style={parseStyle(
            `flex:none; width:22px; height:22px; border-radius:50%; ${CHECK[tone]} display:flex; align-items:center; justify-content:center; font-size:13px;`,
          )}
        >
          ✓
        </span>
        {/* one child, or each run of text becomes its own flex item on a nowrap row */}
        <span>
          {state.alreadyOn ? (
            <>
              You are already on the list. We will email{" "}
              <strong style={parseStyle(`font-weight:600; overflow-wrap:anywhere; ${t.strong}`)}>{state.email}</strong>{" "}
              when it is your turn.
            </>
          ) : (
            <>
              You are on the list. We will email{" "}
              <strong style={parseStyle(`font-weight:600; overflow-wrap:anywhere; ${t.strong}`)}>{state.email}</strong>.
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
        style={parseStyle(`display:flex; gap:10px; max-width:460px; ${t.align}`)}
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
              `flex:1 1 auto; min-width:0; box-sizing:border-box; font-family:inherit; font-size:16px; padding:15px 22px; outline:none; ${t.input}`,
            ),
            ...(focused ? t.focus : {}),
          }}
        />
        <button
          type="submit"
          disabled={pending}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          style={{
            ...parseStyle(
              `flex:none; display:inline-flex; align-items:center; gap:8px; border:0; font-family:inherit; font-size:16px; font-weight:600; padding:15px 26px; cursor:pointer; transition:background .45s var(--ease-out); ${t.button}`,
            ),
            ...(btnHover && !pending ? { background: t.buttonHover } : {}),
            ...(pending ? { opacity: 0.6, cursor: "progress" } : {}),
          }}
        >
          {pending ? "Joining…" : "Join"}
          {pending ? null : arrowIcon}
        </button>
      </form>
      {state.status === "error" && (
        <p role="alert" style={parseStyle(`margin:14px 0 0; font-size:13.5px; color:${t.error};`)}>
          {state.message}
        </p>
      )}
    </>
  );
}

