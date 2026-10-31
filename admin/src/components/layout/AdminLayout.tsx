/**
 * Admin layout shell — the responsive frame around every `/admin/*` page.
 *
 * Owns two pieces of shell state:
 *   - `collapsed` — desktop icon-rail toggle, persisted to localStorage so
 *     the choice survives reloads.
 *   - `mobileOpen` — the drawer at < lg. Under `lg` the sidebar is a fixed
 *     off-canvas panel with a dismissible overlay; at `lg+` it's a
 *     persistent column (rail or full width, per `collapsed`).
 *
 * Structure otherwise unchanged: `GlobalSearchProvider` wraps everything
 * (mounting the Command Palette + Ctrl/Cmd+K), `<main>` handles overflow
 * only, and `PageContainer` owns page padding/width.
 */
import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";

import { cn } from "@/lib/cn";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { GlobalSearchProvider } from "@/features/cms/global-search";
import { Toast } from "@/components/ui/Toast";

const COLLAPSE_STORAGE_KEY = "admin:sidebar-collapsed";

function readInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true";
}

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(readInitialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  // Focus-trap inside mobile drawer (tab indexing).
  useEffect(() => {
    if (!mobileOpen || !drawerRef.current) return;
    const drawer = drawerRef.current;
    const focusable = drawer.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    drawer.addEventListener("keydown", onKey);
    return () => drawer.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <GlobalSearchProvider>
      <a href="#main-content" className="skip-link">محتوای اصلی</a>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop sidebar — persistent at lg+, rail or full per `collapsed`. */}
        <aside
          className={cn(
            "hidden shrink-0 transition-[width] duration-300 ease-in-out lg:block",
            collapsed ? "w-[4.75rem]" : "w-64",
          )}
        >
          <AdminSidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((value) => !value)}
          />
        </aside>

        {/* Mobile drawer + overlay. */}
        <div
          className={cn(
            "fixed inset-0 z-40 lg:hidden",
            mobileOpen ? "pointer-events-auto" : "pointer-events-none",
          )}
          aria-hidden={!mobileOpen}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            tabIndex={mobileOpen ? 0 : -1}
            aria-label="بستن منوی ناوبری"
            className={cn(
              "absolute inset-0 bg-primary/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
              mobileOpen ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            ref={drawerRef}
            className={cn(
              "absolute inset-y-0 start-0 w-64 shadow-2xl transition-transform duration-300 ease-in-out",
              mobileOpen ? "translate-x-0" : "translate-x-full",
            )}
          >
            <AdminSidebar collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader onOpenMenu={() => setMobileOpen(true)} />

          <main id="main-content" className="min-w-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </GlobalSearchProvider>
  );
}
