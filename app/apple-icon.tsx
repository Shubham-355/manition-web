import { ImageResponse } from "next/og";

/* The home-screen icon iOS uses: the nav logo's ring with its orange dot, full bleed (iOS rounds the corners itself). */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0B" }}>
        <div style={{ position: "relative", display: "flex", width: 104, height: 104, borderRadius: 52, border: "8px solid #EDEAE3" }}>
          <div style={{ position: "absolute", left: 47, top: 17, width: 34, height: 34, borderRadius: 17, background: "#FF5B1F" }} />
        </div>
      </div>
    ),
    size,
  );
}
