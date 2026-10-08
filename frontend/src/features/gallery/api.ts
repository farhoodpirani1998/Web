import { apiClient } from "@/shared/api";

import type { GalleryItem, PublicGalleryItemDto, PublicPaginatedResponse } from "./types";

/**
 * Request functions for the `gallery` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `gallery` feature aware of
 * the endpoint's URL — `useGallery` and any future consumer call
 * `fetchGallery`, never `apiClient` directly.
 *
 * The real endpoint (`GET /public/gallery`) is paginated
 * (`{ items, meta }`, ordered by `position`) and gates on
 * `featureFlags.galleryEnabled` by returning an empty page rather than
 * a 404 — see the controller's doc comment. `GalleryGrid`/
 * `GalleryDetails`/`HomeGallery` render a flat list with no pagination
 * controls of their own, so `fetchGallery` requests a single page at
 * the Public API's own max page size (see backend
 * `public-api/common/pagination.ts`'s `MAX_LIMIT`) and adapts every
 * item in it — that covers today's gallery sizes without introducing
 * pagination UI this phase is out of scope for.
 */
const GALLERY_PAGE_LIMIT = 100;

export async function fetchGallery(): Promise<readonly GalleryItem[]> {
  const response = await apiClient.get<PublicPaginatedResponse<PublicGalleryItemDto>>(
    "/gallery",
    { params: { limit: GALLERY_PAGE_LIMIT } },
  );

  return response.data.items.map(toGalleryItem);
}

/**
 * Adapts one wire `PublicGalleryItemDto` into the `GalleryItem` shape
 * `GalleryCard`/`GalleryGrid`/`GalleryDetails` already render.
 *
 * The backend models a gallery item with a single optional `caption`
 * (prose, translatable) plus a `category` label — there is no separate
 * "title" vs. "longer description" field. `caption.fa` is used for
 * both `title` (the card's short label) and `description` (the
 * details panel's longer text) since that's the only prose the CMS
 * actually captures for a photo; components render whichever of the
 * two a given section needs.
 */
function toGalleryItem(dto: PublicGalleryItemDto): GalleryItem {
  const caption = dto.caption?.fa;

  return {
    id: dto.id,
    title: caption ?? dto.category ?? "",
    category: dto.category ?? "",
    image: {
      alt: dto.image?.altText ?? caption ?? "",
      src: dto.image?.url,
    },
    description: caption ?? "",
  };
}
