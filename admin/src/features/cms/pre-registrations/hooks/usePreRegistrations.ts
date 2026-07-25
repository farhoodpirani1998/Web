import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchPreRegistrationList } from "../api";
import type { CmsPreRegistration, CmsPreRegistrationStatus } from "../types";

/**
 * Fetches the Pre-Registrations list (optionally filtered by status),
 * for `PreRegistrationsPage`. Same shape as `features/cms/faq/hooks/useFaqs`,
 * minus anything reorder-related — this list has no manual ordering
 * (see `types.ts`), so it's sorted by submission time server-side and
 * `setPreRegistrations` here is only used to reconcile a status change
 * in place, not to reorder.
 */
export interface UsePreRegistrationsResult {
  preRegistrations: CmsPreRegistration[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setPreRegistrations: Dispatch<SetStateAction<CmsPreRegistration[]>>;
}

export function usePreRegistrations(
  status?: CmsPreRegistrationStatus,
): UsePreRegistrationsResult {
  const [preRegistrations, setPreRegistrations] = useState<CmsPreRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchPreRegistrationList(status)
      .then((list) => {
        if (!cancelled) setPreRegistrations(list);
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
  }, [status, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  return { preRegistrations, isLoading, error, refetch, setPreRegistrations };
}
