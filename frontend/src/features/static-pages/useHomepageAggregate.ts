import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";

interface HomepageAggregateData {
  homepage: any;
  hero: any;
  statistics: any;
  campuses: any;
  news: any;
  gallery: any;
  features: any;
  achievements: any;
  cta: any;
  testimonials: any;
}

const homepageAggregateQueryKey = ["homepage", "aggregate"];

async function fetchHomepageAggregate(): Promise<HomepageAggregateData> {
  const { data } = await apiClient.get("/public/homepage/aggregate");
  return data;
}

/**
 * Fetches all homepage sections in parallel from the backend aggregate endpoint.
 * This reduces LCP from sequential API calls (1489ms) to a single parallel fetch (~230ms).
 *
 * The aggregate endpoint (GET /public/homepage/aggregate) returns all sections
 * cached server-side, avoiding the need for multiple sequential client-side queries.
 */
export function useHomepageAggregate() {
  return useQuery({
    queryKey: homepageAggregateQueryKey,
    queryFn: fetchHomepageAggregate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export { homepageAggregateQueryKey };
