import type { CSSProperties } from "react";

// Convert a CSS property name to its React (camelCase / vendor) form.
function toCamel(prop: string): string {
  const p = prop.trim();
  if (p.startsWith("--")) return p; // preserve custom properties
  const leadingDash = p.startsWith("-");
  const parts = p.split("-").filter(Boolean);
  return parts
    .map((part, i) =>
      i === 0 && !leadingDash
        ? part
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");
}

// Map the design's literal font-family names onto the next/font CSS variables.
function mapFontFamily(value: string): string {
  return value
    .replace(/'Space Grotesk'/g, "var(--font-space-grotesk)")
    .replace(/'IBM Plex Sans'/g, "var(--font-ibm-plex-sans)")
    .replace(/'IBM Plex Mono'/g, "var(--font-ibm-plex-mono)");
}

/**
 * Parse a raw CSS declaration string (as written inline in the design) into a
 * React style object, so the design's exact style strings can be reproduced
 * verbatim. Values never contain semicolons or extra colons in this design, so
 * a simple split is sufficient.
 */
export function parseStyle(css: string): CSSProperties {
  const style: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const idx = decl.indexOf(":");
    if (idx < 0) continue;
    const rawProp = decl.slice(0, idx).trim();
    let value = decl.slice(idx + 1).trim();
    if (!rawProp || !value) continue;
    const key = toCamel(rawProp);
    if (key === "fontFamily") value = mapFontFamily(value);
    style[key] = value;
  }
  return style as CSSProperties;
}
