import type { Metadata } from "next";
import DocsView from "./DocsView";
import { nightFonts } from "../lib/night-fonts";

export const metadata: Metadata = {
  title: "Docs - Manition",
  description: "Guides for writing prompts, working with the generated code, rendering and exports.",
};

export default function Docs() {
  return <DocsView fontClass={nightFonts} />;
}
