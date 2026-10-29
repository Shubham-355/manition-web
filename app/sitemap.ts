import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/meta";

/* The public pages. /unsubscribe stays out: it is per-person and already marked noindex. */
const PAGES: [path: string, priority: number, changeFrequency: "weekly" | "monthly"][] = [
  ["/", 1, "weekly"],
  ["/features", 0.8, "monthly"],
  ["/gallery", 0.8, "weekly"],
  ["/pricing", 0.7, "monthly"],
  ["/docs", 0.6, "monthly"],
  ["/blog", 0.6, "weekly"],
  ["/about", 0.5, "monthly"],
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(([path, priority, changeFrequency]) => ({ url: SITE_URL + (path === "/" ? "" : path), priority, changeFrequency }));
}
