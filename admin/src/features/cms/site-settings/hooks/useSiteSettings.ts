import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchSiteSettings } from "../api";
import type { CmsSiteSettings } from "../types";

/**
 * Fetches the singleton Site Settings row, for `SiteSettingsPage`. No
 * status/filter param (unlike `useFaqs`/`useMediaList`) — there is
 * exactly one row, always (`SiteSettingsService.onModuleInit` seeds it
 * on startup), so `settings` starts `null` only until the initial
 * fetch resolves, never because "there's nothing yet" the way an empty
 * FAQ/media list can be.
 *
 * `setSettings` is exposed (same reasoning as `useFaqs`'s `setFaqs`) so
 * `SettingsForm` can update the visible state directly from each
 * section's own PATCH response, without a full `refetch()` — every
 * `PATCH /site-settings/*` endpoint already returns the complete
 * updated row.
 */
export interface UseSiteSettingsResult {
  settings: CmsSiteSettings | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setSettings: Dispatch<SetStateAction<CmsSiteSettings | null>>;
}

export function useSiteSettings(): UseSiteSettingsResult {
  const [settings, setSettings] = useState<CmsSiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchSiteSettings()
      .then((data) => {
        if (!cancelled) setSettings(data);
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

  return { settings, isLoading, error, refetch, setSettings };
}
