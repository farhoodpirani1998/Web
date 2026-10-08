import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/shared/hooks/useReducedMotion";

/**
 * Animates a number counting up from 0 to `target` once its element
 * scrolls into view, easing out cubically over `durationMs` (Website
 * Frontend Architecture §12, §13, §25, §26).
 *
 * Ported from the approved Figma design's inline `useCountUp` hook —
 * same `IntersectionObserver` (fires once at 30% visibility)
 * + `requestAnimationFrame` easing approach, no animation library
 * dependency. Unlike the Figma source, this respects
 * `useReducedMotion()`: with reduced motion, the target value renders
 * immediately instead of counting up.
 *
 * @param target - the final integer value to count up to.
 * @param durationMs - animation duration in milliseconds (default 2200,
 * matching Figma).
 */
export function useCountUp(target: number, durationMs = 2200) {
  const prefersReducedMotion = useReducedMotion();
  const [count, setCount] = useState(prefersReducedMotion ? target : 0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion, started]);

  useEffect(() => {
    if (prefersReducedMotion || !started) return;

    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (startTimestamp === null) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [prefersReducedMotion, started, target, durationMs]);

  return { count, ref };
}
