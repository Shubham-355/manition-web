import type { Metadata } from "next";
import GalleryView from "./GalleryView";
import { nightFonts } from "../lib/night-fonts";

export const metadata: Metadata = {
  title: "Gallery - Manition",
  description: "Scenes made from a single sentence. Every clip started as one plain-language prompt.",
};

export default function Gallery() {
  return <GalleryView fontClass={nightFonts} />;
}
