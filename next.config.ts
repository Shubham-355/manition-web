import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // nodemailer resolves transports and MIME tables with dynamic requires that
  // the bundler cannot follow, so it has to stay a real node_modules import.
  serverExternalPackages: ["nodemailer"],
};

export default nextConfig;
