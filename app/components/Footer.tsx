import { parseStyle } from "../lib/css";
import { Hover } from "./Interactive";

const socialBase =
  "width:34px; height:34px; border-radius:9px; border:1px solid #2c2c33; display:flex; align-items:center; justify-content:center; color:#a1a1aa; text-decoration:none;";
const socialHover = { borderColor: "#4a4a52", color: "#f4f4f5" };

const linkBase = "text-decoration:none; font-size:13.5px; color:#a1a1aa;";
const linkHover = { color: "#f4f4f5" };

const bottomLinkBase = "text-decoration:none; font-size:12.5px; color:#6b6b73;";
const bottomLinkHover = { color: "#c8c8cc" };

const columnLabel =
  "margin:0 0 4px; font-size:11px; font-weight:600; color:#5b5b63; text-transform:uppercase; letter-spacing:0.14em; font-family:'IBM Plex Mono',monospace;";

export default function Footer() {
  return (
    <footer
      style={parseStyle(
        "background:#111114; color:#c8c8cc; font-family:'IBM Plex Sans',ui-sans-serif,system-ui; border-top:1px solid #26262c;",
      )}
    >
      <div
        style={parseStyle(
          "max-width:1200px; margin:0 auto; padding:64px 30px 40px; display:flex; flex-wrap:wrap; gap:48px 40px;",
        )}
      >
        <div style={parseStyle("flex:1 1 300px; min-width:250px;")}>
          <a
            href="Home.dc.html"
            style={parseStyle(
              "display:flex; align-items:center; gap:10px; text-decoration:none; margin-bottom:16px;",
            )}
          >
            <div
              style={parseStyle(
                "width:27px; height:27px; border-radius:8px; border:1px solid #3a3a40; display:flex; align-items:center; justify-content:center; background:#191920;",
              )}
            >
              <div
                style={parseStyle(
                  "width:9px; height:9px; border-radius:50%; border:1.6px solid #d4d4d8;",
                )}
              ></div>
            </div>
            <span
              style={parseStyle(
                "color:#f4f4f5; font-family:'Space Grotesk'; font-weight:700; font-size:16px; letter-spacing:-0.02em;",
              )}
            >
              Manition
            </span>
          </a>
          <p
            style={parseStyle(
              "margin:0 0 20px; font-size:13.5px; line-height:1.6; color:#8b8b93; max-width:280px;",
            )}
          >
            Describe the math. Watch it animate. Manition turns a sentence into a
            rendered explainer video - no code, no timeline.
          </p>
          <div style={parseStyle("display:flex; align-items:center; gap:10px;")}>
            <Hover as="a" href="#" title="X" style={socialBase} hoverStyle={socialHover}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.9 2H22l-7.5 8.6L23 22h-6.8l-5.3-7-6.1 7H1.7l8-9.2L1 2h7l4.8 6.4L18.9 2Zm-2.4 18h1.9L7.6 4H5.6l10.9 16Z"></path>
              </svg>
            </Hover>
            <Hover as="a" href="#" title="YouTube" style={socialBase} hoverStyle={socialHover}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 12s0-3.6-.46-5.3a2.76 2.76 0 0 0-1.94-1.95C18.9 4.3 12 4.3 12 4.3s-6.9 0-8.6.45A2.76 2.76 0 0 0 1.46 6.7 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.3 2.76 2.76 0 0 0 1.94 1.95c1.7.45 8.6.45 8.6.45s6.9 0 8.6-.45a2.76 2.76 0 0 0 1.94-1.95C23 15.6 23 12 23 12ZM9.8 15.3V8.7l5.7 3.3-5.7 3.3Z"></path>
              </svg>
            </Hover>
            <Hover as="a" href="#" title="GitHub" style={socialBase} hoverStyle={socialHover}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2A10 10 0 0 0 8.8 21.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.4 4.7-4.6 4.9.3.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"></path>
              </svg>
            </Hover>
          </div>
        </div>

        <div
          style={parseStyle(
            "flex:0 0 auto; display:flex; flex-direction:column; gap:11px;",
          )}
        >
          <p style={parseStyle(columnLabel)}>Product</p>
          <Hover as="a" href="Features.dc.html" style={linkBase} hoverStyle={linkHover}>
            Features
          </Hover>
          <Hover as="a" href="Gallery.dc.html" style={linkBase} hoverStyle={linkHover}>
            Gallery
          </Hover>
          <Hover as="a" href="Pricing.dc.html" style={linkBase} hoverStyle={linkHover}>
            Pricing
          </Hover>
          <Hover
            as="a"
            href="../Manition Auth v3.dc.html"
            style={linkBase}
            hoverStyle={linkHover}
          >
            Open the app
          </Hover>
        </div>

        <div
          style={parseStyle(
            "flex:0 0 auto; display:flex; flex-direction:column; gap:11px;",
          )}
        >
          <p style={parseStyle(columnLabel)}>Resources</p>
          <Hover as="a" href="Docs.dc.html" style={linkBase} hoverStyle={linkHover}>
            Docs
          </Hover>
          <Hover as="a" href="Blog.dc.html" style={linkBase} hoverStyle={linkHover}>
            Blog
          </Hover>
          <Hover as="a" href="Blog.dc.html" style={linkBase} hoverStyle={linkHover}>
            Changelog
          </Hover>
          <Hover as="a" href="Docs.dc.html" style={linkBase} hoverStyle={linkHover}>
            Manim guide
          </Hover>
        </div>

        <div
          style={parseStyle(
            "flex:0 0 auto; display:flex; flex-direction:column; gap:11px;",
          )}
        >
          <p style={parseStyle(columnLabel)}>Company</p>
          <Hover as="a" href="About.dc.html" style={linkBase} hoverStyle={linkHover}>
            About
          </Hover>
          <Hover
            as="a"
            href="Home.dc.html#waitlist"
            style={linkBase}
            hoverStyle={linkHover}
          >
            Join waitlist
          </Hover>
        </div>
      </div>

      <div
        style={parseStyle(
          "max-width:1200px; margin:0 auto; padding:20px 30px 8px; border-top:1px solid #202026; display:flex; flex-wrap:wrap; align-items:center; gap:14px;",
        )}
      >
        <p style={parseStyle("margin:0; font-size:12.5px; color:#6b6b73;")}>
          © 2026 Manition. All rights reserved.
        </p>
        <div style={parseStyle("flex:1;")}></div>
        <Hover as="a" href="#" style={bottomLinkBase} hoverStyle={bottomLinkHover}>
          Privacy
        </Hover>
        <Hover as="a" href="#" style={bottomLinkBase} hoverStyle={bottomLinkHover}>
          Terms
        </Hover>
      </div>
    </footer>
  );
}
