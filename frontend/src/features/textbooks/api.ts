import { apiClient } from "@/shared/api";
import { env } from "@/shared/config/env";

import type {
  PublicPaginatedResponse,
  PublicTextbookDetailDto,
  PublicTextbookListItemDto,
  PublicTextbookTaxonomies,
  TextbookListParams,
} from "./types";

const TEXTBOOKS_PAGE_LIMIT = 12;

export async function fetchTextbooks(
  filters: TextbookListParams = {},
): Promise<PublicPaginatedResponse<PublicTextbookListItemDto>> {
  const params = {
    page: filters.page ?? 1,
    limit: TEXTBOOKS_PAGE_LIMIT,
    ...(filters.q?.trim() ? { q: filters.q.trim() } : {}),
    ...(filters.stage ? { stage: filters.stage } : {}),
    ...(filters.grade ? { grade: filters.grade } : {}),
    ...(filters.field ? { field: filters.field } : {}),
    ...(filters.subject ? { subject: filters.subject } : {}),
    ...(filters.year ? { year: filters.year } : {}),
    ...(filters.sort ? { sort: filters.sort } : {}),
    ...(filters.order ? { order: filters.order } : {}),
  };
  const response = await apiClient.get<
    PublicPaginatedResponse<PublicTextbookListItemDto>
  >("/textbooks", { params });
  return response.data;
}

export async function fetchTextbookTaxonomies(): Promise<PublicTextbookTaxonomies> {
  const response = await apiClient.get<PublicTextbookTaxonomies>(
    "/textbooks/taxonomies",
  );
  return response.data;
}

export async function fetchTextbookBySlug(
  slug: string,
): Promise<PublicTextbookDetailDto> {
  const response = await apiClient.get<PublicTextbookDetailDto>(
    "/textbooks/" + encodeURIComponent(slug),
  );
  return response.data;
}

/** Resolve the API-provided download path against the public API origin. */
export function getTextbookDownloadUrl(path: string): string {
  return new URL(path, env.publicApiBaseUrl).toString();
}

export function getTextbookCoverUrl(path: string | null): string | null {
  return path ? new URL(path, env.publicApiBaseUrl).toString() : null;
}
