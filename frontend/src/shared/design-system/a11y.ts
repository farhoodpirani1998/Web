/**
 * Accessibility helpers (§12, §13, §26) — shared class-string constants
 * so every new interactive primitive in this Sprint composes the same
 * focus/visibility treatment instead of redeclaring it.
 *
 * Existing Sprint 2A primitives (`Button`, `Badge`, `Link`) already
 * inline an equivalent focus-ring string of their own; they are left
 * untouched here (out of scope for this Sprint) but should adopt this
 * constant the next time any of them is touched, to fully retire the
 * duplication.
 */
export const FOCUS_RING_CLASSNAME =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** Visually hides content while keeping it in the accessibility tree. */
export const SR_ONLY_CLASSNAME = "sr-only";
