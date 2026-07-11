import { parseStyle } from "../lib/css";

// Fourier partial-sum paths, ported from the design's buildWaves().
function buildWave(terms: number[]): string {
  const pts: string[] = [];
  for (let i = 0; i < 160; i++) {
    const p = i / 159;
    const x = 46 + 388 * p;
    const t = -Math.PI + 2 * Math.PI * p;
    let sum = 0;
    terms.forEach((n) => {
      sum += Math.sin(n * t) / n;
    });
    const y = 150 - 64 * (4 / Math.PI) * sum * 0.82;
    pts.push((i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1));
  }
  return pts.join(" ");
}

export default function IntroDemo({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const wave1 = buildWave([1]);
  const wave2 = buildWave([1, 3]);
  const wave3 = buildWave([1, 3, 5, 7]);
  const light = theme === "light";
  const capTitle = light ? "#16161a" : "#e4e4e7";
  const capSub = light ? "#6b6b73" : "#71717a";
  const chapLabel = light ? "#3f3f46" : "#d4d4d8";

  const videoSvg = (withVertical: boolean) => (
    <svg
      viewBox="0 0 480 300"
      preserveAspectRatio={withVertical ? "xMidYMid meet" : "xMidYMid slice"}
      style={parseStyle("position:absolute; inset:0; width:100%; height:100%;")}
    >
      <line x1="46" y1="150" x2="434" y2="150" stroke="#232329" strokeWidth="1"></line>
      {withVertical && (
        <line x1="240" y1="44" x2="240" y2="256" stroke="#232329" strokeWidth="1"></line>
      )}
      <path
        pathLength={100}
        d={wave1}
        fill="none"
        stroke="#7ea6d9"
        strokeWidth="2.4"
        strokeLinecap="round"
        style={parseStyle("stroke-dasharray:100; opacity:0; animation:mvW1 26s linear infinite;")}
      ></path>
      <path
        pathLength={100}
        d={wave2}
        fill="none"
        stroke="#7ea6d9"
        strokeWidth="2.4"
        strokeLinecap="round"
        style={parseStyle("stroke-dasharray:100; opacity:0; animation:mvW2 26s linear infinite;")}
      ></path>
      <path
        pathLength={100}
        d={wave3}
        fill="none"
        stroke="#7ea6d9"
        strokeWidth="2.4"
        strokeLinecap="round"
        style={parseStyle("stroke-dasharray:100; opacity:0; animation:mvW3 26s linear infinite;")}
      ></path>
    </svg>
  );

  return (
    <div
      style={parseStyle(
        "width:100%; display:flex; flex-direction:column; align-items:center; font-family:'Space Grotesk','IBM Plex Sans',ui-sans-serif,system-ui;",
      )}
    >
      {/* mock app window */}
      <div
        style={parseStyle(
          "position:relative; width:min(560px, 100%); animation:mv-float 9s ease-in-out infinite;",
        )}
      >
        <div
          style={parseStyle(
            "position:absolute; inset:-48px -70px; background:radial-gradient(50% 55% at 50% 45%, rgba(126,166,217,0.08) 0%, rgba(9,9,11,0) 70%); pointer-events:none;",
          )}
        ></div>
        <div
          style={parseStyle(
            "position:relative; width:100%; box-sizing:border-box; border:1px solid #26262c; border-radius:15px; background:rgba(13,13,16,0.92); box-shadow:0 32px 80px rgba(0,0,0,0.45), 0 2px 0 rgba(255,255,255,0.03) inset; overflow:hidden; backdrop-filter:blur(6px);",
          )}
        >
          {/* title bar */}
          <div
            style={parseStyle(
              "display:flex; align-items:center; gap:7px; padding:11px 14px; border-bottom:1px solid #1c1c21; background:rgba(20,20,24,0.8);",
            )}
          >
            <span style={parseStyle("width:9px; height:9px; border-radius:50%; background:#33343a;")}></span>
            <span style={parseStyle("width:9px; height:9px; border-radius:50%; background:#33343a;")}></span>
            <span style={parseStyle("width:9px; height:9px; border-radius:50%; background:#33343a;")}></span>
            <span
              style={parseStyle(
                "flex:1; text-align:center; font-size:11px; color:#5b5b63; letter-spacing:0.02em;",
              )}
            >
              Manition
            </span>
            <span style={parseStyle("width:43px;")}></span>
          </div>

          {/* stage */}
          <div style={parseStyle("position:relative; aspect-ratio:16/10; overflow:hidden;")}>
            {/* continuous app UI (screen recording) */}
            <div
              style={parseStyle(
                "position:absolute; inset:0; display:flex; flex-direction:column; transform-origin:50% 48%; animation:mv-ui 26s linear infinite, mv-zoom 26s linear infinite;",
              )}
            >
              {/* messages */}
              <div style={parseStyle("flex:1 1 0; min-height:0; overflow:hidden; position:relative;")}>
                <div
                  style={parseStyle(
                    "padding:12px 14px 0; display:flex; flex-direction:column; gap:8px;",
                  )}
                >
                  {/* user message */}
                  <div
                    style={parseStyle(
                      "align-self:flex-end; max-width:80%; background:#1f1f24; border:1px solid #2c2c33; border-radius:10px 10px 3px 10px; padding:7px 11px; max-height:44px; overflow:hidden; opacity:0; animation:mv-bub 26s linear infinite, mv-fold2 26s cubic-bezier(.45,0,.2,1) infinite;",
                    )}
                  >
                    <p style={parseStyle("margin:0; font-size:10.5px; line-height:1.5; color:#e4e4e7;")}>
                      Show how a square wave emerges from sine waves
                    </p>
                  </div>

                  {/* assistant code card */}
                  <div
                    style={parseStyle(
                      "border:1px solid #26262c; border-radius:10px; overflow:hidden; background:#0f0f12; opacity:0; animation:mv-code 26s linear infinite;",
                    )}
                  >
                    <div
                      style={parseStyle(
                        "display:flex; align-items:center; gap:8px; padding:5px 6px 5px 12px; background:#17171b; border-bottom:1px solid #26262c;",
                      )}
                    >
                      <span
                        style={parseStyle(
                          "font-family:'IBM Plex Mono',monospace; font-size:9.5px; color:#71717a;",
                        )}
                      >
                        scene.py
                      </span>
                      <span
                        style={parseStyle(
                          "position:relative; display:block; flex:1; height:12px; font-size:9.5px;",
                        )}
                      >
                        <span
                          style={parseStyle(
                            "position:absolute; inset:0; text-align:right; color:#71717a; opacity:0; animation:mvG1 26s linear infinite;",
                          )}
                        >
                          writing scene…
                        </span>
                        <span
                          style={parseStyle(
                            "position:absolute; inset:0; text-align:right; color:#8fc9a0; opacity:0; animation:mvG2 26s linear infinite;",
                          )}
                        >
                          ✓ scene ready
                        </span>
                      </span>
                      <span
                        style={parseStyle(
                          "display:inline-flex; align-items:center; gap:5px; border:1px solid #2c2c33; border-radius:7px; padding:4px 9px; font-size:9.5px; font-weight:600; color:#a1a1aa; animation:mv-run 26s linear infinite;",
                        )}
                      >
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="6 3 20 12 6 21"></polygon>
                        </svg>
                        Run
                      </span>
                    </div>
                    <div
                      style={parseStyle(
                        "padding:9px 13px; max-height:96px; overflow:hidden; font-family:'IBM Plex Mono',monospace; font-size:10px; line-height:1.75; color:#b0b0b8; animation:mv-fold 26s cubic-bezier(.45,0,.2,1) infinite;",
                      )}
                    >
                      <div style={parseStyle("opacity:0; animation:mv-line 26s linear infinite;")}>
                        <span style={parseStyle("color:#8f7ab8;")}>from</span> manim{" "}
                        <span style={parseStyle("color:#8f7ab8;")}>import</span> *
                      </div>
                      <div
                        style={parseStyle(
                          "opacity:0; animation:mv-line 26s linear infinite; animation-delay:0.35s;",
                        )}
                      >
                        <span style={parseStyle("color:#8f7ab8;")}>class</span>{" "}
                        <span style={parseStyle("color:#c9a86b;")}>SquareWave</span>(Scene):
                      </div>
                      <div
                        style={parseStyle(
                          "opacity:0; animation:mv-line 26s linear infinite; animation-delay:0.7s;",
                        )}
                      >
                        &nbsp;&nbsp;&nbsp;&nbsp;<span style={parseStyle("color:#8f7ab8;")}>def</span>{" "}
                        <span style={parseStyle("color:#7ea6d9;")}>construct</span>(self):
                      </div>
                      <div
                        style={parseStyle(
                          "opacity:0; animation:mv-line 26s linear infinite; animation-delay:1.05s;",
                        )}
                      >
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;curve = axes.plot(np.sin)
                      </div>
                      <div
                        style={parseStyle(
                          "opacity:0; animation:mv-line 26s linear infinite; animation-delay:1.4s;",
                        )}
                      >
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.play(Create(curve))
                        <span
                          style={parseStyle(
                            "display:inline-block; width:5px; height:10px; background:#a1a1aa; vertical-align:-1px; margin-left:4px; animation:mv-caret 1s steps(1) infinite;",
                          )}
                        ></span>
                      </div>
                    </div>
                  </div>

                  {/* render slot → video */}
                  <div
                    style={parseStyle(
                      "position:relative; width:100%; box-sizing:border-box; aspect-ratio:16/6.6; max-height:clamp(80px, 32.5vw - 182px, 240px); flex:0 0 auto; border:1px solid #26262c; border-radius:10px; overflow:hidden; background:#000; opacity:0; animation:mv-slot 26s linear infinite;",
                    )}
                  >
                    <div
                      style={parseStyle(
                        "position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; opacity:0; animation:mv-rend 26s linear infinite;",
                      )}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        style={parseStyle("width:16px; height:16px; animation:mn-spin .9s linear infinite;")}
                      >
                        <circle cx="12" cy="12" r="10" stroke="#2b2b31" strokeWidth="4"></circle>
                        <path d="M4 12a8 8 0 018-8" stroke="#a1a1aa" strokeWidth="4" strokeLinecap="round"></path>
                      </svg>
                      <p style={parseStyle("margin:9px 0 0; font-size:10.5px; font-weight:600; color:#d4d4d8;")}>
                        Rendering animation…
                      </p>
                      <div
                        style={parseStyle(
                          "width:150px; margin-top:9px; height:3px; border-radius:99px; background:#222227; overflow:hidden;",
                        )}
                      >
                        <div
                          style={parseStyle(
                            "height:100%; width:0%; border-radius:99px; background:#a1a1aa; animation:mv-prog 26s linear infinite;",
                          )}
                        ></div>
                      </div>
                      <div
                        style={parseStyle(
                          "position:relative; width:100%; height:12px; margin-top:8px; font-family:'IBM Plex Mono',monospace; font-size:8.5px; color:#5b5b63; text-align:center;",
                        )}
                      >
                        <span
                          style={parseStyle("position:absolute; inset:0; opacity:0; animation:mvR1 26s linear infinite;")}
                        >
                          compiling scene graph…
                        </span>
                        <span
                          style={parseStyle("position:absolute; inset:0; opacity:0; animation:mvR2 26s linear infinite;")}
                        >
                          rendering 240 frames · 1080p
                        </span>
                        <span
                          style={parseStyle("position:absolute; inset:0; opacity:0; animation:mvR3 26s linear infinite;")}
                        >
                          encoding h.264 · almost there
                        </span>
                      </div>
                    </div>
                    <div style={parseStyle("position:absolute; inset:0; opacity:0;")}>
                      {videoSvg(false)}
                      <span
                        style={parseStyle(
                          "position:absolute; top:8px; left:10px; background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.08); border-radius:5px; padding:3px 7px; font-family:'IBM Plex Mono',monospace; font-size:8.5px; color:#a1a1aa; white-space:nowrap;",
                        )}
                      >
                        square_wave.mp4 · 1080p
                      </span>
                      <div
                        style={parseStyle(
                          "position:absolute; inset-inline:0; bottom:0; display:flex; align-items:center; gap:9px; padding:9px 11px; background:linear-gradient(to top, rgba(0,0,0,0.8), transparent);",
                        )}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="#e4e4e7">
                          <rect x="5" y="4" width="4.5" height="16" rx="1"></rect>
                          <rect x="14.5" y="4" width="4.5" height="16" rx="1"></rect>
                        </svg>
                        <div
                          style={parseStyle(
                            "flex:1; height:3px; border-radius:2px; background:rgba(255,255,255,0.16); position:relative;",
                          )}
                        >
                          <div
                            style={parseStyle(
                              "height:100%; width:0%; border-radius:2px; background:#e4e4e7; animation:mv-scrub 26s linear infinite;",
                            )}
                          ></div>
                          <div
                            style={parseStyle(
                              "position:absolute; top:50%; left:0%; width:8px; height:8px; border-radius:50%; background:#fff; transform:translate(-50%,-50%); animation:mv-scrubdot 26s linear infinite;",
                            )}
                          ></div>
                        </div>
                        <span
                          style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:8.5px; color:#a1a1aa;")}
                        >
                          0:12
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* thinking chip */}
                <div
                  style={parseStyle(
                    "position:absolute; top:52px; left:14px; display:flex; align-items:center; gap:7px; background:#141418; border:1px solid #232329; border-radius:9px; padding:6px 10px; opacity:0; animation:mv-think 26s linear infinite;",
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    style={parseStyle("width:10px; height:10px; animation:mn-spin .8s linear infinite;")}
                  >
                    <circle cx="12" cy="12" r="10" stroke="#2b2b31" strokeWidth="4"></circle>
                    <path d="M4 12a8 8 0 018-8" stroke="#8b8b93" strokeWidth="4" strokeLinecap="round"></path>
                  </svg>
                  <span style={parseStyle("font-size:10px; color:#8b8b93;")}>Thinking…</span>
                </div>
              </div>

              {/* composer */}
              <div
                style={parseStyle(
                  "flex:0 0 auto; padding:9px 12px 11px; border-top:1px solid #1a1a1f; background:rgba(17,17,21,0.65);",
                )}
              >
                <div
                  style={parseStyle(
                    "display:flex; align-items:center; gap:9px; background:#141418; border:1px solid #26262c; border-radius:11px; padding:7px 7px 7px 12px; animation:mv-focus 26s linear infinite;",
                  )}
                >
                  <div style={parseStyle("position:relative; flex:1; min-width:0; height:15px;")}>
                    <span
                      style={parseStyle(
                        "position:absolute; inset:0; display:flex; align-items:center; font-size:10.5px; color:#4b4b52; animation:mv-ph 26s linear infinite;",
                      )}
                    >
                      Describe the animation you want to create…
                    </span>
                    <span
                      style={parseStyle(
                        "position:absolute; inset:0; display:flex; align-items:center; overflow:hidden; opacity:0; animation:mv-carwin 26s linear infinite;",
                      )}
                    >
                      <span
                        style={parseStyle(
                          "display:block; overflow:hidden; white-space:nowrap; width:0ch; font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:#e4e4e7; animation:mv-type 26s linear infinite;",
                        )}
                      >
                        Show how a square wave emerges from sine waves
                      </span>
                      <span
                        style={parseStyle(
                          "width:1.5px; height:12px; flex:0 0 auto; background:#e4e4e7; margin-left:2px; animation:mv-caret 1.1s steps(1) infinite;",
                        )}
                      ></span>
                    </span>
                  </div>
                  <div
                    style={parseStyle(
                      "width:28px; height:28px; flex:0 0 auto; display:flex; align-items:center; justify-content:center; border-radius:8px; background:#26262b; color:#5b5b63; animation:mv-send 26s linear infinite;",
                    )}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 19V5"></path>
                      <path d="M6 11l6-6 6 6"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* click ripples */}
            <span
              style={parseStyle(
                "position:absolute; left:30%; top:calc(100% - 27px); width:32px; height:32px; margin:-16px 0 0 -16px; border-radius:50%; border:1.5px solid #d4d4d8; opacity:0; transform:scale(0.2); animation:mv-rip1 26s linear infinite; pointer-events:none;",
              )}
            ></span>
            <span
              style={parseStyle(
                "position:absolute; left:calc(100% - 33px); top:calc(100% - 27px); width:32px; height:32px; margin:-16px 0 0 -16px; border-radius:50%; border:1.5px solid #d4d4d8; opacity:0; transform:scale(0.2); animation:mv-rip2 26s linear infinite; pointer-events:none;",
              )}
            ></span>
            <span
              style={parseStyle(
                "position:absolute; left:calc(100% - 46px); top:68px; width:32px; height:32px; margin:-16px 0 0 -16px; border-radius:50%; border:1.5px solid #d4d4d8; opacity:0; transform:scale(0.2); animation:mv-rip3 26s linear infinite; pointer-events:none;",
              )}
            ></span>

            {/* mouse cursor */}
            <div
              style={parseStyle(
                "position:absolute; left:72%; top:55%; z-index:6; opacity:0; pointer-events:none; animation:mv-cur 26s cubic-bezier(.5,.08,.24,1) infinite;",
              )}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                style={parseStyle(
                  "display:block; transform-origin:5px 3px; animation:mv-press 26s linear infinite; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.55));",
                )}
              >
                <path
                  d="M5.2 2.6 L5.2 19.4 L9.6 15.4 L12.2 21.4 L15.3 20 L12.7 14.1 L18.6 13.7 Z"
                  fill="#f4f4f5"
                  stroke="#18181b"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </div>

            {/* fullscreen video (camera zoomed in, watch phase) */}
            <div
              style={parseStyle(
                "position:absolute; inset:0; z-index:4; background:#000; opacity:0; transform-origin:50% 48%; animation:mv-fs 26s linear infinite; pointer-events:none;",
              )}
            >
              {videoSvg(true)}
              <span
                style={parseStyle(
                  "position:absolute; top:12px; left:14px; background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:4px 8px; font-family:'IBM Plex Mono',monospace; font-size:9.5px; color:#a1a1aa; white-space:nowrap;",
                )}
              >
                square_wave.mp4 · 1080p
              </span>
              <span
                style={parseStyle(
                  "position:absolute; top:12px; right:14px; font-family:'IBM Plex Mono',monospace; font-size:9.5px; color:#71717a;",
                )}
              >
                <span
                  style={parseStyle("position:absolute; right:0; white-space:nowrap; opacity:0; animation:mvL1 26s linear infinite;")}
                >
                  n = 1
                </span>
                <span
                  style={parseStyle("position:absolute; right:0; white-space:nowrap; opacity:0; animation:mvL2 26s linear infinite;")}
                >
                  n = 1, 3
                </span>
                <span
                  style={parseStyle("position:absolute; right:0; white-space:nowrap; opacity:0; animation:mvL3 26s linear infinite;")}
                >
                  n = 1, 3, 5
                </span>
              </span>
              <p
                style={parseStyle(
                  "position:absolute; inset-inline:0; bottom:34px; margin:0; text-align:center; font-family:Georgia, serif; font-style:italic; font-size:13px; color:#71717a;",
                )}
              >
                f(x) = Σ sin(nx) / n
              </p>
              <div
                style={parseStyle(
                  "position:absolute; inset-inline:0; bottom:0; display:flex; align-items:center; gap:10px; padding:11px 14px; background:linear-gradient(to top, rgba(0,0,0,0.8), transparent);",
                )}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#e4e4e7">
                  <rect x="5" y="4" width="4.5" height="16" rx="1"></rect>
                  <rect x="14.5" y="4" width="4.5" height="16" rx="1"></rect>
                </svg>
                <div
                  style={parseStyle(
                    "flex:1; height:3px; border-radius:2px; background:rgba(255,255,255,0.16); position:relative;",
                  )}
                >
                  <div
                    style={parseStyle(
                      "height:100%; width:0%; border-radius:2px; background:#e4e4e7; animation:mv-scrub 26s linear infinite;",
                    )}
                  ></div>
                  <div
                    style={parseStyle(
                      "position:absolute; top:50%; left:0%; width:8px; height:8px; border-radius:50%; background:#fff; transform:translate(-50%,-50%); animation:mv-scrubdot 26s linear infinite;",
                    )}
                  ></div>
                </div>
                <span
                  style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:9.5px; color:#a1a1aa;")}
                >
                  0:12
                </span>
              </div>
            </div>

            {/* outro brand card */}
            <div
              style={parseStyle(
                "position:absolute; inset:0; z-index:5; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; background:#09090b; opacity:0; animation:mv-outro 26s linear infinite; pointer-events:none;",
              )}
            >
              <div
                style={parseStyle(
                  "display:flex; align-items:center; gap:13px; opacity:0; animation:mv-outro-mark 26s cubic-bezier(.2,.7,.2,1) infinite;",
                )}
              >
                <div
                  style={parseStyle(
                    "width:46px; height:46px; flex:0 0 auto; border-radius:13px; border:1px solid #3f3f46; display:flex; align-items:center; justify-content:center; background:#0e0e11;",
                  )}
                >
                  <div
                    style={parseStyle("width:16px; height:16px; border-radius:50%; border:2px solid #d4d4d8;")}
                  ></div>
                </div>
                <span
                  style={parseStyle(
                    "font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:34px; letter-spacing:-0.01em; color:#fafafa;",
                  )}
                >
                  Manition
                </span>
              </div>
              <p
                style={parseStyle(
                  "margin:0; font-size:13px; letter-spacing:0.02em; color:#71717a; opacity:0; animation:mv-outro-mark 26s cubic-bezier(.2,.7,.2,1) infinite; animation-delay:0.35s;",
                )}
              >
                Describe it. We animate it.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* captions */}
      <div style={parseStyle("width:min(560px, 100%); margin-top:24px;")}>
        <div style={parseStyle("position:relative; height:44px;")}>
          <div style={parseStyle("position:absolute; inset:0; opacity:0; animation:mvA 26s linear infinite;")}>
            <p style={parseStyle(`margin:0 0 4px; font-size:15px; font-weight:600; letter-spacing:-0.01em; color:${capTitle};`)}>
              Describe it
            </p>
            <p style={parseStyle(`margin:0; font-size:12.5px; color:${capSub};`)}>
              Plain language in, math animation out.
            </p>
          </div>
          <div style={parseStyle("position:absolute; inset:0; opacity:0; animation:mvB 26s linear infinite;")}>
            <p style={parseStyle(`margin:0 0 4px; font-size:15px; font-weight:600; letter-spacing:-0.01em; color:${capTitle};`)}>
              Code, written for you
            </p>
            <p style={parseStyle(`margin:0; font-size:12.5px; color:${capSub};`)}>
              Manition generates the Manim scene.
            </p>
          </div>
          <div style={parseStyle("position:absolute; inset:0; opacity:0; animation:mvC 26s linear infinite;")}>
            <p style={parseStyle(`margin:0 0 4px; font-size:15px; font-weight:600; letter-spacing:-0.01em; color:${capTitle};`)}>
              Rendered in the cloud
            </p>
            <p style={parseStyle(`margin:0; font-size:12.5px; color:${capSub};`)}>
              No local setup, no waiting around.
            </p>
          </div>
          <div style={parseStyle("position:absolute; inset:0; opacity:0; animation:mvD 26s linear infinite;")}>
            <p style={parseStyle(`margin:0 0 4px; font-size:15px; font-weight:600; letter-spacing:-0.01em; color:${capTitle};`)}>
              Ready to watch
            </p>
            <p style={parseStyle(`margin:0; font-size:12.5px; color:${capSub};`)}>
              Download or share the final video.
            </p>
          </div>
        </div>

        {/* chapters */}
        <div style={parseStyle("display:flex; align-items:center; gap:18px; margin-top:14px;")}>
          <div style={parseStyle("display:flex; align-items:center; gap:7px; opacity:0.18; animation:mvOa 26s linear infinite;")}>
            <span style={parseStyle("width:5px; height:5px; border-radius:99px; background:#3f3f46; animation:mvPa 26s linear infinite;")}></span>
            <span style={parseStyle(`font-size:11px; font-weight:600; letter-spacing:0.06em; color:${chapLabel};`)}>DESCRIBE</span>
          </div>
          <div style={parseStyle("display:flex; align-items:center; gap:7px; opacity:0.18; animation:mvOb 26s linear infinite;")}>
            <span style={parseStyle("width:5px; height:5px; border-radius:99px; background:#3f3f46; animation:mvPb 26s linear infinite;")}></span>
            <span style={parseStyle(`font-size:11px; font-weight:600; letter-spacing:0.06em; color:${chapLabel};`)}>GENERATE</span>
          </div>
          <div style={parseStyle("display:flex; align-items:center; gap:7px; opacity:0.18; animation:mvOc 26s linear infinite;")}>
            <span style={parseStyle("width:5px; height:5px; border-radius:99px; background:#3f3f46; animation:mvPc 26s linear infinite;")}></span>
            <span style={parseStyle(`font-size:11px; font-weight:600; letter-spacing:0.06em; color:${chapLabel};`)}>RENDER</span>
          </div>
          <div style={parseStyle("display:flex; align-items:center; gap:7px; opacity:0.18; animation:mvOd 26s linear infinite;")}>
            <span style={parseStyle("width:5px; height:5px; border-radius:99px; background:#3f3f46; animation:mvPd 26s linear infinite;")}></span>
            <span style={parseStyle(`font-size:11px; font-weight:600; letter-spacing:0.06em; color:${chapLabel};`)}>WATCH</span>
          </div>
        </div>
      </div>
    </div>
  );
}
