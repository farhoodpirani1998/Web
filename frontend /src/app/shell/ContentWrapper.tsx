import * as React from "react";

import { cn } from "@/shared/utils/cn";

export interface ContentWrapperProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

/**
 * The routed-content landmark (§26 "Semantic HTML first"). Exposes the
 * `#main-content` id that `SkipLink` targets by default, and is the
 * single place the "content area fills remaining height" layout rule
 * lives, so `AppShell` doesn't redeclare it.
 *
 * Router-agnostic like `AppShell` (§5, §30): it renders whatever
 * `children` it's given and has no opinion on where those children come
 * from (`<Outlet />`, a Storybook story, a test render, ...).
 */
export function ContentWrapper({ children, className, ...props }: ContentWrapperProps) {
  return (
    <main id="main-content" className={cn("flex-1", className)} {...props}>
      {children}
    </main>
  );
}
