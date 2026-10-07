import type { Metadata } from "next";
import FeaturesView from "./FeaturesView";
import { nightFonts } from "../lib/night-fonts";

export const metadata: Metadata = {
  title: "Features - Manition",
  description: "Describe it, generate real Manim, render on cloud GPUs, and keep a library of every scene.",
};

export default function Features() {
  return <FeaturesView fontClass={nightFonts} />;
}
