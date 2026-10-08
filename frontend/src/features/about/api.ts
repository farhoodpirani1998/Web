import { apiClient } from "@/shared/api";

import type { AboutPageContent, PublicAboutDto } from "./types";

/**
 * Request functions for the `about` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `about` feature aware of
 * the endpoint's URL — `useAboutPage` and any future consumer call
 * `fetchAboutPage`, never `apiClient` directly.
 *
 * The real endpoint (`GET /public/about`) returns a singleton object
 * (`{ title, body, image, seo, structuredData, updatedAt }`), not the
 * `AboutPageContent` section shape the page's components render — see
 * `./types.ts`'s doc comment — so, same as `campuses`'s `fetchCampuses`
 * and `teachers`'s `fetchTeachers`, the response is adapted via
 * `toAboutPageContent` before it reaches any caller.
 */
export async function fetchAboutPage(): Promise<AboutPageContent> {
  const response = await apiClient.get<PublicAboutDto>("/about");
  return toAboutPageContent(response.data);
}

/**
 * Adapts the wire `PublicAboutDto` into the `AboutPageContent` shape
 * `AboutHero`/`AboutStats`/`AboutStory`/`AboutValues`/`AboutTimeline`/
 * `AboutTeam` already render.
 *
 * Locale: Phase 1 ships Persian-only (§28), so every `Translatable`
 * field resolves `.fa` directly, same as `campuses`'s `toCampus` and
 * `teachers`'s `toTeacher`.
 *
 * Known contract gap: the backend's `AboutPage` entity only carries
 * `title`/`body` (see `./types.ts`'s doc comment) — no `stats`/
 * `values`/`timeline`/`team` concept exists at all, so those map to
 * `[]` rather than inventing entries. Each section component already
 * treats an empty/absent list as "fall back to local placeholder
 * copy" (`data.stats.length > 0 ? data.stats : fallbackStats`, and
 * so on), so this degrades to the existing placeholder UI rather than
 * rendering an empty section. `faq` is likewise always `[]` — flagged
 * only for shape-completeness, since `AboutFAQ` reads from the
 * separate `@/features/faq`'s `useFaq()` hook, not this field.
 *
 * `hero.description` and `story.paragraphs` both have to be derived
 * from the single `body` field the backend does provide: `body` is
 * split on blank lines into paragraphs, and the first paragraph does
 * double duty as the Hero's short lead-in text — same "degrade
 * gracefully rather than fabricate data" approach `campuses`'s
 * `toCampus` uses for its own `body`-vs-`excerpt` gap. This is flagged
 * as a remaining risk, not silently papered over.
 *
 * `seo`/`structuredData` are the one pair of fields copied straight
 * through unchanged — `AboutPage` passes them to the shared `<Seo />`
 * component (`@/shared/seo`, §21) rather than any section component
 * rendering them.
 */
function toAboutPageContent(dto: PublicAboutDto): AboutPageContent {
  const title = dto.title.fa;
  const paragraphs = (dto.body?.fa ?? "")
    .split(/\r?\n\s*\r?\n|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  return {
    hero: {
      title,
      description: paragraphs[0] ?? "",
    },
    stats: [],
    story: {
      title,
      paragraphs,
    },
    values: [],
    timeline: [],
    team: [],
    faq: [],
    seo: dto.seo,
    structuredData: dto.structuredData,
  };
}
