import * as React from "react";

import { FOCUS_RING_CLASSNAME } from "@/shared/design-system/a11y";
import { cn } from "@/shared/utils/cn";

export interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
}

/**
 * Accessibility primitive (§12, §13, §26): a "Skip to content" link,
 * hidden until keyboard-focused, letting keyboard/screen-reader users
 * bypass repeated chrome. Defaults to `#main-content`, matching the
 * landmark id `AppLayout` already exposes.
 *
 * This component is presentational only — mounting it inside
 * `AppLayout` (alongside the future Navbar) is a layout-composition
 * decision left to the phase that adds that chrome, not this Sprint.
 */
const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(
  ({ href = "#main-content", className, children = "Skip to main content", ...props }, ref) => (
    <a
      ref={ref}
      href={href}
      className={cn(
        "sr-only z-50 rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground shadow-md",
        "focus:not-sr-only focus:fixed focus:start-4 focus:top-4",
        FOCUS_RING_CLASSNAME,
        className,
      )}
      {...props}
    >
      {children}
    </a>
  ),
);
SkipLink.displayName = "SkipLink";

export { SkipLink };
