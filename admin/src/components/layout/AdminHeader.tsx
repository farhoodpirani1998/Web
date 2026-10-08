/**
 * Admin header.
 *
 * Sprint 1.3 scope: structure only, with an empty placeholder area
 * reserved for a future user menu.
 * Sprint 2.4B scope: fills that placeholder with the signed-in admin's
 * email and a logout button (task 4). No explicit navigation call is
 * needed here: clearing the token flips `useAuth()`'s status to
 * `"unauthenticated"`, and `RequireAuth` (wrapping `AdminLayout`, which
 * this header lives inside) reacts to that and redirects to `/login`.
 *
 * Sprint — Persistent Login: logout now also calls the backend's
 * `POST /admin/auth/logout` to revoke the refresh-token cookie server-
 * side — otherwise a cleared-but-still-valid refresh token would let
 * `AuthProvider`'s next-mount bootstrap silently log the admin back in.
 * `clearAuth()` still runs regardless of whether that call succeeds
 * (`logout()`'s own doc comment) so a network hiccup can never leave
 * this button appearing to do nothing.
 *
 * Sprint — CMS UX: Global Search + Command Palette: adds a search
 * trigger next to the "CMS Admin" title that calls `openSearch()`
 * (`@/features/cms/global-search`, provided by `GlobalSearchProvider`
 * wrapping `AdminLayout`). This is a second way to open the palette —
 * Ctrl/Cmd+K works from anywhere already — for admins who don't know
 * the shortcut yet.
 */
import { useState } from "react";

import { clearAuth, logout, useAuth } from "@/features/auth";
import { useGlobalSearchContext } from "@/features/cms/global-search";

export function AdminHeader() {
  const { admin } = useAuth();
  const { openSearch } = useGlobalSearchContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // Best-effort: the session is being ended locally either way —
      // see `logout()`'s doc comment.
    } finally {
      clearAuth();
    }
    // No `finally` reset of isLoggingOut: clearAuth() flips this
    // component out of the tree (RequireAuth redirects to /login)
    // before it would matter.
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-slate-900">CMS Admin</span>

        <button
          type="button"
          onClick={openSearch}
          className="hidden items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50 sm:flex"
        >
          <span>Search…</span>
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans text-xs text-slate-400">
            Ctrl/⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {admin ? (
          <span className="hidden text-sm text-slate-600 sm:inline">{admin.email}</span>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
