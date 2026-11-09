import { apiClient } from "@/shared/api";
import { env } from "@/shared/config/env";

import type {
  PublicPaginatedResponse,
  PublicTextbookDetailDto,
  PublicTextbookListItemDto,
} from "./types";

const TEXTBOOKS_PAGE_LIMIT = 100;

export async function fetchTextbooks(query = ""): Promise<PublicTextbookListItemDto[]> {
  const response = await apiClient.get<
    PublicPaginatedResponse<PublicTextbookListItemDto>
  >("/textbooks", {
    params: { page: 1, limit: TEXTBOOKS_PAGE_LIMIT, ...(query ? { q: query } : {}) },
  });
  return response.data.items;
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
