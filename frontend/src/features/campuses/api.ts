import { apiClient } from "@/shared/api";

import type { Campus, PublicCampusDetailDto, PublicCampusListItemDto } from "./types";

/**
 * Request functions for the `campuses` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `campuses` feature aware
 * of the endpoint's URL — `useCampuses` and any future consumer call
 * `fetchCampuses`, never `apiClient` directly.
 *
 * The real endpoint (`GET /public/campuses`) returns a flat,
 * position-ordered array directly (no `{ items, meta }` pagination
 * envelope — see the controller's doc comment: "a small curated set
 * of campuses, not a growing feed"), so this stays a single request
 * with no page-size params, same shape this file already had.
 */
export async function fetchCampuses(): Promise<readonly Campus[]> {
  const response = await apiClient.get<PublicCampusListItemDto[]>("/campuses");
  return response.data.map(toCampus);
}

/**
 * Fetches one campus's full detail response
 * (`GET /public/campuses/:slug`). Same rationale as `@/features/news`'s
 * `fetchNewsBySlug`: returned as the raw `PublicCampusDetailDto` rather
 * than adapted into `Campus` — no page/component consumes it yet (no
 * per-campus route) — with `seo`/`structuredData` preserved exactly as
 * the backend returns them.
 */
export async function fetchCampusBySlug(slug: string): Promise<PublicCampusDetailDto> {
  const response = await apiClient.get<PublicCampusDetailDto>(`/campuses/${slug}`);
  return response.data;
}

/**
 * Adapts one wire `PublicCampusListItemDto` into the `Campus` shape
 * `CampusCard`/`CampusList`/`CampusDetails` already render.
 *
 * Locale: Phase 1 ships Persian-only (§28), so every `Translatable`
 * field resolves `.fa` directly, same as `news`'s `toNewsItem`.
 *
 * Known contract gap: the list DTO only carries `excerpt`, never the
 * campus's full `body` — that field only exists on the
 * `GET /public/campuses/:slug` detail response, and `CampusDetails`
 * renders every campus inline on one page (no per-campus route)
 * rather than through that per-slug endpoint. Fetching the detail
 * endpoint once per list item to fill in `body` would mean N extra
 * requests every time the campuses list loads, so — same "degrade
 * gracefully rather than fabricate data" approach `news`'s
 * `toNewsItem` uses for its `body` field — `detailedDescription`
 * falls back to the same `excerpt` text `description` already shows.
 * This is flagged as a remaining risk, not silently papered over.
 *
 * `area` and `features` have no backend equivalent at all (see
 * `./types.ts`'s doc comment) — left `undefined` rather than invented,
 * and rendered conditionally by `CampusCard`/`CampusDetails`.
 */
function toCampus(dto: PublicCampusListItemDto): Campus {
  const description = dto.excerpt?.fa ?? "";
  const name = dto.title.fa;
  const phone = dto.phone;

  return {
    id: dto.id,
    slug: dto.slug,
    name,
    description,
    detailedDescription: description,
    address: dto.address?.fa,
    contact: {
      phone,
      phoneHref: phone ? `tel:${phone}` : undefined,
      email: dto.email,
    },
    image: {
      alt: dto.featuredImage?.altText ?? name,
      src: dto.featuredImage?.cardUrl ?? dto.featuredImage?.url,
    },
  };
}
