export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export type Ease = (t: number) => number;

export const Easing: Record<
  "linear" | "easeOutCubic" | "easeInOutCubic" | "easeOutQuart" | "easeOutSine",
  Ease
> = {
  linear: (t) => t,
  easeOutCubic: (t) => {
    const u = t - 1;
    return u * u * u + 1;
  },
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeOutQuart: (t) => {
    const u = t - 1;
    return 1 - u * u * u * u;
  },
  easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
};

/** 0 before `a`, 1 after `b`, linear in between. */
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1);

/** Rises over [a,b], holds, falls over [c,d]. */
export const band = (t: number, a: number, b: number, c: number, d: number) =>
  seg(t, a, b) * (1 - seg(t, c, d));
