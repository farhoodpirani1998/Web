/**
 * Admin header — sticky top bar of the shell.
 *
 * Owns: the mobile menu trigger (opening the drawer owned by
 * `AdminLayout`), the contextual page title (derived from the nav config
 * so it can never drift from the sidebar), the global-search trigger
 * (`openSearch()` from `@/features/cms/global-search`, alongside the
 * Ctrl/Cmd+K shortcut), a notifications button, and the account dropdown.
 *
 * Logout keeps the existing contract: it calls the backend's
 * `POST /admin/auth/logout` to revoke the refresh-token cookie
 * server-side, then `clearAuth()` regardless of that call's outcome (so a
 * network hiccup can't strand the user "looking logged in"). No explicit
 * navigation — clearing auth flips `useAuth()` to `unauthenticated` and
 * `RequireAuth` redirects to `/login`.
 */
import { KeyRound, LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

import { Avatar } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { clearAuth, logout, useAuth } from "@/features/auth";
import { ChangePasswordDialog, ROLE_LABELS } from "@/features/cms/admin-users";
import { useGlobalSearchContext } from "@/features/cms/global-search";
import { ADMIN_NAV_ITEMS } from "@/routes/nav.config";
import { formatLongDate } from "@/lib/formatDate";

interface AdminHeaderProps {
  onOpenMenu: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function AdminHeader({
  onOpenMenu,
  theme,
  onToggleTheme,
}: AdminHeaderProps) {
  const { admin } = useAuth();
  const { openSearch } = useGlobalSearchContext();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Longest matching nav route wins, so nested routes still resolve to
  // the module they belong to. Uses segment-aware matching (exact route
  // or route + "/...") to avoid prefix collisions between routes that
  // share a prefix (e.g. "/admin/pages" vs a hypothetical
  // "/admin/pages-extra").
  const currentNavItem = [...ADMIN_NAV_ITEMS]
    .filter(
      (item) =>
        location.pathname === item.route ||
        location.pathname.startsWith(item.route + "/"),
    )
    .sort((a, b) => b.route.length - a.route.length)[0];
  const pageTitle = currentNavItem?.label ?? "داشبورد";

  const initials = admin?.email ? admin.email.slice(0, 2).toUpperCase() : "؟";

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // Best-effort: the session is being ended locally either way.
    } finally {
      clearAuth();
    }
    // No `finally` reset of isLoggingOut: clearAuth() flips this
    // component out of the tree (RequireAuth redirects to /login)
    // before it would matter.
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/85 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
          aria-label="باز کردن منوی ناوبری"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate font-heading text-lg font-bold text-foreground">
            {pageTitle}
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            {formatLongDate()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openSearch}
          className="hidden items-center gap-2 rounded-md border border-input bg-background/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-brand-gold/40 hover:text-foreground md:flex md:min-w-64"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-start">جستجو…</span>
          <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-sans text-[0.7rem] text-muted-foreground">
            Ctrl K
          </kbd>
        </button>

        <button
          type="button"
          onClick={openSearch}
          className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
          aria-label="جستجو"
        >
          <Search className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={theme === "dark" ? "فعال‌کردن حالت روشن" : "فعال‌کردن حالت تاریک"}
          aria-pressed={theme === "dark"}
          title={theme === "dark" ? "حالت روشن" : "حالت تاریک"}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Moon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex min-h-11 min-w-11 items-center gap-2 rounded-full p-0.5 ps-2 transition-colors hover:bg-secondary"
              aria-label="حساب کاربری"
            >
              {admin ? (
                <span className="hidden max-w-40 truncate text-sm text-muted-foreground lg:inline">
                  {admin.email}
                </span>
              ) : null}
              <Avatar
                alt={admin?.email ?? "کاربر"}
                fallback={initials}
                className="bg-primary text-primary-foreground"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="truncate text-sm font-semibold text-foreground">
                {admin?.email ?? "کاربر ناشناس"}
              </span>
              {admin ? (
                <span className="text-xs font-normal text-muted-foreground">
                  {ROLE_LABELS[admin.role]}
                </span>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setIsChangePasswordOpen(true);
              }}
            >
              <KeyRound className="h-4 w-4" />
              <span>تغییر رمز عبور</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                void handleLogout();
              }}
              disabled={isLoggingOut}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? "در حال خروج…" : "خروج از حساب"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isChangePasswordOpen ? (
        <ChangePasswordDialog onCancel={() => setIsChangePasswordOpen(false)} />
      ) : null}
    </header>
  );
}
