import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { fetchContentSearchIndex } from "./contentSearchRegistry";
import { getNavSearchResults } from "./navRegistry";
import type { ContentSearchResult, GlobalSearchResult, NavSearchResult } from "./types";

const NAV_RESULTS: NavSearchResult[] = getNavSearchResults();

export interface UseGlobalSearchResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  query: string;
  setQuery: (value: string) => void;
  results: GlobalSearchResult[];
  isContentLoading: boolean;
}

/**
 * Owns the Command Palette's open/closed state, the Ctrl/Cmd+K (and
 * Escape) global shortcut, the search query, and the combined nav +
 * content result list.
 *
 * Nav results (`ADMIN_NAV_ITEMS`, via `navRegistry.ts`) are static and
 * filtered on every keystroke for free. Content results
 * (`contentSearchRegistry.ts`) are fetched once — the first time the
 * palette is opened in this session — and cached in `contentIndex`
 * for the rest of the session rather than re-fetched on every open or
 * every keystroke; that keeps this feature from hammering ~13 list
 * endpoints per keystroke, in keeping with the sprint's "avoid
 * backend changes"/"search and quick navigation only" scope. A hard
 * page reload is the only way to pick up content created after the
 * index was built — acceptable for this v1 scope.
 */
export function useGlobalSearch(): UseGlobalSearchResult {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [contentIndex, setContentIndex] = useState<ContentSearchResult[]>([]);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const hasRequestedIndex = useRef(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Global Ctrl/Cmd+K toggle and Escape-to-close. Registered once for
  // the lifetime of this hook (mounted by `GlobalSearchProvider`
  // around `AdminLayout`), not per-render.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isShortcut) {
        event.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Clear the query whenever the palette closes, so it reopens fresh.
  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  // Lazily build the content index the first time the palette opens.
  useEffect(() => {
    if (!isOpen || hasRequestedIndex.current) return;
    hasRequestedIndex.current = true;
    setIsContentLoading(true);

    fetchContentSearchIndex()
      .then(setContentIndex)
      .finally(() => setIsContentLoading(false));
  }, [isOpen]);

  const results = useMemo<GlobalSearchResult[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return NAV_RESULTS;

    const matchedNav = NAV_RESULTS.filter((item) => item.title.toLowerCase().includes(trimmed));
    const matchedContent = contentIndex.filter(
      (item) =>
        item.title.toLowerCase().includes(trimmed) ||
        Boolean(item.subtitle?.toLowerCase().includes(trimmed)),
    );

    return [...matchedNav, ...matchedContent];
  }, [query, contentIndex]);

  return { isOpen, open, close, query, setQuery, results, isContentLoading };
}
