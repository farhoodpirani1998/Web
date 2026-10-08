import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchCta } from "../api";
import type { CmsCta } from "../types";

/**
 * Fetches the singleton CTA row, for `CtaPage`. Same shape as
 * `features/cms/about/hooks/useAbout`: no status/filter param — there
 * is exactly one row, always (`CtaService.onModuleInit` seeds it on
 * startup), so `cta` starts `null` only until the initial fetch
 * resolves, never because "there's nothing yet" the way an empty
 * Campuses/Teachers list can be.
 *
 * `setCta` is exposed (same reasoning as `useAbout`'s `setAbout`) so
 * `CtaForm`/`CtaStatusControl` can update the visible state directly
 * from each action's own response, without a full `refetch()` — every
 * `PATCH /admin/cta*` endpoint already returns the complete updated
 * row.
 */
export interface UseCtaResult {
  cta: CmsCta | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setCta: Dispatch<SetStateAction<CmsCta | null>>;
}

export function useCta(): UseCtaResult {
  const [cta, setCta] = useState<CmsCta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchCta()
      .then((data) => {
        if (!cancelled) setCta(data);
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

  return { cta, isLoading, error, refetch, setCta };
}
