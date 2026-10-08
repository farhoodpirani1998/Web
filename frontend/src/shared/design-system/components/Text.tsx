import * as React from "react";

import { Typography, type TypographyProps } from "@/shared/design-system/components/Typography";

type TextTag = "p" | "span" | "div" | "label";
type TextVariant = "lead" | "body" | "bodySm" | "caption" | "overline";

export interface TextProps extends Omit<TypographyProps, "as" | "variant"> {
  as?: TextTag;
  variant?: TextVariant;
}

/**
 * Content-agnostic body-copy primitive (§12, §13). Covers everything
 * that isn't a heading — paragraphs, leads, captions, overlines — off
 * the same shared type scale as `Heading`.
 */
const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ as = "p", variant = "body", ...props }, ref) => {
    return <Typography ref={ref} as={as} variant={variant} {...props} />;
  },
);
Text.displayName = "Text";

export { Text };
