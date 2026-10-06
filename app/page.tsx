import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import NightHome from "./components/home/NightHome";

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Manition - say it, watch it move",
  description: "Describe what you want to explain in plain words and get an animated video back.",
};

export default function Home() {
  return <NightHome fontClass={`${instrument.variable} ${geist.variable} ${geistMono.variable}`} />;
}
