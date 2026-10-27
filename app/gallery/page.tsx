import type { Metadata } from "next";
import { pageMeta } from "../lib/meta";
import GalleryView from "./GalleryView";
import { nightFonts } from "../lib/night-fonts";

export const metadata: Metadata = pageMeta("Gallery - Manition", "Scenes made from a single sentence. Every clip started as one plain-language prompt.", "/gallery");

export default function Gallery() {
  return <GalleryView fontClass={nightFonts} />;
}
