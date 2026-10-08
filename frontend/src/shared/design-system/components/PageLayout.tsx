import * as React from "react";

import { cn } from "@/shared/utils/cn";
import { Container, type ContainerProps } from "@/shared/design-system/components/Container";

export interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Forwarded to the inner `Container` (§12, §13). Defaults to `xl`. */
  containerSize?: ContainerProps["size"];
}

/**
 * Content-agnostic, per-page composition primitive (§9 "Page
 * Architecture", §12, §13). A page's own responsibility is orchestration
 * (resolving route params, fetching data, composing sections) — not
 * hand-rolling `max-w-*`/vertical-spacing utilities itself. `PageLayout`
 * is the one place that spacing lives, built from `Container` rather
 * than duplicating it, so every page gets the same rhythm without a
 * page needing to know the underlying tokens.
 *
 * Distinct from `ContentWrapper` (`@/app/shell/ContentWrapper`):
 * `ContentWrapper` is the app-shell's `<main>` landmark, rendered once
 * for the whole shell; `PageLayout` is an optional per-page wrapper a
 * page composes *inside* that landmark for its own content.
 */
const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  ({ containerSize = "xl", className, children, ...props }, ref) => {
    return (
      <Container ref={ref} size={containerSize} className={cn("py-8 sm:py-12", className)} {...props}>
        {children}
      </Container>
    );
  },
);
PageLayout.displayName = "PageLayout";

export { PageLayout };
