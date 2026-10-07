import type { Metadata } from "next";
import AboutView from "./AboutView";
import { nightFonts } from "../lib/night-fonts";

export const metadata: Metadata = {
  title: "About - Manition",
  description: "Math is beautiful when it moves. Why we are building Manition.",
};

export default function About() {
  return <AboutView fontClass={nightFonts} />;
}
