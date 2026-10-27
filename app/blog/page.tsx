import type { Metadata } from "next";
import { pageMeta } from "../lib/meta";
import BlogView from "./BlogView";
import { nightFonts } from "../lib/night-fonts";

export const metadata: Metadata = pageMeta("Blog - Manition", "Notes from the studio: product updates, deep dives on animating math, and the changelog.", "/blog");

export default function Blog() {
  return <BlogView fontClass={nightFonts} />;
}
