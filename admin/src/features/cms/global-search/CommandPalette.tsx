import { useEffect, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import type { GlobalSearchResult } from "./types";
import type { UseGlobalSearchResult } from "./useGlobalSearch";

export interface CommandPaletteProps {
  search: UseGlobalSearchResult;
}

/**
 * Ctrl/Cmd+K command palette. Renders nav results (always available,
 * mirroring `AdminSidebar`'s unfiltered `ADMIN_NAV_ITEMS`) and content
 * results (grouped by module, once `useGlobalSearch`'s content index
 * has loaded) in one flat, keyboard-navigable list. Selecting either
 * kind of result navigates to that result's module page and closes
 * the palette — no per-item detail route exists anywhere in this
 * admin (see `types.ts`'s top comment), so a content result's
 * destination is its module's list page, same as clicking that module
 * in the sidebar would do.
 *
 * A plain fixed-overlay modal — same convention `MediaUploadDialog`
 * established as the admin's first one (no shared `Dialog` primitive
 * exists in `components/ui/` yet; see that file's own comment).
 */
export function CommandPalette({ search }: CommandPaletteProps) {
  const { isOpen, close, query, setQuery, results, isContentLoading } = search;
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  function goTo(route: string) {
    navigate(route);
    close();
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = results[activeIndex];
      if (target) goTo(target.route);
    }
  }

  if (!isOpen) return null;

  // Single pass over `results` (already ordered nav-first, then
  // content grouped by module — see `useGlobalSearch`) inserting a
  // group heading whenever the group key changes, rather than
  // re-grouping with a `Map` — keeps row index (used for
  // keyboard/active-row highlighting) equal to array index with no
  // extra lookup.
  const rows: ReactNode[] = [];
  let lastGroupKey: string | null = null;
  results.forEach((result: GlobalSearchResult, index: number) => {
    const groupKey = result.kind === "nav" ? "nav" : result.moduleId;
    if (groupKey !== lastGroupKey) {
      rows.push(
        <p
          key={`group:${groupKey}`}
          className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-slate-400 first:pt-1"
        >
          {result.kind === "nav" ? "Navigation" : result.moduleLabel}
        </p>,
      );
      lastGroupKey = groupKey;
    }

    rows.push(
      <button
        key={result.id}
        type="button"
        onClick={() => goTo(result.route)}
        onMouseEnter={() => setActiveIndex(index)}
        className={`flex w-full flex-col items-start rounded-md px-3 py-2 text-left text-sm ${
          index === activeIndex ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        <span className="font-medium">{result.title}</span>
        {result.kind === "content" && result.subtitle ? (
          <span className="text-xs text-slate-500">{result.subtitle}</span>
        ) : null}
      </button>,
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-24"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="flex max-h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-200 p-3">
          {/* eslint-disable-next-line jsx-a11y/no-autofocus -- opening the palette without a ready-to-type input defeats the point of a Ctrl/Cmd+K shortcut */}
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages and content…"
            aria-label="Search pages and content"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {rows.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-500">
              {isContentLoading ? "Searching…" : "No results found."}
            </p>
          ) : (
            rows
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-xs text-slate-400">
          <span>↑↓ to navigate, Enter to select, Esc to close</span>
          {isContentLoading ? <span>Loading content…</span> : null}
        </div>
      </div>
    </div>
  );
}
