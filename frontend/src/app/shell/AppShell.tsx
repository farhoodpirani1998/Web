import * as React from "react";

import { SkipLink } from "@/shared/design-system/components/SkipLink";
import { Header } from "@/app/shell/Header";
import { ContentWrapper } from "@/app/shell/ContentWrapper";

export interface AppShellProps {
  children: React.ReactNode;
}

/**
 * The persistent layout shell (§8 "Layout Architecture", §5 "App Shell
 * / Providers"): `SkipLink` + `Header` render once and are never
 * re-mounted on route changes; `children` is whatever the routed
 * content for the current page is.
 *
 * Router-agnostic by design: this component never imports anything from
 * `react-router-dom` and never assumes its `children` is an `<Outlet />`
 * — that wiring belongs to `AppLayout` (§5, §30 "one-way dependency
 * direction": app-shell composition doesn't reach down into routing
 * internals). `Header`'s own nav links are router-aware, which is fine
 * — the requirement is that *this* component stays swappable behind any
 * routing solution, not that nothing under it ever touches the router.
 *
 * Footer/Portal-selector modal (§8) are still out of scope for this
 * Sprint and mount here once their features exist.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SkipLink />
      <Header />
      <ContentWrapper>{children}</ContentWrapper>
      {/* Footer mounts here once the Footer feature exists (§8). */}
    </div>
  );
}
