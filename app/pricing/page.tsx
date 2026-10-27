import type { Metadata } from "next";
import { pageMeta } from "../lib/meta";
import PricingView from "./PricingView";
import { nightFonts } from "../lib/night-fonts";

export const metadata: Metadata = pageMeta("Pricing - Manition", "Pricing you help decide. Free, Pro and Team plans, with founder rates for the waitlist.", "/pricing");

export default function Pricing() {
  return <PricingView fontClass={nightFonts} />;
}
