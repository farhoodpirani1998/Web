import type { ReactNode } from "react";

import { CommandPalette } from "./CommandPalette";
import { GlobalSearchContext } from "./globalSearchContext";
import { useGlobalSearch } from "./useGlobalSearch";

/**
 * Mounts the Command Palette once per admin session and exposes
 * `openSearch()` to anything inside it (e.g. `AdminHeader`'s search
 * button) via context — same "provider owns the state, a hook exposes
 * just what callers need" shape as `AuthProvider`/`useAuth`.
 *
 * Wraps `AdminLayout` (see `components/layout/AdminLayout.tsx`), not
 * the whole app: the palette and its Ctrl/Cmd+K shortcut are an
 * authenticated-admin feature — the login page has nothing for it to
 * search or navigate to.
 */
export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const search = useGlobalSearch();

  return (
    <GlobalSearchContext.Provider value={{ openSearch: search.open }}>
      {children}
      <CommandPalette search={search} />
    </GlobalSearchContext.Provider>
  );
}
