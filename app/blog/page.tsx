import type { Metadata } from "next";
import BlogView from "./BlogView";
import { nightFonts } from "../lib/night-fonts";

export const metadata: Metadata = {
  title: "Blog - Manition",
  description: "Notes from the studio: product updates, deep dives on animating math, and the changelog.",
};

export default function Blog() {
  return <BlogView fontClass={nightFonts} />;
}
