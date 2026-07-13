import * as React from "react";

import { Typography, type TypographyProps } from "@/shared/design-system/components/Typography";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface HeadingProps extends Omit<TypographyProps, "as" | "variant"> {
  /**
   * Semantic heading level (1–6). Drives both the rendered tag and the
   * default visual scale — keep document structure and appearance in
   * sync unless `as` is explicitly overridden (§26 accessibility: never
   * skip heading levels for a visual effect).
   */
  level?: HeadingLevel;
  /** Override the rendered tag while keeping the level's visual scale. */
  as?: HeadingTag;
}

/**
 * Content-agnostic heading primitive (§12, §13, §26). Always renders a
 * real `h1`–`h6` element so the document outline stays correct for
 * assistive technology, even when `as` is used to decouple visual size
 * from semantic level.
 */
const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 2, as, weight = "semibold", ...props }, ref) => {
    const tag: HeadingTag = as ?? (`h${level}` as HeadingTag);

    return (
      <Typography
        ref={ref as React.Ref<HTMLElement>}
        as={tag}
        variant={`h${level}`}
        weight={weight}
        {...props}
      />
    );
  },
);
Heading.displayName = "Heading";

export { Heading };
