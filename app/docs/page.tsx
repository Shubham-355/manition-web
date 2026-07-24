import Link from "next/link";
import { parseStyle } from "../lib/css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { DocsSearch } from "../components/Interactive";
import DocsReader from "../components/DocsReader";

export default function Docs() {
  return (
    <div
      style={parseStyle(
        "font-family:'IBM Plex Sans',ui-sans-serif,system-ui; color:#16161a; background:#f7f6f3; overflow-x:hidden;",
      )}
    >
      <Nav active="docs" />

      {/* header + search */}
      <section style={parseStyle("max-width:820px; margin:0 auto; padding:72px 30px 26px; text-align:center;")}>
        <p style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#3b62e0; margin:0 0 16px;")}>
          Docs
        </p>
        <h1 style={parseStyle("margin:0 auto; font-family:'Space Grotesk'; font-weight:700; font-size:46px; line-height:1.06; letter-spacing:-0.035em;")}>
          How can we help?
        </h1>
        <DocsSearch />
      </section>

      {/* categories + popular articles + reader drawer */}
      <DocsReader />

      {/* support strip */}
      <section style={parseStyle("max-width:820px; margin:0 auto; padding:20px 30px 90px;")}>
        <div className="dc-pop" style={parseStyle("display:grid; grid-template-columns:1fr 1fr; gap:16px;")}>
          <div style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:16px; padding:26px;")}>
            <h3 style={parseStyle("margin:0 0 7px; font-family:'Space Grotesk'; font-weight:600; font-size:16px;")}>Can&apos;t find it?</h3>
            <p style={parseStyle("margin:0 0 14px; font-size:13.5px; line-height:1.6; color:#6b6b73;")}>
              More docs are on the way. Join the waitlist and we&apos;ll keep you posted as they expand.
            </p>
            <Link href="/#waitlist" style={parseStyle("font-size:14px; font-weight:600; text-decoration:none;")}>Join the waitlist →</Link>
          </div>
          <div style={parseStyle("background:#0c0c0f; border:1px solid #1f1f26; border-radius:16px; padding:26px;")}>
            <h3 style={parseStyle("margin:0 0 7px; font-family:'Space Grotesk'; font-weight:600; font-size:16px; color:#f4f4f5;")}>New to Manition?</h3>
            <p style={parseStyle("margin:0 0 14px; font-size:13.5px; line-height:1.6; color:#8a8a92;")}>
              Watch the 26-second tour on the homepage, then join the list.
            </p>
            <Link href="/#demo" style={parseStyle("font-size:14px; font-weight:600; text-decoration:none; color:#7f97e8;")}>See it in action →</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
