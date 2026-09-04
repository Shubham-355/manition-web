import { parseStyle } from "../lib/css";
import { Hover } from "./Interactive";

const linkBase = "text-decoration:none; font-size:14.5px; color:#cfcdc7;";
const linkHover = { color: "#fff" };

const LINKS = [
  { href: "/gallery", label: "Gallery" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function Footer() {
  return (
    <footer style={parseStyle("background:#0f0f12; color:#e8e6e1; font-family:'IBM Plex Sans',ui-sans-serif,system-ui; overflow:hidden;")}>
      <div className="fo-wrap" style={parseStyle("max-width:1200px; margin:0 auto; padding:clamp(40px,5.2vw,66px) clamp(18px,4vw,30px) clamp(14px,1.8vw,20px);")}>
        <div className="fo-head" style={parseStyle("display:flex; flex-wrap:wrap; align-items:flex-start; justify-content:space-between; gap:36px;")}>
          <p style={parseStyle("margin:0; max-width:300px; font-size:15px; line-height:1.55; color:#a4a29c; text-wrap:pretty;")}>
            Say what you want. Get a video back.
          </p>
          <nav className="fo-links" style={parseStyle("display:flex; flex-wrap:wrap; gap:12px 26px;")}>
            {LINKS.map((l) => (
              <Hover key={l.href} as="a" href={l.href} style={linkBase} hoverStyle={linkHover}>
                {l.label}
              </Hover>
            ))}
          </nav>
        </div>

        <Hover
          as="a"
          href="/"
          style="display:block; margin:clamp(28px,4vw,48px) 0 0; text-decoration:none; color:#f4f2ed; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(56px,15.6vw,196px); line-height:0.8; letter-spacing:-0.055em; white-space:nowrap;"
          hoverStyle={{ color: "#fff" }}
        >
          Manition
        </Hover>

        <div className="fo-foot">
          <p>© 2026 Manition</p>
        </div>
      </div>
    </footer>
  );
}
