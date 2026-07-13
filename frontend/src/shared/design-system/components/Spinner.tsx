import { cn } from "@/shared/utils/cn";

export interface SpinnerProps {
  className?: string;
  /** Accessible label read by assistive technology (§26). */
  label?: string;
}

/**
 * Content-agnostic loading primitive (§12, §19). Sized and styled
 * through the design system only — never overridden per-feature.
 */
export function Spinner({ className, label = "Loading" }: SpinnerProps) {
  return (
    <div role="status" className={cn("inline-flex items-center gap-2", className)}>
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary"
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
