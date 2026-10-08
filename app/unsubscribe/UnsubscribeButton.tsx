"use client";

import { useState, useTransition } from "react";
import { parseStyle } from "../lib/css";
import { leaveWaitlist } from "../actions/waitlist";

export default function UnsubscribeButton({ token }: { token: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<"none" | "done" | "failed">("none");
  const [hover, setHover] = useState(false);

  if (result === "done") {
    return (
      <p
        style={parseStyle(
          "margin:0; font-size:15px; line-height:1.6; color:#EDEAE3; font-weight:500;",
        )}
      >
        Done. You have been removed from the waitlist and will not hear from us again.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() =>
          startTransition(async () => {
            const { ok } = await leaveWaitlist(token);
            setResult(ok ? "done" : "failed");
          })
        }
        style={{
          ...parseStyle(
            "background:#FF5B1F; color:#0A0A0B; border:0; border-radius:100px; font-family:inherit; font-size:15px; font-weight:600; padding:14px 24px; cursor:pointer; transition:background .15s;",
          ),
          ...(hover && !pending ? { background: "#ff7d4a" } : {}),
          ...(pending ? { opacity: 0.6, cursor: "progress" } : {}),
        }}
      >
        {pending ? "Removing…" : "Leave the waitlist"}
      </button>
      {result === "failed" && (
        <p
          role="alert"
          style={parseStyle(
            "margin:14px 0 0; font-size:13.5px; color:#ff9a7a;",
          )}
        >
          That link is no longer valid. Reply to the email you received and we
          will remove you by hand.
        </p>
      )}
    </div>
  );
}
