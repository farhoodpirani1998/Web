import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import {
  BREAKPOINTS,
  BREAKPOINT_ORDER,
  type Breakpoint,
} from "@/shared/design-system/tokens/breakpoints";

/**
 * Responsive helper (§12, §13) built on the existing `useMediaQuery`
 * hook — never re-implements matchMedia listening, only composes it.
 *
 * Returns whether the viewport is at least as wide as `breakpoint`,
 * mirroring Tailwind's `min-width` responsive-prefix semantics (e.g.
 * `useBreakpoint("lg")` tracks the same threshold as an `lg:` class).
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);
}

/**
 * Convenience helper for the most common responsive check: whether the
 * viewport is below the `md` breakpoint (Tailwind's usual mobile/desktop
 * split). Prefer `useBreakpoint` directly for any other threshold.
 */
export function useIsMobile(): boolean {
  return !useBreakpoint("md");
}

/**
 * Returns the current named breakpoint (the widest one the viewport
 * currently satisfies), useful for logic that branches on more than a
 * single boolean threshold.
 */
export function useActiveBreakpoint(): Breakpoint | "base" {
  const isSm = useBreakpoint("sm");
  const isMd = useBreakpoint("md");
  const isLg = useBreakpoint("lg");
  const isXl = useBreakpoint("xl");
  const is2xl = useBreakpoint("2xl");

  const matches: Record<Breakpoint, boolean> = { sm: isSm, md: isMd, lg: isLg, xl: isXl, "2xl": is2xl };

  for (let i = BREAKPOINT_ORDER.length - 1; i >= 0; i -= 1) {
    const bp = BREAKPOINT_ORDER[i];
    if (matches[bp]) return bp;
  }
  return "base";
}
