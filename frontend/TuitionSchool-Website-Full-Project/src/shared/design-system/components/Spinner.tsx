import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/utils/cn";

/**
 * Sprint 2B addition: `size`/`tone` variants via `cva`, layered on
 * additively. The defaults reproduce the original hardcoded classes
 * exactly, so every existing call site (e.g. `PageLoader`) renders
 * identically without changes.
 */
const spinnerVariants = cva("animate-spin rounded-full border-2", {
  variants: {
    size: {
      sm: "h-4 w-4",
      default: "h-5 w-5",
      lg: "h-8 w-8 border-[3px]",
    },
    tone: {
      primary: "border-muted border-t-primary",
      /** Inherits the current text color — for use on colored/dark surfaces. */
      current: "border-current/25 border-t-current",
    },
  },
  defaultVariants: {
    size: "default",
    tone: "primary",
  },
});

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  /** Accessible label read by assistive technology (§26). */
  label?: string;
}

/**
 * Content-agnostic loading primitive (§12, §19). Sized and styled
 * through the design system only — never overridden per-feature.
 */
export function Spinner({ className, label = "Loading", size, tone }: SpinnerProps) {
  return (
    <div role="status" className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn(spinnerVariants({ size, tone }))} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
