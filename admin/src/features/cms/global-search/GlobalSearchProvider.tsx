import { createContext, useContext, type ReactNode } from "react";

import { CommandPalette } from "./CommandPalette";
import { useGlobalSearch } from "./useGlobalSearch";

interface GlobalSearchContextValue {
  openSearch: () => void;
}

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null);

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

/** Throws outside `GlobalSearchProvider` — same fail-fast convention as `useAuth`. */
export function useGlobalSearchContext(): GlobalSearchContextValue {
  const context = useContext(GlobalSearchContext);
  if (!context) {
    throw new Error("useGlobalSearchContext must be used within a GlobalSearchProvider");
  }
  return context;
}
