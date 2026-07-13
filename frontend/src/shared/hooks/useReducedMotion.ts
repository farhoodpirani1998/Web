import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

/**
 * Accessibility + motion helper (§12, §13, §25, §26) built on the
 * existing `useMediaQuery` hook. `globals.css` already disables
 * animation/transition durations globally under
 * `@media (prefers-reduced-motion: reduce)`; this hook exposes the same
 * signal to components that need to branch in JS (e.g. skip an
 * enter/exit animation entirely rather than just shortening it).
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
