import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { Translatable } from '../../../core/i18n/locale.enum';

/**
 * A single link out to an external system (parent portal, LMS, staff
 * webmail, etc.), rendered e.g. in the site header/footer. Modeled on
 * Feature: a flat, table-wide ordered list scoped only to `siteId` —
 * unlike MenuItem there is no tree (no `parentId`) and no `linkType`
 * enum, since a portal link is always an external URL, never an
 * internal StaticPage reference.
 *
 * Lives alongside SiteSettings (same module) but is its own entity
 * rather than a column on that singleton row, because it's
 * independently created/reordered/removed — same reasoning Feature/
 * Testimonial/MenuItem already establish for list-shaped content.
 */
@Entity('portal_links')
export class PortalLink extends BaseSiteScopedEntity {
  @Column({ type: 'jsonb' })
  label!: Translatable<string>;

  // Always an external absolute URL. Plain string, not @IsUrl at the
  // DTO layer — same reasoning as MenuItem.url (a portal login URL
  // could reasonably be non-http, e.g. an app deep link).
  @Column()
  url!: string;

  // Icon-library key resolved client-side — same convention as
  // Feature.icon, not a Media reference.
  @Column({ nullable: true })
  icon?: string;

  @Index()
  @Column({ type: 'int', default: 0 })
  position!: number;

  // Whether this entry renders live. A plain toggle rather than the
  // draft/published/archived PublishStatus lifecycle — portal links
  // have no review workflow, same reasoning as MenuItem.visible.
  @Column({ default: true })
  visible!: boolean;
}
