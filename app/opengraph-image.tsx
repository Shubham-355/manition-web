/* eslint-disable @next/next/no-img-element -- ImageResponse draws plain <img>, next/image does not apply here */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { OG_ALT } from "./lib/meta";

/* The link preview every page shares: the home hero at dusk, drawn once at build time. */

export const alt = OG_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const asset = (p: string) => readFile(join(process.cwd(), "assets", p));
const png = async (p: string) => "data:image/png;base64," + (await asset("og/" + p)).toString("base64");

const HORIZON = 500;

export default async function Image() {
  const [serif, serifItalic, sans, mono, moon, stars, ground] = await Promise.all([
    asset("fonts/InstrumentSerif-Regular.ttf"),
    asset("fonts/InstrumentSerif-Italic.ttf"),
    asset("fonts/Geist-Regular.ttf"),
    asset("fonts/GeistMono-Medium.ttf"),
    png("moon.png"),
    png("stars.png"),
    png("ground.png"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          overflow: "hidden",
          color: "#EDEAE3",
          fontFamily: "Geist",
          background: "linear-gradient(180deg,#0A0A0B 0%,#160f1a 30%,#2A1A2E 54%,#43243a 66%,#6b3a3e 77%,#8a4a3e 77.2%)",
        }}
      >
        {/* stars, fading out toward the horizon */}
        <img src={stars} alt="" width={1200} height={700} style={{ position: "absolute", left: 0, top: 0, opacity: 0.55 }} />
        <div style={{ position: "absolute", left: 0, top: 260, width: 1200, height: 240, background: "linear-gradient(180deg,rgba(42,26,46,0),#43243a 70%,#6b3a3e)" }} />

        {/* the moon, with its halo */}
        <div style={{ position: "absolute", left: 760, top: -20, width: 440, height: 440, borderRadius: 220, background: "radial-gradient(circle, rgba(244,233,208,.2), rgba(244,233,208,0) 68%)" }} />
        <img src={moon} alt="" width={300} height={300} style={{ position: "absolute", left: 830, top: 50, opacity: 0.92 }} />

        {/* the moon as a unit circle, like the hero: a turning radius, its cosine, and a drip to the ground */}
        <svg width={1200} height={630} viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
          <path d="M1022 200 A42 42 0 0 0 1006 167" fill="none" stroke="#FF5B1F" strokeWidth="2.5" />
          <line x1="980" y1="200" x2="1068" y2="200" stroke="#EDEAE3" strokeOpacity=".75" strokeWidth="2" strokeDasharray="5 5" />
          <line x1="980" y1="200" x2="1068" y2="89" stroke="#F4E9D0" strokeWidth="2.5" />
          <rect x="1064" y="89" width="8" height={HORIZON - 89} fill="#FF5B1F" opacity=".22" />
          <rect x="1067" y="89" width="2" height={HORIZON - 89} fill="#FF5B1F" />
          <ellipse cx="1068" cy={HORIZON} rx="26" ry="5" fill="none" stroke="#ffb27a" strokeWidth="1.5" strokeOpacity=".8" />
          <circle cx="980" cy="200" r="4" fill="#F4E9D0" />
          <circle cx="1068" cy="89" r="8" fill="#FF5B1F" />
        </svg>

        {/* warm light low on the horizon, then the ground and its glowing edge */}
        <div style={{ position: "absolute", left: 300, top: HORIZON - 120, width: 900, height: 120, background: "radial-gradient(ellipse 50% 100% at 60% 100%, rgba(255,140,80,.45), rgba(255,91,31,0) 75%)" }} />
        <img src={ground} alt="" width={1800} height={600} style={{ position: "absolute", left: -300, top: HORIZON }} />
        <div style={{ position: "absolute", left: 0, top: HORIZON, width: 1200, height: 144, background: "linear-gradient(180deg, rgba(224,132,84,.28), rgba(10,10,11,0) 55%)" }} />
        <div style={{ position: "absolute", left: 0, top: HORIZON - 2, width: 1200, height: 3, background: "linear-gradient(90deg, rgba(255,91,31,0) 15%, #FF5B1F 55%, #ffb27a 64%, #FF5B1F 74%, rgba(255,91,31,0) 96%)" }} />

        {/* a dark wash behind the type so it reads over the sky */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 820, height: 630, background: "radial-gradient(ellipse 60% 55% at 22% 45%, rgba(10,10,11,.55), rgba(10,10,11,0) 100%)" }} />

        <div style={{ position: "relative", display: "flex", flexDirection: "column", padding: "56px 72px 0", width: "100%" }}>
          {/* logo: the ring with its orbiting dot */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", display: "flex", width: 30, height: 30, borderRadius: 15, border: "2px solid #EDEAE3" }}>
              <div style={{ position: "absolute", left: 13, top: 7, width: 10, height: 10, borderRadius: 5, background: "#FF5B1F" }} />
            </div>
            <div style={{ fontFamily: "Instrument Serif", fontSize: 34, letterSpacing: -0.4 }}>Manition</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 70, fontFamily: "Instrument Serif", fontSize: 132, lineHeight: 0.9, letterSpacing: -4.6 }}>
            <div>Say it.</div>
            <div style={{ fontStyle: "italic", color: "#FF5B1F" }}>Watch it move.</div>
          </div>

          <div style={{ marginTop: 34, fontSize: 27, lineHeight: 1.4, color: "#d6d2ca" }}>
            Describe the math in a sentence. Get a rendered animation back.
          </div>
        </div>

        <div style={{ position: "absolute", left: 72, top: 552, display: "flex", alignItems: "center", gap: 14, fontFamily: "Geist Mono", fontSize: 17, letterSpacing: 2.6, color: "#FF5B1F" }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: "#FF5B1F" }} />
          <div>JOIN THE WAITLIST</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Instrument Serif", data: serif, style: "normal", weight: 400 },
        { name: "Instrument Serif", data: serifItalic, style: "italic", weight: 400 },
        { name: "Geist", data: sans, style: "normal", weight: 400 },
        { name: "Geist Mono", data: mono, style: "normal", weight: 500 },
      ],
    },
  );
}
