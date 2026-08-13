"use client";

import { useEffect, useRef, useState } from "react";
import { parseStyle } from "../lib/css";

const PROMPTS = [
  "build a square wave from spinning circles",
  "unroll a sine wave from a circle",
  "trace the Lorenz attractor in 3D",
  "rotate a vector under a 2×2 matrix",
];

export default function HeroPrompt() {
  const [text, setText] = useState(PROMPTS[0]);
  const [blink, setBlink] = useState(true);
  const at = useRef({ prompt: 0, chars: PROMPTS[0].length, deleting: true });

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let t: ReturnType<typeof setTimeout>;
    const type = () => {
      const s = at.current;
      const full = PROMPTS[s.prompt % PROMPTS.length];
      if (s.deleting) {
        s.chars -= 1;
        if (s.chars <= 0) {
          s.deleting = false;
          s.prompt += 1;
          s.chars = 0;
          setText("");
          t = setTimeout(type, 380);
          return;
        }
        setText(full.slice(0, s.chars));
        t = setTimeout(type, 16);
        return;
      }
      s.chars += 1;
      setText(full.slice(0, s.chars));
      if (s.chars >= full.length) {
        s.deleting = true;
        t = setTimeout(type, 2100);
        return;
      }
      t = setTimeout(type, 36);
    };

    t = setTimeout(type, 2400);
    const b = setInterval(() => setBlink((v) => !v), 530);
    return () => {
      clearTimeout(t);
      clearInterval(b);
    };
  }, []);

  return (
    <div
      style={parseStyle(
        "display:inline-flex; align-items:center; gap:9px; width:392px; max-width:100%; box-sizing:border-box; background:#fff; border:1px solid #e6e2da; border-radius:100px; padding:8px 16px 8px 13px; font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#4b4b52; box-shadow:0 1px 2px rgba(24,24,27,0.04); margin-bottom:26px; overflow:hidden;",
      )}
    >
      <span style={parseStyle("color:#3b62e0; font-weight:500; flex:none;")}>&gt;</span>
      <span style={parseStyle("display:inline-flex; align-items:center; gap:3px; min-width:0; flex:1; white-space:nowrap;")}>
        <span style={parseStyle("overflow:hidden; text-overflow:clip;")}>{text}</span>
        <span
          style={{
            ...parseStyle("display:inline-block; flex:none; width:6px; height:13px; background:#c2bcae;"),
            opacity: blink ? 1 : 0,
          }}
        ></span>
      </span>
    </div>
  );
}
