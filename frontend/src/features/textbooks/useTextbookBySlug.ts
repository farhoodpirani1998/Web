import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchTextbookBySlug } from "./api";
import type { PublicTextbookDetailDto } from "./types";

export function useTextbookBySlug(slug: string): UseQueryResult<PublicTextbookDetailDto> {
  return useQuery({
    queryKey: ["textbooks", "detail", slug],
    queryFn: () => fetchTextbookBySlug(slug),
    enabled: Boolean(slug),
  });
}
