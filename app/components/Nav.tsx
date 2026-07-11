import { parseStyle } from "../lib/css";
import { Hover } from "./Interactive";

type NavKey = "features" | "gallery" | "pricing" | "blog" | "docs";

const NAV_ITEMS: { key: NavKey; label: string; href: string }[] = [
  { key: "features", label: "Features", href: "Features.dc.html" },
  { key: "gallery", label: "Gallery", href: "Gallery.dc.html" },
  { key: "pricing", label: "Pricing", href: "Pricing.dc.html" },
  { key: "blog", label: "Blog", href: "Blog.dc.html" },
  { key: "docs", label: "Docs", href: "Docs.dc.html" },
];

export default function Nav({
  active = "home",
}: {
  active?: NavKey | "home" | "about";
}) {
  return (
    <header
      style={parseStyle(
        "position:sticky; top:0; z-index:100; display:flex; align-items:center; justify-content:center; background:rgba(247,246,243,0.82); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid #e7e4dc; font-family:'IBM Plex Sans',ui-sans-serif,system-ui;",
      )}
    >
      <div
        style={parseStyle(
          "width:100%; max-width:1200px; display:flex; align-items:center; gap:18px; padding:0 30px; height:66px;",
        )}
      >
        <a
          href="Home.dc.html"
          style={parseStyle(
            "display:flex; align-items:center; gap:10px; text-decoration:none; margin-right:6px;",
          )}
        >
          <div
            style={parseStyle(
              "width:27px; height:27px; flex:0 0 auto; border-radius:8px; border:1px solid #d7d3c8; display:flex; align-items:center; justify-content:center; background:#ffffff; box-shadow:0 1px 2px rgba(24,24,27,0.05);",
            )}
          >
            <div
              style={parseStyle(
                "width:9px; height:9px; border-radius:50%; border:1.6px solid #16161a;",
              )}
            ></div>
          </div>
          <span
            style={parseStyle(
              "color:#16161a; font-family:'Space Grotesk'; font-weight:700; font-size:16px; letter-spacing:-0.02em;",
            )}
          >
            Manition
          </span>
        </a>

        <nav
          style={parseStyle(
            "display:flex; align-items:center; gap:2px; margin-left:8px;",
          )}
        >
          {NAV_ITEMS.map(({ key, label, href }) => {
            const on = key === active;
            const color = on ? "#16161a" : "#6b6b74";
            const bg = on ? "#eae7df" : "transparent";
            const weight = on ? "600" : "500";
            return (
              <Hover
                key={key}
                as="a"
                href={href}
                style={`text-decoration:none; font-size:13.5px; font-weight:${weight}; color:${color}; background:${bg}; padding:7px 12px; border-radius:9px; transition:background .15s,color .15s;`}
                hoverStyle={{ background: "#eeebe3", color: "#16161a" }}
              >
                {label}
              </Hover>
            );
          })}
        </nav>

        <div style={parseStyle("flex:1;")}></div>

        <Hover
          as="a"
          href="../Manition Auth v3.dc.html"
          style="text-decoration:none; font-size:13.5px; font-weight:500; color:#3f3f46; padding:7px 10px; border-radius:9px;"
          hoverStyle={{ color: "#16161a" }}
        >
          Sign in
        </Hover>
        <Hover
          as="a"
          href="Home.dc.html#waitlist"
          style="display:inline-flex; align-items:center; gap:7px; text-decoration:none; font-size:13.5px; font-weight:600; color:#f7f6f3; background:#16161a; padding:9px 15px; border-radius:10px; border:1px solid #16161a; white-space:nowrap; transition:transform .15s, background .15s;"
          hoverStyle={{ background: "#000", transform: "translateY(-1px)" }}
        >
          Join waitlist
          <svg
            width="13"
            height="13"
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
        </Hover>
      </div>
    </header>
  );
}
