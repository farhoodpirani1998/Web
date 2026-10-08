import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/utils/cn";

/**
 * Content-agnostic max-width/gutter primitive (§12, §13). This is the
 * one place page-width and horizontal gutter decisions live — features
 * should compose `Container`, not hardcode `max-w-*`/`px-*` themselves.
 */
const containerVariants = cva("mx-auto w-full px-4 sm:px-6 lg:px-8", {
  variants: {
    size: {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      "2xl": "max-w-screen-2xl",
      prose: "max-w-prose",
      full: "max-w-none",
    },
  },
  defaultVariants: {
    size: "xl",
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  as?: React.ElementType;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ as: Comp = "div", size, className, ...props }, ref) => {
    return (
      <Comp ref={ref} className={cn(containerVariants({ size, className }))} {...props} />
    );
  },
);
Container.displayName = "Container";

export { Container, containerVariants };
