import * as React from "react";

import { SR_ONLY_CLASSNAME } from "@/shared/design-system/a11y";
import { cn } from "@/shared/utils/cn";

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: React.ElementType;
}

/**
 * Accessibility primitive (§12, §13, §26): renders content that is
 * available to assistive technology but not visually shown. Use this
 * instead of ad-hoc `className="sr-only"` so the pattern has one name
 * and one place to change (e.g. `IconButton`'s hidden label already
 * uses the equivalent utility inline; new code should use this
 * component instead).
 */
const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ as: Comp = "span", className, ...props }, ref) => (
    <Comp ref={ref} className={cn(SR_ONLY_CLASSNAME, className)} {...props} />
  ),
);
VisuallyHidden.displayName = "VisuallyHidden";

export { VisuallyHidden };
