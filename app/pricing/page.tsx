import type { Metadata } from "next";
import PricingView from "./PricingView";
import { nightFonts } from "../lib/night-fonts";

export const metadata: Metadata = {
  title: "Pricing - Manition",
  description: "Pricing you help decide. Free, Pro and Team plans, with founder rates for the waitlist.",
};

export default function Pricing() {
  return <PricingView fontClass={nightFonts} />;
}
