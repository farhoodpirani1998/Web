/**
 * Motion helpers (§12, §13, §25). Named, reusable animation-class
 * presets built on the `tailwindcss-animate` plugin already wired in
 * `tailwind.config.js` — no new animation dependency, no per-feature
 * ad-hoc `animate-in fade-in ...` strings duplicated across components.
 *
 * `globals.css` already disables all animation/transition durations
 * under `prefers-reduced-motion: reduce`, so these presets are safe to
 * use directly; reach for `useReducedMotion` only when a component must
 * skip an animation's *logic* (not just its duration), e.g. an
 * autoplaying carousel.
 */
export const MOTION_DURATIONS = {
  fast: "duration-150",
  base: "duration-200",
  slow: "duration-300",
} as const;

export const motionPresets = {
  fadeIn: "animate-in fade-in " + MOTION_DURATIONS.base,
  fadeOut: "animate-out fade-out " + MOTION_DURATIONS.base,
  slideInFromTop: "animate-in fade-in slide-in-from-top-2 " + MOTION_DURATIONS.base,
  slideInFromBottom: "animate-in fade-in slide-in-from-bottom-2 " + MOTION_DURATIONS.base,
  slideInFromStart: "animate-in fade-in slide-in-from-left-2 rtl:slide-in-from-right-2 " + MOTION_DURATIONS.base,
  scaleIn: "animate-in fade-in zoom-in-95 " + MOTION_DURATIONS.base,
} as const;

export type MotionPreset = keyof typeof motionPresets;
