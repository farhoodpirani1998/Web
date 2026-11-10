/**
 * Accessibility helpers — shared class-string constants so interactive
 * primitives compose the same
 * focus/visibility treatment instead of redeclaring it.
 *
 * Existing primitives (`Button`, `Badge`, `Link`) already
 * inline an equivalent focus-ring string of their own; they should adopt
 * this constant to retire the duplication.
 */
export const FOCUS_RING_CLASSNAME =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** Visually hides content while keeping it in the accessibility tree. */
export const SR_ONLY_CLASSNAME = "sr-only";
