import type { Metadata } from "next";

/* Shared link-preview fields. A page's openGraph replaces the layout's whole, so each page builds its own from here. */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://manition.pro").replace(/\/+$/, "");

const OG = { siteName: "Manition", type: "website", locale: "en_US" } as const;

/* app/opengraph-image.tsx draws it; a page that sets openGraph loses the inherited file image, so it is named here */
export const OG_ALT = "Manition - Say it. Watch it move. Describe the math, get a rendered animation back.";
const IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: OG_ALT, type: "image/png" };

export function pageMeta(title: string, description: string, path = "/"): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...OG, title, description, url: path, images: [IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [IMAGE] },
  };
}
