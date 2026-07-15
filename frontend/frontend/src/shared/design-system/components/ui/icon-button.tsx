import * as React from "react";

import { Button, type ButtonProps } from "@/shared/design-system/components/ui/button";

export interface IconButtonProps extends Omit<ButtonProps, "size" | "children"> {
  /** The icon to render (e.g. a lucide-react icon element). */
  icon: React.ReactNode;
  /**
   * Required accessible name. An icon-only button has no text content,
   * so assistive technology needs this to announce its purpose (§26).
   */
  "aria-label": string;
}

/**
 * Icon-only button primitive (§12, §13). Deliberately built on top of
 * `Button`/`buttonVariants` rather than redeclaring color/state styles,
 * so the two never drift out of sync (§13 "no duplicated code").
 */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, variant = "ghost", className, ...props }, ref) => {
    return (
      <Button ref={ref} variant={variant} size="icon" className={className} {...props}>
        <span aria-hidden="true">{icon}</span>
      </Button>
    );
  },
);
IconButton.displayName = "IconButton";

export { IconButton };
