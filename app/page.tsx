import type { Metadata } from "next";
import { pageMeta } from "./lib/meta";
import NightHome from "./components/home/NightHome";
import { nightFonts } from "./lib/night-fonts";

export const metadata: Metadata = pageMeta("Manition - say it, watch it move", "Describe what you want to explain in plain words and get an animated video back.", "/");

export default function Home() {
  return <NightHome fontClass={nightFonts} />;
}
