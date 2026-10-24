import * as React from "react";

import { cn } from "@/shared/utils/cn";

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Renders the light-on-dark treatment used on `bg-primary` bands. */
  onDark?: boolean;
}

/**
 * Canonical section/page eyebrow — the single pill+gold-dot label that
 * opens every hero and section header. Previously re-declared inline in
 * each feature (`SchoolsHero`, `NewsHero`, `ContactIntro`, `HomeNews`,
 * the homepage `Hero`, ...) which had already drifted into two
 * different badge styles; this is the one the approved homepage hero
 * uses.
 */
const Eyebrow = React.forwardRef<HTMLSpanElement, EyebrowProps>(
  ({ onDark = false, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold",
        onDark ? "bg-white/10 text-white" : "bg-brand-navy/[0.06] text-brand-navy",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          onDark ? "bg-white" : "bg-brand-gold",
        )}
      />
      {children}
    </span>
  ),
);
Eyebrow.displayName = "Eyebrow";

export { Eyebrow };
