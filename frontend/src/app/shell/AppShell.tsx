import * as React from "react";
import { useEffect } from "react";

import { SkipLink } from "@/shared/design-system/components/SkipLink";
import { Header } from "@/app/shell/Header";
import { ContentWrapper } from "@/app/shell/ContentWrapper";
import { Footer } from "@/app/shell/Footer";
import { SiteSettingsHead } from "@/features/site";

const HOLO_FOIL_RUNTIME_URL = "https://cdn.aidesigner.ai/effects/runtime/v1.js";

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
 * `Footer` follows the same persistent, router-agnostic pattern as
 * `Header` (§8) — it renders once, below the routed content, and is
 * never re-mounted on route changes.
 *
 * Portal-selector modal (Figma Design Reference §4.3) is owned by
 * `Header` — see that file's doc comment — since its two triggers
 * (`Header`'s own button, `MobileNavigation`'s button) both live under
 * `Header`.
 */
export function AppShell({ children }: AppShellProps) {
  useEffect(() => {
    if (document.querySelector(`script[src="${HOLO_FOIL_RUNTIME_URL}"]`)) return;

    const script = document.createElement("script");
    script.src = HOLO_FOIL_RUNTIME_URL;
    script.async = true;
    script.onerror = () => console.error("Failed to load the visual effects runtime.");
    document.head.appendChild(script);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SkipLink />
      <SiteSettingsHead />
      <Header />
      <ContentWrapper>{children}</ContentWrapper>
      <Footer />
    </div>
  );
}
