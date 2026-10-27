import type { Metadata } from "next";
import { pageMeta } from "../lib/meta";
import AboutView from "./AboutView";
import { nightFonts } from "../lib/night-fonts";

export const metadata: Metadata = pageMeta("About - Manition", "Math is beautiful when it moves. Why we are building Manition.", "/about");

export default function About() {
  return <AboutView fontClass={nightFonts} />;
}
