import { useCallback, useEffect, useState } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchFaqList } from "../../faq";
import { fetchNewsList } from "../../news";
import { fetchPagesList } from "../../pages";
import { fetchPreRegistrationList } from "../../pre-registrations";

/**
 * Aggregates the four Dashboard KPI counts from each module's own list
 * endpoint — there is no dedicated `/admin/dashboard/stats` endpoint,
 * and none of the four underlying lists is large enough (per the CMS
 * README's "no list endpoint paginates" note) to justify adding one
 * just to avoid a `.length` on the client. Only this hook is aware
 * that the KPI cards are computed this way; each `fetch*List` call
 * still goes through its own module's `api.ts`, so this file never
 * touches a `/pages`, `/news`, `/faqs`, or `/pre-registrations` URL
 * directly (same "only that module's api.ts knows its URL" rule every
 * module already follows).
 *
 * - Published Pages / Published News: `status: "published"` filter,
 *   matching the KPI card's label.
 * - FAQ count: unfiltered — the KPI card is labeled "FAQ count", not
 *   "Published FAQ count", so this deliberately counts every FAQ
 *   regardless of status.
 * - New Pre-Registrations: `status: "new"` — the admin triage state
 *   (see `pre-registrations/types.ts`), not a publish status.
 *
 * The four requests run in parallel via `Promise.allSettled` rather
 * than `Promise.all`: a admin missing permission for one module (e.g.
 * no `website.content:read`) shouldn't blank out every other KPI card
 * — each count independently reflects whether its own fetch
 * succeeded. `error` is only set when every request fails, since that
 * usually means a shared problem (network, auth) rather than one
 * module's data being unavailable.
 */
export interface DashboardStats {
  publishedPagesCount: number | null;
  publishedNewsCount: number | null;
  newPreRegistrationsCount: number | null;
  faqCount: number | null;
}

export interface UseDashboardStatsResult {
  stats: DashboardStats;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

const EMPTY_STATS: DashboardStats = {
  publishedPagesCount: null,
  publishedNewsCount: null,
  newPreRegistrationsCount: null,
  faqCount: null,
};

export function useDashboardStats(): UseDashboardStatsResult {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.allSettled([
      fetchPagesList("published"),
      fetchNewsList("published"),
      fetchFaqList(),
      fetchPreRegistrationList("new"),
    ]).then((results) => {
      if (cancelled) return;

      const [pagesResult, newsResult, faqResult, preRegistrationsResult] = results;

      setStats({
        publishedPagesCount:
          pagesResult.status === "fulfilled" ? pagesResult.value.length : null,
        publishedNewsCount: newsResult.status === "fulfilled" ? newsResult.value.length : null,
        faqCount: faqResult.status === "fulfilled" ? faqResult.value.length : null,
        newPreRegistrationsCount:
          preRegistrationsResult.status === "fulfilled"
            ? preRegistrationsResult.value.length
            : null,
      });

      // Only surface an error banner when every count failed — a
      // single failed module just shows that one card as unavailable
      // (see `DashboardKpiCard`'s handling of a `null` count).
      const allFailed = results.every((result) => result.status === "rejected");
      if (allFailed) {
        const firstRejected = results.find(
          (result): result is PromiseRejectedResult => result.status === "rejected",
        );
        setError((firstRejected?.reason as ApiError) ?? null);
      }

      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  return { stats, isLoading, error, refetch };
}
