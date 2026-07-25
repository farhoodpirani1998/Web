import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchMenuItemList } from "../api";
import type { CmsMenuItem } from "../types";

/**
 * Fetches the flat item list for one menu (`menuId`), for
 * `MenusPage`'s selected-menu panel. Deliberately fetches without a
 * `parentId` filter — same "flat list, tree assembled client-side"
 * convention `fetchMenuItemList`'s own doc comment describes — so
 * `MenuItemTree` can group the result by `parentId` itself instead of
 * issuing one request per level.
 *
 * `menuId` of `undefined` (no menu selected yet) skips the fetch
 * entirely and clears the list, same idiom `useMediaById` uses for an
 * absent id.
 *
 * `setItems` is exposed so the owning page can patch the list
 * optimistically during drag-reorder, same reasoning as
 * `usePortalLinks` exposing `setLinks`.
 */
export interface UseMenuItemsResult {
  items: CmsMenuItem[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setItems: Dispatch<SetStateAction<CmsMenuItem[]>>;
}

export function useMenuItems(menuId: string | undefined): UseMenuItemsResult {
  const [items, setItems] = useState<CmsMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    if (!menuId) {
      setItems([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchMenuItemList(menuId)
      .then((list) => {
        if (!cancelled) setItems(list);
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
  }, [menuId, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  return { items, isLoading, error, refetch, setItems };
}
