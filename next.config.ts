import type { NextConfig } from "next";

// basic protections on every response: no framing by other sites, no MIME guessing, no full URLs leaked to other origins, no device APIs
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["nodemailer"],
  async headers() {
    // the scene clips, posters and art keep their names when replaced, so a week fresh plus a day of background refresh, not forever
    const media = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }];
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      { source: "/scenes/:path*", headers: media },
      { source: "/v3/:path*", headers: media },
      { source: "/film/:path*", headers: media },
    ];
  },
};

export default nextConfig;
