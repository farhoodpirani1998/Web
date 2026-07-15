import * as React from "react";

import { cn } from "@/shared/utils/cn";

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width-to-height ratio, e.g. `16 / 9`, `1`, `4 / 3`. Defaults to `16 / 9`. */
  ratio?: number;
}

/**
 * Content-agnostic aspect-ratio primitive (§12, §13). Uses the native
 * CSS `aspect-ratio` property directly (broadly supported by the
 * project's target browsers) instead of `@radix-ui/react-aspect-ratio`
 * or the legacy padding-bottom hack — no new dependency, no extra
 * wrapper markup.
 */
const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 16 / 9, className, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{ aspectRatio: ratio, ...style }}
      className={cn("relative w-full overflow-hidden", className)}
      {...props}
    />
  ),
);
AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
