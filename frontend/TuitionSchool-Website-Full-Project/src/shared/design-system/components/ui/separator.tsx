import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/utils/cn";

/**
 * Content-agnostic divider primitive (§12, §13), matching the Radix/
 * shadcn `Separator` API shape (`orientation`, `decorative`) without
 * adding a new Radix dependency for a single-purpose element.
 */
const separatorVariants = cva("shrink-0 bg-border", {
  variants: {
    orientation: {
      horizontal: "h-px w-full",
      vertical: "h-full w-px",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {
  /**
   * Purely visual separator with no semantic meaning (default). Set to
   * `false` when the separator also conveys a real thematic break, so
   * it's exposed to assistive technology as `role="separator"` (§26).
   */
  decorative?: boolean;
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation ?? undefined}
      className={cn(separatorVariants({ orientation, className }))}
      {...props}
    />
  ),
);
Separator.displayName = "Separator";

export { Separator, separatorVariants };
