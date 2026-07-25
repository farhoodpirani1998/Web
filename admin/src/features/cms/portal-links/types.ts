/**
 * Types for the CMS Portal Links module, mirroring the backend
 * `PortalLink` entity and its DTOs
 * (`backend/src/modules/website/content/site-settings/entities/portal-link.entity.ts`,
 * `.../site-settings/dto/*-portal-link.dto.ts`). Same "mirror, don't
 * import" reasoning as `features/cms/faq/types.ts` — the admin
 * frontend and the NestJS backend are separate packages with no shared
 * runtime code path.
 *
 * `siteId` (present on the entity via `BaseSiteScopedEntity`) is
 * deliberately not modeled here, same call every other module's types
 * file makes — nothing in this admin frontend acts on it today.
 *
 * No `CmsPortalLinkStatus`: unlike `CmsFaq`, a portal link has no
 * draft/published/archived lifecycle — `visible` is a plain toggle
 * (mirrors `PortalLink.visible`'s own doc comment on why there's no
 * `PublishStatus` here).
 */

import type { CmsEntityMeta, Translatable } from "../types";

/**
 * A single external link (parent portal, LMS, staff webmail, etc.).
 * Extends `CmsEntityMeta` for `id`/`createdAt`/`updatedAt` rather than
 * redeclaring them, per the convention `features/cms/README.md`
 * documents.
 */
export interface CmsPortalLink extends CmsEntityMeta {
  label: Translatable<string>;
  url: string;
  icon?: string;
  position: number;
  visible: boolean;
}

/** Body for `POST /admin/portal-links`. Mirrors `CreatePortalLinkDto`. */
export interface CreatePortalLinkPayload {
  label: Translatable<string>;
  url: string;
  icon?: string;
  visible?: boolean;
}

/** Body for `PATCH /admin/portal-links/:id`. Mirrors `UpdatePortalLinkDto`. */
export interface UpdatePortalLinkPayload {
  label?: Translatable<string>;
  url?: string;
  icon?: string;
  visible?: boolean;
}
