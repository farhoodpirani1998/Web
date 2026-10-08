import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/utils/cn";

/**
 * Content-agnostic vertical-rhythm primitive (§12, §13). Owns the
 * top/bottom spacing and background tone between page sections; a
 * feature composes `Section` (optionally wrapping a `Container` inside
 * it) rather than hardcoding `py-*` at the callsite.
 */
const sectionVariants = cva("w-full", {
  variants: {
    spacing: {
      none: "py-0",
      sm: "py-8 sm:py-10",
      md: "py-12 sm:py-16",
      lg: "py-16 sm:py-24",
      xl: "py-24 sm:py-32",
    },
    tone: {
      transparent: "bg-transparent",
      default: "bg-background",
      muted: "bg-muted",
      primary: "bg-primary text-primary-foreground",
    },
  },
  defaultVariants: {
    spacing: "md",
    tone: "transparent",
  },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  as?: React.ElementType;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ as: Comp = "section", spacing, tone, className, ...props }, ref) => {
    return (
      <Comp
        ref={ref}
        className={cn(sectionVariants({ spacing, tone, className }))}
        {...props}
      />
    );
  },
);
Section.displayName = "Section";

export { Section, sectionVariants };
