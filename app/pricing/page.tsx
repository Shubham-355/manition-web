import { parseStyle } from "../lib/css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { Hover } from "../components/Interactive";

const tierH3 = "margin:0 0 4px; font-family:'Space Grotesk'; font-weight:600; font-size:20px;";
const tierPrice =
  "margin:0 0 4px; font-family:'Space Grotesk'; font-weight:700; font-size:40px; letter-spacing:-0.02em;";
const featRow = "margin:0; display:flex; gap:10px; font-size:13.5px; color:#3f3f46;";
const cmpGrid =
  "display:grid; grid-template-columns:1.6fr 1fr 1fr 1fr; padding:14px 22px; font-size:13.5px; align-items:center;";

const chev = (
  <span className="pc-chev" style={parseStyle("transition:transform .2s; color:#9a9aa2;")}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M6 9l6 6 6-6"></path>
    </svg>
  </span>
);

function PriceFaq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:13px; padding:2px 20px;")}>
      <summary style={parseStyle("display:flex; align-items:center; justify-content:space-between; gap:16px; padding:16px 0; font-family:'Space Grotesk'; font-weight:600; font-size:15.5px;")}>
        {q}
        {chev}
      </summary>
      <p style={parseStyle("margin:0 0 18px; font-size:14px; line-height:1.65; color:#6b6b73;")}>{children}</p>
    </details>
  );
}

function CmpRow({
  label,
  cells,
  last = false,
}: {
  label: string;
  cells: { text: string; css: string }[];
  last?: boolean;
}) {
  return (
    <div style={parseStyle(`${cmpGrid} ${last ? "" : "border-bottom:1px solid #f2eee6;"}`)}>
      <span style={parseStyle("color:#3f3f46;")}>{label}</span>
      {cells.map((c, i) => (
        <span key={i} style={parseStyle(`text-align:center; ${c.css}`)}>
          {c.text}
        </span>
      ))}
    </div>
  );
}

const strong = "color:#16161a; font-weight:600;";
const dim = "color:#6b6b73;";
const dash = "color:#c4c0b6;";
const yes = "color:#3b62e0;";

export default function Pricing() {
  return (
    <div
      style={parseStyle(
        "font-family:'IBM Plex Sans',ui-sans-serif,system-ui; color:#16161a; background:#f7f6f3; overflow-x:hidden;",
      )}
    >
      <Nav active="pricing" />

      <section style={parseStyle("max-width:820px; margin:0 auto; padding:72px 30px 20px; text-align:center;")}>
        <p style={parseStyle("font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#3b62e0; margin:0 0 16px;")}>
          Pricing
        </p>
        <h1 style={parseStyle("margin:0 auto; max-width:640px; font-family:'Space Grotesk'; font-weight:700; font-size:50px; line-height:1.05; letter-spacing:-0.035em;")}>
          Pricing you help decide.
        </h1>
        <p style={parseStyle("margin:20px auto 0; max-width:500px; font-size:17px; line-height:1.6; color:#54545c;")}>
          We&apos;re still shaping plans with our early community, so the numbers below aren&apos;t final. Join the waitlist to weigh in - and lock in founder rates when we launch.
        </p>
        <div style={parseStyle("display:inline-flex; align-items:center; gap:9px; margin-top:22px; background:#fbf3e4; border:1px solid #ecdcb6; color:#8a6d2f; border-radius:100px; padding:8px 16px; font-size:13px; font-weight:500;")}>
          <span style={parseStyle("width:7px; height:7px; border-radius:50%; background:#c2913a;")}></span>
          Prices shown are placeholders while we finalize
        </div>
      </section>

      <section style={parseStyle("max-width:1080px; margin:0 auto; padding:36px 30px 20px;")}>
        <div className="pc-tiers" style={parseStyle("display:grid; grid-template-columns:repeat(3,1fr); gap:18px; align-items:start;")}>
          {/* Free */}
          <div style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:18px; padding:30px;")}>
            <h3 style={parseStyle(tierH3)}>Free</h3>
            <p style={parseStyle("margin:0 0 20px; font-size:13.5px; color:#8a8a92;")}>For trying it out</p>
            <p style={parseStyle(tierPrice)}>$0</p>
            <p style={parseStyle("margin:0 0 22px; font-size:13px; color:#8a8a92;")}>forever</p>
            <Hover
              as="a"
              href="/#waitlist"
              style="display:block; text-align:center; text-decoration:none; background:#f2efe9; color:#16161a; font-size:14px; font-weight:600; padding:12px 0; border-radius:10px; border:1px solid #e6e2da; margin-bottom:24px;"
              hoverStyle={{ background: "#eae7df" }}
            >
              Start free
            </Hover>
            <div style={parseStyle("display:flex; flex-direction:column; gap:12px;")}>
              <p style={parseStyle(featRow)}><span style={parseStyle(yes)}>✓</span> A handful of renders each month</p>
              <p style={parseStyle(featRow)}><span style={parseStyle(yes)}>✓</span> Up to 720p exports</p>
              <p style={parseStyle(featRow)}><span style={parseStyle(yes)}>✓</span> View generated Manim code</p>
              <p style={parseStyle(featRow)}><span style={parseStyle(yes)}>✓</span> Community gallery access</p>
            </div>
          </div>

          {/* Pro */}
          <div style={parseStyle("background:#16161a; color:#f7f6f3; border:1px solid #16161a; border-radius:18px; padding:30px; position:relative; box-shadow:0 22px 50px -26px rgba(20,20,40,0.55);")}>
            <span style={parseStyle("position:absolute; top:20px; right:20px; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; background:#3b62e0; color:#fff; padding:4px 10px; border-radius:100px;")}>
              Most popular
            </span>
            <h3 style={parseStyle("margin:0 0 4px; font-family:'Space Grotesk'; font-weight:600; font-size:20px; color:#fff;")}>Pro</h3>
            <p style={parseStyle("margin:0 0 20px; font-size:13.5px; color:#a1a1aa;")}>For regular explainers</p>
            <p style={parseStyle("margin:0 0 4px; font-family:'Space Grotesk'; font-weight:700; font-size:40px; letter-spacing:-0.02em; color:#fff;")}>TBD</p>
            <p style={parseStyle("margin:0 0 22px; font-size:13px; color:#8a8a92;")}>monthly · founder rate on the list</p>
            <Hover
              as="a"
              href="/#waitlist"
              style="display:block; text-align:center; text-decoration:none; background:#3b62e0; color:#fff; font-size:14px; font-weight:600; padding:12px 0; border-radius:10px; margin-bottom:24px;"
              hoverStyle={{ background: "#2f4fc0" }}
            >
              Join for Pro
            </Hover>
            <div style={parseStyle("display:flex; flex-direction:column; gap:12px;")}>
              <p style={parseStyle("margin:0; display:flex; gap:10px; font-size:13.5px; color:#d4d4d8;")}><span style={parseStyle("color:#7f97e8;")}>✓</span> Unlimited renders</p>
              <p style={parseStyle("margin:0; display:flex; gap:10px; font-size:13.5px; color:#d4d4d8;")}><span style={parseStyle("color:#7f97e8;")}>✓</span> 4K &amp; transparent exports</p>
              <p style={parseStyle("margin:0; display:flex; gap:10px; font-size:13.5px; color:#d4d4d8;")}><span style={parseStyle("color:#7f97e8;")}>✓</span> Priority GPU queue</p>
              <p style={parseStyle("margin:0; display:flex; gap:10px; font-size:13.5px; color:#d4d4d8;")}><span style={parseStyle("color:#7f97e8;")}>✓</span> Editable + exportable source</p>
              <p style={parseStyle("margin:0; display:flex; gap:10px; font-size:13.5px; color:#d4d4d8;")}><span style={parseStyle("color:#7f97e8;")}>✓</span> Full personal library</p>
            </div>
          </div>

          {/* Team */}
          <div style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:18px; padding:30px;")}>
            <h3 style={parseStyle(tierH3)}>Team</h3>
            <p style={parseStyle("margin:0 0 20px; font-size:13.5px; color:#8a8a92;")}>For departments &amp; studios</p>
            <p style={parseStyle(tierPrice)}>Let&apos;s talk</p>
            <p style={parseStyle("margin:0 0 22px; font-size:13px; color:#8a8a92;")}>custom per seat</p>
            <Hover
              as="a"
              href="/#waitlist"
              style="display:block; text-align:center; text-decoration:none; background:#f2efe9; color:#16161a; font-size:14px; font-weight:600; padding:12px 0; border-radius:10px; border:1px solid #e6e2da; margin-bottom:24px;"
              hoverStyle={{ background: "#eae7df" }}
            >
              Join the waitlist
            </Hover>
            <div style={parseStyle("display:flex; flex-direction:column; gap:12px;")}>
              <p style={parseStyle(featRow)}><span style={parseStyle(yes)}>✓</span> Everything in Pro</p>
              <p style={parseStyle(featRow)}><span style={parseStyle(yes)}>✓</span> Shared team workspaces</p>
              <p style={parseStyle(featRow)}><span style={parseStyle(yes)}>✓</span> Brand kits &amp; templates</p>
              <p style={parseStyle(featRow)}><span style={parseStyle(yes)}>✓</span> SSO &amp; admin controls</p>
            </div>
          </div>
        </div>
      </section>

      {/* comparison strip */}
      <section style={parseStyle("max-width:820px; margin:0 auto; padding:44px 30px 10px;")}>
        <div style={parseStyle("background:#fff; border:1px solid #e6e2da; border-radius:18px; overflow:hidden;")}>
          <div style={parseStyle("display:grid; grid-template-columns:1.6fr 1fr 1fr 1fr; padding:16px 22px; border-bottom:1px solid #eee9df; font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.06em; text-transform:uppercase; color:#8a8a92;")}>
            <span>Feature</span>
            <span style={parseStyle("text-align:center;")}>Free</span>
            <span style={parseStyle("text-align:center;")}>Pro</span>
            <span style={parseStyle("text-align:center;")}>Team</span>
          </div>
          <CmpRow label="Monthly renders" cells={[{ text: "Limited", css: dim }, { text: "Unlimited", css: strong }, { text: "Unlimited", css: strong }]} />
          <CmpRow label="Max resolution" cells={[{ text: "720p", css: dim }, { text: "4K", css: strong }, { text: "4K", css: strong }]} />
          <CmpRow label="Transparent backgrounds" cells={[{ text: "-", css: dash }, { text: "✓", css: yes }, { text: "✓", css: yes }]} />
          <CmpRow label="Priority GPU queue" cells={[{ text: "-", css: dash }, { text: "✓", css: yes }, { text: "✓", css: yes }]} />
          <CmpRow label="Team workspaces & SSO" cells={[{ text: "-", css: dash }, { text: "-", css: dash }, { text: "✓", css: yes }]} last />
        </div>
      </section>

      {/* pricing FAQ */}
      <section style={parseStyle("max-width:760px; margin:0 auto; padding:56px 30px 20px;")}>
        <h2 style={parseStyle("margin:0 0 28px; text-align:center; font-family:'Space Grotesk'; font-weight:700; font-size:30px; letter-spacing:-0.03em;")}>
          Pricing questions
        </h2>
        <div style={parseStyle("display:flex; flex-direction:column; gap:12px;")}>
          <PriceFaq q="Why isn't pricing final?">
            Rendering costs depend on how people actually use Manition. We&apos;d rather set fair prices with real usage data from early members than guess - so waitlist folks help shape the final tiers.
          </PriceFaq>
          <PriceFaq q="What are founder rates?">
            Everyone who joins before launch gets a permanently discounted Pro price, locked in for as long as the subscription stays active. It&apos;s our thank-you for helping us get it right.
          </PriceFaq>
          <PriceFaq q="Is there an education discount?">
            Yes - teachers and students are core to why we&apos;re building Manition. Education pricing is planned for launch; mention your school when you join and we&apos;ll keep you posted.
          </PriceFaq>
        </div>
      </section>

      <section style={parseStyle("max-width:1080px; margin:0 auto; padding:44px 30px 90px;")}>
        <div style={parseStyle("background:#0c0c0f; border-radius:22px; padding:56px 40px; text-align:center;")}>
          <h2 style={parseStyle("margin:0 0 14px; font-family:'Space Grotesk'; font-weight:700; font-size:34px; letter-spacing:-0.03em; color:#f7f6f3;")}>Help set the price.</h2>
          <p style={parseStyle("margin:0 auto 28px; max-width:460px; font-size:15.5px; color:#a1a1aa; line-height:1.6;")}>
            Join the waitlist to shape the plans - and grab founder rates before launch.
          </p>
          <Hover
            as="a"
            href="/#waitlist"
            style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; background:#3b62e0; color:#fff; font-size:15px; font-weight:600; padding:14px 24px; border-radius:12px;"
            hoverStyle={{ background: "#2f4fc0" }}
          >
            Join the waitlist{" "}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M13 6l6 6-6 6"></path>
            </svg>
          </Hover>
        </div>
      </section>

      <Footer />
    </div>
  );
}
