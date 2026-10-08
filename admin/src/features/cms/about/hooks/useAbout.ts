import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchAbout } from "../api";
import type { CmsAbout } from "../types";

/**
 * Fetches the singleton About row, for `AboutPage`. Same shape as
 * `features/cms/site-settings/hooks/useSiteSettings`: no status/filter
 * param — there is exactly one row, always (`AboutService.onModuleInit`
 * seeds it on startup), so `about` starts `null` only until the
 * initial fetch resolves, never because "there's nothing yet" the way
 * an empty Campuses/Teachers list can be.
 *
 * `setAbout` is exposed (same reasoning as `useSiteSettings`'s
 * `setSettings`) so `AboutForm`/`AboutStatusControl`/`AboutRevisionsPanel`
 * can update the visible state directly from each action's own
 * response, without a full `refetch()` — every `PATCH`/`POST`
 * `/admin/about*` endpoint already returns the complete updated row.
 */
export interface UseAboutResult {
  about: CmsAbout | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setAbout: Dispatch<SetStateAction<CmsAbout | null>>;
}

export function useAbout(): UseAboutResult {
  const [about, setAbout] = useState<CmsAbout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchAbout()
      .then((data) => {
        if (!cancelled) setAbout(data);
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

  return { about, isLoading, error, refetch, setAbout };
}
