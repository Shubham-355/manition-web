import type { Metadata } from "next";
import { pageMeta } from "../lib/meta";
import DocsView from "./DocsView";
import { nightFonts } from "../lib/night-fonts";

export const metadata: Metadata = pageMeta("Docs - Manition", "Guides for writing prompts, working with the generated code, rendering and exports.", "/docs");

export default function Docs() {
  return <DocsView fontClass={nightFonts} />;
}
