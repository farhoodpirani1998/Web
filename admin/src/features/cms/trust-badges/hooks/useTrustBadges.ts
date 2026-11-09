import { useQuery } from "@tanstack/react-query";
import { fetchTrustBadgeList } from "../api";
import type { CmsTrustBadgeStatus } from "../types";

export const trustBadgeKeys = {
  all: ["trust-badges"] as const,
  list: (status?: CmsTrustBadgeStatus) =>
    [...trustBadgeKeys.all, "list", status ?? "all"] as const,
};

export function useTrustBadges(status?: CmsTrustBadgeStatus) {
  const query = useQuery({
    queryKey: trustBadgeKeys.list(status),
    queryFn: () => fetchTrustBadgeList(status),
  });
  return {
    trustBadges: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
