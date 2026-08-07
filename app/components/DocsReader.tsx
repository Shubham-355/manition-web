"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { parseStyle } from "../lib/css";
import { Hover } from "./Interactive";
import {
  CATEGORIES,
  POPULAR,
  type Block,
  type Guide,
  type IconKind,
} from "./docs-content";

const iconStroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function icon(kind: IconKind, size: number): ReactNode {
  const a = { width: size, height: size, viewBox: "0 0 24 24", ...iconStroke };
  switch (kind) {
    case "bolt":
      return <svg {...a}><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"></path></svg>;
    case "pen":
      return (
        <svg {...a}>
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
        </svg>
      );
    case "code":
      return (
        <svg {...a}>
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      );
    case "video":
      return (
        <svg {...a}>
          <rect x="2" y="5" width="14" height="14" rx="2"></rect>
          <polygon points="22 7 16 12 22 17"></polygon>
        </svg>
      );
    case "chat":
      return <svg {...a}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
    case "alert":
      return (
        <svg {...a}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      );
  }
}

const arrowRow = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9a9aa2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="M13 6l6 6-6 6"></path>
  </svg>
);

const chevronRow = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c2bdb0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "0 0 auto" }}>
    <path d="M9 6l6 6-6 6"></path>
  </svg>
);

const catCard =
  "cursor:pointer; text-decoration:none; color:inherit; background:#fff; border:1px solid #e6e2da; border-radius:16px; padding:26px; display:block; transition:border-color .15s, transform .15s;";
const catHover = { borderColor: "#c9c4b8", transform: "translateY(-3px)" };
const catH3 = "margin:0 0 7px; font-family:'Space Grotesk'; font-weight:600; font-size:17px;";
const catP = "margin:0 0 14px; font-size:13.5px; line-height:1.6; color:#6b6b73;";
const catCount = "font-family:'IBM Plex Mono',monospace; font-size:11px; color:#9a9aa2;";

type Result = { catId: string; catTitle: string; index: number; guide: Guide };

function blockText(b: Block): string[] {
  if (b.t === "p" || b.t === "tip") return [b.text];
  if (b.t === "s") return b.items;
  return [b.code];
}

export default function DocsReader() {
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [openGuide, setOpenGuide] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openCat) {
        setOpenCat(null);
        setOpenGuide(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openCat]);

  const cat = CATEGORIES.find((c) => c.id === openCat) ?? null;
  const guide = cat && openGuide != null ? cat.guides[openGuide] : null;
  const drawerOpen = !!cat;
  const showArticle = drawerOpen && !!guide;
  const showList = drawerOpen && !guide;

  const openCategory = (id: string) => {
    setOpenCat(id);
    setOpenGuide(null);
  };
  const openGuideAt = (id: string, i: number) => {
    setOpenCat(id);
    setOpenGuide(i);
  };
  const close = () => {
    setOpenCat(null);
    setOpenGuide(null);
  };

  const hasPrev = !!guide && openGuide != null && openGuide > 0;
  const hasNext = !!guide && cat != null && openGuide != null && openGuide < cat.guides.length - 1;

  const q = query.trim().toLowerCase();
  const results = useMemo<Result[]>(() => {
    if (!q) return [];
    const out: Result[] = [];
    for (const c of CATEGORIES) {
      c.guides.forEach((gu, i) => {
        const hay = [gu.title, c.title, ...gu.blocks.flatMap(blockText)].join(" ").toLowerCase();
        if (hay.includes(q)) out.push({ catId: c.id, catTitle: c.title, index: i, guide: gu });
      });
    }
    return out;
  }, [q]);
  const searching = q.length > 0;

  return (
    <>
      {/* header + search */}
      <section style={parseStyle("max-width:820px; margin:0 auto; padding:72px 30px 26px; text-align:center;")}>
        <p style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#3b62e0; margin:0 0 16px;")}>
          Docs
        </p>
        <h1 style={parseStyle("margin:0 auto; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(32px,6.6vw,46px); line-height:1.06; letter-spacing:-0.035em;")}>
          How can we help?
        </h1>
        <form
          onSubmit={(e) => e.preventDefault()}
          style={parseStyle("display:flex; align-items:center; gap:10px; max-width:520px; margin:28px auto 0; background:#fff; border:1px solid #e0dcd2; border-radius:13px; padding:6px 6px 6px 16px; box-shadow:0 2px 8px rgba(24,24,27,0.04);")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9a9aa2" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.2" y2="16.2"></line>
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={"Search guides… e.g. “transparent export”"}
            style={parseStyle("flex:1; border:0; outline:none; background:transparent; font-family:inherit; font-size:14.5px; color:#16161a; padding:9px 0;")}
          />
          {searching ? (
            <Hover
              as="button"
              type="button"
              onClick={() => setQuery("")}
              title="Clear"
              style="flex:0 0 auto; width:34px; height:34px; display:flex; align-items:center; justify-content:center; background:#f2eee6; color:#6b6b73; border:0; border-radius:9px; cursor:pointer;"
              hoverStyle={{ background: "#e6e1d6", color: "#16161a" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Hover>
          ) : (
            <Hover
              as="button"
              type="submit"
              style="background:#16161a; color:#f7f6f3; border:0; border-radius:9px; font-family:inherit; font-size:13.5px; font-weight:600; padding:10px 18px; cursor:pointer;"
              hoverStyle={{ background: "#000" }}
            >
              Search
            </Hover>
          )}
        </form>
      </section>

      {searching ? (
        /* search results */
        <section style={parseStyle("max-width:820px; margin:0 auto; padding:10px 30px 30px;")}>
          <p style={parseStyle("margin:0 0 16px; font-family:'IBM Plex Mono',monospace; font-size:12px; color:#9a9aa2;")}>
            {results.length === 0
              ? `No guides match “${query.trim()}”`
              : `${results.length} ${results.length === 1 ? "guide" : "guides"} for “${query.trim()}”`}
          </p>
          {results.length === 0 ? (
            <div style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:16px; padding:34px 26px; text-align:center;")}>
              <p style={parseStyle("margin:0 0 6px; font-size:15px; font-weight:500; color:#2a2a30;")}>Nothing here yet.</p>
              <p style={parseStyle("margin:0; font-size:13.5px; line-height:1.6; color:#6b6b73;")}>
                Try a different word, or browse the categories by clearing the search.
              </p>
            </div>
          ) : (
            <div style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:16px; overflow:hidden;")}>
              {results.map((r, i) => (
                <Hover
                  key={`${r.catId}-${r.index}`}
                  as="a"
                  onClick={() => openGuideAt(r.catId, r.index)}
                  style={`cursor:pointer; display:flex; align-items:center; gap:14px; padding:16px 22px; text-decoration:none; color:inherit;${i < results.length - 1 ? " border-bottom:1px solid #f2eee6;" : ""}`}
                  hoverStyle={{ background: "#faf8f4" }}
                >
                  <span style={parseStyle("flex:1; min-width:0;")}>
                    <span style={parseStyle("display:block; font-size:14.5px; font-weight:500; color:#26262c;")}>{r.guide.title}</span>
                    <span style={parseStyle("display:block; margin-top:3px; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#9a9aa2;")}>
                      {r.catTitle} · {r.guide.read}
                    </span>
                  </span>
                  {arrowRow}
                </Hover>
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
      {/* doc categories */}
      <section style={parseStyle("max-width:1120px; margin:0 auto; padding:30px 30px 20px;")}>
        <div className="dc-grid" style={parseStyle("display:grid; grid-template-columns:repeat(3,1fr); gap:16px;")}>
          {CATEGORIES.map((c) => (
            <Hover key={c.id} as="a" onClick={() => openCategory(c.id)} style={catCard} hoverStyle={catHover}>
              <div
                style={parseStyle(
                  `width:38px; height:38px; border-radius:10px; background:${c.bg}; color:${c.fg}; display:flex; align-items:center; justify-content:center; margin-bottom:16px;`,
                )}
              >
                {icon(c.icon, 18)}
              </div>
              <h3 style={parseStyle(catH3)}>{c.title}</h3>
              <p style={parseStyle(catP)}>{c.desc}</p>
              <span style={parseStyle(catCount)}>{c.guides.length} guides</span>
            </Hover>
          ))}
        </div>
      </section>

      {/* popular articles */}
      <section style={parseStyle("max-width:820px; margin:0 auto; padding:44px 30px 30px;")}>
        <h2 style={parseStyle("margin:0 0 20px; font-family:'Space Grotesk'; font-weight:700; font-size:22px; letter-spacing:-0.02em;")}>
          Popular right now
        </h2>
        <div style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:16px; overflow:hidden;")}>
          {POPULAR.map((pop, i) => (
            <Hover
              key={pop.n}
              as="a"
              onClick={() => openGuideAt(pop.cat, pop.guide)}
              style={`cursor:pointer; display:flex; align-items:center; gap:14px; padding:17px 22px; text-decoration:none; color:inherit;${i < POPULAR.length - 1 ? " border-bottom:1px solid #f2eee6;" : ""}`}
              hoverStyle={{ background: "#faf8f4" }}
            >
              <span style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#9a9aa2; width:22px;")}>{pop.n}</span>
              <span style={parseStyle("flex:1; font-size:14.5px; font-weight:500; color:#2a2a30;")}>{pop.title}</span>
              {arrowRow}
            </Hover>
          ))}
        </div>
      </section>
        </>
      )}

      {/* docs reader drawer */}
      {drawerOpen && cat && (
        <div style={parseStyle("position:fixed; inset:0; z-index:200; display:flex; justify-content:flex-end;")}>
          <div
            onClick={close}
            style={parseStyle("position:absolute; inset:0; background:rgba(24,24,27,0.42); animation:omDrawerFade .2s ease;")}
          ></div>
          <div style={parseStyle("position:relative; width:min(560px, 94vw); height:100%; background:#fdfcfa; border-left:1px solid #e6e2da; box-shadow:-24px 0 60px rgba(24,24,27,0.14); display:flex; flex-direction:column; animation:omDrawerSlide .24s cubic-bezier(.4,0,.2,1);")}>
            {/* drawer header */}
            <div style={parseStyle("flex:0 0 auto; display:flex; align-items:center; gap:12px; padding:18px 22px; border-bottom:1px solid #eee9df; background:#fdfcfa;")}>
              <span
                style={parseStyle(
                  `width:34px; height:34px; flex:0 0 auto; border-radius:9px; display:flex; align-items:center; justify-content:center; background:${cat.bg}; color:${cat.fg};`,
                )}
              >
                {icon(cat.icon, 16)}
              </span>
              <div style={parseStyle("flex:1; min-width:0; display:flex; align-items:center; gap:7px; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#9a9aa2;")}>
                <span>Docs</span>
                <span>/</span>
                <span style={parseStyle("color:#3b62e0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;")}>{cat.title}</span>
                {showArticle && guide && (
                  <>
                    <span>/</span>
                    <span style={parseStyle("color:#6b6b73; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:150px;")}>{guide.title}</span>
                  </>
                )}
              </div>
              <Hover
                as="button"
                type="button"
                onClick={close}
                title="Close"
                style="flex:0 0 auto; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border:1px solid #e6e2da; background:#fff; border-radius:8px; cursor:pointer; color:#6b6b73;"
                hoverStyle={{ background: "#f2eee6", color: "#16161a" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Hover>
            </div>

            {/* drawer body */}
            <div style={parseStyle("flex:1 1 0; min-height:0; overflow-y:auto; padding:24px 26px 40px;")}>
              {/* list view */}
              {showList && (
                <>
                  <h2 style={parseStyle("margin:0 0 8px; font-family:'Space Grotesk'; font-weight:700; font-size:26px; letter-spacing:-0.025em;")}>{cat.title}</h2>
                  <p style={parseStyle("margin:0 0 6px; font-size:14.5px; line-height:1.6; color:#6b6b73;")}>{cat.desc}</p>
                  <p style={parseStyle("margin:0 0 20px; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#9a9aa2;")}>{cat.guides.length} guides</p>
                  <div style={parseStyle("display:flex; flex-direction:column; border:1px solid #eee9df; border-radius:13px; overflow:hidden; background:#fff;")}>
                    {cat.guides.map((gu, i) => (
                      <Hover
                        key={gu.title}
                        as="a"
                        onClick={() => setOpenGuide(i)}
                        style="cursor:pointer; display:flex; align-items:center; gap:12px; padding:15px 18px; text-decoration:none; color:inherit; border-bottom:1px solid #f4f0e8;"
                        hoverStyle={{ background: "#faf8f4" }}
                      >
                        <span style={parseStyle("flex:1; min-width:0; font-size:14.5px; font-weight:500; color:#26262c;")}>{gu.title}</span>
                        <span style={parseStyle("flex:0 0 auto; font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:#a8a8b0;")}>{gu.read}</span>
                        {chevronRow}
                      </Hover>
                    ))}
                  </div>
                </>
              )}

              {/* article view */}
              {showArticle && guide && (
                <>
                  <Hover
                    as="a"
                    onClick={() => setOpenGuide(null)}
                    style="cursor:pointer; display:inline-flex; align-items:center; gap:6px; margin:0 0 18px; font-size:12.5px; font-weight:500; color:#6b6b73; text-decoration:none;"
                    hoverStyle={{ color: "#16161a" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6"></path>
                    </svg>
                    All {cat.title} guides
                  </Hover>
                  <h2 style={parseStyle("margin:0 0 8px; font-family:'Space Grotesk'; font-weight:700; font-size:27px; line-height:1.15; letter-spacing:-0.025em;")}>{guide.title}</h2>
                  <p style={parseStyle("margin:0 0 22px; font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.04em; color:#a8a8b0;")}>{guide.read}</p>

                  {guide.blocks.map((b, i) => {
                    if (b.t === "p") {
                      return (
                        <p key={i} style={parseStyle("margin:0 0 16px; font-size:15px; line-height:1.72; color:#3a3a42;")}>
                          {b.text}
                        </p>
                      );
                    }
                    if (b.t === "s") {
                      return (
                        <ol key={i} style={parseStyle("margin:0 0 18px; padding-left:22px; color:#3a3a42;")}>
                          {b.items.map((it, j) => (
                            <li key={j} style={parseStyle("margin:0 0 9px; font-size:14.5px; line-height:1.6;")}>{it}</li>
                          ))}
                        </ol>
                      );
                    }
                    if (b.t === "tip") {
                      return (
                        <div key={i} style={parseStyle("display:flex; gap:11px; margin:0 0 18px; padding:14px 16px; background:#eef2fd; border:1px solid #dbe3fb; border-radius:12px;")}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b62e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "0 0 auto", marginTop: "1px" }}>
                            <path d="M9 18h6"></path>
                            <path d="M10 22h4"></path>
                            <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"></path>
                          </svg>
                          <p style={parseStyle("margin:0; font-size:13.5px; line-height:1.6; color:#2f3d78;")}>{b.text}</p>
                        </div>
                      );
                    }
                    return (
                      <pre key={i} style={parseStyle("margin:0 0 18px; padding:15px 16px; background:#0c0c0f; color:#e6e6ea; border-radius:12px; overflow-x:auto; font-family:'IBM Plex Mono',monospace; font-size:12.5px; line-height:1.65; white-space:pre;")}>
                        {b.code}
                      </pre>
                    );
                  })}

                  {(hasPrev || hasNext) && cat && openGuide != null && (
                    <div style={parseStyle("display:flex; align-items:stretch; gap:10px; margin-top:26px; padding-top:20px; border-top:1px solid #eee9df;")}>
                      {hasPrev && (
                        <Hover
                          as="a"
                          onClick={() => setOpenGuide(openGuide - 1)}
                          style="cursor:pointer; flex:1; text-decoration:none; border:1px solid #e6e2da; border-radius:11px; padding:12px 14px; background:#fff;"
                          hoverStyle={{ borderColor: "#c9c4b8" }}
                        >
                          <span style={parseStyle("display:block; font-family:'IBM Plex Mono',monospace; font-size:10px; color:#a8a8b0; margin-bottom:3px;")}>← Previous</span>
                          <span style={parseStyle("display:block; font-size:13px; font-weight:500; color:#26262c;")}>{cat.guides[openGuide - 1].title}</span>
                        </Hover>
                      )}
                      {hasNext && (
                        <Hover
                          as="a"
                          onClick={() => setOpenGuide(openGuide + 1)}
                          style="cursor:pointer; flex:1; text-decoration:none; border:1px solid #e6e2da; border-radius:11px; padding:12px 14px; background:#fff; text-align:right;"
                          hoverStyle={{ borderColor: "#c9c4b8" }}
                        >
                          <span style={parseStyle("display:block; font-family:'IBM Plex Mono',monospace; font-size:10px; color:#a8a8b0; margin-bottom:3px;")}>Next →</span>
                          <span style={parseStyle("display:block; font-size:13px; font-weight:500; color:#26262c;")}>{cat.guides[openGuide + 1].title}</span>
                        </Hover>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
