import type { Metadata } from "next";
import { pageMeta } from "../lib/meta";
import FeaturesView from "./FeaturesView";
import { nightFonts } from "../lib/night-fonts";

export const metadata: Metadata = pageMeta("Features - Manition", "Describe it, generate real Manim, render on cloud GPUs, and keep a library of every scene.", "/features");

export default function Features() {
  return <FeaturesView fontClass={nightFonts} />;
}
