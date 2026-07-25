import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchMenuList } from "../api";
import type { CmsMenu } from "../types";

/**
 * Fetches the Menu list, for `MenusPage`. Same shape as
 * `features/cms/portal-links/hooks/usePortalLinks` — no status filter
 * (Menus have no draft/published/archived lifecycle, see `types.ts`),
 * so there's nothing to parameterize the fetch by.
 *
 * `setMenus` is exposed for the same reason `usePortalLinks` exposes
 * `setLinks`: callers may need to patch the list in place after a
 * create/update without a full refetch.
 */
export interface UseMenusResult {
  menus: CmsMenu[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setMenus: Dispatch<SetStateAction<CmsMenu[]>>;
}

export function useMenus(): UseMenusResult {
  const [menus, setMenus] = useState<CmsMenu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchMenuList()
      .then((list) => {
        if (!cancelled) setMenus(list);
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

  return { menus, isLoading, error, refetch, setMenus };
}
