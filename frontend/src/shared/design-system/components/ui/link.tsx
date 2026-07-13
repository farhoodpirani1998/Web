import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Link as RouterLink } from "react-router-dom";

import { cn } from "@/shared/utils/cn";

const EXTERNAL_HREF_PATTERN = /^([a-z][a-z0-9+.-]*:)?\/\//i;
const NON_ROUTE_PROTOCOLS = /^(mailto|tel):/i;

/**
 * Content-agnostic link primitive (§12, §13). Renders a router `Link`
 * for in-app paths (client-side navigation, no full reload) and a plain
 * `<a>` for external/`mailto:`/`tel:` targets — a feature only ever
 * supplies `href`, never picks the element itself.
 */
const linkVariants = cva(
  "underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
  {
    variants: {
      variant: {
        default: "text-primary underline hover:text-primary/80",
        subtle: "text-foreground hover:text-primary hover:underline",
        muted: "text-muted-foreground hover:text-foreground hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  href: string;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, variant, className, children, ...props }, ref) => {
    const isExternal = EXTERNAL_HREF_PATTERN.test(href) || NON_ROUTE_PROTOCOLS.test(href);

    if (isExternal) {
      const isNewTabProtocol = !NON_ROUTE_PROTOCOLS.test(href);
      return (
        <a
          ref={ref}
          href={href}
          className={cn(linkVariants({ variant, className }))}
          {...(isNewTabProtocol ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <RouterLink
        ref={ref}
        to={href}
        className={cn(linkVariants({ variant, className }))}
        {...props}
      >
        {children}
      </RouterLink>
    );
  },
);
Link.displayName = "Link";

export { Link, linkVariants };
