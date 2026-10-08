import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/utils/cn";

/**
 * Content-agnostic flex-layout primitive (§12, §13). Covers the common
 * "row/column of things with a gap" case so features never hand-roll
 * `flex`/`gap-*` utilities directly.
 */
const stackVariants = cva("flex", {
  variants: {
    direction: {
      row: "flex-row",
      column: "flex-col",
      rowReverse: "flex-row-reverse",
      columnReverse: "flex-col-reverse",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
  },
  defaultVariants: {
    direction: "column",
    align: "stretch",
    justify: "start",
    gap: "md",
    wrap: false,
  },
});

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  as?: React.ElementType;
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ as: Comp = "div", direction, align, justify, gap, wrap, className, ...props }, ref) => {
    return (
      <Comp
        ref={ref}
        className={cn(stackVariants({ direction, align, justify, gap, wrap, className }))}
        {...props}
      />
    );
  },
);
Stack.displayName = "Stack";

export { Stack, stackVariants };
