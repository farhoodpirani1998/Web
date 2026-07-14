import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/utils/cn";

/**
 * Shared type scale — the single source of truth for every text style in
 * the app (§12, §13). `Heading` and `Text` are thin, semantic wrappers
 * around this scale; neither should redeclare font-size/weight utilities
 * of its own. Adding a new text style means adding a variant here, never
 * hardcoding classes in a feature.
 */
export const typographyVariants = cva("text-foreground", {
  variants: {
    variant: {
      h1: "font-heading text-4xl font-bold tracking-tight scroll-m-20 lg:text-5xl",
      h2: "font-heading text-3xl font-semibold tracking-tight scroll-m-20 lg:text-4xl",
      h3: "font-heading text-2xl font-semibold tracking-tight scroll-m-20 lg:text-3xl",
      h4: "font-heading text-xl font-semibold tracking-tight scroll-m-20 lg:text-2xl",
      h5: "font-heading text-lg font-semibold tracking-tight scroll-m-20 lg:text-xl",
      h6: "font-heading text-base font-semibold tracking-tight scroll-m-20 lg:text-lg",
      lead: "text-xl leading-7 text-muted-foreground",
      body: "text-base leading-7",
      bodySm: "text-sm leading-6",
      caption: "text-xs leading-5 text-muted-foreground",
      overline: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
    },
    color: {
      inherit: "text-inherit",
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      brandGold: "text-brand-gold",
      destructive: "text-destructive",
    },
    align: {
      start: "text-start",
      center: "text-center",
      end: "text-end",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    truncate: {
      true: "truncate",
    },
  },
  defaultVariants: {
    variant: "body",
    color: "default",
    align: "start",
  },
});

export type TypographyVariants = VariantProps<typeof typographyVariants>;

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    TypographyVariants {
  /** Element/tag rendered to the DOM. Defaults to "p". */
  as?: React.ElementType;
}

/**
 * Polymorphic, content-agnostic text primitive (§12, §13). `Heading` and
 * `Text` cover the common cases — reach for `Typography` directly only
 * when neither fits (e.g. a `<figcaption>` styled as `caption`).
 */
const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ as: Comp = "p", variant, color, align, weight, truncate, className, ...props }, ref) => {
    return (
      <Comp
        ref={ref}
        className={cn(typographyVariants({ variant, color, align, weight, truncate, className }))}
        {...props}
      />
    );
  },
);
Typography.displayName = "Typography";

export { Typography };
