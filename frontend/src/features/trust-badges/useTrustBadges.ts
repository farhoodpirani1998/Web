import { useQuery } from "@tanstack/react-query";
import { fetchTrustBadges } from "./api";

export const trustBadgesQueryKey = ["trust-badges"] as const;

export function useTrustBadges() {
  return useQuery({
    queryKey: trustBadgesQueryKey,
    queryFn: fetchTrustBadges,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
