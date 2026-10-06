import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

/* The night site's three faces. parseStyle maps the design's literal family names onto these variables. */

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

export const nightFonts = `${instrument.variable} ${geist.variable} ${geistMono.variable}`;
