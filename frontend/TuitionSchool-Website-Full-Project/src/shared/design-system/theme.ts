/**
 * Theme helpers (§12, §13, §24) — utilities for reading design tokens
 * at *runtime*, for the rare case a non-CSS API needs a computed value
 * (e.g. passing a color to a `<canvas>` or a charting library that
 * can't consume a CSS variable directly). Everyday styling should keep
 * using Tailwind classes / CSS variables directly — reach for these
 * only when a prop must be a literal value.
 *
 * This module intentionally does not expose a theme *switcher*: per
 * `tokens.css`, dark mode is scaffolded but not a maintained second
 * theme, and wiring one is an explicit product decision outside this
 * design-system layer (§24).
 */

/**
 * Reads a CSS custom property's current computed value (e.g.
 * `getCssVariable("--primary")` → `"219 61% 16%"`). Returns an empty
 * string during server-side rendering, where there is no `document`.
 */
export function getCssVariable(name: string, element?: HTMLElement): string {
  if (typeof window === "undefined") return "";
  const target = element ?? document.documentElement;
  return getComputedStyle(target).getPropertyValue(name).trim();
}

/**
 * Wraps a token's raw HSL channel triplet (Tailwind/shadcn convention,
 * e.g. `"219 61% 16%"`) in a usable `hsl()` color string.
 */
export function hslToken(channels: string): string {
  return `hsl(${channels})`;
}

/**
 * Reads a semantic color token by name and returns a ready-to-use
 * `hsl()` string — e.g. `getThemeColor("primary")` →
 * `"hsl(219 61% 16%)"`.
 */
export function getThemeColor(tokenName: string, element?: HTMLElement): string {
  const channels = getCssVariable(`--${tokenName}`, element);
  return channels ? hslToken(channels) : "";
}
