import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/utils/cn";

/**
 * Content-agnostic CSS-grid primitive (§12, §13). Column counts are a
 * fixed set of variants (rather than an arbitrary number) so every
 * class name is statically present in source — required for Tailwind's
 * JIT scanner to pick it up; a dynamically-built `grid-cols-${n}`
 * string would silently fail to compile.
 */
const gridVariants = cva("grid", {
  variants: {
    cols: {
      "1": "grid-cols-1",
      "2": "grid-cols-1 sm:grid-cols-2",
      "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      "6": "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
      "12": "grid-cols-4 sm:grid-cols-6 lg:grid-cols-12",
    },
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
  },
  defaultVariants: {
    cols: "3",
    gap: "md",
    align: "stretch",
  },
});

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  as?: React.ElementType;
}

/**
 * Responsive grid: each `cols` preset already scales down to fewer
 * columns below `lg` (and `sm`), so a single `cols` value is usually
 * enough — pass a custom `className` (e.g. `md:grid-cols-5`) only for
 * one-off layouts that don't fit the shared presets.
 */
const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ as: Comp = "div", cols, gap, align, className, ...props }, ref) => {
    return (
      <Comp
        ref={ref}
        className={cn(gridVariants({ cols, gap, align, className }))}
        {...props}
      />
    );
  },
);
Grid.displayName = "Grid";

export { Grid, gridVariants };
