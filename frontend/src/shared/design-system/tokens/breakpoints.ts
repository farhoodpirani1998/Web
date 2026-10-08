/**
 * Breakpoint tokens (§12, §13) — mirrors Tailwind's default `screens`
 * scale (unchanged by `tailwind.config.js`, which only overrides the
 * `container` plugin's screens, not the responsive-prefix breakpoints
 * themselves). This is the single source of truth for any JS-side
 * responsive logic (`useBreakpoint`, `useMediaQuery`); a Tailwind class
 * like `lg:` and a JS check against `BREAKPOINTS.lg` must always agree.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export const BREAKPOINT_ORDER: Breakpoint[] = ["sm", "md", "lg", "xl", "2xl"];
