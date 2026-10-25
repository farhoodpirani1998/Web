import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/cn";

/**
 * Loading-placeholder primitive. A single pulsing block whose shape is
 * set via `className` (width/height/rounding) — keeps it tiny and fully
 * composable.
 */
const skeletonVariants = cva("animate-pulse bg-muted motion-reduce:animate-none", {
  variants: {
    shape: {
      rect: "rounded-md",
      circle: "rounded-full",
      text: "h-4 rounded",
    },
  },
  defaultVariants: {
    shape: "rect",
  },
});

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, shape, ...props }, ref) => (
    <div
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn(skeletonVariants({ shape, className }))}
      {...props}
    />
  ),
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
