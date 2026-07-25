import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchPagesList } from "../api";
import type { CmsPage, CmsPageStatus } from "../types";

/**
 * Fetches the pages list (optionally filtered by status and/or
 * parent), for `PagesPage`. Same shape as
 * `features/cms/news/hooks/useNews.ts` — see that file's top comment
 * for why `setPages` (not just `refetch`) is exposed.
 */
export interface UsePagesResult {
  pages: CmsPage[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setPages: Dispatch<SetStateAction<CmsPage[]>>;
}

export function usePages(status?: CmsPageStatus, parentId?: string): UsePagesResult {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchPagesList(status, parentId)
      .then((list) => {
        if (!cancelled) setPages(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err as ApiError);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, parentId, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  return { pages, isLoading, error, refetch, setPages };
}

/**
 * Fetches the complete, unfiltered page list once — used to populate
 * "parent page" `<select>` options in `PageForm` (and the parent
 * filter in `PageStatusFilter`). A separate hook from `usePages` (not
 * a shared cache) because it deliberately ignores whatever
 * status/parent filter the page list view currently has active: a
 * parent picker needs to offer every page, not just the ones passing
 * the current filter. This is the same `GET /admin/pages` endpoint
 * with no query params — not a separate endpoint.
 */
export interface UsePageOptionsResult {
  options: CmsPage[];
  isLoading: boolean;
}

export function usePageOptions(): UsePageOptionsResult {
  const [options, setOptions] = useState<CmsPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetchPagesList()
      .then((list) => {
        if (!cancelled) setOptions(list);
      })
      .catch(() => {
        // A failed parent-options fetch shouldn't block the rest of the
        // page/form from working — the picker just falls back to "no
        // parent options available" rather than surfacing its own error UI.
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { options, isLoading };
}
