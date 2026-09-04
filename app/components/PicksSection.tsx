"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Reveal from "./Reveal";
import GalleryVideo from "./GalleryVideo";

export type Pick = { scene: string; title: string; prompt: string };

const chevron = (dir: "left" | "right") => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}></path>
  </svg>
);

export default function PicksSection({ picks }: { picks: Pick[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const last = picks.length - 1;

  // without this the settle handler reads position mid-flight and the two loop
  const lockUntil = useRef(0);
  const firstRun = useRef(true);

  // in an effect, not the click handler: the lead tile must be laid out before we can scroll to it
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // never on mount, or the page jumps down to this section
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const tile = el.children[active] as HTMLElement | undefined;
    if (!tile) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lockUntil.current = Date.now() + 900;
    tile.scrollIntoView({ inline: "start", block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [active]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (Date.now() < lockUntil.current) return;
        // against the content edge: offsetLeft vs scrollLeft is off by the whole inset
        const box = el.getBoundingClientRect();
        const edge = box.left + parseFloat(getComputedStyle(el).paddingLeft || "0");
        let nearest = 0;
        let best = Infinity;
        for (let i = 0; i < el.children.length; i++) {
          const d = Math.abs((el.children[i] as HTMLElement).getBoundingClientRect().left - edge);
          if (d < best) {
            best = d;
            nearest = i;
          }
        }
        setActive(nearest);
      }, 150);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <section className="hm-picks">
      <div className="hm-wrap hm-picks-head">
        <div>
          <h2 className="hm-h2">People asked for these.</h2>
          <p className="hm-lede">One sentence each. This is what came back.</p>
        </div>

        <div className="hm-picks-nav">
          <button
            type="button"
            className="hm-picks-btn"
            onClick={() => setActive((i) => Math.max(0, i - 1))}
            disabled={active === 0}
            aria-label="Previous scene"
          >
            {chevron("left")}
          </button>
          {active === last ? (
            <Link href="/gallery" className="hm-picks-btn hm-picks-go">
              All 63 {chevron("right")}
            </Link>
          ) : (
            <button
              type="button"
              className="hm-picks-btn"
              onClick={() => setActive((i) => Math.min(last, i + 1))}
              aria-label="Next scene"
            >
              {chevron("right")}
            </button>
          )}
        </div>
      </div>

      <div className="hm-strip" ref={ref}>
        {picks.map((p, i) => (
          <Reveal key={p.scene} className={i === active ? "hm-pick is-lead rvm-unmask" : "hm-pick rvm-unmask"}>
            <div className="hm-pick-frame">
              <GalleryVideo scene={p.scene} />
            </div>
            <div className="hm-pick-swap">
              <p className="a">{p.title}</p>
              <p className="b">{p.prompt}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
