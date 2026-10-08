import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchPortalLinkList } from "../api";
import type { CmsPortalLink } from "../types";

/**
 * Fetches the Portal Links list, for `PortalLinksPage`. Same shape as
 * `features/cms/faq/hooks/useFaqs` — no status filter (unlike
 * `useFaqs`, Portal Links has no draft/published/archived lifecycle,
 * see `types.ts`), so there's nothing to parameterize the fetch by.
 *
 * `setLinks` is exposed for the same reason `useFaqs` exposes
 * `setFaqs`: `PortalLinksPage` needs to update the visible order
 * optimistically during drag-reorder — `PATCH /portal-links/reorder`
 * returns void, so there's no response body to reconcile the list
 * against.
 */
export interface UsePortalLinksResult {
  links: CmsPortalLink[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setLinks: Dispatch<SetStateAction<CmsPortalLink[]>>;
}

export function usePortalLinks(): UsePortalLinksResult {
  const [links, setLinks] = useState<CmsPortalLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchPortalLinkList()
      .then((list) => {
        if (!cancelled) setLinks(list);
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
  }, [refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  return { links, isLoading, error, refetch, setLinks };
}
