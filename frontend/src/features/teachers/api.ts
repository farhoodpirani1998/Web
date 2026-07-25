import { apiClient } from "@/shared/api";

import type { PublicTeacherDetailDto, PublicTeacherListItemDto, Teacher } from "./types";

/**
 * Request functions for the `teachers` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `teachers` feature aware
 * of the endpoint's URL — `useTeachers` and any future consumer call
 * `fetchTeachers`, never `apiClient` directly.
 *
 * The real endpoint (`GET /public/teachers`) returns a flat,
 * position-ordered array directly (no `{ items, meta }` pagination
 * envelope — see the controller's doc comment: "a small curated set
 * of teachers, not a growing feed"), so this stays a single request
 * with no page-size params, same shape this file already had.
 */
export async function fetchTeachers(): Promise<readonly Teacher[]> {
  const response = await apiClient.get<PublicTeacherListItemDto[]>("/teachers");
  return response.data.map(toTeacher);
}

/**
 * Fetches one teacher's full detail response
 * (`GET /public/teachers/:slug`). Same rationale as
 * `@/features/campuses`'s `fetchCampusBySlug`: returned as the raw
 * `PublicTeacherDetailDto` rather than adapted into `Teacher` — no
 * page/component consumes it yet (no per-teacher route) — with
 * `seo`/`structuredData` preserved exactly as the backend returns
 * them.
 */
export async function fetchTeacherBySlug(slug: string): Promise<PublicTeacherDetailDto> {
  const response = await apiClient.get<PublicTeacherDetailDto>(`/teachers/${slug}`);
  return response.data;
}

/**
 * Adapts one wire `PublicTeacherListItemDto` into the `Teacher` shape
 * `TeacherCard`/`TeacherGrid`/`TeacherDetails` already render.
 *
 * Locale: Phase 1 ships Persian-only (§28), so every `Translatable`
 * field resolves `.fa` directly, same as `campuses`'s `toCampus`.
 *
 * Known contract gap: the list DTO only carries `excerpt`, never the
 * teacher's full `bio` — that field only exists on the
 * `GET /public/teachers/:slug` detail response, and `TeacherDetails`
 * renders every teacher inline on one page (no per-teacher route)
 * rather than through that per-slug endpoint. Fetching the detail
 * endpoint once per list item to fill in `bio` would mean N extra
 * requests every time the teachers list loads, so — same "degrade
 * gracefully rather than fabricate data" approach `campuses`'s
 * `toCampus` uses for its own `body`-vs-`excerpt` gap — `bio` falls
 * back to `excerpt`, then `department`, then `""`. This is flagged as
 * a remaining risk, not silently papered over.
 *
 * `specialties` has no backend equivalent at all (see `./types.ts`'s
 * doc comment) — mapped to `[]` rather than invented; `TeacherCard`/
 * `TeacherDetails` already render it via `.map`, so an empty array
 * renders nothing rather than throwing.
 */
function toTeacher(dto: PublicTeacherListItemDto): Teacher {
  const name = dto.fullName;
  const bio = dto.excerpt?.fa ?? dto.department?.fa ?? "";

  return {
    id: dto.id,
    slug: dto.slug,
    name,
    subject: dto.jobTitle.fa,
    bio,
    image: {
      alt: dto.avatar?.altText ?? name,
      src: dto.avatar?.cardUrl ?? dto.avatar?.url,
    },
    specialties: [],
  };
}
