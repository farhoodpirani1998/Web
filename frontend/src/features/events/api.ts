import { apiClient } from "@/shared/api";
import { formatPersianDate, formatPersianTime } from "@/shared/utils/formatDate";

import type {
  Event,
  PublicEventDetailDto,
  PublicEventListItemDto,
  PublicPaginatedResponse,
} from "./types";

/**
 * Request functions for the `events` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `events` feature aware of
 * the endpoint's URL — `useEvents` and any future consumer call
 * `fetchEvents`, never `apiClient` directly.
 *
 * The real endpoint (`GET /public/events`) is paginated
 * (`{ items, meta }`) and, by default (`when=upcoming`), already
 * soonest-first (`startAt` asc — see the controller) — the same
 * "what's happening next" ordering `./data`'s placeholder array uses.
 * `EventList`/`EventDetails` render a flat list with no pagination
 * controls of their own, so `fetchEvents` requests a single page at
 * the Public API's own max page size (see backend
 * `public-api/common/pagination.ts`'s `MAX_LIMIT`) and adapts every
 * item in it — same convention as `@/features/news`'s `fetchNews`.
 */
const EVENTS_PAGE_LIMIT = 100;

export async function fetchEvents(): Promise<readonly Event[]> {
  const response = await apiClient.get<PublicPaginatedResponse<PublicEventListItemDto>>(
    "/events",
    { params: { limit: EVENTS_PAGE_LIMIT } },
  );

  return response.data.items.map(toEvent);
}

/**
 * Fetches one event's full detail response (`GET /public/events/:slug`).
 * Same rationale as `@/features/news`'s `fetchNewsBySlug`: returned as
 * the raw `PublicEventDetailDto` rather than adapted into `Event` — no
 * page/component consumes it yet (§7 — Events has no per-event route)
 * — with `seo`/`structuredData` preserved exactly as the backend
 * returns them.
 */
export async function fetchEventBySlug(slug: string): Promise<PublicEventDetailDto> {
  const response = await apiClient.get<PublicEventDetailDto>(`/events/${slug}`);
  return response.data;
}

/**
 * Adapts one wire `PublicEventListItemDto` into the `Event` shape
 * `EventCard`/`EventList`/`EventDetails` already render.
 *
 * Known contract gap, same as `@/features/news`'s `toNewsItem`: the
 * list DTO only carries `excerpt`, never the event's full `body` —
 * that field only exists on the `GET /public/events/:slug` detail
 * response, and `EventDetails` renders every event inline on one page
 * (§7 — no per-event route) rather than through that per-slug
 * endpoint. Fetching the detail endpoint once per list item to fill
 * in `detailedDescription` would mean N extra requests every time the
 * events list loads, so — same "degrade gracefully rather than
 * fabricate data" approach `toNewsItem` uses — `detailedDescription`
 * falls back to the same `excerpt` text `description` already shows.
 * This is flagged in the audit report as a remaining risk, not
 * silently papered over.
 */
function toEvent(dto: PublicEventListItemDto): Event {
  const excerpt = dto.excerpt?.fa ?? "";

  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title.fa,
    description: excerpt,
    detailedDescription: excerpt,
    category: dto.category ?? "",
    date: formatPersianDate(dto.startAt),
    time: formatEventTime(dto),
    location: dto.location?.fa ?? "",
    image: {
      alt: dto.featuredImage?.altText ?? dto.title.fa,
      src: dto.featuredImage?.url,
    },
    tags: dto.tags ?? [],
  };
}

/**
 * Renders `startAt`/`endAt`/`allDay` into the single human-readable
 * "time" string `EventCard`/`EventDetails` display alongside `date`.
 * All-day events (`allDay: true`) have no meaningful clock time —
 * `startAt`/`endAt` on those rows are calendar-date boundaries, not
 * times of day (see the entity's own `allDay` doc comment) — so those
 * render a fixed label instead of formatting midnight/midnight as
 * "۰۰:۰۰ تا ۰۰:۰۰". A present `endAt` renders as a "start تا end"
 * range; its absence (a single point-in-time event) renders just the
 * start time.
 */
function formatEventTime(dto: PublicEventListItemDto): string {
  if (dto.allDay) return "تمام روز";

  const start = formatPersianTime(dto.startAt);
  const end = dto.endAt ? formatPersianTime(dto.endAt) : "";

  return end ? `${start} تا ${end}` : start;
}
