import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';

/**
 * A named navigation slot (e.g. "header", "footer") that the frontend
 * requests by `key`. The Menu row itself carries no display content —
 * it's a container; the actual clickable entries are MenuItem rows
 * scoped to it. Structural/list content, like FAQ/Testimonials/
 * Features — not one of the 4 revision-enabled types, and `name` is a
 * plain admin-facing label (not shown to site visitors), so it's a
 * plain string rather than Translatable, same reasoning as Feature's
 * `icon` or Faq's `category` being plain fields.
 */
@Entity('menus')
@Index(['siteId', 'key'], { unique: true })
export class Menu extends BaseSiteScopedEntity {
  // Stable programmatic handle the frontend requests a specific menu
  // by (e.g. "header", "footer") — same idiom as Site.key. Editor-
  // supplied, validated for per-site uniqueness in MenusService; the
  // index above is the DB-level backstop.
  @Column()
  key!: string;

  // Admin-facing label only (e.g. "Header Navigation") — never
  // rendered on the public site, so plain string, not Translatable.
  @Column()
  name!: string;
}
