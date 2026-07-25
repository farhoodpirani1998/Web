/**
 * Types for the CMS CTA module, mirroring the backend `CtaBanner`
 * entity and its DTOs
 * (`backend/src/modules/website/content/cta/entities/cta.entity.ts`,
 * `.../cta/dto/*.ts`). Same "mirror, don't import" reasoning as
 * `features/cms/about/types.ts` and `features/cms/site-settings/types.ts`
 * — the admin frontend and the NestJS backend are separate packages
 * with no shared runtime code path.
 *
 * `siteId` (present on the entity via `BaseSiteScopedEntity`) is
 * deliberately not modeled here, same call every other module's
 * `types.ts` makes.
 *
 * CTA is a **singleton per site** (`@Unique(['siteId'])` on the
 * entity, `CtaService.onModuleInit` auto-seeds the one row) — same
 * shape as `features/cms/about/types.ts`, not a list like
 * Campuses/Teachers/News. There is no create/delete endpoint and no
 * `position`/reorder: `CtaController` exposes exactly `GET`, `PATCH`,
 * and `PATCH /status`, none of which take an `:id`.
 *
 * Unlike About, CTA carries no `seo` (it's not its own indexable
 * page — it's a component embedded on other pages, same reasoning
 * HeroSlide carries no SEO of its own) and is not one of the backend's
 * revision-enabled types (see `CtaBanner` entity's doc comment) — so
 * this module has no revisions history/restore panel.
 */

import type { CmsEntityMeta, CmsPublishStatus, Translatable } from "../types";

/** Mirrors `PublishStatus` (backend) as used on the `CtaBanner` entity. */
export type CmsCtaStatus = CmsPublishStatus;

/**
 * The singleton CTA banner row. Extends `CmsEntityMeta` for
 * `id`/`createdAt`/`updatedAt` rather than redeclaring them, per the
 * convention `features/cms/README.md` documents — there is always
 * exactly one of these (`CtaService` auto-seeds it), never a list.
 */
export interface CmsCta extends CmsEntityMeta {
  title: Translatable<string>;
  description?: Translatable<string>;
  primaryButtonLabel: Translatable<string>;
  primaryButtonUrl: string;
  secondaryButtonLabel?: Translatable<string>;
  secondaryButtonUrl?: string;
  /** Reference into core/media, tracked via MediaUsage — never an embedded copy. */
  backgroundImageMediaId?: string;
  status: CmsCtaStatus;
}

/**
 * Body for `PATCH /admin/cta`. Mirrors `UpdateCtaDto` — `description`,
 * `secondaryButtonLabel`, `secondaryButtonUrl`, and
 * `backgroundImageMediaId` all accept an explicit `null` to clear the
 * field (that DTO's own comments: "Explicit null clears ... ;
 * undefined leaves it unchanged"), same clearable convention as
 * About's `imageMediaId`.
 */
export interface UpdateCtaPayload {
  title?: Translatable<string>;
  description?: Translatable<string> | null;
  primaryButtonLabel?: Translatable<string>;
  primaryButtonUrl?: string;
  secondaryButtonLabel?: Translatable<string> | null;
  secondaryButtonUrl?: string | null;
  backgroundImageMediaId?: string | null;
}
